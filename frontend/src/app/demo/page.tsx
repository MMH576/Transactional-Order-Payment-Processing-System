'use client';

import { useEffect, useState } from 'react';
import { products } from '@/lib/api';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function DemoPage() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const { items, total, itemCount } = useCart();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
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
        <p className="text-slate-600">
          Browse products, add them to your cart, and complete a checkout to see the transactional system in action.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Products Grid */}
        <div className="lg:col-span-3">
          {productList.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-600">No products available. Run the database seed to add products.</p>
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

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-medium text-blue-800 mb-2">&#128161; What happens at checkout?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>1. Inventory is locked (FOR UPDATE)</li>
              <li>2. Stock is validated</li>
              <li>3. Order is created atomically</li>
              <li>4. Stripe payment intent is created</li>
              <li>5. Webhook confirms payment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
