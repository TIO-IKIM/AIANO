import React from 'react';
import { DocumentList } from '../../components/DocumentList';
import { AianoBlockPanel } from '../../components/AianoBlockPanel';
import { DocumentViewer } from '../../components/DocumentViewer';
import { ResizablePanel } from '../../components/ResizablePanel';
import { AnnotationLayoutProps } from '../types/AnnotationContainer.types';

export const AnnotationLayout: React.FC<AnnotationLayoutProps> = ({
  documents,
  selectedDocument,
  highlights,
  blockValues,
  isGeneratingBlock,
  aiBlockErrors,
  focusedHighlightId,
  projectConfig,
  projectId,
  llmConfig,
  mode,
  onDocumentSelect,
  onDocumentDelete,
  onBlockValueChange,
  onGenerateAI,
  onDocumentHighlight,
  onHighlightClick,
  onRemoveHighlight,
  onJumpToDocument,
  onMainExport,
  onClearAnnotations,
  onFileUpload,
  onSubmitEntry,
  getAllHighlights,
}) => (
  <div className="flex-1 flex overflow-hidden min-h-0">
    {/* Document List Panel - Resizable */}
    <ResizablePanel
      initialWidth={320}
      minWidth={250}
      maxWidth={600}
      resizable="right"
    >
      <DocumentList
        documents={documents}
        selectedDocument={selectedDocument}
        highlights={highlights}
        onDocumentSelect={onDocumentSelect}
        onDocumentDelete={onDocumentDelete}
        projectConfig={projectConfig}
        onFileUpload={onFileUpload}
      />
    </ResizablePanel>

    {/* Document Viewer - Takes remaining space (moved to middle) */}
    <div className="flex-1 min-w-0">
      <DocumentViewer
        document={selectedDocument}
        highlights={
          selectedDocument ? highlights[selectedDocument.Document_Id] || [] : []
        }
        allHighlights={getAllHighlights()}
        onHighlight={onDocumentHighlight}
        onHighlightClick={onHighlightClick}
        onRemoveHighlight={onRemoveHighlight}
        onJumpToDocument={onJumpToDocument}
        onExport={onMainExport}
        onClearAll={onClearAnnotations}
        focusedHighlightId={focusedHighlightId}
        projectConfig={projectConfig}
        projectId={projectId ? parseInt(projectId) : undefined}
      />
    </div>

    {/* Question/Answer Panel - Resizable (moved to right) */}
    <ResizablePanel
      initialWidth={400}
      minWidth={300}
      maxWidth={700}
      resizable="left"
    >
      <div className="h-full border-l border-border">
        <AianoBlockPanel
          projectConfig={projectConfig!}
          blockValues={blockValues}
          onBlockValueChange={onBlockValueChange}
          onGenerateAI={onGenerateAI}
          isGenerating={isGeneratingBlock}
          aiErrors={aiBlockErrors}
          llmConfig={llmConfig}
          mode={mode}
          highlights={highlights}
          selectedDocument={selectedDocument}
          onSubmit={onSubmitEntry}
        />
      </div>
    </ResizablePanel>
  </div>
);
