import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Document } from '@/containers/annotation/types';
import { ProjectConfig } from '@/containers/project/types';
import { DocumentListState, FilterField } from '../types/DocumentList.types';

export function useDocumentList(
  documents: Document[],
  projectConfig?: ProjectConfig,
  onFileUpload?: (file: File) => void
) {
  const [state, setState] = useState<DocumentListState>({
    selectedFilterField: 'all',
    selectedFilterValue: 'all',
    searchTerm: '',
    isDragOver: false,
    sortField: 'none',
    sortDirection: 'desc',
  });

  // Get available filter fields from project configuration (only metadata fields)
  const filterFields = useMemo((): FilterField[] => {
    if (!documents.length) return [];

    // Only use fields that are explicitly marked as metadata (showForAnnotator: true)
    if (projectConfig?.dataset?.fields) {
      const metadataFields = projectConfig.dataset.fields
        .filter((field) => field.showForAnnotator)
        .map((field) => ({
          id: field.name,
          name: field.name,
          type: field.type,
        }));

      return metadataFields;
    }

    // If no project configuration, return empty array (no filtering allowed)
    return [];
  }, [documents, projectConfig]);

  // Get available sort fields - only fields marked as document metadata (showForAnnotator: true)
  const sortFields = useMemo((): FilterField[] => {
    if (!documents.length) return [];

    // Only use fields that are explicitly marked as metadata (showForAnnotator: true)
    if (projectConfig?.dataset?.fields) {
      const metadataFields = projectConfig.dataset.fields
        .filter((field) => field.showForAnnotator)
        .map((field) => ({
          id: field.name,
          name: field.name,
          type: field.type,
        }));

      return metadataFields;
    }

    // If no project configuration, return empty array
    return [];
  }, [documents, projectConfig]);

  // Set default sort to date field (newest first) when sortFields are available
  useEffect(() => {
    if (sortFields.length > 0 && state.sortField === 'none') {
      // Find date field (case-insensitive search for "date" or "Date", or type === 'date')
      const dateField = sortFields.find(
        (field) =>
          field.type === 'date' ||
          field.name.toLowerCase() === 'date' ||
          field.name === 'Date'
      );

      if (dateField) {
        setState((prev) => ({
          ...prev,
          sortField: dateField.id,
          sortDirection: 'desc', // Newest first
        }));
      }
    }
  }, [sortFields, state.sortField]);

  // Get unique values for the selected filter field
  const filterValues = useMemo(() => {
    if (state.selectedFilterField === 'all' || !documents.length) return [];

    const field = filterFields.find((f) => f.id === state.selectedFilterField);
    if (!field) return [];

    const uniqueValues = [
      ...new Set(
        documents
          .map((doc) => doc[field.name])
          .filter(
            (value) => value !== undefined && value !== null && value !== ''
          )
      ),
    ];
    return uniqueValues.sort();
  }, [documents, state.selectedFilterField, filterFields]);

  // Filter documents based on selected filter field/value and search term
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Filter by selected field value
    if (
      state.selectedFilterField !== 'all' &&
      state.selectedFilterValue !== 'all'
    ) {
      const field = filterFields.find(
        (f) => f.id === state.selectedFilterField
      );
      if (field) {
        filtered = filtered.filter((doc) => {
          const fieldValue = doc[field.name];
          return (
            fieldValue !== undefined &&
            fieldValue !== null &&
            String(fieldValue).toLowerCase() ===
              String(state.selectedFilterValue).toLowerCase()
          );
        });
      }
    }

    // Filter by search term (case-insensitive)
    if (state.searchTerm.trim()) {
      const searchLower = state.searchTerm.toLowerCase();
      filtered = filtered.filter((doc) => {
        try {
          // Search in all available fields from the document
          const searchableFields = [
            doc.text,
            doc.Display,
            doc.Category,
            doc.Subject_Id,
            doc.Document_Id,
            doc.Date,
            // Include all other fields from the document
            ...Object.keys(doc)
              .filter(
                (key) =>
                  ![
                    'text',
                    'Display',
                    'Category',
                    'Subject_Id',
                    'Document_Id',
                    'Date',
                  ].includes(key)
              )
              .map((key) => doc[key])
              .filter((value) => value !== undefined && value !== null),
          ];

          return searchableFields.some((fieldValue) =>
            String(fieldValue).toLowerCase().includes(searchLower)
          );
        } catch (error) {
          console.warn(
            'Search filtering failed for document:',
            doc.Document_Id,
            error
          );
          return false;
        }
      });
    }

    // Apply sorting
    if (state.sortField !== 'none') {
      const field = sortFields.find((f) => f.id === state.sortField);
      if (field) {
        filtered = [...filtered].sort((a, b) => {
          const aValue = a[field.name];
          const bValue = b[field.name];

          // Handle null/undefined values
          if (aValue === undefined || aValue === null) return 1;
          if (bValue === undefined || bValue === null) return -1;

          let comparison = 0;

          // Sort based on field type
          if (field.type === 'date') {
            // Parse dates and compare
            const aDate = new Date(aValue).getTime();
            const bDate = new Date(bValue).getTime();
            if (isNaN(aDate)) return 1;
            if (isNaN(bDate)) return -1;
            comparison = aDate - bDate;
          } else if (field.type === 'number') {
            // Compare numbers
            const aNum = Number(aValue);
            const bNum = Number(bValue);
            if (isNaN(aNum)) return 1;
            if (isNaN(bNum)) return -1;
            comparison = aNum - bNum;
          } else {
            // Default to string comparison
            comparison = String(aValue).localeCompare(
              String(bValue),
              undefined,
              {
                numeric: true,
                sensitivity: 'base',
              }
            );
          }

          return state.sortDirection === 'asc' ? comparison : -comparison;
        });
      }
    }

    return filtered;
  }, [
    documents,
    state.selectedFilterField,
    state.selectedFilterValue,
    state.searchTerm,
    state.sortField,
    state.sortDirection,
    filterFields,
    sortFields,
  ]);

  // Event handlers
  const handleSearchChange = useCallback((term: string) => {
    setState((prev) => ({ ...prev, searchTerm: term }));
  }, []);

  const handleFilterFieldChange = useCallback((field: string) => {
    setState((prev) => ({
      ...prev,
      selectedFilterField: field,
      selectedFilterValue: 'all', // Reset value when field changes
    }));
  }, []);

  const handleFilterValueChange = useCallback((value: string) => {
    setState((prev) => ({ ...prev, selectedFilterValue: value }));
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setState((prev) => ({ ...prev, isDragOver: true }));
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setState((prev) => ({ ...prev, isDragOver: false }));
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setState((prev) => ({ ...prev, isDragOver: false }));

      // Extract files from the drop event
      const { files } = event.dataTransfer;
      if (files && files.length > 0 && onFileUpload) {
        // Process files sequentially with small delays to prevent toast spam
        const fileArray = Array.from(files);
        let currentIndex = 0;

        const processNextFile = () => {
          if (currentIndex < fileArray.length) {
            const file = fileArray[currentIndex];
            // Only process JSON files
            if (
              file.type === 'application/json' ||
              file.name.endsWith('.json')
            ) {
              onFileUpload(file);
            }
            currentIndex++;
            // Small delay between files to prevent toast spam
            if (currentIndex < fileArray.length) {
              setTimeout(processNextFile, 100);
            }
          }
        };

        processNextFile();
      }
    },
    [onFileUpload]
  );

  // Clear functions
  const clearSearch = useCallback(() => {
    setState((prev) => ({ ...prev, searchTerm: '' }));
  }, []);

  const clearFilter = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedFilterField: 'all',
      selectedFilterValue: 'all',
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      searchTerm: '',
      selectedFilterField: 'all',
      selectedFilterValue: 'all',
      sortField: 'none',
      sortDirection: 'asc',
    }));
  }, []);

  const handleSortFieldChange = useCallback((field: string) => {
    setState((prev) => ({
      ...prev,
      sortField: field,
      // If switching to a new field, default to ascending
      sortDirection: prev.sortField === field ? prev.sortDirection : 'asc',
    }));
  }, []);

  const handleSortDirectionChange = useCallback((direction: 'asc' | 'desc') => {
    setState((prev) => ({
      ...prev,
      sortDirection: direction,
    }));
  }, []);

  const toggleSortDirection = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Utility functions
  const escapeRegExp = useCallback(
    (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    []
  );

  const highlightSearchTerm = useCallback(
    (text: string, term: string): React.ReactNode => {
      if (!term.trim()) return text;

      try {
        const escapedTerm = escapeRegExp(term);
        const regex = new RegExp(`(${escapedTerm})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, index) => {
          if (part.toLowerCase() === term.toLowerCase()) {
            return React.createElement(
              'span',
              {
                key: index,
                className: 'bg-yellow-200 font-medium',
              },
              part
            );
          }
          return part;
        });
      } catch (error) {
        // If regex fails, return original text
        console.warn('Search highlighting failed:', error);
        return text;
      }
    },
    [escapeRegExp]
  );

  const getTextPreview = useCallback(
    (document: Document, searchTerm: string): React.ReactNode | null => {
      if (!searchTerm.trim() || !document.text) return null;

      try {
        const searchLower = searchTerm.toLowerCase();
        const textLower = document.text.toLowerCase();
        const index = textLower.indexOf(searchLower);

        if (index === -1) return null;

        const start = Math.max(0, index - 50);
        const end = Math.min(
          document.text.length,
          index + searchTerm.length + 50
        );
        const preview = document.text.slice(start, end);

        if (!preview) return null;

        return React.createElement(
          'div',
          {
            className:
              'mt-2 p-2 bg-muted rounded text-xs text-muted-foreground',
          },
          [
            React.createElement(
              'span',
              {
                key: 'match-label',
                className: 'font-medium',
              },
              'Match: '
            ),
            start > 0 && '...',
            highlightSearchTerm(preview, searchTerm),
            end < document.text.length && '...',
          ].filter(Boolean)
        );
      } catch (error) {
        console.warn('Text preview failed:', error);
        return null;
      }
    },
    [highlightSearchTerm]
  );

  return {
    state,
    filterFields,
    sortFields,
    filterValues,
    filteredDocuments,
    handleSearchChange,
    handleFilterFieldChange,
    handleFilterValueChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearSearch,
    clearFilter,
    clearAllFilters,
    handleSortFieldChange,
    handleSortDirectionChange,
    toggleSortDirection,
    highlightSearchTerm,
    getTextPreview,
  };
}
