import React from 'react';
import { Bot, Settings } from 'lucide-react';
import { Badge } from '@ikim-ui/ui-components/primitive/badge';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { CardTitle } from '@ikim-ui/ui-components/primitive/card';
import { AianoBlockHeaderProps } from '../types/AianoBlockPanel.types';

export const AianoBlockHeader: React.FC<AianoBlockHeaderProps> = ({
  block,
  projectConfig,
  blockValues,
  highlights,
  selectedDocument,
  areInputRequirementsMet,
}) => (
  <>
    <div className="flex items-center justify-between">
      <CardTitle className="text-sm font-semibold text-foreground">
        {block.label}
      </CardTitle>
      <div className="flex items-center gap-2">
        {block.type === 'text' && block.aiEnabled && (
          <>
            <Badge
              variant={block.soloMode ? 'secondary' : 'default'}
              className="text-[10px] px-1.5 py-0.5"
            >
              <Bot size={10} className="mr-0.5" />
              {block.soloMode ? 'Solo' : 'AI'}
            </Badge>
            {block.id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  // Trigger custom event to open AI config in drawer
                  window.dispatchEvent(
                    new CustomEvent('openAIConfig', {
                      detail: { blockId: block.id },
                    })
                  );
                }}
                title="Configure AI settings"
              >
                <Settings size={12} />
              </Button>
            )}
          </>
        )}
      </div>
    </div>

    {/* Input Sources Labels */}
    {block.aiEnabled &&
      block.aiConfig?.inputSources &&
      block.aiConfig.inputSources.length > 0 && (
        <div>
          <div className="flex flex-wrap gap-1">
            <span className="text-xs text-muted-foreground font-medium">
              Inputs:
            </span>
            {block.aiConfig.inputSources.map((inputSource, index) => {
              let label = '';
              let isAvailable = true;

              switch (inputSource.type) {
                case 'aiano_block':
                  // Try multiple matching strategies
                  const blockName = (() => {
                    // Strategy 1: Direct ID match
                    let found = projectConfig.aianoBlocks?.find(
                      (b) => b.id?.toString() === inputSource.sourceId
                    );
                    if (found) {
                      return found.name;
                    }

                    // Strategy 2: Pattern match with temp- prefix
                    found = projectConfig.aianoBlocks?.find((b) =>
                      inputSource.sourceId?.includes(`temp-${b.name}`)
                    );
                    if (found) {
                      return found.name;
                    }

                    // Strategy 3: Pattern match without temp- prefix
                    found = projectConfig.aianoBlocks?.find((b) =>
                      inputSource.sourceId?.includes(b.name)
                    );
                    if (found) {
                      return found.name;
                    }

                    // Strategy 4: Fallback - match by label if sourceId is undefined
                    if (!inputSource.sourceId && inputSource.label) {
                      found = projectConfig.aianoBlocks?.find(
                        (b) => b.name === inputSource.label
                      );
                      if (found) {
                        return found.name;
                      }
                    }

                    return 'Unknown Block';
                  })();

                  label = blockName;

                  // Use the same improved logic for targetBlock
                  const targetBlock = (() => {
                    // Strategy 1: Direct ID match
                    let found = projectConfig.aianoBlocks?.find(
                      (b) => b.id?.toString() === inputSource.sourceId
                    );
                    if (found) return found;

                    // Strategy 2: Pattern match with temp- prefix
                    found = projectConfig.aianoBlocks?.find((b) =>
                      inputSource.sourceId?.includes(`temp-${b.name}`)
                    );
                    if (found) return found;

                    // Strategy 3: Pattern match without temp- prefix
                    found = projectConfig.aianoBlocks?.find((b) =>
                      inputSource.sourceId?.includes(b.name)
                    );
                    if (found) return found;

                    return null;
                  })();

                  isAvailable = targetBlock
                    ? Boolean(blockValues[targetBlock.id])
                    : false;
                  break;

                case 'annotation':
                  if (inputSource.annotationType === 'all') {
                    label = 'All Annotations';
                    isAvailable = Object.values(highlights).some(
                      (docHighlights) =>
                        docHighlights && docHighlights.length > 0
                    );
                  } else if (inputSource.annotationType === 'relevancy') {
                    const level = projectConfig.annotationLevels?.find(
                      (l) => l.id === inputSource.sourceId
                    );
                    label = level?.name || 'Relevancy Level';
                    isAvailable = Object.values(highlights).some(
                      (docHighlights) =>
                        docHighlights &&
                        docHighlights.some(
                          (highlight) =>
                            highlight.annotationLevelId === inputSource.sourceId
                        )
                    );
                  }
                  break;

                case 'dataset_field':
                  const field = projectConfig.dataset?.fields?.find(
                    (f) => f.id === inputSource.datasetFieldId
                  );
                  label = field?.name || 'Dataset Field';
                  isAvailable =
                    selectedDocument && field
                      ? selectedDocument[field.name] !== undefined &&
                        selectedDocument[field.name] !== null
                      : false;
                  break;
              }

              return (
                <Badge
                  key={index}
                  variant={isAvailable ? 'default' : 'secondary'}
                  className="text-[10px] px-1.5 py-0.5"
                >
                  {label}
                  {inputSource.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

    {block.description && (
      <p className="text-xs text-muted-foreground">{block.description}</p>
    )}
  </>
);
