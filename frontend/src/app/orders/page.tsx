'use client';

import { useEffect, useState } from 'react';
import { orders } from '@/lib/api';
import { Order } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function OrdersPage() {
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const res = await orders.getMyOrders();
      setOrderList(res.data);
    } catch (err) {
      setError('Failed to load orders');
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
          <p className="text-slate-600 mb-6">Please login to view your orders.</p>
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
            <p className="text-slate-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">My Orders</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {orderList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <div className="text-6xl mb-4">&#128230;</div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">No Orders Yet</h2>
            <p className="text-slate-600 mb-6">You haven't placed any orders yet.</p>
            <Link
              href="/demo"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orderList.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="font-semibold text-slate-800">
                        Order #{order.id.slice(0, 8)}...
                      </h2>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                      ${parseFloat(order.totalAmount).toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {order.orderItems.length} item(s)
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    {order.orderItems.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className="text-sm bg-slate-100 text-slate-600 px-2 py-1 rounded"
                      >
                        {item.product.name} x{item.quantity}
                      </span>
                    ))}
                    {order.orderItems.length > 3 && (
                      <span className="text-sm text-slate-500">
                        +{order.orderItems.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
