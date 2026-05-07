import { createFileRoute } from '@tanstack/react-router';
import ProjectLayout from '@/containers/project/components/ProjectLayout';
import { AppSettingsPage } from '@/containers/settings/components/AppSettingsPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export const Route = createFileRoute('/settings/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <ProjectLayout>
        <AppSettingsPage />
      </ProjectLayout>
    </ProtectedRoute>
  );
}
