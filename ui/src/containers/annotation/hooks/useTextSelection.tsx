import { useCallback, RefObject } from 'react';
import { TextSpan } from '../types';

export const useTextSelection = (
  textRef: RefObject<HTMLDivElement>,
  onHighlight: (span: Omit<TextSpan, 'id'>) => void,
  existingHighlights?: TextSpan[]
) => {
  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      if (!textRef.current) return;

      // Check if the click was on an existing highlight or its children
      const target = event.target as HTMLElement;

      if (
        target &&
        (target.classList.contains('highlight') || target.closest('.highlight'))
      ) {
        return; // Don't process text selection if clicking on existing highlight
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
        return;

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();

      if (selectedText) {
        // Calculate absolute position within the original text content
        const containerElement = textRef.current;
        const textContent = containerElement.textContent || '';

        // Create a range that encompasses the entire container
        const fullRange = document.createRange();
        fullRange.selectNodeContents(containerElement);

        // Calculate the start position by measuring text before the selection
        const beforeRange = document.createRange();
        beforeRange.setStart(fullRange.startContainer, fullRange.startOffset);
        beforeRange.setEnd(range.startContainer, range.startOffset);
        const textBefore = beforeRange.toString();

        // Calculate the absolute start and end positions
        const absoluteStart = textBefore.length;
        const absoluteEnd = absoluteStart + selectedText.length;

        // Validate that the selected text matches what we expect
        const expectedText = textContent.slice(absoluteStart, absoluteEnd);
        if (expectedText === selectedText) {
          // Check if the selection overlaps with any existing highlights
          if (existingHighlights && existingHighlights.length > 0) {
            const hasOverlap = existingHighlights.some(
              (existing) =>
                (absoluteStart >= existing.start &&
                  absoluteStart < existing.end) ||
                (absoluteEnd > existing.start && absoluteEnd <= existing.end) ||
                (absoluteStart <= existing.start && absoluteEnd >= existing.end)
            );

            if (hasOverlap) {
              // Selection overlaps with existing highlight, don't create a duplicate
              selection.removeAllRanges();
              return;
            }
          }

          try {
            // Calculate positioning data WITHOUT modifying the DOM
            const selectionRect = range.getBoundingClientRect();

            // Get context before and after by using text content directly
            const contextBefore = textContent.slice(
              Math.max(0, absoluteStart - 50),
              absoluteStart
            );
            const contextAfter = textContent.slice(
              absoluteEnd,
              Math.min(textContent.length, absoluteEnd + 50)
            );

            // Find nearest parent with ID by traversing from the range's common ancestor
            let nearestParentId: string | undefined;
            let currentNode: Node | null = range.commonAncestorContainer;

            // If it's a text node, get its parent element
            if (currentNode.nodeType === Node.TEXT_NODE) {
              currentNode = currentNode.parentElement;
            }

            // Traverse up to find an element with an ID
            while (
              currentNode &&
              currentNode !== document.body &&
              currentNode !== containerElement
            ) {
              if ((currentNode as Element).id) {
                nearestParentId = (currentNode as Element).id;
                break;
              }
              currentNode = (currentNode as Element).parentElement;
            }

            // Create highlight data
            const span: Omit<TextSpan, 'id'> = {
              text: selectedText,
              start: absoluteStart,
              end: absoluteEnd,
              // Positioning data calculated without DOM modification
              contextBefore,
              contextAfter,
              boundingRect: {
                top: selectionRect.top,
                left: selectionRect.left,
                width: selectionRect.width,
                height: selectionRect.height,
              },
              parentId: nearestParentId,
              textOffset: absoluteStart, // Character offset is the same as start position
              createdAt: Date.now(),
            };

            onHighlight(span);
          } catch (error) {
            console.warn(
              'Highlight creation failed, falling back to basic highlight:',
              error
            );
            // Fallback to basic highlight without positioning data
            const span: Omit<TextSpan, 'id'> = {
              text: selectedText,
              start: absoluteStart,
              end: absoluteEnd,
              createdAt: Date.now(),
            };
            onHighlight(span);
          }
        } else {
          console.warn('Text selection mismatch - selection may be invalid');
        }
      }

      selection.removeAllRanges();
    },
    [textRef, onHighlight, existingHighlights]
  );

  const renderHighlightedText = useCallback(
    (text: string, spans: TextSpan[]) => {
      if (spans.length === 0) return text;

      const sortedHighlights = [...spans].sort((a, b) => a.start - b.start);

      const result: (string | React.ReactElement)[] = [];
      let lastIndex = 0;

      sortedHighlights.forEach((highlight) => {
        if (highlight.start > lastIndex) {
          result.push(text.slice(lastIndex, highlight.start));
        }

        result.push(
          <mark
            key={highlight.id}
            className="bg-yellow-200 cursor-pointer hover:bg-yellow-300"
          >
            {text.slice(highlight.start, highlight.end)}
          </mark>
        );

        lastIndex = highlight.end;
      });

      if (lastIndex < text.length) {
        result.push(text.slice(lastIndex));
      }

      return result;
    },
    []
  );

  return {
    handleMouseUp,
    renderHighlightedText,
  };
};
