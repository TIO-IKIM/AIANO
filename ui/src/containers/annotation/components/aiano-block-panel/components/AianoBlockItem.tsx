import React, { memo } from 'react';
import { Bot } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Badge } from '@ikim-ui/ui-components/primitive/badge';
import { AianoBlockItemProps } from '../types/AianoBlockPanel.types';
import { AianoBlockHeader } from './AianoBlockHeader';
import { AianoBlockForm } from './AianoBlockForm';
import { AianoBlockActions } from './AianoBlockActions';

export const AianoBlockItem: React.FC<AianoBlockItemProps> = memo(
  ({
    block,
    value,
    isGenerating,
    hasError,
    errorMessage,
    mode,
    projectConfig,
    blockValues,
    highlights,
    selectedDocument,
    llmConfig,
    onBlockValueChange,
    onGenerateAI,
    onClearBlock,
    areInputRequirementsMet,
    getInputRequirementReason,
    isLLMConfigured,
  }) => {
    const currentValue = value || block.defaultValue || '';

    return (
      <Card className="mb-2 border border-border rounded-lg bg-card">
        <CardHeader className="py-0.5 px-3">
          <AianoBlockHeader
            block={block}
            projectConfig={projectConfig}
            blockValues={blockValues}
            highlights={highlights}
            selectedDocument={selectedDocument}
            areInputRequirementsMet={areInputRequirementsMet}
          />
        </CardHeader>

        <CardContent className="py-0 px-3">
          {block.type === 'text' ? (
            <div className="flex gap-3 items-start">
              <AianoBlockForm
                block={block}
                value={currentValue}
                mode={mode}
                onValueChange={(newValue) =>
                  onBlockValueChange(block.id, newValue)
                }
              />
              <AianoBlockActions
                block={block}
                value={currentValue}
                isGenerating={isGenerating}
                hasError={hasError}
                mode={mode}
                onGenerateAI={onGenerateAI}
                onClearBlock={onClearBlock}
                areInputRequirementsMet={areInputRequirementsMet}
                getInputRequirementReason={getInputRequirementReason}
                isLLMConfigured={isLLMConfigured}
              />
            </div>
          ) : (
            <AianoBlockForm
              block={block}
              value={currentValue}
              mode={mode}
              onValueChange={(newValue) =>
                onBlockValueChange(block.id, newValue)
              }
            />
          )}
        </CardContent>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memoization - re-render if relevant props change
    // IMPORTANT: Check highlights and blockValues so button state updates when annotations are created
    // Use shallow comparison for highlights (check if the object reference changed or key count changed)
    const highlightsChanged =
      prevProps.highlights !== nextProps.highlights ||
      Object.keys(prevProps.highlights || {}).length !==
        Object.keys(nextProps.highlights || {}).length ||
      Object.keys(prevProps.highlights || {}).some(
        (key) =>
          (prevProps.highlights[key]?.length || 0) !==
          (nextProps.highlights[key]?.length || 0)
      );

    // Check if blockValues changed (shallow comparison)
    const blockValuesChanged =
      prevProps.blockValues !== nextProps.blockValues ||
      Object.keys(prevProps.blockValues || {}).length !==
        Object.keys(nextProps.blockValues || {}).length;

    return (
      prevProps.block.id === nextProps.block.id &&
      prevProps.value === nextProps.value &&
      prevProps.isGenerating === nextProps.isGenerating &&
      prevProps.hasError === nextProps.hasError &&
      prevProps.errorMessage === nextProps.errorMessage &&
      prevProps.mode === nextProps.mode &&
      prevProps.selectedDocument?.Document_Id ===
        nextProps.selectedDocument?.Document_Id &&
      !highlightsChanged &&
      !blockValuesChanged
    );
  }
);
