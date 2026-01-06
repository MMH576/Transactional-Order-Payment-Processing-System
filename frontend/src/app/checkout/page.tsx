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

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
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
      const message = err.response?.data?.message || 'Checkout failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Simulate checkout for demo without real Stripe
  const simulateCheckout = async () => {
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

      // Clear cart and redirect to order page
      clearCart();
      router.push(`/orders/${response.data.orderId}?simulated=true`);
    } catch (err: any) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Checkout</h1>

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
            {error}
          </div>
        )}

        {/* What Happens Section */}
        <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-100">
          <h3 className="font-semibold text-blue-800 mb-3">&#9889; What happens when you checkout?</h3>
          <ol className="text-sm text-blue-700 space-y-2">
            <li><strong>1. Transaction Begins:</strong> Database starts an atomic transaction</li>
            <li><strong>2. Lock Inventory:</strong> SELECT FOR UPDATE locks the inventory rows</li>
            <li><strong>3. Validate Stock:</strong> Checks each item has sufficient quantity</li>
            <li><strong>4. Create Order:</strong> Order and items are inserted atomically</li>
            <li><strong>5. Reserve Stock:</strong> Available qty decreases, reserved qty increases</li>
            <li><strong>6. Commit:</strong> All changes are committed together or rolled back</li>
          </ol>
        </div>

        {/* Payment Section */}
        {!clientSecret ? (
          <div className="space-y-4">
            <button
              onClick={simulateCheckout}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-slate-400 transition"
            >
              {loading ? 'Creating Order...' : 'Complete Order (Demo Mode)'}
            </button>

            <p className="text-xs text-slate-500 text-center">
              Demo mode creates the order and shows the transaction flow. In production, Stripe would handle payment.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Payment</h2>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm clientSecret={clientSecret} orderId={orderId!} />
            </Elements>
          </div>
        )}
      </div>
    </div>
  );
}
