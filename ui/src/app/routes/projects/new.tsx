import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ProjectWizard } from '@/containers/project/components/wizard';
import { useProjectStore } from '@/containers/project';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProjectConfig } from '@/containers/project/types';

export const Route = createFileRoute('/projects/new')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { createProject } = useProjectStore();
  const [isCreating, setIsCreating] = useState(false);

  const handleSave = async (config: ProjectConfig) => {
    setIsCreating(true);
    try {
      await createProject(config);
      // Navigate back to projects list after successful creation
      navigate({ to: '/projects' });
    } catch (error) {
      // Failed to create project, error is already handled by alert
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    navigate({ to: '/projects' });
  };

  return (
    <ProtectedRoute>
      <ProjectWizard
        initialConfig={undefined}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isCreating}
      />
    </ProtectedRoute>
  );
}
