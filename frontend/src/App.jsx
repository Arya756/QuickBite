import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPortal from './pages/AdminPortal';
import CustomerPortal from './pages/CustomerPortal';

function AppLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] group-hover:scale-110 transition-transform">
              🍔
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-white leading-none">QuickBite</h1>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest mt-1 opacity-80">{user?.role} PORTAL</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-200">{user?.name}</span>
              <span className="text-[10px] text-gray-500 font-medium">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 text-sm font-bold rounded-xl transition-all border border-white/5 hover:border-red-500/20 group"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10">
        {children}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center">
        <p className="text-gray-600 text-xs font-medium tracking-widest uppercase">© 2026 QuickBite Technologies • Built for Excellence</p>
      </footer>
    </div>
  );
}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-[0_0_30px_rgba(37,99,235,0.2)]"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Root path redirects to Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Customer Routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute roles={['CUSTOMER']}>
            <AppLayout>
              <CustomerPortal />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AppLayout>
              <AdminPortal />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all route to prevent blank screens */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
