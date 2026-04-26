import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0805] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span className="text-orange-300/70 text-xs font-bold uppercase tracking-widest animate-pulse">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#0d0805] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass-card rounded-3xl p-12 animate-in zoom-in">
          <div className="w-24 h-24 bg-red-900/20 border border-red-500/30 rounded-full flex items-center justify-center text-5xl mb-8 mx-auto">🚫</div>
          <h1 className="text-3xl font-black text-white mb-3 tracking-tight">Access Denied</h1>
          <p className="text-orange-200/60 mb-8 text-sm">
            Role <span className="text-red-400 font-bold font-mono">"{user.role}"</span> cannot access this portal.
          </p>
          <button onClick={() => window.history.back()} className="px-8 py-3 bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 rounded-xl text-sm font-bold transition-all text-white">← Go Back</button>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
