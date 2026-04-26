import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSecret, setAdminSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup, adminSignup } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    if (!name.trim() || name.trim().length < 2) return 'Name must be at least 2 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (isAdmin && !adminSecret.trim()) return 'Admin secret key is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');
    try {
      const user = isAdmin
        ? await adminSignup(name.trim(), email.trim(), password, adminSecret.trim())
        : await signup(name.trim(), email.trim(), password);
      navigate(user.role === 'ADMIN' ? '/admin' : '/customer', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0d0805]">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-red-700/25 blur-[130px] mix-blend-screen animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-orange-700/20 blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[30%] h-[30%] rounded-full bg-amber-600/10 blur-[100px] mix-blend-screen animate-blob" style={{ animationDelay: '4s' }}></div>

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-8">
        <div className="glass-card rounded-3xl p-10">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 bg-gradient-to-br ${isAdmin ? 'from-amber-500 to-orange-600' : 'from-orange-500 to-red-600'} rounded-2xl flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(234,88,12,0.4)] mx-auto mb-6 hover:scale-110 hover:rotate-[-6deg] transition-all duration-300 cursor-default`}>
              {isAdmin ? '🛡️' : '🍕'}
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">Join QuickBite</h1>
            <p className="text-sm text-orange-200/60">Start your delicious journey today</p>
          </div>

          {/* Account type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-white/10 mb-8">
            <button
              type="button"
              onClick={() => { setIsAdmin(false); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${!isAdmin ? 'bg-orange-600 text-white shadow-inner' : 'text-orange-300/60 hover:text-white hover:bg-white/5'}`}
            >
              🍽️ Customer
            </button>
            <button
              type="button"
              onClick={() => { setIsAdmin(true); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-bold transition-all ${isAdmin ? 'bg-amber-700 text-white shadow-inner' : 'text-amber-300/60 hover:text-white hover:bg-white/5'}`}
            >
              🛡️ Admin
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3 animate-in zoom-in">
              <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label className="text-[11px] uppercase font-bold text-orange-300/70 tracking-widest px-1">Full Name</label>
              <input
                type="text"
                required
                autoComplete="name"
                className="w-full bg-white/5 border border-white/10 focus:border-orange-500 focus:bg-orange-500/5 focus:shadow-[0_0_20px_rgba(234,88,12,0.1)] outline-none px-4 py-3.5 rounded-xl text-sm transition-all text-white placeholder-white/25 shadow-inner"
                placeholder="Alex Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full bg-white/5 border border-white/10 focus:border-orange-500 focus:bg-orange-500/5 focus:shadow-[0_0_20px_rgba(234,88,12,0.1)] outline-none px-4 py-3.5 rounded-xl text-sm transition-all text-white placeholder-white/25 shadow-inner"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {password.length > 0 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                          password.length >= (i + 1) * 2
                            ? password.length >= 10 ? 'bg-green-400' : password.length >= 6 ? 'bg-orange-400' : 'bg-red-400'
                            : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="space-y-2 animate-in slide-in-from-bottom-4">
                <label className="text-[11px] uppercase font-bold text-amber-300/70 tracking-widest px-1">Admin Secret Key</label>
                <input
                  type="password"
                  required={isAdmin}
                  className="w-full bg-amber-500/5 border border-amber-500/30 focus:border-amber-500 focus:bg-amber-500/10 focus:shadow-[0_0_20px_rgba(245,158,11,0.1)] outline-none px-4 py-3.5 rounded-xl text-sm transition-all text-white placeholder-amber-300/30 shadow-inner"
                  placeholder="Enter admin secret key..."
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                />
                <p className="text-[11px] text-amber-300/50 px-1">Default dev secret: <code className="font-mono text-amber-300/80">quickbite-admin-2026</code></p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-4 bg-gradient-to-r ${isAdmin ? 'from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 shadow-[0_0_25px_rgba(245,158,11,0.3)]' : 'from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-[0_0_25px_rgba(234,88,12,0.35)]'} disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>{isAdmin ? 'Create Admin Account' : 'Get Started'}</span>
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-8">
            Already a member?{' '}
            <Link to="/login" className="text-orange-400 hover:text-orange-300 font-bold ml-1 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
