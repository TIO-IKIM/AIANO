import React from 'react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ikim-ui/ui-components/primitive/tooltip';
import { AnnotationLevel } from '@/containers/project/types';
import { InlineInfo, INFO_CONTENT } from '@/components/InfoPoint';

interface AnnotationLevelPaletteProps {
  annotationLevels: AnnotationLevel[];
  selectedLevelId?: string;
  onLevelSelect: (levelId: string) => void;
}

export const AnnotationLevelPalette: React.FC<AnnotationLevelPaletteProps> = ({
  annotationLevels,
  selectedLevelId,
  onLevelSelect,
}) => {
  const sortedLevels = annotationLevels || [];

  return (
    <div className="bg-muted rounded p-1 border border-border">
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-muted-foreground mr-1 pl-2 flex items-center gap-1">
          Level:
          <InlineInfo content={INFO_CONTENT.ANNOTATION_LEVEL_PALETTE} />
        </span>
        <div className="flex gap-0.5">
          {sortedLevels.map((level) => (
            <TooltipProvider key={level.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onLevelSelect(level.id)}
                    variant="ghost"
                    size="sm"
                    className={`h-6 w-6 p-0 rounded-full transition-all duration-200 ${
                      selectedLevelId === level.id
                        ? 'ring-1 ring-blue-500 shadow-sm'
                        : 'hover:shadow-sm'
                    }`}
                    style={{
                      backgroundColor:
                        selectedLevelId === level.id
                          ? level.color
                          : `${level.color}40`,
                      border:
                        selectedLevelId === level.id
                          ? `1px solid ${level.color}`
                          : `1px solid ${level.color}60`,
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: level.color }}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-center">
                    <p className="font-medium text-sm">{level.name}</p>
                    {level.description && (
                      <p className="text-xs opacity-80">{level.description}</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    </div>
  );
};
