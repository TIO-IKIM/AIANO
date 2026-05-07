import { Document, HighlightMap } from '@/containers/annotation/types';
import { ProjectConfig } from '@/containers/project/types';

export interface DocumentListProps {
  documents: Document[];
  selectedDocument: Document | null;
  highlights: HighlightMap;
  onDocumentSelect: (document: Document) => void;
  onDocumentDelete?: (documentId: string) => void;
  projectConfig?: ProjectConfig;
  onFileUpload?: (file: File) => void;
}

export interface DocumentListHeaderProps {
  filteredCount: number;
  onFileUpload?: (file: File) => void;
}

export interface DocumentSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearSearch: () => void;
}

export interface DocumentFilterProps {
  filterFields: FilterField[];
  selectedFilterField: string;
  selectedFilterValue: string;
  onFilterFieldChange: (field: string) => void;
  onFilterValueChange: (value: string) => void;
  onClearFilter: () => void;
  documents: Document[];
}

export interface DocumentUploadProps {
  onFileUpload?: (file: File) => void;
  isDragOver: boolean;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

export interface DocumentItemProps {
  document: Document;
  isSelected: boolean;
  highlightCount: number;
  searchTerm: string;
  onSelect: (document: Document) => void;
  onDelete?: (documentId: string) => void;
  onHighlightSearchTerm: (text: string, term: string) => React.ReactNode;
  onGetTextPreview: (
    document: Document,
    searchTerm: string
  ) => React.ReactNode | null;
}

export interface ActiveFiltersProps {
  searchTerm: string;
  selectedFilterField: string;
  selectedFilterValue: string;
  filterFields: FilterField[];
  onClearSearch: () => void;
  onClearFilter: () => void;
  onClearAllFilters: () => void;
}

export interface FilterField {
  id: string;
  name: string;
  type: string;
}

export interface DocumentListState {
  selectedFilterField: string;
  selectedFilterValue: string;
  searchTerm: string;
  isDragOver: boolean;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}
