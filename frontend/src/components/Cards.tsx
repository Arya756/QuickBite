import React from 'react';
import { Star, Clock, MapPin, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import type { Restaurant, MenuItem } from '../types';

export const RestaurantCard: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => {
  return (
    <Link to={`/restaurants/${restaurant.id}`} className="group glass-card overflow-hidden hover:scale-[1.02] transition-all duration-300">
      <div className="relative h-48 bg-slate-200 overflow-hidden">
        <img 
          src={restaurant.menu[0]?.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'} 
          alt={restaurant.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
          <Star size={14} className="text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-slate-800">{restaurant.rating || '4.5'}</span>
        </div>
        {!restaurant.isOpen && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center font-bold text-white uppercase tracking-widest text-sm backdrop-blur-[2px]">
            Closed
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{restaurant.name}</h3>
        <div className="mt-2 flex items-center space-x-4 text-sm text-slate-500">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{restaurant.deliveryTime || '25-35 min'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin size={14} />
            <span className="truncate">{restaurant.address}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const MenuItemCard: React.FC<{ item: MenuItem }> = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <div className="glass-card p-4 flex items-center justify-between space-x-4 hover:shadow-2xl transition-all duration-300">
      <div className="flex-1">
        <h4 className="text-lg font-semibold text-slate-900">{item.name}</h4>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
        <div className="mt-3 text-lg font-bold text-primary-600">₹{item.price}</div>
      </div>
      <div className="relative w-28 h-28 flex-shrink-0 group">
        <img 
          src={item.imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'}
          alt={item.name} 
          className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-md"
        />
        <button 
          onClick={() => addToCart(item)}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-primary-600 px-4 py-1.5 rounded-full shadow-lg font-bold text-xs border border-primary-100 hover:bg-primary-600 hover:text-white transition-all active:scale-90"
        >
          ADD
        </button>
      </div>
    </div>
  );
};

