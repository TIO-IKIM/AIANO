import React from 'react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { AlertTriangle } from 'lucide-react';

interface SubmitWithoutHighlightsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SubmitWithoutHighlightsDialog: React.FC<
  SubmitWithoutHighlightsDialogProps
> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/10 rounded-full">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <h2 className="text-lg font-semibold">Submit Without Highlights</h2>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-muted-foreground">
              You are submitting an entry without highlights. Are you sure you
              want to continue?
            </p>
            <p className="text-sm text-muted-foreground">
              This entry will be saved with only the AIANO block values, but no
              text annotations.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onConfirm} className="flex items-center gap-2">
              Yes, Submit Anyway
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
