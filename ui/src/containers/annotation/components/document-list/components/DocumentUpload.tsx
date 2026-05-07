import React from 'react';
import { DocumentUploadProps } from '../types/DocumentList.types';

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onFileUpload,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (files && onFileUpload) {
      // Process files sequentially with small delays to prevent toast spam
      const fileArray = Array.from(files);
      let currentIndex = 0;

      const processNextFile = () => {
        if (currentIndex < fileArray.length) {
          onFileUpload(fileArray[currentIndex]);
          currentIndex++;
          // Small delay between files to prevent toast spam
          if (currentIndex < fileArray.length) {
            setTimeout(processNextFile, 100);
          }
        }
      };

      processNextFile();
      // Reset the input so the same files can be selected again
      event.target.value = '';
    }
  };

  return (
    <div
      className={`mb-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
        isDragOver
          ? 'border-primary/40 bg-primary/10'
          : 'border-input bg-muted hover:border-ring hover:bg-accent'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver(e);
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        e.preventDefault();
        onDrop(e);
      }}
      onClick={() => document.getElementById('file-upload-input')?.click()}
    >
      <div className="space-y-3">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {isDragOver ? 'Drop your JSON file here' : 'Upload your documents'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click to browse or drag and drop a JSON file
          </p>
        </div>
        {onFileUpload && (
          <input
            id="file-upload-input"
            type="file"
            accept=".json"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        )}
      </div>
    </div>
  );
};
