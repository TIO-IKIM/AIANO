import React from 'react';
import { Filter } from 'lucide-react';
import { DocumentFilterProps } from '../types/DocumentList.types';

export const DocumentFilter: React.FC<DocumentFilterProps> = ({
  filterFields,
  selectedFilterField,
  selectedFilterValue,
  onFilterFieldChange,
  onFilterValueChange,
  onClearFilter,
  documents,
}) => {
  if (filterFields.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2">
        <select
          value={selectedFilterField}
          onChange={(e) => onFilterFieldChange(e.target.value)}
          className="w-full py-2 px-3 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
        >
          <option value="all">All Documents ({documents.length})</option>
          {filterFields.map((field) => (
            <option key={field.id} value={field.id}>
              {field.name} ({field.type})
            </option>
          ))}
        </select>

        {selectedFilterField !== 'all' && (
          <select
            value={selectedFilterValue}
            onChange={(e) => onFilterValueChange(e.target.value)}
            className="w-full py-2 px-3 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
          >
            <option value="all">All Values</option>
            {(() => {
              const field = filterFields.find(
                (f) => f.id === selectedFilterField
              );
              if (!field) return null;

              const uniqueValues = [
                ...new Set(
                  documents
                    .map((doc) => doc[field.name])
                    .filter(
                      (value) =>
                        value !== undefined && value !== null && value !== ''
                    )
                ),
              ].sort();

              return uniqueValues.map((value) => {
                const count = documents.filter(
                  (doc) =>
                    String(doc[field.name]).toLowerCase() ===
                    String(value).toLowerCase()
                ).length;
                const valueStr = String(value);
                // Truncate long values to prevent overflow
                const maxLength = 50;
                const displayValue =
                  valueStr.length > maxLength
                    ? `${valueStr.substring(0, maxLength)}...`
                    : valueStr;
                return (
                  <option key={value} value={value} title={valueStr}>
                    {displayValue} ({count})
                  </option>
                );
              });
            })()}
          </select>
        )}
      </div>
    </div>
  );
};
