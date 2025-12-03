import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'
import { useEffect, useState } from 'react'

export default function PublicRoute({ children }: { children: React.ReactNode }) {
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

  // If authenticated, redirect to dashboard
  // But give time for logout animation to complete
  if (isAuth) {
    // Use a small delay to ensure loader completes
    setTimeout(() => {
      return <Navigate to="/" state={{ from: location }} replace />;
    }, 100);
  }

  return <>{children}</>;
}
