import React, { useEffect, useRef, useCallback } from 'react';
import { LLMContainer } from '@/containers/llm';
import { useDocumentAnnotation } from '../hooks/useDocumentAnnotation';
import { useAnnotationContainer } from './hooks/useAnnotationContainer';
import { AnnotationDrawer } from '../components/AnnotationDrawer';
import { FileNameDialog } from '../components/FileNameDialog';
import { AnnotationLayout } from './components/AnnotationLayout';
import { AnnotationContainerProps } from './types/AnnotationContainer.types';

export function AnnotationContainer({
  projectConfig,
  projectId,
}: AnnotationContainerProps) {
  const { state, actions, navigate, deleteProject, toast, settings } =
    useAnnotationContainer(projectConfig);

  const loadedProjectIdRef = useRef<string | null>(null);

  // Initialize document annotation hook with toast
  const {
    // State
    documents,
    selectedDocument,
    question,
    answer,
    highlights,
    qaPairs,
    mode,
    currentFileId,
    isLoading,
    error,
    // Actions
    setSelectedDocument,
    handleFileUpload,
    deleteDocument,
    addHighlight,
    removeHighlight,
    toggleHighlight,
    getAllHighlights,
    exportData,
    clearAll,
    clearCurrentDocumentHighlights,
    clearAnnotations,
    loadDocuments,
  } = useDocumentAnnotation({ toast, projectConfig, projectId });

  // Load documents when projectId is available (only once per project)
  useEffect(() => {
    if (projectId && projectId !== loadedProjectIdRef.current) {
      loadedProjectIdRef.current = projectId;
      loadDocuments(projectId);
    }
  }, [projectId]); // Only depend on projectId to prevent unnecessary re-loads

  const canExport = question.trim() && answer.trim();
  const canExportProject = !!(projectConfig && projectConfig.id); // Can export project if we have a project

  // Get the selected LLM config
  const selectedLLMConfig = state.selectedLLMConfigId
    ? settings.llmConfigs.find((c) => c.id === state.selectedLLMConfigId)
    : undefined;

  // Convert GlobalLLMConfig to LLMConfig format
  // Create llmConfig if we have either apiKey or apiUrl (some providers use default URLs)
  const llmConfig =
    selectedLLMConfig && (selectedLLMConfig.apiKey || selectedLLMConfig.apiUrl)
      ? {
          name:
            selectedLLMConfig.name || selectedLLMConfig.model || 'Custom LLM',
          provider: selectedLLMConfig.provider || 'custom',
          apiKey: selectedLLMConfig.apiKey || '',
          apiUrl: selectedLLMConfig.apiUrl || '',
          model: selectedLLMConfig.model,
          temperature: selectedLLMConfig.temperature || 0.3,
          maxTokens: selectedLLMConfig.maxTokens || 1000,
          systemPrompt:
            selectedLLMConfig.systemPrompt ||
            'You are a helpful assistant for information retrieval tasks.',
          requiresAuth:
            selectedLLMConfig.requiresAuth !== undefined
              ? selectedLLMConfig.requiresAuth
              : true,
          enabled: true,
        }
      : undefined;

  const handleDocumentHighlight = (span: any) => {
    actions.handleDocumentHighlight(span, selectedDocument, toggleHighlight);
  };

  const handleHighlightClick = useCallback(
    (spanId: string) => {
      // Find the highlight and remove it
      const allHighlights = getAllHighlights();
      const targetHighlight = allHighlights.find((h) => h.id === spanId);

      if (targetHighlight && targetHighlight.documentId) {
        removeHighlight(targetHighlight.documentId, spanId);
      }
    },
    [getAllHighlights, removeHighlight]
  );

  const handleJumpToDocument = (documentId: string) => {
    const document = documents.find((doc) => doc.Document_Id === documentId);
    if (document) {
      setSelectedDocument(document);
    }
  };

  const performMainExport = (filename: string) => {
    exportData(filename);
  };

  const handleSubmitEntry = (entryData: any) => {
    actions.handleSubmitEntry(entryData);
    clearAnnotations();
  };

  const handleGenerateAI = async (blockId: string) => {
    await actions.handleGenerateAI(
      blockId,
      projectConfig,
      state.blockValues,
      selectedDocument,
      getAllHighlights,
      // We'll get llm from the LLMContainer
      null as any, // This will be provided by the LLMContainer
      llmConfig
    );
  };

  const handleTestLLMConnectionWithToast = async (configId: string) => {
    // We'll get llm from the LLMContainer
    await actions.handleTestLLMConnectionWithToast(configId, null as any);
  };

  return (
    <LLMContainer selectedConfig={llmConfig}>
      {(llm: any) => {
        // Update the handlers to use the llm instance
        const handleGenerateAIWithLLM = async (blockId: string) => {
          await actions.handleGenerateAI(
            blockId,
            projectConfig,
            state.blockValues,
            selectedDocument,
            getAllHighlights,
            llm,
            llmConfig
          );
        };

        const handleTestLLMConnectionWithLLM = async (configId: string) => {
          await actions.handleTestLLMConnectionWithToast(configId, llm);
        };

        return (
          <div className="h-screen bg-background flex flex-col relative overflow-hidden">
            <AnnotationDrawer
              onFileUpload={handleFileUpload}
              onExportProject={actions.handleExportProject}
              onClearAll={clearAll}
              onDeleteProject={() => {
                if (projectConfig?.id) {
                  deleteProject(projectConfig.id);
                  navigate({ to: '/projects' });
                }
              }}
              onLLMConfigChange={(configId) => {
                actions.setSelectedLLMConfigId(configId);
              }}
              onTestLLMConnection={handleTestLLMConnectionWithLLM}
              onAianoBlockConfigUpdate={(blockId: string, config: any) =>
                actions.handleAianoBlockConfigUpdate(parseInt(blockId), config)
              }
              onAianoBlockConfigReset={(blockId: string) =>
                actions.handleAianoBlockConfigReset(parseInt(blockId))
              }
              canExport={canExportProject}
              currentFileId={currentFileId}
              projectConfig={projectConfig}
              selectedLLMConfigId={state.selectedLLMConfigId}
              isTestingConnection={state.isTestingConnection}
              documentCount={documents.length}
            />

            <AnnotationLayout
              documents={documents}
              selectedDocument={selectedDocument}
              highlights={highlights}
              blockValues={state.blockValues}
              isGeneratingBlock={state.isGeneratingBlock}
              aiBlockErrors={state.aiBlockErrors}
              focusedHighlightId={state.focusedHighlightId}
              projectConfig={projectConfig}
              projectId={projectId}
              llmConfig={llmConfig}
              mode={mode}
              isLoading={isLoading}
              error={error}
              onDocumentSelect={setSelectedDocument}
              onDocumentDelete={deleteDocument}
              onBlockValueChange={actions.handleBlockValueChange}
              onGenerateAI={handleGenerateAIWithLLM}
              onDocumentHighlight={handleDocumentHighlight}
              onHighlightClick={handleHighlightClick}
              onRemoveHighlight={(documentId: string, spanId: string) => {
                removeHighlight(documentId, spanId);
              }}
              onJumpToDocument={handleJumpToDocument}
              onMainExport={actions.handleMainExport}
              onClearAnnotations={clearAnnotations}
              onFileUpload={handleFileUpload}
              onSubmitEntry={handleSubmitEntry}
              getAllHighlights={getAllHighlights}
            />

            <FileNameDialog
              isOpen={state.showMainExportDialog}
              onClose={() => actions.setShowMainExportDialog(false)}
              onConfirm={performMainExport}
              defaultFileName={actions.getMainExportDefaultFileName(
                qaPairs,
                currentFileId
              )}
              title="Export Data"
              description={
                qaPairs.length === 0
                  ? 'Export current annotation as a JSON file.'
                  : `Export session with ${qaPairs.length} QA pairs as a JSON file.`
              }
            />
          </div>
        );
      }}
    </LLMContainer>
  );
}
