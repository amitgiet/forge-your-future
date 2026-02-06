import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../lib/apiService';

interface User {
  _id: string;
  name: string;
  email: string;
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
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        subscription: { plan: 'free' }
      });
      setLoading(false);
      return;
    }

    try {
      const response = await apiService.auth.getProfile();
      if (response.data.success) {
        setUser(response.data.data);
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
      navigate('/onboarding');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
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
