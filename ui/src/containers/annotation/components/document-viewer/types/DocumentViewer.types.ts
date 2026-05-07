import { Document, Highlight } from '@/containers/annotation/types';
import { ProjectConfig } from '@/containers/project/types';

export interface DocumentViewerProps {
  document: Document | null;
  highlights: Highlight[];
  allHighlights?: Highlight[];
  onHighlight: (
    span: Omit<
      { start: number; end: number; text: string; annotationLevelId?: string },
      'id'
    >
  ) => void;
  onHighlightClick?: (spanId: string) => void;
  onRemoveHighlight?: (documentId: string, spanId: string) => void;
  onExport?: () => void;
  onClearAll?: () => void;
  focusedHighlightId?: string | null;
  projectConfig?: ProjectConfig;
  projectId?: number;
}

export interface DocumentViewerHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchKeyDown: (e: React.KeyboardEvent) => void;
  onClearSearch: () => void;
  searchMatches: { start: number; end: number }[];
  onNavigateMatch: (direction: 'next' | 'prev') => void;
  onExport: () => void;
  onClearAll: () => void;
  onShowAnnotations: () => void;
  onShowHistory?: () => void;
  highlightsCount: number;
  document: Document | null;
  projectConfig?: ProjectConfig;
  selectedRelevancyLevel?: string;
  onRelevancyLevelSelect: (levelId: string) => void;
}

export interface DocumentViewerContentProps {
  document: Document | null;
  highlights: Highlight[];
  onHighlight: (
    span: Omit<
      { start: number; end: number; text: string; annotationLevelId?: string },
      'id'
    >
  ) => void;
  onHighlightClick?: (spanId: string) => void;
  onRemoveHighlight?: (documentId: string, spanId: string) => void;
  focusedHighlightId?: string | null;
  selectedRelevancyLevel?: string;
  getAnnotationLevelColor: (annotationLevelId?: string) => string;
  flashHighlights: boolean;
  projectConfig?: ProjectConfig;
  searchTerm?: string;
  searchMatches?: { start: number; end: number }[];
  currentMatchIndex?: number;
}

export interface DocumentViewerModalsProps {
  showExportDialog: boolean;
  onCloseExportDialog: () => void;
  onExport: (type: 'highlights' | 'qa' | 'all') => void;
  exportType: 'highlights' | 'qa' | 'all';
  onExportTypeChange: (type: 'highlights' | 'qa' | 'all') => void;
  showClearConfirmModal: boolean;
  onCloseClearConfirmModal: () => void;
  onConfirmClear: () => void;
  showAnnotationsModal: boolean;
  onCloseAnnotationsModal: () => void;
  highlights: Highlight[];
  selectedAnnotations: Set<string>;
  onAnnotationSelect: (annotationId: string) => void;
  onSelectAll: () => void;
  onJumpToAnnotation: (highlight: Highlight) => void;
  onJumpToDocument?: (documentId: string) => void;
  onDeleteHighlight?: (documentId: string, highlightId: string) => void;
  projectConfig?: ProjectConfig;
}

export interface UseDocumentViewerState {
  flashHighlights: boolean;
  searchTerm: string;
  searchMatches: { start: number; end: number }[];
  currentMatchIndex: number;
  selectedRelevancyLevel: string | undefined;
  showAnnotationsModal: boolean;
  showExportDialog: boolean;
  exportType: 'highlights' | 'qa' | 'all';
  selectedAnnotations: Set<string>;
  showClearConfirmModal: boolean;
  showHistoryModal: boolean;
}

export interface UseDocumentViewerActions {
  setFlashHighlights: (value: boolean) => void;
  setSearchTerm: (value: string) => void;
  setSearchMatches: (matches: { start: number; end: number }[]) => void;
  setCurrentMatchIndex: (index: number) => void;
  setSelectedRelevancyLevel: (levelId: string | undefined) => void;
  setShowAnnotationsModal: (show: boolean) => void;
  setShowExportDialog: (show: boolean) => void;
  setExportType: (type: 'highlights' | 'qa' | 'all') => void;
  setSelectedAnnotations: (annotations: Set<string>) => void;
  setShowClearConfirmModal: (show: boolean) => void;
  setShowHistoryModal: (show: boolean) => void;
  handleSearchChange: (value: string) => void;
  handleSearchKeyDown: (e: React.KeyboardEvent) => void;
  clearSearch: () => void;
  navigateToMatch: (direction: 'next' | 'prev') => void;
  handleRelevancyLevelSelect: (levelId: string) => void;
  handleExport: (type: 'highlights' | 'qa' | 'all') => void;
  handleDirectExport: (type: 'highlights' | 'all') => void;
  handleAnnotationSelect: (annotationId: string) => void;
  handleSelectAll: () => void;
  handleJumpToAnnotation: (highlight: Highlight) => void;
  handleClearAll: () => void;
  handleConfirmClear: () => void;
  performExport: (filename: string) => void;
}
