'use client';

import { useEffect, useState } from 'react';
import { products } from '@/lib/api';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ApiEndpointBadge } from '@/components/BackendShowcase';
import Link from 'next/link';

export default function DemoPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showApiInfo, setShowApiInfo] = useState(false);
  const { user } = useAuth();
  const { items, total, itemCount } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setShowApiInfo(true);
    try {
      const res = await products.getAll();
      setProductList(res.data);
    } catch (err) {
      setError('Failed to load products. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Loading products...</p>
            <div className="mt-4">
              <ApiEndpointBadge method="GET" path="/products" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">&#9888;</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Connection Error</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={loadProducts}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Live Demo</h1>
        <p className="text-slate-600 mb-4">
          Browse products, add them to your cart, and complete a checkout to see the transactional system in action.
        </p>

        {/* API Call Indicator */}
        {showApiInfo && (
          <div className="bg-slate-900 rounded-lg p-4 inline-block">
            <div className="flex items-center gap-3">
              <span className="text-green-400 text-sm">&#10003; API Response</span>
              <ApiEndpointBadge method="GET" path="/products" />
              <span className="text-slate-400 text-sm">{productList.length} products loaded</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Backend Info Panel */}
          <div className="bg-slate-900 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">Backend: ProductsController</h3>
              <span className="text-xs text-slate-400 font-mono">src/products/products.controller.ts</span>
            </div>
            <pre className="text-sm text-green-400 font-mono bg-slate-950 p-3 rounded overflow-x-auto">
{`@Get()
async findAll() {
  return this.prisma.product.findMany({
    include: { inventory: { select: { availableQuantity: true } } }
  });
}`}
            </pre>
            <p className="text-slate-400 text-xs mt-2">
              Simple query with Prisma ORM - includes inventory for stock display
            </p>
          </div>

          {productList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-600">No products available. Run the database seed to add products.</p>
              <code className="text-sm bg-slate-100 px-2 py-1 rounded mt-2 inline-block">
                npm run prisma:seed
              </code>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {productList.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
            <h2 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
              <span>&#128722;</span> Your Cart
              {itemCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </h2>

            {!user ? (
              <div className="text-center py-6">
                <p className="text-slate-600 mb-4">Please login to add items to cart</p>
                <Link
                  href="/login"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Login
                </Link>
                <div className="mt-4 text-xs text-slate-500">
                  <p>Test credentials:</p>
                  <code className="bg-slate-100 px-1">customer@example.com</code>
                  <code className="bg-slate-100 px-1 ml-1">customer123</code>
                </div>
              </div>
            ) : items.length === 0 ? (
              <p className="text-slate-500 text-center py-6">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{item.product.name}</p>
                        <p className="text-slate-500 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-slate-800">
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">Total</span>
                    <span className="font-bold text-xl text-slate-900">${total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{itemCount} item(s)</p>
                </div>

                <Link
                  href="/checkout"
                  className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition text-center"
                >
                  Proceed to Checkout
                </Link>
              </>
            )}
          </div>

          {/* Backend Explanation Box */}
          <div className="mt-6 bg-slate-900 rounded-xl p-4 text-white">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <span className="text-yellow-400">&#9889;</span> What happens at checkout?
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded font-mono">LOCK</span>
                <p className="text-slate-300">SELECT ... FOR UPDATE locks inventory rows</p>
              </div>

              <div className="flex items-start gap-2">
                <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded font-mono">CHECK</span>
                <p className="text-slate-300">Validate sufficient stock for each item</p>
              </div>

              <div className="flex items-start gap-2">
                <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded font-mono">INSERT</span>
                <p className="text-slate-300">Create order + order_items atomically</p>
              </div>

              <div className="flex items-start gap-2">
                <span className="bg-yellow-600 text-white text-xs px-1.5 py-0.5 rounded font-mono">UPDATE</span>
                <p className="text-slate-300">Reserve inventory (decrement available)</p>
              </div>

              <div className="flex items-start gap-2">
                <span className="bg-emerald-600 text-white text-xs px-1.5 py-0.5 rounded font-mono">COMMIT</span>
                <p className="text-slate-300">All or nothing - transaction completes</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-700">
              <p className="text-xs text-slate-400">
                This uses <code className="text-green-400">Serializable</code> isolation level to prevent race conditions.
              </p>
            </div>
          </div>

          {/* Database Schema Preview */}
          <div className="mt-4 bg-slate-800 rounded-xl p-4">
            <h3 className="text-white font-medium mb-2 text-sm">Key Tables</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-blue-400">orders</span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-400">id, userId, status, totalAmount</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">order_items</span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-400">orderId, productId, quantity, price</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">inventory</span>
                <span className="text-slate-500">→</span>
                <span className="text-slate-400">productId, available, reserved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
