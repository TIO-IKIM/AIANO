import React from 'react';
import { DocumentViewerProps } from './document-viewer/types/DocumentViewer.types';
import { useDocumentViewer } from './document-viewer/hooks/useDocumentViewer';
import { DocumentViewerHeader } from './document-viewer/components/DocumentViewerHeader';
import { DocumentViewerContent } from './document-viewer/components/DocumentViewerContent';
import { DocumentViewerModals } from './document-viewer/components/DocumentViewerModals';
import { AnnotationHistoryModal } from './AnnotationHistoryModal';

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  highlights,
  allHighlights,
  onHighlight,
  onHighlightClick,
  onRemoveHighlight,
  onJumpToDocument,
  onExport,
  onClearAll,
  focusedHighlightId,
  projectConfig,
  projectId,
}) => {
  const {
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
    getAnnotationLevelColor,
    setShowAnnotationsModal,
    setShowExportDialog,
    setShowClearConfirmModal,
    setShowHistoryModal,
    setExportType,
  } = useDocumentViewer({
    document,
    highlights,
    onExport,
    onClearAll,
    focusedHighlightId,
    projectConfig,
  });

  return (
    <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
      {/* Header */}
      <DocumentViewerHeader
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onSearchKeyDown={handleSearchKeyDown}
        onClearSearch={clearSearch}
        searchMatches={searchMatches}
        onNavigateMatch={navigateToMatch}
        onExport={handleDirectExport}
        onClearAll={handleClearAll}
        onShowAnnotations={() => setShowAnnotationsModal(true)}
        onShowHistory={() => setShowHistoryModal(true)}
        highlightsCount={(allHighlights || highlights).length}
        document={document}
        projectConfig={projectConfig}
        selectedRelevancyLevel={selectedRelevancyLevel}
        onRelevancyLevelSelect={handleRelevancyLevelSelect}
      />

      {/* Content */}
      <DocumentViewerContent
        document={document}
        highlights={highlights}
        onHighlight={onHighlight}
        onHighlightClick={onHighlightClick}
        onRemoveHighlight={onRemoveHighlight}
        focusedHighlightId={focusedHighlightId}
        selectedRelevancyLevel={selectedRelevancyLevel}
        getAnnotationLevelColor={getAnnotationLevelColor}
        flashHighlights={flashHighlights}
        projectConfig={projectConfig}
        searchTerm={searchTerm}
        searchMatches={searchMatches}
        currentMatchIndex={currentMatchIndex}
      />

      {/* Modals */}
      <DocumentViewerModals
        showExportDialog={showExportDialog}
        onCloseExportDialog={() => setShowExportDialog(false)}
        onExport={handleDirectExport}
        exportType={exportType}
        onExportTypeChange={(type) => setExportType(type)}
        showClearConfirmModal={showClearConfirmModal}
        onCloseClearConfirmModal={() => setShowClearConfirmModal(false)}
        onConfirmClear={handleConfirmClear}
        showAnnotationsModal={showAnnotationsModal}
        onCloseAnnotationsModal={() => setShowAnnotationsModal(false)}
        highlights={allHighlights || highlights}
        selectedAnnotations={selectedAnnotations}
        onAnnotationSelect={handleAnnotationSelect}
        onSelectAll={handleSelectAll}
        onJumpToAnnotation={handleJumpToAnnotation}
        onJumpToDocument={onJumpToDocument}
        onDeleteHighlight={onRemoveHighlight}
        projectConfig={projectConfig}
      />

      {/* History Modal */}
      {projectId && (
        <AnnotationHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          projectId={projectId}
          projectConfig={projectConfig}
          onDeleteEntry={(entryId) => {
            // Optionally refresh the history or show a toast
          }}
        />
      )}
    </div>
  );
};
