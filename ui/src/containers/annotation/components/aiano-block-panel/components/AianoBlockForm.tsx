import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AianoBlockFormProps } from '../types/AianoBlockPanel.types';

export const AianoBlockForm: React.FC<AianoBlockFormProps> = ({
  block,
  value,
  mode,
  onValueChange,
}) => {
  // Local state for immediate UI feedback (no lag)
  const [localValue, setLocalValue] = useState(value || '');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when value prop changes (from external updates)
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Debounced update to parent (only for text inputs)
  const debouncedOnValueChange = useCallback(
    (newValue: any) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // For text inputs, debounce to avoid expensive re-renders
      if (block.type === 'text') {
        debounceTimerRef.current = setTimeout(() => {
          onValueChange(newValue);
        }, 150); // 150ms debounce - feels instant but reduces re-renders
      } else {
        // For checkboxes/radios, update immediately (less frequent)
        onValueChange(newValue);
      }
    },
    [block.type, onValueChange]
  );

  // Cleanup on unmount - flush any pending updates
  useEffect(
    () => () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    },
    []
  ); // Empty deps - only run cleanup on unmount
  const commonProps = {
    placeholder: block.placeholder,
    disabled: mode === 'view',
    className: 'w-full',
  };

  switch (block.type) {
    case 'multiselect':
      return (
        <div className="space-y-0">
          {(block.options || []).map((option) => (
            <label
              key={option}
              className="flex items-center space-x-2 py-0.5 hover:bg-accent rounded transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={Array.isArray(value) ? value.includes(option) : false}
                onChange={(e) => {
                  const currentValues = Array.isArray(value) ? value : [];
                  if (e.target.checked) {
                    onValueChange([...currentValues, option]);
                  } else {
                    onValueChange(
                      currentValues.filter((v: string) => v !== option)
                    );
                  }
                }}
                disabled={mode === 'view'}
                className="w-4 h-4 text-primary bg-background border border-border rounded focus:ring-ring focus:ring-2 focus:ring-offset-0"
              />
              <span className="text-sm text-foreground">{option}</span>
            </label>
          ))}
          {(!block.options || block.options.length === 0) && (
            <div className="text-center py-2 text-muted-foreground italic bg-muted rounded border-2 border-dashed border-border">
              <p className="text-sm">No options configured for this block</p>
            </div>
          )}
        </div>
      );

    case 'boolean': {
      const choiceParts = (block.booleanChoice || 'Yes/No').split('/');
      const option1 = choiceParts[0] || 'Yes';
      const option2 = choiceParts[1] || 'No';

      return (
        <div className="space-y-1">
          <label className="flex items-center space-x-2 p-1 hover:bg-accent rounded transition-colors cursor-pointer">
            <input
              type="radio"
              name={`${block.id}-boolean`}
              checked={value === option1}
              onChange={() => onValueChange(option1)}
              disabled={mode === 'view'}
              className="w-4 h-4 text-primary bg-background border border-border focus:ring-ring focus:ring-2 focus:ring-offset-0"
            />
            <span className="text-sm text-foreground">{option1}</span>
          </label>
          <label className="flex items-center space-x-2 p-1 hover:bg-accent rounded transition-colors cursor-pointer">
            <input
              type="radio"
              name={`${block.id}-boolean`}
              checked={value === option2}
              onChange={() => onValueChange(option2)}
              disabled={mode === 'view'}
              className="w-4 h-4 text-primary bg-background border border-border focus:ring-ring focus:ring-2 focus:ring-offset-0"
            />
            <span className="text-sm text-foreground">{option2}</span>
          </label>
        </div>
      );
    }

    default: // text
      return (
        <div className="space-y-0.5 flex-1">
          <textarea
            {...commonProps}
            value={localValue}
            onChange={(e) => {
              const newValue = e.target.value;
              setLocalValue(newValue); // Update local state immediately (no lag!)
              debouncedOnValueChange(newValue); // Debounced update to parent
            }}
            placeholder={block.placeholder}
            disabled={mode === 'view'}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-ring focus:border-ring transition-colors resize-y min-h-[80px] max-h-[400px] overflow-y-auto text-sm bg-background text-foreground placeholder:text-muted-foreground"
            rows={3}
          />
        </div>
      );
  }
};
