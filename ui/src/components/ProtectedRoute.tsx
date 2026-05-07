import React from 'react';
import { Navigate, useLocation } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Authentication is now enabled
  const DISABLE_AUTH = false;

  if (DISABLE_AUTH) {
    return <>{children}</>;
  }

  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Only redirect to login if we're not already on a login page
    if (!location.pathname.startsWith('/auth/')) {
      return (
        <Navigate to="/auth/login" search={{ redirect: location.pathname }} />
      );
    }
    // If we're already on a login page, just show the login form
    return null;
  }

  return <>{children}</>;
};
