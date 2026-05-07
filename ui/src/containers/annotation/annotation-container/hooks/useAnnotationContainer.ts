import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGlobalSettings } from '@/containers/project/stores/globalSettings';
import { useProjectStore } from '@/containers/project/stores/projectStore';
import { useGlobalToast } from '@/contexts/ToastContext';
import { ProjectConfig } from '@/containers/project/types';
import { aianoBlockApiService } from '@/services/aiano-block-api';
import {
  AnnotationContainerState,
  AnnotationContainerActions,
} from '../types/AnnotationContainer.types';

export function useAnnotationContainer(projectConfig?: ProjectConfig) {
  const navigate = useNavigate();
  const { deleteProject, refreshProject } = useProjectStore();
  const toast = useGlobalToast();
  const { settings } = useGlobalSettings();

  const [state, setState] = useState<AnnotationContainerState>({
    focusedHighlightId: null,
    showMainExportDialog: false,
    blockValues: {},
    isGeneratingBlock: {},
    aiBlockErrors: {},
    selectedLLMConfigId: undefined,
    isTestingConnection: false,
  });

  // Set LLM config from project configuration, localStorage, or default
  // Note: Don't auto-select default for example project - let user choose explicitly
  useEffect(() => {
    if (projectConfig?.selectedLLMConfigId) {
      // Use the project's selected LLM config
      setState((prev) => ({
        ...prev,
        selectedLLMConfigId: projectConfig.selectedLLMConfigId,
      }));
    } else if (!state.selectedLLMConfigId) {
      // Check localStorage for this project's LLM config
      const savedLLMConfig = localStorage.getItem(
        `llm-config-${projectConfig?.id}`
      );
      if (savedLLMConfig) {
        setState((prev) => ({
          ...prev,
          selectedLLMConfigId: savedLLMConfig,
        }));
      }
      // Don't auto-select default LLM config - user must choose explicitly
      // This prevents "hardcoded" behavior in example project
    }
  }, [
    projectConfig?.selectedLLMConfigId,
    projectConfig?.id,
    state.selectedLLMConfigId,
  ]);

  const handleBlockValueChange = useCallback((blockId: string, value: any) => {
    setState((prev) => ({
      ...prev,
      blockValues: {
        ...prev.blockValues,
        [blockId]: value,
      },
    }));
  }, []);

  const handleMainExport = useCallback(async () => {
    if (!projectConfig) {
      toast?.error('Export Failed', 'No project configuration available');
      return;
    }

    try {
      // Show loading spinner
      toast?.info(
        'Exporting Dataset',
        'Fetching annotation entries from database...'
      );

      // Import the API client
      const { apiClient } = await import('@/services/api');

      // Fetch all annotation entries from the backend
      const annotationEntries = await apiClient.getAnnotationEntries(
        parseInt(projectConfig.id)
      );

      // Fetch documents to get their fields
      let documents = [];
      try {
        // Use projectApiService to get documents
        const { projectApiService } = await import('@/services/project-api');
        const documentsResponse = await projectApiService.getDocuments(
          projectConfig.id
        );
        documents = documentsResponse || [];
      } catch (error) {
        // Could not fetch documents for annotation export; continue with empty array
      }

      // Filter documents to only include fields marked as output dataset fields
      const filteredDocuments = documents.map((doc: any) => {
        // Get fields that should be included in the final dataset
        const outputFields =
          projectConfig.dataset?.fields?.filter(
            (field) => field.includeInFinalDataset
          ) || [];
        const outputFieldNames = outputFields.map((field) => field.name);

        // Always include Document_Id and required system fields
        const systemFields = ['Document_Id', 'id', 'created_at', 'updated_at'];
        const fieldsToKeep = [...systemFields, ...outputFieldNames];

        // Filter the document to only include specified fields
        const filteredDocData: { [key: string]: any } = {};
        fieldsToKeep.forEach((fieldName) => {
          if (doc[fieldName] !== undefined) {
            filteredDocData[fieldName] = doc[fieldName];
          }
        });

        return filteredDocData;
      });

      // Create a map of documents for quick lookup
      const documentMap = new Map();
      filteredDocuments.forEach((doc: any) => {
        documentMap.set(doc.id, doc);
      });

      // Generate structured dataset from all annotation entries
      const structuredEntries = annotationEntries.map((entry: any) => {
        const entryData = entry.entry_data || {};
        const highlights = entryData.highlights || [];
        const aianoBlocks = entryData.aiano_blocks || {};

        // Create highlights with individual document metadata
        const processedHighlights = highlights.map((highlight: any) => {
          // Find the document that contains this highlight
          const highlightDocument =
            Array.from(documentMap.values()).find(
              (doc: any) => doc.Document_Id === highlight.documentId
            ) || {};

          // Build document metadata for this specific highlight
          const documentMetadata = Object.keys(highlightDocument).reduce(
            (acc: any, key: string) => {
              if (
                key !== 'id' &&
                key !== 'Document_Id' &&
                key !== 'created_at' &&
                key !== 'updated_at'
              ) {
                acc[key] = highlightDocument[key];
              }
              return acc;
            },
            {}
          );

          // Find the annotation level from project config
          const annotationLevel = projectConfig?.annotationLevels?.find(
            (level) => level.id === highlight.annotationLevelId
          );
          const annotationLevelName = annotationLevel?.name || null;
          const annotationLevelScore =
            annotationLevel?.score !== undefined ? annotationLevel.score : null;

          const highlightData: any = {
            id: highlight.id,
            text: highlight.text,
            start: highlight.start,
            end: highlight.end,
            // Use the original document ID from the dataset
            documentId: highlightDocument.Document_Id,
            // Include annotation level information
            annotationLevel: annotationLevelName,
            annotationLevelId: annotationLevelScore, // Use score number instead of ID
          };

          // Only include document object if it has meaningful data beyond just the ID
          if (Object.keys(documentMetadata).length > 0) {
            highlightData.document = {
              id: highlightDocument.Document_Id,
              ...documentMetadata,
            };
          }

          return highlightData;
        });

        // Create simple AIANO block values (name and value pairs)
        const aianoBlockValues = Object.keys(aianoBlocks).reduce(
          (acc: any, blockId: string) => {
            const block = aianoBlocks[blockId];
            acc[block.name || `Block_${blockId}`] = block.value || '';
            return acc;
          },
          {}
        );

        // Get unique documents referenced in this entry
        const uniqueDocuments = highlights.reduce(
          (docs: any[], highlight: any) => {
            const doc = Array.from(documentMap.values()).find(
              (d: any) => d.Document_Id === highlight.documentId
            );
            if (doc && !docs.find((d) => d.id === doc.Document_Id)) {
              docs.push({
                id: doc.Document_Id,
                // Include all output dataset fields from the document
                ...Object.keys(doc).reduce((acc: any, key: string) => {
                  if (
                    key !== 'id' &&
                    key !== 'Document_Id' &&
                    key !== 'created_at' &&
                    key !== 'updated_at'
                  ) {
                    acc[key] = doc[key];
                  }
                  return acc;
                }, {}),
              });
            }
            return docs;
          },
          []
        );

        return {
          // Entry metadata
          id: entry.id,
          entryName: entry.entry_name,
          entryNotes: entry.entry_notes,
          createdAt: entry.created_at,
          updatedAt: entry.updated_at,
          projectId: entry.project_id,

          // AIANO block values (name: value pairs)
          aianoBlocks: aianoBlockValues,

          // Annotations and highlights with individual document metadata
          highlights: processedHighlights,

          // All documents referenced in this entry
          documents: uniqueDocuments,

          // Additional metadata
          metadata: {
            ...entryData.metadata,
            totalHighlights: highlights.length,
            totalAianoBlocks: Object.keys(aianoBlocks).length,
            totalDocuments: uniqueDocuments.length,
            documentIds: uniqueDocuments.map((doc) => doc.id),
          },
        };
      });

      const dataset = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          format: 'structured-annotation-dataset',
          exportedBy: 'AIANO Annotation Tool',
          projectId: projectConfig.id,
          projectName: projectConfig.name,
          totalEntries: annotationEntries.length,
          totalDocuments: filteredDocuments.length,
        },
        project: {
          // Basic project information
          id: projectConfig.id,
          name: projectConfig.name,
          description: projectConfig.description,
          createdAt: projectConfig.createdAt,
          updatedAt: projectConfig.updatedAt,

          // Project configuration
          config: {
            // Tags
            tags: projectConfig.tags || [],

            // Annotation levels
            annotationLevels: projectConfig.annotationLevels || [],

            // AIANO blocks
            aianoBlocks: projectConfig.aianoBlocks || [],

            // Dataset configuration
            dataset: {
              fields: projectConfig.dataset?.fields || [],
              outputFields: [
                // Document fields marked for export
                ...(projectConfig.dataset?.fields?.filter(
                  (field) => field.includeInFinalDataset
                ) || []),
                // AIANO blocks (always output fields)
                ...(projectConfig.aianoBlocks?.map((block) => ({
                  databaseId: block.id,
                  id: `aiano_db_${block.id}`,
                  name: block.name,
                  type: 'aiano_block',
                  description: `AIANO Block: ${block.name}`,
                  includeInFinalDataset: true,
                  isAianoBlock: true,
                })) || []),
                // Annotation levels (always output fields)
                ...(projectConfig.annotationLevels?.map((level) => ({
                  databaseId: level.id,
                  id: `annotation_db_${level.id}`,
                  name: level.name,
                  type: 'annotation_level',
                  description: `Annotation Level: ${level.name}`,
                  includeInFinalDataset: true,
                  isAnnotationLevel: true,
                })) || []),
              ],
            },
          },

          // Project statistics
          statistics: {
            totalAnnotationLevels: projectConfig.annotationLevels?.length || 0,
            totalAianoBlocks: projectConfig.aianoBlocks?.length || 0,
            totalTags: projectConfig.tags?.length || 0,
            totalDatasetFields: projectConfig.dataset?.fields?.length || 0,
            totalOutputFields:
              projectConfig.dataset?.fields?.filter(
                (field) => field.includeInFinalDataset
              )?.length || 0,
          },
        },
        entries: structuredEntries,
        summary: {
          totalEntries: annotationEntries.length,
          totalDocuments: filteredDocuments.length,
          totalHighlights: annotationEntries.reduce(
            (sum: number, entry: any) => {
              const highlights = entry.entry_data?.highlights || [];
              return sum + (Array.isArray(highlights) ? highlights.length : 0);
            },
            0
          ),
          totalAianoBlocks: annotationEntries.reduce(
            (sum: number, entry: any) => {
              const blocks = entry.entry_data?.aiano_blocks || {};
              return sum + Object.keys(blocks).length;
            },
            0
          ),
        },
      };

      // Create and download the dataset file
      const datasetContent = JSON.stringify(dataset, null, 2);
      const blob = new Blob([datasetContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `annotation-dataset-${projectConfig.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success message
      toast?.success(
        'Structured Dataset Exported',
        `Successfully exported project configuration and ${annotationEntries.length} structured annotation entries with document metadata`
      );
    } catch (error) {
      toast?.error(
        'Export Failed',
        'Failed to fetch annotation entries from database. Please try again.'
      );
    }
  }, [projectConfig, toast]);

  const handleExportProject = useCallback(
    async (localData?: {
      documents: any[];
      highlights: any;
      qaPairs: any[];
      blockValues: any;
    }) => {
      if (!projectConfig) {
        toast?.error('Export Failed', 'No project configuration available');
        return;
      }

      try {
        // Use local data if provided, otherwise try to get from API
        let documents = localData?.documents || [];
        let highlights = localData?.highlights || {};
        const qaPairs = localData?.qaPairs || [];
        let aianoBlocks = localData?.blockValues || {};

        // If no local data provided, try to get from API
        if (!localData) {
          const { projectApiService } = await import('@/services/project-api');

          try {
            // Use the base API client to get documents from the dedicated endpoint
            const apiClient = (
              await import('@/services/api')
            ).createApiClient();
            const documentsResponse = await apiClient.getDocuments(
              parseInt(projectConfig.id)
            );
            documents = documentsResponse || [];
          } catch (error) {
            // Could not fetch documents, continue with empty array
          }

          try {
            const aianoBlocksResponse = await projectApiService.getAianoBlocks(
              projectConfig.id
            );
            aianoBlocks = aianoBlocksResponse || [];
          } catch (error) {
            // Could not fetch AIANO blocks, continue with empty array
          }

          try {
            // Get annotation entries
            const annotationEntries =
              await projectApiService.getAnnotationEntries(projectConfig.id);
          } catch (error) {
            // Could not fetch annotation entries, continue with empty array
          }

          try {
            // Get highlights for each document
            const { apiClient } = await import('@/services/api');
            const allHighlights = [];
            for (const doc of documents) {
              try {
                const docHighlights = await apiClient.getHighlights(
                  parseInt(projectConfig.id),
                  doc.id
                );
                allHighlights.push(...(docHighlights || []));
              } catch (error) {
                // Could not fetch highlights for this document, continue
              }
            }
            highlights = allHighlights;
          } catch (error) {
            // Could not fetch highlights, continue with empty array
          }
        }

        // Convert highlights to array format (handle both object and array)
        const highlightsArray = Array.isArray(highlights)
          ? highlights
          : Object.values(highlights).flat();

        // Get annotation entries for export
        let annotationEntries = [];
        if (!localData) {
          try {
            const { projectApiService } = await import(
              '@/services/project-api'
            );
            annotationEntries = await projectApiService.getAnnotationEntries(
              projectConfig.id
            );
          } catch (error) {
            // Could not fetch annotation entries for export, continue
          }
        }

        // Filter documents to only include fields marked as output dataset fields
        const filteredDocuments = documents.map((doc) => {
          // Get fields that should be included in the final dataset
          const outputFields =
            projectConfig.dataset?.fields?.filter(
              (field) => field.includeInFinalDataset
            ) || [];
          const outputFieldNames = outputFields.map((field) => field.name);

          // Always include Document_Id and required system fields
          const systemFields = [
            'Document_Id',
            'id',
            'created_at',
            'updated_at',
          ];
          const fieldsToKeep = [...systemFields, ...outputFieldNames];

          // Filter the document to only include specified fields
          const filteredDocData: { [key: string]: any } = {};
          fieldsToKeep.forEach((fieldName) => {
            if (doc[fieldName] !== undefined) {
              filteredDocData[fieldName] = doc[fieldName];
            }
          });

          return filteredDocData;
        });

        // Ensure project config has name and description
        const exportProjectConfig = {
          ...projectConfig,
          name: projectConfig.name || 'Untitled Project',
          description: projectConfig.description || '',
        };

        // Create the .aiano file content with filtered data
        const projectData = {
          project: exportProjectConfig,
          documents: filteredDocuments,
          aiano_blocks: aianoBlocks,
          annotation_entries: annotationEntries,
          highlights: highlightsArray,
          qa_pairs: qaPairs,
          session: null, // Will be null if not available
          metadata: {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            format: 'aiano',
            exportedBy: 'AIANO Annotation Tool',
            dataCounts: {
              documents: filteredDocuments.length,
              aianoBlocks: Array.isArray(aianoBlocks)
                ? aianoBlocks.length
                : Object.keys(aianoBlocks).length,
              annotationEntries: annotationEntries.length,
              highlights: highlightsArray.length,
              qaPairs: qaPairs.length,
            },
          },
        };

        // Create the .aiano file content
        const aianoContent = JSON.stringify(projectData, null, 2);

        // Create and download the file
        const blob = new Blob([aianoContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${projectConfig.name.replace(/[^a-zA-Z0-9]/g, '_')}.aiano`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        const dataSummary = `Documents: ${documents.length}, AIANO Blocks: ${Array.isArray(aianoBlocks) ? aianoBlocks.length : Object.keys(aianoBlocks).length}, Annotation Entries: ${annotationEntries.length}, Highlights: ${highlightsArray.length}, Q&A Pairs: ${qaPairs.length}`;
        toast?.success(
          'Project Exported',
          `Project "${projectConfig.name}" exported successfully. ${dataSummary}`
        );
      } catch (error) {
        toast?.error(
          'Export Failed',
          'Failed to export project. Please try again.'
        );
      }
    },
    [projectConfig, toast]
  );

  const handleSubmitEntry = useCallback(
    async (entryData: any) => {
      try {
        // Import the API client
        const { apiClient } = await import('@/services/api');

        // Validate that we have a valid document ID
        if (!entryData.document?.id) {
          throw new Error(
            'The selected document does not have a database ID. Please refresh the page and try again.'
          );
        }

        // Prepare the entry data for the API
        const apiEntryData = {
          project_id: parseInt(projectConfig?.id || '0'),
          document_id: entryData.document.id, // Use the actual document ID
          entry_data: {
            highlights: entryData.annotations || [],
            aiano_blocks: entryData.aianoBlocks || {},
            metadata: {
              timestamp: entryData.timestamp,
              total_annotations: entryData.totalAnnotations || 0,
              project_id: entryData.projectId,
            },
          },
          entry_name: `Entry ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
          entry_notes: `Annotation entry with ${entryData.totalAnnotations || 0} highlights`,
        };

        // Save to database using the new annotation entry API
        const savedEntry = await apiClient.createAnnotationEntry(
          parseInt(projectConfig?.id || '0'),
          apiEntryData
        );

        // Clear AIANO block values after successful save
        setState((prev) => ({ ...prev, blockValues: {} }));

        // Show success message
        toast.success(
          'Entry submitted successfully!',
          'Your annotation entry has been saved to the database and cleared for the next entry.'
        );
      } catch (error) {
        // Show more specific error messages
        let errorMessage =
          'There was an error saving your annotation entry. Please try again.';
        if (error instanceof Error) {
          if (error.message.includes('No document selected')) {
            errorMessage = error.message;
          } else if (
            error.message.includes('Document') &&
            error.message.includes('not found')
          ) {
            errorMessage =
              'The selected document was not found. Please refresh and try again.';
          } else if (error.message.includes('Project not found')) {
            errorMessage = 'Project not found. Please refresh and try again.';
          } else if (error.message.includes('Access denied')) {
            errorMessage = 'Access denied. Please check your permissions.';
          }
        }

        toast.error('Failed to save entry', errorMessage);
      }
    },
    [toast, projectConfig?.id]
  );

  const getMainExportDefaultFileName = useCallback(
    (qaPairs: any[], currentFileId: string | null) => {
      if (qaPairs.length === 0) {
        return 'annotation-export';
      }
      const today = new Date().toISOString().split('T')[0];
      return currentFileId
        ? `qa-session-${currentFileId}-${today}`
        : `qa-session-${today}`;
    },
    []
  );

  const handleTestLLMConnectionWithToast = useCallback(
    async (configId: string, llm: any) => {
      setState((prev) => ({ ...prev, isTestingConnection: true }));
      try {
        const config = settings.llmConfigs.find((c) => c.id === configId);
        if (!config) {
          throw new Error('LLM configuration not found');
        }

        // Convert GlobalLLMConfig to LLMConfig format
        const llmConfig = {
          provider: config.provider || 'custom',
          apiKey: config.apiKey || '',
          apiUrl: config.apiUrl,
          model: config.model,
          temperature: config.temperature || 0.3,
          maxTokens: config.maxTokens || 1000,
          systemPrompt:
            config.systemPrompt ||
            'You are a helpful assistant for information retrieval tasks.',
          requiresAuth: config.requiresAuth || true,
          enabled: true,
        };

        // Test the connection with the specific config
        await llm.testConnection(llmConfig);
        toast.success('Connection test successful!');
      } catch (error) {
        toast.error(
          `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      } finally {
        setState((prev) => ({ ...prev, isTestingConnection: false }));
      }
    },
    [settings.llmConfigs, toast]
  );

  const handleGenerateAI = useCallback(
    async (
      blockId: string,
      projectConfig: ProjectConfig | undefined,
      blockValues: { [blockId: string]: any },
      selectedDocument: any,
      getAllHighlights: () => any[],
      llm: any,
      llmConfig: any
    ) => {
      if (!projectConfig) {
        return;
      }

      const block = (projectConfig.aianoBlocks || []).find(
        (b) => b.id.toString() === blockId || b.id === blockId
      );

      if (!block || !block.aiEnabled) {
        return;
      }

      setState((prev) => ({
        ...prev,
        isGeneratingBlock: { ...prev.isGeneratingBlock, [blockId]: true },
        aiBlockErrors: { ...prev.aiBlockErrors, [blockId]: '' },
      }));

      try {
        let systemPrompt = '';
        let context: any[] = [];

        if (block.soloMode) {
          // Solo mode: use solo system prompt, no context
          systemPrompt = String(
            block.aiConfig?.soloSystemPrompt ||
              `Generate content for: ${block.name}`
          );
          context = [];
        } else {
          // AI mode: use system prompt + input context
          systemPrompt = String(
            block.aiConfig?.systemPrompt ||
              `Generate content for the block: ${block.name}`
          );

          // Build context from input sources
          context = [];

          // Get current highlights for context building
          const currentAllHighlights = getAllHighlights();

          // First, collect all input fields (AIANO blocks, dataset fields)
          const inputFields = [];
          const annotationSources = [];

          if (block.aiConfig?.inputSources) {
            for (const inputSource of block.aiConfig?.inputSources) {
              if (inputSource.type === 'annotation') {
                annotationSources.push(inputSource);
              } else {
                // Process input fields (AIANO blocks, dataset fields)
                switch (inputSource.type) {
                  case 'aiano_block':
                    // Try to find the block by sourceId first, then by label fallback
                    let sourceBlockValue =
                      blockValues[inputSource.sourceId || ''];
                    let blockName = inputSource.sourceId;

                    if (!sourceBlockValue && inputSource.label) {
                      // Fallback: find by label
                      const sourceBlock = projectConfig?.aianoBlocks?.find(
                        (b) => b.name === inputSource.label
                      );
                      if (sourceBlock) {
                        sourceBlockValue = blockValues[sourceBlock.id];
                        blockName = sourceBlock.name;
                      }
                    } else if (sourceBlockValue) {
                      const sourceBlock = projectConfig?.aianoBlocks?.find(
                        (b) => b.id.toString() === inputSource.sourceId
                      );
                      blockName = sourceBlock?.name || inputSource.sourceId;
                    }

                    if (sourceBlockValue) {
                      inputFields.push(`${blockName}: ${sourceBlockValue}`);
                    }
                    break;

                  case 'dataset_field':
                    if (selectedDocument && inputSource.datasetFieldId) {
                      const field = projectConfig.dataset?.fields?.find(
                        (f) => f.id.toString() === inputSource.datasetFieldId
                      );
                      if (field && selectedDocument[field.name] !== undefined) {
                        inputFields.push(
                          `${field.name}: ${selectedDocument[field.name]}`
                        );
                      }
                    }
                    break;
                }
              }
            }
          }

          // Add input fields to context first
          if (inputFields.length > 0) {
            context.push({
              text: `INPUT FIELDS:\n${inputFields.join('\n')}`,
              start: 0,
              end: 0,
            });
          }

          // Then add annotations as documents
          if (annotationSources.length > 0) {
            for (const inputSource of annotationSources) {
              const annotationType = inputSource.annotationType || 'all';

              if (annotationType === 'all') {
                if (currentAllHighlights.length > 0) {
                  const highlightedTexts = currentAllHighlights
                    .map((highlight) => `- ${highlight.text}`)
                    .join('\n');
                  context.push({
                    text: `DOCUMENTS:\n${highlightedTexts}`,
                    start: 0,
                    end: 0,
                  });
                }
              } else if (annotationType.startsWith('annotation_')) {
                const annotationLevelId = annotationType.replace(
                  'annotation_',
                  ''
                );
                const annotationHighlights = currentAllHighlights.filter(
                  (highlight) =>
                    highlight.annotationLevelId === annotationLevelId
                );
                if (annotationHighlights.length > 0) {
                  const level = projectConfig?.annotationLevels?.find(
                    (l) => l.id === annotationLevelId
                  );
                  const levelName = level?.name || 'Annotation Level';
                  const highlightedTexts = annotationHighlights
                    .map((highlight) => `- ${highlight.text}`)
                    .join('\n');
                  context.push({
                    text: `DOCUMENTS (${levelName}):\n${highlightedTexts}`,
                    start: 0,
                    end: 0,
                  });
                }
              }
            }
          }
        }

        if (!llmConfig) {
          throw new Error('No LLM configuration selected');
        }

        // Ensure systemPrompt is a valid string
        systemPrompt = String(
          systemPrompt || `Generate content for: ${block.name}`
        ).trim();

        if (!systemPrompt) {
          systemPrompt = `Generate content for: ${block.name}`;
        }

        let response;
        try {
          response = await llm.generateAnswer(systemPrompt, context);
        } catch (llmError) {
          throw llmError;
        }

        // Update the block value with the AI response
        setState((prev) => ({
          ...prev,
          blockValues: {
            ...prev.blockValues,
            [blockId]: response.content,
          },
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          aiBlockErrors: {
            ...prev.aiBlockErrors,
            [blockId]:
              error instanceof Error
                ? error.message
                : 'Failed to generate content',
          },
        }));
      } finally {
        setState((prev) => ({
          ...prev,
          isGeneratingBlock: { ...prev.isGeneratingBlock, [blockId]: false },
        }));
      }
    },
    []
  );

  const handleDocumentHighlight = useCallback(
    (
      span: any,
      selectedDocument: any,
      toggleHighlight: (docId: string, span: any) => void
    ) => {
      if (selectedDocument) {
        toggleHighlight(selectedDocument.Document_Id, span);
      }
    },
    []
  );

  const handleHighlightClick = useCallback(
    (
      spanId: string,
      documents: any[],
      selectedDocument: any,
      setSelectedDocument: (doc: any) => void,
      getAllHighlights: () => any[]
    ) => {
      // Find the highlight and switch to its document if needed
      const allHighlights = getAllHighlights();
      const targetHighlight = allHighlights.find((h) => h.id === spanId);

      if (targetHighlight && targetHighlight.documentId) {
        // Find the document that contains this highlight
        const targetDocument = documents.find(
          (d) => d.Document_Id === targetHighlight.documentId
        );
        if (targetDocument && targetDocument !== selectedDocument) {
          setSelectedDocument(targetDocument);
        }
      }

      setState((prev) => ({ ...prev, focusedHighlightId: spanId }));
      // Auto-clear focus after 3 seconds
      setTimeout(() => {
        setState((prev) => ({ ...prev, focusedHighlightId: null }));
      }, 3000);
    },
    []
  );

  // AIANO Block Configuration Handlers
  const handleAianoBlockConfigUpdate = useCallback(
    async (blockId: number, config: any) => {
      try {
        if (!projectConfig?.id) {
          throw new Error('No project ID available');
        }

        // Find the block to get its current configuration
        const block = projectConfig.aianoBlocks?.find((b) => b.id === blockId);
        if (!block) {
          throw new Error('AIANO block not found');
        }

        // Only update blocks that have IDs (backend-created blocks)
        if (!block.id) {
          toast.error(
            'Update Failed',
            'Cannot update block configuration - block not yet saved'
          );
          return;
        }

        // Update the block's AI configuration via API
        await aianoBlockApiService.updateAianoBlock(projectConfig.id, blockId, {
          aiConfig: {
            ...block.aiConfig,
            ...config,
          },
        });

        // Refresh project data in the background to get updated data
        // This will update the UI without blocking the current operation
        setTimeout(() => {
          refreshProject(projectConfig.id).catch(() => {
            // Failed to refresh project, continue silently
          });
        }, 100);

        // Use the proper toast method
        toast.success(
          'Configuration Updated',
          `AI configuration updated for block ${blockId}`
        );
      } catch (error) {
        toast.error('Update Failed', 'Failed to update AI configuration');
        throw error; // Re-throw to trigger the catch in the component
      }
    },
    [toast, projectConfig]
  );

  const handleAianoBlockConfigReset = useCallback(
    async (blockId: number) => {
      try {
        if (!projectConfig?.id) {
          throw new Error('No project ID available');
        }

        // Find the block to get its current configuration
        const block = projectConfig.aianoBlocks?.find((b) => b.id === blockId);
        if (!block) {
          throw new Error('AIANO block not found');
        }

        // Only reset blocks that have IDs (backend-created blocks)
        if (!block.id) {
          toast.error(
            'Reset Failed',
            'Cannot reset block configuration - block not yet saved'
          );
          return;
        }

        // Reset the AI config to defaults
        const defaultAiConfig = {
          temperature: 0.7,
          systemPrompt: '',
          maxTokens: 1000,
          soloSystemPrompt: '',
        };

        // Update the block's AI configuration via API
        await aianoBlockApiService.updateAianoBlock(projectConfig.id, blockId, {
          aiConfig: {
            ...block.aiConfig,
            ...defaultAiConfig,
          },
        });

        // Refresh project data in the background to get updated data
        // This will update the UI without blocking the current operation
        setTimeout(() => {
          refreshProject(projectConfig.id).catch(() => {
            // Failed to refresh project, continue silently
          });
        }, 100);

        // Use the proper toast method
        toast.success(
          'Configuration Reset',
          `AI configuration reset to defaults for block ${blockId}`
        );
      } catch (error) {
        toast.error('Reset Failed', 'Failed to reset AI configuration');
        throw error; // Re-throw to trigger the catch in the component
      }
    },
    [toast, projectConfig]
  );

  // Function to save selected LLM config to project
  const saveSelectedLLMConfigToProject = useCallback(
    async (configId: string) => {
      if (!projectConfig?.id) return;

      try {
        const updatedProjectConfig = {
          ...projectConfig,
          selectedLLMConfigId: configId,
          updatedAt: new Date(),
        };

        // Update the project in the database
        const { updateProject } = useProjectStore.getState();
        await updateProject(updatedProjectConfig);
      } catch (error) {
        // Failed to save LLM config to project, continue silently
      }
    },
    [projectConfig]
  );

  const actions: AnnotationContainerActions = {
    setFocusedHighlightId: (id) =>
      setState((prev) => ({ ...prev, focusedHighlightId: id })),
    setShowMainExportDialog: (show) =>
      setState((prev) => ({ ...prev, showMainExportDialog: show })),
    setBlockValues: (values) =>
      setState((prev) => ({ ...prev, blockValues: values })),
    setIsGeneratingBlock: (generating) =>
      setState((prev) => ({ ...prev, isGeneratingBlock: generating })),
    setAiBlockErrors: (errors) =>
      setState((prev) => ({ ...prev, aiBlockErrors: errors })),
    setSelectedLLMConfigId: (id) => {
      setState((prev) => ({ ...prev, selectedLLMConfigId: id }));
      // Save to localStorage immediately for persistence
      if (id && projectConfig?.id) {
        localStorage.setItem(`llm-config-${projectConfig.id}`, id);
      }
    },
    setIsTestingConnection: (testing) =>
      setState((prev) => ({ ...prev, isTestingConnection: testing })),
    handleBlockValueChange,
    handleMainExport,
    handleExportProject,
    handleSubmitEntry,
    handleGenerateAI,
    handleTestLLMConnectionWithToast,
    handleDocumentHighlight,
    handleHighlightClick,
    getMainExportDefaultFileName,
    handleAianoBlockConfigUpdate,
    handleAianoBlockConfigReset,
  };

  return {
    state,
    actions,
    navigate,
    deleteProject,
    toast,
    settings,
  };
}
