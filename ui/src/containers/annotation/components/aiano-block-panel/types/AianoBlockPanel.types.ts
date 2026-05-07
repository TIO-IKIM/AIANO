import { AIANOBlock, ProjectConfig } from '@/containers/project/types';
import {
  HighlightMap,
  Document,
  AianoBlockValue,
  BlockValuesMap,
  TextSpan,
} from '@/containers/annotation/types';

export interface AianoBlockPanelProps {
  projectConfig: ProjectConfig;
  blockValues: BlockValuesMap;
  onBlockValueChange: (blockId: string, value: AianoBlockValue) => void;
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
  mode: 'new' | 'edit' | 'view';
  highlights?: HighlightMap;
  selectedDocument?: Document | null;
  onSubmit?: (entryData: {
    document: Document;
    annotations: TextSpan[];
    aianoBlocks: BlockValuesMap;
    timestamp?: number;
    totalAnnotations?: number;
    projectId?: string;
  }) => void;
}

export interface AianoBlockItemProps {
  block: AIANOBlock;
  value: AianoBlockValue;
  isGenerating: boolean;
  hasError: boolean;
  errorMessage: string;
  mode: 'new' | 'edit' | 'view';
  projectConfig: ProjectConfig;
  blockValues: BlockValuesMap;
  highlights: HighlightMap;
  selectedDocument?: Document | null;
  llmConfig?: {
    provider: string;
    apiKey: string;
    apiUrl: string;
    model: string;
    requiresAuth: boolean;
  };
  onBlockValueChange: (blockId: string, value: AianoBlockValue) => void;
  onGenerateAI: (blockId: string) => void;
  onClearBlock: (blockId: string) => void;
  areInputRequirementsMet: (block: AIANOBlock) => boolean;
  getInputRequirementReason: (block: AIANOBlock) => string;
  isLLMConfigured: () => boolean;
}

export interface AianoBlockFormProps {
  block: AIANOBlock;
  value: AianoBlockValue;
  mode: 'new' | 'edit' | 'view';
  onValueChange: (value: AianoBlockValue) => void;
}

export interface AianoBlockHeaderProps {
  block: AIANOBlock;
  projectConfig: ProjectConfig;
  blockValues: BlockValuesMap;
  highlights: HighlightMap;
  selectedDocument?: Document | null;
  areInputRequirementsMet: (block: AIANOBlock) => boolean;
}

export interface AianoBlockActionsProps {
  block: AIANOBlock;
  value: AianoBlockValue;
  isGenerating: boolean;
  hasError: boolean;
  mode: 'new' | 'edit' | 'view';
  onGenerateAI: (blockId: string) => void;
  onClearBlock: (blockId: string) => void;
  areInputRequirementsMet: (block: AIANOBlock) => boolean;
  getInputRequirementReason: (block: AIANOBlock) => string;
  isLLMConfigured: () => boolean;
}

export interface AianoBlockSubmitProps {
  canSubmit: boolean;
  validationMessage: string;
  onSubmit: () => void;
}

export interface UseAianoBlockPanelState {
  showToast: boolean;
  showSubmitWithoutHighlightsDialog: boolean;
  shownErrors: Set<string>;
}

export interface UseAianoBlockPanelActions {
  setShowToast: (show: boolean) => void;
  setShowSubmitWithoutHighlightsDialog: (show: boolean) => void;
  handleGenerateAI: (blockId: string) => void;
  handleSubmit: () => void;
  handleConfirmSubmitWithoutHighlights: () => void;
  canSubmit: () => boolean;
  getValidationMessage: () => string;
  isLLMConfigured: () => boolean;
  areInputRequirementsMet: (block: AIANOBlock) => boolean;
  getInputRequirementReason: (block: AIANOBlock) => string;
  getUserFriendlyError: (error: string) => string;
}
