import { TextSpan } from '../types';

// Generate XPath for element
export function generateXPath(element: Element): string {
  if (element.id) return `//*[@id='${element.id}']`;

  const path: string[] = [];
  let currentElement: Element | null = element;

  while (currentElement && currentElement.nodeType === Node.ELEMENT_NODE) {
    let selector = currentElement.nodeName.toLowerCase();
    if (currentElement.id) {
      selector += `[@id='${currentElement.id}']`;
      path.unshift(selector);
      break;
    } else {
      let sibling = currentElement.previousElementSibling;
      let nth = 1;
      while (sibling) {
        if (
          sibling.nodeName.toLowerCase() ===
          currentElement.nodeName.toLowerCase()
        ) {
          nth++;
        }
        sibling = sibling.previousElementSibling;
      }
      selector += `[${nth}]`;
    }
    path.unshift(selector);
    currentElement = currentElement.parentElement;
  }
  return path.length ? `/${path.join('/')}` : '';
}

// Get element by XPath
export function getElementByXPath(xpath: string): Element | null {
  try {
    const result = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    );
    return result.singleNodeValue as Element;
  } catch (error) {
    // XPath evaluation failed, return null
    return null;
  }
}

// Get character offset from document start
export function getTextOffset(
  element: Element,
  containerElement: Element = document.body
): number {
  const walker = document.createTreeWalker(
    containerElement,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Node | null;
  let offset = 0;

  while ((node = walker.nextNode())) {
    if (element.contains(node)) {
      return offset;
    }
    offset += node.textContent?.length || 0;
  }

  return offset;
}

// Get context before element
export function getContextBefore(
  element: Element,
  length: number,
  containerElement: Element = document.body
): string {
  const walker = document.createTreeWalker(
    containerElement,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Node | null;
  let allText = '';
  let targetFound = false;

  while ((node = walker.nextNode())) {
    if (element.contains(node)) {
      targetFound = true;
      break;
    }
    allText += node.textContent || '';
  }

  if (targetFound) {
    return allText.slice(-length);
  }

  return '';
}

// Get context after element
export function getContextAfter(
  element: Element,
  length: number,
  containerElement: Element = document.body
): string {
  const walker = document.createTreeWalker(
    containerElement,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Node | null;
  let foundTarget = false;
  let contextText = '';

  while ((node = walker.nextNode())) {
    if (foundTarget) {
      contextText += node.textContent || '';
      if (contextText.length >= length) {
        return contextText.slice(0, length);
      }
    } else if (element.contains(node)) {
      foundTarget = true;
    }
  }

  return contextText;
}

// Find nearest parent with ID
export function findNearestParentWithId(element: Element): string | undefined {
  let currentElement: Element | null = element;
  while (currentElement && currentElement !== document.body) {
    if (currentElement.id) {
      return currentElement.id;
    }
    currentElement = currentElement.parentElement;
  }
  return undefined;
}

// Contextual search for moved content
export function findByContextualSearch(
  highlightData: TextSpan,
  containerElement: Element = document.body
): Element | null {
  if (!highlightData.contextBefore || !highlightData.contextAfter) {
    return null;
  }

  const fullContext =
    highlightData.contextBefore +
    highlightData.text +
    highlightData.contextAfter;
  const walker = document.createTreeWalker(
    containerElement,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Node | null;
  let documentText = '';
  const nodeMap: Array<{ node: Node; start: number; end: number }> = [];

  while ((node = walker.nextNode())) {
    nodeMap.push({
      node,
      start: documentText.length,
      end: documentText.length + (node.textContent?.length || 0),
    });
    documentText += node.textContent || '';
  }

  const contextIndex = documentText.indexOf(fullContext);
  if (contextIndex !== -1) {
    const targetStart = contextIndex + highlightData.contextBefore.length;

    // Find which text node contains our target
    for (const mapping of nodeMap) {
      if (mapping.start <= targetStart && mapping.end > targetStart) {
        return mapping.node.parentElement;
      }
    }
  }

  return null;
}

// Fallback to approximate positioning
export function findByApproximatePosition(
  highlightData: TextSpan,
  containerElement: Element = document.body
): Element | null {
  // Try to find by parent ID first
  if (highlightData.parentId) {
    const parent = document.getElementById(highlightData.parentId);
    if (parent) {
      // Search within parent for text match
      const elements = parent.querySelectorAll('*');
      for (const element of elements) {
        if (element.textContent?.includes(highlightData.text)) {
          return element;
        }
      }
    }
  }

  // Try to find by text offset
  if (highlightData.textOffset !== undefined) {
    // Validate that containerElement is a valid Node
    if (!containerElement || !(containerElement instanceof Node)) {
      // Invalid container element for TreeWalker
      return null;
    }

    const walker = document.createTreeWalker(
      containerElement,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Node | null;
    let currentOffset = 0;

    while ((node = walker.nextNode())) {
      if (currentOffset >= highlightData.textOffset) {
        return node.parentElement;
      }
      currentOffset += node.textContent?.length || 0;
    }
  }

  return null;
}

// Main scroll-to-highlight function with multiple fallback strategies
export function scrollToHighlight(
  highlightData: TextSpan,
  containerElement?: Element
): boolean {
  let targetElement: Element | null = null;

  // Strategy 1: Search for highlight spans by class and text content (most reliable)
  const highlightSpans = document.querySelectorAll('span.highlight');
  for (const span of highlightSpans) {
    if (span.textContent?.trim() === highlightData.text?.trim()) {
      targetElement = span as Element;
      break;
    }
  }

  // Strategy 2: Try direct ID lookup (fastest if element has ID)
  if (!targetElement && highlightData.id) {
    targetElement = document.getElementById(highlightData.id);
  }

  // Strategy 3: Try XPath resolution (if available)
  if (!targetElement && highlightData.domPath) {
    targetElement = getElementByXPath(highlightData.domPath);
  }

  // Strategy 4: Context-based search for moved content
  if (!targetElement && containerElement) {
    targetElement = findByContextualSearch(highlightData, containerElement);
  }

  // Strategy 5: Simple text search within container
  if (!targetElement && containerElement) {
    targetElement = findBySimpleTextSearch(highlightData, containerElement);
  }

  // Strategy 6: Fallback to approximate positioning
  if (!targetElement && containerElement) {
    targetElement = findByApproximatePosition(highlightData, containerElement);
  }

  if (targetElement) {
    scrollToElement(targetElement);
    flashHighlight(targetElement);
    return true;
  }
  // Could not locate highlight
  return false;
}

// Simple text search as fallback
export function findBySimpleTextSearch(
  highlightData: TextSpan,
  containerElement: Element
): Element | null {
  // Validate that containerElement is a valid Node
  if (!containerElement || !(containerElement instanceof Node)) {
    // Invalid container element for TreeWalker
    return null;
  }

  // First try to find highlight spans within the container
  const highlightSpans = containerElement.querySelectorAll('span.highlight');
  for (const span of highlightSpans) {
    if (span.textContent?.trim() === highlightData.text?.trim()) {
      return span as Element;
    }
  }

  // Fallback: Find all elements that contain the highlight text
  const walker = document.createTreeWalker(
    containerElement,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node: Node) => {
        const element = node as Element;
        // Look for elements that contain our highlight text and have the right class or are rendered highlights
        if (
          element.textContent?.includes(highlightData.text) &&
          (element.tagName === 'MARK' ||
            element.classList.contains('highlight'))
        ) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      },
    }
  );

  let node: Node | null;
  while ((node = walker.nextNode())) {
    const element = node as Element;
    // Check if this element contains exactly our highlight text
    if (element.textContent?.trim() === highlightData.text?.trim()) {
      return element;
    }
  }

  return null;
}

// Smooth scroll with visibility check
export function scrollToElement(element: Element): void {
  // First scroll to general area
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest',
  });

  // Use Intersection Observer to ensure it's visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        // Fine-tune position if needed
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        if (
          rect.top < viewportHeight * 0.2 ||
          rect.bottom > viewportHeight * 0.8
        ) {
          element.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }
    });
  });

  observer.observe(element);
}

// Visual feedback
export function flashHighlight(element: Element): void {
  const originalTransition = (element as HTMLElement).style.transition;
  const originalBackground = (element as HTMLElement).style.backgroundColor;

  (element as HTMLElement).style.transition = 'background-color 0.3s ease';
  (element as HTMLElement).style.backgroundColor = '#ffeb3b';

  setTimeout(() => {
    (element as HTMLElement).style.backgroundColor = originalBackground;
    (element as HTMLElement).style.transition = originalTransition;
  }, 1000);
}

// Highlight creation with positioning data
export function createHighlightWithPositioning(
  selection: Selection,
  containerElement: Element = document.body
): Omit<TextSpan, 'id'> {
  const range = selection.getRangeAt(0);
  const highlightElement = document.createElement('span');

  // Apply basic highlight styling and wrap selection
  highlightElement.className = 'highlight';
  range.surroundContents(highlightElement);

  // Generate comprehensive positioning data
  const highlightData: Omit<TextSpan, 'id'> = {
    text: highlightElement.textContent || '',
    start: 0, // Will be calculated by the calling component
    end: 0, // Will be calculated by the calling component
    domPath: generateXPath(highlightElement),
    textOffset: getTextOffset(highlightElement, containerElement),
    contextBefore: getContextBefore(highlightElement, 50, containerElement),
    contextAfter: getContextAfter(highlightElement, 50, containerElement),
    boundingRect: highlightElement.getBoundingClientRect(),
    parentId: findNearestParentWithId(highlightElement),
    createdAt: Date.now(),
  };

  // Remove the wrapper element (we just needed it for calculations)
  const parent = highlightElement.parentNode;
  if (parent) {
    parent.replaceChild(range.extractContents(), highlightElement);
  }

  return highlightData;
}

// Scroll to highlight with retry mechanism
export function scrollToHighlightWithRetry(
  highlightData: TextSpan,
  containerElement?: Element,
  maxRetries: number = 3
): void {
  let attempts = 0;

  function attempt() {
    const success = scrollToHighlight(highlightData, containerElement);

    if (!success && attempts < maxRetries) {
      attempts++;
      // Wait for DOM to stabilize, then retry
      setTimeout(attempt, 100);
    } else if (!success) {
      // Failed to locate highlight after multiple attempts
      // Could show user notification here
    }
  }

  attempt();
}
