import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      // Navigate based on role
      const target = user.role === 'ADMIN' ? '/admin' : '/customer';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">🍔</span>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-sm text-gray-400 mt-2">Login to your QuickBite account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-2 px-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none p-3 rounded-xl text-sm transition-all text-white"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-2 px-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none p-3 rounded-xl text-sm transition-all text-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          Don't have an account? <Link to="/signup" className="text-blue-400 hover:text-blue-300 ml-1">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
