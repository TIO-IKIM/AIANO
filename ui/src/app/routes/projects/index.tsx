import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Input } from '@ikim-ui/ui-components/primitive/input';
import { Label } from '@ikim-ui/ui-components/primitive/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@ikim-ui/ui-components/primitive/dialog';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ProjectManagement, useProjectStore } from '@/containers/project';
import ProjectLayout from '@/containers/project/components/ProjectLayout';
import { useGlobalToast } from '@/contexts/ToastContext';
import { aianoBlockApiService } from '@/services/aiano-block-api';

export const Route = createFileRoute('/projects/')({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const toast = useGlobalToast();
  const {
    projects,
    isLoading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
  } = useProjectStore();

  // State for rename dialog (for upload)
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [uploadedProjectData, setUploadedProjectData] = useState<any>(null);
  const [newProjectName, setNewProjectName] = useState('');

  // State for duplicate dialog
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [projectToDuplicate, setProjectToDuplicate] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [duplicateProjectName, setDuplicateProjectName] = useState('');

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Project creation is now handled by the /projects/new route

  const handleUpdateProject = async (config: any) => {
    try {
      await updateProject(config);
    } catch (error) {
      // Failed to update project, continue silently
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
      } catch (error) {
        alert(
          `Failed to delete project: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  };

  const handleOpenProject = (id: string) => {
    navigate({ to: `/projects/${id}` });
  };

  const handleDuplicateProject = async (id: string) => {
    if (!id) {
      alert('Invalid project ID');
      return;
    }

    try {
      const { projectApiService } = await import('@/services/project-api');
      const project = await projectApiService.getProject(id);

      if (!project) {
        throw new Error('Project not found');
      }

      // Show dialog to get new project name
      const projectName = project?.name || 'Untitled Project';
      setProjectToDuplicate({ id, name: projectName });
      setDuplicateProjectName(`${projectName} (Copy)`);
      setShowDuplicateDialog(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to load project: ${errorMessage}`);
      console.error('Duplicate project error:', error);
    }
  };

  const handleConfirmDuplicate = async () => {
    if (!projectToDuplicate || !duplicateProjectName.trim()) {
      toast.error('Validation Error', 'Please enter a project name');
      return;
    }

    try {
      const { projectApiService } = await import('@/services/project-api');
      const project = await projectApiService.getProject(projectToDuplicate.id);

      if (!project) {
        throw new Error('Project not found');
      }

      // Safely access project properties with fallbacks
      const projectDescription = project?.description || '';

      // Remove IDs from AIANO blocks so they get created as new blocks
      const blocksWithoutIds = (project.aianoBlocks || []).map((block) => {
        const { id, ...blockWithoutId } = block;
        return blockWithoutId;
      });

      // Create a copy with the new name
      const duplicatedProject = {
        ...project,
        id: undefined, // Let backend generate new ID
        name: duplicateProjectName.trim(),
        description: projectDescription,
        aianoBlocks: blocksWithoutIds, // Blocks without IDs so they get created
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Ensure name and description are present
      if (!duplicatedProject.name || duplicatedProject.name.trim() === '') {
        duplicatedProject.name = 'Untitled Project';
      }
      if (!duplicatedProject.description) {
        duplicatedProject.description = '';
      }

      const newProject = await createProject(duplicatedProject);

      // Close dialog and reset state
      setShowDuplicateDialog(false);
      setProjectToDuplicate(null);
      setDuplicateProjectName('');

      // Show success message
      const newProjectName =
        newProject?.name || duplicatedProject.name || 'Untitled Project';
      const blockCount =
        newProject?.aianoBlocks?.length ||
        duplicatedProject.aianoBlocks?.length ||
        0;
      toast.success(
        'Project Duplicated',
        `Project "${newProjectName}" duplicated successfully with ${blockCount} task(s)!`
      );

      // Reload projects
      loadProjects();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(
        'Duplicate Failed',
        `Failed to duplicate project: ${errorMessage}`
      );
      console.error('Duplicate project error:', error);
    }
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateDialog(false);
    setProjectToDuplicate(null);
    setDuplicateProjectName('');
  };

  const handleUploadProject = async (file: File) => {
    try {
      // Read the file content
      const fileContent = await file.text();
      const projectData = JSON.parse(fileContent);

      // Validate the file format
      if (!projectData.project || projectData.metadata?.format !== 'aiano') {
        throw new Error('Invalid .aiano file format');
      }

      // Store the uploaded project data and show rename dialog
      setUploadedProjectData(projectData);
      setNewProjectName(projectData.project.name);
      setShowRenameDialog(true);
    } catch (error) {
      alert('Failed to upload project. Please check the file format.');
    }
  };

  const handleConfirmRename = async () => {
    if (!uploadedProjectData || !newProjectName.trim()) {
      return;
    }

    try {
      // Create the project with the new name
      const projectConfig = {
        ...uploadedProjectData.project,
        name:
          newProjectName.trim() ||
          uploadedProjectData.project?.name ||
          'Untitled Project',
        description: uploadedProjectData.project?.description || '',
        id: undefined, // Let the backend generate a new ID
      };

      // Ensure required fields are present
      if (!projectConfig.name) {
        projectConfig.name = 'Untitled Project';
      }
      if (!projectConfig.description) {
        projectConfig.description = '';
      }

      // Create the project using the store
      try {
        await createProject(projectConfig);
      } catch (storeError) {
        // Fallback: create directly via API service
        const { projectApiService } = await import('@/services/project-api');
        await projectApiService.createProject(projectConfig);
      }

      // Get the newly created project by calling the API service directly
      const { projectApiService } = await import('@/services/project-api');
      const allProjects = await projectApiService.getProjects();

      const newProject = allProjects.find(
        (p) => p.name === newProjectName.trim()
      );
      if (!newProject) {
        throw new Error('Failed to find the newly created project');
      }
      const newProjectId = newProject.id;

      // Import all the data from the uploaded project
      const { apiClient } = await import('@/services/api');

      const importedCounts = {
        documents: 0,
        aianoBlocks: 0,
        annotationEntries: 0,
        highlights: 0,
      };

      // Import documents
      if (
        uploadedProjectData.documents &&
        uploadedProjectData.documents.length > 0
      ) {
        const apiClient = (await import('@/services/api')).createApiClient();
        for (const doc of uploadedProjectData.documents) {
          try {
            await apiClient.createDocument(parseInt(newProjectId), {
              document_id: doc.Document_Id,
              filename: doc.filename,
              content: doc.content,
              metadata: doc.metadata || {},
            });
            importedCounts.documents++;
          } catch (error) {
            // Failed to import document, continue with next
          }
        }
      }

      // Import AIANO blocks - check both project.aianoBlocks and aiano_blocks
      const blocksToImport =
        uploadedProjectData.project?.aianoBlocks ||
        uploadedProjectData.aiano_blocks ||
        [];
      if (blocksToImport.length > 0) {
        for (const block of blocksToImport) {
          try {
            // Handle both formats: project config format and exported format
            let blockData;
            if (block.name) {
              // Project config format - remove ID so it gets created as a new block
              const { id, ...blockWithoutId } = block;
              blockData = blockWithoutId;
            } else {
              // Exported format - convert to project config format
              blockData = {
                name: block.title || block.name || 'Untitled Block',
                type:
                  block.block_type === 'text'
                    ? 'text'
                    : block.block_type || 'text',
                label: block.title || block.name || 'Untitled Block',
                placeholder: block.description || '',
                description: block.description || '',
                required: false,
                aiEnabled: block.block_config?.aiEnabled || false,
                soloMode: block.block_config?.soloMode || false,
                aiConfig: block.block_config?.aiConfig || undefined,
                inputSources: block.input_sources || [],
              };
            }
            await aianoBlockApiService.createAianoBlock(
              newProjectId,
              blockData
            );
            importedCounts.aianoBlocks++;
          } catch (error) {
            console.error('Failed to import AIANO block:', error);
            // Failed to import AIANO block, continue with next
          }
        }
      }

      // Import annotation entries
      if (
        uploadedProjectData.annotation_entries &&
        uploadedProjectData.annotation_entries.length > 0
      ) {
        for (const entry of uploadedProjectData.annotation_entries) {
          try {
            await apiClient.createAnnotationEntry(parseInt(newProjectId), {
              project_id: parseInt(newProjectId),
              document_id: entry.document_id,
              entry_data: entry.entry_data,
              entry_name: entry.entry_name,
              entry_notes: entry.entry_notes,
            });
            importedCounts.annotationEntries++;
          } catch (error) {
            // Failed to import annotation entry, continue with next
          }
        }
      }

      // Import highlights (need to get document IDs first)
      if (
        uploadedProjectData.highlights &&
        uploadedProjectData.highlights.length > 0
      ) {
        // Get the imported documents to map Document_Id to database ID
        const apiClient = (await import('@/services/api')).createApiClient();
        const importedDocs = await apiClient.getDocuments(
          parseInt(newProjectId)
        );
        const docIdMap = new Map();
        importedDocs.forEach((doc: any) => {
          docIdMap.set(doc.Document_Id, doc.id);
        });

        for (const highlight of uploadedProjectData.highlights) {
          try {
            const docId = docIdMap.get(highlight.document_id);
            if (docId) {
              await apiClient.createHighlight(parseInt(newProjectId), docId, {
                start_offset: highlight.start_offset,
                end_offset: highlight.end_offset,
                highlight_type: highlight.highlight_type,
                metadata: highlight.metadata || {},
              });
              importedCounts.highlights++;
            }
          } catch (error) {
            // Failed to import highlight, continue with next
          }
        }
      }

      const importSummary = `Imported: ${importedCounts.documents} documents, ${importedCounts.aianoBlocks} tasks, ${importedCounts.annotationEntries} annotation entries, ${importedCounts.highlights} highlights`;

      // Close dialog and reset state
      setShowRenameDialog(false);
      setUploadedProjectData(null);
      setNewProjectName('');

      // Show success message
      toast.success(
        'Project Imported',
        `Project "${newProjectName}" created and imported successfully! ${importSummary}`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Import Failed', `Failed to create project: ${errorMessage}`);
      console.error('Import project error:', error);
    }
  };

  const handleCancelRename = () => {
    setShowRenameDialog(false);
    setUploadedProjectData(null);
    setNewProjectName('');
  };

  return (
    <ProtectedRoute>
      <ProjectLayout>
        <ProjectManagement
          projects={projects}
          isLoading={isLoading}
          error={error}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onOpenProject={handleOpenProject}
          onUploadProject={handleUploadProject}
          onDuplicateProject={handleDuplicateProject}
        />

        {/* Rename Dialog */}
        <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rename Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                  autoFocus
                />
              </div>
              <p className="text-sm text-muted-foreground">
                You can rename the project before creating it. The original name
                was: <strong>{uploadedProjectData?.project?.name}</strong>
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelRename}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmRename}
                disabled={!newProjectName.trim()}
              >
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Duplicate Dialog */}
        <Dialog
          open={showDuplicateDialog}
          onOpenChange={setShowDuplicateDialog}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Duplicate Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="duplicate-project-name">New Project Name</Label>
                <Input
                  id="duplicate-project-name"
                  value={duplicateProjectName}
                  onChange={(e) => setDuplicateProjectName(e.target.value)}
                  placeholder="Enter new project name"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && duplicateProjectName.trim()) {
                      handleConfirmDuplicate();
                    }
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter a name for the duplicated project. The original project
                was: <strong>{projectToDuplicate?.name}</strong>
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelDuplicate}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmDuplicate}
                disabled={!duplicateProjectName.trim()}
              >
                Duplicate Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </ProjectLayout>
    </ProtectedRoute>
  );
}
