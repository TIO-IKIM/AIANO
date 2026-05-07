import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ikim-ui/ui-components/primitive/card';
import { Badge } from '@ikim-ui/ui-components/primitive/badge';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Switch } from '@ikim-ui/ui-components/primitive/switch';
import { Label } from '@ikim-ui/ui-components/primitive/label';
import { Database, Eye, EyeOff, Tag, FileText } from 'lucide-react';
import { ProjectConfig, DatasetField } from '@/containers/project/types';

interface DatasetMetadataPanelProps {
  projectConfig: ProjectConfig;
  showMetadata: boolean;
  onToggleMetadata: (show: boolean) => void;
}

export function DatasetMetadataPanel({
  projectConfig,
  showMetadata,
  onToggleMetadata,
}: DatasetMetadataPanelProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const toggleFieldExpansion = (fieldId: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedFields(newExpanded);
  };

  const extractedFields = projectConfig.dataset.fields.filter(
    (f) => f.source === 'extracted'
  );
  const annotatorFields = projectConfig.dataset.fields.filter(
    (f) => f.source === 'annotator'
  );

  const getFieldTypeColor = (type: string) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800',
      number: 'bg-green-100 text-green-800',
      date: 'bg-purple-100 text-purple-800',
      boolean: 'bg-orange-100 text-orange-800',
      array: 'bg-pink-100 text-pink-800',
      object: 'bg-gray-100 text-gray-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝';
      case 'number':
        return '🔢';
      case 'date':
        return '📅';
      case 'boolean':
        return '✅';
      case 'array':
        return '📋';
      case 'object':
        return '📦';
      default:
        return '📄';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="w-5 h-5" />
            Dataset Metadata
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-metadata"
              checked={showMetadata}
              onCheckedChange={onToggleMetadata}
            />
            <Label htmlFor="show-metadata" className="text-sm">
              {showMetadata ? 'Hide' : 'Show'} Metadata
            </Label>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{projectConfig.dataset.name}</span>
            <Badge variant="outline">
              {projectConfig.inputFormat.toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Tag className="w-4 h-4" />
            <span>{projectConfig.tags?.length || 0} tags</span>
          </div>
        </div>
      </CardHeader>

      {showMetadata && (
        <CardContent className="space-y-4">
          {/* Extracted Fields */}
          {extractedFields.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Extracted Fields ({extractedFields.length})
              </h4>
              <div className="space-y-2">
                {extractedFields.map((field) => (
                  <div key={field.id} className="border rounded-lg p-3">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleFieldExpansion(field.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getFieldIcon(field.type)}
                        </span>
                        <span className="font-medium">{field.name}</span>
                        <Badge className={getFieldTypeColor(field.type)}>
                          {field.type}
                        </Badge>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        {expandedFields.has(field.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {expandedFields.has(field.id) && (
                      <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
                        {field.description && (
                          <p className="mb-1">{field.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span>Source: Extracted from dataset</span>
                          {field.options && field.options.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span>Options:</span>
                              <div className="flex gap-1">
                                {field.options.map((option, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {option}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Annotator Fields */}
          {annotatorFields.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Annotator Fields ({annotatorFields.length})
              </h4>
              <div className="space-y-2">
                {annotatorFields.map((field) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-3 bg-muted/20"
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleFieldExpansion(field.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {getFieldIcon(field.type)}
                        </span>
                        <span className="font-medium">{field.name}</span>
                        <Badge className={getFieldTypeColor(field.type)}>
                          {field.type}
                        </Badge>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          Annotator Added
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        {expandedFields.has(field.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    {expandedFields.has(field.id) && (
                      <div className="mt-2 pt-2 border-t text-sm text-muted-foreground">
                        {field.description && (
                          <p className="mb-1">{field.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <span>Source: Added by annotator</span>
                          {field.options && field.options.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span>Options:</span>
                              <div className="flex gap-1">
                                {field.options.map((option, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {option}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Labels */}
          {projectConfig.tags && projectConfig.tags.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Available Tags ({projectConfig.tags?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {projectConfig.tags?.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center gap-2 px-3 py-1 border rounded-full"
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-sm font-medium">{label.name}</span>
                    {label.category && (
                      <span className="text-xs text-muted-foreground">
                        ({label.category})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {projectConfig.dataset.fields.length === 0 &&
            (!projectConfig.tags || projectConfig.tags.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No dataset fields or labels configured</p>
                <p className="text-sm">
                  Configure your project to see metadata here
                </p>
              </div>
            )}
        </CardContent>
      )}
    </Card>
  );
}
