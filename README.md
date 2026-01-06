# Transactional Order & Payment Processing System

A full-stack e-commerce backend demonstrating **ACID transactions**, **inventory management**, and **Stripe payment integration** built with NestJS, Prisma, and PostgreSQL.

## Features

- **Transactional Checkout** - Atomic order creation with inventory reservation using `SELECT FOR UPDATE` and Serializable isolation
- **Order State Machine** - Enforced state transitions (CREATED → PAYMENT_PENDING → PAID → FULFILLED)
- **Stripe Integration** - Payment intents and webhook handling for real payment processing
- **Role-Based Access** - JWT authentication with Admin/Customer roles
- **Audit Logging** - Complete audit trail for all order state changes
- **Inventory Management** - Real-time stock tracking with reservation system

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS, TypeScript, Prisma ORM |
| Database | PostgreSQL |
| Frontend | Next.js 14, TailwindCSS |
| Payments | Stripe |
| Auth | JWT, bcrypt |

## Quick Start

### Prerequisites

- Node.js 18+
- Docker
- Stripe account (for payment testing)

### 1. Clone and Install

```bash
git clone https://github.com/MMH576/Transactional-Order-Payment-Processing-System.git
cd Transactional-Order-Payment-Processing-System

# Install dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Environment Setup

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/orderdb?schema=public"
JWT_SECRET="your-secret-key-min-32-characters-long"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
PORT=3001
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Start Database

```bash
docker-compose up -d
```

### 4. Run Migrations & Seed

```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 5. Start the App

```bash
# Terminal 1 - Backend
cd backend && npm run start:dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Visit **http://localhost:3000**

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@example.com | customer123 |
| Admin | admin@example.com | admin123 |

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── orders/          # Transactional checkout logic
│   │   ├── payments/        # Stripe integration & webhooks
│   │   ├── inventory/       # Stock management
│   │   ├── auth/            # JWT authentication
│   │   ├── audit/           # Audit logging
│   │   └── prisma/          # Database service
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── test/                # Integration & unit tests
│
├── frontend/
│   └── src/
│       ├── app/             # Next.js pages
│       ├── components/      # React components
│       ├── context/         # Auth & Cart state
│       └── lib/             # API client
│
└── docker-compose.yml       # PostgreSQL setup
```

## Key Implementation Details

### Transactional Checkout

The checkout process uses Prisma's interactive transactions with Serializable isolation:

```typescript
await this.prisma.$transaction(async (tx) => {
  // 1. Lock inventory rows
  const inventory = await tx.$queryRaw`
    SELECT * FROM inventory
    WHERE product_id IN (${productIds})
    FOR UPDATE
  `;

  // 2. Validate stock availability
  // 3. Create order and items
  // 4. Reserve inventory (decrement available, increment reserved)

}, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
```

### Order State Machine

Orders follow strict state transitions:

```
CREATED → PAYMENT_PENDING → PAID → FULFILLED
                ↓
            CANCELLED
```

Invalid transitions are rejected with an error.

### Stripe Webhooks

Payment confirmation happens via webhooks:

```
POST /webhooks/stripe
├── payment_intent.succeeded → Mark order as PAID
└── payment_intent.payment_failed → Release inventory
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/login | Login | Public |
| POST | /auth/register | Register | Public |
| GET | /products | List products | Public |
| POST | /orders/checkout | Create order | User |
| GET | /orders/my-orders | User's orders | User |
| GET | /orders/:id | Order details | User |
| POST | /webhooks/stripe | Stripe webhook | Public |
| GET | /inventory | List inventory | Admin |
| PATCH | /inventory/:id | Update stock | Admin |
| GET | /audit | Audit logs | Admin |

## Testing

```bash
cd backend

# Unit tests
npm run test

# Integration tests (requires database)
npm run test:e2e
```

## Testing Stripe Payments

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3001/webhooks/stripe
   ```
3. Use test card: `4242 4242 4242 4242`

## License

MIT
