import React, { useState } from 'react';
import { Search, ChevronRight, Zap, ShieldCheck, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/restaurants');
    }
  };

  return (
    <div className="space-y-24 animate-fade-in">
      {/* Hero Section */}
      <section className="relative px-8 pt-16 flex flex-col items-center text-center space-y-10 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-100/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-primary-200/40 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-tight">
          Cravings Delivered <br />
          <span className="text-primary-600 italic">Lightning Fast.</span>
        </h1>
        
        <p className="max-w-2xl text-lg text-slate-500 font-medium leading-relaxed">
          The best food from top-rated restaurants in your city, delivered to your doorstep in minutes. Experience premium dining at home.
        </p>

        <form 
          onSubmit={handleSearch}
          className="w-full max-w-2xl bg-white p-2 rounded-2xl shadow-2xl shadow-primary-100 flex items-center space-x-2 border border-slate-100"
        >
          <div className="flex-1 flex items-center px-4 space-x-3 border-r border-slate-100">
            <Search className="text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search for dishes or restaurants..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-slate-700 font-medium py-3 outline-none"
            />
          </div>
          <button type="submit" className="btn-primary flex items-center space-x-2">
            <span>Explore Now</span>
            <ChevronRight size={18} />
          </button>
        </form>

        <div className="flex flex-wrap justify-center gap-3">
          {['Pizza', 'Burger', 'Sushi', 'Italian', 'Indian', 'Healthy'].map((cuisine) => (
            <button 
              key={cuisine}
              onClick={() => navigate(`/restaurants?search=${cuisine}`)}
              className="px-6 py-2 rounded-full bg-white border border-slate-100 text-slate-600 text-sm font-semibold hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm"
            >
              {cuisine}
            </button>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-card p-10 flex flex-col items-center text-center space-y-4 group hover:bg-primary-600 transition-all duration-500 hover:scale-105">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-2 group-hover:bg-white group-hover:scale-110 transition-all">
            <Zap size={32} />
          </div>
          <h3 className="text-xl font-bold group-hover:text-white">Ultra Fast Delivery</h3>
          <p className="text-slate-500 group-hover:text-primary-50 text-sm">Our riders ensure your food arrives hot within minutes.</p>
        </div>
        <div className="glass-card p-10 flex flex-col items-center text-center space-y-4 group hover:bg-primary-600 transition-all duration-500 hover:scale-105">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-2 group-hover:bg-white group-hover:scale-110 transition-all">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold group-hover:text-white">Premium Quality</h3>
          <p className="text-slate-500 group-hover:text-primary-50 text-sm">We partner only with the highest-rated kitchens in your city.</p>
        </div>
        <div className="glass-card p-10 flex flex-col items-center text-center space-y-4 group hover:bg-primary-600 transition-all duration-500 hover:scale-105">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-2 group-hover:bg-white group-hover:scale-110 transition-all">
            <Heart size={32} />
          </div>
          <h3 className="text-xl font-bold group-hover:text-white">Customer First</h3>
          <p className="text-slate-500 group-hover:text-primary-50 text-sm">Dedicated 24/7 support for all your meal-time emergencies.</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 max-w-7xl mx-auto my-20">
        <div className="bg-slate-900 rounded-[3rem] p-16 relative overflow-hidden flex flex-col items-center text-center text-white space-y-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px]"></div>
          <h2 className="text-4xl md:text-5xl font-black max-w-2xl leading-tight">Ready to taste the <span className="text-primary-400">extraordinary?</span></h2>
          <p className="text-slate-400 max-w-sm">Join thousands of foodies ordering from QuickBite every single day.</p>
          <Link to="/restaurants" className="btn-primary">View All Restaurants</Link>
        </div>
      </section>
    </div>
  );
};
