'use client';

import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const inStock = (product.inventory?.availableQuantity ?? 0) > 0;
  const stockCount = product.inventory?.availableQuantity ?? 0;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h2 className="text-lg font-semibold text-slate-800">{product.name}</h2>
        {inStock ? (
          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
            In Stock
          </span>
        ) : (
          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
            Out of Stock
          </span>
        )}
      </div>

      <p className="text-2xl font-bold text-slate-900 mb-2">
        ${parseFloat(product.price).toFixed(2)}
      </p>

      <p className="text-sm text-slate-500 mb-4">
        {stockCount} units available
      </p>

      {product.metadata?.description && (
        <p className="text-sm text-slate-600 mb-4">
          {product.metadata.description}
        </p>
      )}

      <button
        onClick={() => addItem(product)}
        disabled={!inStock || !user}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
      >
        {!user ? 'Login to Buy' : inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
}
