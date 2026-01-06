import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';

describe('Checkout Integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testProductId: string;

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

    // Create test user and get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@example.com', password: 'customer123' });

    authToken = loginRes.body.accessToken;

    // Get a test product with available stock
    const products = await prisma.product.findMany({
      where: {
        inventory: {
          availableQuantity: { gt: 0 },
        },
      },
      take: 1,
    });

    if (products.length > 0) {
      testProductId = products[0].id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders/checkout', () => {
    it('should create order and reserve inventory', async () => {
      // Skip if no test product
      if (!testProductId) {
        console.log('Skipping test - no product with available stock');
        return;
      }

      // Get initial inventory
      const initialInventory = await prisma.inventory.findUnique({
        where: { productId: testProductId },
      });

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: testProductId, quantity: 1 }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('orderId');
      expect(response.body).toHaveProperty('clientSecret');
      expect(response.body).toHaveProperty('totalAmount');

      // Verify inventory was reserved
      const updatedInventory = await prisma.inventory.findUnique({
        where: { productId: testProductId },
      });

      expect(updatedInventory!.availableQuantity).toBe(
        initialInventory!.availableQuantity - 1,
      );
      expect(updatedInventory!.reservedQuantity).toBe(
        initialInventory!.reservedQuantity + 1,
      );

      // Cleanup: Release the reservation by restoring inventory
      await prisma.inventory.update({
        where: { productId: testProductId },
        data: {
          availableQuantity: initialInventory!.availableQuantity,
          reservedQuantity: initialInventory!.reservedQuantity,
        },
      });
    });

    it('should reject checkout with insufficient stock', async () => {
      if (!testProductId) {
        console.log('Skipping test - no product available');
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: testProductId, quantity: 999999 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Insufficient stock');
    });

    it('should reject checkout without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .send({
          items: [{ productId: testProductId, quantity: 1 }],
        });

      expect(response.status).toBe(401);
    });

    it('should reject checkout with invalid product ID', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            { productId: '00000000-0000-0000-0000-000000000000', quantity: 1 },
          ],
        });

      expect(response.status).toBe(404);
    });

    it('should reject checkout with zero quantity', async () => {
      if (!testProductId) {
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: testProductId, quantity: 0 }],
        });

      expect(response.status).toBe(400);
    });

    it('should reject checkout with negative quantity', async () => {
      if (!testProductId) {
        return;
      }

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: testProductId, quantity: -1 }],
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /orders/my-orders', () => {
    it('should return user orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/my-orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/orders/my-orders');

      expect(response.status).toBe(401);
    });
  });
});
