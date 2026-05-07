import React from 'react';
import { X, Download, Trash2, Check, Eye, FileText } from 'lucide-react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Card, CardContent } from '@ikim-ui/ui-components/primitive/card';
import { Badge } from '@ikim-ui/ui-components/primitive/badge';
import { Checkbox } from '@ikim-ui/ui-components/primitive/checkbox';
import { DocumentViewerModalsProps } from '../types/DocumentViewer.types';

export const DocumentViewerModals: React.FC<DocumentViewerModalsProps> = ({
  showExportDialog,
  onCloseExportDialog,
  onExport,
  exportType,
  onExportTypeChange,
  showClearConfirmModal,
  onCloseClearConfirmModal,
  onConfirmClear,
  showAnnotationsModal,
  onCloseAnnotationsModal,
  highlights,
  selectedAnnotations,
  onAnnotationSelect,
  onSelectAll,
  onJumpToAnnotation,
  onJumpToDocument,
  onDeleteHighlight,
  projectConfig,
}) => (
  <>
    {/* Export Dialog */}
    {showExportDialog && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">Export Annotations</h2>
            <Button variant="ghost" size="sm" onClick={onCloseExportDialog}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Export Type</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="exportType"
                      value="highlights"
                      checked={exportType === 'highlights'}
                      onChange={(e) =>
                        onExportTypeChange(e.target.value as 'highlights')
                      }
                      className="mr-2"
                    />
                    <span>Highlights Only</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="exportType"
                      value="qa"
                      checked={exportType === 'qa'}
                      onChange={(e) =>
                        onExportTypeChange(e.target.value as 'qa')
                      }
                      className="mr-2"
                    />
                    <span>Q&A Pairs</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="exportType"
                      value="all"
                      checked={exportType === 'all'}
                      onChange={(e) =>
                        onExportTypeChange(e.target.value as 'all')
                      }
                      className="mr-2"
                    />
                    <span>All Data</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 p-6 border-t">
            <Button variant="outline" onClick={onCloseExportDialog}>
              Cancel
            </Button>
            <Button
              onClick={() => onExport(exportType)}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>
    )}

    {/* Clear Confirmation Modal */}
    {showClearConfirmModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-destructive/10 rounded-full">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold">Clear All Annotations</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to clear all annotations? This action cannot
              be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={onCloseClearConfirmModal}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onConfirmClear}>
                Clear All
              </Button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Annotations Modal */}
    {showAnnotationsModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">
              Annotations ({highlights.length})
            </h2>
            <Button variant="ghost" size="sm" onClick={onCloseAnnotationsModal}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onSelectAll}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Select All
                  </Button>
                  {selectedAnnotations.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Clear all selected annotations
                        selectedAnnotations.forEach((id) =>
                          onAnnotationSelect(id)
                        );
                      }}
                      className="flex items-center gap-2 text-destructive hover:text-destructive"
                    >
                      <X className="w-4 h-4" />
                      Clear Selected
                    </Button>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {selectedAnnotations.size} of {highlights.length} selected
                </span>
              </div>

              <div className="space-y-2">
                {highlights.map((highlight) => {
                  const annotationLevel = projectConfig?.annotationLevels?.find(
                    (level) =>
                      level.id === highlight.annotationLevelId ||
                      level.id.toString() === highlight.annotationLevelId ||
                      level.id === parseInt(highlight.annotationLevelId)
                  );
                  const isSelected = selectedAnnotations.has(highlight.id);

                  return (
                    <Card
                      key={highlight.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => onAnnotationSelect(highlight.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Checkbox
                                checked={isSelected}
                                onChange={() =>
                                  onAnnotationSelect(highlight.id)
                                }
                              />
                              <Badge
                                variant="secondary"
                                style={{
                                  backgroundColor: annotationLevel?.color
                                    ? `${annotationLevel.color}20`
                                    : '#6b7280',
                                  color: annotationLevel?.color || '#6b7280',
                                  borderColor:
                                    annotationLevel?.color || '#6b7280',
                                }}
                              >
                                {annotationLevel?.name || 'Unknown Level'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              "{highlight.text}"
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                Position: {highlight.start}-{highlight.end}
                              </span>
                              <span>Length: {highlight.text.length} chars</span>
                              {highlight.documentId && (
                                <span className="px-2 py-1 bg-muted text-muted-foreground rounded">
                                  Doc: {highlight.documentId.slice(0, 8)}...
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {highlight.documentId &&
                              onJumpToDocument &&
                              onJumpToAnnotation && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // First switch to the document
                                    onJumpToDocument(highlight.documentId);
                                    // Then scroll to the highlight after a short delay
                                    setTimeout(() => {
                                      onJumpToAnnotation(highlight);
                                    }, 100);
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <FileText className="w-3 h-3" />
                                  Jump
                                </Button>
                              )}
                            {onDeleteHighlight && highlight.documentId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteHighlight(
                                    highlight.documentId,
                                    highlight.id
                                  );
                                }}
                                className="flex items-center gap-1 text-destructive hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
);
