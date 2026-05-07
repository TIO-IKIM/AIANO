import React from 'react';
import { Upload, Download, Settings } from 'lucide-react';

interface HeaderProps {
  onFileUpload: (file: File) => void;
  onToggleLLMConfig: () => void;
  onClearAll: () => void;
  onExport: () => void;
  canExport: boolean;
  currentFileId: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  onFileUpload,
  onToggleLLMConfig,
  onClearAll,
  onExport,
  canExport,
  currentFileId,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        onFileUpload(file);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error uploading file');
      }
    }
  };

  return (
    <div className="bg-card shadow-sm border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Document Annotation Tool
          </h1>
        </div>
        <div className="flex gap-3">
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
            <Upload size={20} />
            Upload JSON
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
          <button
            onClick={onToggleLLMConfig}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Settings size={20} />
            LLM Config
          </button>
          <button
            onClick={onClearAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onExport}
            disabled={!canExport}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>
    </div>
  );
};
