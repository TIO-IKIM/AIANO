import { apiClient } from './api';
import { AIANOBlock, CreateAIANOBlock } from '@/containers/project/types';

// Convert backend AIANO block to frontend format
export function convertBackendAianoBlockToFrontend(
  backendBlock: any
): AIANOBlock {
  return {
    id: backendBlock.id,
    name: backendBlock.title,
    type:
      backendBlock.block_type === 'extraction'
        ? 'text'
        : backendBlock.block_type === 'qa'
          ? 'multiselect'
          : 'boolean',
    label: backendBlock.title,
    placeholder: backendBlock.description || '',
    description: backendBlock.description || '',
    required: false, // Default value, can be updated
    options: [], // For multiselect blocks
    booleanChoice: 'Yes/No', // Default for boolean blocks
    aiEnabled: backendBlock.block_config?.aiEnabled || false,
    soloMode: backendBlock.block_config?.soloMode || false,
    aiConfig: {
      ...backendBlock.block_config?.aiConfig,
      inputSources: Array.isArray(backendBlock.input_sources)
        ? backendBlock.input_sources
        : Object.values(backendBlock.input_sources || {}),
    } || {
      temperature: 0.7,
      systemPrompt: '',
      maxTokens: 1000,
      inputSources: [],
      soloSystemPrompt: '',
    },
    defaultValue: backendBlock.block_value || '',
  };
}

// Convert frontend AIANO block to backend format
export function convertFrontendAianoBlockToBackend(block: AIANOBlock): any {
  return {
    block_type:
      block.type === 'text'
        ? 'extraction'
        : block.type === 'multiselect'
          ? 'qa'
          : 'boolean',
    title: block.name,
    description: block.description || block.placeholder || '',
    input_sources: block.aiConfig?.inputSources
      ? Object.fromEntries(
          block.aiConfig.inputSources.map((source, index) => [
            index.toString(),
            source,
          ])
        )
      : {},
    block_config: {
      aiEnabled: block.aiEnabled,
      soloMode: block.soloMode,
      aiConfig: block.aiConfig,
      required: block.required,
      options: block.options,
      booleanChoice: block.booleanChoice,
    },
    block_value: block.defaultValue || '',
  };
}

// Convert frontend CreateAIANOBlock to backend format
export function convertCreateAianoBlockToBackend(
  block: CreateAIANOBlock,
  projectId: number
): any {
  return {
    project_id: projectId,
    block_type:
      block.type === 'text'
        ? 'extraction'
        : block.type === 'multiselect'
          ? 'qa'
          : 'boolean',
    title: block.name,
    description: block.description || block.placeholder || '',
    input_sources: block.aiConfig?.inputSources
      ? Object.fromEntries(
          block.aiConfig.inputSources.map((source, index) => [
            index.toString(),
            source,
          ])
        )
      : {},
    block_config: {
      aiEnabled: block.aiEnabled,
      soloMode: block.soloMode,
      aiConfig: block.aiConfig,
      required: block.required,
      options: block.options,
      booleanChoice: block.booleanChoice,
    },
    block_value: block.defaultValue || '',
  };
}

export class AianoBlockApiService {
  private static instance: AianoBlockApiService;

  private blockCache = new Map<string, AIANOBlock[]>();

  static getInstance(): AianoBlockApiService {
    if (!AianoBlockApiService.instance) {
      AianoBlockApiService.instance = new AianoBlockApiService();
    }
    return AianoBlockApiService.instance;
  }

  // Get all AIANO blocks for a project
  async getAianoBlocks(projectId: string): Promise<AIANOBlock[]> {
    try {
      const cached = this.blockCache.get(projectId);
      if (cached) {
        return cached;
      }

      const backendBlocks = await apiClient.getAianoBlocks(parseInt(projectId));
      const frontendBlocks = backendBlocks.map(
        convertBackendAianoBlockToFrontend
      );

      this.blockCache.set(projectId, frontendBlocks);
      return frontendBlocks;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch AIANO blocks: ${errorMessage}`);
    }
  }

  // Create a new AIANO block
  async createAianoBlock(
    projectId: string,
    block: CreateAIANOBlock
  ): Promise<AIANOBlock> {
    try {
      const backendBlock = convertCreateAianoBlockToBackend(
        block,
        parseInt(projectId)
      );

      const createdBlock = await apiClient.createAianoBlock(
        parseInt(projectId),
        backendBlock
      );

      const frontendBlock = convertBackendAianoBlockToFrontend(createdBlock);

      // Update cache
      const cached = this.blockCache.get(projectId) || [];
      this.blockCache.set(projectId, [...cached, frontendBlock]);

      return frontendBlock;
    } catch (error) {
      // Re-throw the original error to preserve the stack trace
      throw error;
    }
  }

  // Update an existing AIANO block
  async updateAianoBlock(
    projectId: string,
    blockId: number,
    updates: Partial<AIANOBlock>
  ): Promise<AIANOBlock> {
    try {
      // Get the current block to merge updates
      const currentBlocks = await this.getAianoBlocks(projectId);
      const currentBlock = currentBlocks.find((b) => b.id === blockId);
      if (!currentBlock) {
        throw new Error('AIANO block not found');
      }

      const updatedBlock = { ...currentBlock, ...updates };
      const backendBlock = convertFrontendAianoBlockToBackend(updatedBlock);

      const result = await apiClient.updateAianoBlock(
        parseInt(projectId),
        blockId,
        backendBlock
      );

      const frontendBlock = convertBackendAianoBlockToFrontend(result);

      // Update cache
      const cached = this.blockCache.get(projectId) || [];
      const updatedCache = cached.map((b) =>
        b.id === blockId ? frontendBlock : b
      );
      this.blockCache.set(projectId, updatedCache);

      return frontendBlock;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update AIANO block: ${errorMessage}`);
    }
  }

  // Delete an AIANO block
  async deleteAianoBlock(projectId: string, blockId: number): Promise<void> {
    try {
      await apiClient.deleteAianoBlock(parseInt(projectId), blockId);

      // Update cache
      const cached = this.blockCache.get(projectId) || [];
      const updatedCache = cached.filter((b) => b.id !== blockId);
      this.blockCache.set(projectId, updatedCache);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to delete AIANO block: ${errorMessage}`);
    }
  }

  // Clear cache for a project
  clearCache(projectId: string): void {
    this.blockCache.delete(projectId);
  }
}

export const aianoBlockApiService = AianoBlockApiService.getInstance();
