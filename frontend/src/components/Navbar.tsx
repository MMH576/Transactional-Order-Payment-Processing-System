'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold flex items-center gap-2">
              <span className="text-2xl">&#128230;</span>
              <span>OrderFlow</span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/architecture" className="hover:text-blue-400 transition">
                Architecture
              </Link>
              <Link href="/demo" className="hover:text-blue-400 transition">
                Live Demo
              </Link>
              {user && (
                <>
                  <Link href="/orders" className="hover:text-blue-400 transition">
                    My Orders
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="hover:text-blue-400 transition">
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <Link
                href="/checkout"
                className="relative hover:text-blue-400 transition"
              >
                <span className="text-xl">&#128722;</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-300 hidden sm:block">
                  {user.email}
                  {user.role === 'ADMIN' && (
                    <span className="ml-2 px-2 py-0.5 bg-purple-600 text-xs rounded">Admin</span>
                  )}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-600 px-3 py-1.5 rounded text-sm hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
