import { ProjectConfig } from '@/containers/project/types';
import { Document, HighlightMap } from '@/containers/annotation/types';

export interface AnnotationContainerProps {
  projectConfig?: ProjectConfig;
  projectId?: string;
}

export interface AnnotationLayoutProps {
  documents: Document[];
  selectedDocument: Document | null;
  highlights: HighlightMap;
  blockValues: { [blockId: string]: any };
  isGeneratingBlock: { [blockId: string]: boolean };
  aiBlockErrors: { [blockId: string]: string };
  focusedHighlightId: string | null;
  projectConfig?: ProjectConfig;
  projectId?: string;
  llmConfig?: any;
  mode: string;
  isLoading?: boolean;
  error?: string | null;
  onDocumentSelect: (document: Document) => void;
  onDocumentDelete?: (documentId: string) => void;
  onBlockValueChange: (blockId: string, value: any) => void;
  onGenerateAI: (blockId: string) => Promise<void>;
  onDocumentHighlight: (span: any) => void;
  onHighlightClick: (spanId: string) => void;
  onRemoveHighlight: (documentId: string, spanId: string) => void;
  onJumpToDocument?: (documentId: string) => void;
  onMainExport: () => void;
  onClearAnnotations: () => void;
  onFileUpload: (file: File) => void;
  onSubmitEntry: (entryData: any) => void;
  getAllHighlights: () => any[];
}

export interface AnnotationDrawerProps {
  onFileUpload: (file: File) => void;
  onExport: () => void;
  onClearAll: () => void;
  onSaveProject: () => void;
  onDeleteProject: () => void;
  onLLMConfigChange: (configId: string) => void;
  onTestLLMConnection: (configId: string) => Promise<void>;
  canExport: boolean;
  currentFileId: string | null;
  projectConfig?: ProjectConfig;
  selectedLLMConfigId?: string;
  isTestingConnection: boolean;
}

export interface AnnotationContainerState {
  focusedHighlightId: string | null;
  showMainExportDialog: boolean;
  blockValues: { [blockId: string]: any };
  isGeneratingBlock: { [blockId: string]: boolean };
  aiBlockErrors: { [blockId: string]: string };
  selectedLLMConfigId?: string;
  isTestingConnection: boolean;
}

export interface AnnotationContainerActions {
  setFocusedHighlightId: (id: string | null) => void;
  setShowMainExportDialog: (show: boolean) => void;
  setBlockValues: (values: { [blockId: string]: any }) => void;
  setIsGeneratingBlock: (generating: { [blockId: string]: boolean }) => void;
  setAiBlockErrors: (errors: { [blockId: string]: string }) => void;
  setSelectedLLMConfigId: (id: string | undefined) => void;
  setIsTestingConnection: (testing: boolean) => void;
  handleBlockValueChange: (blockId: string, value: any) => void;
  handleMainExport: () => void;
  handleExportProject: () => Promise<void>;
  handleSubmitEntry: (entryData: any) => void;
  handleGenerateAI: (
    blockId: string,
    projectConfig: ProjectConfig | undefined,
    blockValues: { [blockId: string]: any },
    selectedDocument: any,
    getAllHighlights: () => any[],
    llm: any,
    llmConfig: any
  ) => Promise<void>;
  handleTestLLMConnectionWithToast: (
    configId: string,
    llm: any
  ) => Promise<void>;
  handleDocumentHighlight: (
    span: any,
    selectedDocument: any,
    toggleHighlight: (docId: string, span: any) => void
  ) => void;
  handleHighlightClick: (
    spanId: string,
    documents: any[],
    selectedDocument: any,
    setSelectedDocument: (doc: any) => void,
    getAllHighlights: () => any[]
  ) => void;
  getMainExportDefaultFileName: (
    qaPairs: any[],
    currentFileId: string | null
  ) => string;
  handleAianoBlockConfigUpdate: (blockId: number, config: any) => Promise<void>;
  handleAianoBlockConfigReset: (blockId: number) => Promise<void>;
}
