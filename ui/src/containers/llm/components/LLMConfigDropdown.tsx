import { useState } from 'react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import { LLMConfigPanel } from './LLMConfigPanel';
import { LLMConfig } from '../types';

interface LLMConfigDropdownProps {
  config: LLMConfig;
  onConfigChange: (config: LLMConfig) => void;
  onTestConnection?: () => Promise<boolean>;
  isGenerating?: boolean;
  error?: string | null;
  onToast?: {
    success: (title: string, description?: string) => string;
    error: (title: string, description?: string) => string;
    info: (title: string, description?: string) => string;
    warning: (title: string, description?: string) => string;
  };
}

export function LLMConfigDropdown({
  config,
  onConfigChange,
  onTestConnection,
  isGenerating = false,
  error = null,
  onToast,
}: LLMConfigDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          <span>LLM Configuration</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>

      {isOpen && (
        <div className="border rounded-lg p-3 bg-muted/30">
          <LLMConfigPanel
            config={config}
            onConfigChange={onConfigChange}
            onTestConnection={onTestConnection}
            isGenerating={isGenerating}
            error={error}
            onToast={onToast}
            showActions={false}
          />
        </div>
      )}
    </div>
  );
}
