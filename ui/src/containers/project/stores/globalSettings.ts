import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GlobalSettings, GlobalLLMConfig } from '../types';
import {
  llmConfigApiService,
  LLMConfigResponse,
} from '@/services/llm-config-api';

// Helper functions to convert between API and frontend formats
const convertApiToFrontend = (
  apiConfig: LLMConfigResponse,
  existingConfig?: GlobalLLMConfig
): GlobalLLMConfig => ({
  id: apiConfig.id.toString(),
  name: apiConfig.name,
  provider: apiConfig.provider,
  apiKey: existingConfig?.apiKey || '', // Preserve existing API key if available
  apiUrl: apiConfig.api_url,
  model: apiConfig.model,
  temperature: apiConfig.temperature,
  maxTokens: apiConfig.max_tokens,
  systemPrompt: apiConfig.system_prompt,
  requiresAuth: apiConfig.requires_auth,
  isDefault: apiConfig.is_default,
  createdAt: new Date(apiConfig.created_at),
  updatedAt: apiConfig.updated_at ? new Date(apiConfig.updated_at) : new Date(),
});

const convertFrontendToApi = (
  frontendConfig: Omit<GlobalLLMConfig, 'id' | 'createdAt' | 'updatedAt'>
) => ({
  name: frontendConfig.name,
  provider: frontendConfig.provider,
  api_key: frontendConfig.apiKey,
  api_url: frontendConfig.apiUrl,
  model: frontendConfig.model,
  temperature: frontendConfig.temperature,
  max_tokens: frontendConfig.maxTokens,
  system_prompt: frontendConfig.systemPrompt,
  requires_auth: frontendConfig.requiresAuth,
  is_default: frontendConfig.isDefault,
});

const defaultLLMConfigs: GlobalLLMConfig[] = [];

interface GlobalSettingsStore {
  settings: GlobalSettings;

  // LLM Config Management
  addLLMConfig: (
    config: Omit<GlobalLLMConfig, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateLLMConfig: (
    id: string,
    config: Partial<GlobalLLMConfig>
  ) => Promise<void>;
  deleteLLMConfig: (id: string) => Promise<void>;
  setDefaultLLMConfig: (id: string) => Promise<void>;
  getLLMConfig: (id: string) => GlobalLLMConfig | undefined;
  getDefaultLLMConfig: () => GlobalLLMConfig | undefined;
  loadLLMConfigsFromAPI: () => Promise<void>;
  resetToDefaults: () => void;
}

export const useGlobalSettings = create<GlobalSettingsStore>()(
  persist(
    (set, get) => {
      // Migration: Clear old OpenAI configs and ensure vLLM defaults
      const migrateConfigs = (storedConfigs: GlobalLLMConfig[]) => {
        // Remove any OpenAI configs
        const filteredConfigs = storedConfigs.filter(
          (config) => config.provider !== 'openai'
        );

        // If no configs left or no vLLM config, add default vLLM config
        if (
          filteredConfigs.length === 0 ||
          !filteredConfigs.some((config) => config.provider === 'vllm')
        ) {
          return defaultLLMConfigs;
        }

        return filteredConfigs;
      };

      return {
        settings: {
          llmConfigs: defaultLLMConfigs,
          defaultLLMConfigId: '',
          autoSave: true,
          notifications: true,
        },

        addLLMConfig: async (config) => {
          try {
            const apiConfig = convertFrontendToApi(config);
            const response =
              await llmConfigApiService.createLLMConfig(apiConfig);
            const newConfig = convertApiToFrontend(response, config);

            set((state) => ({
              settings: {
                ...state.settings,
                llmConfigs: [...state.settings.llmConfigs, newConfig],
              },
            }));
          } catch (error) {
            // Fallback to local storage if API fails
            const newConfig: GlobalLLMConfig = {
              ...config,
              id: `config-${Date.now()}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            set((state) => ({
              settings: {
                ...state.settings,
                llmConfigs: [...state.settings.llmConfigs, newConfig],
              },
            }));
          }
        },

        updateLLMConfig: async (id, updates) => {
          try {
            // Check if this is a database ID (numeric) or local ID (string)
            const isDatabaseId = !isNaN(Number(id));

            if (isDatabaseId) {
              const apiUpdates = convertFrontendToApi(
                updates as Omit<
                  GlobalLLMConfig,
                  'id' | 'createdAt' | 'updatedAt'
                >
              );
              const response = await llmConfigApiService.updateLLMConfig(
                Number(id),
                apiUpdates
              );
              const existingConfig = get().settings.llmConfigs.find(
                (config) => config.id === id
              );
              const updatedConfig = convertApiToFrontend(
                response,
                existingConfig
              );

              set((state) => ({
                settings: {
                  ...state.settings,
                  llmConfigs: state.settings.llmConfigs.map((config) =>
                    config.id === id ? updatedConfig : config
                  ),
                },
              }));
            } else {
              // Fallback to local storage for non-database configs
              set((state) => ({
                settings: {
                  ...state.settings,
                  llmConfigs: state.settings.llmConfigs.map((config) =>
                    config.id === id
                      ? { ...config, ...updates, updatedAt: new Date() }
                      : config
                  ),
                },
              }));
            }
          } catch (error) {
            // Fallback to local storage if API fails
            set((state) => ({
              settings: {
                ...state.settings,
                llmConfigs: state.settings.llmConfigs.map((config) =>
                  config.id === id
                    ? { ...config, ...updates, updatedAt: new Date() }
                    : config
                ),
              },
            }));
          }
        },

        deleteLLMConfig: async (id) => {
          try {
            // Check if this is a database ID (numeric) or local ID (string)
            const isDatabaseId = !isNaN(Number(id));

            if (isDatabaseId) {
              await llmConfigApiService.deleteLLMConfig(Number(id));
            }

            set((state) => {
              const newConfigs = state.settings.llmConfigs.filter(
                (config) => config.id !== id
              );
              const newDefaultId =
                state.settings.defaultLLMConfigId === id
                  ? newConfigs[0]?.id
                  : state.settings.defaultLLMConfigId;

              return {
                settings: {
                  ...state.settings,
                  llmConfigs: newConfigs,
                  defaultLLMConfigId: newDefaultId,
                },
              };
            });
          } catch (error) {
            // Still remove from local state even if API fails
            set((state) => {
              const newConfigs = state.settings.llmConfigs.filter(
                (config) => config.id !== id
              );
              const newDefaultId =
                state.settings.defaultLLMConfigId === id
                  ? newConfigs[0]?.id
                  : state.settings.defaultLLMConfigId;

              return {
                settings: {
                  ...state.settings,
                  llmConfigs: newConfigs,
                  defaultLLMConfigId: newDefaultId,
                },
              };
            });
          }
        },

        setDefaultLLMConfig: async (id) => {
          try {
            // Check if this is a database ID (numeric) or local ID (string)
            const isDatabaseId = !isNaN(Number(id));

            if (isDatabaseId) {
              await llmConfigApiService.setDefaultLLMConfig(Number(id));
            }

            set((state) => ({
              settings: {
                ...state.settings,
                defaultLLMConfigId: id,
              },
            }));
          } catch (error) {
            // Still update local state even if API fails
            set((state) => ({
              settings: {
                ...state.settings,
                defaultLLMConfigId: id,
              },
            }));
          }
        },

        getLLMConfig: (id) =>
          get().settings.llmConfigs.find((config) => config.id === id),

        getDefaultLLMConfig: () => {
          const { settings } = get();
          return settings.llmConfigs.find(
            (config) => config.id === settings.defaultLLMConfigId
          );
        },

        loadLLMConfigsFromAPI: async () => {
          try {
            const apiConfigs = await llmConfigApiService.getLLMConfigs();
            const existingConfigs = get().settings.llmConfigs;

            // Convert API configs while preserving existing API keys
            const frontendConfigs = apiConfigs.map((apiConfig) => {
              const existingConfig = existingConfigs.find(
                (config) => config.id === apiConfig.id.toString()
              );
              return convertApiToFrontend(apiConfig, existingConfig);
            });

            // Merge with existing configs, prioritizing API configs
            const localConfigs = existingConfigs.filter((config) =>
              isNaN(Number(config.id))
            );
            const mergedConfigs = [...frontendConfigs, ...localConfigs];

            set((state) => ({
              settings: {
                ...state.settings,
                llmConfigs: mergedConfigs,
              },
            }));
          } catch (error) {
            // Keep existing configs if API fails
          }
        },

        // Clear all stored data and reset to defaults
        resetToDefaults: () => {
          set({
            settings: {
              llmConfigs: defaultLLMConfigs,
              defaultLLMConfigId: '',
              autoSave: true,
              notifications: true,
            },
          });
        },
      };
    },
    {
      name: 'global-settings',
      migrate: (persistedState: any, version: number) => {
        // Migration: Clear old OpenAI configs
        if (persistedState?.settings?.llmConfigs) {
          const filteredConfigs = persistedState.settings.llmConfigs.filter(
            (config: any) => config.provider !== 'openai'
          );

          // If no configs left or no vLLM config, use defaults
          if (
            filteredConfigs.length === 0 ||
            !filteredConfigs.some((config: any) => config.provider === 'vllm')
          ) {
            persistedState.settings.llmConfigs = defaultLLMConfigs;
            persistedState.settings.defaultLLMConfigId = 'vllm-default';
          } else {
            persistedState.settings.llmConfigs = filteredConfigs;
            // Update default to vLLM if it was OpenAI
            if (
              persistedState.settings.defaultLLMConfigId?.includes('openai')
            ) {
              const vllmConfig = filteredConfigs.find(
                (config: any) => config.provider === 'vllm'
              );
              if (vllmConfig) {
                persistedState.settings.defaultLLMConfigId = vllmConfig.id;
              }
            }
          }
        }
        return persistedState;
      },
    }
  )
);
