import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../lib/apiService';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  profile?: {
    preferredLanguage?: 'en' | 'hi';
  };
  subscription?: {
    plan: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updater: User | null | ((current: User | null) => User | null)) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const syncPreferredLanguage = (lang?: string) => {
    if (lang === 'en' || lang === 'hi') {
      localStorage.setItem('preferredLanguage', lang);
      window.dispatchEvent(new Event('preferred-language-changed'));
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiService.auth.getProfile();
      if (response.data.success) {
        const profile = response.data.data;
        setUser(profile);
        syncPreferredLanguage(profile?.profile?.preferredLanguage);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiService.auth.login({ email, password });
    
    if (response.data.success) {
      if (response.data.token) {
        // Compatibility token for legacy flows; cookie is the primary web auth session.
        localStorage.setItem('token', response.data.token);
      }
      setUser(response.data.user);
      syncPreferredLanguage(response.data.user?.profile?.preferredLanguage);
      
      navigate('/app/dashboard');
    }
  };

  const signup = async (name: string, email: string, password: string, phone?: string) => {
    const response = await apiService.auth.register({ name, email, password, phone });
    
    if (response.data.success) {
      if (response.data.token) {
        // Compatibility token for legacy flows; cookie is the primary web auth session.
        localStorage.setItem('token', response.data.token);
      }
      setUser(response.data.user);
      syncPreferredLanguage(response.data.user?.profile?.preferredLanguage);
      navigate('/app/dashboard');
    }
  };

  const logout = async () => {
    try {
      await apiService.auth.logout();
    } catch (error) {
      // Even if the server call fails, clear local auth state.
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('preferredLanguage');
      setUser(null);
      navigate('/app/login');
    }
  };

  const updateUser = (updater: User | null | ((current: User | null) => User | null)) => {
    setUser((current) => {
      const nextUser = typeof updater === 'function' ? updater(current) : updater;
      syncPreferredLanguage(nextUser?.profile?.preferredLanguage);
      return nextUser;
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
        updateUser,
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
