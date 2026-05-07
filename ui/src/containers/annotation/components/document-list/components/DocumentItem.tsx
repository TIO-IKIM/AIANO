import React, { useState, memo } from 'react';
import { FileText, Calendar, Tag, Trash2 } from 'lucide-react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { DocumentItemProps } from '../types/DocumentList.types';
import { DocumentDeleteConfirmModal } from '../../DocumentDeleteConfirmModal';

export const DocumentItem: React.FC<DocumentItemProps> = memo(
  ({
    document,
    isSelected,
    highlightCount,
    searchTerm,
    onSelect,
    onDelete,
    onHighlightSearchTerm,
    onGetTextPreview,
  }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent document selection when clicking delete
      setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
      if (onDelete) {
        onDelete(document.Document_Id);
      }
      setShowDeleteModal(false);
    };

    const handleCancelDelete = () => {
      setShowDeleteModal(false);
    };

    return (
      <div
        key={document.Document_Id}
        onClick={() => onSelect(document)}
        className={`p-4 rounded border cursor-pointer transition-all group ${
          isSelected
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-input hover:bg-muted'
        }`}
      >
        <div className="flex items-start gap-3">
          <FileText
            size={20}
            className="text-muted-foreground mt-1 flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary truncate">
                {onHighlightSearchTerm(document.Category, searchTerm)}
              </span>
              {highlightCount > 0 && (
                <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded font-medium">
                  {highlightCount} highlight{highlightCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-foreground mb-1 truncate">
              {onHighlightSearchTerm(document.Display, searchTerm)}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar size={14} />
              <span>{document.Date}</span>
            </div>
            {onGetTextPreview(document, searchTerm)}
          </div>
        </div>

        {/* Delete button positioned at bottom left */}
        {onDelete && (
          <div className="mt-3 flex justify-start">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}

        <DocumentDeleteConfirmModal
          isOpen={showDeleteModal}
          documentName={document.Display}
          documentId={document.Document_Id}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      </div>
    );
  },
  (prevProps, nextProps) =>
    // Custom comparison function for memoization
    prevProps.document.Document_Id === nextProps.document.Document_Id &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.highlightCount === nextProps.highlightCount &&
    prevProps.searchTerm === nextProps.searchTerm
);
