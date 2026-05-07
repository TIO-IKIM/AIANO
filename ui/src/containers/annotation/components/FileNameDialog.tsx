import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FileNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (filename: string) => void;
  defaultFileName: string;
  title: string;
  description?: string;
}

export const FileNameDialog: React.FC<FileNameDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  defaultFileName,
  title,
  description,
}) => {
  const [filename, setFilename] = useState(defaultFileName);

  useEffect(() => {
    if (isOpen) {
      setFilename(defaultFileName);
    }
  }, [isOpen, defaultFileName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filename.trim()) {
      // Ensure .json extension
      const finalFilename = filename.trim().endsWith('.json')
        ? filename.trim()
        : `${filename.trim()}.json`;
      onConfirm(finalFilename);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="filename"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              File Name
            </label>
            <input
              id="filename"
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter filename..."
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              .json extension will be added automatically if not present
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!filename.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Export
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
