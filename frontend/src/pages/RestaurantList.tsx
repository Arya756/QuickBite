import React, { useState, useEffect } from 'react';
import { RestaurantCard } from '../components/Cards';
import type { Restaurant } from '../types';
import { restaurantService } from '../services/api';
import { Filter, SlidersHorizontal, Loader2 } from 'lucide-react';

import { useSearchParams } from 'react-router-dom';

export const RestaurantList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const data = await restaurantService.getRestaurants(search);
        setRestaurants(data);
      } catch (err) {
        console.error("Failed to fetch restaurants");
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [search]);

  return (
    <div className="px-8 max-w-7xl mx-auto py-10 space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Top Restaurants Near You</h2>
          <p className="text-slate-500 mt-1">Found {restaurants.length} amazing places to eat.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            <span>Filters</span>
          </button>
          <button className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            <SlidersHorizontal size={16} />
            <span>Sort by</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 text-primary-600">
          <Loader2 className="animate-spin mb-4" size={48} />
          <span className="font-bold tracking-widest uppercase text-xs">Loading Restaurants...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {restaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      )}
    </div>
  );
};
