import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from './store';
import { authService } from './services/authService';

export function useAuthGuard() {
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, setUser, setToken } = useStore();

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getStoredToken();
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // Verify token with backend
        const response = await authService.verifyToken(token);
        if (response.success && response.user) {
          setUser(response.user);
          setToken(token);
          setIsAuthenticated(true);
        } else {
          throw new Error('Invalid token');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        router.push('/login');
      }
    };

    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, router, setIsAuthenticated, setUser, setToken]);

  return isAuthenticated;
}

export function useAuthInit() {
  const { setIsAuthenticated, setUser, setToken } = useStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getStoredToken();
      
      if (token) {
        try {
          const response = await authService.verifyToken(token);
          if (response.success && response.user) {
            setUser(response.user);
            setToken(token);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Auth init failed:', error);
          localStorage.removeItem('token');
        }
      }
    };

    initAuth();
  }, [setIsAuthenticated, setUser, setToken]);
}