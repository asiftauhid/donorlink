'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
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
  login: (
    email: string,
    password: string,
    userType: 'donor' | 'clinic'
  ) => Promise<void>;
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
  // Try to get user from localStorage first
  const storedUserJSON = typeof window !== 'undefined' ? localStorage.getItem('donorlink_user') : null;
  const storedUser = storedUserJSON ? JSON.parse(storedUserJSON) : null;
  
  const [user, setUser] = useState<User>(storedUser);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const router = useRouter();

  const checkAuthStatus = async () => {
    // Don't set loading=true again if we already have a stored user
    if (!storedUser) {
      setLoading(true);
    }
    
    try {
      const response = await fetch('/api/auth/status', {
        method: 'GET',
        credentials: 'include',
      });

      console.log('[AUTH] status response', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[AUTH] logged in user:', data.user);
        setUser(data.user);
        localStorage.setItem('donorlink_user', JSON.stringify(data.user));
      } else if (response.status === 401) {
        console.warn('[AUTH] Not authenticated.');
        setUser(null);
        localStorage.removeItem('donorlink_user');
      } else {
        fallbackToLocal();
      }
    } catch (error) {
      console.error('[AUTH] Network error or server issue:', error);
      fallbackToLocal();
    } finally {
      // Add a smooth fade out transition
      setFadeOut(true);
      setTimeout(() => {
        setLoading(false);
        setFadeOut(false);
      }, 300); // Match this with CSS transition duration
    }
  };

  const fallbackToLocal = () => {
    const storedUser = localStorage.getItem('donorlink_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('donorlink_user');
      }
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (
    email: string,
    password: string,
    userType: 'donor' | 'clinic'
  ) => {
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
      setFadeOut(true);
      setTimeout(() => {
        setLoading(false);
        setFadeOut(false);
      }, 300);
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
      setFadeOut(true);
      setTimeout(() => {
        setLoading(false);
        setFadeOut(false);
      }, 300);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
      {loading && (
        <div 
          className={`fixed inset-0 bg-gradient-to-b from-red-50 to-white flex flex-col items-center justify-center z-50 transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="flex flex-col items-center gap-6">
            {/* Heartbeat animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 rounded-full opacity-20 animate-ping" style={{ animationDuration: '1.5s' }}></div>
              <div className="relative w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="text-xl font-medium text-gray-800">
              Loading <span className="text-red-600 font-bold">DonorLink</span>...
            </div>
            
            {/* Animated loading dots that match your brand style */}
            <div className="flex space-x-3 mt-2">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-3 h-3 bg-red-600 rounded-full"
                  style={{ 
                    animation: 'bounce 1.4s infinite ease-in-out',
                    animationDelay: `${i * 0.16}s`,
                    opacity: 0.7
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 
          40% { 
            transform: scale(1.0);
          }
        }
      `}</style>
    </AuthContext.Provider>
  );
};