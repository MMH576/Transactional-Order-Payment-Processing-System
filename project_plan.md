# Transactional Order & Payment Processing System
## Complete Implementation Guide

> **Goal**: Build a production-grade backend system that demonstrates ACID transactions, concurrency control, secure payment processing, and enterprise patterns. This guide covers everything needed to achieve a 10/10 co-op portfolio project.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Design Decisions](#2-architecture--design-decisions)
3. [Technology Stack Deep Dive](#3-technology-stack-deep-dive)
4. [Database Schema & Relationships](#4-database-schema--relationships)
5. [Phase 1: Project Setup & Foundation](#5-phase-1-project-setup--foundation)
6. [Phase 2: Database & Core Models](#6-phase-2-database--core-models)
7. [Phase 3: Authentication & Authorization](#7-phase-3-authentication--authorization)
8. [Phase 4: Product & Inventory Management](#8-phase-4-product--inventory-management)
9. [Phase 5: Transactional Checkout System](#9-phase-5-transactional-checkout-system)
10. [Phase 6: Stripe Payment Integration](#10-phase-6-stripe-payment-integration)
11. [Phase 7: Audit Logging System](#11-phase-7-audit-logging-system)
12. [Phase 8: Minimal Frontend](#12-phase-8-minimal-frontend)
13. [Phase 9: Testing Strategy](#13-phase-9-testing-strategy)
14. [Phase 10: DevOps & Deployment](#14-phase-10-devops--deployment)
15. [Phase 11: Documentation & Polish](#15-phase-11-documentation--polish)
16. [Interview Preparation](#16-interview-preparation)
17. [Common Pitfalls & Solutions](#17-common-pitfalls--solutions)
18. [Resources & References](#18-resources--references)

---

## 1. Project Overview

### 1.1 What This Project Demonstrates

| Skill | How It's Demonstrated |
|-------|----------------------|
| **ACID Transactions** | Atomic checkout with rollback on any failure |
| **Concurrency Control** | Row-level locking prevents overselling |
| **Finite State Machines** | Order status transitions with validation |
| **Secure Webhooks** | Stripe signature verification |
| **RBAC** | Role-based access control (Admin/Customer) |
| **Audit Logging** | Immutable logs with before/after state |
| **API Design** | RESTful endpoints with proper error handling |
| **Testing** | Unit, integration, and concurrency tests |
| **DevOps** | Docker, CI/CD, environment configuration |

### 1.2 What Makes This a 10/10 Project

A 10/10 project isn't just working code. It requires:

```
✅ Working demo you can show in 2 minutes
✅ Tests that PROVE your claims (especially concurrency)
✅ Clean architecture that's easy to explain
✅ One-command local setup (docker-compose up)
✅ Deployed and accessible online
✅ README with architecture diagrams
✅ No bugs in the happy path
✅ Graceful error handling
```

### 1.3 Time Estimate

| Phase | Time | Cumulative |
|-------|------|------------|
| Setup & Foundation | 4-6 hours | 6 hours |
| Database & Models | 4-6 hours | 12 hours |
| Auth & Authorization | 6-8 hours | 20 hours |
| Product & Inventory | 4-6 hours | 26 hours |
| Transactional Checkout | 8-12 hours | 38 hours |
| Stripe Integration | 6-8 hours | 46 hours |
| Audit Logging | 4-6 hours | 52 hours |
| Minimal Frontend | 8-12 hours | 64 hours |
| Testing | 10-15 hours | 79 hours |
| DevOps & Deployment | 6-8 hours | 87 hours |
| Documentation & Polish | 4-6 hours | 93 hours |

**Total: ~80-100 hours** (2-3 weeks of focused work)

---

## 2. Architecture & Design Decisions

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    (Next.js - Minimal UI)                        │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│   │ Products │  │   Cart   │  │ Checkout │  │  Admin   │        │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                      (NestJS API)                                │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │    Auth     │  │   Orders    │  │  Products   │              │
│  │   Module    │  │   Module    │  │   Module    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                │                │                      │
│         ▼                ▼                ▼                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Service Layer                         │    │
│  │  • Transaction Management                                │    │
│  │  • Business Logic                                        │    │
│  │  • State Machine Validation                              │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Repository Layer                       │    │
│  │  • Prisma ORM                                            │    │
│  │  • Row-Level Locking                                     │    │
│  │  • Audit Log Creation                                    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ PostgreSQL│   │  Stripe  │   │  Redis   │
        │    DB     │   │   API    │   │(optional)│
        └──────────┘   └──────────┘   └──────────┘
```

### 2.2 Key Design Decisions

#### Why NestJS over Express?

| Aspect | Express | NestJS |
|--------|---------|--------|
| Structure | None enforced | Modular by design |
| DI | Manual setup | Built-in |
| Testing | More setup | First-class support |
| TypeScript | Optional | Native |
| Enterprise patterns | DIY | Guards, Interceptors, Pipes |

**Decision**: NestJS provides structure that makes the codebase easier to explain in interviews and demonstrates familiarity with enterprise patterns.

#### Why Prisma over TypeORM?

| Aspect | TypeORM | Prisma |
|--------|---------|--------|
| Type Safety | Good | Excellent (generated types) |
| Migrations | Code-based | Schema-based |
| Raw Queries | Complex | Simple with `$queryRaw` |
| Transaction API | Callback-based | Cleaner interactive API |
| Learning Curve | Steeper | Gentler |

**Decision**: Prisma's type generation and cleaner transaction API make it easier to demonstrate and explain. TypeORM is also acceptable if you prefer it.

#### Why PostgreSQL?

- **Row-level locking**: `SELECT ... FOR UPDATE` is essential for inventory
- **ACID compliance**: Proper transaction support
- **Industry standard**: Most companies use it
- **JSON support**: Flexible metadata storage

#### Why Stripe?

- **Test mode**: No real money, safe to demo
- **Webhooks**: Demonstrates async event handling
- **Documentation**: Best-in-class, easy to implement
- **Industry standard**: Most startups use it

### 2.3 Request Flow Diagrams

#### Checkout Flow (The Core Feature)

```
Client                    API                     Database                 Stripe
  │                        │                         │                       │
  │  POST /orders/checkout │                         │                       │
  │───────────────────────>│                         │                       │
  │                        │                         │                       │
  │                        │  BEGIN TRANSACTION      │                       │
  │                        │────────────────────────>│                       │
  │                        │                         │                       │
  │                        │  SELECT ... FOR UPDATE  │                       │
  │                        │  (Lock inventory rows)  │                       │
  │                        │────────────────────────>│                       │
  │                        │                         │                       │
  │                        │  Check available qty    │                       │
  │                        │<────────────────────────│                       │
  │                        │                         │                       │
  │                        │  INSERT order           │                       │
  │                        │────────────────────────>│                       │
  │                        │                         │                       │
  │                        │  INSERT order_items     │                       │
  │                        │────────────────────────>│                       │
  │                        │                         │                       │
  │                        │  UPDATE inventory       │                       │
  │                        │  (Reserve stock)        │                       │
  │                        │────────────────────────>│                       │
  │                        │                         │                       │
  │                        │  COMMIT                 │                       │
  │                        │────────────────────────>│                       │
  │                        │                         │                       │
  │                        │  Create PaymentIntent   │                       │
  │                        │────────────────────────────────────────────────>│
  │                        │                         │                       │
  │                        │  Return client_secret   │                       │
  │                        │<────────────────────────────────────────────────│
  │                        │                         │                       │
  │  { orderId, clientSecret }                       │                       │
  │<───────────────────────│                         │                       │
  │                        │                         │                       │
  │  (Client completes payment with Stripe.js)       │                       │
  │                        │                         │                       │
```

#### Webhook Flow (Payment Confirmation)

```
Stripe                    API                     Database
  │                        │                         │
  │  POST /webhooks/stripe │                         │
  │  (payment_intent.succeeded)                      │
  │───────────────────────>│                         │
  │                        │                         │
  │                        │  Verify signature       │
  │                        │  (using webhook secret) │
  │                        │                         │
  │                        │  Find order by          │
  │                        │  payment_intent_id      │
  │                        │────────────────────────>│
  │                        │                         │
  │                        │  Validate state         │
  │                        │  transition allowed     │
  │                        │                         │
  │                        │  UPDATE order status    │
  │                        │  PAYMENT_PENDING → PAID │
  │                        │────────────────────────>│
  │                        │                         │
  │                        │  UPDATE inventory       │
  │                        │  (Deduct reserved)      │
  │                        │────────────────────────>│
  │                        │                         │
  │                        │  INSERT audit_log       │
  │                        │────────────────────────>│
  │                        │                         │
  │  200 OK                │                         │
  │<───────────────────────│                         │
```

### 2.4 Folder Structure

```
transactional-order-system/
├── backend/
│   ├── src/
│   │   ├── main.ts                      # Application entry point
│   │   ├── app.module.ts                # Root module
│   │   │
│   │   ├── common/                      # Shared utilities
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── audit-log.interceptor.ts
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       └── login.dto.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │       └── user.dto.ts
│   │   │
│   │   ├── products/
│   │   │   ├── products.module.ts
│   │   │   ├── products.controller.ts
│   │   │   ├── products.service.ts
│   │   │   └── dto/
│   │   │       ├── create-product.dto.ts
│   │   │       └── update-product.dto.ts
│   │   │
│   │   ├── inventory/
│   │   │   ├── inventory.module.ts
│   │   │   ├── inventory.controller.ts
│   │   │   ├── inventory.service.ts
│   │   │   └── dto/
│   │   │       └── update-inventory.dto.ts
│   │   │
│   │   ├── orders/
│   │   │   ├── orders.module.ts
│   │   │   ├── orders.controller.ts
│   │   │   ├── orders.service.ts
│   │   │   ├── order-state-machine.ts   # FSM for order status
│   │   │   └── dto/
│   │   │       ├── create-order.dto.ts
│   │   │       └── checkout.dto.ts
│   │   │
│   │   ├── payments/
│   │   │   ├── payments.module.ts
│   │   │   ├── payments.service.ts
│   │   │   └── stripe-webhook.controller.ts
│   │   │
│   │   ├── audit/
│   │   │   ├── audit.module.ts
│   │   │   ├── audit.service.ts
│   │   │   └── dto/
│   │   │       └── audit-log.dto.ts
│   │   │
│   │   └── prisma/
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma               # Database schema
│   │   ├── migrations/                 # Migration files
│   │   └── seed.ts                     # Seed data
│   │
│   ├── test/
│   │   ├── unit/
│   │   │   ├── orders.service.spec.ts
│   │   │   └── order-state-machine.spec.ts
│   │   ├── integration/
│   │   │   ├── checkout.integration.spec.ts
│   │   │   └── webhook.integration.spec.ts
│   │   └── e2e/
│   │       └── app.e2e-spec.ts
│   │
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                # Product listing
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx            # Checkout page
│   │   │   ├── orders/
│   │   │   │   └── [id]/page.tsx       # Order details
│   │   │   └── admin/
│   │   │       ├── page.tsx            # Admin dashboard
│   │   │       ├── inventory/page.tsx
│   │   │       └── orders/page.tsx
│   │   ├── components/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── Cart.tsx
│   │   │   ├── CheckoutForm.tsx
│   │   │   └── OrderStatus.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                  # API client
│   │   │   └── stripe.ts               # Stripe setup
│   │   └── types/
│   │       └── index.ts
│   │
│   ├── Dockerfile
│   ├── package.json
│   └── next.config.js
│
├── .github/
│   └── workflows/
│       ├── ci.yml                      # CI pipeline
│       └── deploy.yml                  # CD pipeline
│
├── docker-compose.yml                  # Full stack compose
├── README.md
└── ARCHITECTURE.md
```

---

## 3. Technology Stack Deep Dive

### 3.1 Backend Dependencies

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@prisma/client": "^5.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.0",
    "bcrypt": "^5.1.0",
    "stripe": "^14.0.0",
    "class-validator": "^0.14.0",
    "class-transformer": "^0.5.0"
  },
  "devDependencies": {
    "@nestjs/testing": "^10.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/passport-jwt": "^4.0.0",
    "prisma": "^5.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.0.0",
    "@types/supertest": "^6.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 3.2 Frontend Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@stripe/stripe-js": "^2.0.0",
    "@stripe/react-stripe-js": "^2.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```

### 3.3 Environment Variables

```bash
# backend/.env

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/orderdb?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="7d"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# App
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

```bash
# frontend/.env.local

NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## 4. Database Schema & Relationships

### 4.1 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// USER MODEL
// ============================================
enum Role {
  CUSTOMER
  ADMIN
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         Role     @default(CUSTOMER)
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  // Relations
  orders    Order[]
  auditLogs AuditLog[] @relation("ActorAuditLogs")

  @@map("users")
}

// ============================================
// PRODUCT MODEL
// ============================================
model Product {
  id        String   @id @default(uuid())
  name      String
  price     Decimal  @db.Decimal(10, 2)
  metadata  Json?    @default("{}")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  inventory  Inventory?
  orderItems OrderItem[]

  @@map("products")
}

// ============================================
// INVENTORY MODEL
// ============================================
model Inventory {
  productId         String   @id @map("product_id")
  availableQuantity Int      @default(0) @map("available_quantity")
  reservedQuantity  Int      @default(0) @map("reserved_quantity")
  updatedAt         DateTime @updatedAt @map("updated_at")

  // Relations
  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("inventory")
}

// ============================================
// ORDER MODEL
// ============================================
enum OrderStatus {
  CREATED
  PAYMENT_PENDING
  PAID
  FULFILLED
  CANCELLED
  FAILED
}

model Order {
  id              String      @id @default(uuid())
  userId          String      @map("user_id")
  status          OrderStatus @default(CREATED)
  totalAmount     Decimal     @db.Decimal(10, 2) @map("total_amount")
  paymentIntentId String?     @unique @map("payment_intent_id")
  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  // Relations
  user       User        @relation(fields: [userId], references: [id])
  orderItems OrderItem[]

  @@index([userId])
  @@index([status])
  @@index([paymentIntentId])
  @@map("orders")
}

// ============================================
// ORDER ITEM MODEL
// ============================================
model OrderItem {
  id            String  @id @default(uuid())
  orderId       String  @map("order_id")
  productId     String  @map("product_id")
  quantity      Int
  priceSnapshot Decimal @db.Decimal(10, 2) @map("price_snapshot")

  // Relations
  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])

  @@index([orderId])
  @@map("order_items")
}

// ============================================
// AUDIT LOG MODEL
// ============================================
enum ActionType {
  INVENTORY_UPDATED
  ORDER_CREATED
  ORDER_STATUS_CHANGED
  PRODUCT_CREATED
  PRODUCT_UPDATED
}

enum EntityType {
  INVENTORY
  ORDER
  PRODUCT
}

model AuditLog {
  id          String     @id @default(uuid())
  actorId     String?    @map("actor_id")
  actionType  ActionType @map("action_type")
  entityType  EntityType @map("entity_type")
  entityId    String     @map("entity_id")
  beforeState Json?      @map("before_state")
  afterState  Json?      @map("after_state")
  timestamp   DateTime   @default(now())

  // Relations
  actor User? @relation("ActorAuditLogs", fields: [actorId], references: [id])

  @@index([entityType, entityId])
  @@index([actorId])
  @@index([timestamp])
  @@map("audit_logs")
}
```

### 4.2 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │   Product   │       │  Inventory  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │◄──────│ product_id  │
│ email       │       │ name        │  1:1  │ (PK, FK)    │
│ password    │       │ price       │       │ available   │
│ role        │       │ metadata    │       │ reserved    │
│ created_at  │       │ created_at  │       │ updated_at  │
└──────┬──────┘       └──────┬──────┘       └─────────────┘
       │                     │
       │ 1:N                 │ 1:N
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│    Order    │       │ OrderItem   │
├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ order_id    │
│ user_id(FK) │  1:N  │ (FK)        │
│ status      │       │ product_id  │
│ total       │       │ (FK)        │
│ payment_id  │       │ quantity    │
│ created_at  │       │ price_snap  │
└─────────────┘       └─────────────┘

┌─────────────┐
│  AuditLog   │
├─────────────┤
│ id (PK)     │
│ actor_id    │◄── User (nullable for system actions)
│ action_type │
│ entity_type │
│ entity_id   │
│ before_state│
│ after_state │
│ timestamp   │
└─────────────┘
```

### 4.3 Inventory Rules

```
INVARIANT: available_quantity >= 0
INVARIANT: reserved_quantity >= 0
INVARIANT: total_stock = available_quantity + reserved_quantity

OPERATION: Reserve Stock (during checkout)
  available_quantity -= quantity
  reserved_quantity += quantity

OPERATION: Confirm Purchase (after payment success)
  reserved_quantity -= quantity
  (stock is now sold)

OPERATION: Release Reservation (payment failed/cancelled)
  available_quantity += quantity
  reserved_quantity -= quantity

OPERATION: Restock (admin)
  available_quantity += quantity
```

---

## 5. Phase 1: Project Setup & Foundation

### 5.1 Initialize Backend

```bash
# Create project directory
mkdir transactional-order-system
cd transactional-order-system

# Create NestJS backend
npx @nestjs/cli new backend --package-manager npm --skip-git
cd backend

# Install dependencies
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt stripe class-validator class-transformer @prisma/client

# Install dev dependencies
npm install -D prisma @types/bcrypt @types/passport-jwt

# Initialize Prisma
npx prisma init
```

### 5.2 Configure Environment

Create `backend/.env`:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/orderdb?schema=public"
JWT_SECRET="your-development-secret-key-min-32-characters"
JWT_EXPIRATION="7d"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

Create `backend/.env.example` (same but with placeholder values).

### 5.3 Configure Main Module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    // Other modules will be added here
  ],
})
export class AppModule {}
```

### 5.4 Create Prisma Service

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper for transactions with row-level locking
  async executeInTransaction<T>(
    fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(fn, {
      isolationLevel: 'Serializable', // Highest isolation level
      maxWait: 5000, // 5 seconds max wait
      timeout: 10000, // 10 seconds timeout
    });
  }
}
```

```typescript
// src/prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### 5.5 Configure Main Entry Point

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Required for Stripe webhook signature verification
  });

  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true, // Transform payloads to DTO instances
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true,
  });

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`🚀 Application running on: http://localhost:${port}`);
}

bootstrap();
```

### 5.6 Run Initial Migration

```bash
# Create the database schema
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Verify connection
npx prisma studio
```

### 5.7 Checkpoint Validation

At this point, verify:

```bash
# Start the server
npm run start:dev

# Should see:
# 🚀 Application running on: http://localhost:3001

# Test the connection
curl http://localhost:3001
# Should return 404 (no routes yet, but server is running)
```

---

## 6. Phase 2: Database & Core Models

### 6.1 Apply Full Schema

Update `prisma/schema.prisma` with the complete schema from Section 4.1 above.

```bash
# Create migration
npx prisma migrate dev --name add_full_schema

# Regenerate client
npx prisma generate
```

### 6.2 Create Type Definitions

```typescript
// src/common/types/index.ts
import { Role, OrderStatus, ActionType, EntityType } from '@prisma/client';

export { Role, OrderStatus, ActionType, EntityType };

// Order State Machine Types
export interface StateTransition {
  from: OrderStatus;
  to: OrderStatus;
}

export const VALID_TRANSITIONS: StateTransition[] = [
  { from: OrderStatus.CREATED, to: OrderStatus.PAYMENT_PENDING },
  { from: OrderStatus.PAYMENT_PENDING, to: OrderStatus.PAID },
  { from: OrderStatus.PAYMENT_PENDING, to: OrderStatus.FAILED },
  { from: OrderStatus.CREATED, to: OrderStatus.CANCELLED },
  { from: OrderStatus.PAID, to: OrderStatus.FULFILLED },
];

// Checkout Types
export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CheckoutResult {
  orderId: string;
  clientSecret: string;
  totalAmount: number;
}

// Audit Log Types
export interface AuditLogData {
  actorId?: string;
  actionType: ActionType;
  entityType: EntityType;
  entityId: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
}
```

### 6.3 Create Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

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
  console.log(`✅ Admin user created: ${admin.email}`);

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
  console.log(`✅ Customer user created: ${customer.email}`);

  // Create products with inventory
  const products = [
    { name: 'Mechanical Keyboard', price: 149.99, stock: 50 },
    { name: 'Wireless Mouse', price: 79.99, stock: 100 },
    { name: 'USB-C Hub', price: 59.99, stock: 75 },
    { name: '4K Monitor', price: 399.99, stock: 25 },
    { name: 'Webcam HD', price: 89.99, stock: 60 },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { id: p.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: p.name.toLowerCase().replace(/\s+/g, '-'),
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
    console.log(`✅ Product created: ${product.name} (stock: ${p.stock})`);
  }

  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Update `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run seed:

```bash
npx prisma db seed
```

### 6.4 Checkpoint Validation

```bash
# Open Prisma Studio
npx prisma studio

# Verify:
# - 2 users (admin + customer)
# - 5 products
# - 5 inventory records
```

---

## 7. Phase 3: Authentication & Authorization

### 7.1 Create Auth DTOs

```typescript
// src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
```

```typescript
// src/auth/dto/login.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
```

### 7.2 Create Users Service

```typescript
// src/users/users.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: RegisterDto) {
    // Check if user exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        role: dto.role || Role.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
```

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### 7.3 Create Auth Service

```typescript
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create(dto);
    const token = this.generateToken(user);

    return {
      user,
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken: token,
    };
  }

  private generateToken(user: { id: string; email: string; role: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async validateUser(payload: JwtPayload) {
    return this.usersService.findById(payload.sub);
  }
}
```

### 7.4 Create JWT Strategy

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
```

### 7.5 Create Guards & Decorators

```typescript
// src/common/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

```typescript
// src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('No user found');
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException(`Requires role: ${requiredRoles.join(' or ')}`);
    }

    return true;
  }
}
```

```typescript
// src/common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

```typescript
// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

```typescript
// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### 7.6 Create Auth Controller

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
```

### 7.7 Create Auth Module

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRATION') || '7d',
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

### 7.8 Update App Module with Global Guards

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
  providers: [
    // Global JWT guard - all routes require auth unless @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global roles guard - checks @Roles() decorator
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
```

### 7.9 Checkpoint Validation

```bash
# Start server
npm run start:dev

# Test registration
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Should return: { "user": {...}, "accessToken": "..." }

# Test login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Should return: { "user": {...}, "accessToken": "..." }

# Test protected route (should fail without token)
curl http://localhost:3001/products
# Should return: 401 Unauthorized
```

---

## 8. Phase 4: Product & Inventory Management

### 8.1 Create Product DTOs

```typescript
// src/products/dto/create-product.dto.ts
import { IsString, IsNumber, IsPositive, IsOptional, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  initialStock?: number;
}
```

```typescript
// src/products/dto/update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

### 8.2 Create Products Service

```typescript
// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuditService } from '../audit/audit.service';
import { ActionType, EntityType } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async create(dto: CreateProductDto, actorId: string) {
    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price,
        metadata: dto.metadata || {},
        inventory: {
          create: {
            availableQuantity: dto.initialStock || 0,
            reservedQuantity: 0,
          },
        },
      },
      include: {
        inventory: true,
      },
    });

    // Log the creation
    await this.auditService.log({
      actorId,
      actionType: ActionType.PRODUCT_CREATED,
      entityType: EntityType.PRODUCT,
      entityId: product.id,
      afterState: product,
    });

    return product;
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        inventory: {
          select: {
            availableQuantity: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto, actorId: string) {
    const beforeState = await this.findOne(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name,
        price: dto.price,
        metadata: dto.metadata,
      },
      include: {
        inventory: true,
      },
    });

    await this.auditService.log({
      actorId,
      actionType: ActionType.PRODUCT_UPDATED,
      entityType: EntityType.PRODUCT,
      entityId: product.id,
      beforeState,
      afterState: product,
    });

    return product;
  }
}
```

### 8.3 Create Products Controller

```typescript
// src/products/products.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateProductDto, @CurrentUser() user: { id: string }) {
    return this.productsService.create(dto, user.id);
  }

  @Get()
  @Public()
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.productsService.update(id, dto, user.id);
  }
}
```

### 8.4 Create Inventory Service

```typescript
// src/inventory/inventory.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ActionType, EntityType } from '@prisma/client';

export interface UpdateInventoryDto {
  availableQuantity?: number;
  adjustQuantity?: number; // Positive to add, negative to remove
}

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
```

### 8.5 Create Inventory Controller

```typescript
// src/inventory/inventory.controller.ts
import { Controller, Get, Patch, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { InventoryService, UpdateInventoryDto } from './inventory.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get()
  @Roles(Role.ADMIN)
  getAll() {
    return this.inventoryService.getAll();
  }

  @Get(':productId')
  @Roles(Role.ADMIN)
  findOne(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  @Patch(':productId')
  @Roles(Role.ADMIN)
  update(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: UpdateInventoryDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.inventoryService.update(productId, dto, user.id);
  }
}
```

### 8.6 Create Modules

```typescript
// src/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [ProductsService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
```

```typescript
// src/inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
```

### 8.7 Update App Module

```typescript
// src/app.module.ts
// Add to imports:
import { ProductsModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    // ... existing imports
    AuditModule,
    ProductsModule,
    InventoryModule,
  ],
  // ... rest
})
export class AppModule {}
```

---

## 9. Phase 5: Transactional Checkout System

**This is the core of the project. Pay close attention.**

### 9.1 Order State Machine

```typescript
// src/orders/order-state-machine.ts
import { BadRequestException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';

interface StateTransition {
  from: OrderStatus;
  to: OrderStatus;
}

// Define ALL valid transitions
const VALID_TRANSITIONS: StateTransition[] = [
  { from: OrderStatus.CREATED, to: OrderStatus.PAYMENT_PENDING },
  { from: OrderStatus.PAYMENT_PENDING, to: OrderStatus.PAID },
  { from: OrderStatus.PAYMENT_PENDING, to: OrderStatus.FAILED },
  { from: OrderStatus.CREATED, to: OrderStatus.CANCELLED },
  { from: OrderStatus.PAID, to: OrderStatus.FULFILLED },
];

export class OrderStateMachine {
  /**
   * Validates if a state transition is allowed.
   * Throws BadRequestException if not allowed.
   */
  static validateTransition(from: OrderStatus, to: OrderStatus): void {
    const isValid = VALID_TRANSITIONS.some(
      (t) => t.from === from && t.to === to,
    );

    if (!isValid) {
      throw new BadRequestException(
        `Invalid order state transition: ${from} → ${to}`,
      );
    }
  }

  /**
   * Returns all possible next states from current state.
   */
  static getNextStates(current: OrderStatus): OrderStatus[] {
    return VALID_TRANSITIONS
      .filter((t) => t.from === current)
      .map((t) => t.to);
  }

  /**
   * Checks if an order can be cancelled.
   */
  static canCancel(status: OrderStatus): boolean {
    return status === OrderStatus.CREATED;
  }

  /**
   * Checks if an order is in a terminal state.
   */
  static isTerminal(status: OrderStatus): boolean {
    const terminalStates = [
      OrderStatus.FULFILLED,
      OrderStatus.CANCELLED,
      OrderStatus.FAILED,
    ];
    return terminalStates.includes(status);
  }
}
```

### 9.2 Checkout DTO

```typescript
// src/orders/dto/checkout.dto.ts
import { IsArray, ValidateNested, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
```

### 9.3 Orders Service (THE CRITICAL PART)

```typescript
// src/orders/orders.service.ts
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
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
    const result = await this.prisma.$transaction(async (tx) => {
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
        WHERE product_id = ANY(${productIds}::uuid[])
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
          throw new BadRequestException(`Product ${item.productId} not found`);
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
    }, {
      // Transaction options
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000,
    });

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
```

### 9.4 Orders Controller

```typescript
// src/orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CheckoutDto } from './dto/checkout.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post('checkout')
  checkout(
    @Body() dto: CheckoutDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.ordersService.checkout(user.id, dto);
  }

  @Get('my-orders')
  getMyOrders(@CurrentUser() user: { id: string }) {
    return this.ordersService.findByUserId(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findById(id);
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.ordersService.findAll();
  }
}
```

### 9.5 Orders Module

```typescript
// src/orders/orders.module.ts
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { PaymentsModule } from '../payments/payments.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PaymentsModule, AuditModule],
  providers: [OrdersService],
  controllers: [OrdersController],
  exports: [OrdersService],
})
export class OrdersModule {}
```

---

## 10. Phase 6: Stripe Payment Integration

### 10.1 Payments Service

```typescript
// src/payments/payments.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(amount: number, orderId: string) {
    // Convert to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    return this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        orderId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  constructWebhookEvent(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET')!;

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
```

### 10.2 Stripe Webhook Controller

```typescript
// src/payments/stripe-webhook.controller.ts
import {
  Controller,
  Post,
  Headers,
  Req,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private paymentsService: PaymentsService,
    private ordersService: OrdersService,
  ) {}

  @Post('stripe')
  @Public() // Webhooks don't use JWT auth
  async handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    let event: Stripe.Event;

    try {
      // CRITICAL: Verify webhook signature
      // This ensures the request actually came from Stripe
      event = this.paymentsService.constructWebhookEvent(
        req.rawBody as Buffer,
        signature,
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`Received Stripe webhook: ${event.type}`);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }

    // Return 200 to acknowledge receipt
    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      this.logger.warn('PaymentIntent missing orderId metadata');
      return;
    }

    this.logger.log(`Processing payment success for order: ${orderId}`);

    try {
      await this.ordersService.handlePaymentSuccess(orderId);
      this.logger.log(`Order ${orderId} marked as PAID`);
    } catch (error) {
      this.logger.error(`Failed to process payment success: ${error.message}`);
      // Don't throw - we don't want to fail the webhook
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      this.logger.warn('PaymentIntent missing orderId metadata');
      return;
    }

    this.logger.log(`Processing payment failure for order: ${orderId}`);

    try {
      await this.ordersService.handlePaymentFailure(orderId);
      this.logger.log(`Order ${orderId} marked as FAILED, inventory released`);
    } catch (error) {
      this.logger.error(`Failed to process payment failure: ${error.message}`);
    }
  }
}
```

### 10.3 Payments Module

```typescript
// src/payments/payments.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { StripeWebhookController } from './stripe-webhook.controller';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [forwardRef(() => OrdersModule)],
  providers: [PaymentsService],
  controllers: [StripeWebhookController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
```

### 10.4 Configure Raw Body for Webhooks

Update `main.ts`:

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // CRITICAL for Stripe webhook signature verification
  });

  // ... rest of setup
}
```

### 10.5 Testing Webhooks Locally

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Linux: See https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/webhooks/stripe

# Note the webhook signing secret (whsec_...) and add to .env
```

---

## 11. Phase 7: Audit Logging System

### 11.1 Audit Service

```typescript
// src/audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogData } from '../common/types';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(data: AuditLogData) {
    return this.prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        actionType: data.actionType,
        entityType: data.entityType,
        entityId: data.entityId,
        beforeState: data.beforeState || undefined,
        afterState: data.afterState || undefined,
      },
    });
  }

  async findByEntity(entityType: string, entityId: string) {
    return this.prisma.auditLog.findMany({
      where: {
        entityType: entityType as any,
        entityId,
      },
      include: {
        actor: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  async findByActor(actorId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { actorId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }

  async findRecent(limit = 100) {
    return this.prisma.auditLog.findMany({
      include: {
        actor: {
          select: {
            email: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  }
}
```

### 11.2 Audit Controller

```typescript
// src/audit/audit.controller.ts
import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('audit')
@Roles(Role.ADMIN)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  findRecent(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.auditService.findRecent(limit);
  }

  @Get('entity/:type/:id')
  findByEntity(@Param('type') type: string, @Param('id') id: string) {
    return this.auditService.findByEntity(type, id);
  }
}
```

### 11.3 Audit Module

```typescript
// src/audit/audit.module.ts
import { Module, Global } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';

@Global()
@Module({
  providers: [AuditService],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
```

---

## 12. Phase 8: Minimal Frontend

### 12.1 Initialize Frontend

```bash
cd ..  # Back to project root
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd frontend

# Install dependencies
npm install @stripe/stripe-js @stripe/react-stripe-js axios
```

### 12.2 API Client

```typescript
// src/lib/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const auth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string) =>
    api.post('/auth/register', { email, password }),
};

export const products = {
  getAll: () => api.get('/products'),
  getOne: (id: string) => api.get(`/products/${id}`),
};

export const orders = {
  checkout: (items: { productId: string; quantity: number }[]) =>
    api.post('/orders/checkout', { items }),
  getMyOrders: () => api.get('/orders/my-orders'),
  getOne: (id: string) => api.get(`/orders/${id}`),
};

export const inventory = {
  getAll: () => api.get('/inventory'),
  update: (productId: string, data: { availableQuantity?: number; adjustQuantity?: number }) =>
    api.patch(`/inventory/${productId}`, data),
};
```

### 12.3 Types

```typescript
// src/types/index.ts
export interface User {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface Product {
  id: string;
  name: string;
  price: string;
  metadata: Record<string, any>;
  inventory?: {
    availableQuantity: number;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  orderItems: Array<{
    id: string;
    quantity: number;
    priceSnapshot: string;
    product: {
      name: string;
    };
  }>;
}
```

### 12.4 Auth Context

```typescript
// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await auth.login(email, password);
    const { user, accessToken } = response.data;

    setUser(user);
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const register = async (email: string, password: string) => {
    const response = await auth.register(email, password);
    const { user, accessToken } = response.data;

    setUser(user);
    setToken(accessToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 12.5 Cart Context

```typescript
// src/context/CartContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Product, CartItem } from '@/types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
```

### 12.6 Root Layout

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Order System',
  description: 'Transactional Order & Payment Processing System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 12.7 Product Listing Page

```typescript
// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { products } from '@/lib/api';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    products.getAll().then((res) => {
      setProductList(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading products...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productList.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### 12.8 Product Card Component

```typescript
// src/components/ProductCard.tsx
'use client';

import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const inStock = (product.inventory?.availableQuantity ?? 0) > 0;

  return (
    <div className="border rounded-lg p-4 shadow-sm">
      <h2 className="text-xl font-semibold">{product.name}</h2>
      <p className="text-2xl font-bold text-green-600 mt-2">
        ${parseFloat(product.price).toFixed(2)}
      </p>
      <p className="text-sm text-gray-500 mt-1">
        {inStock
          ? `${product.inventory?.availableQuantity} in stock`
          : 'Out of stock'}
      </p>
      <button
        onClick={() => addItem(product)}
        disabled={!inStock || !user}
        className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {!user ? 'Login to Buy' : inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
}
```

### 12.9 Checkout Page with Stripe

```typescript
// src/app/checkout/page.tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orders } from '@/lib/api';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm({ clientSecret, orderId }: { clientSecret: string; orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const { clearCart } = useCart();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}`,
      },
    });

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed');
      setProcessing(false);
    } else {
      clearCart();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="text-red-600">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function CheckoutPage() {
  const { items, total } = useCart();
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user || items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await orders.checkout(
        items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }))
      );

      setClientSecret(response.data.clientSecret);
      setOrderId(response.data.orderId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-10">Please login to checkout</div>;
  }

  if (items.length === 0) {
    return <div className="text-center py-10">Your cart is empty</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Cart Summary */}
      <div className="border rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        {items.map((item) => (
          <div key={item.product.id} className="flex justify-between py-2">
            <span>
              {item.product.name} × {item.quantity}
            </span>
            <span>
              ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
      )}

      {!clientSecret ? (
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating Order...' : 'Proceed to Payment'}
        </button>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} orderId={orderId!} />
        </Elements>
      )}
    </div>
  );
}
```

### 12.10 Navbar Component

```typescript
// src/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold">
            OrderSystem
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-gray-300">
              Products
            </Link>

            {user && (
              <>
                <Link href="/checkout" className="hover:text-gray-300">
                  Cart ({cartCount})
                </Link>
                <Link href="/orders" className="hover:text-gray-300">
                  My Orders
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" className="hover:text-gray-300">
                    Admin
                  </Link>
                )}
              </>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-300">{user.email}</span>
                <button
                  onClick={logout}
                  className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### 12.11 Login Page

```typescript
// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Login</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-4 text-center text-gray-600">
        Don't have an account?{' '}
        <Link href="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <p className="text-sm font-medium">Test Accounts:</p>
        <p className="text-sm text-gray-600">Admin: admin@example.com / admin123</p>
        <p className="text-sm text-gray-600">Customer: customer@example.com / customer123</p>
      </div>
    </div>
  );
}
```

---

## 13. Phase 9: Testing Strategy

### 13.1 Testing Philosophy

```
Unit Tests       → Test individual functions in isolation
Integration Tests → Test modules working together
E2E Tests        → Test complete user flows
Concurrency Tests → PROVE your system handles race conditions
```

### 13.2 Unit Tests for State Machine

```typescript
// test/unit/order-state-machine.spec.ts
import { OrderStateMachine } from '../../src/orders/order-state-machine';
import { OrderStatus } from '@prisma/client';

describe('OrderStateMachine', () => {
  describe('validateTransition', () => {
    it('should allow CREATED → PAYMENT_PENDING', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.CREATED,
          OrderStatus.PAYMENT_PENDING
        )
      ).not.toThrow();
    });

    it('should allow PAYMENT_PENDING → PAID', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.PAYMENT_PENDING,
          OrderStatus.PAID
        )
      ).not.toThrow();
    });

    it('should NOT allow CREATED → PAID (skipping step)', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.CREATED,
          OrderStatus.PAID
        )
      ).toThrow('Invalid order state transition');
    });

    it('should NOT allow PAID → CREATED (backwards)', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.PAID,
          OrderStatus.CREATED
        )
      ).toThrow('Invalid order state transition');
    });

    it('should NOT allow FULFILLED → any state (terminal)', () => {
      expect(() =>
        OrderStateMachine.validateTransition(
          OrderStatus.FULFILLED,
          OrderStatus.CANCELLED
        )
      ).toThrow();
    });
  });

  describe('getNextStates', () => {
    it('should return correct next states for CREATED', () => {
      const nextStates = OrderStateMachine.getNextStates(OrderStatus.CREATED);
      expect(nextStates).toContain(OrderStatus.PAYMENT_PENDING);
      expect(nextStates).toContain(OrderStatus.CANCELLED);
      expect(nextStates).not.toContain(OrderStatus.PAID);
    });
  });

  describe('isTerminal', () => {
    it('should return true for FULFILLED', () => {
      expect(OrderStateMachine.isTerminal(OrderStatus.FULFILLED)).toBe(true);
    });

    it('should return false for PAYMENT_PENDING', () => {
      expect(OrderStateMachine.isTerminal(OrderStatus.PAYMENT_PENDING)).toBe(false);
    });
  });
});
```

### 13.3 Integration Test for Checkout

```typescript
// test/integration/checkout.integration.spec.ts
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

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get(PrismaService);

    // Create test user and get token
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'customer@example.com', password: 'customer123' });

    authToken = loginRes.body.accessToken;

    // Get a test product
    const products = await prisma.product.findMany({ take: 1 });
    testProductId = products[0].id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders/checkout', () => {
    it('should create order and reserve inventory', async () => {
      // Get initial inventory
      const initialInventory = await prisma.inventory.findUnique({
        where: { productId: testProductId },
      });

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: testProductId, quantity: 2 }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('orderId');
      expect(response.body).toHaveProperty('clientSecret');

      // Verify inventory was reserved
      const updatedInventory = await prisma.inventory.findUnique({
        where: { productId: testProductId },
      });

      expect(updatedInventory!.availableQuantity).toBe(
        initialInventory!.availableQuantity - 2
      );
      expect(updatedInventory!.reservedQuantity).toBe(
        initialInventory!.reservedQuantity + 2
      );

      // Cleanup: Release the reservation
      await prisma.inventory.update({
        where: { productId: testProductId },
        data: {
          availableQuantity: initialInventory!.availableQuantity,
          reservedQuantity: initialInventory!.reservedQuantity,
        },
      });
    });

    it('should reject checkout with insufficient stock', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: testProductId, quantity: 99999 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Insufficient stock');
    });

    it('should reject empty cart', async () => {
      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ items: [] });

      expect(response.status).toBe(400);
    });
  });
});
```

### 13.4 Concurrency Test (THE MOST IMPORTANT TEST)

```typescript
// test/integration/concurrency.integration.spec.ts
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

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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
        name: 'Concurrency Test Product',
        price: 10.00,
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
          })
      );

    const results = await Promise.all(concurrentRequests);

    // Count successes and failures
    const successes = results.filter((r) => r.status === 201);
    const failures = results.filter((r) => r.status === 400);

    console.log(`Successes: ${successes.length}, Failures: ${failures.length}`);

    // CRITICAL ASSERTIONS
    expect(successes.length).toBe(5); // Only 5 should succeed
    expect(failures.length).toBe(5); // 5 should fail with insufficient stock

    // Verify final inventory state
    const finalInventory = await prisma.inventory.findUnique({
      where: { productId },
    });

    expect(finalInventory!.availableQuantity).toBe(0);
    expect(finalInventory!.reservedQuantity).toBe(5);
    expect(finalInventory!.availableQuantity).toBeGreaterThanOrEqual(0); // NEVER negative

    // Cleanup
    await prisma.orderItem.deleteMany({
      where: { order: { userId: { not: undefined } } },
    });
    await prisma.order.deleteMany({
      where: { userId: { not: undefined } },
    });
    await prisma.inventory.delete({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
  });
});
```

### 13.5 Test Scripts in package.json

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### 13.6 Jest Configuration

```javascript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s', '!src/main.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

---

## 14. Phase 10: DevOps & Deployment

### 14.1 Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
```

### 14.2 Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
```

### 14.3 Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: orderdb
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/orderdb?schema=public
      JWT_SECRET: ${JWT_SECRET:-your-super-secret-jwt-key-at-least-32-chars}
      JWT_EXPIRATION: 7d
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      PORT: 3001
      NODE_ENV: production
      FRONTEND_URL: http://localhost:3000
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: http://localhost:3001
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${STRIPE_PUBLISHABLE_KEY}
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 14.4 GitHub Actions CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: orderdb_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: backend
        run: npm ci

      - name: Generate Prisma Client
        working-directory: backend
        run: npx prisma generate

      - name: Run migrations
        working-directory: backend
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/orderdb_test?schema=public

      - name: Seed database
        working-directory: backend
        run: npx prisma db seed
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/orderdb_test?schema=public

      - name: Run tests
        working-directory: backend
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/orderdb_test?schema=public
          JWT_SECRET: test-secret-key-at-least-32-characters-long
          STRIPE_SECRET_KEY: sk_test_fake
          STRIPE_WEBHOOK_SECRET: whsec_fake

      - name: Build
        working-directory: backend
        run: npm run build

  test-frontend:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Build
        working-directory: frontend
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3001
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_fake
```

### 14.5 Deployment Options

#### Option A: Railway (Recommended for simplicity)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up
```

#### Option B: Render

Create `render.yaml`:

```yaml
services:
  - type: web
    name: backend
    env: node
    buildCommand: cd backend && npm ci && npx prisma generate && npm run build
    startCommand: cd backend && npx prisma migrate deploy && node dist/main
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: orderdb
          property: connectionString
      - key: JWT_SECRET
        generateValue: true
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false

  - type: web
    name: frontend
    env: node
    buildCommand: cd frontend && npm ci && npm run build
    startCommand: cd frontend && npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://backend.onrender.com
      - key: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
        sync: false

databases:
  - name: orderdb
    plan: free
```

---

## 15. Phase 11: Documentation & Polish

### 15.1 README.md Template

```markdown
# Transactional Order & Payment Processing System

A production-grade backend system demonstrating ACID transactions, concurrency control, secure payment processing, and enterprise patterns.

## 🎯 Key Features

- **Atomic Checkout**: All-or-nothing transactions prevent partial orders
- **Concurrency Control**: Row-level locking prevents overselling
- **Secure Payments**: Stripe webhook verification ensures payment authenticity
- **State Machine**: Order status transitions are validated and audited
- **RBAC**: Role-based access control for admin operations
- **Audit Logging**: Complete history of all sensitive operations

## 🏗️ Architecture

[Include your architecture diagram here]

## 🚀 Quick Start

\```bash
# Clone the repository
git clone https://github.com/yourusername/transactional-order-system.git
cd transactional-order-system

# Start with Docker
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001

# Test accounts
# Admin: admin@example.com / admin123
# Customer: customer@example.com / customer123
\```

## 🧪 Running Tests

\```bash
cd backend

# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests (includes concurrency tests)
npm run test:integration

# Coverage report
npm run test:cov
\```

## 📚 API Documentation

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and receive JWT

### Products
- `GET /products` - List all products (public)
- `GET /products/:id` - Get product details (public)
- `POST /products` - Create product (admin only)

### Orders
- `POST /orders/checkout` - Create order with payment intent
- `GET /orders/my-orders` - Get current user's orders
- `GET /orders/:id` - Get order details
- `GET /orders` - List all orders (admin only)

### Inventory
- `GET /inventory` - List all inventory (admin only)
- `PATCH /inventory/:productId` - Update inventory (admin only)

### Webhooks
- `POST /webhooks/stripe` - Stripe payment webhooks

## 🔒 Security Features

1. **JWT Authentication**: Stateless auth with token expiration
2. **Password Hashing**: bcrypt with salt rounds
3. **RBAC**: Admin/Customer role separation
4. **Webhook Verification**: Stripe signature validation
5. **Input Validation**: DTO validation with class-validator

## 📊 Database Schema

[Include your ERD diagram here]

## 🧠 Technical Decisions

### Why Row-Level Locking?
Prevents race conditions during checkout. When multiple users try to buy the last item, only one succeeds.

### Why Stripe Webhooks?
Client-side payment confirmation is never trusted. Webhooks provide server-to-server confirmation.

### Why a State Machine?
Prevents invalid order transitions (e.g., marking a cancelled order as shipped).

## 📈 What This Demonstrates

| Skill | Implementation |
|-------|---------------|
| ACID Transactions | Atomic checkout with rollback |
| Concurrency Control | SELECT ... FOR UPDATE |
| Finite State Machines | Order status validation |
| Webhook Security | Stripe signature verification |
| RBAC | Guard-based authorization |
| Audit Logging | Before/after state capture |

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeScript, Prisma
- **Database**: PostgreSQL
- **Payments**: Stripe
- **Frontend**: Next.js, React, Tailwind CSS
- **DevOps**: Docker, GitHub Actions

## 📝 License

MIT
```

### 15.2 ARCHITECTURE.md

Create a detailed architecture document with:

1. System overview diagram (use Mermaid)
2. Data flow diagrams for key operations
3. Database schema documentation
4. API contracts
5. Error handling strategy
6. Security considerations

### 15.3 Code Comments

Add comments to critical sections:

```typescript
/**
 * ATOMIC CHECKOUT
 *
 * This transaction guarantees:
 * 1. No partial orders (all or nothing)
 * 2. No overselling (row locking)
 * 3. Consistent inventory state
 *
 * If ANY step fails, everything rolls back.
 */
```

---

## 16. Interview Preparation

### 16.1 Questions You Should Be Able to Answer

**Transaction & Concurrency:**

1. "How do you prevent two users from buying the last item?"
   - Row-level locking with `SELECT ... FOR UPDATE`
   - Serializable isolation level
   - Atomic inventory reservation

2. "What happens if the payment fails after inventory is reserved?"
   - Webhook handler releases reservation
   - Transaction handles rollback for DB failures
   - Stripe handles payment-side rollback

3. "How do you ensure the checkout is atomic?"
   - All operations in a single database transaction
   - Prisma `$transaction` with Serializable isolation
   - Any failure causes complete rollback

**State Machine:**

4. "Why use a state machine for orders?"
   - Prevents invalid transitions
   - Makes business rules explicit
   - Easier to audit and debug

5. "What happens if someone tries to mark a cancelled order as shipped?"
   - State machine throws BadRequestException
   - Transition is rejected
   - Audit log shows attempt

**Security:**

6. "How do you know the webhook is actually from Stripe?"
   - Webhook signature verification
   - HMAC with shared secret
   - Timestamp validation prevents replay attacks

7. "Why don't you trust the client for payment confirmation?"
   - Client can be manipulated
   - Webhooks are server-to-server
   - Stripe is the source of truth for payment status

**Architecture:**

8. "Why NestJS over Express?"
   - Built-in DI, guards, interceptors
   - Better structure for enterprise apps
   - Native TypeScript support

9. "Why Prisma over TypeORM?"
   - Better type safety
   - Cleaner transaction API
   - Simpler raw queries

### 16.2 Demo Script (2 Minutes)

1. **Show the product list** (10 sec)
   - "Here's a simple product catalog"

2. **Add items to cart and checkout** (30 sec)
   - "I'll add this keyboard and mouse"
   - "Watch the checkout process"
   - "The system creates an order and reserves inventory atomically"

3. **Complete payment** (20 sec)
   - "Using Stripe test mode"
   - "The webhook confirms payment server-to-server"

4. **Show the order status change** (15 sec)
   - "Order is now PAID"
   - "Inventory was deducted"

5. **Show the audit log** (15 sec)
   - "Every action is logged with before/after state"

6. **Show the concurrency test** (30 sec)
   - "This test proves we prevent overselling"
   - "10 concurrent requests, only 5 succeed"

### 16.3 Code Walkthrough Points

When showing code, highlight:

1. **The transaction block** in `orders.service.ts`
2. **The state machine** validation
3. **The webhook signature verification**
4. **The audit logging** with before/after state
5. **The concurrency test** results

---

## 17. Common Pitfalls & Solutions

### 17.1 Database Issues

| Problem | Solution |
|---------|----------|
| Prisma migrations fail | Reset DB: `npx prisma migrate reset` |
| Connection refused | Check Docker is running, ports are correct |
| UUID type errors | Ensure PostgreSQL, not SQLite |

### 17.2 Auth Issues

| Problem | Solution |
|---------|----------|
| 401 on protected routes | Check token in Authorization header |
| Invalid token | Verify JWT_SECRET matches |
| Token expired | Increase JWT_EXPIRATION |

### 17.3 Stripe Issues

| Problem | Solution |
|---------|----------|
| Webhook signature fails | Use raw body, check webhook secret |
| Payment intent fails | Verify Stripe key is test mode |
| No client secret | Check Stripe API response |

### 17.4 Concurrency Test Fails

| Problem | Solution |
|---------|----------|
| All requests succeed | Check isolation level is Serializable |
| Random failures | Increase transaction timeout |
| Deadlocks | Ensure consistent lock order |

---

## 18. Resources & References

### 18.1 Official Documentation

- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe Docs](https://stripe.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### 18.2 Key Concepts to Study

- [ACID Properties](https://en.wikipedia.org/wiki/ACID)
- [Database Isolation Levels](https://www.postgresql.org/docs/current/transaction-iso.html)
- [Row-Level Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Finite State Machines](https://en.wikipedia.org/wiki/Finite-state_machine)
- [HMAC Verification](https://en.wikipedia.org/wiki/HMAC)

### 18.3 Similar Projects for Reference

- [NestJS Realworld Example](https://github.com/lujakob/nestjs-realworld-example-app)
- [Prisma Examples](https://github.com/prisma/prisma-examples)

---

## Final Checklist

Before submitting for co-op applications:

```
□ All tests pass (especially concurrency test)
□ Docker Compose starts with one command
□ Deployed and accessible online
□ README has clear setup instructions
□ Architecture diagram included
□ Test accounts documented
□ Can demo in under 2 minutes
□ Can explain transaction flow
□ Can explain webhook security
□ Can explain state machine
□ Code is clean and commented
□ No hardcoded secrets in code
□ CI/CD pipeline is green
```

---

**Good luck with your co-op applications! This project will set you apart.**