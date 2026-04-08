import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Order } from '../types';
import { OrderStatus } from '../types';
import { orderService } from '../services/api';
import { CheckCircle2, Clock, Truck, UtensilsCrossed, Package, Ban, Loader2, Home } from 'lucide-react';

const statusStep = {
  [OrderStatus.CREATED]: 0,
  [OrderStatus.CONFIRMED]: 1,
  [OrderStatus.PREPARING]: 2,
  [OrderStatus.OUT_FOR_DELIVERY]: 3,
  [OrderStatus.DELIVERED]: 4,
  [OrderStatus.CANCELLED]: -1,
};

const steps = [
  { label: 'Created', icon: Package, key: OrderStatus.CREATED },
  { label: 'Confirmed', icon: CheckCircle2, key: OrderStatus.CONFIRMED },
  { label: 'Preparing', icon: UtensilsCrossed, key: OrderStatus.PREPARING },
  { label: 'Delivery', icon: Truck, key: OrderStatus.OUT_FOR_DELIVERY },
  { label: 'Enjoy!', icon: Home, key: OrderStatus.DELIVERED },
];

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    const fetchOrder = async () => {
      try {
        if (!id) return;
        const data = await orderService.getOrder(id);
        setOrder(data);
      } catch (err) {
        console.error("Order not found");
        // Mocking order for demo
        setOrder({
          id: id || 'ORD-1234',
          customerId: 'c1',
          restaurantId: 'r1',
          status: OrderStatus.CREATED,
          totalAmount: 499,
          orderDate: new Date().toISOString(),
          items: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Mock "Real-time" updates
    const interval = setInterval(() => {
      setOrder(prev => {
        if (!prev) return null;
        const currentIdx = Object.values(OrderStatus).indexOf(prev.status);
        if (currentIdx < Object.values(OrderStatus).length - 2 && prev.status !== OrderStatus.CANCELLED) {
          const nextStatus = Object.values(OrderStatus)[currentIdx + 1] as OrderStatus;
          return { ...prev, status: nextStatus };
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen text-primary-600">
      <Loader2 className="animate-spin mb-4" size={48} />
      <span>Tracking your meal...</span>
    </div>
  );

  if (!order) return <div className="text-center p-20">Order not found</div>;

  const currentStep = statusStep[order.status];

  return (
    <div className="px-8 max-w-2xl mx-auto py-16 animate-fade-in text-center">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 leading-tight">Order #{order.id}</h2>
        <p className="text-slate-500 mt-2 font-medium">Sit back and relax. Your delicious meal is on its way!</p>
      </div>

      {/* Main Status Display */}
      <div className="glass-card p-10 mb-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        
        {order.status === OrderStatus.CANCELLED ? (
          <div className="flex flex-col items-center space-y-4 py-8">
            <Ban size={64} className="text-slate-400" />
            <h3 className="text-2xl font-bold text-slate-700">Order Cancelled</h3>
            <p className="text-slate-500">Unfortunately, your order was cancelled.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="text-primary-600 font-black text-xl tracking-widest uppercase animate-pulse">
              {order.status.replace(/_/g, ' ')}
            </div>

            {/* Tracker UI */}
            <div className="relative flex justify-between items-center max-w-md mx-auto">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2 z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-[2px] bg-primary-600 -translate-y-1/2 z-0 transition-all duration-1000" 
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-slate-100 text-slate-300'
                    } ${isCurrent ? 'scale-125 ring-4 ring-white' : ''}`}>
                      <Icon size={20} />
                    </div>
                    <span className={`text-[10px] mt-3 font-bold uppercase tracking-widest ${
                      isActive ? 'text-primary-600' : 'text-slate-300'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <Link to="/restaurants" className="flex-1 btn-primary py-4">Keep Browsing</Link>
        <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-4 rounded-xl font-semibold transition-all">Support</button>
      </div>
    </div>
  );
};
