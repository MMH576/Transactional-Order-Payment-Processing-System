# Transactional Order & Payment Processing System

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://order-payment-frontend.onrender.com)
[![Backend API](https://img.shields.io/badge/api-live-blue)](https://order-payment-backend.onrender.com/products)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Integrated-blueviolet)](https://stripe.com/)

A production-grade full-stack e-commerce system demonstrating **ACID transactions**, **inventory management**, and **Stripe payment integration**. Built with NestJS, Prisma, PostgreSQL, and Next.js.

![Order Payment System Demo](https://raw.githubusercontent.com/MMH576/Transactional-Order-Payment-Processing-System/main/docs/demo.png)

## Live Demo

- **Frontend**: [https://order-payment-frontend.onrender.com](https://order-payment-frontend.onrender.com)
- **Backend API**: [https://order-payment-backend.onrender.com/products](https://order-payment-backend.onrender.com/products)

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@example.com | customer123 |
| Admin | admin@example.com | admin123 |

### Test Card (Stripe)

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

---

## Features

### Core Functionality
- **Transactional Checkout** - Atomic order creation with inventory reservation using `SELECT FOR UPDATE` and Serializable isolation level
- **Order State Machine** - Enforced state transitions (CREATED → PAYMENT_PENDING → PAID → FULFILLED)
- **Stripe Integration** - Payment intents, card processing, and webhook handling
- **Real-time Inventory** - Stock tracking with reservation system to prevent overselling
- **Audit Logging** - Complete audit trail for all order state changes

### Security & Auth
- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Admin and Customer roles with protected routes
- **Password Hashing** - bcrypt for secure password storage

### Developer Experience
- **Type Safety** - Full TypeScript across frontend and backend
- **Database Migrations** - Prisma migrations for schema versioning
- **Docker Support** - One-command local development setup
- **Comprehensive Testing** - Unit and integration tests

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | NestJS 10, TypeScript | REST API, business logic |
| **ORM** | Prisma 5 | Type-safe database access |
| **Database** | PostgreSQL 15 | ACID-compliant data storage |
| **Frontend** | Next.js 14, React 18 | Server-side rendering, UI |
| **Styling** | TailwindCSS 3 | Utility-first CSS |
| **Payments** | Stripe | Payment processing |
| **Auth** | JWT, Passport | Authentication |
| **Containerization** | Docker | Development environment |

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│    Backend      │────▶│   PostgreSQL    │
│   (Next.js)     │     │   (NestJS)      │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │     Stripe      │
                        │   (Payments)    │
                        │                 │
                        └─────────────────┘
```

### Order Flow

```
1. Customer adds items to cart
2. Customer initiates checkout
   └─▶ Backend creates order in CREATED state
   └─▶ Inventory reserved atomically (SELECT FOR UPDATE)
   └─▶ Stripe PaymentIntent created
   └─▶ Order moves to PAYMENT_PENDING

3. Customer completes payment on frontend
   └─▶ Stripe processes payment
   └─▶ Webhook: payment_intent.succeeded
   └─▶ Order moves to PAID
   └─▶ Reserved inventory committed

4. Admin fulfills order
   └─▶ Order moves to FULFILLED
```

---

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── auth/              # JWT authentication & registration
│   │   ├── orders/            # Transactional checkout logic
│   │   │   ├── orders.service.ts      # Core business logic
│   │   │   └── order-state-machine.ts # State transition rules
│   │   ├── payments/          # Stripe integration
│   │   │   ├── payments.service.ts    # Payment intent creation
│   │   │   └── stripe-webhook.controller.ts
│   │   ├── inventory/         # Stock management
│   │   ├── products/          # Product catalog
│   │   ├── audit/             # Audit logging
│   │   ├── users/             # User management
│   │   └── prisma/            # Database service
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   ├── migrations/        # Schema migrations
│   │   └── seed.ts            # Test data seeding
│   └── test/                  # Integration & unit tests
│
├── frontend/
│   └── src/
│       ├── app/               # Next.js 14 App Router pages
│       │   ├── page.tsx       # Home / Product catalog
│       │   ├── checkout/      # Checkout flow
│       │   ├── orders/        # Order history & details
│       │   └── admin/         # Admin dashboard
│       ├── components/        # Reusable React components
│       ├── context/           # Auth & Cart state management
│       └── lib/               # API client & utilities
│
├── docker-compose.yml         # Local PostgreSQL setup
└── render.yaml                # Render deployment config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Stripe account ([sign up free](https://dashboard.stripe.com/register))

### 1. Clone the Repository

```bash
git clone https://github.com/MMH576/Transactional-Order-Payment-Processing-System.git
cd Transactional-Order-Payment-Processing-System
```

### 2. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Environment Setup

**Backend** - Create `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/orderdb?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_EXPIRATION="7d"

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

**Frontend** - Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Start the Database

```bash
docker-compose up -d
```

### 5. Run Migrations & Seed

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 6. Start the Application

```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Visit **http://localhost:3000**

---

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login & get JWT | Public |
| GET | `/auth/me` | Get current user | Required |

### Products

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/products` | List all products | Public |
| GET | `/products/:id` | Get product details | Public |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |

### Orders

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/orders/checkout` | Create order & payment | Required |
| GET | `/orders/my-orders` | Get user's orders | Required |
| GET | `/orders/:id` | Get order details | Required |
| GET | `/orders` | List all orders | Admin |
| POST | `/orders/:id/fulfill` | Mark as fulfilled | Admin |

### Inventory

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/inventory` | List all inventory | Admin |
| GET | `/inventory/:productId` | Get stock level | Admin |
| PATCH | `/inventory/:productId` | Update stock | Admin |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/webhooks/stripe` | Stripe payment events |

---

## Key Implementation Details

### Transactional Checkout

The checkout process uses Prisma's interactive transactions with row-level locking:

```typescript
await this.prisma.$transaction(async (tx) => {
  // 1. Lock inventory rows to prevent race conditions
  const inventory = await tx.$queryRaw`
    SELECT * FROM inventory
    WHERE product_id = ANY(${productIds}::text[])
    FOR UPDATE
  `;

  // 2. Validate stock availability
  for (const item of items) {
    if (inventory.availableQuantity < item.quantity) {
      throw new Error('Insufficient stock');
    }
  }

  // 3. Create order and order items
  const order = await tx.order.create({ ... });

  // 4. Reserve inventory atomically
  await tx.inventory.update({
    data: {
      availableQuantity: { decrement: quantity },
      reservedQuantity: { increment: quantity }
    }
  });

}, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
```

### Order State Machine

Orders follow strict state transitions enforced by the state machine:

```
     ┌──────────┐
     │ CREATED  │
     └────┬─────┘
          │
          ▼
┌─────────────────────┐
│  PAYMENT_PENDING    │──────┐
└─────────┬───────────┘      │
          │                  │
          ▼                  ▼
     ┌─────────┐       ┌───────────┐
     │  PAID   │       │ CANCELLED │
     └────┬────┘       └───────────┘
          │
          ▼
    ┌───────────┐
    │ FULFILLED │
    └───────────┘
```

Invalid transitions (e.g., PAID → CREATED) are rejected with an error.

### Stripe Webhook Handling

Payment confirmation happens asynchronously via webhooks:

```typescript
@Post('stripe')
async handleWebhook(@Req() req: RawBodyRequest<Request>) {
  const sig = req.headers['stripe-signature'];
  const event = this.stripe.webhooks.constructEvent(
    req.rawBody, sig, this.webhookSecret
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      await this.ordersService.markAsPaid(paymentIntentId);
      break;
    case 'payment_intent.payment_failed':
      await this.ordersService.releaseInventory(paymentIntentId);
      break;
  }
}
```

---

## Testing

```bash
cd backend

# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests (requires database)
npm run test:integration

# Test coverage
npm run test:cov
```

### Testing Stripe Locally

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Forward webhooks to local server:
   ```bash
   stripe listen --forward-to localhost:3001/webhooks/stripe
   ```
3. Copy the webhook signing secret to your `.env`
4. Use test card `4242 4242 4242 4242`

---

## Deployment

This project is configured for deployment on [Render](https://render.com).

### Quick Deploy

1. Fork this repository
2. Create a PostgreSQL database on Render
3. Create two Web Services:
   - **Backend**: Docker, root directory `backend`
   - **Frontend**: Docker, root directory `frontend`
4. Set environment variables as described above
5. Deploy!

See [render.yaml](./render.yaml) for the full configuration.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [NestJS](https://nestjs.com/) - A progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Stripe](https://stripe.com/) - Payment infrastructure
- [Next.js](https://nextjs.org/) - The React Framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
