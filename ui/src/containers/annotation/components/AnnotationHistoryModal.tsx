import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Eye,
  Calendar,
  FileText,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { apiClient } from '@/services/api';
import { AnnotationEntry } from '@/containers/annotation/types';

interface AnnotationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectConfig?: any;
  onDeleteEntry?: (entryId: number) => void;
}

export const AnnotationHistoryModal: React.FC<AnnotationHistoryModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectConfig,
  onDeleteEntry,
}) => {
  const [entries, setEntries] = useState<AnnotationEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<AnnotationEntry | null>(
    null
  );

  // Load annotation entries when modal opens
  useEffect(() => {
    if (isOpen && projectId) {
      loadEntries();
    }
  }, [isOpen, projectId]);

  const loadEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const entriesData = await apiClient.getAnnotationEntries(projectId);
      setEntries(entriesData);
    } catch (err) {
      console.error('Failed to load annotation entries:', err);
      setError('Failed to load annotation entries');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('Are you sure you want to delete this annotation entry?')) {
      return;
    }

    try {
      await apiClient.deleteAnnotationEntry(projectId, entryId);
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
      onDeleteEntry?.(entryId);
    } catch (err) {
      console.error('Failed to delete annotation entry:', err);
      alert('Failed to delete annotation entry');
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const getHighlightsCount = (entry: AnnotationEntry) =>
    entry.entry_data?.highlights?.length || 0;

  const getAianoBlocksCount = (entry: AnnotationEntry) =>
    Object.keys(entry.entry_data?.aiano_blocks || {}).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-background border border-border rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Annotation History
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex min-h-0">
          {/* Entries List */}
          <div className="w-1/2 border-r border-border overflow-y-auto">
            <div className="p-4 space-y-3">
              {loading && (
                <div className="text-center py-8 text-muted-foreground">
                  Loading annotation entries...
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-destructive">{error}</div>
              )}

              {!loading && !error && entries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No annotation entries found
                </div>
              )}

              {!loading && !error && entries.length > 0 && (
                <>
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 border border-border rounded-lg cursor-pointer transition-colors ${
                        selectedEntry?.id === entry.id
                          ? 'bg-primary/10 border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground truncate">
                            {entry.entry_name || `Entry ${entry.id}`}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(entry.created_at)}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {getHighlightsCount(entry)} highlights
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {getAianoBlocksCount(entry)} blocks
                            </span>
                          </div>
                          {entry.entry_notes && (
                            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                              {entry.entry_notes}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEntry(entry.id);
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Entry Details */}
          <div className="w-1/2 overflow-y-auto min-h-0">
            {selectedEntry ? (
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {selectedEntry.entry_name || `Entry ${selectedEntry.id}`}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedEntry.created_at)}
                  </div>
                  {selectedEntry.entry_notes && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedEntry.entry_notes}
                    </p>
                  )}
                </div>

                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Highlights ({getHighlightsCount(selectedEntry)})
                  </h4>
                  {selectedEntry.entry_data?.highlights?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEntry.entry_data.highlights.map(
                        (highlight: any, index: number) => {
                          // Find the annotation level name
                          const annotationLevel =
                            projectConfig?.annotationLevels?.find(
                              (level) =>
                                level.id === highlight.annotationLevelId ||
                                level.id.toString() ===
                                  highlight.annotationLevelId ||
                                level.id ===
                                  parseInt(highlight.annotationLevelId)
                            );
                          const levelName =
                            annotationLevel?.name || 'Unknown Level';

                          return (
                            <div
                              key={index}
                              className="p-3 bg-muted/50 rounded border text-sm"
                            >
                              <div className="font-medium text-foreground mb-1">
                                {highlight.text || 'Highlight text'}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Level: {levelName}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No highlights
                    </p>
                  )}
                </div>

                {/* AIANO Blocks */}
                <div>
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    AIANO Blocks ({getAianoBlocksCount(selectedEntry)})
                  </h4>
                  {selectedEntry.entry_data?.aiano_blocks &&
                  Object.keys(selectedEntry.entry_data.aiano_blocks).length >
                    0 ? (
                    <div className="space-y-2">
                      {Object.entries(
                        selectedEntry.entry_data.aiano_blocks
                      ).map(([blockId, block]: [string, any]) => (
                        <div
                          key={blockId}
                          className="p-3 bg-muted/50 rounded border text-sm"
                        >
                          <div className="font-medium text-foreground mb-1">
                            {block.name || blockId}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            Type: {block.type || 'Unknown'}
                          </div>
                          <div className="text-sm text-foreground">
                            {block.value || 'No content'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No AIANO blocks
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an entry to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
