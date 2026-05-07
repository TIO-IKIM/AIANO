import React from 'react';
import { Search, X } from 'lucide-react';
import { DocumentSearchProps } from '../types/DocumentList.types';

export const DocumentSearch: React.FC<DocumentSearchProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
}) => (
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search size={16} className="text-muted-foreground" />
    </div>
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search in all documents..."
      className="w-full pl-10 pr-10 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
    />
    {searchTerm && (
      <button
        onClick={onClearSearch}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        title="Clear search"
      >
        <X size={16} />
      </button>
    )}
  </div>
);
