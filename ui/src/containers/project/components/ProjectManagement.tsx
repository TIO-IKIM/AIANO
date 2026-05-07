import { useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Badge } from '@ikim-ui/ui-components/primitive/badge';
import { Plus, Upload, Database, Bot, Tag, Calendar, Copy } from 'lucide-react';
import { ProjectConfig } from '../types';

interface ProjectManagementProps {
  projects: ProjectConfig[];
  isLoading?: boolean;
  error?: string | null;
  onDeleteProject: (id: string) => void;
  onOpenProject: (id: string) => void;
  onUploadProject: (file: File) => Promise<void>;
  onDuplicateProject?: (id: string) => Promise<void>;
}

export function ProjectManagement({
  projects,
  isLoading,
  error,
  onDeleteProject,
  onOpenProject,
  onUploadProject,
  onDuplicateProject,
}: ProjectManagementProps) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateProject = () => {
    navigate({ to: '/projects/new' });
  };

  const handleUploadProject = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await onUploadProject(file);
      } catch (error) {
        console.error('Failed to upload project:', error);
      }
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full p-6">
      {/* Hidden file input for project upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".aiano"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            Manage your information retrieval projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleUploadProject}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Project
          </Button>
          <Button
            onClick={handleCreateProject}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground">
              Create your first project to start annotating datasets
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow hover:bg-accent relative"
            >
              <CardHeader
                className="cursor-pointer"
                onClick={() => {
                  if (project?.id) {
                    onOpenProject(project.id);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description || 'No description'}
                    </p>
                  </div>
                  {onDuplicateProject && project?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-shrink-0 ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (project.id) {
                          onDuplicateProject(project.id);
                        }
                      }}
                      title="Duplicate project"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent
                className="space-y-4 cursor-pointer"
                onClick={() => {
                  if (project?.id) {
                    onOpenProject(project.id);
                  }
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Database className="w-4 h-4 text-muted-foreground" />
                    <span>{project.dataset?.name || 'Unknown Dataset'}</span>
                    <Badge variant="outline">
                      {project.dataset?.fields?.length || 0} fields
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Bot className="w-4 h-4 text-muted-foreground" />
                    <span>{project.aianoBlocks?.length || 0} AIANO Blocks</span>
                  </div>

                  <div className="flex items-start gap-2 text-sm">
                    <Tag className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-1">
                      {project.tags && project.tags.length > 0 ? (
                        project.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {typeof tag === 'string' ? tag : tag.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No labels</span>
                      )}
                      {project.tags && project.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{project.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date(project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
