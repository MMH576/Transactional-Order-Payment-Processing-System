'use client';

import Link from 'next/link';
import { FeatureCard } from '@/components/FeatureCard';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full text-blue-300 text-sm mb-6">
              Portfolio Project - Full Stack Engineering
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Transactional Order &<br />Payment Processing System
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              A production-grade backend system demonstrating ACID transactions,
              concurrency control, secure payment processing, and enterprise patterns.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/demo"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition"
              >
                Try Live Demo
              </Link>
              <Link
                href="/architecture"
                className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-lg font-semibold transition"
              >
                View Architecture
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 hover:bg-white/20 px-8 py-3 rounded-lg font-semibold transition"
              >
                GitHub Repo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">&#9881;</span>
              <span className="font-medium">NestJS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">&#128190;</span>
              <span className="font-medium">PostgreSQL</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">&#9889;</span>
              <span className="font-medium">Prisma ORM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">&#128179;</span>
              <span className="font-medium">Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">&#128736;</span>
              <span className="font-medium">Docker</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">&#128295;</span>
              <span className="font-medium">TypeScript</span>
            </div>
          </div>
        </div>
      </section>

      {/* What This Demonstrates */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              Technical Skills Demonstrated
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              This project showcases critical backend engineering concepts that are essential
              for building reliable, scalable systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon="&#9889;"
              title="ACID Transactions"
              description="Atomic checkout operations with full rollback on failure. No partial writes, no data corruption."
              color="blue"
            />
            <FeatureCard
              icon="&#128274;"
              title="Concurrency Control"
              description="Row-level locking (SELECT FOR UPDATE) prevents race conditions and overselling inventory."
              color="green"
            />
            <FeatureCard
              icon="&#128260;"
              title="Finite State Machine"
              description="Order status transitions with strict validation. Only valid state changes are allowed."
              color="purple"
            />
            <FeatureCard
              icon="&#128179;"
              title="Secure Webhooks"
              description="Stripe webhook signature verification ensures requests genuinely come from Stripe."
              color="orange"
            />
            <FeatureCard
              icon="&#128101;"
              title="Role-Based Access"
              description="JWT authentication with RBAC. Admin and Customer roles with different permissions."
              color="red"
            />
            <FeatureCard
              icon="&#128203;"
              title="Audit Logging"
              description="Immutable audit logs capture before/after state of every important operation."
              color="indigo"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              The Checkout Flow - A Deep Dive
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              The atomic checkout is the core feature. Here's exactly what happens when a customer
              clicks "Checkout" - all in a single database transaction.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-200 hidden md:block"></div>

              {/* Steps */}
              {[
                {
                  step: 1,
                  title: 'Lock Inventory Rows',
                  description: 'SELECT ... FOR UPDATE locks the inventory rows for the products being purchased. No other transaction can modify these rows until we\'re done.',
                  code: 'SELECT * FROM inventory WHERE product_id IN (...) FOR UPDATE',
                },
                {
                  step: 2,
                  title: 'Validate Stock',
                  description: 'Check that each product has sufficient available quantity. If not, the entire transaction is aborted.',
                  code: 'if (available_quantity < requested_quantity) throw Error',
                },
                {
                  step: 3,
                  title: 'Create Order',
                  description: 'Insert the order record with CREATED status and calculated total amount.',
                  code: 'INSERT INTO orders (user_id, status, total_amount) VALUES (...)',
                },
                {
                  step: 4,
                  title: 'Create Order Items',
                  description: 'Insert each line item with a price snapshot (capturing the price at time of purchase).',
                  code: 'INSERT INTO order_items (order_id, product_id, quantity, price_snapshot)',
                },
                {
                  step: 5,
                  title: 'Reserve Inventory',
                  description: 'Decrement available_quantity, increment reserved_quantity. Stock is now reserved for this order.',
                  code: 'UPDATE inventory SET available = available - qty, reserved = reserved + qty',
                },
                {
                  step: 6,
                  title: 'Commit Transaction',
                  description: 'If ALL steps succeed, commit. If ANY step fails, everything is rolled back automatically.',
                  code: 'COMMIT; // Or ROLLBACK on any error',
                },
              ].map((item) => (
                <div key={item.step} className="relative pl-12 pb-10 md:pl-16">
                  <div className="absolute left-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:left-0.5">
                    {item.step}
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="font-semibold text-lg text-slate-800 mb-2">{item.title}</h3>
                    <p className="text-slate-600 mb-3">{item.description}</p>
                    <code className="block bg-slate-900 text-green-400 px-4 py-2 rounded text-sm font-mono overflow-x-auto">
                      {item.code}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Why This Matters</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="font-semibold text-xl mb-4 text-red-400">Without Proper Transactions</h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">&#10007;</span>
                    Two users buy the last item simultaneously - both succeed
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">&#10007;</span>
                    Payment fails but inventory already decremented
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">&#10007;</span>
                    Order created but items not saved (partial write)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">&#10007;</span>
                    Negative inventory counts possible
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 rounded-xl p-6">
                <h3 className="font-semibold text-xl mb-4 text-green-400">With This Implementation</h3>
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">&#10003;</span>
                    Row-level locking ensures only one transaction proceeds
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">&#10003;</span>
                    Payment intent created AFTER successful commit
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">&#10003;</span>
                    All-or-nothing: complete success or complete rollback
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">&#10003;</span>
                    Inventory constraints mathematically enforced
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Test Accounts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Try It Yourself</h2>
            <p className="text-slate-600 mb-8">
              Use these test accounts to explore the system. Admin has full access,
              Customer can only view products and make purchases.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="text-2xl mb-2">&#128081;</div>
                <h3 className="font-semibold text-lg mb-2">Admin Account</h3>
                <p className="text-sm text-slate-600 mb-1">admin@example.com</p>
                <p className="text-sm text-slate-600 mb-4">admin123</p>
                <ul className="text-sm text-slate-600 text-left">
                  <li>&#10003; View all orders</li>
                  <li>&#10003; Manage inventory</li>
                  <li>&#10003; View audit logs</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="text-2xl mb-2">&#128100;</div>
                <h3 className="font-semibold text-lg mb-2">Customer Account</h3>
                <p className="text-sm text-slate-600 mb-1">customer@example.com</p>
                <p className="text-sm text-slate-600 mb-4">customer123</p>
                <ul className="text-sm text-slate-600 text-left">
                  <li>&#10003; Browse products</li>
                  <li>&#10003; Add to cart</li>
                  <li>&#10003; Complete checkout</li>
                </ul>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Login & Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            Built with NestJS, PostgreSQL, Prisma, Stripe, Next.js, and TypeScript
          </p>
          <p className="text-sm">
            A portfolio project demonstrating production-grade backend engineering
          </p>
        </div>
      </footer>
    </div>
  );
}
