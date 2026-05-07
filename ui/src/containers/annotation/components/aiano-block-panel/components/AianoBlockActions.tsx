import React from 'react';
import { Wand2, X, Loader2 } from 'lucide-react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ikim-ui/ui-components/primitive/tooltip';
import { AianoBlockActionsProps } from '../types/AianoBlockPanel.types';

export const AianoBlockActions: React.FC<AianoBlockActionsProps> = ({
  block,
  value,
  isGenerating,
  hasError,
  mode,
  onGenerateAI,
  onClearBlock,
  areInputRequirementsMet,
  getInputRequirementReason,
  isLLMConfigured,
}) => (
  <div className="flex flex-col gap-2 min-w-[40px] flex-shrink-0">
    {/* Always show generate button when AI is enabled */}
    {block.aiEnabled && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button
                onClick={() => {
                  onGenerateAI(block.id);
                }}
                disabled={
                  isGenerating ||
                  !isLLMConfigured() ||
                  !areInputRequirementsMet(block)
                }
                size="sm"
                className={`w-8 h-8 p-0 rounded-md shadow-sm flex items-center justify-center ${
                  isGenerating
                    ? 'bg-primary/80 text-primary-foreground cursor-wait'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground disabled:bg-muted disabled:cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <Loader2
                    size={12}
                    className="animate-spin text-primary-foreground"
                  />
                ) : (
                  <Wand2 size={12} />
                )}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {isGenerating
                ? 'Generating...'
                : !isLLMConfigured()
                  ? 'Configure your LLM from Project Settings in the top right corner'
                  : !areInputRequirementsMet(block)
                    ? getInputRequirementReason(block)
                    : value?.trim()
                      ? 'Clear and generate new content'
                      : block.soloMode
                        ? 'Generate with solo mode (no context needed)'
                        : 'Generate with AI'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}

    {/* Show clear button when text is present */}
    {value?.trim() && (
      <Button
        onClick={() => onClearBlock(block.id)}
        disabled={mode === 'view'}
        size="sm"
        className="w-8 h-8 p-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:bg-muted disabled:cursor-not-allowed rounded-md shadow-sm flex items-center justify-center"
        title="Clear input"
      >
        <X size={12} />
      </Button>
    )}
  </div>
);
