import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FileText, Check, Copy } from 'lucide-react';
import { useTextSelection } from '../../../hooks/useTextSelection';
import { DocumentViewerContentProps } from '../types/DocumentViewer.types';

export const DocumentViewerContent: React.FC<DocumentViewerContentProps> = ({
  document,
  highlights,
  onHighlight,
  onHighlightClick,
  onRemoveHighlight: _onRemoveHighlight,
  focusedHighlightId,
  selectedRelevancyLevel,
  getAnnotationLevelColor,
  flashHighlights,
  projectConfig,
  searchTerm,
  searchMatches,
  currentMatchIndex,
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [copiedHighlightId, setCopiedHighlightId] = useState<string | null>(
    null
  );
  const [hoveredHighlightId, setHoveredHighlightId] = useState<string | null>(
    null
  );
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { handleMouseUp } = useTextSelection(
    textRef as React.RefObject<HTMLDivElement>,
    (span) => {
      // Auto-select first annotation level if none is selected
      const availableLevels = projectConfig?.annotationLevels || [];
      const levelToUse =
        selectedRelevancyLevel ||
        (availableLevels.length > 0 ? availableLevels[0].id : null);

      if (levelToUse) {
        onHighlight({
          ...span,
          annotationLevelId: levelToUse,
        });
      } else {
        console.warn('No annotation level selected and no levels available');
      }
    },
    highlights // Pass existing highlights to prevent duplicates
  );

  // Auto-scroll to current search match
  useEffect(() => {
    if (
      searchMatches &&
      currentMatchIndex !== undefined &&
      currentMatchIndex >= 0
    ) {
      const currentMatch = searchMatches[currentMatchIndex];
      if (currentMatch && textRef.current) {
        // Find the search match element and scroll to it
        const searchElements =
          textRef.current.querySelectorAll('.search-match');
        const targetElement = searchElements[currentMatchIndex] as HTMLElement;
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest',
          });
        }
      }
    }
  }, [currentMatchIndex, searchMatches]);

  // Cleanup timeout on unmount
  useEffect(
    () => () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
    },
    []
  );

  // Memoize the copy handler to prevent recreating it on every render
  const handleCopy = useCallback(
    (highlightId: string, highlightText: string) => {
      navigator.clipboard
        .writeText(highlightText)
        .then(() => {
          setCopiedHighlightId(highlightId);
          setTimeout(() => {
            setCopiedHighlightId(null);
          }, 2000);
        })
        .catch((err) => {
          console.error('Failed to copy text to clipboard:', err);
        });
    },
    []
  );

  if (!document) {
    return (
      <div className="flex-1 bg-background overflow-y-auto">
        <div className="p-6 h-full flex flex-col">
          {/* Spacer to push content to lower part */}
          <div className="flex-1" />

          {/* Content positioned in lower part */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No Document Selected
              </h3>
              <p className="text-sm text-muted-foreground">
                Select a document from the list to start annotating
              </p>
            </div>
          </div>

          {/* Bottom spacer - reduced to move content up */}
          <div className="flex-1/2" />
        </div>
      </div>
    );
  }

  // Render text with highlights and search matches
  const renderTextWithHighlights = () => {
    if (!document?.text) return null;

    const content = document.text;
    const sortedHighlights = [...highlights].sort((a, b) => a.start - b.start);

    // Combine highlights and search matches for rendering
    const allRanges: Array<{
      start: number;
      end: number;
      type: 'highlight' | 'search';
      data?: any;
    }> = [];

    // Add highlights first (they take priority)
    sortedHighlights.forEach((highlight) => {
      allRanges.push({
        start: highlight.start,
        end: highlight.end,
        type: 'highlight',
        data: highlight,
      });
    });

    // Add search matches, but only if they don't overlap with existing highlights
    if (searchMatches && searchMatches.length > 0 && searchTerm) {
      searchMatches.forEach((match, index) => {
        // Check if this search match overlaps with any existing highlight
        const overlapsWithHighlight = sortedHighlights.some(
          (highlight) =>
            (match.start >= highlight.start && match.start < highlight.end) ||
            (match.end > highlight.start && match.end <= highlight.end) ||
            (match.start <= highlight.start && match.end >= highlight.end)
        );

        // Only add search match if it doesn't overlap with a highlight
        if (!overlapsWithHighlight) {
          allRanges.push({
            start: match.start,
            end: match.end,
            type: 'search',
            data: { index, isCurrent: index === currentMatchIndex },
          });
        }
      });
    }

    // Sort all ranges by start position
    allRanges.sort((a, b) => a.start - b.start);

    let lastIndex = 0;
    const elements: React.ReactNode[] = [];

    allRanges.forEach((range, rangeIndex) => {
      // Add text before this range
      if (range.start > lastIndex) {
        elements.push(
          <span key={`text-${lastIndex}-${rangeIndex}`}>
            {content.slice(lastIndex, range.start)}
          </span>
        );
      }

      if (range.type === 'highlight') {
        // Add highlight
        const highlight = range.data;
        const isFocused = focusedHighlightId === highlight.id;
        const isFlashing = flashHighlights && isFocused;
        const color = getAnnotationLevelColor(highlight.annotationLevelId);
        const isCopied = copiedHighlightId === highlight.id;
        const isHovered = hoveredHighlightId === highlight.id;

        elements.push(
          <span
            key={highlight.id}
            className="inline relative group"
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
              setHoveredHighlightId(highlight.id);
            }}
            onMouseLeave={() => {
              hoverTimeoutRef.current = setTimeout(() => {
                setHoveredHighlightId(null);
                hoverTimeoutRef.current = null;
              }, 150);
            }}
          >
            <span
              className={`highlight cursor-pointer rounded transition-all duration-200 ${
                isFlashing ? 'animate-pulse' : ''
              }`}
              style={{
                backgroundColor: `${color}60`,
                borderBottom: `3px solid ${color}`,
                color: isFocused ? color : 'inherit',
                display: 'inline',
                padding: '0',
                margin: '0',
              }}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onHighlightClick?.(highlight.id);
              }}
              title={`${highlight.text} (${highlight.annotationLevelId || 'No level'})`}
            >
              {highlight.text}
            </span>

            {/* Copy button that appears on hover */}
            {isHovered && !isCopied && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleCopy(highlight.id, highlight.text);
                }}
                className="absolute -right-2 top-0 bg-gray-800 text-white rounded p-1 opacity-90 hover:opacity-100 transition-opacity z-10 flex items-center justify-center shadow-sm"
                style={{ transform: 'translateY(-50%)' }}
                title="Copy text"
              >
                <Copy size={10} />
              </button>
            )}

            {/* Success indicator */}
            {isCopied && (
              <span
                className="absolute -right-2 top-0 bg-green-500 text-white rounded p-1 z-10 flex items-center justify-center shadow-sm"
                style={{ transform: 'translateY(-50%)' }}
              >
                <Check size={10} />
              </span>
            )}
          </span>
        );
      } else if (range.type === 'search') {
        // Add search match
        const { isCurrent } = range.data;
        elements.push(
          <span
            key={`search-${range.data.index}`}
            className={`search-match rounded ${
              isCurrent ? 'bg-yellow-300 font-bold' : 'bg-yellow-200'
            }`}
            style={{
              animation: isCurrent ? 'pulse 1s infinite' : 'none',
              display: 'inline',
              padding: '0',
              margin: '0',
            }}
          >
            {content.slice(range.start, range.end)}
          </span>
        );
      }

      lastIndex = Math.max(lastIndex, range.end);
    });

    // Add remaining text
    if (lastIndex < content.length) {
      elements.push(
        <span key={`text-${lastIndex}`}>{content.slice(lastIndex)}</span>
      );
    }

    return elements;
  };

  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <div className="p-2 pt-1.5">
        {/* Document Content */}
        <div className="prose max-w-none">
          <div
            ref={textRef}
            onMouseUp={(e) => handleMouseUp(e.nativeEvent)}
            className="whitespace-pre-wrap text-foreground leading-relaxed select-text cursor-text"
            style={{
              userSelect: 'text',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {renderTextWithHighlights()}
          </div>
        </div>
      </div>
    </div>
  );
};
