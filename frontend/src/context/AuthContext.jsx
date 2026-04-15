import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    // Initial sync load from localStorage for UI persistence (name, email)
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    // Verification Loop: JWT is the source of truth for Role/ID
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Decode JWT payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Update state: verify role and id from JWT, keeping name/email from local storage if available
      setUser(prev => ({
        ...prev,
        id: payload.id,
        role: payload.role
      }));

    } catch (err) {
      console.error("Auth verification failed:", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user: userData } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(token);
      setUser(userData);
      
      return userData;

    } catch (err) {
      throw err;
    }
  };

  const signup = async (name, email, password) => {
    try {
      await api.post('/auth/signup', { name, email, password });
      return login(email, password);
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
