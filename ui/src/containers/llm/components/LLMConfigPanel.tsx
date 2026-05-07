import { useState, useEffect } from 'react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Input } from '@ikim-ui/ui-components/primitive/input';
import { Label } from '@ikim-ui/ui-components/primitive/label';
import { Textarea } from '@ikim-ui/ui-components/primitive/textarea';
import { Separator } from '@ikim-ui/ui-components/primitive/separator';
import { Bot, Info, Eye, EyeOff } from 'lucide-react';
import { LLMConfig } from '../types';
import { LLM_API_INFO } from '../config/providers';

interface LLMConfigPanelProps {
  config: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
  onSave?: () => void | Promise<void>;
  onCancel?: () => void;
  onTestConnection?: () => Promise<boolean>;
  showActions?: boolean;
  isGenerating?: boolean;
  error?: string | null;
  onToast?: {
    success: (title: string, description?: string) => string;
    error: (title: string, description?: string) => string;
    info: (title: string, description?: string) => string;
    warning: (title: string, description?: string) => string;
  };
}

export function LLMConfigPanel({
  config,
  onConfigChange,
  onSave,
  onCancel,
  onTestConnection,
  showActions = true,
  isGenerating = false,
  error = null,
  onToast,
}: LLMConfigPanelProps) {
  const [localConfig, setLocalConfig] = useState<LLMConfig>(config);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleConfigChange = (field: keyof LLMConfig, value: any) => {
    const newConfig = { ...localConfig, [field]: value };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!localConfig.name?.trim()) {
      onToast?.error('Validation Error', 'Configuration name is required');
      return;
    }
    if (!localConfig.apiUrl?.trim()) {
      onToast?.error('Validation Error', 'API URL is required');
      return;
    }
    if (!localConfig.model?.trim()) {
      onToast?.error('Validation Error', 'Model name is required');
      return;
    }
    if (localConfig.requiresAuth && !localConfig.apiKey?.trim()) {
      onToast?.error(
        'Validation Error',
        'API Key is required when authentication is enabled'
      );
      return;
    }

    await onSave?.();
  };

  const handleCancel = () => {
    setLocalConfig(config);
    onCancel?.();
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Bot className="w-4 h-4" />
        <Label className="text-sm font-medium">LLM Configuration</Label>
      </div>

      <div className="space-y-3">
        {/* Instructions */}
        <div className="p-3 bg-muted border rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium">{LLM_API_INFO.title}</h4>
              <p className="text-xs text-muted-foreground">
                {LLM_API_INFO.description}
              </p>
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Examples:</p>
                <div className="space-y-1">
                  {LLM_API_INFO.examples?.map((example, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {example}
                      </code>
                    </div>
                  )) || []}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Name */}
        <div>
          <Label htmlFor="name" className="text-sm font-medium">
            Configuration Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={localConfig.name}
            onChange={(e) => handleConfigChange('name', e.target.value)}
            placeholder="My LLM Configuration"
            className="mt-1 w-full"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="apiUrl" className="text-sm font-medium">
              API URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="apiUrl"
              value={localConfig.apiUrl}
              onChange={(e) => handleConfigChange('apiUrl', e.target.value)}
              placeholder="https://your-llm-server.com/v1"
              className="mt-1 w-full"
              required
            />
          </div>

          <div>
            <Label htmlFor="model" className="text-sm font-medium">
              Model <span className="text-red-500">*</span>
            </Label>
            <Input
              id="model"
              value={localConfig.model}
              onChange={(e) => handleConfigChange('model', e.target.value)}
              placeholder="Enter model name"
              className="mt-1 w-full"
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="requiresAuth"
            checked={localConfig.requiresAuth}
            onChange={(e) =>
              handleConfigChange('requiresAuth', e.target.checked)
            }
            className="rounded border-input"
          />
          <Label htmlFor="requiresAuth" className="text-sm font-medium">
            Requires Authentication
          </Label>
        </div>

        {localConfig.requiresAuth && (
          <div>
            <Label htmlFor="apiKey" className="text-sm font-medium">
              API Key <span className="text-red-500">*</span>
            </Label>
            <div className="relative mt-1">
              <Input
                id="apiKey"
                type={showPassword ? 'text' : 'password'}
                value={localConfig.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                placeholder={
                  localConfig.apiKey ? 'API key is set' : 'Enter your API key'
                }
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {!localConfig.apiKey && (
              <p className="text-xs text-muted-foreground mt-1">
                API key is required for this configuration. Enter your API key
                to save.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label htmlFor="temperature" className="text-sm font-medium">
              Temperature: {localConfig.temperature}
            </Label>
            <Input
              id="temperature"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={localConfig.temperature}
              onChange={(e) =>
                handleConfigChange('temperature', parseFloat(e.target.value))
              }
              className="w-full mt-2"
            />
          </div>

          <div>
            <Label htmlFor="maxTokens" className="text-sm font-medium">
              Max Tokens
            </Label>
            <Input
              id="maxTokens"
              type="number"
              value={localConfig.maxTokens}
              onChange={(e) =>
                handleConfigChange('maxTokens', parseInt(e.target.value))
              }
              placeholder="1000"
              className="mt-1 w-full"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="systemPrompt" className="text-sm font-medium">
            System Prompt
          </Label>
          <Textarea
            id="systemPrompt"
            value={localConfig.systemPrompt}
            onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
            placeholder="Enter system prompt..."
            rows={3}
            className="resize-none w-full mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Define how the AI should behave and respond to your questions.
          </p>
        </div>

        {/* Test Connection */}
        {onTestConnection && (
          <div className="space-y-2">
            <Button
              onClick={async () => {
                try {
                  const success = await onTestConnection();
                  if (success) {
                    onToast?.success(
                      'Connection Successful',
                      'LLM API is working correctly'
                    );
                  }
                } catch (error) {
                  onToast?.error(
                    'Connection Failed',
                    error instanceof Error ? error.message : 'Unknown error'
                  );
                }
              }}
              disabled={isGenerating}
              variant="outline"
              size="sm"
              className="w-auto px-4" // Normal button size
            >
              {isGenerating ? 'Testing...' : 'Test Connection'}
            </Button>
            {error && (
              <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        )}
      </div>

      {showActions && (
        <>
          <Separator />
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button variant="outline" onClick={handleCancel} size="sm">
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} size="sm">
              Save Configuration
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
