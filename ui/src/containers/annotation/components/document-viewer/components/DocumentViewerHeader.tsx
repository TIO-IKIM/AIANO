import React from 'react';
import {
  Search,
  X,
  Download,
  Trash2,
  List,
  ChevronUp,
  ChevronDown,
  History,
} from 'lucide-react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { AnnotationLevelPalette } from '../../AnnotationLevelPalette';
import { DocumentViewerHeaderProps } from '../types/DocumentViewer.types';
import { InlineInfo, INFO_CONTENT } from '@/components/InfoPoint';

export const DocumentViewerHeader: React.FC<DocumentViewerHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onSearchKeyDown,
  onClearSearch,
  searchMatches,
  onNavigateMatch,
  onExport,
  onClearAll,
  onShowAnnotations,
  onShowHistory,
  highlightsCount,
  document,
  projectConfig,
  selectedRelevancyLevel,
  onRelevancyLevelSelect,
}) => (
  <div className="flex-shrink-0 border-b border-border bg-card shadow-sm">
    {/* Sticky Header */}
    <div className="p-4 border-b border-border bg-card shadow-sm min-h-[88px]">
      <div className="flex items-center justify-between h-full">
        <div className="flex-1 pr-4">
          <h2 className="text-xl font-bold text-foreground">
            Annotation Workspace
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and annotate document content
          </p>
        </div>
        {onExport && (
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <Download className="w-4 h-4" />
            Export Dataset
          </Button>
        )}
      </div>
    </div>

    {/* Combined Metadata, Search & Relevancy Box */}
    <div className="p-2 bg-muted rounded border mx-4 mb-1.5 mt-4">
      <div className="space-y-2">
        {/* Metadata Section - All Fields */}
        {projectConfig && document && (
          <div className="border-b border-border pb-1.5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-1 h-3 bg-blue-500 rounded-full" />
                <span className="font-medium">
                  Metadata (
                  {projectConfig.dataset?.fields?.filter(
                    (field) => field.showForAnnotator
                  )?.length || 0}
                  ):
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {projectConfig.dataset?.fields
                  ?.filter((field) => field.showForAnnotator)
                  ?.map((field) => {
                    const value =
                      document[field.name] ||
                      document[field.name.toLowerCase()] ||
                      '';
                    const displayValue = value
                      ? String(value).substring(0, 25) +
                        (String(value).length > 25 ? '...' : '')
                      : '—';
                    return (
                      <div
                        key={field.id}
                        className="flex items-center gap-1 min-w-0"
                      >
                        <span className="text-muted-foreground">
                          {field.name}:
                        </span>
                        <span className="font-medium text-foreground truncate max-w-[120px]">
                          {displayValue}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Search Input Row */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search size={14} className="text-muted-foreground" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search in document..."
              className="w-full pl-8 pr-8 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={onClearSearch}
                className="absolute inset-y-0 right-0 pr-2 flex items-center"
              >
                <X
                  size={14}
                  className="text-muted-foreground hover:text-foreground"
                />
              </button>
            )}
          </div>

          {/* Search Navigation */}
          {searchMatches.length > 0 && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateMatch('prev')}
                disabled={searchMatches.length === 0}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigateMatch('next')}
                disabled={searchMatches.length === 0}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Annotation Level Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Select level:</span>
          <AnnotationLevelPalette
            annotationLevels={projectConfig?.annotationLevels || []}
            selectedLevelId={selectedRelevancyLevel}
            onLevelSelect={onRelevancyLevelSelect}
          />
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="p-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onShowAnnotations}
          className="flex items-center gap-2"
        >
          <List className="w-4 h-4" />
          Annotations ({highlightsCount})
        </Button>

        {onShowHistory && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShowHistory}
            className="flex items-center gap-2"
          >
            <History className="w-4 h-4" />
            History
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="flex items-center gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
          <InlineInfo content={INFO_CONTENT.CLEAR_ALL_HIGHLIGHTS} />
        </Button>
      </div>
    </div>
  </div>
);
