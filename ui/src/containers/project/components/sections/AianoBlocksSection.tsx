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
import { Plus, Trash2, FileText } from 'lucide-react';
import { AianoBlocksSectionProps } from '../types/SectionProps.types';
import { InlineInfo, INFO_CONTENT } from '@/components/InfoPoint';

export function AianoBlocksSection({
  config,
  newAianoBlock,
  onNewAianoBlockChange,
  onAddAianoBlock,
  onRemoveAianoBlock,
}: AianoBlocksSectionProps) {
  const [newInputSource, setNewInputSource] = useState({
    type: 'aiano_block' as const,
    required: false,
    sourceId: '',
    annotationType: 'all' as const,
    datasetFieldId: '',
  });

  return (
    <Card
      className="w-full max-w-full overflow-hidden"
      style={{
        width: '100% !important',
        maxWidth: '100% !important',
        boxSizing: 'border-box',
        minWidth: 0,
        flex: '1 1 0%',
        overflow: 'hidden !important',
      }}
    >
      <CardHeader
        className="w-full max-w-full overflow-hidden"
        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
      >
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          AIANO Blocks
          <InlineInfo content={INFO_CONTENT.AIANO_BLOCKS} />
        </CardTitle>
      </CardHeader>
      <CardContent
        className="space-y-4 w-full max-w-full overflow-hidden"
        style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
      >
        {/* Recommended AIANO Blocks */}
        <div className="space-y-4">
          <h4 className="font-medium">Recommended Blocks</h4>
          <p className="text-sm text-muted-foreground">
            Quick-start templates for common annotation workflows
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Question Block */}
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Question Block
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Simple text input for questions without AI
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                    }}
                  >
                    • Text input field
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                    }}
                  >
                    • No AI processing
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                    }}
                  >
                    • Required by default
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => {
                    const questionBlock = {
                      name: 'Question',
                      type: 'text' as const,
                      placeholder: 'Enter your question here...',
                      description: 'A question that needs to be answered',
                      required: true,
                      aiEnabled: false,
                      soloMode: false,
                    };
                    onNewAianoBlockChange(questionBlock);
                    onAddAianoBlock();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question Block
                </Button>
              </CardContent>
            </Card>

            {/* Answer Block */}
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Answer Block
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI-powered answer using annotations and question
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                    }}
                  >
                    • AI-enabled response
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                    }}
                  >
                    • Uses all annotations as input
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '100%',
                      boxSizing: 'border-box',
                      overflow: 'hidden',
                    }}
                  >
                    •{' '}
                    {config.aianoBlocks?.find((block) =>
                      block.name.toLowerCase().includes('question')
                    )
                      ? 'Will use existing Question block'
                      : 'Add Question block first'}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => {
                    // Find existing question block
                    const questionBlock = config.aianoBlocks?.find((block) =>
                      block.name.toLowerCase().includes('question')
                    );

                    const answerBlock = {
                      name: 'Answer',
                      type: 'text' as const,
                      placeholder:
                        'AI will generate answer based on annotations...',
                      description:
                        'AI-generated answer based on annotations and question',
                      required: true,
                      aiEnabled: true,
                      soloMode: false,
                      aiConfig: {
                        temperature: 0.7,
                        systemPrompt:
                          'You are a helpful assistant that answers questions based on the provided annotations and context. Provide clear, accurate, and helpful answers.',
                        maxTokens: 1000,
                        inputSources: [
                          {
                            id: `input_${Date.now()}_1`,
                            type: 'annotation' as const,
                            annotationType: 'all' as const,
                            required: true,
                            label: 'All Annotations',
                          },
                          ...(questionBlock
                            ? [
                                {
                                  id: `input_${Date.now()}_2`,
                                  type: 'aiano_block' as const,
                                  sourceId: questionBlock.id,
                                  required: true,
                                  label: questionBlock.name,
                                },
                              ]
                            : []),
                        ],
                      },
                    };
                    onNewAianoBlockChange(answerBlock);
                    onAddAianoBlock();
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Answer Block
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add New AIANO Block */}
        <div
          className="space-y-4 p-6 border rounded-lg bg-muted/50 w-full max-w-full overflow-hidden"
          style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
        >
          <h4 className="font-medium">Add New AIANO Block</h4>
          <div
            className="grid grid-cols-1 gap-6 w-full max-w-full overflow-hidden"
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <Label
                htmlFor="block-name"
                className="flex items-center gap-1 mb-3"
              >
                Block Name
                <InlineInfo content={INFO_CONTENT.BLOCK_NAME} />
              </Label>
              <Input
                id="block-name"
                value={newAianoBlock.name || ''}
                onChange={(e) =>
                  onNewAianoBlockChange({ name: e.target.value })
                }
                placeholder="Enter block name"
                className="w-full"
              />
            </div>
          </div>

          <div
            className="grid grid-cols-1 gap-6 w-full max-w-full overflow-hidden"
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <Label
                htmlFor="block-type"
                className="flex items-center gap-1 mb-3"
              >
                Block Type
                <InlineInfo content={INFO_CONTENT.BLOCK_TYPE} />
              </Label>
              <Select
                value={newAianoBlock.type || 'text'}
                onValueChange={(value) =>
                  onNewAianoBlockChange({ type: value as any })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select block type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    Text - Single line text input
                  </SelectItem>
                  <SelectItem value="textarea">
                    Textarea - Multi-line text input
                  </SelectItem>
                  <SelectItem value="select">
                    Select - Single choice dropdown
                  </SelectItem>
                  <SelectItem value="multiselect">
                    Multiselect - Multiple choice selection
                  </SelectItem>
                  <SelectItem value="boolean">
                    Boolean - Yes/No toggle
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div
              style={{
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <Label
                htmlFor="block-placeholder"
                className="flex items-center gap-1 mb-3"
              >
                Placeholder (Optional)
                <InlineInfo content={INFO_CONTENT.BLOCK_PLACEHOLDER} />
              </Label>
              <Input
                id="block-placeholder"
                value={newAianoBlock.placeholder || ''}
                onChange={(e) =>
                  onNewAianoBlockChange({ placeholder: e.target.value })
                }
                placeholder="Enter placeholder text"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="block-description"
              className="flex items-center gap-1 mb-3"
            >
              Description (Optional)
              <InlineInfo content={INFO_CONTENT.BLOCK_DESCRIPTION} />
            </Label>
            <Textarea
              id="block-description"
              value={newAianoBlock.description || ''}
              onChange={(e) =>
                onNewAianoBlockChange({ description: e.target.value })
              }
              placeholder="Enter block description"
              rows={3}
              className="w-full"
            />
          </div>

          {/* Block-specific options */}
          {newAianoBlock.type === 'multiselect' && (
            <div
              style={{
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <Label
                htmlFor="block-options"
                className="text-sm font-medium mb-3"
              >
                Options (separated by slashes)
              </Label>
              <Input
                id="block-options"
                placeholder="Enter options separated by slashes"
                value={newAianoBlock.options?.join(' / ') || ''}
                onChange={(e) => {
                  const rawValue = e.target.value;
                  const options = rawValue
                    ? rawValue
                        .split('/')
                        .map((opt) => opt.trim())
                        .filter((opt) => opt.length > 0)
                    : [];
                  onNewAianoBlockChange({ options });
                }}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Separate options with slashes (/) - e.g., "Option 1 / Option 2 /
                Option 3"
              </p>
            </div>
          )}

          {newAianoBlock.type === 'boolean' && (
            <div
              style={{
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <Label
                htmlFor="block-boolean-choice"
                className="text-sm font-medium mb-3"
              >
                Boolean Choice
              </Label>
              <Input
                id="block-boolean-choice"
                placeholder="Enter the two choices separated by a slash (e.g., 'Yes/No', 'True/False', 'Relevant/Irrelevant', 'High/Low')"
                value={newAianoBlock.booleanChoice || 'Yes/No'}
                onChange={(e) =>
                  onNewAianoBlockChange({ booleanChoice: e.target.value })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: "Option1/Option2" (e.g., "Yes/No")
              </p>
            </div>
          )}

          <div
            className="grid grid-cols-1 gap-6 w-full max-w-full overflow-hidden"
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          >
            <div className="flex items-center space-x-2">
              <Switch
                id="block-required"
                checked={newAianoBlock.required || false}
                onCheckedChange={(checked) =>
                  onNewAianoBlockChange({ required: checked })
                }
              />
              <Label
                htmlFor="block-required"
                className="flex items-center gap-1"
              >
                Required
                <InlineInfo content={INFO_CONTENT.BLOCK_REQUIRED} />
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="block-ai-enabled"
                checked={newAianoBlock.aiEnabled || false}
                onCheckedChange={(checked) => {
                  onNewAianoBlockChange({
                    aiEnabled: checked,
                    // Reset solo mode when AI is disabled
                    soloMode: checked ? newAianoBlock.soloMode : false,
                  });
                }}
              />
              <Label
                htmlFor="block-ai-enabled"
                className="flex items-center gap-1"
              >
                AI Enabled
                <InlineInfo content={INFO_CONTENT.BLOCK_AI_ENABLED} />
              </Label>
            </div>
          </div>

          {/* Solo Mode - Only show when AI is enabled */}
          {newAianoBlock.aiEnabled && (
            <div className="flex items-center space-x-2">
              <Switch
                id="block-solo-mode"
                checked={newAianoBlock.soloMode || false}
                onCheckedChange={(checked) =>
                  onNewAianoBlockChange({ soloMode: checked })
                }
              />
              <Label htmlFor="block-solo-mode">
                Solo Mode (Independent AI)
              </Label>
            </div>
          )}

          <div
            className={`space-y-4 border rounded-lg bg-muted/30 transition-all duration-300 ease-in-out w-full max-w-full overflow-hidden ${!newAianoBlock.aiEnabled ? 'max-h-0 overflow-hidden p-0' : 'max-h-none p-4'}`}
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          >
            <h4 className="text-base font-medium">AI Configuration</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <Label htmlFor="ai-temperature" className="text-sm mb-3">
                  Temperature
                </Label>
                <Input
                  id="ai-temperature"
                  type="number"
                  min="0"
                  max="1"
                  step="0.1"
                  value={newAianoBlock.aiConfig?.temperature || 0.7}
                  onChange={(e) =>
                    onNewAianoBlockChange({
                      aiConfig: {
                        ...newAianoBlock.aiConfig,
                        temperature: parseFloat(e.target.value) || 0.7,
                      },
                    })
                  }
                  className="w-full"
                  placeholder="0.7"
                />
              </div>
              <div
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <Label htmlFor="ai-max-tokens" className="text-sm mb-3">
                  Max Tokens
                </Label>
                <Input
                  id="ai-max-tokens"
                  type="number"
                  value={newAianoBlock.aiConfig?.maxTokens || 1000}
                  onChange={(e) =>
                    onNewAianoBlockChange({
                      aiConfig: {
                        ...newAianoBlock.aiConfig,
                        maxTokens: parseInt(e.target.value) || 1000,
                      },
                    })
                  }
                  className="w-full"
                  placeholder="1000"
                />
              </div>
            </div>
            <div
              style={{
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <Label htmlFor="ai-system-prompt" className="text-sm mb-3">
                System Prompt
              </Label>
              <Textarea
                id="ai-system-prompt"
                placeholder="Enter a comprehensive system prompt that defines the AI's role, behavior, output format, and specific instructions for this task. Include details about the expected input format, processing guidelines, and desired output structure. For example: 'You are an expert document analyst specializing in legal contract review and clause extraction. Your task is to analyze provided annotations and context to generate accurate, comprehensive answers to questions about contract terms, obligations, and potential risks. Always base your responses on the specific annotations provided, cite relevant sections when possible, and maintain a professional, objective tone. Structure your answers clearly with bullet points or numbered lists when appropriate, and always indicate your confidence level in the response. If the provided context is insufficient to answer a question, clearly state this limitation and suggest what additional information would be needed.'"
                value={newAianoBlock.aiConfig?.systemPrompt || ''}
                onChange={(e) =>
                  onNewAianoBlockChange({
                    aiConfig: {
                      ...newAianoBlock.aiConfig,
                      systemPrompt: e.target.value,
                    },
                  })
                }
                rows={4}
                className="w-full"
              />
            </div>

            {/* Solo Mode System Prompt */}
            {newAianoBlock.soloMode && (
              <div
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <Label
                  htmlFor="ai-solo-system-prompt"
                  className="text-sm font-medium mb-3"
                >
                  Solo Mode System Prompt
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  This prompt will be used when the block operates independently
                  without other blocks
                </p>
                <Textarea
                  id="ai-solo-system-prompt"
                  placeholder="Enter a specialized system prompt for when this block operates independently (e.g., 'You are a standalone analysis tool that processes documents and provides comprehensive insights without relying on other data sources.')"
                  value={newAianoBlock.aiConfig?.soloSystemPrompt || ''}
                  onChange={(e) =>
                    onNewAianoBlockChange({
                      aiConfig: {
                        ...newAianoBlock.aiConfig,
                        soloSystemPrompt: e.target.value,
                      },
                    })
                  }
                  rows={4}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Input Sources Configuration - Collapsible based on AI enabled state */}
          <div
            className={`space-y-4 border rounded-lg bg-muted/30 transition-all duration-300 ease-in-out w-full max-w-full overflow-hidden ${!newAianoBlock.aiEnabled ? 'max-h-0 overflow-hidden p-0' : 'max-h-none p-4'}`}
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
              }}
            >
              <Label className="text-sm font-medium">Input Sources</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Define what data this AI block will use as context
              </p>
            </div>

            {/* Add Input Source Form */}
            <div className="space-y-3 p-3 border rounded bg-card">
              <div
                className="grid grid-cols-1 gap-6 w-full max-w-full overflow-hidden"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  <Label htmlFor="input-source-type" className="text-sm mb-3">
                    Source Type
                  </Label>
                  <Select
                    value={newInputSource.type}
                    onValueChange={(value) => {
                      setNewInputSource((prev) => ({
                        ...prev,
                        type: value as
                          | 'aiano_block'
                          | 'annotation'
                          | 'dataset_field',
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select the type of input source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aiano_block">
                        AIANO Block - Use output from another block
                      </SelectItem>
                      <SelectItem value="annotation">
                        Annotation Data - Use highlighted text annotations
                      </SelectItem>
                      <SelectItem value="dataset_field">
                        Dataset Field - Use data from project fields
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* AIANO Block Selection */}
                {newInputSource.type === 'aiano_block' && (
                  <div className="min-w-0">
                    <Label
                      htmlFor="input-source-block"
                      className="text-sm mb-3"
                    >
                      Select Block
                    </Label>
                    <Select
                      value={newInputSource.sourceId || ''}
                      onValueChange={(value) =>
                        setNewInputSource((prev) => ({
                          ...prev,
                          sourceId: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose which AIANO block to use as input" />
                      </SelectTrigger>
                      <SelectContent className="w-full max-w-[250px]">
                        {config.aianoBlocks && config.aianoBlocks.length > 0 ? (
                          config.aianoBlocks.map((block, index) => (
                            <SelectItem
                              key={block.id || `temp-${block.name}-${index}`}
                              value={block.id || `temp-${block.name}-${index}`}
                            >
                              {block.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-blocks" disabled>
                            No blocks yet
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {config.aianoBlocks && config.aianoBlocks.length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1 break-words">
                        Create AIANO blocks first.
                      </p>
                    )}
                  </div>
                )}

                {/* Annotation Level Selection */}
                {newInputSource.type === 'annotation' && (
                  <div className="min-w-0">
                    <Label
                      htmlFor="input-annotation-level"
                      className="text-sm mb-3"
                    >
                      Annotation Level
                    </Label>
                    <Select
                      value={newInputSource.annotationType || 'all'}
                      onValueChange={(value) =>
                        setNewInputSource((prev) => ({
                          ...prev,
                          annotationType: value as 'all' | 'annotation',
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select which annotation level to use" />
                      </SelectTrigger>
                      <SelectContent className="w-full max-w-[250px]">
                        <SelectItem value="all">All Annotations</SelectItem>
                        {config.annotationLevels &&
                        config.annotationLevels.length > 0 ? (
                          config.annotationLevels.map((level) => (
                            <SelectItem
                              key={level.id}
                              value={`annotation_${level.id}`}
                            >
                              {level.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-levels" disabled>
                            No levels yet
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {config.annotationLevels &&
                      config.annotationLevels.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-1 break-words">
                          Create annotation levels first.
                        </p>
                      )}
                  </div>
                )}

                {/* Dataset Field Selection */}
                {newInputSource.type === 'dataset_field' && (
                  <div className="min-w-0">
                    <Label
                      htmlFor="input-dataset-field"
                      className="text-sm mb-3"
                    >
                      Dataset Field
                    </Label>
                    <Select
                      value={newInputSource.datasetFieldId || ''}
                      onValueChange={(value) =>
                        setNewInputSource((prev) => ({
                          ...prev,
                          datasetFieldId: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select which dataset field to use as input" />
                      </SelectTrigger>
                      <SelectContent className="w-full max-w-[250px]">
                        {config.dataset?.fields?.filter(
                          (field) => field.canBeInput
                        ).length > 0 ? (
                          config.dataset.fields
                            .filter((field) => field.canBeInput)
                            .map((field) => (
                              <SelectItem key={field.id} value={field.id}>
                                {field.name}
                              </SelectItem>
                            ))
                        ) : (
                          <SelectItem value="no-fields" disabled>
                            No fields yet
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    {config.dataset?.fields?.filter((field) => field.canBeInput)
                      .length === 0 && (
                      <p className="text-xs text-muted-foreground mt-1 break-words">
                        Enable "Context" toggle.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <Switch
                  id="input-source-required"
                  checked={newInputSource.required}
                  onCheckedChange={(checked) =>
                    setNewInputSource((prev) => ({
                      ...prev,
                      required: checked,
                    }))
                  }
                />
                <Label htmlFor="input-source-required" className="text-sm">
                  Required Input
                </Label>
              </div>

              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  if (
                    (newInputSource.type === 'aiano_block' &&
                      !newInputSource.sourceId) ||
                    (newInputSource.type === 'dataset_field' &&
                      !newInputSource.datasetFieldId)
                  )
                    return;

                  // Auto-generate label based on source type and selection
                  let autoLabel = '';
                  if (newInputSource.type === 'aiano_block') {
                    const selectedBlock = config.aianoBlocks?.find(
                      (block) =>
                        block.id?.toString() === newInputSource.sourceId ||
                        `temp-${block.name}-${config.aianoBlocks?.indexOf(block)}` ===
                          newInputSource.sourceId
                    );
                    autoLabel = selectedBlock?.name || 'AIANO Block';
                  } else if (newInputSource.type === 'annotation') {
                    if (newInputSource.annotationType === 'all') {
                      autoLabel = 'All Annotations';
                    } else {
                      const selectedLevel = config.annotationLevels?.find(
                        (level) =>
                          `annotation_${level.id}` ===
                          newInputSource.annotationType
                      );
                      autoLabel = selectedLevel?.name || 'Annotation Level';
                    }
                  } else if (newInputSource.type === 'dataset_field') {
                    const selectedField = config.dataset?.fields?.find(
                      (field) => field.id === newInputSource.datasetFieldId
                    );
                    autoLabel = selectedField?.name || 'Dataset Field';
                  }

                  const inputSource = {
                    id: `input_${Date.now()}`,
                    type: newInputSource.type,
                    sourceId: newInputSource.sourceId,
                    annotationType: newInputSource.annotationType,
                    datasetFieldId: newInputSource.datasetFieldId,
                    customField: undefined,
                    label: autoLabel,
                    required: newInputSource.required,
                  };

                  onNewAianoBlockChange({
                    ...newAianoBlock,
                    aiConfig: {
                      ...newAianoBlock.aiConfig,
                      temperature: newAianoBlock.aiConfig?.temperature || 0.7,
                      systemPrompt: newAianoBlock.aiConfig?.systemPrompt || '',
                      maxTokens: newAianoBlock.aiConfig?.maxTokens || 1000,
                      inputSources: [
                        ...(newAianoBlock.aiConfig?.inputSources || []),
                        inputSource,
                      ],
                    },
                  });

                  setNewInputSource({
                    type: 'aiano_block',
                    required: false,
                    sourceId: '',
                    annotationType: 'all',
                    datasetFieldId: '',
                  });
                }}
                disabled={
                  (newInputSource.type === 'aiano_block' &&
                    !newInputSource.sourceId) ||
                  (newInputSource.type === 'dataset_field' &&
                    !newInputSource.datasetFieldId)
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Input Source
              </Button>
              {((newInputSource.type === 'aiano_block' &&
                !newInputSource.sourceId) ||
                (newInputSource.type === 'dataset_field' &&
                  !newInputSource.datasetFieldId)) && (
                <p className="text-sm text-muted-foreground ml-3">
                  {newInputSource.type === 'aiano_block' &&
                  !newInputSource.sourceId
                    ? 'Select a block'
                    : newInputSource.type === 'dataset_field' &&
                        !newInputSource.datasetFieldId
                      ? 'Select a field'
                      : 'Complete the form to add input source'}
                </p>
              )}
            </div>

            {/* Display Current Input Sources */}
            {newAianoBlock.aiConfig?.inputSources &&
              newAianoBlock.aiConfig.inputSources.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Current Input Sources
                  </Label>
                  {newAianoBlock.aiConfig.inputSources.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between p-2 bg-muted rounded border"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {source.type === 'aiano_block'
                            ? 'AIANO Block'
                            : source.type === 'annotation'
                              ? 'Annotation'
                              : 'Dataset Field'}
                        </Badge>
                        <span className="text-sm">{source.label}</span>
                        {source.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
                        onClick={() => {
                          onNewAianoBlockChange({
                            ...newAianoBlock,
                            aiConfig: {
                              ...newAianoBlock.aiConfig,
                              inputSources: (
                                newAianoBlock.aiConfig?.inputSources || []
                              ).filter((s) => s.id !== source.id),
                            },
                          });
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div className="flex items-center justify-between">
            <Button
              onClick={onAddAianoBlock}
              className="w-auto bg-green-600 hover:bg-green-700 text-white h-10"
              disabled={!newAianoBlock.name}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add AIANO Block
            </Button>
            {!newAianoBlock.name && (
              <p className="text-sm text-muted-foreground ml-3">
                Fill in required fields to add block
              </p>
            )}
          </div>
        </div>

        {/* Existing AIANO Blocks */}
        <div className="space-y-2">
          <h4 className="font-medium">Existing AIANO Blocks</h4>
          {config.aianoBlocks?.map((block, index) => (
            <div
              key={block.id || `temp-${block.name}-${block.type}-${index}`}
              className="space-y-4 p-4 border rounded-lg bg-card"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{block.name}</span>
                    <Badge variant="outline">{block.type}</Badge>
                    {block.required && (
                      <Badge variant="destructive">Required</Badge>
                    )}
                    {block.type === 'text' && block.aiEnabled && (
                      <Badge variant={block.soloMode ? 'secondary' : 'default'}>
                        {block.soloMode ? 'Solo AI' : 'AI Enabled'}
                      </Badge>
                    )}
                  </div>
                  {block.description && (
                    <p className="text-sm text-muted-foreground">
                      {block.description}
                    </p>
                  )}
                  {block.type === 'boolean' && block.booleanChoice && (
                    <p className="text-sm text-muted-foreground">
                      Choices: {block.booleanChoice}
                    </p>
                  )}
                  {block.type === 'multiselect' && block.options && (
                    <p className="text-sm text-muted-foreground">
                      Options: {block.options.join(' / ')}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  onClick={() => onRemoveAianoBlock(index)}
                  size="sm"
                  className="text-destructive hover:text-destructive/80"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Show input sources count for AI blocks */}
              {block.aiEnabled &&
                block.aiConfig?.inputSources &&
                block.aiConfig.inputSources.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">
                      Input Sources: {block.aiConfig.inputSources.length}{' '}
                      configured
                    </p>
                  </div>
                )}
            </div>
          ))}
          {(!config.aianoBlocks || config.aianoBlocks.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No AIANO blocks added yet. Add your first block above.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
