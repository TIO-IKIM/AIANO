import { useState } from 'react';
import {
  ProjectConfig,
  DatasetField,
  AnnotationLevel,
  AIANOBlock,
  CreateAIANOBlock,
  AIInputSource,
  ProjectLabel,
} from '../../types';
// import { aianoBlockApiService } from '@/services/aiano-block-api';
import { ProjectConfigFormState } from '../types/ProjectConfigForm.types';

export function useProjectConfigForm(initialConfig?: Partial<ProjectConfig>) {
  const [state, setState] = useState<ProjectConfigFormState>({
    config: {
      name: '',
      description: '',
      dataset: {
        name: '',
        description: '',
        fields: [],
      },
      tags: [],
      annotationLevels: [],
      aianoBlocks: [],
      selectedLLMConfigId: undefined,
      ...initialConfig,
    },
    newField: {
      name: '',
      type: 'text',
      required: false,
      showForAnnotator: false,
      includeInFinalDataset: false,
      canBeInput: false,
      isDocument: false,
    },
    newTag: '',
    newAnnotationLevel: {
      name: '',
      color: '#ef4444',
      score: 0,
    },
    newAianoBlock: {
      name: '',
      type: 'text',
      required: false,
      aiEnabled: false, // Disable AI by default
      soloMode: false,
    },
    newInputSource: {
      type: 'aiano_block',
      label: '',
      required: false,
    },
  });

  const updateConfig = (updates: Partial<ProjectConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  };

  const updateNewField = (updates: Partial<DatasetField>) => {
    setState((prev) => ({
      ...prev,
      newField: { ...prev.newField, ...updates },
    }));
  };

  const updateNewTag = (tag: string) => {
    setState((prev) => ({ ...prev, newTag: tag }));
  };

  const updateNewAnnotationLevel = (updates: Partial<AnnotationLevel>) => {
    setState((prev) => ({
      ...prev,
      newAnnotationLevel: { ...prev.newAnnotationLevel, ...updates },
    }));
  };

  const updateNewAianoBlock = (updates: Partial<AIANOBlock>) => {
    setState((prev) => ({
      ...prev,
      newAianoBlock: { ...prev.newAianoBlock, ...updates },
    }));
  };

  const updateNewInputSource = (updates: Partial<AIInputSource>) => {
    setState((prev) => ({
      ...prev,
      newInputSource: { ...prev.newInputSource, ...updates },
    }));
  };

  // Dataset Fields
  const addField = () => {
    if (!state.newField.name) return;

    const field: DatasetField = {
      id: `field_${Date.now()}`,
      name: state.newField.name,
      type: state.newField.type || 'text',
      required: state.newField.required || false,
      showForAnnotator: state.newField.showForAnnotator || false,
      includeInFinalDataset: state.newField.includeInFinalDataset || false,
      canBeInput: state.newField.canBeInput || false,
      isDocument: state.newField.isDocument || false,
      description: state.newField.description,
      options: state.newField.options,
    };

    updateConfig({
      dataset: {
        ...state.config.dataset!,
        fields: [...(state.config.dataset?.fields || []), field],
      },
    });

    setState((prev) => ({
      ...prev,
      newField: {
        name: '',
        type: 'text',
        required: false,
        showForAnnotator: false,
        includeInFinalDataset: false,
        canBeInput: false,
        isDocument: false,
      },
    }));
  };

  const removeField = (fieldId: string) => {
    updateConfig({
      dataset: {
        ...state.config.dataset!,
        fields:
          state.config.dataset?.fields?.filter((f) => f.id !== fieldId) || [],
      },
    });
  };

  const updateField = (fieldId: string, updates: Partial<DatasetField>) => {
    updateConfig({
      dataset: {
        ...state.config.dataset!,
        fields:
          state.config.dataset?.fields?.map((f) =>
            f.id === fieldId ? { ...f, ...updates } : f
          ) || [],
      },
    });
  };

  // Tags
  const addTag = (color: string = '#3b82f6') => {
    if (!state.newTag.trim()) return;

    const tag: ProjectLabel = {
      id: `tag_${Date.now()}`,
      name: state.newTag.trim(),
      color,
    };

    updateConfig({
      tags: [...(state.config.tags || []), tag],
    });

    setState((prev) => ({ ...prev, newTag: '' }));
  };

  const removeTag = (index: number) => {
    const newTags = [...(state.config.tags || [])];
    newTags.splice(index, 1);
    updateConfig({ tags: newTags });
  };

  // Annotation Levels
  const addAnnotationLevel = () => {
    if (!state.newAnnotationLevel.name) return;

    const level: AnnotationLevel = {
      id: `level_${Date.now()}`,
      name: state.newAnnotationLevel.name,
      color: state.newAnnotationLevel.color || '#ef4444',
      description: state.newAnnotationLevel.description,
      score: state.newAnnotationLevel.score || 0,
    };

    updateConfig({
      annotationLevels: [...(state.config.annotationLevels || []), level],
    });

    setState((prev) => ({
      ...prev,
      newAnnotationLevel: {
        name: '',
        color: '#ef4444',
        score: 0,
      },
    }));
  };

  const removeAnnotationLevel = (levelId: string) => {
    updateConfig({
      annotationLevels:
        state.config.annotationLevels?.filter((l) => l.id !== levelId) || [],
    });
  };

  const updateAnnotationLevel = (
    levelId: string,
    updates: Partial<AnnotationLevel>
  ) => {
    updateConfig({
      annotationLevels:
        state.config.annotationLevels?.map((l) =>
          l.id === levelId ? { ...l, ...updates } : l
        ) || [],
    });
  };

  // AIANO Blocks
  const addAianoBlock = () => {
    if (!state.newAianoBlock.name) return;

    // For new projects (no ID yet), just add to local config
    // The block will be created by the backend when the project is saved
    const blockData = {
      name: state.newAianoBlock.name,
      type: state.newAianoBlock.type || 'text',
      placeholder: state.newAianoBlock.placeholder,
      description: state.newAianoBlock.description,
      required: state.newAianoBlock.required || false,
      options: state.newAianoBlock.options,
      booleanChoice: state.newAianoBlock.booleanChoice,
      aiEnabled: state.newAianoBlock.aiEnabled || false,
      soloMode: state.newAianoBlock.soloMode || false,
      aiConfig: state.newAianoBlock.aiConfig,
      defaultValue: state.newAianoBlock.defaultValue,
    };

    // Add to local config - this will be processed when project is saved
    updateConfig({
      aianoBlocks: [...(state.config.aianoBlocks || []), blockData as any],
    });

    setState((prev) => ({
      ...prev,
      newAianoBlock: {
        name: '',
        type: 'text',
        required: false,
        aiEnabled: false,
        soloMode: false,
      },
    }));
  };

  const removeAianoBlock = (blockIndex: number) => {
    // Remove by index since blocks might not have IDs yet
    const currentBlocks = state.config.aianoBlocks || [];
    const updatedBlocks = currentBlocks.filter(
      (_, index) => index !== blockIndex
    );

    updateConfig({
      aianoBlocks: updatedBlocks,
    });
  };

  const updateAianoBlock = (
    blockIndex: number,
    updates: Partial<CreateAIANOBlock>
  ) => {
    // Update by index since blocks might not have IDs yet
    const currentBlocks = state.config.aianoBlocks || [];
    const updatedBlocks = currentBlocks.map((block, index) =>
      index === blockIndex ? { ...block, ...updates } : block
    );

    updateConfig({
      aianoBlocks: updatedBlocks,
    });
  };

  // Input Sources
  const addInputSource = (blockIndex: number) => {
    if (!state.newInputSource.label) return;

    const inputSource: AIInputSource = {
      id: `input_${Date.now()}`,
      type: state.newInputSource.type || 'aiano_block',
      sourceId: state.newInputSource.sourceId,
      annotationType: state.newInputSource.annotationType,
      datasetFieldId: state.newInputSource.datasetFieldId,
      customField: state.newInputSource.customField,
      label: state.newInputSource.label,
      required: state.newInputSource.required || false,
    };

    const currentBlocks = state.config.aianoBlocks || [];
    const block = currentBlocks[blockIndex];
    if (block) {
      const updatedBlock = {
        ...block,
        aiConfig: {
          ...block.aiConfig,
          temperature: block.aiConfig?.temperature || 0.7,
          systemPrompt: block.aiConfig?.systemPrompt || '',
          maxTokens: block.aiConfig?.maxTokens || 1000,
          inputSources: [...(block.aiConfig?.inputSources || []), inputSource],
        },
      };
      updateAianoBlock(blockIndex, updatedBlock);
    }

    setState((prev) => ({
      ...prev,
      newInputSource: {
        type: 'aiano_block',
        label: '',
        required: false,
      },
    }));
  };

  const removeInputSource = (blockIndex: number, sourceId: string) => {
    const currentBlocks = state.config.aianoBlocks || [];
    const block = currentBlocks[blockIndex];
    if (block) {
      const updatedBlock = {
        ...block,
        aiConfig: {
          ...block.aiConfig,
          temperature: block.aiConfig?.temperature || 0.7,
          systemPrompt: block.aiConfig?.systemPrompt || '',
          maxTokens: block.aiConfig?.maxTokens || 1000,
          inputSources:
            block.aiConfig?.inputSources?.filter((s) => s.id !== sourceId) ||
            [],
        },
      };
      updateAianoBlock(blockIndex, updatedBlock);
    }
  };

  const updateInputSource = (
    blockIndex: number,
    sourceId: string,
    updates: Partial<AIInputSource>
  ) => {
    const currentBlocks = state.config.aianoBlocks || [];
    const block = currentBlocks[blockIndex];
    if (block) {
      const updatedBlock = {
        ...block,
        aiConfig: {
          ...block.aiConfig,
          temperature: block.aiConfig?.temperature || 0.7,
          systemPrompt: block.aiConfig?.systemPrompt || '',
          maxTokens: block.aiConfig?.maxTokens || 1000,
          inputSources:
            block.aiConfig?.inputSources?.map((s) =>
              s.id === sourceId ? { ...s, ...updates } : s
            ) || [],
        },
      };
      updateAianoBlock(blockIndex, updatedBlock);
    }
  };

  return {
    state,
    updateConfig,
    updateNewField,
    updateNewTag,
    updateNewAnnotationLevel,
    updateNewAianoBlock,
    updateNewInputSource,
    addField,
    removeField,
    updateField,
    addTag,
    removeTag,
    addAnnotationLevel,
    removeAnnotationLevel,
    updateAnnotationLevel,
    addAianoBlock,
    removeAianoBlock,
    updateAianoBlock,
    addInputSource,
    removeInputSource,
    updateInputSource,
  };
}
