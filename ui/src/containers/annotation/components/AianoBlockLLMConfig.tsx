import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Label } from '@ikim-ui/ui-components/primitive/label';
import { Input } from '@ikim-ui/ui-components/primitive/input';
// import { Textarea } from '@ikim-ui/ui-components/primitive/textarea';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Badge } from '@ikim-ui/ui-components/primitive/badge';
import { Separator } from '@ikim-ui/ui-components/primitive/separator';
import { Bot, Wand2, Save, RotateCcw } from 'lucide-react';
import { AIANOBlock, ProjectConfig } from '@/containers/project/types';
import { useGlobalToast } from '@/contexts/ToastContext';

interface AianoBlockLLMConfigProps {
  projectConfig?: ProjectConfig;
  onConfigUpdate: (
    blockId: number,
    config: Partial<AIANOBlock['aiConfig']>
  ) => Promise<void>;
  onResetToDefault: (blockId: number) => Promise<void>;
  onSave?: () => Promise<void>;
  onDiscard?: () => void;
  onSaveRef?: React.MutableRefObject<(() => Promise<void>) | null>;
  onDiscardRef?: React.MutableRefObject<(() => void) | null>;
}

export function AianoBlockLLMConfig({
  projectConfig,
  onConfigUpdate,
  onResetToDefault,
  onSave,
  onDiscard,
  onSaveRef,
  onDiscardRef,
}: AianoBlockLLMConfigProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [localConfigs, setLocalConfigs] = useState<{
    [key: number]: Partial<AIANOBlock['aiConfig']>;
  }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const toast = useGlobalToast();

  // Get the current local config for the selected block
  const getCurrentLocalConfig = (): Partial<AIANOBlock['aiConfig']> => {
    if (selectedBlockId === null) {
      return {
        temperature: 0.7,
        systemPrompt: '',
        maxTokens: 1000,
        soloSystemPrompt: '',
      };
    }
    return (
      localConfigs[selectedBlockId] || {
        temperature: 0.7,
        systemPrompt: '',
        maxTokens: 1000,
        soloSystemPrompt: '',
      }
    );
  };

  const localConfig = getCurrentLocalConfig();

  // Get AI-enabled blocks (only those with IDs from backend)
  const aiEnabledBlocks =
    projectConfig?.aianoBlocks?.filter(
      (block) => block.aiEnabled && block.id
    ) || [];

  // TEMPORARY: For old projects, show all blocks so user can see them
  const allBlocks =
    projectConfig?.aianoBlocks?.filter((block) => block.id) || [];
  const showAllBlocks = aiEnabledBlocks.length === 0 && allBlocks.length > 0;

  // Auto-select block when opened from block button
  React.useEffect(() => {
    const handleOpenAIConfig = (event: CustomEvent) => {
      const blockId = event.detail?.blockId;
      if (
        blockId &&
        (aiEnabledBlocks.some((b) => b.id === blockId) ||
          allBlocks.some((b) => b.id === blockId))
      ) {
        setSelectedBlockId(blockId);
        setIsEditing(true);
      }
    };

    window.addEventListener(
      'openAIConfig',
      handleOpenAIConfig as EventListener
    );
    return () => {
      window.removeEventListener(
        'openAIConfig',
        handleOpenAIConfig as EventListener
      );
    };
  }, [aiEnabledBlocks, allBlocks]);

  // Update local config when selected block changes (but not while editing)
  useEffect(() => {
    if (selectedBlockId !== null && !isEditing) {
      const block = aiEnabledBlocks.find((b) => b.id === selectedBlockId);

      // Only initialize if we don't already have a config for this block
      if (!localConfigs[selectedBlockId]) {
        if (block?.aiConfig) {
          const config = {
            temperature: block.aiConfig.temperature ?? 0.7,
            systemPrompt: block.aiConfig.systemPrompt ?? '',
            maxTokens: block.aiConfig.maxTokens ?? 1000,
            soloSystemPrompt: block.aiConfig.soloSystemPrompt ?? '',
          };
          setLocalConfigs((prev) => ({
            ...prev,
            [selectedBlockId]: config,
          }));
        } else {
          const defaultConfig = {
            temperature: 0.7,
            systemPrompt: '',
            maxTokens: 1000,
            soloSystemPrompt: '',
          };
          setLocalConfigs((prev) => ({
            ...prev,
            [selectedBlockId]: defaultConfig,
          }));
        }
      }
    }
  }, [selectedBlockId, isEditing, localConfigs]); // Only update when block changes or editing stops

  // Handle input changes for text fields
  const handleTextChange = (
    field: keyof NonNullable<AIANOBlock['aiConfig']>,
    value: string
  ) => {
    setIsEditing(true);
    if (selectedBlockId !== null) {
      setLocalConfigs((prev) => ({
        ...prev,
        [selectedBlockId]: {
          ...prev[selectedBlockId],
          [field]: value,
        },
      }));
    }
  };

  // Handle input changes for number fields
  const handleNumberChange = (
    field: keyof NonNullable<AIANOBlock['aiConfig']>,
    value: number
  ) => {
    setIsEditing(true);
    if (selectedBlockId !== null) {
      setLocalConfigs((prev) => ({
        ...prev,
        [selectedBlockId]: {
          ...prev[selectedBlockId],
          [field]: value,
        },
      }));
    }
  };

  // Expose save and discard functions to parent via refs
  useEffect(() => {
    if (onSaveRef) {
      onSaveRef.current = async () => {
        // Save all blocks that have local changes
        const blocksToSave = Object.entries(localConfigs);
        if (blocksToSave.length === 0) {
          return;
        }

        try {
          // Save each block with local changes
          for (const [blockIdStr, config] of blocksToSave) {
            const blockId = parseInt(blockIdStr);
            await onConfigUpdate(blockId, config);
          }

          toast.success(
            'Configuration Saved',
            `Successfully saved ${blocksToSave.length} block configuration(s).`
          );
        } catch (error) {
          toast.error(
            'Save Failed',
            'Failed to save some configurations. Please try again.'
          );
        }
      };
    }

    if (onDiscardRef) {
      onDiscardRef.current = () => {
        // Check if there are any actual changes to discard
        const hasChanges = Object.keys(localConfigs).length > 0;

        // Reset all local changes to original values
        const resetConfigs: { [key: number]: Partial<AIANOBlock['aiConfig']> } =
          {};

        for (const blockIdStr of Object.keys(localConfigs)) {
          const blockId = parseInt(blockIdStr);
          const block = aiEnabledBlocks.find((b) => b.id === blockId);

          if (block?.aiConfig) {
            resetConfigs[blockId] = {
              temperature: block.aiConfig.temperature ?? 0.7,
              systemPrompt: block.aiConfig.systemPrompt ?? '',
              maxTokens: block.aiConfig.maxTokens ?? 1000,
              soloSystemPrompt: block.aiConfig.soloSystemPrompt ?? '',
            };
          } else {
            resetConfigs[blockId] = {
              temperature: 0.7,
              systemPrompt: '',
              maxTokens: 1000,
              soloSystemPrompt: '',
            };
          }
        }

        setLocalConfigs(resetConfigs);

        // Only show toast if there were actual changes
        if (hasChanges) {
          toast.success(
            'Changes Discarded',
            'All configuration changes have been reset to original values'
          );
        }
      };
    }
  }, [
    selectedBlockId,
    localConfigs,
    aiEnabledBlocks,
    onConfigUpdate,
    onSaveRef,
    onDiscardRef,
    toast,
  ]);

  if (aiEnabledBlocks.length === 0 && !showAllBlocks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bot className="w-4 h-4" />
            AIANO Block Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No AI-enabled AIANO blocks found. Enable AI for blocks in project
            settings to configure them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const blocksToShow = showAllBlocks ? allBlocks : aiEnabledBlocks;
  const selectedBlock =
    selectedBlockId !== null
      ? blocksToShow.find((b) => b.id === selectedBlockId)
      : null;
  const unsavedChangesCount = Object.keys(localConfigs).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bot className="w-4 h-4" />
          AIANO Block Configuration
          {unsavedChangesCount > 0 && (
            <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              {unsavedChangesCount} unsaved change
              {unsavedChangesCount > 1 ? 's' : ''}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Block Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Select AIANO Block
            {showAllBlocks && (
              <span className="text-xs text-muted-foreground ml-2">
                (Showing all blocks - enable AI in project settings to save
                changes)
              </span>
            )}
          </Label>
          <div className="flex flex-wrap gap-2">
            {blocksToShow.map((block) => (
              <Button
                key={block.id}
                variant={selectedBlockId === block.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedBlockId(block.id)}
                className="text-xs"
              >
                <Wand2 className="w-3 h-3 mr-1" />
                {block.name}
                {!block.aiEnabled && showAllBlocks && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    No AI
                  </Badge>
                )}
                {block.soloMode && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    Solo
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {selectedBlock && (
          <>
            <Separator />

            {/* Block Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Configuration for: {selectedBlock.name}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedBlock.description || selectedBlock.label}
              </p>
            </div>

            {/* Configuration Fields */}
            <div className="space-y-4">
              {/* Temperature */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Temperature</Label>
                <Input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={localConfig?.temperature || 0.7}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0.7;
                    handleNumberChange('temperature', value);
                  }}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Controls randomness (0 = deterministic, 2 = very random)
                </p>
              </div>

              {/* Max Tokens */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Tokens</Label>
                <Input
                  type="number"
                  min="1"
                  max="4000"
                  value={localConfig?.maxTokens || 1000}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1000;
                    handleNumberChange('maxTokens', value);
                  }}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of tokens to generate
                </p>
              </div>

              {/* System Prompt */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">System Prompt</Label>
                <textarea
                  value={localConfig?.systemPrompt || ''}
                  onChange={(e) => {
                    handleTextChange('systemPrompt', e.target.value);
                  }}
                  placeholder="Enter system prompt for AI generation..."
                  className="w-full p-2 border border-input rounded focus:ring-2 focus:ring-ring focus:border-ring text-sm min-h-[80px] resize-vertical"
                />
                <p className="text-xs text-muted-foreground">
                  Instructions for the AI when using input context
                </p>
              </div>

              {/* Solo System Prompt (if solo mode) */}
              {selectedBlock.soloMode && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Solo System Prompt
                  </Label>
                  <textarea
                    value={localConfig?.soloSystemPrompt || ''}
                    onChange={(e) => {
                      handleTextChange('soloSystemPrompt', e.target.value);
                    }}
                    placeholder="Enter system prompt for solo mode generation..."
                    className="w-full p-2 border border-input rounded focus:ring-2 focus:ring-ring focus:border-ring text-sm min-h-[80px] resize-vertical"
                  />
                  <p className="text-xs text-muted-foreground">
                    Instructions for the AI when working independently (solo
                    mode)
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
