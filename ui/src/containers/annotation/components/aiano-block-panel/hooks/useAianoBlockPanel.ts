import { useState, useEffect, useRef, useCallback } from 'react';
import { AIANOBlock, ProjectConfig } from '@/containers/project/types';
import { HighlightMap, Document } from '@/containers/annotation/types';
import { useGlobalToast } from '@/contexts/ToastContext';
import {
  UseAianoBlockPanelState,
  UseAianoBlockPanelActions,
} from '../types/AianoBlockPanel.types';

interface UseAianoBlockPanelProps {
  projectConfig: ProjectConfig;
  blockValues: { [blockId: string]: any };
  onBlockValueChange: (blockId: string, value: any) => void;
  onGenerateAI: (blockId: string) => void;
  isGenerating: { [blockId: string]: boolean };
  aiErrors: { [blockId: string]: string };
  llmConfig?: {
    provider: string;
    apiKey: string;
    apiUrl: string;
    model: string;
    requiresAuth: boolean;
  };
  highlights: HighlightMap;
  selectedDocument?: Document | null;
  onSubmit?: (entryData: any) => void;
}

export function useAianoBlockPanel({
  projectConfig,
  blockValues,
  onBlockValueChange,
  onGenerateAI,
  isGenerating,
  aiErrors,
  llmConfig,
  highlights,
  selectedDocument,
  onSubmit,
}: UseAianoBlockPanelProps): UseAianoBlockPanelState &
  UseAianoBlockPanelActions {
  const [showToast, setShowToast] = useState(false);
  const [
    showSubmitWithoutHighlightsDialog,
    setShowSubmitWithoutHighlightsDialog,
  ] = useState(false);
  const toast = useGlobalToast();
  const shownErrors = useRef(new Set<string>());

  // Show errors as toast notifications
  useEffect(() => {
    Object.entries(aiErrors).forEach(([blockId, error]) => {
      if (error) {
        const errorKey = `${blockId}-${error}`;
        if (!shownErrors.current.has(errorKey)) {
          const block = projectConfig.aianoBlocks?.find(
            (b) => b.id === blockId
          );
          const blockName = block?.label || 'Block';
          toast.error(`Error in ${blockName}`, getUserFriendlyError(error));
          shownErrors.current.add(errorKey);
        }
      }
    });
  }, [aiErrors, projectConfig.aianoBlocks, toast]);

  // Clear shown errors when component unmounts or when all errors are cleared
  useEffect(() => {
    const hasErrors = Object.values(aiErrors).some((error) => error);
    if (!hasErrors) {
      shownErrors.current.clear();
    }
  }, [aiErrors]);

  const isLLMConfigured = useCallback(() => {
    if (!llmConfig) return false;
    // For some providers, apiUrl might be optional (e.g., OpenAI uses a default URL)
    // So we check if either apiUrl is set OR apiKey is set (for providers that use default URLs)
    const hasApiUrl = llmConfig.apiUrl?.trim();
    const hasApiKey = llmConfig.apiKey?.trim();

    // If requiresAuth is true, we need both apiKey and (apiUrl or a provider that has default URL)
    if (llmConfig.requiresAuth) {
      // If apiKey exists, consider it configured (provider might have default URL)
      return !!hasApiKey;
    }

    // If not requiring auth, we need at least apiUrl
    return !!hasApiUrl;
  }, [llmConfig]);

  // Check if a block's input requirements are met
  const areInputRequirementsMet = useCallback(
    (block: AIANOBlock) => {
      // If it's not AI enabled, no requirements
      if (!block.aiEnabled) {
        return false;
      }

      // Solo mode: only requires LLM to be configured
      if (block.soloMode) {
        return isLLMConfigured();
      }

      // AI mode: requires inputs to be available
      if (
        !block.aiConfig?.inputSources ||
        block.aiConfig.inputSources.length === 0
      ) {
        return false;
      }

      // Check each required input source
      for (const inputSource of block.aiConfig.inputSources) {
        if (!inputSource.required) continue;

        switch (inputSource.type) {
          case 'aiano_block':
            // Check if the referenced block has a value
            if (!inputSource.sourceId) {
              // If sourceId is undefined, try to find the block by label
              const blockName = inputSource.label;
              if (!blockName) {
                return false;
              }
              // Find the block by name and check if it has a value
              const referencedBlock = projectConfig.aianoBlocks?.find(
                (b) => b.name === blockName
              );
              if (!referencedBlock || !blockValues[referencedBlock.id]) {
                return false;
              }
            } else if (!blockValues[inputSource.sourceId]) {
              return false;
            }
            break;

          case 'annotation':
            // Check if there are highlights/annotations available
            if (inputSource.annotationType === 'all') {
              // Check if there are any highlights in any document
              const hasAnyHighlights = Object.values(highlights).some(
                (docHighlights) => docHighlights && docHighlights.length > 0
              );
              if (!hasAnyHighlights) {
                return false;
              }
            } else if (inputSource.annotationType === 'annotation') {
              // Check if there are highlights with the specific annotation level
              const hasAnnotationHighlights = Object.values(highlights).some(
                (docHighlights) =>
                  docHighlights &&
                  docHighlights.some(
                    (highlight) =>
                      highlight.annotationLevelId === inputSource.sourceId
                  )
              );
              if (!hasAnnotationHighlights) {
                return false;
              }
            }
            break;

          case 'dataset_field':
            // Check if the selected document has the required field
            if (!selectedDocument || !inputSource.datasetFieldId) {
              return false;
            }

            const field = projectConfig.dataset?.fields?.find(
              (f) => f.id === inputSource.datasetFieldId
            );
            if (
              !field ||
              selectedDocument[field.name] === undefined ||
              selectedDocument[field.name] === null
            ) {
              return false;
            }
            break;
        }
      }

      return true;
    },
    [
      blockValues,
      highlights,
      selectedDocument,
      projectConfig.dataset?.fields,
      isLLMConfigured,
    ]
  );

  // Get the reason why input requirements are not met (for tooltip)
  const getInputRequirementReason = useCallback(
    (block: AIANOBlock) => {
      if (!block.aiEnabled) {
        return 'AI not enabled for this block';
      }

      if (!isLLMConfigured()) {
        return 'LLM not configured';
      }

      if (block.soloMode) {
        return 'Solo mode - no context needed';
      }

      if (
        !block.aiConfig?.inputSources ||
        block.aiConfig.inputSources.length === 0
      ) {
        return 'No input sources configured';
      }

      const missingRequirements = [];

      for (const inputSource of block.aiConfig.inputSources) {
        if (!inputSource.required) continue;

        switch (inputSource.type) {
          case 'aiano_block':
            if (!inputSource.sourceId) {
              // If sourceId is undefined, try to find the block by label
              const blockName = inputSource.label;
              if (!blockName) {
                missingRequirements.push('Block');
              } else {
                // Find the block by name and check if it has a value
                const referencedBlock = projectConfig.aianoBlocks?.find(
                  (b) => b.name === blockName
                );
                if (!referencedBlock || !blockValues[referencedBlock.id]) {
                  missingRequirements.push(blockName);
                }
              }
            } else if (!blockValues[inputSource.sourceId]) {
              const blockName =
                projectConfig.aianoBlocks?.find(
                  (b) => b.id === inputSource.sourceId
                )?.name || 'Block';
              missingRequirements.push(blockName);
            }
            break;

          case 'annotation':
            if (inputSource.annotationType === 'all') {
              const hasAnyHighlights = Object.values(highlights).some(
                (docHighlights) => docHighlights && docHighlights.length > 0
              );
              if (!hasAnyHighlights) {
                missingRequirements.push('Annotations');
              }
            } else if (inputSource.annotationType === 'annotation') {
              const level = projectConfig.annotationLevels?.find(
                (l) => l.id === inputSource.sourceId
              );
              const levelName = level?.name || 'Annotation Level';
              const hasAnnotationHighlights = Object.values(highlights).some(
                (docHighlights) =>
                  docHighlights &&
                  docHighlights.some(
                    (highlight) =>
                      highlight.annotationLevelId === inputSource.sourceId
                  )
              );
              if (!hasAnnotationHighlights) {
                missingRequirements.push(levelName);
              }
            }
            break;

          case 'dataset_field':
            if (!selectedDocument || !inputSource.datasetFieldId) {
              missingRequirements.push('Document field');
            } else {
              const field = projectConfig.dataset?.fields?.find(
                (f) => f.id === inputSource.datasetFieldId
              );
              if (
                !field ||
                selectedDocument[field.name] === undefined ||
                selectedDocument[field.name] === null
              ) {
                missingRequirements.push(field?.name || 'Document field');
              }
            }
            break;
        }
      }

      if (missingRequirements.length > 0) {
        return `Missing: ${missingRequirements.join(', ')}`;
      }

      return '';
    },
    [
      blockValues,
      highlights,
      selectedDocument,
      projectConfig.aianoBlocks,
      projectConfig.annotationLevels,
      projectConfig.dataset?.fields,
      isLLMConfigured,
    ]
  );

  const getUserFriendlyError = useCallback(
    (error: string) => {
      if (!isLLMConfigured()) {
        return 'LLM is not configured. Please configure your LLM settings in the Tools panel.';
      }

      if (error.includes('401') && error.includes('API key')) {
        return 'Invalid API key. Please check your LLM configuration in the Tools panel.';
      }
      if (error.includes('403')) {
        return 'Access denied. Please check your API key permissions.';
      }
      if (error.includes('429')) {
        return 'Rate limit exceeded. Please try again later.';
      }
      if (error.includes('500')) {
        return 'Server error. Please try again later.';
      }

      return error;
    },
    [isLLMConfigured]
  );

  // Check if all required fields are completed (highlights are optional now)
  const canSubmit = useCallback(() => {
    if (!projectConfig?.aianoBlocks) return false;

    // Check if all required AIANO blocks have values
    for (const block of projectConfig.aianoBlocks) {
      if (block.required) {
        const value = blockValues[block.id];
        if (
          !value ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'string' && value.trim() === '')
        ) {
          return false;
        }
      }
    }

    // Highlights are no longer required - submission is allowed without them
    return true;
  }, [projectConfig?.aianoBlocks, blockValues]);

  // Get validation message for submit button
  const getValidationMessage = useCallback(() => {
    if (!projectConfig?.aianoBlocks) return 'No tasks configured';

    const missingRequired = [];
    for (const block of projectConfig.aianoBlocks) {
      if (block.required) {
        const value = blockValues[block.id];
        if (
          !value ||
          (Array.isArray(value) && value.length === 0) ||
          (typeof value === 'string' && value.trim() === '')
        ) {
          missingRequired.push(block.name);
        }
      }
    }

    const hasAnnotations = Object.values(highlights).some(
      (docHighlights) => docHighlights && docHighlights.length > 0
    );

    if (missingRequired.length > 0) {
      return `Complete required fields: ${missingRequired.join(', ')}`;
    }

    if (!hasAnnotations) {
      return 'Ready to submit (no highlights)';
    }

    return 'Ready to submit';
  }, [projectConfig?.aianoBlocks, blockValues, highlights]);

  // Handle generate/regenerate AI content
  const handleGenerateAI = useCallback(
    (blockId: string) => {
      // Clear the current content first
      onBlockValueChange(blockId, '');
      // Then generate new content
      onGenerateAI(blockId);
    },
    [onBlockValueChange, onGenerateAI]
  );

  // Actually perform the submission
  const performSubmit = useCallback(() => {
    if (!canSubmit() || !onSubmit) return;

    // Collect all AIANO block values
    const aianoData: { [blockId: string]: any } = {};
    for (const block of projectConfig.aianoBlocks || []) {
      aianoData[block.id] = {
        name: block.name,
        label: block.label,
        type: block.type,
        value: blockValues[block.id] || '',
        required: block.required,
      };
    }

    // Collect all annotations from all documents
    const allAnnotations: any[] = [];
    Object.entries(highlights).forEach(([documentId, docHighlights]) => {
      if (docHighlights && docHighlights.length > 0) {
        docHighlights.forEach((highlight) => {
          allAnnotations.push({
            id: highlight.id,
            text: highlight.text,
            start: highlight.start,
            end: highlight.end,
            annotationLevelId: highlight.annotationLevelId,
            documentId,
          });
        });
      }
    });

    // Validate that the selected document has a database ID
    if (!selectedDocument?.id) {
      toast.error(
        'Invalid Document',
        'The selected document does not have a database ID. Please refresh the page and try again.'
      );
      return;
    }

    // Create the entry data
    const entryData = {
      id: `entry_${Date.now()}`,
      timestamp: new Date().toISOString(),
      projectId: projectConfig.id,
      document: selectedDocument,
      aianoBlocks: aianoData,
      annotations: allAnnotations,
      totalAnnotations: allAnnotations.length,
    };

    // Call the submit handler
    onSubmit(entryData);

    // Show success toast
    toast.success(
      'Entry submitted successfully!',
      'Your annotation entry has been saved.'
    );
  }, [
    canSubmit,
    onSubmit,
    projectConfig.aianoBlocks,
    blockValues,
    highlights,
    selectedDocument,
    projectConfig.id,
    toast,
  ]);

  // Handle submit - check for highlights and show confirmation if needed
  const handleSubmit = useCallback(() => {
    if (!canSubmit() || !onSubmit) return;

    // Check if there are any annotations (highlights)
    const hasAnnotations = Object.values(highlights).some(
      (docHighlights) => docHighlights && docHighlights.length > 0
    );

    // If no highlights, show confirmation dialog
    if (!hasAnnotations) {
      setShowSubmitWithoutHighlightsDialog(true);
      return;
    }

    // If highlights exist, submit directly
    performSubmit();
  }, [canSubmit, onSubmit, highlights, performSubmit]);

  // Handle confirmation to submit without highlights
  const handleConfirmSubmitWithoutHighlights = useCallback(() => {
    setShowSubmitWithoutHighlightsDialog(false);
    performSubmit();
  }, [performSubmit]);

  return {
    // State
    showToast,
    showSubmitWithoutHighlightsDialog,
    shownErrors: shownErrors.current,

    // Actions
    setShowToast,
    setShowSubmitWithoutHighlightsDialog,
    handleGenerateAI,
    handleSubmit,
    handleConfirmSubmitWithoutHighlights,
    canSubmit,
    getValidationMessage,
    isLLMConfigured,
    areInputRequirementsMet,
    getInputRequirementReason,
    getUserFriendlyError,
  };
}
