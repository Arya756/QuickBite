import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    try {
      if (items.length === 0) return;
      // For demo, we use a mock customer ID
      const order = await orderService.createOrder('cust-123', items[0]?.menuItem?.id as string); 
      // In a real app, we'd send all items. Our simplified API takes one restaurant.
      clearCart();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      console.error("Checkout failed", err);
      // For demo, just navigate to a mock tracking page if API fails
      navigate('/orders/mock-order-id');
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6 animate-fade-in">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <ShoppingBag size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-slate-500 max-w-xs text-center">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/restaurants" className="btn-primary">Explore Restaurants</Link>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-8 animate-slide-up">
      <h2 className="text-3xl font-black text-slate-900 mb-8">My Cart</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.menuItem.id} className="glass-card p-4 flex items-center space-x-4">
              <img src={item.menuItem.imageUrl || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200'} alt={item.menuItem.name} className="w-20 h-20 object-cover rounded-xl shadow-sm" />
              <div className="flex-1">
                <h4 className="font-bold text-slate-900">{item.menuItem.name}</h4>
                <p className="text-sm text-slate-500">₹{item.menuItem.price}</p>
              </div>
              <div className="flex items-center space-x-3 bg-slate-100 px-3 py-1.5 rounded-full">
                <button onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)} className="p-1 text-slate-600 hover:text-primary-600">
                  <Minus size={16} />
                </button>
                <span className="font-bold text-slate-800 w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)} className="p-1 text-slate-600 hover:text-primary-600">
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={() => removeFromCart(item.menuItem.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-4">Bill Details</h3>
            <div className="flex justify-between text-slate-600">
              <span>Item Total</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee</span>
              <span>₹40</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Taxes</span>
              <span>₹{Math.round(totalPrice * 0.05)}</span>
            </div>
            <div className="border-t border-slate-100 pt-4 flex justify-between font-bold text-slate-900 text-lg">
              <span>Total Pay</span>
              <span>₹{totalPrice + 40 + Math.round(totalPrice * 0.05)}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full flex items-center justify-center space-x-2 mt-4">
              <span>Proceed to Pay</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
