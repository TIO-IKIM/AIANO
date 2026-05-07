export interface Document {
  id?: number; // Database primary key
  Subject_Id: string;
  Document_Id: string;
  Category: string;
  Display: string;
  Date: string;
  text: string;
  // Dynamic fields based on project configuration
  [key: string]: any;
}

export interface TextSpan {
  id: string;
  text: string;
  start: number;
  end: number;
  annotationLevelId?: string; // Reference to annotation level
  // Positioning data for robust scrolling
  domPath?: string;
  textOffset?: number;
  contextBefore?: string;
  contextAfter?: string;
  boundingRect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  parentId?: string;
  createdAt?: number;
}

export interface Highlight extends TextSpan {
  documentId: string;
  document?: Document;
}

export interface HighlightMap {
  [documentId: string]: TextSpan[];
}

// LLM types are now imported from the LLM container
export type { LLMConfig, LLMMetadata } from '@/containers/llm/types';

export interface QAPair {
  id: string;
  question: string;
  answer: string;
  suggestedAnswer?: string;
  highlights: {
    documentId: string;
    spans: {
      text: string;
      start: number;
      end: number;
      id: string;
    }[];
  }[];
  createdAt: Date;
  modifiedAt: Date;
  llmMetadata?: import('@/containers/llm/types').LLMMetadata;
  Subject_Id?: string;
}

export interface ExportData {
  question: string;
  answer: string;
  suggestedAnswer: string | null;
  llmMetadata: import('@/containers/llm/types').LLMMetadata | null;
  Subject_Id: string;
  highlights: {
    documentId: string;
    spans: {
      text: string;
      start: number;
      end: number;
    }[];
  }[];
}

export interface SessionExportData {
  qaPairs: QAPair[];
  exportedAt: Date;
  totalPairs: number;
  fileId: string | null;
  Subject_Id?: string;
}

export interface AppState {
  documents: Document[];
  selectedDocument: Document | null;
  question: string;
  answer: string;
  highlights: HighlightMap;
  suggestedAnswer: string;
  isGenerating: boolean;
  llmError: string;
  // Q&A Management
  qaPairs: QAPair[];
  currentPairId: string | null;
  editingPairId: string | null;
  mode: 'new' | 'edit' | 'view';
}

// Export annotation entry types
export type {
  AianoBlockValue,
  BlockValuesMap,
  AnnotationEntryMetadata,
  AnnotationEntryData,
  AnnotationEntry,
} from './annotation-entry.types';
