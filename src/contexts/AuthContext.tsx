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
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  demoLogin: () => void;
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
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    // Demo mode - bypass API call
    if (token === 'demo-token-12345') {
      setUser({
        _id: 'demo-user',
        name: 'Demo User',
        email: 'demo@neetforge.com',
        profile: { preferredLanguage: 'en' },
        subscription: { plan: 'free' }
      });
      syncPreferredLanguage('en');
      setLoading(false);
      return;
    }

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
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      syncPreferredLanguage(response.data.user?.profile?.preferredLanguage);
      
      // Check onboarding status
      if (response.data.user.onboardingCompleted === false) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await apiService.auth.register({ name, email, password });
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      syncPreferredLanguage(response.data.user?.profile?.preferredLanguage);
      navigate('/onboarding');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('preferredLanguage');
    setUser(null);
    navigate('/login');
  };

  const demoLogin = () => {
    localStorage.setItem('token', 'demo-token-12345');
    const demoUser: User = {
      _id: 'demo-user',
      name: 'Demo User',
      email: 'demo@neetforge.com',
      subscription: { plan: 'free' }
    };
    setUser(demoUser);
    navigate('/dashboard');
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
