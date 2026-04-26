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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }

    setLoading(true);
    setError('');
    try {
      const user = await login(email.trim(), password);
      navigate(user.role === 'ADMIN' ? '/admin' : '/customer', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0d0805]">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-orange-700/25 blur-[130px] mix-blend-screen animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-700/20 blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[30%] h-[30%] rounded-full bg-amber-600/10 blur-[100px] mix-blend-screen animate-blob" style={{ animationDelay: '4s' }}></div>

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8">
        <div className="glass-card rounded-3xl p-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(234,88,12,0.5)] mx-auto mb-6 hover:scale-110 hover:rotate-6 transition-all duration-300 cursor-default">
              🍔
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-sm text-orange-200/60">Sign in to your QuickBite portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-in zoom-in">
              <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-orange-300/70 tracking-widest px-1">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                className="w-full bg-white/5 border border-white/10 focus:border-orange-500 focus:bg-orange-500/5 focus:shadow-[0_0_20px_rgba(234,88,12,0.1)] outline-none px-4 py-3.5 rounded-xl text-sm transition-all text-white placeholder-white/25 shadow-inner"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-orange-300/70 tracking-widest px-1">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-white/5 border border-white/10 focus:border-orange-500 focus:bg-orange-500/5 focus:shadow-[0_0_20px_rgba(234,88,12,0.1)] outline-none px-4 py-3.5 rounded-xl text-sm transition-all text-white placeholder-white/25 shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-[0_0_25px_rgba(234,88,12,0.35)] active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-orange-400 hover:text-orange-300 font-bold ml-1 transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
