import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';
import PublicHeader from '@/components/NavPublic';
import AuthenticatedHeader from '@/components/NavAuthenticated';
import { useAuth } from '@/contexts/AuthContext';

export const Route = createFileRoute('/_layout')({
  component: Layout,
});

function Layout() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-background">
      {isAuthenticated ? (
        <AuthenticatedHeader activeRoute={location.pathname} />
      ) : (
        <PublicHeader activeRoute={location.pathname} />
      )}
      <div className="flex-1 pt-14">
        <Outlet />
      </div>
    </div>
  );
}
