import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { ActiveFiltersProps } from '../types/DocumentList.types';

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  searchTerm,
  selectedFilterField,
  selectedFilterValue,
  filterFields,
  onClearSearch,
  onClearFilter,
  onClearAllFilters,
}) => {
  const hasActiveFilters =
    searchTerm ||
    selectedFilterField !== 'all' ||
    selectedFilterValue !== 'all';

  if (!hasActiveFilters) return null;

  return (
    <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded overflow-hidden">
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className="text-sm font-medium text-foreground flex-shrink-0">
          Active Filters:
        </span>
        <button
          onClick={onClearAllFilters}
          className="text-primary hover:text-primary/80 text-sm flex-shrink-0"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-1 min-w-0 overflow-hidden">
        {searchTerm && (
          <div className="flex items-center gap-2 min-w-0">
            <Search size={14} className="text-primary flex-shrink-0" />
            <span
              className="text-sm text-foreground truncate min-w-0"
              title={searchTerm}
            >
              Text: "
              {searchTerm.length > 50
                ? `${searchTerm.substring(0, 50)}...`
                : searchTerm}
              "
            </span>
            <button
              onClick={onClearSearch}
              className="text-primary hover:text-primary/80 flex-shrink-0"
            >
              <X size={12} />
            </button>
          </div>
        )}
        {selectedFilterField !== 'all' && (
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <Filter size={14} className="text-primary flex-shrink-0" />
            <div className="text-sm text-foreground min-w-0 flex-1 flex items-center gap-1 overflow-hidden">
              <span className="flex-shrink-0">
                {filterFields.find((f) => f.id === selectedFilterField)?.name ||
                  'Field'}
                :
              </span>
              <span
                className="truncate min-w-0"
                title={
                  selectedFilterValue !== 'all'
                    ? String(selectedFilterValue)
                    : undefined
                }
              >
                {selectedFilterValue !== 'all'
                  ? (() => {
                      const valueStr = String(selectedFilterValue);
                      const maxLength = 50;
                      return valueStr.length > maxLength
                        ? `${valueStr.substring(0, maxLength)}...`
                        : valueStr;
                    })()
                  : 'All Values'}
              </span>
            </div>
            <button
              onClick={onClearFilter}
              className="text-primary hover:text-primary/80 flex-shrink-0"
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
