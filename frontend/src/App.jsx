import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPortal from './pages/AdminPortal';
import CustomerPortal from './pages/CustomerPortal';

function AppLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen text-white font-sans selection:bg-orange-500/30 overflow-x-hidden">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-700/20 blur-[120px] mix-blend-screen animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-700/15 blur-[120px] mix-blend-screen animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[40%] w-[25%] h-[25%] rounded-full bg-amber-600/10 blur-[100px] mix-blend-screen animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass border-b-0 border-white/5 px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-2xl shadow-[0_0_30px_rgba(234,88,12,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              🍔
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter text-white leading-none">QuickBite</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
                <span className="text-[10px] text-orange-300 font-bold uppercase tracking-widest opacity-80">{user?.role} PORTAL</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-100">{user?.name}</span>
              <span className="text-[11px] text-orange-300/60 font-medium">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-white/5 hover:bg-orange-500/10 text-gray-300 hover:text-white text-sm font-bold rounded-xl transition-all border border-white/10 hover:border-orange-500/30 hover:shadow-[0_0_20px_rgba(234,88,12,0.1)] group flex items-center gap-2"
            >
              <span>Sign Out</span>
              <svg className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 min-h-[calc(100vh-200px)]">
        {children}
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 text-center mt-12">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent mb-8"></div>
        <p className="text-gray-500 text-xs font-medium tracking-widest uppercase">© 2026 QuickBite Technologies • Served Fresh, Always</p>
      </footer>
    </div>
  );
}

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0805]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-orange-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
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
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
