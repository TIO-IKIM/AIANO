import { apiClient } from './api';

export interface LLMConfigCreateRequest {
  name: string;
  provider: string;
  api_key?: string;
  api_url: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  requires_auth: boolean;
  is_default?: boolean;
}

export interface LLMConfigUpdateRequest {
  name?: string;
  provider?: string;
  api_key?: string;
  api_url?: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
  requires_auth?: boolean;
  is_default?: boolean;
}

export interface LLMConfigResponse {
  id: number;
  name: string;
  provider: string;
  api_key?: string;
  api_url: string;
  model: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
  requires_auth: boolean;
  is_default: boolean;
  created_at: string;
  updated_at?: string;
}

export class LLMConfigApiService {
  private apiClient = apiClient;

  async getLLMConfigs(): Promise<LLMConfigResponse[]> {
    const response = await this.apiClient.makeRequest(
      '/api/v1/settings/llm-configs',
      {
        method: 'GET',
      }
    );
    return response.json();
  }

  async getLLMConfig(configId: number): Promise<LLMConfigResponse> {
    const response = await this.apiClient.makeRequest(
      `/api/v1/settings/llm-configs/${configId}`,
      {
        method: 'GET',
      }
    );
    return response.json();
  }

  async createLLMConfig(
    configData: LLMConfigCreateRequest
  ): Promise<LLMConfigResponse> {
    const response = await this.apiClient.makeRequest(
      '/api/v1/settings/llm-configs',
      {
        method: 'POST',
        body: JSON.stringify(configData),
      }
    );
    return response.json();
  }

  async updateLLMConfig(
    configId: number,
    configData: LLMConfigUpdateRequest
  ): Promise<LLMConfigResponse> {
    const response = await this.apiClient.makeRequest(
      `/api/v1/settings/llm-configs/${configId}`,
      {
        method: 'PUT',
        body: JSON.stringify(configData),
      }
    );
    return response.json();
  }

  async deleteLLMConfig(configId: number): Promise<boolean> {
    const response = await this.apiClient.makeRequest(
      `/api/v1/settings/llm-configs/${configId}`,
      {
        method: 'DELETE',
      }
    );
    return response.ok;
  }

  async setDefaultLLMConfig(configId: number): Promise<LLMConfigResponse> {
    const response = await this.apiClient.makeRequest(
      `/api/v1/settings/llm-configs/${configId}/set-default`,
      {
        method: 'POST',
      }
    );
    return response.json();
  }
}

export const llmConfigApiService = new LLMConfigApiService();
