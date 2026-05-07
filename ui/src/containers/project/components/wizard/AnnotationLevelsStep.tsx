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
import { ProjectConfig, AnnotationLevel } from '../../types';
import { InlineInfo, INFO_CONTENT } from '@/components/InfoPoint';

interface AnnotationLevelsStepProps {
  config: ProjectConfig;
  onConfigChange: (updates: Partial<ProjectConfig>) => void;
  onAddAnnotationLevel: () => void;
  onRemoveAnnotationLevel: (levelId: string) => void;
  newAnnotationLevel: AnnotationLevel;
  onNewAnnotationLevelChange: (updates: Partial<AnnotationLevel>) => void;
}

export function AnnotationLevelsStep({
  config,
  onConfigChange,
  onAddAnnotationLevel,
  onRemoveAnnotationLevel,
  newAnnotationLevel,
  onNewAnnotationLevelChange,
}: AnnotationLevelsStepProps) {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Annotation Levels</h1>
        <p className="text-muted-foreground">
          Define the different levels of annotation that will be used in your
          project
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">3</span>
            </div>
            <FileText className="w-5 h-5" />
            Annotation Levels
            <InlineInfo content={INFO_CONTENT.ANNOTATION_LEVELS} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Popular Levels */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">
              Popular Levels
            </h4>
            <div className="flex gap-3">
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
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 h-10 px-4"
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
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 h-10 px-4"
              >
                RELEVANT
              </Button>
            </div>
          </div>

          {/* Add New Annotation Level */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="text-lg font-semibold">Add New Annotation Level</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="level-name"
                  className="flex items-center gap-1 text-sm font-medium"
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
                  placeholder="Enter level name (e.g., 'Important', 'Key Point')"
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="level-color"
                  className="flex items-center gap-1 text-sm font-medium"
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
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={newAnnotationLevel.color || '#ef4444'}
                    onChange={(e) =>
                      onNewAnnotationLevelChange({ color: e.target.value })
                    }
                    placeholder="#ef4444"
                    className="flex-1 h-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="level-score"
                  className="flex items-center gap-1 text-sm font-medium"
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
                  placeholder="Enter priority score"
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="level-description"
                  className="flex items-center gap-1 text-sm font-medium"
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
                  placeholder="Brief description of this level"
                  className="h-10"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                onClick={onAddAnnotationLevel}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center h-10"
                disabled={!newAnnotationLevel.name}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Level
              </Button>
              {!newAnnotationLevel.name && (
                <p className="text-xs text-muted-foreground">
                  Enter level name to add
                </p>
              )}
            </div>
          </div>

          {/* Existing Relevancy Levels */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Existing Levels</h4>
            <div className="space-y-2">
              {config.annotationLevels?.map((level) => (
                <div
                  key={level.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{level.name}</span>
                      <Badge
                        variant="outline"
                        style={{ backgroundColor: level.color, color: 'white' }}
                        className="text-xs"
                      >
                        Score: {level.score}
                      </Badge>
                    </div>
                    {level.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {level.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => onRemoveAnnotationLevel(level.id)}
                    size="sm"
                    className="text-destructive hover:text-destructive/80 h-8 w-8"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {(!config.annotationLevels ||
                config.annotationLevels.length === 0) && (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium mb-1">
                    No annotation levels added yet
                  </p>
                  <p className="text-xs">
                    Add your first level above to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
