import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@ikim-ui/ui-components/primitive/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ikim-ui/ui-components/primitive/select';
import { FilterField } from '../types/DocumentList.types';

interface DocumentSortProps {
  filterFields: FilterField[];
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSortFieldChange: (field: string) => void;
  onSortDirectionChange: (direction: 'asc' | 'desc') => void;
  onToggleSortDirection: () => void;
}

export const DocumentSort: React.FC<DocumentSortProps> = ({
  filterFields,
  sortField,
  sortDirection,
  onSortFieldChange,
  onToggleSortDirection,
}) => (
  <div className="space-y-2">
    <label className="text-xs font-medium text-muted-foreground">
      Sort by Field
    </label>
    <div className="flex items-center gap-2">
      <Select value={sortField} onValueChange={onSortFieldChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select field to sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No sorting</SelectItem>
          {filterFields.map((field) => (
            <SelectItem key={field.id} value={field.id}>
              {field.name} ({field.type})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {sortField !== 'none' && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleSortDirection}
          className="flex items-center gap-1 flex-shrink-0"
          title={`Sort ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}`}
        >
          {sortDirection === 'asc' ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
          <span className="text-xs">
            {sortDirection === 'asc' ? 'Asc' : 'Desc'}
          </span>
        </Button>
      )}
    </div>
  </div>
);
