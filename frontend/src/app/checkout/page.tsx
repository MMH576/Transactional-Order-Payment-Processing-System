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
import Link from 'next/link';
import { ApiEndpointBadge, TransactionBlock, DatabaseOperation } from '@/components/BackendShowcase';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-400 transition"
      >
        {processing ? 'Processing...' : 'Complete Payment'}
      </button>
      <p className="text-xs text-slate-500 text-center">
        Use test card: 4242 4242 4242 4242 | Any future date | Any CVC
      </p>
    </form>
  );
}

type TransactionStep = 'idle' | 'locking' | 'validating' | 'creating' | 'reserving' | 'committing' | 'done' | 'error';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txStep, setTxStep] = useState<TransactionStep>('idle');

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
      const message = err.response?.data?.message || 'Checkout failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Simulate checkout with visual transaction steps
  const simulateCheckout = async () => {
    if (!user || items.length === 0) return;

    setLoading(true);
    setError(null);

    // Animate through transaction steps
    const steps: TransactionStep[] = ['locking', 'validating', 'creating', 'reserving', 'committing'];

    for (const step of steps) {
      setTxStep(step);
      await new Promise(r => setTimeout(r, 800)); // Pause for visual effect
    }

    try {
      const response = await orders.checkout(
        items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }))
      );

      setTxStep('done');
      await new Promise(r => setTimeout(r, 500));

      // Clear cart and redirect to order page
      clearCart();
      router.push(`/orders/${response.data.orderId}?simulated=true`);
    } catch (err: any) {
      setTxStep('error');
      const message = err.response?.data?.message || 'Checkout failed. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">&#128274;</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Login Required</h1>
          <p className="text-slate-600 mb-6">Please login to proceed with checkout.</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            Test: <code className="bg-slate-100 px-1">customer@example.com</code> / <code className="bg-slate-100 px-1">customer123</code>
          </p>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderId) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">&#128722;</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Your Cart is Empty</h1>
          <p className="text-slate-600 mb-6">Add some products to your cart first.</p>
          <Link
            href="/demo"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const getTransactionStatus = () => {
    if (txStep === 'idle') return 'pending';
    if (txStep === 'done') return 'committed';
    if (txStep === 'error') return 'rolled_back';
    return 'active';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Checkout</h1>
          <ApiEndpointBadge method="POST" path="/orders/checkout" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Order Info */}
          <div>
            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800">{item.product.name}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-slate-800">
                      ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-slate-800">Total</span>
                  <span className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <strong>Transaction Failed:</strong> {error}
                <p className="text-sm mt-1">The entire transaction was rolled back. No changes were made.</p>
              </div>
            )}

            {/* Checkout Buttons */}
            {!clientSecret && (
              <div className="space-y-4">
                {/* Real Stripe Payment */}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 transition text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      Creating Order...
                    </span>
                  ) : (
                    'Pay with Stripe'
                  )}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">or</span>
                  </div>
                </div>

                {/* Simulated Demo */}
                <button
                  onClick={simulateCheckout}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-400 transition text-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      Processing Transaction...
                    </span>
                  ) : (
                    'Demo Mode (Skip Payment)'
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  <strong>Pay with Stripe:</strong> Real payment flow with webhooks<br />
                  <strong>Demo Mode:</strong> Skip payment, see transaction visualization
                </p>
              </div>
            )}

            {/* Stripe Payment Form */}
            {clientSecret && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Payment</h2>
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm clientSecret={clientSecret} orderId={orderId!} />
                </Elements>
              </div>
            )}
          </div>

          {/* Right Column - Transaction Visualization */}
          <div>
            <div className="bg-slate-900 rounded-xl p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Backend Transaction</h3>
                <span className="text-xs text-slate-400 font-mono">OrdersService.checkout()</span>
              </div>

              {/* Transaction Block */}
              <TransactionBlock status={getTransactionStatus()}>
                <DatabaseOperation
                  operation="LOCK"
                  table="inventory"
                  description="SELECT ... FOR UPDATE on inventory rows"
                  isActive={txStep === 'locking'}
                />
                <DatabaseOperation
                  operation="SELECT"
                  table="inventory"
                  description="Validate available_quantity >= requested"
                  isActive={txStep === 'validating'}
                />
                <DatabaseOperation
                  operation="INSERT"
                  table="orders, order_items"
                  description="Create order and line items"
                  isActive={txStep === 'creating'}
                />
                <DatabaseOperation
                  operation="UPDATE"
                  table="inventory"
                  description="Decrement available, increment reserved"
                  isActive={txStep === 'reserving'}
                />
              </TransactionBlock>

              {/* Code Preview */}
              <div className="mt-4">
                <div className="text-xs text-slate-400 mb-2">Key code from orders.service.ts:</div>
                <pre className="text-xs text-green-400 font-mono bg-slate-950 p-3 rounded overflow-x-auto">
{`// Serializable isolation prevents race conditions
await this.prisma.$transaction(async (tx) => {
  // Lock rows to prevent concurrent modifications
  const inventory = await tx.$queryRaw\`
    SELECT * FROM inventory
    WHERE product_id IN (\${ids})
    FOR UPDATE
  \`;

  // Validate stock
  for (const item of items) {
    if (inventory.available < item.qty) {
      throw new Error('Insufficient stock');
      // Transaction auto-rollbacks
    }
  }

  // Create order atomically
  await tx.order.create({ data: orderData });
  await tx.orderItem.createMany({ data: items });

  // Reserve inventory
  await tx.inventory.update({
    availableQuantity: { decrement: qty },
    reservedQuantity: { increment: qty }
  });
}, { isolationLevel: 'Serializable' });`}
                </pre>
              </div>

              {/* Transaction Properties */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-slate-800 rounded p-2">
                  <div className="text-xs text-slate-400">Isolation Level</div>
                  <div className="text-sm text-yellow-400 font-mono">Serializable</div>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <div className="text-xs text-slate-400">Timeout</div>
                  <div className="text-sm text-yellow-400 font-mono">10,000ms</div>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <div className="text-xs text-slate-400">Rollback On</div>
                  <div className="text-sm text-red-400 font-mono">Any Error</div>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <div className="text-xs text-slate-400">Locking</div>
                  <div className="text-sm text-purple-400 font-mono">FOR UPDATE</div>
                </div>
              </div>

              {/* ACID Properties */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="text-xs text-slate-400 mb-2">ACID Guarantees:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">&#10003;</span>
                    <span className="text-slate-300"><strong>A</strong>tomic - All or nothing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">&#10003;</span>
                    <span className="text-slate-300"><strong>C</strong>onsistent - Valid state</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">&#10003;</span>
                    <span className="text-slate-300"><strong>I</strong>solated - No interference</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-400">&#10003;</span>
                    <span className="text-slate-300"><strong>D</strong>urable - Persisted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
