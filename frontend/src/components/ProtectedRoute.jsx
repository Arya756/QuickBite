import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Loading Guard: Block rendering until AuthContext resolves verification loop
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(37,99,235,0.2)]"></div>
          <span className="text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Verifying Credentials...</span>
        </div>
      </div>
    );
  }

  // 2. Debug Logging (Temporary for verification)
  console.log("[ProtectedRoute] Verification Check:", {
    requiredRoles: roles,
    currentUserRole: user?.role,
    isAuthorized: roles ? roles.includes(user?.role) : true
  });

  // 3. Unauthenticated Guard
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 4. Role Guard: Strict comparison (Exact match required)
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-red-900/20 border border-red-500/30 rounded-full flex items-center justify-center text-5xl mb-8 mx-auto shadow-[0_0_40px_rgba(239,68,68,0.1)]">
            🚫
          </div>
          <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-widest">Access Denied</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            You don't have the necessary permissions to access this portal. 
            Found role: <span className="text-red-400 font-mono">"{user.role || 'NONE'}"</span>, 
            but expected: <span className="text-blue-400 font-mono">{JSON.stringify(roles)}</span>.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all active:scale-95"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
