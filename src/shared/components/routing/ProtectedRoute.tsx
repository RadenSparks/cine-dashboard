import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated, isTokenExpired } from '@/shared/lib/auth'
import { useEffect, useState } from 'react'
import Loading from '@/shared/components/ui/Loading'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isAuth, setIsAuth] = useState<boolean | null>(null); // null = checking
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Check if token exists locally
      if (!isAuthenticated()) {
        setIsAuth(false);
        setIsLoading(false);
        return;
      }

      // Token exists locally - check if it's actually expired using JWT exp claim
      try {
        const expired = isTokenExpired();
        
        if (expired) {
          // Token is expired, clear it
          localStorage.removeItem('wyvernbox-user-details');
          localStorage.removeItem('wyvernbox-admin-remember');
          setIsAuth(false);
        } else {
          // Token is valid (not expired client-side)
          setIsAuth(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuth(false);
        localStorage.removeItem('wyvernbox-user-details');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [location.pathname]);

  // Show loading spinner while verifying auth
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loading fullscreen={false} />
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
