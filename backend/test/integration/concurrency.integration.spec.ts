import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Concurrency Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@example.com', password: 'customer123' });

    authToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * THIS TEST PROVES YOUR SYSTEM HANDLES RACE CONDITIONS
   *
   * Scenario:
   * - Product has 5 units in stock
   * - 10 concurrent requests each try to buy 1 unit
   * - Only 5 should succeed, 5 should fail
   * - Final inventory should be 0, not negative
   */
  it('should prevent overselling under concurrent load', async () => {
    // Create a test product with limited stock
    const product = await prisma.product.create({
      data: {
        name: `Concurrency Test Product ${Date.now()}`,
        price: 10.0,
        inventory: {
          create: {
            availableQuantity: 5,
            reservedQuantity: 0,
          },
        },
      },
    });

    const productId = product.id;

    // Fire 10 concurrent checkout requests
    const concurrentRequests = Array(10)
      .fill(null)
      .map(() =>
        request(app.getHttpServer())
          .post('/orders/checkout')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            items: [{ productId, quantity: 1 }],
          }),
      );

    const results = await Promise.all(concurrentRequests);

    // Count successes and failures
    const successes = results.filter((r) => r.status === 201);
    const failures = results.filter((r) => r.status === 400);

    console.log(`Concurrency Test Results:`);
    console.log(`  Successes: ${successes.length}`);
    console.log(`  Failures: ${failures.length}`);

    // CRITICAL ASSERTIONS
    expect(successes.length).toBe(5); // Only 5 should succeed
    expect(failures.length).toBe(5); // 5 should fail with insufficient stock

    // Verify final inventory state
    const finalInventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    console.log(`  Final available: ${finalInventory!.availableQuantity}`);
    console.log(`  Final reserved: ${finalInventory!.reservedQuantity}`);

    expect(finalInventory!.availableQuantity).toBe(0);
    expect(finalInventory!.reservedQuantity).toBe(5);
    expect(finalInventory!.availableQuantity).toBeGreaterThanOrEqual(0); // NEVER negative

    // Cleanup - delete orders for this product, then inventory, then product
    const ordersToDelete = await prisma.order.findMany({
      where: {
        orderItems: {
          some: { productId },
        },
      },
      select: { id: true },
    });

    for (const order of ordersToDelete) {
      await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
      await prisma.order.delete({ where: { id: order.id } });
    }

    await prisma.inventory.delete({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
  }, 30000); // 30 second timeout for this test

  /**
   * Test that multiple users can checkout different products simultaneously
   */
  it('should allow concurrent checkouts of different products', async () => {
    // Create two test products
    const product1 = await prisma.product.create({
      data: {
        name: `Concurrent Product 1 ${Date.now()}`,
        price: 20.0,
        inventory: {
          create: {
            availableQuantity: 10,
            reservedQuantity: 0,
          },
        },
      },
    });

    const product2 = await prisma.product.create({
      data: {
        name: `Concurrent Product 2 ${Date.now()}`,
        price: 30.0,
        inventory: {
          create: {
            availableQuantity: 10,
            reservedQuantity: 0,
          },
        },
      },
    });

    // Fire concurrent requests for different products
    const requests = [
      ...Array(5)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .post('/orders/checkout')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ items: [{ productId: product1.id, quantity: 1 }] }),
        ),
      ...Array(5)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .post('/orders/checkout')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ items: [{ productId: product2.id, quantity: 1 }] }),
        ),
    ];

    const results = await Promise.all(requests);
    const successes = results.filter((r) => r.status === 201);

    // All 10 should succeed since they're for different products
    expect(successes.length).toBe(10);

    // Verify inventory
    const inv1 = await prisma.inventory.findUnique({
      where: { productId: product1.id },
    });
    const inv2 = await prisma.inventory.findUnique({
      where: { productId: product2.id },
    });

    expect(inv1!.availableQuantity).toBe(5);
    expect(inv1!.reservedQuantity).toBe(5);
    expect(inv2!.availableQuantity).toBe(5);
    expect(inv2!.reservedQuantity).toBe(5);

    // Cleanup
    for (const productId of [product1.id, product2.id]) {
      const ordersToDelete = await prisma.order.findMany({
        where: { orderItems: { some: { productId } } },
        select: { id: true },
      });
      for (const order of ordersToDelete) {
        await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
        await prisma.order.delete({ where: { id: order.id } });
      }
      await prisma.inventory.delete({ where: { productId } });
      await prisma.product.delete({ where: { id: productId } });
    }
  }, 30000);
});
