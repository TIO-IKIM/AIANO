import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProjectConfig } from '../types';
import { projectApiService } from '@/services/project-api';

interface ProjectStore {
  projects: ProjectConfig[];
  currentProject: ProjectConfig | null;
  isLoading: boolean;
  error: string | null;

  // Project Management
  loadProjects: () => Promise<void>;
  createProject: (config: ProjectConfig) => Promise<void>;
  updateProject: (config: ProjectConfig) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (id: string) => void;
  getProject: (id: string) => ProjectConfig | undefined;
  refreshProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      isLoading: false,
      error: null,

      loadProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const projects = await projectApiService.getProjects();
          set({ projects, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load projects',
            isLoading: false,
          });
        }
      },

      createProject: async (config) => {
        set({ isLoading: true, error: null });
        try {
          const createdProject = await projectApiService.createProject(config);
          set((state) => ({
            projects: [...state.projects, createdProject],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to create project',
            isLoading: false,
          });
        }
      },

      updateProject: async (config) => {
        set({ isLoading: true, error: null });
        try {
          const updatedProject = await projectApiService.updateProject(config);
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === config.id ? updatedProject : project
            ),
            currentProject:
              state.currentProject?.id === config.id
                ? updatedProject
                : state.currentProject,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update project',
            isLoading: false,
          });
        }
      },

      deleteProject: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await projectApiService.deleteProject(id);
          set((state) => ({
            projects: state.projects.filter((project) => project.id !== id),
            currentProject:
              state.currentProject?.id === id ? null : state.currentProject,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete project',
            isLoading: false,
          });
        }
      },

      setCurrentProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        set({ currentProject: project || null });
      },

      getProject: (id) => get().projects.find((project) => project.id === id),

      refreshProject: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const project = await projectApiService.getProject(id);
          set((state) => ({
            projects: state.projects.map((p) => (p.id === id ? project : p)),
            currentProject:
              state.currentProject?.id === id ? project : state.currentProject,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to refresh project',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'project-store',
    }
  )
);
