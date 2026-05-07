import { LLMConfig } from '../types';

export const getDefaultConfig = (): LLMConfig => ({
  provider: 'vllm',
  apiKey: '',
  apiUrl: '',
  model: '',
  temperature: 0.3,
  maxTokens: 1000,
  systemPrompt:
    "You are a helpful assistant that analyzes documents and answers questions based on highlighted text spans. Provide comprehensive, accurate answers based solely on the provided context. If the highlighted text doesn't contain enough information to answer the question, say so explicitly.",
  requiresAuth: false,
});

export const LLM_API_INFO = {
  title: 'LLM API Requirements',
  description:
    'Your LLM server must implement the OpenAI-compatible API standard.',
  examples: [
    'vLLM: https://your-vllm-server.com/v1',
    'Ollama: http://localhost:11434/v1',
    'Custom: https://your-llm-server.com/v1',
  ],
};
