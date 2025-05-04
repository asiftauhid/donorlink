'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  userType: 'donor' | 'clinic';
  name: string;
} | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (email: string, password: string, userType: 'donor' | 'clinic') => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/status', { 
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('donorlink_user', JSON.stringify(data.user));
      } else if (response.status === 401) {
        // Explicitly unauthenticated
        setUser(null);
        localStorage.removeItem('donorlink_user');
      } else {
        // Don't assume anything; fall back to localStorage
        fallbackToLocal();
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      fallbackToLocal();
    } finally {
      setLoading(false);
    }
  };

  const fallbackToLocal = () => {
    const storedUser = localStorage.getItem('donorlink_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('donorlink_user');
      }
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string, userType: 'donor' | 'clinic') => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setUser(data.user);
      localStorage.setItem('donorlink_user', JSON.stringify(data.user));

      if (userType === 'clinic') {
        router.push('/dashboard/clinic');
      } else {
        router.push('/dashboard/donor');
      }

    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setUser(null);
      localStorage.removeItem('donorlink_user');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
