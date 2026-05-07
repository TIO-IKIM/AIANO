export interface ProjectConfig {
  id: string;
  name: string;
  description: string;
  dataset: {
    name: string;
    description?: string;
    url?: string;
    fields: DatasetField[];
    titleField?: string; // Field to use as document title
  };
  tags: (string | ProjectLabel)[];
  annotationLevels: AnnotationLevel[];
  aianoBlocks: AIANOBlock[]; // New: AIANO Blocks for AI-human collaboration
  selectedLLMConfigId?: string; // Selected LLM configuration for this project
  createdAt: Date;
  updatedAt: Date;
}

export interface DatasetField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'array' | 'object';
  required: boolean;
  showForAnnotator: boolean; // Whether to show this field to annotators
  includeInFinalDataset: boolean; // Whether to include this field in the final dataset
  canBeInput: boolean; // Whether this field can be used as input to AIANO blocks
  isDocument: boolean; // Whether this field represents the main document content
  description?: string;
  options?: string[]; // For enum-like fields
}

export interface ProjectLabel {
  id: string;
  name: string;
  color: string;
  description?: string;
  category?: string;
}

export interface AnnotationLevel {
  id: string;
  name: string;
  color: string; // Hex color for highlights, e.g., '#ef4444'
  description?: string;
  score: number; // Score for ordering annotation levels (0 = highest priority)
}

export interface AIANOBlock {
  id: number;
  name: string;
  type: 'text' | 'multiselect' | 'boolean';
  placeholder?: string;
  description?: string;
  required: boolean;
  options?: string[]; // For multiselect blocks
  booleanChoice?: string; // For boolean blocks (e.g., "Yes/No", "True/False", "Relevant/Irrelevant")
  aiEnabled: boolean; // Whether AI generation is enabled for this block
  soloMode: boolean; // Whether this block works independently with its own system prompt
  aiConfig?: {
    temperature: number;
    systemPrompt: string;
    maxTokens: number;
    inputSources?: AIInputSource[]; // Define what inputs this AI block uses
    soloSystemPrompt?: string; // System prompt for solo mode
  };
  defaultValue?: any;
}

// Type for creating new AIANO blocks (without ID)
export interface CreateAIANOBlock {
  name: string;
  type: 'text' | 'multiselect' | 'boolean';
  placeholder?: string;
  description?: string;
  required: boolean;
  options?: string[];
  booleanChoice?: string;
  aiEnabled: boolean;
  soloMode: boolean;
  aiConfig?: {
    temperature: number;
    systemPrompt: string;
    maxTokens: number;
    inputSources?: AIInputSource[];
    soloSystemPrompt?: string;
  };
  defaultValue?: any;
}

export interface AIInputSource {
  id: string;
  type: 'aiano_block' | 'annotation' | 'dataset_field';
  sourceId?: string; // For aiano_block type, this is the block ID
  annotationType?: 'all' | 'annotation'; // For annotation type
  datasetFieldId?: string; // For dataset_field type, this is the field ID
  customField?: string; // For custom annotation fields
  label: string; // Display label for this input source
  required: boolean; // Whether this input is required for AI generation
}

export interface GlobalLLMConfig {
  id: string;
  name: string;
  provider: string;
  apiKey?: string;
  apiUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  requiresAuth: boolean;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GlobalSettings {
  llmConfigs: GlobalLLMConfig[];
  defaultLLMConfigId?: string;
  autoSave?: boolean;
  notifications?: boolean;
}

export interface Dataset {
  id: string;
  name: string;
  type: 'json' | 'csv' | 'huggingface';
  url?: string;
  description?: string;
  fields: DatasetField[];
  sampleData?: any[];
  createdAt: Date;
  updatedAt: Date;
}
