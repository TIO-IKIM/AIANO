import { useState, useCallback } from 'react';
import { LLMConfig, LLMResponse, LLMError, LLMRequest } from '../types';
import { getDefaultConfig } from '../config/providers';

export const useLLM = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<LLMError | null>(null);
  const [config, setConfig] = useState<LLMConfig>(getDefaultConfig());

  const generateAnswer = useCallback(
    async (request: LLMRequest): Promise<LLMResponse> => {
      // Ensure question is a string
      if (typeof request.question !== 'string') {
        throw new Error('Invalid question format');
      }

      if (!request.question.trim()) {
        throw new Error('Please enter a question first');
      }

      setIsGenerating(true);
      setError(null);

      try {
        // Use the config from the request, not the local state
        const configToUse = request.config || config;

        // Prepare the context from provided text
        const contextSummary = (request.context || [])
          .map((ctx) => ctx.text)
          .join('\n\n');

        // Prepare the user message with or without context
        const userMessage = contextSummary
          ? `Context:
${contextSummary}

Question: ${request.question}`
          : request.question; // For solo mode, just use the question as the prompt

        // Validate required fields
        if (!configToUse.apiUrl.trim()) {
          throw new Error('API URL is required');
        }
        if (!configToUse.model.trim()) {
          throw new Error('Model name is required');
        }

        // Call any OpenAI-compatible API
        const requestBody = {
          model: configToUse.model,
          messages: [
            {
              role: 'system',
              content: configToUse.systemPrompt,
            },
            {
              role: 'user',
              content: userMessage,
            },
          ],
          temperature: configToUse.temperature,
          max_tokens: configToUse.maxTokens,
        };

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Only add authorization if auth is required and API key is provided
        if (configToUse.requiresAuth && configToUse.apiKey.trim()) {
          headers.Authorization = `Bearer ${configToUse.apiKey}`;
        }

        const apiResponse = await fetch(
          `${configToUse.apiUrl}/chat/completions`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody),
          }
        );

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          throw new Error(
            `API request failed: ${apiResponse.status} ${errorText}`
          );
        }

        const apiData = await apiResponse.json();
        const response =
          apiData.choices[0]?.message?.content || 'No response generated';

        const result: LLMResponse = {
          content: response,
          metadata: {
            model: configToUse.model,
            provider: config.provider,
            temperature: config.temperature,
          },
        };

        return result;
      } catch (err) {
        const error: LLMError = {
          message:
            err instanceof Error ? err.message : 'An unknown error occurred',
          code: 'GENERATION_ERROR',
        };
        setError(error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    [config]
  );

  const updateConfig = useCallback((newConfig: Partial<LLMConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const testConnection = useCallback(
    async (testConfig?: Partial<LLMConfig>): Promise<boolean> => {
      setIsGenerating(true);
      setError(null);

      try {
        const configToUse = testConfig ? { ...config, ...testConfig } : config;

        // Validate required fields
        if (!configToUse.apiUrl.trim()) {
          throw new Error('API URL is required');
        }
        if (!configToUse.model.trim()) {
          throw new Error('Model name is required');
        }

        // Test with a minimal request to the chat completions endpoint
        const testRequest = {
          model: configToUse.model,
          messages: [
            {
              role: 'user',
              content: 'test',
            },
          ],
          max_tokens: 1,
        };

        const testHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Only add authorization if auth is required and API key is provided
        if (configToUse.requiresAuth && configToUse.apiKey.trim()) {
          testHeaders.Authorization = `Bearer ${configToUse.apiKey}`;
        }

        const testResponse = await fetch(
          `${configToUse.apiUrl}/chat/completions`,
          {
            method: 'POST',
            headers: testHeaders,
            body: JSON.stringify(testRequest),
          }
        );

        if (testResponse.status === 401) {
          // Only suggest API key if authentication is required
          if (configToUse.requiresAuth) {
            throw new Error(
              'API key is required. Please enter your API key and try again.'
            );
          } else {
            // If auth is not required but we got 401, the server might actually require auth
            const errorText = await testResponse.text();
            throw new Error(
              `Authentication failed (401). The server may require authentication. ${errorText || 'Please check your configuration.'}`
            );
          }
        } else if (testResponse.status === 500) {
          const errorText = await testResponse.text();
          throw new Error(`Server error (500): ${errorText}`);
        } else if (!testResponse.ok) {
          const errorText = await testResponse.text();
          throw new Error(
            `API request failed: ${testResponse.status} ${errorText}`
          );
        }

        // If we get here, the API is working
        return true;
      } catch (err) {
        const error: LLMError = {
          message:
            err instanceof Error ? err.message : 'Connection test failed',
          code: 'CONNECTION_ERROR',
        };
        setError(error);
        throw error; // Throw the error so the toast can catch it
      } finally {
        setIsGenerating(false);
      }
    },
    [config]
  );

  return {
    // State
    config,
    isGenerating,
    error,
    // Actions
    generateAnswer,
    updateConfig,
    setConfig,
    resetError,
    testConnection,
  };
};
