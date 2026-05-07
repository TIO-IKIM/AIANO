import React from 'react';
import { HelpCircle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@ikim-ui/ui-components/primitive/tooltip';

interface InfoPointProps {
  content: string | React.ReactNode;
  title?: string;
  variant?: 'help' | 'info';
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
}

export const InfoPoint: React.FC<InfoPointProps> = ({
  content,
  title,
  variant = 'help',
  side = 'top',
  className = '',
  children,
}) => {
  const Icon = variant === 'help' ? HelpCircle : Info;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center ${className}`}>
            {children || (
              <Icon className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help transition-colors" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <div className="space-y-1">
            {title && <p className="font-medium text-sm">{title}</p>}
            <div className="text-sm text-muted-foreground">
              {typeof content === 'string' ? <p>{content}</p> : content}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Predefined info content for common components
export const INFO_CONTENT = {
  // Project Creation Form
  PROJECT_NAME:
    'Enter a descriptive name for your annotation project. This will help you identify it later.',
  PROJECT_DESCRIPTION:
    "Provide a brief description of what this project is about and what you'll be annotating.",

  // Labels Section
  LABELS:
    'Labels help categorize and organize your projects. They appear as colored tags and can be used for filtering.',
  LABEL_NAME:
    "Choose a short, descriptive name for your label (e.g., 'Important', 'Review', 'Complete').",
  LABEL_COLOR:
    'Select a color that will help you visually distinguish this label from others.',

  // Annotation Levels Section
  ANNOTATION_LEVELS:
    'Annotation levels define the different types of annotations you can make on text. Each level has a name, color, and priority score.',
  LEVEL_NAME:
    "Choose a descriptive name for this annotation level (e.g., 'Positive', 'Negative', 'Neutral').",
  LEVEL_COLOR:
    'Select a color that will be used to highlight text with this annotation level.',
  LEVEL_SCORE:
    'Set the priority score (0 = highest priority). Lower scores indicate higher importance.',
  LEVEL_DESCRIPTION:
    'Optional description to explain when and how to use this annotation level.',

  // AIANO Blocks Section
  AIANO_BLOCKS:
    'AIANO blocks are custom annotation fields that can include AI assistance. They help structure your annotation tasks.',
  BLOCK_NAME:
    "Choose a descriptive name for this annotation task (e.g., 'Sentiment', 'Category', 'Relevance').",
  BLOCK_TYPE:
    'Select the input type: Text (free text), Multiselect (multiple choice), or Boolean (yes/no).',
  BLOCK_PLACEHOLDER:
    'Optional placeholder text that will appear in the input field to guide users.',
  BLOCK_DESCRIPTION:
    'Optional description explaining what this annotation task is for and how to complete it.',
  BLOCK_REQUIRED:
    'Mark as required if this annotation must be completed before saving the entry.',
  BLOCK_AI_ENABLED:
    'Enable AI assistance to help generate suggestions for this annotation task.',
  BLOCK_SOLO_MODE:
    'Solo mode allows this block to work independently with its own AI configuration.',
  AI_TEMPERATURE:
    'Controls randomness in AI responses (0 = deterministic, 1 = very creative).',
  AI_MAX_TOKENS:
    'Maximum number of tokens the AI can generate in its response.',
  AI_SYSTEM_PROMPT:
    'Instructions for the AI on how to generate responses for this specific task.',
  AI_SOLO_SYSTEM_PROMPT:
    'Special instructions when this block operates independently (solo mode).',
  INPUT_SOURCES:
    'Define what data this AI block will use as context when generating responses.',
  INPUT_SOURCE_TYPE:
    'Choose the type of data source: AIANO Block, Annotation Data, or Dataset Field.',
  INPUT_SOURCE_LABEL: 'Display name for this input source in the AI context.',
  INPUT_SOURCE_REQUIRED:
    'Mark as required if this input source must be available for AI generation.',

  // Dataset Fields Section
  DATASET_NAME:
    'Name for your dataset that will be used in exports and reports.',
  DATASET_DESCRIPTION:
    'Brief description of what this dataset contains and its purpose.',
  FIELD_NAME: "Name of the data field (e.g., 'title', 'content', 'author').",
  FIELD_TYPE:
    'Data type for this field: Text, Number, Date, Boolean, Array, or Object.',
  FIELD_DESCRIPTION:
    'Optional description explaining what this field contains.',
  FIELD_REQUIRED: 'Mark as required if this field must have a value.',
  FIELD_AI_INPUT: 'Enable if this field can be used as input for AI blocks.',
  FIELD_DOCUMENT_CONTENT:
    'Mark if this field contains the main document content to be annotated.',
  FIELD_DOCUMENT_METADATA:
    'Mark if this field contains metadata about the document (not the main content).',
  FIELD_OUTPUT_DATASET: 'Include this field in the final exported dataset.',

  // Annotation Workspace
  ANNOTATION_LEVEL_PALETTE:
    'Select an annotation level to highlight text. Each level has a different color and meaning.',
  HIGHLIGHT_TEXT:
    'Click and drag to select text, then choose an annotation level to highlight it.',
  CLEAR_ALL_HIGHLIGHTS: 'Remove all highlights from the current document.',
  AIANO_BLOCK_PANEL:
    'Complete the annotation tasks below. Some tasks may have AI assistance available.',
  GENERATE_AI:
    'Use AI to generate suggestions for this annotation task based on the selected text and context.',
  SAVE_ENTRY: 'Save your completed annotations and move to the next document.',
  DOCUMENT_VIEWER:
    'View and annotate the current document. Use the search function to find specific text.',
  DOCUMENT_LIST:
    'Browse and select documents to annotate. Upload new documents or filter existing ones.',

  // General
  REQUIRED_FIELD: 'This field is required and must be filled out.',
  OPTIONAL_FIELD: 'This field is optional and can be left empty.',
  AI_ASSISTANCE:
    'This feature uses AI to help with annotation tasks. Configure your AI model in settings.',
  EXPORT_DATA:
    'Export your annotations and project data in various formats for analysis.',
};

// Helper component for inline info points
export const InlineInfo: React.FC<{
  content: string | React.ReactNode;
  title?: string;
  className?: string;
}> = ({ content, title, className = '' }) => (
  <InfoPoint
    content={content}
    title={title}
    variant="info"
    className={`ml-1 ${className}`}
  />
);

// Helper component for help info points
export const HelpInfo: React.FC<{
  content: string | React.ReactNode;
  title?: string;
  className?: string;
}> = ({ content, title, className = '' }) => (
  <InfoPoint
    content={content}
    title={title}
    variant="help"
    className={`ml-1 ${className}`}
  />
);
