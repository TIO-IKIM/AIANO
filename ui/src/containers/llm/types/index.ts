export interface LLMConfig {
  name: string;
  provider: string;
  apiKey: string;
  apiUrl: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  requiresAuth: boolean;
}

export interface LLMMetadata {
  model: string;
  provider: string;
  temperature: number;
}

export interface LLMResponse {
  content: string;
  metadata: LLMMetadata;
}

export interface LLMError {
  message: string;
  code?: string;
  status?: number;
}

export interface LLMContext {
  text: string;
  documentId: string;
  documentName?: string;
}

export interface LLMRequest {
  question: string;
  context: LLMContext[];
  config: LLMConfig;
}
