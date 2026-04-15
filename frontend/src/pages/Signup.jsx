import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await signup(name, email, password);
      // Navigate based on role (defaulting to customer as per signup logic)
      const target = user.role === 'ADMIN' ? '/admin' : '/customer';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-4xl mb-4 block">🚀</span>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Join QuickBite
          </h1>
          <p className="text-sm text-gray-400 mt-2">Start your delicious journey today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-1 px-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none p-3 rounded-xl text-sm transition-all text-white"
              placeholder="Alex Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-1 px-1">Email Address</label>
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
            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-widest block mb-1 px-1">Password</label>
            <input
              type="password"
              required
              className="w-full bg-gray-800 border border-gray-700 focus:border-blue-500 outline-none p-3 rounded-xl text-sm transition-all text-white"
              placeholder="•••••••• (Min 6 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-4"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8 font-medium">
          Already a member? <Link to="/login" className="text-blue-400 hover:text-blue-300 ml-1">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
