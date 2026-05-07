import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Input } from '@ikim-ui/ui-components/primitive/input';
import { Label } from '@ikim-ui/ui-components/primitive/label';
import { Textarea } from '@ikim-ui/ui-components/primitive/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Badge } from '@ikim-ui/ui-components/primitive/badge';
import { Plus, Trash2, FileText } from 'lucide-react';
import { AnnotationLevelsSectionProps } from '../types/SectionProps.types';
import { InlineInfo, INFO_CONTENT } from '@/components/InfoPoint';

export function AnnotationLevelsSection({
  config,
  newAnnotationLevel,
  onConfigChange,
  onNewAnnotationLevelChange,
  onAddAnnotationLevel,
  onRemoveAnnotationLevel,
  onUpdateAnnotationLevel,
}: AnnotationLevelsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Annotation Levels
          <InlineInfo content={INFO_CONTENT.ANNOTATION_LEVELS} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Popular Levels */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">
            Popular Levels
          </h4>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onNewAnnotationLevelChange({
                  name: 'IRRELEVANT',
                  color: '#ef4444',
                  score: 0,
                  description:
                    'Content that is not relevant to the main topic or question',
                });
              }}
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300"
            >
              IRRELEVANT
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onNewAnnotationLevelChange({
                  name: 'RELEVANT',
                  color: '#22c55e',
                  score: 1,
                  description:
                    'Content that is directly relevant to the main topic or question',
                });
              }}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300"
            >
              RELEVANT
            </Button>
          </div>
        </div>

        {/* Add New Annotation Level */}
        <div className="space-y-4 p-6 border rounded-lg bg-muted/50">
          <h4 className="font-medium pt-2">Add New Annotation Level</h4>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label
                htmlFor="level-name"
                className="flex items-center gap-1 mb-3"
              >
                Level Name
                <InlineInfo content={INFO_CONTENT.LEVEL_NAME} />
              </Label>
              <Input
                id="level-name"
                value={newAnnotationLevel.name || ''}
                onChange={(e) =>
                  onNewAnnotationLevelChange({ name: e.target.value })
                }
                placeholder="Enter a descriptive name for this annotation level (e.g., 'Important', 'Key Point', 'Evidence')"
                className="px-3 py-2"
              />
            </div>
            <div>
              <Label
                htmlFor="level-color"
                className="flex items-center gap-1 mb-3"
              >
                Color
                <InlineInfo content={INFO_CONTENT.LEVEL_COLOR} />
              </Label>
              <div className="flex gap-2">
                <Input
                  id="level-color"
                  type="color"
                  value={newAnnotationLevel.color || '#ef4444'}
                  onChange={(e) =>
                    onNewAnnotationLevelChange({ color: e.target.value })
                  }
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={newAnnotationLevel.color || '#ef4444'}
                  onChange={(e) =>
                    onNewAnnotationLevelChange({ color: e.target.value })
                  }
                  placeholder="#ef4444"
                  className="flex-1 px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <Label
                htmlFor="level-score"
                className="flex items-center gap-1 mb-3"
              >
                Score (0 = lowest priority)
                <InlineInfo content={INFO_CONTENT.LEVEL_SCORE} />
              </Label>
              <Input
                id="level-score"
                type="number"
                value={newAnnotationLevel.score || 0}
                onChange={(e) =>
                  onNewAnnotationLevelChange({
                    score: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter priority score (0 = lowest, higher numbers = higher priority)"
                className="px-3 py-2"
              />
            </div>
            <div>
              <Label
                htmlFor="level-description"
                className="flex items-center gap-1 mb-3"
              >
                Description (Optional)
                <InlineInfo content={INFO_CONTENT.LEVEL_DESCRIPTION} />
              </Label>
              <Input
                id="level-description"
                value={newAnnotationLevel.description || ''}
                onChange={(e) =>
                  onNewAnnotationLevelChange({ description: e.target.value })
                }
                placeholder="Enter a detailed description of what this annotation level represents (e.g., 'High priority information that is crucial for understanding the main topic')"
                className="px-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              onClick={onAddAnnotationLevel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
              disabled={!newAnnotationLevel.name}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
            {!newAnnotationLevel.name && (
              <p className="text-sm text-muted-foreground ml-3">
                Enter level name to add
              </p>
            )}
          </div>
        </div>

        {/* Existing Relevancy Levels */}
        <div className="space-y-2 pt-4">
          <h4 className="font-medium pt-2">Existing Levels</h4>
          {config.annotationLevels?.map((level) => (
            <div
              key={level.id}
              className="flex items-center gap-3 p-3 border rounded-lg bg-card"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{level.name}</span>
                  <Badge
                    variant="outline"
                    style={{ backgroundColor: level.color, color: 'white' }}
                  >
                    Score: {level.score}
                  </Badge>
                </div>
                {level.description && (
                  <p className="text-sm text-muted-foreground">
                    {level.description}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => onRemoveAnnotationLevel(level.id)}
                size="sm"
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {(!config.annotationLevels ||
            config.annotationLevels.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No relevancy levels added yet. Add your first level above.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
