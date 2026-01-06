'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { orders } from '@/lib/api';
import { Order } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const simulated = searchParams.get('simulated') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const res = await orders.getOne(orderId);
      setOrder(res.data);
    } catch (err) {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">&#128274;</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Login Required</h1>
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading order...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">&#9888;</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Error</h2>
          <p className="text-slate-600 mb-6">{error || 'Order not found'}</p>
          <Link
            href="/orders"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Banner for Demo */}
        {simulated && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">&#10003;</div>
              <div>
                <h3 className="font-semibold text-green-800 text-lg mb-2">
                  Order Created Successfully!
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  The atomic transaction completed successfully. Here's what happened:
                </p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>&#10003; Inventory was locked with SELECT FOR UPDATE</li>
                  <li>&#10003; Stock was validated for all items</li>
                  <li>&#10003; Order record was created</li>
                  <li>&#10003; Order items were inserted</li>
                  <li>&#10003; Inventory was reserved (available - qty, reserved + qty)</li>
                  <li>&#10003; Transaction committed successfully</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Back Link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6"
        >
          &#8592; Back to Orders
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Order Details
              </h1>
              <p className="text-sm text-slate-500 font-mono">
                ID: {order.id}
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1">Created</p>
              <p className="font-medium text-slate-800">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Total</p>
              <p className="text-2xl font-bold text-slate-900">
                ${parseFloat(order.totalAmount).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">Items</p>
              <p className="font-medium text-slate-800">
                {order.orderItems.length} product(s)
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Order Items</h2>

          <div className="space-y-4">
            {order.orderItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="font-medium text-slate-800">{item.product.name}</p>
                  <p className="text-sm text-slate-500">
                    Quantity: {item.quantity} @ ${parseFloat(item.priceSnapshot).toFixed(2)} each
                  </p>
                </div>
                <p className="font-semibold text-slate-800">
                  ${(parseFloat(item.priceSnapshot) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800">Total</span>
              <span className="text-xl font-bold text-slate-900">
                ${parseFloat(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Order State Machine Info */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Order State Machine
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Orders follow a strict state machine. Only valid transitions are allowed.
          </p>

          <div className="flex flex-wrap gap-2 items-center">
            {['CREATED', 'PAYMENT_PENDING', 'PAID', 'FULFILLED'].map((status, idx) => (
              <div key={status} className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {status}
                </span>
                {idx < 3 && <span className="text-slate-400">&#8594;</span>}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Invalid transitions (like PAID &#8594; CREATED) are rejected with an error.
          </p>
        </div>
      </div>
    </div>
  );
}
