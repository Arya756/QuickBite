import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { restaurantService } from '../services/api';
import { MenuItemCard } from '../components/Cards';
import type { Restaurant } from '../types';
import { Star, Clock, MapPin, Loader2, ChevronLeft } from 'lucide-react';

export const RestaurantDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        if (!id) return;
        const data = await restaurantService.getRestaurantById(id);
        setRestaurant(data);
      } catch (err) {
        console.error("Failed to fetch restaurant", err);
        // Mock data for demo
        setRestaurant({
          id: id || '1',
          name: 'Burger King',
          address: 'Connaught Place, Delhi',
          ownerId: 'o1',
          isOpen: true,
          rating: 4.2,
          deliveryTime: '20-30 min',
          menu: [
            { id: 'm1', name: 'Whopper Burger', description: 'Our signature flame-grilled beef burger.', price: 199, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', isAvailable: true },
            { id: 'm2', name: 'Crispy Chicken', description: 'Crispy chicken patty with fresh lettuce.', price: 159, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', isAvailable: true },
            { id: 'm3', name: 'French Fries', description: 'Golden crispy potato fries.', price: 99, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', isAvailable: true }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-primary-600">
        <Loader2 className="animate-spin mb-4" size={48} />
        <span className="font-bold tracking-widest uppercase text-xs">Loading Menu...</span>
      </div>
    );
  }

  if (!restaurant) return <div>Restaurant not found</div>;

  return (
    <div className="flex-1 animate-fade-in">
      <div className="relative h-64 md:h-80 bg-slate-900">
        <img 
          src={restaurant.menu[0]?.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'} 
          className="w-full h-full object-cover opacity-60"
          alt={restaurant.name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 max-w-7xl mx-auto w-full">
          <Link to="/restaurants" className="flex items-center text-white/80 hover:text-white mb-4 transition-colors">
            <ChevronLeft size={20} />
            <span>Back to Restaurants</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white">{restaurant.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-white/90">
            <div className="flex items-center space-x-2 bg-primary-600 px-3 py-1 rounded-lg">
              <Star size={16} className="fill-white" />
              <span className="font-bold">{restaurant.rating}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={18} />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin size={18} />
              <span>{restaurant.address}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 border-l-4 border-primary-600 pl-4 uppercase tracking-wider">Most Popular</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restaurant.menu.map(item => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
