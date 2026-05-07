import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Plus, Settings, Trash2, Star, Play } from 'lucide-react';
import { useGlobalSettings } from '../../../../project/stores/globalSettings';
import { GlobalLLMConfig } from '../../../../project/types';
import { LLMConfigPanel } from '@/containers/llm/components/LLMConfigPanel';
import { LLMConfig } from '@/containers/llm/types';
import { useGlobalToast } from '@/contexts/ToastContext';

interface LLMSettingsSectionProps {
  // No props needed - uses global state
}

export const LLMSettingsSection: React.FC<LLMSettingsSectionProps> = () => {
  const {
    settings,
    addLLMConfig,
    updateLLMConfig,
    deleteLLMConfig,
    setDefaultLLMConfig,
    loadLLMConfigsFromAPI,
    resetToDefaults,
  } = useGlobalSettings();

  const toast = useGlobalToast();
  const [editingConfig, setEditingConfig] =
    React.useState<GlobalLLMConfig | null>(null);
  const [testingConfig, setTestingConfig] = React.useState<string | null>(null);
  const [lastConfigCount, setLastConfigCount] = React.useState(
    settings.llmConfigs.length
  );

  // Auto-open form for newly added configs
  React.useEffect(() => {
    if (settings.llmConfigs.length > lastConfigCount) {
      // A new config was added, find the newest one and open it for editing
      const newestConfig = settings.llmConfigs[settings.llmConfigs.length - 1];
      setEditingConfig(newestConfig);
      setLastConfigCount(settings.llmConfigs.length);
    }
  }, [settings.llmConfigs.length, lastConfigCount]);

  const [isAddingNew, setIsAddingNew] = React.useState(false);
  const [newConfig, setNewConfig] = React.useState<LLMConfig | null>(null);

  // Load LLM configurations from API on mount
  React.useEffect(() => {
    loadLLMConfigsFromAPI();
  }, [loadLLMConfigsFromAPI]);

  const handleAddConfig = () => {
    const configCount = settings.llmConfigs.length;
    const tempConfig: LLMConfig = {
      name: `LLM Configuration ${configCount + 1}`,
      provider: 'vllm',
      apiKey: '',
      apiUrl: '',
      model: '',
      temperature: 0.3,
      maxTokens: 1000,
      systemPrompt:
        'You are a helpful assistant for information retrieval tasks.',
      requiresAuth: false,
    };
    setNewConfig(tempConfig);
    setIsAddingNew(true);
  };

  const handleSaveNewConfig = async (config: LLMConfig) => {
    try {
      const newConfigData: Omit<
        GlobalLLMConfig,
        'id' | 'createdAt' | 'updatedAt'
      > = {
        name: config.name,
        provider: config.provider,
        apiKey: config.apiKey,
        apiUrl: config.apiUrl,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        systemPrompt: config.systemPrompt,
        requiresAuth: config.requiresAuth,
        isDefault: false,
      };
      await addLLMConfig(newConfigData);
      setIsAddingNew(false);
      setNewConfig(null);
      toast.success(
        'Configuration Added!',
        'New LLM configuration has been created and saved.'
      );
    } catch (error) {
      toast.error(
        'Save Failed',
        `Failed to save the configuration: ${error instanceof Error ? error.message : 'Unknown error'}. You can try again or cancel.`
      );
      // Don't close the form on error - let user fix and try again
    }
  };

  const handleCancelNewConfig = () => {
    setIsAddingNew(false);
    setNewConfig(null);
  };

  const handleEditConfig = (config: GlobalLLMConfig) => {
    setEditingConfig(config);
  };

  const handleSaveEdit = async (updatedConfig: LLMConfig) => {
    if (editingConfig) {
      try {
        await updateLLMConfig(editingConfig.id, {
          name: updatedConfig.name,
          provider: updatedConfig.provider,
          apiKey: updatedConfig.apiKey,
          apiUrl: updatedConfig.apiUrl,
          model: updatedConfig.model,
          temperature: updatedConfig.temperature,
          maxTokens: updatedConfig.maxTokens,
          systemPrompt: updatedConfig.systemPrompt,
          requiresAuth: updatedConfig.requiresAuth,
        });
        setEditingConfig(null);
        toast.success(
          'Configuration Saved!',
          'LLM configuration has been saved. Test the connection to verify it works.'
        );
      } catch (error) {
        toast.error(
          'Save Failed',
          `Failed to save the configuration: ${error instanceof Error ? error.message : 'Unknown error'}. You can try again or cancel.`
        );
        // Don't close the modal on error - let user fix and try again or cancel
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingConfig(null);
  };

  const handleDeleteConfig = async (id: string) => {
    const config = settings.llmConfigs.find((c) => c.id === id);
    await deleteLLMConfig(id);
    toast.success(
      'Configuration Deleted',
      `${config?.name || 'Configuration'} has been removed`
    );
  };

  const handleSetDefault = async (id: string) => {
    const config = settings.llmConfigs.find((c) => c.id === id);
    await setDefaultLLMConfig(id);
    toast.success(
      'Default Updated',
      `${config?.name || 'Configuration'} is now the default`
    );
  };

  const handleTestConnection = async (config: GlobalLLMConfig) => {
    setTestingConfig(config.id);

    try {
      // Convert to LLMConfig format for testing
      const llmConfig: LLMConfig = convertToLLMConfig(config);

      // Validate required fields
      if (!llmConfig.apiUrl || llmConfig.apiUrl.trim() === '') {
        throw new Error(
          'API URL is required. Please specify the API endpoint.'
        );
      }

      if (!llmConfig.model || llmConfig.model.trim() === '') {
        throw new Error(
          'Model name is required. Please specify the model to use.'
        );
      }

      // Only require API key if authentication is required
      if (
        llmConfig.requiresAuth &&
        (!llmConfig.apiKey || llmConfig.apiKey.trim() === '')
      ) {
        throw new Error(
          'API key is required when authentication is enabled. Please add your API key before testing the connection.'
        );
      }

      // Create a simple test request
      const testRequest = {
        model: llmConfig.model,
        messages: [
          {
            role: 'user',
            content:
              'Hello, this is a test message. Please respond with "Connection successful!"',
          },
        ],
        max_tokens: 50,
        temperature: 0.1,
      };

      // Prepare headers - only add Authorization if auth is required and API key is provided
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (
        llmConfig.requiresAuth &&
        llmConfig.apiKey &&
        llmConfig.apiKey.trim()
      ) {
        headers.Authorization = `Bearer ${llmConfig.apiKey}`;
      }

      // Make the API call
      const response = await fetch(`${llmConfig.apiUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(testRequest),
      });

      if (response.ok) {
        await response.json();
        toast.success(
          '🎉 Configuration Ready!',
          `Successfully connected to ${config.name} (${config.model}). Your LLM configuration is now ready to use!`
        );
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }
    } catch (error) {
      toast.error(
        'Connection Failed',
        `Failed to connect to ${config.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setTestingConfig(null);
    }
  };

  const convertToLLMConfig = (globalConfig: GlobalLLMConfig): LLMConfig => ({
    name: globalConfig.name,
    provider: globalConfig.provider,
    apiKey: globalConfig.apiKey || '',
    apiUrl: globalConfig.apiUrl,
    model: globalConfig.model,
    temperature: globalConfig.temperature,
    maxTokens: globalConfig.maxTokens,
    systemPrompt: globalConfig.systemPrompt,
    requiresAuth: globalConfig.requiresAuth,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              LLM Configurations
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your LLM provider configurations
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddConfig} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Configuration
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* New Configuration Panel */}
        {isAddingNew && newConfig && (
          <div className="border-2 border-dashed border-border rounded-lg p-3 bg-muted/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">New LLM Configuration</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelNewConfig}
                >
                  Cancel
                </Button>
              </div>
            </div>
            <LLMConfigPanel
              config={newConfig}
              onConfigChange={setNewConfig}
              onSave={async () => {
                if (newConfig) {
                  await handleSaveNewConfig(newConfig);
                }
              }}
              onCancel={handleCancelNewConfig}
              onToast={toast}
              onTestConnection={async () => {
                // Test the new config before saving
                try {
                  // Validate required fields
                  if (!newConfig.apiUrl || !newConfig.apiUrl.trim()) {
                    throw new Error('API URL is required');
                  }
                  if (!newConfig.model || !newConfig.model.trim()) {
                    throw new Error('Model name is required');
                  }

                  // Only require API key if authentication is required
                  if (
                    newConfig.requiresAuth &&
                    (!newConfig.apiKey || !newConfig.apiKey.trim())
                  ) {
                    throw new Error(
                      'API key is required when authentication is enabled'
                    );
                  }

                  const testRequest = {
                    model: newConfig.model,
                    messages: [
                      {
                        role: 'user',
                        content:
                          'Hello, this is a test message. Please respond with "Connection successful!"',
                      },
                    ],
                    max_tokens: 50,
                    temperature: 0.1,
                  };

                  // Prepare headers - only add Authorization if auth is required and API key is provided
                  const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                  };

                  if (
                    newConfig.requiresAuth &&
                    newConfig.apiKey &&
                    newConfig.apiKey.trim()
                  ) {
                    headers.Authorization = `Bearer ${newConfig.apiKey}`;
                  }

                  const response = await fetch(
                    `${newConfig.apiUrl}/chat/completions`,
                    {
                      method: 'POST',
                      headers,
                      body: JSON.stringify(testRequest),
                    }
                  );

                  if (response.ok) {
                    toast.success(
                      'Connection Test Successful!',
                      'Your configuration is ready to save.'
                    );
                    return true;
                  }
                  const errorData = await response.json().catch(() => ({}));
                  throw new Error(
                    errorData.error?.message ||
                      `HTTP ${response.status}: ${response.statusText}`
                  );
                } catch (error) {
                  toast.error(
                    'Connection Test Failed',
                    `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`
                  );
                  return false;
                }
              }}
              showActions
            />
          </div>
        )}

        {settings.llmConfigs.map((config) => (
          <div key={config.id} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{config.name}</h3>
                {config.isDefault && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
                {config.requiresAuth &&
                  (!config.apiKey || config.apiKey.trim() === '') && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      API Key Required
                    </span>
                  )}
                <span className="text-sm text-muted-foreground">
                  {config.provider} • {config.model}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestConnection(config)}
                  disabled={
                    testingConfig === config.id ||
                    !config.apiUrl ||
                    config.apiUrl.trim() === '' ||
                    !config.model ||
                    config.model.trim() === '' ||
                    (config.requiresAuth &&
                      (!config.apiKey || config.apiKey.trim() === ''))
                  }
                  title={
                    !config.apiUrl || config.apiUrl.trim() === ''
                      ? 'Add API URL to test connection'
                      : !config.model || config.model.trim() === ''
                        ? 'Add model name to test connection'
                        : config.requiresAuth &&
                            (!config.apiKey || config.apiKey.trim() === '')
                          ? 'Add API key to test connection'
                          : 'Test connection'
                  }
                >
                  <Play className="h-4 w-4 mr-2" />
                  {testingConfig === config.id ? 'Testing...' : 'Test'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditConfig(config)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetDefault(config.id)}
                  disabled={config.isDefault}
                >
                  Set Default
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteConfig(config.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {editingConfig?.id === config.id && (
              <div className="border-2 border-dashed border-border rounded-lg p-3 bg-muted/50 mt-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">
                    Editing: {editingConfig.name || config.name}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingConfig(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <LLMConfigPanel
                  key={editingConfig.id} // Force re-render when editing config changes
                  config={convertToLLMConfig(editingConfig)}
                  onConfigChange={(updatedConfig) => {
                    // Update the editing config with changes
                    setEditingConfig((prev) => {
                      if (!prev || prev.id !== config.id) return prev;
                      return {
                        ...prev,
                        name: updatedConfig.name,
                        provider: updatedConfig.provider,
                        apiKey: updatedConfig.apiKey,
                        apiUrl: updatedConfig.apiUrl,
                        model: updatedConfig.model,
                        temperature: updatedConfig.temperature,
                        maxTokens: updatedConfig.maxTokens,
                        systemPrompt: updatedConfig.systemPrompt,
                        requiresAuth: updatedConfig.requiresAuth,
                      };
                    });
                  }}
                  onSave={async () => {
                    if (editingConfig && editingConfig.id === config.id) {
                      await handleSaveEdit(convertToLLMConfig(editingConfig));
                    }
                  }}
                  onCancel={() => {
                    setEditingConfig(null);
                  }}
                  onToast={toast}
                  showActions
                />
              </div>
            )}
          </div>
        ))}

        {settings.llmConfigs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No LLM configurations found</p>
            <p className="text-sm">
              Add your first configuration to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
