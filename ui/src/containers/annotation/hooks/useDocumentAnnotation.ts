import { useState, useCallback, useEffect } from 'react';
import {
  Document,
  HighlightMap,
  TextSpan,
  ExportData,
  QAPair,
  SessionExportData,
} from '../types';
import { ProjectConfig } from '../../project/types';
import { projectApiService } from '@/services/project-api';

interface UseDocumentAnnotationProps {
  toast?: {
    success: (title: string, description?: string) => string;
    error: (title: string, description?: string) => string;
    info: (title: string, description?: string) => string;
    warning: (title: string, description?: string) => string;
  };
  projectConfig?: ProjectConfig;
  projectId?: string;
}

export const useDocumentAnnotation = (props?: UseDocumentAnnotationProps) => {
  const { toast, projectConfig, projectId } = props || {};
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [highlights, setHighlights] = useState<HighlightMap>({});
  const [suggestedAnswer, setSuggestedAnswer] = useState('');
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [editingPairId, setEditingPairId] = useState<string | null>(null);
  const [mode, setMode] = useState<'new' | 'edit' | 'view'>('new');
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a unique file ID based on document IDs (optimized for performance)
  const generateFileId = useCallback((documents: Document[]) => {
    // Only use document IDs for hashing, not full content (much faster)
    const ids = documents.map((doc) => doc.Document_Id || doc.id).join(',');
    // Simple hash function for file identification
    let hash = 0;
    for (let i = 0; i < ids.length; i++) {
      const char = ids.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash; // Convert to 32-bit integer
    }
    return `file_${Math.abs(hash)}`;
  }, []);

  // Force reload documents from database (bypass cache)
  const forceReloadDocuments = useCallback(
    async (projectId: string) => {
      if (!projectId || isLoading) return;

      // Clear cache to force database reload
      const cacheKey = `documents_${projectId}`;
      localStorage.removeItem(cacheKey);

      // Load from database
      await loadDocuments(projectId);
    },
    [isLoading]
  );

  // Load documents from API
  const loadDocuments = useCallback(
    async (projectId: string) => {
      if (!projectId || isLoading) return; // Prevent multiple simultaneous calls

      // Check localStorage cache first
      const cacheKey = `documents_${projectId}`;
      const cachedData = localStorage.getItem(cacheKey);
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      if (cachedData) {
        try {
          const { documents: cachedDocuments, timestamp } =
            JSON.parse(cachedData);
          if (now - timestamp < CACHE_DURATION) {
            // Validate that cached documents have database IDs
            const hasValidIds = cachedDocuments.every(
              (doc: any) => doc.id && typeof doc.id === 'number'
            );
            if (hasValidIds) {
              setDocuments(cachedDocuments);

              // Generate file ID for the cached documents
              const fileId = generateFileId(cachedDocuments);
              setCurrentFileId(fileId);
              return; // Use cached data
            }
            // Cached documents missing database IDs, reloading from database
            localStorage.removeItem(cacheKey);
          }
        } catch (error) {
          // Failed to parse cached documents, clear cache
          localStorage.removeItem(cacheKey);
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        const apiDocuments = await projectApiService.getDocuments(projectId);
        // Validate that all documents have database IDs
        const documentsWithIds = apiDocuments.filter(
          (doc) => doc.id && typeof doc.id === 'number'
        );
        // Some documents may be missing database IDs, but we continue with what we have

        setDocuments(documentsWithIds);

        // Generate file ID for the loaded documents
        const fileId = generateFileId(documentsWithIds);
        setCurrentFileId(fileId);

        // Cache the documents with valid IDs
        try {
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              documents: documentsWithIds,
              timestamp: now,
            })
          );
        } catch (error) {
          // Handle QuotaExceededError - clear old cache entries
          if (
            error instanceof DOMException &&
            error.name === 'QuotaExceededError'
          ) {
            try {
              // Clear old document cache entries
              const keys = Object.keys(localStorage);
              keys.forEach((key) => {
                if (key.startsWith('documents_')) {
                  localStorage.removeItem(key);
                }
              });
              // Try again
              localStorage.setItem(
                cacheKey,
                JSON.stringify({
                  documents: documentsWithIds,
                  timestamp: now,
                })
              );
            } catch (retryError) {
              // Still failing, skip cache - documents will load from database
              console.warn(
                'Unable to cache documents in localStorage. Will load from database.'
              );
            }
          }
        }

        // Only show success toast if there are documents and this is a fresh load
        if (apiDocuments.length > 0) {
          toast?.success('Documents loaded successfully');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load documents';
        setError(errorMessage);
        // Only show error toast once, not on every retry
        if (toast && !error) {
          toast.error('Failed to load documents', errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, toast, generateFileId]
  );

  // Clear document cache for a project
  const clearDocumentCache = useCallback((projectId: string) => {
    const cacheKey = `documents_${projectId}`;
    localStorage.removeItem(cacheKey);
  }, []);

  // Auto-save to localStorage (file-specific)
  // Only save highlights and qaPairs to avoid quota issues with large document sets
  useEffect(() => {
    if (!currentFileId) return;

    try {
      const saveData = {
        highlights,
        qaPairs,
        question,
        answer,
        selectedDocumentId: selectedDocument?.Document_Id || null,
        mode,
        editingPairId,
        // Don't save full documents to avoid localStorage quota issues
        // Documents are loaded from the database/server
      };

      localStorage.setItem(
        `annotation_${currentFileId}`,
        JSON.stringify(saveData)
      );
    } catch (error) {
      // Handle QuotaExceededError gracefully
      if (
        error instanceof DOMException &&
        error.name === 'QuotaExceededError'
      ) {
        console.warn(
          'localStorage quota exceeded. Clearing old annotation data.'
        );
        // Clear old annotation data to free up space
        try {
          const keys = Object.keys(localStorage);
          keys.forEach((key) => {
            if (
              key.startsWith('annotation_') &&
              key !== `annotation_${currentFileId}`
            ) {
              localStorage.removeItem(key);
            }
          });
          // Try again after clearing
          const saveData = {
            highlights,
            qaPairs,
            question,
            answer,
            selectedDocumentId: selectedDocument?.Document_Id || null,
            mode,
            editingPairId,
          };
          localStorage.setItem(
            `annotation_${currentFileId}`,
            JSON.stringify(saveData)
          );
        } catch (retryError) {
          // Still failing, skip localStorage save
          console.warn(
            'Unable to save to localStorage. Data will be lost on page refresh.'
          );
        }
      }
    }
  }, [
    // Removed documents from dependencies to avoid saving them to localStorage
    highlights,
    qaPairs,
    question,
    answer,
    selectedDocument,
    mode,
    editingPairId,
    currentFileId,
  ]);

  // Load from localStorage when file changes
  // Note: Documents are loaded from database, not localStorage (to avoid quota issues)
  useEffect(() => {
    if (!currentFileId) return;

    const savedData = localStorage.getItem(`annotation_${currentFileId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Don't restore documents from localStorage - load from database instead
        setHighlights(parsed.highlights || {});
        setQAPairs(parsed.qaPairs || []);
        setQuestion(parsed.question || '');
        setAnswer(parsed.answer || '');
        setMode(parsed.mode || 'new');
        setEditingPairId(parsed.editingPairId || null);

        // Restore selected document ID, but document will be loaded from database
        if (parsed.selectedDocumentId && projectId) {
          // Document will be matched when documents are loaded from database
        }
      } catch (error) {
        // Failed to load saved data, continue without it
      }
    }
  }, [currentFileId, projectId]);

  // File upload handler
  const handleFileUpload = useCallback(
    async (file: File) => {
      // Show immediate feedback
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      if (toast) {
        toast.info(
          'Processing file...',
          `Reading ${file.name} (${fileSizeMB} MB)...`
        );
      }

      // Check file size (browser limit is usually around 2GB, but we'll set a reasonable limit)
      const maxSize = 100 * 1024 * 1024; // 100MB limit
      if (file.size > maxSize) {
        if (toast) {
          toast.error(
            'File too large',
            `Please upload a file smaller than ${Math.round(maxSize / 1024 / 1024)}MB.`
          );
        } else {
          alert(
            `File too large. Please upload a file smaller than ${Math.round(maxSize / 1024 / 1024)}MB.`
          );
        }
        return;
      }

      // Check file type
      if (!file.name.toLowerCase().endsWith('.json')) {
        if (toast) {
          toast.error(
            'Invalid file type',
            'Please upload a JSON file (.json extension required).'
          );
        } else {
          alert('Please upload a JSON file (.json extension required).');
        }
        return;
      }

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            if (toast) {
              toast.error('Empty file', 'File appears to be empty.');
            } else {
              alert('File appears to be empty.');
            }
            return;
          }

          const data = JSON.parse(content);
          
          // Notify parsing complete
          if (toast) {
            toast.success(
              'File parsed successfully!',
              `Found ${data.length} records in ${file.name}`
            );
          }
          
          if (Array.isArray(data)) {
            // Get required fields from project config (only Document_Id and fields marked as "Document" type)
            const documentFields =
              projectConfig?.dataset?.fields?.filter(
                (field) => field.type === 'document'
              ) || [];
            const requiredFieldNames = [
              'Document_Id',
              ...documentFields.map((field) => field.name),
            ];

            // Validate document structure
            const isValidDocument = (doc: any) => {
              if (!doc || typeof doc.Document_Id !== 'string') {
                return false;
              }

              // Check if all required fields are present
              for (const fieldName of requiredFieldNames) {
                if (doc[fieldName] === undefined || doc[fieldName] === null) {
                  return false;
                }
              }

              return true;
            };

            if (toast) {
              toast.info('Validating documents...', 'Checking document structure');
            }

            const validDocuments = data.filter(isValidDocument);

            if (validDocuments.length === 0) {
              const documentFieldsList =
                documentFields.length > 0
                  ? `, ${documentFields.map((f) => f.name).join(', ')}`
                  : '';
              const errorMessage = `Please check the document structure. Each document must have Document_Id${documentFieldsList} fields.`;

              if (toast) {
                toast.error('Invalid document structure', errorMessage);
              } else {
                alert(errorMessage);
              }
              return;
            }

            // Check for duplicate Document_Id values in the uploaded file
            const uploadedDocumentIds = validDocuments.map(
              (doc) => doc.Document_Id
            );
            const duplicateIds = uploadedDocumentIds.filter(
              (id, index) => uploadedDocumentIds.indexOf(id) !== index
            );
            if (duplicateIds.length > 0) {
              const uniqueDuplicates = [...new Set(duplicateIds)];
              // Truncate ID list to prevent toast from being too wide
              const MAX_IDS_TO_SHOW = 5;
              const idsToShow = uniqueDuplicates.slice(0, MAX_IDS_TO_SHOW);
              const remainingCount = uniqueDuplicates.length - MAX_IDS_TO_SHOW;
              const idList =
                remainingCount > 0
                  ? `${idsToShow.join(', ')} and ${remainingCount} more`
                  : idsToShow.join(', ');

              if (toast) {
                toast.error(
                  'Duplicate Document IDs',
                  `The uploaded file contains duplicate Document IDs: ${idList}. Please ensure each document has a unique Document_Id.`
                );
              } else {
                alert(
                  `The uploaded file contains duplicate Document IDs: ${idList}. Please ensure each document has a unique Document_Id.`
                );
              }
              return;
            }

            // Check for existing Document_Id values in current documents
            const existingDocumentIds = documents.map((doc) => doc.Document_Id);
            const conflictingIds = validDocuments.filter((doc) =>
              existingDocumentIds.includes(doc.Document_Id)
            );
            if (conflictingIds.length > 0) {
              const conflictingIdList = conflictingIds.map(
                (doc) => doc.Document_Id
              );
              // Truncate ID list to prevent toast from being too wide
              const MAX_IDS_TO_SHOW = 5;
              const idsToShow = conflictingIdList.slice(0, MAX_IDS_TO_SHOW);
              const remainingCount = conflictingIdList.length - MAX_IDS_TO_SHOW;
              const idList =
                remainingCount > 0
                  ? `${idsToShow.join(', ')} and ${remainingCount} more`
                  : idsToShow.join(', ');

              if (toast) {
                toast.error(
                  'Document ID already exists',
                  `The following Document IDs already exist in this project: ${idList}. Please use different Document IDs or delete the existing documents first.`
                );
              } else {
                alert(
                  `The following Document IDs already exist in this project: ${idList}. Please use different Document IDs or delete the existing documents first.`
                );
              }
              return;
            }

            // Only show warning if some documents were actually invalid
            if (
              validDocuments.length !== data.length &&
              validDocuments.length > 0
            ) {
              const invalidCount = data.length - validDocuments.length;
              if (toast) {
                toast.warning(
                  'Some documents were skipped',
                  `${invalidCount} of ${data.length} documents were invalid and skipped. ${validDocuments.length} valid documents were uploaded successfully.`
                );
              } else {
                alert(
                  `Warning: ${invalidCount} of ${data.length} documents were invalid and skipped. ${validDocuments.length} valid documents were uploaded successfully.`
                );
              }
            }

            // Save documents to backend first
            if (projectId) {
              try {
                // Show upload start notification
                if (toast) {
                  toast.info(
                    'Uploading documents...',
                    `Starting upload of ${validDocuments.length} documents to server`
                  );
                }

                // Batch documents to avoid overwhelming the backend or browser
                // Use bulk upload endpoint for MUCH faster uploads (single transaction per batch)
                const BATCH_SIZE = 500; // Larger batch size since we're using bulk insert
                const savedDocuments: any[] = [];

                for (let i = 0; i < validDocuments.length; i += BATCH_SIZE) {
                  const batch = validDocuments.slice(i, i + BATCH_SIZE);
                  // Use bulk upload endpoint (single API call per batch)
                  const batchResults = await projectApiService.createDocumentsBulk(
                    projectId,
                    batch
                  );
                  savedDocuments.push(...batchResults);

                  // Show progress more frequently for better UX
                  // Show at every batch for files with < 500 docs, or every 2 batches for larger files
                  if (toast) {
                    const progress = Math.min(
                      100,
                      Math.round(
                        ((i + batch.length) / validDocuments.length) * 100
                      )
                    );
                    
                    // Determine how often to show progress based on file size
                    const updateFrequency = validDocuments.length < 500 ? 1 : 2;
                    const batchNumber = Math.floor(i / BATCH_SIZE);
                    const shouldShowProgress =
                      i === 0 || // First batch
                      batchNumber % updateFrequency === 0 || // Every N batches
                      i + batch.length === validDocuments.length; // Last batch

                    if (shouldShowProgress) {
                      toast.info(
                        `Uploading... ${progress}%`,
                        `Uploaded ${i + batch.length} of ${validDocuments.length} documents`
                      );
                    }
                  }
                }

                // Clear document cache since we've added new documents
                clearDocumentCache(projectId);

                // Update local state with the saved documents that have database IDs
                setDocuments((prev) => [...prev, ...savedDocuments]);

                // Generate new file ID based on all documents (existing + new)
                const allDocuments = [...documents, ...savedDocuments];
                const newFileId = generateFileId(allDocuments);
                setCurrentFileId(newFileId);

                if (toast) {
                  toast.success(
                    'Documents uploaded successfully!',
                    `${savedDocuments.length} document${savedDocuments.length !== 1 ? 's' : ''} uploaded.`
                  );
                } else {
                  alert(
                    `Successfully uploaded ${savedDocuments.length} document${savedDocuments.length !== 1 ? 's' : ''}!`
                  );
                }
              } catch (error) {
                if (toast) {
                  toast.error(
                    'Failed to save documents',
                    'Documents were loaded but not saved to the project. Please try again.'
                  );
                } else {
                  alert(
                    'Failed to save documents to project. Please try again.'
                  );
                }
              }
            } else {
              // Fallback to local storage only if no projectId
              setDocuments((prev) => [...prev, ...validDocuments]);

              // Generate new file ID based on all documents (existing + new)
              const allDocuments = [...documents, ...validDocuments];
              const newFileId = generateFileId(allDocuments);
              setCurrentFileId(newFileId);

              if (toast) {
                toast.warning(
                  'Documents loaded locally',
                  'Documents loaded but not saved to project. Please save the project to persist them.'
                );
              } else {
                alert(
                  `Documents loaded locally. Total: ${allDocuments.length} documents.`
                );
              }
            }
          } else if (toast) {
            toast.error(
              'Invalid file format',
              'Please upload a JSON array of documents.\n\nExpected format: [{"Document_Id": "doc1", "text": "content", ...}, ...]'
            );
          } else {
            alert(
              'Invalid file format. Please upload a JSON array of documents.\n\nExpected format: [{"Document_Id": "doc1", "text": "content", ...}, ...]'
            );
          }
        } catch (error) {
          if (error instanceof SyntaxError) {
            if (toast) {
              toast.error(
                'Invalid JSON format',
                'Please check your file and try again.'
              );
            } else {
              alert(
                'Invalid JSON format. Please check your file and try again.'
              );
            }
          } else if (toast) {
            toast.error(
              'Error reading file',
              error instanceof Error ? error.message : 'Unknown error'
            );
          } else {
            alert(
              `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        }
      };

      reader.onerror = () => {
        if (toast) {
          toast.error('Error reading file', 'Please try again.');
        } else {
          alert('Error reading file. Please try again.');
        }
      };

      reader.readAsText(file);
    },
    [generateFileId, projectId, toast]
  );

  // Highlight management
  const addHighlight = useCallback(
    (documentId: string, span: Omit<TextSpan, 'id'>) => {
      // Check for existing highlights at the same position
      const existingHighlights = highlights[documentId] || [];
      const hasOverlap = existingHighlights.some(
        (existing) =>
          (span.start >= existing.start && span.start < existing.end) ||
          (span.end > existing.start && span.end <= existing.end) ||
          (span.start <= existing.start && span.end >= existing.end)
      );

      if (hasOverlap) {
        // Cannot create highlight: overlaps with existing highlight
        return;
      }

      const newHighlight: TextSpan = {
        ...span,
        id: `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      setHighlights((prev) => ({
        ...prev,
        [documentId]: [...(prev[documentId] || []), newHighlight],
      }));
    },
    [highlights]
  );

  const removeHighlight = useCallback((documentId: string, spanId: string) => {
    setHighlights((prev) => {
      const newHighlights = { ...prev };
      if (newHighlights[documentId]) {
        newHighlights[documentId] = newHighlights[documentId].filter(
          (h) => h.id !== spanId
        );
      }
      return newHighlights;
    });
  }, []);

  const toggleHighlight = useCallback(
    (documentId: string, span: Omit<TextSpan, 'id'>) => {
      // Simply add the highlight - let the UI handle removal via click
      const newHighlight: TextSpan = {
        ...span,
        id: `highlight_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };

      setHighlights((prev) => ({
        ...prev,
        [documentId]: [...(prev[documentId] || []), newHighlight],
      }));
    },
    []
  );

  const getAllHighlights = useCallback(() => {
    const allHighlights: Array<
      TextSpan & { documentId: string; document?: Document }
    > = [];
    Object.keys(highlights).forEach((docId) => {
      const doc = documents.find((d) => d.Document_Id === docId);
      highlights[docId].forEach((span) => {
        allHighlights.push({
          ...span,
          documentId: docId,
          document: doc,
        });
      });
    });
    return allHighlights;
  }, [highlights, documents]);

  // Q&A Pair Management
  const saveQAPair = useCallback(() => {
    if (!question.trim() || !answer.trim()) return;

    const newPair: QAPair = {
      id: `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      question: question.trim(),
      answer: answer.trim(),
      suggestedAnswer: suggestedAnswer || undefined,
      highlights: Object.keys(highlights)
        .map((docId) => ({
          documentId: docId,
          spans: highlights[docId].map((span) => ({
            text: span.text,
            start: span.start,
            end: span.end,
            id: span.id,
          })),
        }))
        .filter((h) => h.spans.length > 0),
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    setQAPairs((prev) => [...prev, newPair]);
    setQuestion('');
    setAnswer('');
    setSuggestedAnswer('');
    setMode('view');
  }, [question, answer, suggestedAnswer, highlights, getAllHighlights]);

  const editQAPair = useCallback(
    (pairId: string) => {
      const pair = qaPairs.find((p) => p.id === pairId);
      if (pair) {
        setQuestion(pair.question);
        setAnswer(pair.answer);
        setSuggestedAnswer(pair.suggestedAnswer || '');
        setEditingPairId(pairId);
        setMode('edit');
      }
    },
    [qaPairs]
  );

  const updateQAPair = useCallback(() => {
    if (!editingPairId || !question.trim() || !answer.trim()) return;

    const updatedPair: QAPair = {
      id: editingPairId,
      question: question.trim(),
      answer: answer.trim(),
      suggestedAnswer: suggestedAnswer || undefined,
      highlights: Object.keys(highlights)
        .map((docId) => ({
          documentId: docId,
          spans: highlights[docId].map((span) => ({
            text: span.text,
            start: span.start,
            end: span.end,
            id: span.id,
          })),
        }))
        .filter((h) => h.spans.length > 0),
      createdAt:
        qaPairs.find((p) => p.id === editingPairId)?.createdAt || new Date(),
      modifiedAt: new Date(),
    };

    setQAPairs((prev) =>
      prev.map((p) => (p.id === editingPairId ? updatedPair : p))
    );
    setQuestion('');
    setAnswer('');
    setSuggestedAnswer('');
    setEditingPairId(null);
    setMode('new');
  }, [
    editingPairId,
    question,
    answer,
    suggestedAnswer,
    highlights,
    getAllHighlights,
    qaPairs,
  ]);

  const deleteQAPair = useCallback((pairId: string) => {
    setQAPairs((prev) => prev.filter((p) => p.id !== pairId));
  }, []);

  const duplicateQAPair = useCallback(
    (pairId: string) => {
      const pair = qaPairs.find((p) => p.id === pairId);
      if (pair) {
        const duplicatedPair: QAPair = {
          ...pair,
          id: `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          question: `${pair.question} (Copy)`,
          createdAt: new Date(),
          modifiedAt: new Date(),
        };
        setQAPairs((prev) => [...prev, duplicatedPair]);
      }
    },
    [qaPairs]
  );

  const exportQAPair = useCallback(
    (pairId: string) => {
      const pair = qaPairs.find((p) => p.id === pairId);
      if (pair) {
        const exportData: ExportData = {
          question: pair.question,
          answer: pair.answer,
          suggestedAnswer: pair.suggestedAnswer || null,
          llmMetadata: pair.llmMetadata || null,
          Subject_Id: pair.Subject_Id || '',
          highlights: pair.highlights,
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qa-pair-${pairId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    },
    [qaPairs]
  );

  const cancelEdit = useCallback(() => {
    setQuestion('');
    setAnswer('');
    setSuggestedAnswer('');
    setEditingPairId(null);
    setMode('new');
  }, []);

  // Export functionality
  const exportData = useCallback(
    (filename: string) => {
      const exportData: SessionExportData = {
        qaPairs,
        exportedAt: new Date(),
        totalPairs: qaPairs.length,
        fileId: currentFileId,
        Subject_Id: selectedDocument?.Subject_Id,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    [qaPairs, currentFileId, selectedDocument, getAllHighlights]
  );

  // Delete a specific document
  const deleteDocument = useCallback(
    async (documentId: string) => {
      try {
        // Find the document to get its database ID
        const documentToDelete = documents.find(
          (doc) => doc.Document_Id === documentId
        );
        if (!documentToDelete) {
          if (toast) {
            toast.error(
              'Document not found',
              'The document you are trying to delete was not found.'
            );
          }
          return;
        }

        // Remove from backend if projectId exists
        if (projectId && documentToDelete.id) {
          await projectApiService.deleteDocument(
            projectId,
            documentToDelete.id.toString()
          );
          // Clear document cache since we've removed a document
          clearDocumentCache(projectId);
        }

        // Remove from local state
        setDocuments((prev) => {
          const updated = prev.filter((doc) => doc.Document_Id !== documentId);
          return updated;
        });

        // Clear highlights for this document
        setHighlights((prev) => {
          const updated = { ...prev };
          delete updated[documentId];
          return updated;
        });

        // If this was the selected document, clear selection
        if (selectedDocument?.Document_Id === documentId) {
          setSelectedDocument(null);
        }

        // Regenerate file ID based on remaining documents
        const remainingDocuments = documents.filter(
          (doc) => doc.Document_Id !== documentId
        );
        if (remainingDocuments.length > 0) {
          const newFileId = generateFileId(remainingDocuments);
          setCurrentFileId(newFileId);
        } else {
          setCurrentFileId(null);
        }

        if (toast) {
          toast.success(
            'Document deleted',
            'Document has been removed from the project.'
          );
        }
      } catch (error) {
        if (toast) {
          toast.error(
            'Failed to delete document',
            'Could not remove document from the project.'
          );
        }
      }
    },
    [
      projectId,
      selectedDocument,
      documents,
      generateFileId,
      toast,
      clearDocumentCache,
    ]
  );

  // Clear all highlights for the current document only
  const clearCurrentDocumentHighlights = useCallback(() => {
    if (selectedDocument?.id) {
      setHighlights((prev) => ({
        ...prev,
        [selectedDocument.id.toString()]: [],
      }));
    }
  }, [selectedDocument?.id]);

  // Clear all data - delete documents from database and clear annotation entries
  const clearAll = useCallback(async () => {
    try {
      // Show initial feedback
      if (toast) {
        toast.info('Clearing project...', 'Starting deletion process');
      }

      // IMPORTANT: Delete annotation entries FIRST to avoid foreign key constraint violations
      if (projectId) {
        try {
          if (toast) {
            toast.info('Clearing annotation entries...', 'Removing annotation data');
          }
          
          // Use bulk delete endpoint for much faster deletion
          const result = await projectApiService.deleteAllAnnotationEntries(projectId);
          
          if (toast && result.deleted_count > 0) {
            toast.info(
              'Annotation entries cleared',
              `Deleted ${result.deleted_count} annotation entries`
            );
          }
        } catch (error) {
          // Don't fail the entire operation if annotation entries can't be cleared
          if (toast) {
            toast.warning('Some annotation entries could not be deleted', 'Continuing with document deletion...');
          }
        }
      }

      // Delete all documents from the database if projectId exists
      if (projectId) {
        try {
          if (toast) {
            toast.info('Deleting documents...', 'Removing all documents from project');
          }
          
          // Use bulk delete endpoint for much faster deletion
          const result = await projectApiService.deleteAllDocuments(projectId);

          if (toast) {
            toast.info(
              'Documents cleared',
              `Deleted ${result.deleted_count} documents`
            );
          }

          // Clear document cache since we've removed all documents
          clearDocumentCache(projectId);
        } catch (error) {
          if (toast) {
            toast.error(
              'Failed to delete documents',
              'Could not remove documents from the project'
            );
          }
          throw error;
        }
      }

      // Clear local state
      setDocuments([]);
      setSelectedDocument(null);
      setQuestion('');
      setAnswer('');
      setHighlights({});
      setSuggestedAnswer('');
      setQAPairs([]);
      setEditingPairId(null);
      setMode('new');
      setCurrentFileId(null);

      if (toast) {
        toast.success(
          'Project cleared',
          'All uploaded documents and annotation entries have been removed. Project configuration has been preserved.'
        );
      }
    } catch (error) {
      if (toast) {
        toast.error(
          'Failed to clear project',
          'Some data could not be removed. Please try again.'
        );
      }
    }
  }, [projectId, documents, clearDocumentCache, toast]);

  // Clear only annotations (highlights)
  const clearAnnotations = useCallback(() => {
    setHighlights({});
  }, []);

  return {
    // State
    documents,
    selectedDocument,
    question,
    answer,
    highlights,
    suggestedAnswer,
    qaPairs,
    editingPairId,
    mode,
    currentFileId,
    isLoading,
    error,
    // Actions
    setSelectedDocument,
    setQuestion,
    setAnswer,
    setSuggestedAnswer,
    handleFileUpload,
    deleteDocument,
    addHighlight,
    removeHighlight,
    toggleHighlight,
    getAllHighlights,
    exportData,
    clearAll,
    clearCurrentDocumentHighlights,
    clearAnnotations,
    loadDocuments,
    forceReloadDocuments,
    clearDocumentCache,
    // Q&A Pair Management
    saveQAPair: mode === 'edit' ? updateQAPair : saveQAPair,
    editQAPair,
    deleteQAPair,
    duplicateQAPair,
    exportQAPair,
    cancelEdit,
  };
};
