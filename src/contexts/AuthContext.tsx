import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../lib/storage';
import { ensureTokenCache } from '../lib/api';
import apiService from '../lib/apiService';
import { navigate, resetToLogin } from '../navigation/rootRef';

export interface User {
  _id: string;
  name: string;
  email: string;
  onboardingCompleted?: boolean;
  subscription?: { plan: string };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  demoLogin: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    await ensureTokenCache();
    const token = storage.getItemSync('token');

    if (!token) {
      setLoading(false);
      return;
    }

    if (token === 'demo-token-12345') {
      setUser({
        _id: 'demo-user',
        name: 'Demo User',
        email: 'demo@neetforge.com',
        subscription: { plan: 'free' },
      });
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.auth.getProfile();
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch {
      await storage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.auth.login({ email, password });

    if (response.data.success) {
      await storage.setItem('token', response.data.token);
      setUser(response.data.user);

      if (response.data.user.onboardingCompleted === false) {
        navigate('Onboarding');
      } else {
        navigate('Dashboard');
      }
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await apiService.auth.register({ name, email, password });

    if (response.data.success) {
      await storage.setItem('token', response.data.token);
      setUser(response.data.user);
      navigate('Onboarding');
    }
  };

  const logout = () => {
    storage.removeItem('token').then(() => {
      setUser(null);
      resetToLogin();
    });
  };

  const demoLogin = () => {
    storage.setItem('token', 'demo-token-12345').then(() => {
      const demoUser: User = {
      _id: 'demo-user',
      name: 'Demo User',
      email: 'demo@neetforge.com',
      subscription: { plan: 'free' },
      };
      setUser(demoUser);
      navigate('Dashboard');
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        demoLogin,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
