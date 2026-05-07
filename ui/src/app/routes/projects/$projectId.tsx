import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import ProjectLayout from '@/containers/project/components/ProjectLayout';
import AnnotationContainer from '@/containers/annotation/AnnotationContainer';
import { useProjectStore } from '@/containers/project';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProjectConfig } from '@/containers/project/types';

export const Route = createFileRoute('/projects/$projectId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const { projects, getProject, refreshProject, isLoading, error } =
    useProjectStore();
  const [project, setProject] = useState<ProjectConfig | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  useEffect(() => {
    const loadProject = async () => {
      setIsLoadingProject(true);
      try {
        // Always refresh from API to get properly converted data
        await refreshProject(projectId);
        const projectData = getProject(projectId);
        setProject(projectData || null);
      } catch (error) {
      } finally {
        setIsLoadingProject(false);
      }
    };

    loadProject();
  }, [projectId, getProject, refreshProject]);

  // Listen for changes to the projects array and update local state
  useEffect(() => {
    const projectData = projects.find((p) => p.id === projectId);
    if (projectData) {
      setProject(projectData);
    }
  }, [projects, projectId]);

  if (isLoadingProject || isLoading) {
    return (
      <ProtectedRoute>
        <ProjectLayout>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading project...</p>
            </div>
          </div>
        </ProjectLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <ProjectLayout>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-destructive mb-2">
                Error Loading Project
              </h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        </ProjectLayout>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <ProjectLayout>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-muted-foreground mb-2">
                Project Not Found
              </h2>
              <p className="text-muted-foreground">
                The project you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </ProjectLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ProjectLayout projectName={project.name}>
        <div className="h-full overflow-hidden">
          <AnnotationContainer projectConfig={project} projectId={projectId} />
        </div>
      </ProjectLayout>
    </ProtectedRoute>
  );
}
