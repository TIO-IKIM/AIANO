import React from 'react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DocumentDeleteConfirmModalProps {
  isOpen: boolean;
  documentName: string;
  documentId: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DocumentDeleteConfirmModal({
  isOpen,
  documentName,
  documentId,
  onClose,
  onConfirm,
}: DocumentDeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-destructive/10 rounded-full">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold">Delete Document</h2>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-muted-foreground">
              Are you sure you want to delete this document?
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium text-sm">{documentName}</p>
              <div className="mt-1">
                <p className="text-xs text-muted-foreground mb-1">ID:</p>
                <p className="text-xs font-mono bg-background p-2 rounded border break-all">
                  {documentId}
                </p>
              </div>
            </div>
            <p className="text-sm text-destructive">
              ⚠️ This will also delete all annotations and highlights for this
              document. This action cannot be undone!
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Document
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
