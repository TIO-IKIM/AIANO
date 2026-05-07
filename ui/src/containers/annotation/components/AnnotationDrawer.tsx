import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@ikim-ui/ui-components/primitive/drawer';
import { Input } from '@ikim-ui/ui-components/primitive/input';
import { Label } from '@ikim-ui/ui-components/primitive/label';
import { Separator } from '@ikim-ui/ui-components/primitive/separator';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Badge } from '@ikim-ui/ui-components/primitive/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ikim-ui/ui-components/primitive/select';
import {
  Settings,
  Upload,
  Download,
  Trash2,
  FileText,
  AlertCircle,
  Bot,
  Tag,
  Save,
  Play,
  RotateCcw,
} from 'lucide-react';
import { ProjectConfig } from '@/containers/project/types';
import { useGlobalSettings } from '@/containers/project/stores/globalSettings';
import { AianoBlockLLMConfig } from './AianoBlockLLMConfig';

interface AnnotationDrawerProps {
  onFileUpload: (file: File) => void;
  onExportProject: () => void;
  onClearAll: () => void;
  onDeleteProject: () => void;
  onLLMConfigChange: (configId: string) => void;
  onTestLLMConnection: (configId: string) => Promise<void>;
  onAianoBlockConfigUpdate: (blockId: string, config: any) => void;
  onAianoBlockConfigReset: (blockId: string) => void;
  canExport: boolean;
  currentFileId: string | null;
  projectConfig?: ProjectConfig;
  selectedLLMConfigId?: string;
  isTestingConnection?: boolean;
  documentCount?: number;
}

export function AnnotationDrawer({
  onFileUpload,
  onExportProject,
  onClearAll,
  onDeleteProject,
  onLLMConfigChange,
  onTestLLMConnection,
  onAianoBlockConfigUpdate,
  onAianoBlockConfigReset,
  canExport,
  currentFileId,
  projectConfig,
  selectedLLMConfigId,
  isTestingConnection = false,
  documentCount = 0,
}: AnnotationDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [selectedBlockForConfig, setSelectedBlockForConfig] = useState<
    number | null
  >(null);
  const { settings, loadLLMConfigsFromAPI } = useGlobalSettings();

  // Reload LLM configs when drawer opens to get latest changes
  useEffect(() => {
    if (isOpen) {
      loadLLMConfigsFromAPI();
    }
  }, [isOpen, loadLLMConfigsFromAPI]);

  // Listen for AI config button clicks from blocks
  useEffect(() => {
    const handleOpenAIConfig = (event: CustomEvent) => {
      const blockId = event.detail?.blockId;
      if (blockId) {
        setSelectedBlockForConfig(blockId);
        setIsOpen(true);
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
  }, []);

  // Refs for LLM config save/discard functions
  const saveLLMConfigRef = useRef<(() => Promise<void>) | null>(null);
  const discardLLMConfigRef = useRef<(() => void) | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files) {
      // Process files sequentially with small delays to prevent toast spam
      const fileArray = Array.from(files);
      let currentIndex = 0;

      const processNextFile = () => {
        if (currentIndex < fileArray.length) {
          onFileUpload(fileArray[currentIndex]);
          currentIndex++;
          // Small delay between files to prevent toast spam
          if (currentIndex < fileArray.length) {
            setTimeout(processNextFile, 100);
          }
        }
      };

      processNextFile();
      // Don't close drawer after upload - let user see the toast notification
    }
  };

  const handleSaveProject = () => {
    onSaveProject();
    setIsOpen(false);
  };

  const handleLLMConfigChange = (configId: string) => {
    onLLMConfigChange(configId);
  };

  const handleTestConnection = async () => {
    if (selectedLLMConfigId) {
      await onTestLLMConnection(selectedLLMConfigId);
    }
  };

  const handleDeleteProject = () => {
    if (
      window.confirm(
        'Are you sure you want to delete this project? This action cannot be undone.'
      )
    ) {
      onDeleteProject();
      setIsOpen(false);
    }
  };

  const handleExportProject = () => {
    onExportProject();
    setIsOpen(false);
  };

  const handleClearAll = () => {
    setShowClearAllConfirm(true);
  };

  const handleConfirmClearAll = () => {
    onClearAll();
    setShowClearAllConfirm(false);
    setIsOpen(false);
  };

  const handleCancelClearAll = () => {
    setShowClearAllConfirm(false);
  };

  const handleSaveLLMConfig = async () => {
    if (saveLLMConfigRef.current) {
      try {
        await saveLLMConfigRef.current();
        setIsOpen(false); // Close drawer after successful save
      } catch (error) {
        console.error('Failed to save LLM config:', error);
      }
    }
  };

  const handleDiscardLLMConfig = () => {
    if (discardLLMConfigRef.current) {
      discardLLMConfigRef.current();
      setIsOpen(false); // Close drawer after discard
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        // Only update state if the value actually changed
        if (open !== isOpen) {
          setIsOpen(open);
        }
      }}
    >
      <DrawerTrigger asChild>
        <Button
          size="sm"
          className="fixed top-2 right-16 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-full h-[90vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Project Settings
              </DrawerTitle>
              <DrawerDescription>
                Configure project settings, LLM parameters, and AIANO block
                configurations.
              </DrawerDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardLLMConfig}
                className="text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Discard & Close
              </Button>
              <Button
                size="sm"
                onClick={handleSaveLLMConfig}
                className="text-xs"
              >
                <Save className="w-3 h-3 mr-1" />
                Save & Close
              </Button>
            </div>
          </div>
        </DrawerHeader>

        <div className="flex-1 px-6 py-4 overflow-y-auto min-h-0">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - File Operations */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Upload className="w-4 h-4" />
                      File Operations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* File Upload - Only show when no documents are uploaded */}
                    {documentCount === 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Upload Documents
                        </Label>
                        <div className="relative">
                          <div className="flex items-center justify-center w-full">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer bg-muted hover:bg-accent hover:border-ring transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>{' '}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  JSON files only
                                </p>
                              </div>
                              <Input
                                type="file"
                                accept=".json"
                                multiple
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload a JSON file containing your documents for
                          annotation.
                        </p>
                        <div className="text-xs text-muted-foreground bg-muted p-2 rounded border">
                          <strong>Expected format:</strong>
                          <pre className="mt-1 text-[10px] overflow-x-auto">
                            {`[
  {
    "Document_Id": "doc1"${
      projectConfig?.dataset?.fields?.filter(
        (field) => field.type === 'document'
      ).length
        ? `,\n    ${projectConfig.dataset.fields
            .filter((field) => field.type === 'document')
            .map(
              (field) =>
                `"${field.name}": "${field.type === 'text' ? 'Your text here...' : field.type === 'number' ? '123' : field.type === 'boolean' ? 'true' : 'Your value here...'}"`
            )
            .join(',\n    ')}`
        : ''
    }
  }
]`}
                          </pre>
                          <p className="mt-1 text-[10px]">
                            <strong>Required fields:</strong> Document_Id
                            {projectConfig?.dataset?.fields?.filter(
                              (f) => f.type === 'document'
                            ).length
                              ? `, ${projectConfig.dataset.fields
                                  .filter((f) => f.type === 'document')
                                  .map((f) => f.name)
                                  .join(', ')}`
                              : ''}
                            <br />
                            <strong>Optional fields:</strong>{' '}
                            {projectConfig?.dataset?.fields
                              ?.filter((f) => f.type !== 'document')
                              .map((f) => f.name)
                              .join(', ') || 'None defined'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Add More Documents - Show when documents already exist */}
                    {documentCount > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Add More Documents
                        </Label>
                        <div className="relative">
                          <Button
                            onClick={() => {
                              const input = document.getElementById(
                                'additional-file-upload-input'
                              ) as HTMLInputElement;
                              input?.click();
                            }}
                            variant="outline"
                            className="w-full flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Upload Additional Documents
                          </Button>
                          <input
                            id="additional-file-upload-input"
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload more JSON files to add to this project
                        </p>
                      </div>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Actions</Label>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={handleExportProject}
                          disabled={!canExport}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export Project
                        </Button>
                        {!showClearAllConfirm ? (
                          <Button
                            variant="outline"
                            onClick={handleClearAll}
                            className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            Clear All
                          </Button>
                        ) : (
                          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg space-y-3">
                            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                              <AlertCircle className="w-4 h-4" />
                              <span className="font-medium">Are you sure?</span>
                            </div>
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                              This will delete all uploaded documents and
                              annotation entries. Project configuration will be
                              preserved.
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelClearAll}
                                className="text-orange-700 border-orange-300 hover:bg-orange-100"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleConfirmClearAll}
                                className="flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Yes, Clear All
                              </Button>
                            </div>
                          </div>
                        )}
                        <Button
                          variant="outline"
                          onClick={handleDeleteProject}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Project
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Second Column - Project Settings */}
              <div className="space-y-4">
                {/* Project Settings (Read-only) */}
                {projectConfig && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Settings className="w-4 h-4" />
                        Project Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Project Info */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Project Information
                        </Label>
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Name:</strong> {projectConfig.name}
                          </div>
                          <div>
                            <strong>Description:</strong>{' '}
                            {projectConfig.description || 'No description'}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Dataset Info */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Dataset Configuration
                        </Label>
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Dataset:</strong>{' '}
                            {projectConfig.dataset.name}
                          </div>
                          <div>
                            <strong>Fields:</strong>{' '}
                            {projectConfig.dataset.fields.length} configured
                          </div>
                          <div>
                            <strong>Title Field:</strong>{' '}
                            {projectConfig.dataset.titleField || 'Not set'}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Labels & Blocks */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Annotation Configuration
                        </Label>
                        <div className="text-sm space-y-1">
                          <div>
                            <strong>Tags:</strong>{' '}
                            {projectConfig.tags?.length || 0} configured
                          </div>
                          <div>
                            <strong>Annotation Levels:</strong>{' '}
                            {projectConfig.annotationLevels?.length || 0}{' '}
                            configured
                          </div>
                          <div>
                            <strong>AIANO Blocks:</strong>{' '}
                            {projectConfig.aianoBlocks?.length || 0} configured
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        Project settings are read-only to prevent data
                        corruption during annotation.
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Third Column - LLM Configuration */}
              <div className="space-y-4">
                {/* LLM Configuration */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bot className="w-4 h-4" />
                      LLM Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Select LLM Model
                      </Label>
                      <div className="flex gap-2">
                        <Select
                          value={selectedLLMConfigId || ''}
                          onValueChange={handleLLMConfigChange}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Choose an LLM model" />
                          </SelectTrigger>
                          <SelectContent>
                            {settings.llmConfigs.map((config) => (
                              <SelectItem key={config.id} value={config.id}>
                                <div className="flex items-center gap-2">
                                  <Bot className="w-4 h-4" />
                                  <span>{config.name}</span>
                                  {config.isDefault && (
                                    <Badge
                                      variant="default"
                                      className="text-xs"
                                    >
                                      Default
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={handleTestConnection}
                          disabled={!selectedLLMConfigId || isTestingConnection}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Play className="w-4 h-4" />
                          {isTestingConnection ? 'Testing...' : 'Test'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select an LLM model for AI-powered annotation features.
                      </p>
                    </div>
                    {selectedLLMConfigId && (
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        {(() => {
                          const config = settings.llmConfigs.find(
                            (c) => c.id === selectedLLMConfigId
                          );
                          return config ? (
                            <div>
                              <div>
                                <strong>Model:</strong> {config.model}
                              </div>
                              <div>
                                <strong>Provider:</strong> {config.provider}
                              </div>
                              <div>
                                <strong>API:</strong> {config.apiUrl}
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AIANO Block Configuration */}
                <AianoBlockLLMConfig
                  projectConfig={projectConfig}
                  onConfigUpdate={onAianoBlockConfigUpdate}
                  onResetToDefault={onAianoBlockConfigReset}
                  onSaveRef={saveLLMConfigRef}
                  onDiscardRef={discardLLMConfigRef}
                />
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
