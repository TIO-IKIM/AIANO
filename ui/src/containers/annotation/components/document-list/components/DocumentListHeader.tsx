import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import { DocumentListHeaderProps } from '../types/DocumentList.types';

export const DocumentListHeader: React.FC<DocumentListHeaderProps> = ({
  filteredCount,
  onFileUpload,
}) => {
  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.multiple = true; // Allow multiple file selection
    input.onchange = (e) => {
      const { files } = e.target as HTMLInputElement;
      if (files && onFileUpload) {
        // Process files sequentially to avoid overwhelming the system
        // Each file will be processed one at a time
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
      }
    };
    input.click();
  };

  return (
    <div className="flex-shrink-0 p-4 border-b border-border bg-card shadow-sm min-h-[88px]">
      <div className="flex items-center justify-between h-full">
        <div className="min-w-0 flex-1 pr-4">
          <h2 className="text-xl font-bold text-foreground leading-tight">
            Documents
          </h2>
          <p
            className="text-xs text-muted-foreground mt-1 truncate"
            style={{ lineHeight: '1.25rem', minHeight: '1.25rem' }}
          >
            {filteredCount} document{filteredCount !== 1 ? 's' : ''} available
          </p>
        </div>
        {onFileUpload && (
          <Button
            onClick={handleUploadClick}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <Upload className="w-4 h-4" />
            Add Documents
          </Button>
        )}
      </div>
    </div>
  );
};
