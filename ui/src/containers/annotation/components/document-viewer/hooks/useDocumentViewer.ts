import { useState, useEffect, useCallback } from 'react';
import { Document, Highlight } from '@/containers/annotation/types';
import { ProjectConfig } from '@/containers/project/types';
import { scrollToHighlightWithRetry } from '@/containers/annotation/utils/highlightUtils';
import {
  UseDocumentViewerState,
  UseDocumentViewerActions,
} from '../types/DocumentViewer.types';

interface UseDocumentViewerProps {
  document: Document | null;
  highlights: Highlight[];
  onExport?: () => void;
  onClearAll?: () => void;
  focusedHighlightId?: string | null;
  projectConfig?: ProjectConfig;
}

export function useDocumentViewer({
  document,
  highlights,
  onExport,
  onClearAll,
  focusedHighlightId,
  projectConfig,
}: UseDocumentViewerProps): UseDocumentViewerState & UseDocumentViewerActions {
  // State
  const [flashHighlights, setFlashHighlights] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMatches, setSearchMatches] = useState<
    { start: number; end: number }[]
  >([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [selectedRelevancyLevel, setSelectedRelevancyLevel] = useState<
    string | undefined
  >(undefined);
  const [showAnnotationsModal, setShowAnnotationsModal] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState<'highlights' | 'qa' | 'all'>(
    'highlights'
  );
  const [selectedAnnotations, setSelectedAnnotations] = useState<Set<string>>(
    new Set()
  );
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Helper functions
  const getAnnotationLevelColor = useCallback(
    (annotationLevelId?: string) => {
      if (!projectConfig?.annotationLevels || !annotationLevelId)
        return '#6b7280';
      const level = projectConfig.annotationLevels?.find(
        (l) => l.id === annotationLevelId
      );
      return level?.color || '#6b7280';
    },
    [projectConfig?.annotationLevels]
  );

  // Search functionality
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (!value) {
        setSearchMatches([]);
        setCurrentMatchIndex(0);
        return;
      }

      if (!document?.text) return;

      const matches: { start: number; end: number }[] = [];
      const content = document.text.toLowerCase();
      const search = value.toLowerCase();
      let startIndex = 0;

      while (startIndex < content.length) {
        const index = content.indexOf(search, startIndex);
        if (index === -1) break;

        matches.push({
          start: index,
          end: index + search.length,
        });
        startIndex = index + 1;
      }

      setSearchMatches(matches);
      setCurrentMatchIndex(0);
    },
    [document?.text]
  );

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        navigateToMatch('prev');
      } else {
        navigateToMatch('next');
      }
    } else if (e.key === 'Escape') {
      clearSearch();
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchMatches([]);
    setCurrentMatchIndex(0);
  }, []);

  const navigateToMatch = useCallback(
    (direction: 'next' | 'prev') => {
      if (searchMatches.length === 0) return;

      setCurrentMatchIndex((prev) => {
        const newIndex =
          direction === 'next'
            ? (prev + 1) % searchMatches.length
            : prev === 0
              ? searchMatches.length - 1
              : prev - 1;
        return newIndex;
      });
    },
    [searchMatches]
  );

  // Relevancy level handling
  const handleRelevancyLevelSelect = useCallback((levelId: string) => {
    setSelectedRelevancyLevel(levelId);
  }, []);

  // Export functionality
  const handleExport = useCallback((type: 'highlights' | 'qa' | 'all') => {
    setExportType(type);
    setShowExportDialog(true);
  }, []);

  const handleDirectExport = useCallback(() => {
    if (onExport) {
      onExport();
    }
  }, [onExport]);

  const performExport = useCallback(
    (filename: string) => {
      // Export logic would go here
      setShowExportDialog(false);
    },
    [exportType]
  );

  // Annotation handling
  const handleAnnotationSelect = useCallback((annotationId: string) => {
    setSelectedAnnotations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(annotationId)) {
        newSet.delete(annotationId);
      } else {
        newSet.add(annotationId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedAnnotations(new Set(highlights.map((h) => h.id)));
  }, [highlights]);

  const handleJumpToAnnotation = useCallback((highlight: Highlight) => {
    scrollToHighlightWithRetry(highlight, undefined, 3);
    setShowAnnotationsModal(false);
  }, []);

  const handleClearAll = useCallback(() => {
    setShowClearConfirmModal(true);
  }, []);

  const handleConfirmClear = useCallback(() => {
    if (onClearAll) {
      onClearAll();
    }
    setShowClearConfirmModal(false);
  }, [onClearAll]);

  // Effects
  useEffect(() => {
    if (focusedHighlightId) {
      setFlashHighlights(true);
      const timer = setTimeout(() => setFlashHighlights(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [focusedHighlightId]);

  useEffect(() => {
    if (searchMatches.length > 0 && currentMatchIndex < searchMatches.length) {
      // Scroll to current match
      const match = searchMatches[currentMatchIndex];
      // Implementation would scroll to the match
    }
  }, [searchMatches, currentMatchIndex]);

  useEffect(() => {
    if (showAnnotationsModal) {
      setSelectedAnnotations(new Set());
    }
  }, [showAnnotationsModal]);

  return {
    // State
    flashHighlights,
    searchTerm,
    searchMatches,
    currentMatchIndex,
    selectedRelevancyLevel,
    showAnnotationsModal,
    showExportDialog,
    exportType,
    selectedAnnotations,
    showClearConfirmModal,
    showHistoryModal,

    // Actions
    setFlashHighlights,
    setSearchTerm,
    setSearchMatches,
    setCurrentMatchIndex,
    setSelectedRelevancyLevel,
    setShowAnnotationsModal,
    setShowExportDialog,
    setExportType,
    setSelectedAnnotations,
    setShowClearConfirmModal,
    setShowHistoryModal,
    handleSearchChange,
    handleSearchKeyDown,
    clearSearch,
    navigateToMatch,
    handleRelevancyLevelSelect,
    handleExport,
    handleDirectExport,
    handleAnnotationSelect,
    handleSelectAll,
    handleJumpToAnnotation,
    handleClearAll,
    handleConfirmClear,
    performExport,

    // Helper functions
    getAnnotationLevelColor,
  };
}
