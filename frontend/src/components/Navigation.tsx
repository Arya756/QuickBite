import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, LogOut, Search, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass-card mx-4 my-2 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold text-primary-600 tracking-tight">
        Quick<span className="text-slate-900">Bite</span>
      </Link>

      <div className="hidden md:flex items-center space-x-8">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/restaurants" className="nav-link">Restaurants</Link>
        {isAuthenticated && <Link to="/orders/active" className="nav-link">My Orders</Link>}
      </div>

      <div className="flex items-center space-x-5">
        <button className="p-2 text-slate-500 hover:text-primary-600 transition-colors">
          <Search size={22} />
        </button>
        <Link to="/cart" className="p-2 text-slate-500 hover:text-primary-600 transition-colors relative">
          <ShoppingCart size={22} />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
              {totalItems}
            </span>
          )}
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-full">
              <UserIcon size={18} />
              <span className="text-sm font-medium">{user?.firstName || 'User'}</span>
            </div>
            <button onClick={logout} className="p-2 text-slate-500 hover:text-red-600 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="bg-primary-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 py-10 px-8 bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-xl font-bold text-white mb-4 md:mb-0">
          Quick<span className="text-primary-500">Bite</span>
        </div>
        <div className="flex space-x-8 text-sm">
          <a href="#" className="hover:text-white">About Us</a>
          <a href="#" className="hover:text-white">Privacy Policy</a>
          <a href="#" className="hover:text-white">Contact</a>
        </div>
        <div className="mt-4 md:mt-0 text-sm">
          &copy; 2024 QuickBite. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
