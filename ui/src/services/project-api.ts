import { apiClient } from './api';
import { ProjectConfig } from '@/containers/project/types';
import { aianoBlockApiService } from './aiano-block-api';

// Convert backend project format to frontend ProjectConfig format
export function convertBackendProjectToFrontend(
  backendProject: any
): ProjectConfig {
  // Handle both direct project response and complete project state response
  const project = backendProject.project || backendProject;

  return {
    id: project.id.toString(),
    name: project.name,
    description: project.description || '',
    dataset: {
      name: project.config?.dataset?.name || 'Default Dataset',
      description:
        project.config?.dataset?.description || 'Default dataset configuration',
      titleField: project.config?.dataset?.titleField || 'display_name',
      fields: project.config?.dataset?.fields || [],
    },
    tags: project.config?.tags || [],
    annotationLevels: project.config?.annotationLevels || [],
    aianoBlocks: (
      backendProject.aiano_blocks ||
      project.config?.aianoBlocks ||
      []
    ).map((block: any) => {
      // Convert backend block to frontend format if it's a backend block
      if (block.id !== undefined && block.id !== null && block.block_type) {
        // This is a backend block, convert it
        return {
          id: block.id,
          name: block.title,
          type:
            block.block_type === 'extraction'
              ? 'text'
              : block.block_type === 'qa'
                ? 'multiselect'
                : 'boolean',
          label: block.title,
          placeholder: block.description || '',
          description: block.description || '',
          required: false,
          options: [],
          booleanChoice: 'Yes/No',
          aiEnabled: block.block_config?.aiEnabled || false,
          soloMode: block.block_config?.soloMode || false,
          aiConfig: {
            ...block.block_config?.aiConfig,
            inputSources: Array.isArray(block.input_sources)
              ? block.input_sources
              : Object.values(block.input_sources || {}),
          } || {
            temperature: 0.7,
            systemPrompt: '',
            maxTokens: 1000,
            inputSources: [],
            soloSystemPrompt: '',
          },
          defaultValue: block.block_value || '',
        };
      }
      // This is already a frontend block, return as is
      return block;
    }),
    createdAt: (() => {
      if (project.created_at) {
        const date = new Date(project.created_at);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      return new Date();
    })(),
    updatedAt: (() => {
      if (project.updated_at) {
        const date = new Date(project.updated_at);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      return new Date();
    })(),
  };
}

// Convert frontend ProjectConfig to backend project format
export function convertFrontendProjectToBackend(
  projectConfig: ProjectConfig
): any {
  return {
    name: projectConfig.name,
    description: projectConfig.description,
    config: {
      dataset: projectConfig.dataset,
      tags: projectConfig.tags,
      annotationLevels: projectConfig.annotationLevels,
      aianoBlocks: projectConfig.aianoBlocks,
    },
  };
}

// Convert backend document to frontend Document format
export function convertBackendDocumentToFrontend(backendDocument: any): any {
  return {
    id: backendDocument.id,
    Subject_Id: backendDocument.subject_id,
    Document_Id: backendDocument.document_id,
    Category: backendDocument.category || '',
    Display: backendDocument.display_name || '',
    Date: backendDocument.date || '',
    text: backendDocument.text || '',
    json_document: backendDocument.json_document,
    metadata: backendDocument.metadata || {},
    created_at: backendDocument.created_at,
    updated_at: backendDocument.updated_at,
  };
}

// Convert frontend Document to backend document format
export function convertFrontendDocumentToBackend(
  document: any,
  projectId: number
): any {
  return {
    project_id: projectId,
    subject_id: document.Subject_Id || '',
    document_id: document.Document_Id || '',
    category: document.Category || '',
    display_name: document.Display || '',
    date: document.Date || '',
    text: document.text || '',
    json_document: document.json_document,
    metadata: document.metadata || {},
  };
}

export class ProjectApiService {
  private static instance: ProjectApiService;

  private authToken: string | null = null;

  private documentCache: Map<string, { documents: any[]; timestamp: number }> =
    new Map();

  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ProjectApiService {
    if (!ProjectApiService.instance) {
      ProjectApiService.instance = new ProjectApiService();
    }
    return ProjectApiService.instance;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  // Project Management
  async getProjects(): Promise<ProjectConfig[]> {
    try {
      const projects = await apiClient.getProjects();
      return projects.map(convertBackendProjectToFrontend);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch projects: ${errorMessage}`);
    }
  }

  async getProject(projectId: string): Promise<ProjectConfig> {
    try {
      const project = await apiClient.getProject(parseInt(projectId));
      const convertedProject = convertBackendProjectToFrontend(project);
      return convertedProject;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch project: ${errorMessage}`);
    }
  }

  async createProject(projectConfig: ProjectConfig): Promise<ProjectConfig> {
    try {
      const backendProject = convertFrontendProjectToBackend(projectConfig);
      const createdProject = await apiClient.createProject(backendProject);
      const frontendProject = convertBackendProjectToFrontend(createdProject);

      // Create AIANO blocks via backend API if they exist
      if (projectConfig.aianoBlocks && projectConfig.aianoBlocks.length > 0) {
        try {
          for (const block of projectConfig.aianoBlocks) {
            // Only create blocks that don't have IDs (new blocks)
            if (!block.id) {
              const blockData = {
                name: block.name,
                type: block.type,
                label: block.label,
                placeholder: block.placeholder,
                description: block.description,
                required: block.required,
                options: block.options,
                booleanChoice: block.booleanChoice,
                aiEnabled: block.aiEnabled,
                soloMode: block.soloMode,
                aiConfig: block.aiConfig,
                defaultValue: block.defaultValue,
              };

              await aianoBlockApiService.createAianoBlock(
                frontendProject.id,
                blockData
              );
            }
          }

          // Refresh the project to get the updated blocks
          const refreshedProject = await this.getProject(frontendProject.id);
          return refreshedProject;
        } catch (blockError) {
          // Log warning but continue - return the project even if block creation fails
          // The project was created successfully, blocks can be added later
        }
      }

      return frontendProject;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create project: ${errorMessage}`);
    }
  }

  async updateProject(projectConfig: ProjectConfig): Promise<ProjectConfig> {
    try {
      const backendProject = convertFrontendProjectToBackend(projectConfig);
      const updatedProject = await apiClient.updateProject(
        parseInt(projectConfig.id),
        backendProject
      );
      return convertBackendProjectToFrontend(updatedProject);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update project: ${errorMessage}`);
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    try {
      await apiClient.deleteProject(parseInt(projectId));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete project: ${errorMessage}`);
    }
  }

  // Document Management
  async getDocuments(projectId: string): Promise<any[]> {
    try {
      // Check cache first
      const cached = this.documentCache.get(projectId);
      const now = Date.now();

      if (cached && now - cached.timestamp < this.CACHE_DURATION) {
        return cached.documents;
      }

      // Get documents from the project response instead of separate endpoint
      const project = await apiClient.getProject(parseInt(projectId));
      const documents = project.documents || [];
      const convertedDocuments = documents.map(
        convertBackendDocumentToFrontend
      );

      // Cache the results
      this.documentCache.set(projectId, {
        documents: convertedDocuments,
        timestamp: now,
      });

      return convertedDocuments;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch documents: ${errorMessage}`);
    }
  }

  async createDocument(projectId: string, document: any): Promise<any> {
    try {
      const backendDocument = convertFrontendDocumentToBackend(
        document,
        parseInt(projectId)
      );
      const createdDocument = await apiClient.createDocument(
        parseInt(projectId),
        backendDocument
      );

      // Clear cache for this project since documents have changed
      this.documentCache.delete(projectId);

      return convertBackendDocumentToFrontend(createdDocument);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create document: ${errorMessage}`);
    }
  }

  async createDocumentsBulk(
    projectId: string,
    documents: any[]
  ): Promise<any[]> {
    try {
      const backendDocuments = documents.map((doc) =>
        convertFrontendDocumentToBackend(doc, parseInt(projectId))
      );
      const createdDocuments = await apiClient.createDocumentsBulk(
        parseInt(projectId),
        backendDocuments
      );

      // Clear cache for this project since documents have changed
      this.documentCache.delete(projectId);

      return createdDocuments.map(convertBackendDocumentToFrontend);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create documents in bulk: ${errorMessage}`);
    }
  }

  async updateDocument(
    projectId: string,
    documentId: string,
    document: any
  ): Promise<any> {
    try {
      const backendDocument = convertFrontendDocumentToBackend(
        document,
        parseInt(projectId)
      );
      const updatedDocument = await apiClient.updateDocument(
        parseInt(projectId),
        parseInt(documentId),
        backendDocument
      );

      // Clear cache for this project since documents have changed
      this.documentCache.delete(projectId);

      return convertBackendDocumentToFrontend(updatedDocument);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update document: ${errorMessage}`);
    }
  }

  async deleteDocument(projectId: string, documentId: string): Promise<void> {
    try {
      await apiClient.deleteDocument(parseInt(projectId), parseInt(documentId));

      // Clear cache for this project since documents have changed
      this.documentCache.delete(projectId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete document: ${errorMessage}`);
    }
  }

  async deleteAllDocuments(projectId: string): Promise<{ deleted_count: number; message: string }> {
    try {
      const result = await apiClient.deleteAllDocuments(parseInt(projectId));

      // Clear cache for this project since documents have changed
      this.documentCache.delete(projectId);
      
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete all documents: ${errorMessage}`);
    }
  }

  // Complete Project State (includes documents, annotations, etc.)
  async getCompleteProjectState(projectId: string): Promise<any> {
    try {
      const projectState = await apiClient.getCompleteProjectState(
        parseInt(projectId)
      );
      return {
        project: convertBackendProjectToFrontend(projectState.project),
        documents: (projectState.documents || []).map(
          convertBackendDocumentToFrontend
        ),
        aiano_blocks: projectState.aiano_blocks || [],
        highlights: projectState.highlights || [],
        session: projectState.session,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to fetch complete project state: ${errorMessage}`
      );
    }
  }

  // Auto-save functionality
  async saveProjectState(projectId: string, state: any): Promise<void> {
    try {
      await apiClient.saveProjectState(parseInt(projectId), state);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save project state: ${errorMessage}`);
    }
  }

  async loadProjectState(projectId: string): Promise<any> {
    try {
      return await apiClient.loadProjectState(parseInt(projectId));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to load project state: ${errorMessage}`);
    }
  }

  // Annotation Entry Management
  async getAnnotationEntries(projectId: string): Promise<any[]> {
    try {
      const entries = await apiClient.getAnnotationEntries(parseInt(projectId));
      return entries;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get annotation entries: ${errorMessage}`);
    }
  }

  async deleteAnnotationEntry(
    projectId: string,
    entryId: string
  ): Promise<void> {
    try {
      await apiClient.deleteAnnotationEntry(
        parseInt(projectId),
        parseInt(entryId)
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete annotation entry: ${errorMessage}`);
    }
  }

  async deleteAllAnnotationEntries(projectId: string): Promise<{ deleted_count: number; message: string }> {
    try {
      const result = await apiClient.deleteAllAnnotationEntries(parseInt(projectId));
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete all annotation entries: ${errorMessage}`);
    }
  }

  // AIANO Blocks Management
  async getAianoBlocks(projectId: string): Promise<any[]> {
    try {
      const blocks = await apiClient.getAianoBlocks(parseInt(projectId));
      return blocks || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get AIANO blocks: ${errorMessage}`);
    }
  }

  // Highlights Management
  async getHighlights(projectId: string): Promise<any[]> {
    try {
      // Note: The API might require a documentId, but we'll try to get all highlights for the project
      // This might need to be adjusted based on the actual API structure
      const highlights = await apiClient.getHighlights(parseInt(projectId), 0); // Using 0 as placeholder
      return highlights || [];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to get highlights: ${errorMessage}`);
    }
  }
}

export const projectApiService = ProjectApiService.getInstance();
