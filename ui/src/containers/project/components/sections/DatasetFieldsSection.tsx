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
import { DatasetFieldsSectionProps } from '../types/SectionProps.types';
import { InlineInfo, INFO_CONTENT } from '@/components/InfoPoint';

export function DatasetFieldsSection({
  config,
  newField,
  onConfigChange,
  onNewFieldChange,
  onAddField,
  onRemoveField,
}: DatasetFieldsSectionProps) {
  const [isFieldsExpanded, setIsFieldsExpanded] = useState(false);

  // Check if there are any fields to show
  const hasFields = config.dataset?.fields && config.dataset.fields.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Output Dataset Section */}
        <div className="space-y-4 p-6 border rounded-lg bg-muted/50">
          <h4 className="font-medium text-lg">Output Data</h4>
          <div className="space-y-6">
            <div>
              <Label
                htmlFor="dataset-name"
                className="flex items-center gap-1 mb-3"
              >
                Dataset Name *
                <InlineInfo content={INFO_CONTENT.DATASET_NAME} />
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
                className="w-full"
              />
            </div>
            <div>
              <Label
                htmlFor="dataset-description"
                className="flex items-center gap-1 mb-3"
              >
                Dataset Description
                <InlineInfo content={INFO_CONTENT.DATASET_DESCRIPTION} />
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
                placeholder="Enter dataset description"
                rows={4}
                className="w-full resize-none"
              />
            </div>
          </div>
        </div>

        {/* Input Data Section */}
        <div className="space-y-4 p-6 border rounded-lg bg-muted/50">
          <h4 className="font-medium text-lg">Input Data</h4>

          {/* Add New Field */}
          <div className="space-y-4">
            <h5 className="font-medium">Add New Field</h5>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label
                  htmlFor="field-name"
                  className="flex items-center gap-1 mb-3"
                >
                  Field Name
                  <InlineInfo content={INFO_CONTENT.FIELD_NAME} />
                </Label>
                <Input
                  id="field-name"
                  value={newField.name || ''}
                  onChange={(e) => onNewFieldChange({ name: e.target.value })}
                  placeholder="Enter field name"
                />
              </div>
              <div>
                <Label
                  htmlFor="field-type"
                  className="flex items-center gap-1 mb-3"
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
                  <SelectTrigger>
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

            <div>
              <Label htmlFor="field-description">Description (Optional)</Label>
              <Textarea
                id="field-description"
                value={newField.description || ''}
                onChange={(e) =>
                  onNewFieldChange({ description: e.target.value })
                }
                placeholder="Enter field description"
                rows={2}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  className="flex items-center gap-1"
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
                  className="flex items-center gap-1"
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
                    // When document is selected, uncheck metadata
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
                  className="flex items-center gap-1"
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
                    // When metadata is selected, uncheck document
                    onNewFieldChange({
                      showForAnnotator: checked,
                      isDocument: checked ? false : newField.isDocument,
                    });
                  }}
                />
                <Label
                  htmlFor="field-show-annotator"
                  className="flex items-center gap-1"
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
                className="flex items-center gap-1"
              >
                Include in Output Dataset
                <InlineInfo content={INFO_CONTENT.FIELD_OUTPUT_DATASET} />
              </Label>
            </div>

            <div className="flex items-center justify-between">
              <Button
                onClick={onAddField}
                className="px-4 py-2 flex-shrink-0 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                disabled={!newField.name}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
              {!newField.name && (
                <p className="text-sm text-muted-foreground ml-3">
                  Enter field name to add
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Existing Fields */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-lg">Existing Fields</h4>
              {hasFields && (
                <Badge variant="secondary" className="text-xs">
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
                className="flex items-center gap-2 hover:bg-background"
              >
                {isFieldsExpanded ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4" />
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
                <h5 className="font-medium text-sm text-primary flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  Document Content Fields
                </h5>
                {config.dataset?.fields
                  ?.filter((field) => field.isDocument)
                  .map((field) => (
                    <div
                      key={field.id}
                      className="flex items-center gap-3 p-4 border rounded-lg bg-card border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{field.name}</span>
                          <Badge variant="outline">{field.type}</Badge>
                          {field.required && (
                            <Badge variant="destructive">Required</Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary"
                          >
                            Document Content
                          </Badge>
                          {field.includeInFinalDataset && (
                            <Badge variant="secondary">Output Dataset</Badge>
                          )}
                          {field.canBeInput && (
                            <Badge variant="secondary">AI Input</Badge>
                          )}
                        </div>
                        {field.description && (
                          <p className="text-sm text-muted-foreground">
                            {field.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => onRemoveField(field.id)}
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                {config.dataset?.fields?.filter((field) => field.isDocument)
                  .length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <p className="text-sm">
                      No document content fields added yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Metadata Fields */}
              <div className="space-y-2">
                <h5 className="font-medium text-sm text-emerald-600 flex items-center gap-2">
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
                      className="flex items-center gap-3 p-4 border rounded-lg bg-card border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{field.name}</span>
                          <Badge variant="outline">{field.type}</Badge>
                          {field.required && (
                            <Badge variant="destructive">Required</Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-800"
                          >
                            Metadata
                          </Badge>
                          {field.includeInFinalDataset && (
                            <Badge variant="secondary">Output Dataset</Badge>
                          )}
                          {field.canBeInput && (
                            <Badge variant="secondary">AI Input</Badge>
                          )}
                        </div>
                        {field.description && (
                          <p className="text-sm text-muted-foreground">
                            {field.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => onRemoveField(field.id)}
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                {config.dataset?.fields?.filter(
                  (field) => field.showForAnnotator && !field.isDocument
                ).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <p className="text-sm">No metadata fields added yet.</p>
                  </div>
                )}
              </div>

              {/* Other Fields */}
              <div className="space-y-2">
                <h5 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
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
                      className="flex items-center gap-3 p-4 border rounded-lg bg-card border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{field.name}</span>
                          <Badge variant="outline">{field.type}</Badge>
                          {field.required && (
                            <Badge variant="destructive">Required</Badge>
                          )}
                          {field.includeInFinalDataset && (
                            <Badge variant="secondary">Output Dataset</Badge>
                          )}
                          {field.canBeInput && (
                            <Badge variant="secondary">AI Input</Badge>
                          )}
                        </div>
                        {field.description && (
                          <p className="text-sm text-muted-foreground">
                            {field.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => onRemoveField(field.id)}
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                {config.dataset?.fields?.filter(
                  (field) => !field.isDocument && !field.showForAnnotator
                ).length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <p className="text-sm">No other fields added yet.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Show empty state when no fields exist */}
          {!hasFields && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
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
  );
}
