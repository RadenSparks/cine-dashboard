import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'
import { useEffect, useState } from 'react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check authentication status when location changes
    setIsLoading(true);
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    setIsLoading(false);
  }, [location.pathname]);

  // Prevent flashing of content during redirect
  if (isLoading) {
    return null;
  }

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
