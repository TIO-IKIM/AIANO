import { useState } from 'react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Input } from '@ikim-ui/ui-components/primitive/input';
import { Textarea } from '@ikim-ui/ui-components/primitive/textarea';
import { Label } from '@ikim-ui/ui-components/primitive/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Badge } from '@ikim-ui/ui-components/primitive/badge';
import { Plus, Trash2, Tag } from 'lucide-react';
import { ProjectConfig } from '../../types';

interface ProjectInfoStepProps {
  config: ProjectConfig;
  onConfigChange: (updates: Partial<ProjectConfig>) => void;
  onAddTag: (color: string) => void;
  onRemoveTag: (index: number) => void;
  newTag: string;
  onNewTagChange: (tag: string) => void;
}

export function ProjectInfoStep({
  config,
  onConfigChange,
  onAddTag,
  onRemoveTag,
  newTag,
  onNewTagChange,
}: ProjectInfoStepProps) {
  const [newTagColor, setNewTagColor] = useState('#3b82f6');

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Project Information</h1>
        <p className="text-muted-foreground">
          Let&apos;s start by setting up the basic information for your project
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">1</span>
            </div>
            Project Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium" htmlFor="project-name">
                Project Name *
              </Label>
              <Input
                id="project-name"
                value={config.name || ''}
                onChange={(e) => onConfigChange({ name: e.target.value })}
                placeholder="Enter project name"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium" htmlFor="dataset-name">
                Dataset Name *
              </Label>
              <Input
                id="dataset-name"
                value={config.dataset?.name || ''}
                onChange={(e) =>
                  onConfigChange({
                    dataset: {
                      name: e.target.value,
                      description: config.dataset?.description || '',
                      fields: config.dataset?.fields || [],
                    },
                  })
                }
                placeholder="Enter dataset name"
                required
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label
                className="text-sm font-medium"
                htmlFor="project-description"
              >
                Project Description
              </Label>
              <Textarea
                id="project-description"
                value={config.description || ''}
                onChange={(e) =>
                  onConfigChange({ description: e.target.value })
                }
                placeholder="Brief project description"
                rows={2}
                className="w-full resize-none"
              />
            </div>
            <div className="space-y-1">
              <Label
                className="text-sm font-medium"
                htmlFor="dataset-description"
              >
                Dataset Description
              </Label>
              <Textarea
                id="dataset-description"
                value={config.dataset?.description || ''}
                onChange={(e) =>
                  onConfigChange({
                    dataset: {
                      name: config.dataset?.name || '',
                      description: e.target.value,
                      fields: config.dataset?.fields || [],
                    },
                  })
                }
                placeholder="Brief dataset description"
                rows={2}
                className="w-full resize-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium" htmlFor="new-tag">
              Add Tag
            </Label>
            <div className="flex gap-2">
              <Input
                id="new-tag"
                value={newTag}
                onChange={(e) => onNewTagChange(e.target.value)}
                placeholder="Tag name"
                className="flex-1 h-10"
              />
              <input
                type="color"
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
              />
              <Button
                onClick={() => {
                  onAddTag(newTagColor);
                  setNewTagColor('#3b82f6');
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 h-10"
                disabled={!newTag.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tags Display */}
          {config.tags && config.tags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Project Tags ({config.tags.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {config.tags.map((tag: any, index: number) => {
                  const tagObj =
                    typeof tag === 'string'
                      ? { id: `legacy_${index}`, name: tag, color: '#6b7280' }
                      : tag;
                  return (
                    <div key={index} className="flex items-center gap-1 group">
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: tagObj.color,
                          color: 'white',
                        }}
                        className="px-2 py-1 text-xs"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tagObj.name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveTag(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
