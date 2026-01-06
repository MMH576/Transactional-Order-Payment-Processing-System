'use client';

import Link from 'next/link';

export default function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <Link href="/" className="text-blue-400 hover:underline text-sm mb-4 inline-block">
              &#8592; Back to Home
            </Link>
            <h1 className="text-4xl font-bold mb-4">System Architecture</h1>
            <p className="text-slate-300 text-lg">
              A deep dive into the technical architecture, design decisions, and implementation details
              of this transactional order processing system.
            </p>
          </div>
        </div>
      </section>

      {/* High-Level Architecture */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">High-Level Architecture</h2>

            <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
              <pre className="text-sm font-mono text-slate-700 overflow-x-auto whitespace-pre">
{`
 ┌─────────────────────────────────────────────────────────────────┐
 │                         FRONTEND                                 │
 │                      (Next.js + React)                          │
 │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
 │   │ Products │  │   Cart   │  │ Checkout │  │  Admin   │       │
 │   └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
 └─────────────────────────────────────────────────────────────────┘
                               │
                               │ REST API (HTTP/JSON)
                               ▼
 ┌─────────────────────────────────────────────────────────────────┐
 │                         BACKEND                                  │
 │                      (NestJS + TypeScript)                      │
 │                                                                  │
 │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
 │  │    Auth     │  │   Orders    │  │  Products   │             │
 │  │   Module    │  │   Module    │  │   Module    │             │
 │  └─────────────┘  └─────────────┘  └─────────────┘             │
 │         │                │                │                     │
 │         ▼                ▼                ▼                     │
 │  ┌─────────────────────────────────────────────────────────┐   │
 │  │              Transaction Management Layer                │   │
 │  │     • ACID Transactions  • Row-Level Locking            │   │
 │  │     • State Machine      • Audit Logging                │   │
 │  └─────────────────────────────────────────────────────────┘   │
 │                             │                                   │
 └─────────────────────────────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │PostgreSQL│    │  Stripe  │    │  Docker  │
        │    DB    │    │   API    │    │Container │
        └──────────┘    └──────────┘    └──────────┘
`}
              </pre>
            </div>

            {/* Tech Stack Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-3xl mb-3">&#9881;</div>
                <h3 className="font-semibold text-lg mb-2">NestJS</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Enterprise-grade Node.js framework with built-in DI, modules, guards, and decorators.
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>&#10003; Modular architecture</li>
                  <li>&#10003; Dependency injection</li>
                  <li>&#10003; Guards & interceptors</li>
                  <li>&#10003; First-class TypeScript</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-3xl mb-3">&#128190;</div>
                <h3 className="font-semibold text-lg mb-2">PostgreSQL + Prisma</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Type-safe ORM with excellent transaction support and raw SQL when needed.
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>&#10003; Generated types</li>
                  <li>&#10003; Interactive transactions</li>
                  <li>&#10003; Raw SQL for FOR UPDATE</li>
                  <li>&#10003; Schema migrations</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="text-3xl mb-3">&#128179;</div>
                <h3 className="font-semibold text-lg mb-2">Stripe</h3>
                <p className="text-sm text-slate-600 mb-3">
                  Industry-standard payment processing with secure webhook verification.
                </p>
                <ul className="text-xs text-slate-500 space-y-1">
                  <li>&#10003; PaymentIntent API</li>
                  <li>&#10003; Webhook signatures</li>
                  <li>&#10003; Test mode for demo</li>
                  <li>&#10003; Async confirmation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Flow Diagram */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Checkout Transaction Flow</h2>

            <div className="bg-slate-900 rounded-xl p-8 mb-8 overflow-x-auto">
              <pre className="text-sm font-mono text-green-400 whitespace-pre">
{`
 Client                  API Server               PostgreSQL              Stripe
   │                         │                         │                     │
   │  POST /orders/checkout  │                         │                     │
   │────────────────────────>│                         │                     │
   │                         │                         │                     │
   │                         │ BEGIN TRANSACTION       │                     │
   │                         │────────────────────────>│                     │
   │                         │                         │                     │
   │                         │ SELECT * FROM inventory │                     │
   │                         │ WHERE id IN (...)       │                     │
   │                         │ FOR UPDATE              │ <── Row locks acquired
   │                         │────────────────────────>│                     │
   │                         │                         │                     │
   │                         │ Check: qty available?   │                     │
   │                         │<────────────────────────│                     │
   │                         │                         │                     │
   │                         │ INSERT INTO orders      │                     │
   │                         │────────────────────────>│                     │
   │                         │                         │                     │
   │                         │ INSERT INTO order_items │                     │
   │                         │────────────────────────>│                     │
   │                         │                         │                     │
   │                         │ UPDATE inventory        │                     │
   │                         │ SET available = available - qty              │
   │                         │     reserved = reserved + qty                │
   │                         │────────────────────────>│                     │
   │                         │                         │                     │
   │                         │ COMMIT                  │ <── Locks released  │
   │                         │────────────────────────>│                     │
   │                         │                         │                     │
   │                         │ Create PaymentIntent    │                     │
   │                         │─────────────────────────────────────────────>│
   │                         │                         │                     │
   │                         │ Return client_secret    │                     │
   │                         │<─────────────────────────────────────────────│
   │                         │                         │                     │
   │  { orderId, clientSecret, totalAmount }          │                     │
   │<────────────────────────│                         │                     │
   │                         │                         │                     │
`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Database Schema */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Database Schema</h2>

            <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8">
              <pre className="text-sm font-mono text-slate-700 overflow-x-auto whitespace-pre">
{`
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
│ before_state│ ◄── JSON snapshot
│ after_state │ ◄── JSON snapshot
│ timestamp   │
└─────────────┘
`}
              </pre>
            </div>

            {/* Inventory Rules */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-800 mb-3">Inventory Invariants</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-blue-700 mb-2">Constraints:</p>
                  <ul className="text-blue-600 space-y-1">
                    <li>&#10003; available_quantity &gt;= 0</li>
                    <li>&#10003; reserved_quantity &gt;= 0</li>
                    <li>&#10003; total_stock = available + reserved</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-blue-700 mb-2">Operations:</p>
                  <ul className="text-blue-600 space-y-1">
                    <li>Reserve: available--, reserved++</li>
                    <li>Confirm: reserved--</li>
                    <li>Release: reserved--, available++</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Order State Machine */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Order State Machine</h2>

            <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 mb-8">
              <pre className="text-sm font-mono text-slate-700 overflow-x-auto whitespace-pre">
{`
                        ┌─────────────┐
                        │   CREATED   │
                        └──────┬──────┘
                               │
              ┌────────────────┼────────────────┐
              │                                 │
              ▼                                 ▼
     ┌─────────────────┐              ┌─────────────┐
     │ PAYMENT_PENDING │              │  CANCELLED  │
     └────────┬────────┘              └─────────────┘
              │                            (terminal)
     ┌────────┼────────┐
     │                 │
     ▼                 ▼
┌─────────┐      ┌─────────┐
│  PAID   │      │ FAILED  │
└────┬────┘      └─────────┘
     │              (terminal)
     ▼
┌───────────┐
│ FULFILLED │
└───────────┘
  (terminal)


Valid Transitions:
  CREATED → PAYMENT_PENDING  (checkout initiated)
  CREATED → CANCELLED        (user cancelled)
  PAYMENT_PENDING → PAID     (payment succeeded via webhook)
  PAYMENT_PENDING → FAILED   (payment failed via webhook)
  PAID → FULFILLED           (order shipped)
`}
              </pre>
            </div>

            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <h3 className="font-semibold text-red-800 mb-2">Invalid Transitions Are Rejected</h3>
              <p className="text-sm text-red-700">
                Attempting invalid transitions (like PAID → CREATED or FULFILLED → PAYMENT_PENDING)
                will throw a BadRequestException. This ensures data integrity and prevents
                impossible order states.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Security Measures</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-lg mb-3">&#128274; Authentication</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>&#10003; JWT tokens with configurable expiration</li>
                  <li>&#10003; bcrypt password hashing (10 rounds)</li>
                  <li>&#10003; Global auth guard (all routes protected by default)</li>
                  <li>&#10003; @Public() decorator for open routes</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-lg mb-3">&#128101; Authorization</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>&#10003; Role-based access control (ADMIN, CUSTOMER)</li>
                  <li>&#10003; @Roles() decorator for route protection</li>
                  <li>&#10003; Users can only see their own orders</li>
                  <li>&#10003; Admins can see all data</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-lg mb-3">&#128179; Stripe Security</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>&#10003; Webhook signature verification</li>
                  <li>&#10003; Raw body parsing for signatures</li>
                  <li>&#10003; Server-side secret key only</li>
                  <li>&#10003; No sensitive data in metadata</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-lg mb-3">&#128203; Audit Trail</h3>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>&#10003; All state changes logged</li>
                  <li>&#10003; Before/after snapshots</li>
                  <li>&#10003; Actor identification</li>
                  <li>&#10003; Immutable log entries</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to See It in Action?</h2>
          <p className="text-slate-300 mb-6">
            Try the live demo to see all these concepts working together.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/demo"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition"
            >
              Try Live Demo
            </Link>
            <Link
              href="/login"
              className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-lg font-semibold transition"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
