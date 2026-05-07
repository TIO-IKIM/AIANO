import React, { useState, useMemo, useEffect } from 'react';
import { DocumentListProps } from './types/DocumentList.types';
import { useDocumentList } from './hooks/useDocumentList';
import { DocumentListHeader } from './components/DocumentListHeader';
import { DocumentSearch } from './components/DocumentSearch';
import { DocumentFilter } from './components/DocumentFilter';
import { DocumentSort } from './components/DocumentSort';
import { DocumentUpload } from './components/DocumentUpload';
import { ActiveFilters } from './components/ActiveFilters';
import { DocumentItem } from './components/DocumentItem';
import { DocumentListEmpty } from './components/DocumentListEmpty';

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  selectedDocument,
  highlights,
  onDocumentSelect,
  onDocumentDelete,
  projectConfig,
  onFileUpload,
}) => {
  const {
    state,
    filterFields,
    sortFields,
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
  } = useDocumentList(documents, projectConfig, onFileUpload);

  const handleFileUpload = (file: File) => {
    if (onFileUpload) {
      onFileUpload(file);
    }
  };

  // Virtualization: Only render visible documents + buffer for performance
  const ITEMS_PER_PAGE = 50; // Render 50 items at a time
  const [visibleRange, setVisibleRange] = useState({
    start: 0,
    end: ITEMS_PER_PAGE,
  });

  // Reset visible range when filtered documents change
  useEffect(() => {
    setVisibleRange({ start: 0, end: ITEMS_PER_PAGE });
  }, [
    filteredDocuments.length,
    state.searchTerm,
    state.selectedFilterField,
    state.selectedFilterValue,
  ]);

  // Calculate visible documents
  const visibleDocuments = useMemo(
    () => filteredDocuments.slice(visibleRange.start, visibleRange.end),
    [filteredDocuments, visibleRange]
  );

  // Handle scroll to load more
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const { scrollTop } = target;
    const { scrollHeight } = target;
    const { clientHeight } = target;

    // Load more when scrolled 80% down
    if (scrollTop + clientHeight > scrollHeight * 0.8) {
      const newEnd = Math.min(
        visibleRange.end + ITEMS_PER_PAGE,
        filteredDocuments.length
      );
      if (newEnd > visibleRange.end) {
        setVisibleRange({ start: 0, end: newEnd });
      }
    }
  };

  return (
    <div className="h-full bg-background border-r border-border flex flex-col">
      <DocumentListHeader
        filteredCount={filteredDocuments.length}
        onFileUpload={onFileUpload}
      />

      {/* Fixed Search and Filter Section */}
      <div className="flex-shrink-0 bg-background border-b border-border p-4">
        <div className="bg-card border border-border rounded-lg p-4 space-y-4 shadow-sm">
          {/* Section Header */}
          <div className="flex items-center gap-2 pb-2 border-b border-border">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <h3 className="font-semibold text-sm text-foreground">
              Search & Filter
            </h3>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Search Documents
            </label>
            <DocumentSearch
              searchTerm={state.searchTerm}
              onSearchChange={handleSearchChange}
              onClearSearch={clearSearch}
            />
          </div>

          {/* Filter Section */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Filter by Metadata
            </label>
            {filterFields.length > 0 ? (
              <DocumentFilter
                filterFields={filterFields}
                selectedFilterField={state.selectedFilterField}
                selectedFilterValue={state.selectedFilterValue}
                onFilterFieldChange={handleFilterFieldChange}
                onFilterValueChange={handleFilterValueChange}
                onClearFilter={clearFilter}
                documents={documents}
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-dashed border-muted-foreground/30">
                <p className="text-xs text-muted-foreground text-center">
                  No metadata fields configured for filtering
                </p>
                <p className="text-xs text-muted-foreground/70 text-center mt-1">
                  Configure metadata fields in project settings
                </p>
              </div>
            )}
          </div>

          {/* Sort Section */}
          <div className="space-y-2">
            {sortFields && sortFields.length > 0 ? (
              <DocumentSort
                filterFields={sortFields}
                sortField={state.sortField}
                sortDirection={state.sortDirection}
                onSortFieldChange={handleSortFieldChange}
                onSortDirectionChange={handleSortDirectionChange}
                onToggleSortDirection={toggleSortDirection}
              />
            ) : (
              <div className="p-3 bg-muted/50 rounded-md border border-dashed border-muted-foreground/30">
                <p className="text-xs text-muted-foreground text-center">
                  No fields available for sorting
                </p>
                <p className="text-xs text-muted-foreground/70 text-center mt-1">
                  Add fields to your dataset in project settings
                </p>
              </div>
            )}
          </div>

          {/* Active Filters */}
          <ActiveFilters
            searchTerm={state.searchTerm}
            selectedFilterField={state.selectedFilterField}
            selectedFilterValue={state.selectedFilterValue}
            filterFields={filterFields}
            onClearSearch={clearSearch}
            onClearFilter={clearFilter}
            onClearAllFilters={clearAllFilters}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto p-4 flex flex-col"
        onScroll={handleScroll}
      >
        {documents.length === 0 && (
          <DocumentUpload
            onFileUpload={handleFileUpload}
            isDragOver={state.isDragOver}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />
        )}

        {filteredDocuments.length > 0 ? (
          <>
            <div className="space-y-3">
              {visibleDocuments.map((doc) => {
                const docHighlightCount =
                  highlights[doc.Document_Id]?.length || 0;
                const isSelected =
                  selectedDocument?.Document_Id === doc.Document_Id;

                return (
                  <DocumentItem
                    key={doc.Document_Id}
                    document={doc}
                    isSelected={isSelected}
                    highlightCount={docHighlightCount}
                    searchTerm={state.searchTerm}
                    onSelect={onDocumentSelect}
                    onDelete={onDocumentDelete}
                    onHighlightSearchTerm={highlightSearchTerm}
                    onGetTextPreview={getTextPreview}
                  />
                );
              })}
            </div>
            {filteredDocuments.length > visibleRange.end && (
              <div className="text-center text-sm text-muted-foreground py-4">
                Showing {visibleRange.end} of {filteredDocuments.length}{' '}
                documents. Scroll to load more.
              </div>
            )}
          </>
        ) : (
          <DocumentListEmpty
            searchTerm={state.searchTerm}
            hasDocuments={filteredDocuments.length > 0}
          />
        )}
      </div>
    </div>
  );
};
