import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import NotFoundComponent from '@/components/NotFoundComponent';
import { ToastProvider } from '@/contexts/ToastContext';
import { DevTools } from '@/components/DevTools';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <ToastProvider>
      <Outlet />
      <DevTools />
    </ToastProvider>
  );
}
