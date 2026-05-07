import React from 'react';
import { Bot, Check, X, Download } from 'lucide-react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { AianoBlockPanelProps } from './types/AianoBlockPanel.types';
import { useAianoBlockPanel } from './hooks/useAianoBlockPanel';
import { AianoBlockItem } from './components/AianoBlockItem';
import { AianoBlockSubmit } from './components/AianoBlockSubmit';
import { SubmitWithoutHighlightsDialog } from './components/SubmitWithoutHighlightsDialog';
import { InlineInfo, INFO_CONTENT } from '@/components/InfoPoint';

export const AianoBlockPanel: React.FC<AianoBlockPanelProps> = ({
  projectConfig,
  blockValues,
  onBlockValueChange,
  onGenerateAI,
  isGenerating,
  aiErrors,
  llmConfig,
  mode,
  highlights = {},
  selectedDocument,
  onSubmit,
}) => {
  const {
    showToast,
    showSubmitWithoutHighlightsDialog,
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
  } = useAianoBlockPanel({
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
  });

  const sortedBlocks = projectConfig?.aianoBlocks || [];

  const handleClearBlock = (blockId: string) => {
    onBlockValueChange(blockId, '');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-4 border-b border-border bg-card shadow-sm min-h-[88px]">
        <div className="flex items-center justify-between h-full">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              {mode === 'edit' ? 'Edit Annotation' : 'Tasks'}
              <InlineInfo content={INFO_CONTENT.AIANO_BLOCK_PANEL} />
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Complete the annotation tasks below
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Blocks */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* LLM Configuration Warning */}
        {!isLLMConfigured() &&
          sortedBlocks.some((block) => block.aiEnabled) && (
            <div className="mb-4 p-3 bg-muted border border-border rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Please configure your AI model
              </p>
            </div>
          )}

        {sortedBlocks.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            <div className="bg-card rounded-lg border-2 border-dashed border-border p-8">
              <Bot
                size={48}
                className="mx-auto mb-4 text-muted-foreground/50"
              />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Tasks configured
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configure Tasks in the project settings to start annotating.
              </p>
              <div className="text-xs text-muted-foreground/70">
                Tasks allow you to create custom annotation fields with AI
                assistance.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedBlocks.map((block, index) => (
              <AianoBlockItem
                key={block.id || `temp-${block.name}-${block.type}-${index}`}
                block={block}
                value={blockValues[block.id] || block.defaultValue || ''}
                isGenerating={isGenerating[block.id] || false}
                hasError={Boolean(aiErrors[block.id])}
                errorMessage={aiErrors[block.id] || ''}
                mode={mode}
                projectConfig={projectConfig}
                blockValues={blockValues}
                highlights={highlights}
                selectedDocument={selectedDocument}
                llmConfig={llmConfig}
                onBlockValueChange={onBlockValueChange}
                onGenerateAI={handleGenerateAI}
                onClearBlock={handleClearBlock}
                areInputRequirementsMet={areInputRequirementsMet}
                getInputRequirementReason={getInputRequirementReason}
                isLLMConfigured={isLLMConfigured}
              />
            ))}

            {/* Submit Button */}
            <AianoBlockSubmit
              canSubmit={canSubmit()}
              validationMessage={getValidationMessage()}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-[9999]">
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <Check size={20} className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Saved successfully!</p>
                <p className="text-sm mt-1 opacity-90">
                  Your annotation has been saved
                </p>
              </div>
              <button
                onClick={() => setShowToast(false)}
                className="h-6 w-6 p-0 hover:bg-black/10 rounded flex items-center justify-center"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Without Highlights Confirmation Dialog */}
      <SubmitWithoutHighlightsDialog
        isOpen={showSubmitWithoutHighlightsDialog}
        onClose={() => setShowSubmitWithoutHighlightsDialog(false)}
        onConfirm={handleConfirmSubmitWithoutHighlights}
      />
    </div>
  );
};
