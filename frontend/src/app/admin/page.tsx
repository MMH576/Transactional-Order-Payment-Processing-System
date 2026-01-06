'use client';

import { useEffect, useState } from 'react';
import { orders, inventory, audit } from '@/lib/api';
import { Order, Inventory, AuditLog } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'audit'>('orders');
  const [orderList, setOrderList] = useState<Order[]>([]);
  const [inventoryList, setInventoryList] = useState<Inventory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData();
    }
  }, [user, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'orders') {
        const res = await orders.getAll();
        setOrderList(res.data);
      } else if (activeTab === 'inventory') {
        const res = await inventory.getAll();
        setInventoryList(res.data);
      } else if (activeTab === 'audit') {
        const res = await audit.getRecent(50);
        setAuditLogs(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
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

  if (user.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">&#128683;</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
          <p className="text-slate-600 mb-6">You need admin privileges to access this page.</p>
          <Link
            href="/demo"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Demo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">
            Manage orders, inventory, and view audit logs.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-200">
          {[
            { id: 'orders', label: 'All Orders', icon: '&#128230;' },
            { id: 'inventory', label: 'Inventory', icon: '&#128230;' },
            { id: 'audit', label: 'Audit Logs', icon: '&#128203;' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-medium transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'
              }`}
            >
              <span dangerouslySetInnerHTML={{ __html: tab.icon }} /> {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="text-center">
              <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Order ID</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Customer</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Status</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Total</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orderList.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <Link href={`/orders/${order.id}`} className="text-blue-600 hover:underline font-mono text-sm">
                            {order.id.slice(0, 8)}...
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {order.user?.email || 'Unknown'}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 font-medium">
                          ${parseFloat(order.totalAmount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orderList.length === 0 && (
                  <div className="text-center py-12 text-slate-500">No orders found</div>
                )}
              </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Product</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Price</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Available</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Reserved</th>
                      <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Total Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inventoryList.map((inv) => (
                      <tr key={inv.productId} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-800">
                          {inv.product.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          ${parseFloat(inv.product.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${inv.availableQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {inv.availableQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-medium ${inv.reservedQuantity > 0 ? 'text-yellow-600' : 'text-slate-400'}`}>
                            {inv.reservedQuantity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {inv.availableQuantity + inv.reservedQuantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {inventoryList.length === 0 && (
                  <div className="text-center py-12 text-slate-500">No inventory found</div>
                )}

                <div className="bg-blue-50 p-4 border-t border-blue-100">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Available = can be purchased | Reserved = locked during checkout pending payment
                  </p>
                </div>
              </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === 'audit' && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-slate-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            log.actionType.includes('CREATED') ? 'bg-green-100 text-green-700' :
                            log.actionType.includes('UPDATED') || log.actionType.includes('CHANGED') ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {log.actionType}
                          </span>
                          <span className="text-sm text-slate-500">
                            {log.entityType}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <div className="text-sm">
                        <span className="text-slate-600">Entity ID: </span>
                        <span className="font-mono text-slate-800">{log.entityId.slice(0, 8)}...</span>
                        {log.actor && (
                          <>
                            <span className="text-slate-600 ml-4">By: </span>
                            <span className="text-slate-800">{log.actor.email}</span>
                          </>
                        )}
                      </div>

                      {(log.beforeState || log.afterState) && (
                        <div className="mt-2 grid md:grid-cols-2 gap-2 text-xs">
                          {log.beforeState && (
                            <div className="bg-red-50 p-2 rounded">
                              <span className="font-medium text-red-700">Before:</span>
                              <pre className="text-red-600 mt-1 overflow-x-auto">
                                {JSON.stringify(log.beforeState, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.afterState && (
                            <div className="bg-green-50 p-2 rounded">
                              <span className="font-medium text-green-700">After:</span>
                              <pre className="text-green-600 mt-1 overflow-x-auto">
                                {JSON.stringify(log.afterState, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {auditLogs.length === 0 && (
                  <div className="text-center py-12 text-slate-500">No audit logs found</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
