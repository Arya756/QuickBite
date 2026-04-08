import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'CUSTOMER',
    address: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/restaurants');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Join QuickBite</h2>
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm italic">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">I am a...</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-orange-500 bg-white"
          >
            <option value="CUSTOMER">Hungry Customer</option>
            <option value="RESTAURANT_OWNER">Restaurant Partner</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-gray-600 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-orange-600 font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
};
