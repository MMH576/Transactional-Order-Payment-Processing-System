import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { AuditService } from '../audit/audit.service';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderStateMachine } from './order-state-machine';
import { OrderStatus, ActionType, EntityType, Prisma } from '@prisma/client';

export interface CheckoutResult {
  orderId: string;
  clientSecret: string;
  totalAmount: number;
}

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private paymentsService: PaymentsService,
    private auditService: AuditService,
  ) {}

  /**
   * ATOMIC CHECKOUT - The core transaction
   *
   * This method executes ALL of the following in a SINGLE database transaction:
   * 1. Lock inventory rows (SELECT ... FOR UPDATE)
   * 2. Validate sufficient stock
   * 3. Create order record
   * 4. Create order items
   * 5. Reserve inventory (decrement available, increment reserved)
   *
   * If ANY step fails, the ENTIRE transaction is rolled back.
   * No partial writes. No race conditions.
   */
  async checkout(userId: string, dto: CheckoutDto): Promise<CheckoutResult> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Extract product IDs for locking
    const productIds = dto.items.map((item) => item.productId);

    // Execute everything in a transaction
    const result = await this.prisma.$transaction(
      async (tx) => {
        // ================================================
        // STEP 1: Lock inventory rows FOR UPDATE
        // ================================================
        // This prevents other transactions from modifying these rows
        // until this transaction completes.
        //
        // CRITICAL: We use raw SQL because Prisma doesn't support
        // SELECT ... FOR UPDATE natively.
        // ================================================
        const inventoryRows = await tx.$queryRaw<
          Array<{
            product_id: string;
            available_quantity: number;
            reserved_quantity: number;
          }>
        >`
        SELECT product_id, available_quantity, reserved_quantity
        FROM inventory
        WHERE product_id IN (${Prisma.join(productIds)})
        FOR UPDATE
      `;

        // Create a map for quick lookup
        const inventoryMap = new Map(
          inventoryRows.map((row) => [row.product_id, row]),
        );

        // ================================================
        // STEP 2: Validate stock for each item
        // ================================================
        const productPrices = new Map<string, number>();
        let totalAmount = 0;

        for (const item of dto.items) {
          const inventory = inventoryMap.get(item.productId);

          if (!inventory) {
            throw new BadRequestException(
              `Product ${item.productId} not found or has no inventory`,
            );
          }

          if (inventory.available_quantity < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for product ${item.productId}. ` +
                `Available: ${inventory.available_quantity}, Requested: ${item.quantity}`,
            );
          }

          // Fetch product price
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { price: true },
          });

          if (!product) {
            throw new BadRequestException(
              `Product ${item.productId} not found`,
            );
          }

          const price = Number(product.price);
          productPrices.set(item.productId, price);
          totalAmount += price * item.quantity;
        }

        // ================================================
        // STEP 3: Create order
        // ================================================
        const order = await tx.order.create({
          data: {
            userId,
            status: OrderStatus.CREATED,
            totalAmount,
          },
        });

        // ================================================
        // STEP 4: Create order items
        // ================================================
        const orderItems = dto.items.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceSnapshot: productPrices.get(item.productId)!,
        }));

        await tx.orderItem.createMany({
          data: orderItems,
        });

        // ================================================
        // STEP 5: Reserve inventory
        // ================================================
        // Decrement available, increment reserved
        for (const item of dto.items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: {
              availableQuantity: {
                decrement: item.quantity,
              },
              reservedQuantity: {
                increment: item.quantity,
              },
            },
          });
        }

        return { order, totalAmount };
      },
      {
        // Transaction options
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000,
        timeout: 10000,
      },
    );

    // ================================================
    // STEP 6: Create Stripe PaymentIntent (outside transaction)
    // ================================================
    // We do this AFTER the transaction commits because:
    // 1. We don't want to roll back Stripe if our DB fails
    // 2. We don't want to hold the DB transaction while calling Stripe
    const paymentIntent = await this.paymentsService.createPaymentIntent(
      result.totalAmount,
      result.order.id,
    );

    // Update order with payment intent ID
    await this.prisma.order.update({
      where: { id: result.order.id },
      data: {
        paymentIntentId: paymentIntent.id,
        status: OrderStatus.PAYMENT_PENDING,
      },
    });

    // Log the order creation
    await this.auditService.log({
      actorId: userId,
      actionType: ActionType.ORDER_CREATED,
      entityType: EntityType.ORDER,
      entityId: result.order.id,
      afterState: {
        orderId: result.order.id,
        totalAmount: result.totalAmount,
        itemCount: dto.items.length,
      },
    });

    return {
      orderId: result.order.id,
      clientSecret: paymentIntent.client_secret!,
      totalAmount: result.totalAmount,
    };
  }

  /**
   * Updates order status with state machine validation
   */
  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    actorId?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }

    // Validate transition
    OrderStateMachine.validateTransition(order.status, newStatus);

    const beforeState = { status: order.status };

    // Update status
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // Log the status change
    await this.auditService.log({
      actorId,
      actionType: ActionType.ORDER_STATUS_CHANGED,
      entityType: EntityType.ORDER,
      entityId: orderId,
      beforeState,
      afterState: { status: newStatus },
    });

    return updatedOrder;
  }

  /**
   * Handles payment success - finalizes the order
   */
  async handlePaymentSuccess(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      // Get order with items
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order) {
        throw new NotFoundException(`Order ${orderId} not found`);
      }

      // Validate state transition
      OrderStateMachine.validateTransition(order.status, OrderStatus.PAID);

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.PAID },
      });

      // Finalize inventory - convert reserved to sold
      for (const item of order.orderItems) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            reservedQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Log the status change
      await this.auditService.log({
        actionType: ActionType.ORDER_STATUS_CHANGED,
        entityType: EntityType.ORDER,
        entityId: orderId,
        beforeState: { status: order.status },
        afterState: { status: OrderStatus.PAID },
      });

      return order;
    });
  }

  /**
   * Handles payment failure - releases reserved inventory
   */
  async handlePaymentFailure(orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });

      if (!order) {
        throw new NotFoundException(`Order ${orderId} not found`);
      }

      // Only process if in PAYMENT_PENDING state
      if (order.status !== OrderStatus.PAYMENT_PENDING) {
        return order;
      }

      // Update order status
      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.FAILED },
      });

      // Release reserved inventory back to available
      for (const item of order.orderItems) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: {
            availableQuantity: {
              increment: item.quantity,
            },
            reservedQuantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      await this.auditService.log({
        actionType: ActionType.ORDER_STATUS_CHANGED,
        entityType: EntityType.ORDER,
        entityId: orderId,
        beforeState: { status: order.status },
        afterState: { status: OrderStatus.FAILED },
      });

      return order;
    });
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return order;
  }

  async findByUserId(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: { email: true },
        },
        orderItems: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPaymentIntentId(paymentIntentId: string) {
    return this.prisma.order.findUnique({
      where: { paymentIntentId },
      include: { orderItems: true },
    });
  }
}
