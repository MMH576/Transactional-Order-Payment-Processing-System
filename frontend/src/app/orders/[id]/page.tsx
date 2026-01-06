'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { orders } from '@/lib/api';
import { Order } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ApiEndpointBadge, TransactionBlock, DatabaseOperation } from '@/components/BackendShowcase';

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id as string;
  const simulated = searchParams.get('simulated') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
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

  const handleSimulatePayment = async () => {
    if (!order) return;
    setActionLoading(true);
    setActionMessage(null);

    // Animate through operations
    const ops = ['validate', 'update-status', 'update-inventory', 'audit'];
    for (const op of ops) {
      setActiveOperation(op);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      await orders.simulatePayment(order.id);
      setActiveOperation(null);
      setActionMessage({ type: 'success', text: 'Payment simulated successfully! Order is now PAID.' });
      loadOrder(); // Reload to show updated status
    } catch (err: any) {
      setActiveOperation(null);
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to simulate payment'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleFulfillOrder = async () => {
    if (!order) return;
    setActionLoading(true);
    setActionMessage(null);

    // Animate through operations
    const ops = ['validate-fulfill', 'update-fulfill', 'audit-fulfill'];
    for (const op of ops) {
      setActiveOperation(op);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      await orders.fulfillOrder(order.id);
      setActiveOperation(null);
      setActionMessage({ type: 'success', text: 'Order fulfilled successfully!' });
      loadOrder(); // Reload to show updated status
    } catch (err: any) {
      setActiveOperation(null);
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to fulfill order'
      });
    } finally {
      setActionLoading(false);
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
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-slate-800">
                  Order Details
                </h1>
                <ApiEndpointBadge method="GET" path={`/orders/${orderId}`} />
              </div>
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
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
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

          {/* Backend State Machine Explanation */}
          <div className="bg-slate-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">State Machine Implementation</h3>
              <span className="text-xs text-slate-400 font-mono">orders.service.ts</span>
            </div>
            <pre className="text-xs text-green-400 font-mono bg-slate-950 p-3 rounded overflow-x-auto">
{`// Finite State Machine for Order Status
const ORDER_STATE_MACHINE = {
  CREATED: {
    allowedTransitions: ['PAYMENT_PENDING', 'CANCELLED'],
    onEnter: async (order) => {
      // Reserve inventory atomically
      await this.reserveInventory(order.items);
    }
  },
  PAYMENT_PENDING: {
    allowedTransitions: ['PAID', 'CANCELLED'],
    onExit: async (order, newStatus) => {
      if (newStatus === 'CANCELLED') {
        // Rollback inventory reservation
        await this.releaseInventory(order.items);
      }
    }
  },
  PAID: {
    allowedTransitions: ['FULFILLED'],
    onEnter: async (order) => {
      // Finalize inventory (remove from reserved)
      await this.finalizeInventory(order.items);
    }
  },
  FULFILLED: {
    allowedTransitions: [], // Terminal state
  },
  CANCELLED: {
    allowedTransitions: [], // Terminal state
  }
};`}
            </pre>
          </div>
        </div>

        {/* Demo Actions - Simulate State Transitions */}
        {(order.status === 'PAYMENT_PENDING' || order.status === 'PAID') && (
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Action Buttons */}
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-purple-800">
                  Demo Actions
                </h2>
                {order.status === 'PAYMENT_PENDING' && (
                  <ApiEndpointBadge method="POST" path={`/orders/${orderId}/simulate-payment`} />
                )}
                {order.status === 'PAID' && (
                  <ApiEndpointBadge method="POST" path={`/orders/${orderId}/fulfill`} />
                )}
              </div>
              <p className="text-sm text-purple-700 mb-4">
                Simulate order state transitions to see the full flow. In production, these would be triggered by Stripe webhooks and admin actions.
              </p>

              {actionMessage && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  actionMessage.type === 'success'
                    ? 'bg-green-100 text-green-800 border border-green-200'
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {actionMessage.text}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                {order.status === 'PAYMENT_PENDING' && (
                  <button
                    onClick={handleSimulatePayment}
                    disabled={actionLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:bg-slate-400 transition flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Processing...
                      </>
                    ) : (
                      <>Simulate Payment Success</>
                    )}
                  </button>
                )}

                {order.status === 'PAID' && user?.role === 'ADMIN' && (
                  <button
                    onClick={handleFulfillOrder}
                    disabled={actionLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-400 transition flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Processing...
                      </>
                    ) : (
                      <>Mark as Fulfilled</>
                    )}
                  </button>
                )}

                {order.status === 'PAID' && user?.role !== 'ADMIN' && (
                  <p className="text-sm text-purple-600">
                    Login as admin to fulfill orders. (admin@example.com / admin123)
                  </p>
                )}
              </div>
            </div>

            {/* Backend Operations Visualization */}
            <div className="bg-slate-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Backend Operations</h3>
                <span className="text-xs text-slate-400 font-mono">OrdersService</span>
              </div>

              {order.status === 'PAYMENT_PENDING' && (
                <TransactionBlock status={actionLoading ? 'active' : 'pending'}>
                  <DatabaseOperation
                    operation="SELECT"
                    table="orders"
                    description="Validate state: PAYMENT_PENDING → PAID allowed"
                    isActive={activeOperation === 'validate'}
                  />
                  <DatabaseOperation
                    operation="UPDATE"
                    table="orders"
                    description="Set status = 'PAID'"
                    isActive={activeOperation === 'update-status'}
                  />
                  <DatabaseOperation
                    operation="UPDATE"
                    table="inventory"
                    description="Decrement reserved_quantity (finalize reservation)"
                    isActive={activeOperation === 'update-inventory'}
                  />
                  <DatabaseOperation
                    operation="INSERT"
                    table="audit_logs"
                    description="Log state transition with actor"
                    isActive={activeOperation === 'audit'}
                  />
                </TransactionBlock>
              )}

              {order.status === 'PAID' && (
                <TransactionBlock status={actionLoading ? 'active' : 'pending'}>
                  <DatabaseOperation
                    operation="SELECT"
                    table="orders"
                    description="Validate state: PAID → FULFILLED allowed"
                    isActive={activeOperation === 'validate-fulfill'}
                  />
                  <DatabaseOperation
                    operation="UPDATE"
                    table="orders"
                    description="Set status = 'FULFILLED'"
                    isActive={activeOperation === 'update-fulfill'}
                  />
                  <DatabaseOperation
                    operation="INSERT"
                    table="audit_logs"
                    description="Log fulfillment with admin actor"
                    isActive={activeOperation === 'audit-fulfill'}
                  />
                </TransactionBlock>
              )}

              {/* Code Preview */}
              <div className="mt-4">
                <div className="text-xs text-slate-400 mb-2">State Machine Validation:</div>
                <pre className="text-xs text-green-400 font-mono bg-slate-950 p-3 rounded overflow-x-auto">
{`// State machine enforces valid transitions
const VALID_TRANSITIONS = {
  CREATED: ['PAYMENT_PENDING', 'CANCELLED'],
  PAYMENT_PENDING: ['PAID', 'CANCELLED'],
  PAID: ['FULFILLED'],
  FULFILLED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

async updateStatus(orderId, newStatus, actorId) {
  const order = await this.findById(orderId);

  if (!VALID_TRANSITIONS[order.status].includes(newStatus)) {
    throw new BadRequestException(
      \`Cannot transition from \${order.status} to \${newStatus}\`
    );
  }
  // ... update with audit log
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Order Complete */}
        {order.status === 'FULFILLED' && (
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-green-50 rounded-xl border border-green-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">&#10004;</span>
                <div>
                  <h2 className="text-lg font-semibold text-green-800">Order Complete!</h2>
                  <p className="text-sm text-green-700">
                    This order has been fully processed through all state transitions.
                  </p>
                </div>
              </div>
              <div className="bg-green-100 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">Full Lifecycle Completed:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>&#10003; Order created with inventory reservation</li>
                  <li>&#10003; Payment processed successfully</li>
                  <li>&#10003; Reserved inventory finalized</li>
                  <li>&#10003; Order marked as fulfilled by admin</li>
                  <li>&#10003; All transitions logged in audit trail</li>
                </ul>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-4">Completed Transaction Flow</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-green-600 text-white px-2 py-0.5 rounded font-mono text-xs">CREATED</span>
                  <span className="text-slate-500">&#8594;</span>
                  <span className="bg-yellow-600 text-white px-2 py-0.5 rounded font-mono text-xs">PAYMENT_PENDING</span>
                  <span className="text-slate-500">&#8594;</span>
                  <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-mono text-xs">PAID</span>
                  <span className="text-slate-500">&#8594;</span>
                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-mono text-xs">FULFILLED</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="text-xs text-slate-400 mb-2">Audit Trail Created:</div>
                <pre className="text-xs text-green-400 font-mono bg-slate-950 p-3 rounded overflow-x-auto">
{`// Each state transition creates an audit log
await this.auditService.log({
  entityType: 'ORDER',
  entityId: order.id,
  action: 'STATUS_CHANGE',
  oldValue: { status: oldStatus },
  newValue: { status: newStatus },
  actorId: userId,
  metadata: { timestamp: new Date() }
});`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/orders"
            className="bg-slate-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-700 transition"
          >
            View All Orders
          </Link>
          <Link
            href="/demo"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Continue Shopping
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
