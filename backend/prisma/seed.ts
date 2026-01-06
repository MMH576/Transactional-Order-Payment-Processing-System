import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create test customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      passwordHash: customerPassword,
      role: Role.CUSTOMER,
    },
  });
  console.log(`Customer user created: ${customer.email}`);

  // Create products with inventory
  const products = [
    { name: 'Mechanical Keyboard', price: 149.99, stock: 50 },
    { name: 'Wireless Mouse', price: 79.99, stock: 100 },
    { name: 'USB-C Hub', price: 59.99, stock: 75 },
    { name: '4K Monitor', price: 399.99, stock: 25 },
    { name: 'Webcam HD', price: 89.99, stock: 60 },
  ];

  for (const p of products) {
    const productId = p.name.toLowerCase().replace(/\s+/g, '-');
    const product = await prisma.product.upsert({
      where: { id: productId },
      update: {},
      create: {
        id: productId,
        name: p.name,
        price: p.price,
        metadata: { description: `High-quality ${p.name.toLowerCase()}` },
        inventory: {
          create: {
            availableQuantity: p.stock,
            reservedQuantity: 0,
          },
        },
      },
    });
    console.log(`Product created: ${product.name} (stock: ${p.stock})`);
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
