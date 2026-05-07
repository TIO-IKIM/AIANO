import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ikim-ui/ui-components/primitive/select';
import { Badge } from '@ikim-ui/ui-components/primitive/badge';
import { Switch } from '@ikim-ui/ui-components/primitive/switch';
import {
  Plus,
  Trash2,
  Database,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { ProjectConfig, DatasetField } from '../../types';
import { InlineInfo, INFO_CONTENT } from '@/components/InfoPoint';

interface DatasetFieldsStepProps {
  config: ProjectConfig;
  onConfigChange: (updates: Partial<ProjectConfig>) => void;
  onAddField: () => void;
  onRemoveField: (fieldId: string) => void;
  newField: DatasetField;
  onNewFieldChange: (updates: Partial<DatasetField>) => void;
}

export function DatasetFieldsStep({
  config,
  onConfigChange,
  onAddField,
  onRemoveField,
  newField,
  onNewFieldChange,
}: DatasetFieldsStepProps) {
  const [isFieldsExpanded, setIsFieldsExpanded] = useState(false);

  // Check if there are any fields to show
  const hasFields = config.dataset?.fields && config.dataset.fields.length > 0;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Data Configuration</h1>
        <p className="text-muted-foreground">
          Define the structure of your input data and output dataset
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">2</span>
            </div>
            <Database className="w-5 h-5" />
            Data Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Data Section */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="text-lg font-semibold">Add New Field</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label
                  htmlFor="field-name"
                  className="flex items-center gap-1 text-sm font-medium"
                >
                  Field Name
                  <InlineInfo content={INFO_CONTENT.FIELD_NAME} />
                </Label>
                <Input
                  id="field-name"
                  value={newField.name || ''}
                  onChange={(e) => onNewFieldChange({ name: e.target.value })}
                  placeholder="Enter field name"
                  className="h-10"
                />
              </div>
              <div className="space-y-1">
                <Label
                  htmlFor="field-type"
                  className="flex items-center gap-1 text-sm font-medium"
                >
                  Field Type
                  <InlineInfo
                    content={
                      newField.type === 'date'
                        ? 'Accepted date formats: YYYY-MM-DD (e.g., 2016-05-09), MM/DD/YYYY, DD/MM/YYYY, or ISO 8601 format. Recommended: YYYY-MM-DD for best compatibility.'
                        : INFO_CONTENT.FIELD_TYPE
                    }
                  />
                </Label>
                <Select
                  value={newField.type || 'text'}
                  onValueChange={(value) =>
                    onNewFieldChange({ type: value as any })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select field data type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                    <SelectItem value="array">Array</SelectItem>
                    <SelectItem value="object">Object</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label
                htmlFor="field-description"
                className="text-sm font-medium"
              >
                Description (Optional)
              </Label>
              <Input
                id="field-description"
                value={newField.description || ''}
                onChange={(e) =>
                  onNewFieldChange({ description: e.target.value })
                }
                placeholder="Describe what this field contains"
                className="h-10"
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="field-required"
                  checked={newField.required || false}
                  onCheckedChange={(checked) =>
                    onNewFieldChange({ required: checked })
                  }
                />
                <Label
                  htmlFor="field-required"
                  className="flex items-center gap-1 text-xs font-medium"
                >
                  Required
                  <InlineInfo content={INFO_CONTENT.FIELD_REQUIRED} />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="field-can-be-input"
                  checked={newField.canBeInput || false}
                  onCheckedChange={(checked) =>
                    onNewFieldChange({ canBeInput: checked })
                  }
                />
                <Label
                  htmlFor="field-can-be-input"
                  className="flex items-center gap-1 text-xs font-medium"
                >
                  AI Input
                  <InlineInfo content={INFO_CONTENT.FIELD_AI_INPUT} />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="field-is-document"
                  checked={newField.isDocument || false}
                  onCheckedChange={(checked) => {
                    onNewFieldChange({
                      isDocument: checked,
                      showForAnnotator: checked
                        ? false
                        : newField.showForAnnotator,
                    });
                  }}
                />
                <Label
                  htmlFor="field-is-document"
                  className="flex items-center gap-1 text-xs font-medium"
                >
                  Document Content
                  <InlineInfo content={INFO_CONTENT.FIELD_DOCUMENT_CONTENT} />
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="field-show-annotator"
                  checked={newField.showForAnnotator || false}
                  onCheckedChange={(checked) => {
                    onNewFieldChange({
                      showForAnnotator: checked,
                      isDocument: checked ? false : newField.isDocument,
                    });
                  }}
                />
                <Label
                  htmlFor="field-show-annotator"
                  className="flex items-center gap-1 text-xs font-medium"
                >
                  Document Metadata
                  <InlineInfo content={INFO_CONTENT.FIELD_DOCUMENT_METADATA} />
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="field-include-final"
                checked={newField.includeInFinalDataset || false}
                onCheckedChange={(checked) =>
                  onNewFieldChange({ includeInFinalDataset: checked })
                }
              />
              <Label
                htmlFor="field-include-final"
                className="flex items-center gap-1 text-xs font-medium"
              >
                Include in Output Dataset
                <InlineInfo content={INFO_CONTENT.FIELD_OUTPUT_DATASET} />
              </Label>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                onClick={onAddField}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center h-10"
                disabled={!newField.name}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Field
              </Button>
              {!newField.name && (
                <p className="text-xs text-muted-foreground">
                  Enter field name to add
                </p>
              )}
            </div>
          </div>

          {/* Existing Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold">Existing Fields</h4>
                {hasFields && (
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {config.dataset?.fields?.length || 0} field
                    {(config.dataset?.fields?.length || 0) !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              {hasFields && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFieldsExpanded(!isFieldsExpanded)}
                  className="flex items-center gap-2 hover:bg-background h-8"
                >
                  {isFieldsExpanded ? (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3 h-3" />
                      Expand
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Show fields only when expanded */}
            {isFieldsExpanded && (
              <>
                {/* Document Content Fields */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-primary flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    Document Content Fields
                  </h5>
                  {config.dataset?.fields
                    ?.filter((field) => field.isDocument)
                    .map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-card border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {field.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary text-xs"
                            >
                              Document Content
                            </Badge>
                            {field.includeInFinalDataset && (
                              <Badge variant="secondary" className="text-xs">
                                Output Dataset
                              </Badge>
                            )}
                            {field.canBeInput && (
                              <Badge variant="secondary" className="text-xs">
                                AI Input
                              </Badge>
                            )}
                          </div>
                          {field.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {field.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => onRemoveField(field.id)}
                          size="sm"
                          className="text-destructive hover:text-destructive/80 h-8 w-8"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  {config.dataset?.fields?.filter((field) => field.isDocument)
                    .length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                        <Database className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium mb-1">
                        No document content fields added yet
                      </p>
                      <p className="text-xs">
                        Add your first field above to get started
                      </p>
                    </div>
                  )}
                </div>

                {/* Metadata Fields */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-emerald-600 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    Document Metadata Fields
                  </h5>
                  {config.dataset?.fields
                    ?.filter(
                      (field) => field.showForAnnotator && !field.isDocument
                    )
                    .map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-card border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {field.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                            <Badge
                              variant="secondary"
                              className="bg-emerald-100 text-emerald-800 text-xs"
                            >
                              Metadata
                            </Badge>
                            {field.includeInFinalDataset && (
                              <Badge variant="secondary" className="text-xs">
                                Output Dataset
                              </Badge>
                            )}
                            {field.canBeInput && (
                              <Badge variant="secondary" className="text-xs">
                                AI Input
                              </Badge>
                            )}
                          </div>
                          {field.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {field.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => onRemoveField(field.id)}
                          size="sm"
                          className="text-destructive hover:text-destructive/80 h-8 w-8"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  {config.dataset?.fields?.filter(
                    (field) => field.showForAnnotator && !field.isDocument
                  ).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                        <Database className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium mb-1">
                        No metadata fields added yet
                      </p>
                      <p className="text-xs">
                        Add your first field above to get started
                      </p>
                    </div>
                  )}
                </div>

                {/* Other Fields */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                    Other Fields
                  </h5>
                  {config.dataset?.fields
                    ?.filter(
                      (field) => !field.isDocument && !field.showForAnnotator
                    )
                    .map((field) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-card border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {field.name}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {field.type}
                            </Badge>
                            {field.required && (
                              <Badge variant="destructive" className="text-xs">
                                Required
                              </Badge>
                            )}
                            {field.includeInFinalDataset && (
                              <Badge variant="secondary" className="text-xs">
                                Output Dataset
                              </Badge>
                            )}
                            {field.canBeInput && (
                              <Badge variant="secondary" className="text-xs">
                                AI Input
                              </Badge>
                            )}
                          </div>
                          {field.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {field.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => onRemoveField(field.id)}
                          size="sm"
                          className="text-destructive hover:text-destructive/80 h-8 w-8"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  {config.dataset?.fields?.filter(
                    (field) => !field.isDocument && !field.showForAnnotator
                  ).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                        <Database className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium mb-1">
                        No other fields added yet
                      </p>
                      <p className="text-xs">
                        Add your first field above to get started
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Show empty state when no fields exist */}
            {!hasFields && (
              <div className="text-center py-6 text-muted-foreground">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                  <Database className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium mb-1">No fields added yet</p>
                <p className="text-xs">
                  Add your first field above to get started
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
