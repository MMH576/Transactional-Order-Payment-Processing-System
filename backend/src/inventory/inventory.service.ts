import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { ActionType, EntityType } from '@prisma/client';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findByProductId(productId: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!inventory) {
      throw new NotFoundException(`Inventory for product ${productId} not found`);
    }

    return inventory;
  }

  async update(productId: string, dto: UpdateInventoryDto, actorId: string) {
    const beforeState = await this.findByProductId(productId);

    let newAvailableQuantity: number;

    if (dto.availableQuantity !== undefined) {
      // Absolute set
      newAvailableQuantity = dto.availableQuantity;
    } else if (dto.adjustQuantity !== undefined) {
      // Relative adjustment
      newAvailableQuantity = beforeState.availableQuantity + dto.adjustQuantity;
    } else {
      throw new BadRequestException('Must provide availableQuantity or adjustQuantity');
    }

    // Validate non-negative
    if (newAvailableQuantity < 0) {
      throw new BadRequestException('Available quantity cannot be negative');
    }

    const inventory = await this.prisma.inventory.update({
      where: { productId },
      data: {
        availableQuantity: newAvailableQuantity,
      },
      include: {
        product: {
          select: {
            name: true,
          },
        },
      },
    });

    await this.auditService.log({
      actorId,
      actionType: ActionType.INVENTORY_UPDATED,
      entityType: EntityType.INVENTORY,
      entityId: productId,
      beforeState: {
        availableQuantity: beforeState.availableQuantity,
        reservedQuantity: beforeState.reservedQuantity,
      },
      afterState: {
        availableQuantity: inventory.availableQuantity,
        reservedQuantity: inventory.reservedQuantity,
      },
    });

    return inventory;
  }

  async getAll() {
    return this.prisma.inventory.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
      },
    });
  }
}
