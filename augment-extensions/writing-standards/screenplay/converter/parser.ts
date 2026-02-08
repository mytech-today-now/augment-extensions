/**
 * Fountain Parser with Context-Aware Element Detection
 * Parses preprocessed fountain content into structured elements
 */

import { CharacterListInfo } from './preprocessor';

export type ElementType = 
  | 'scene_heading'
  | 'action'
  | 'character'
  | 'dialogue'
  | 'parenthetical'
  | 'transition'
  | 'centered'
  | 'page_break'
  | 'section'
  | 'synopsis';

export interface FountainElement {
  type: ElementType;
  content: string;
  lineNumber: number;
  metadata?: Record<string, any>;
}

export interface ParserContext {
  previousLine: string | null;
  nextLine: string | null;
  previousElement: FountainElement | null;
  inCharacterList: boolean;
  characterLists: CharacterListInfo[];
}

export interface ParsedFountain {
  elements: FountainElement[];
  metadata: {
    totalLines: number;
    elementCounts: Record<ElementType, number>;
  };
}

/**
 * Parse fountain content into structured elements
 */
export function parseFountain(
  content: string,
  characterLists: CharacterListInfo[] = []
): ParsedFountain {
  const lines = content.split('\n');
  const elements: FountainElement[] = [];
  const elementCounts: Record<ElementType, number> = {} as any;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const context: ParserContext = {
      previousLine: i > 0 ? lines[i - 1] : null,
      nextLine: i < lines.length - 1 ? lines[i + 1] : null,
      previousElement: elements.length > 0 ? elements[elements.length - 1] : null,
      inCharacterList: isInCharacterList(i, characterLists),
      characterLists
    };
    
    const element = classifyLine(line, i, context);
    if (element) {
      elements.push(element);
      elementCounts[element.type] = (elementCounts[element.type] || 0) + 1;
    }
  }
  
  return {
    elements,
    metadata: {
      totalLines: lines.length,
      elementCounts
    }
  };
}

/**
 * Check if line number is within a character list
 */
function isInCharacterList(lineNumber: number, characterLists: CharacterListInfo[]): boolean {
  return characterLists.some(
    list => lineNumber >= list.startLine && lineNumber <= list.endLine
  );
}

/**
 * Classify a line into its element type
 */
function classifyLine(
  line: string,
  lineNumber: number,
  context: ParserContext
): FountainElement | null {
  const trimmed = line.trim();
  
  // Skip empty lines
  if (trimmed === '') {
    return null;
  }
  
  // If in character list, always classify as action
  if (context.inCharacterList) {
    return {
      type: 'action',
      content: trimmed,
      lineNumber,
      metadata: { inCharacterList: true }
    };
  }
  
  // Check for forced elements (with prefix)
  if (trimmed.startsWith('.')) {
    return {
      type: 'scene_heading',
      content: trimmed.substring(1),
      lineNumber,
      metadata: { forced: true }
    };
  }
  
  if (trimmed.startsWith('@')) {
    return {
      type: 'character',
      content: trimmed.substring(1),
      lineNumber,
      metadata: { forced: true }
    };
  }
  
  if (trimmed.startsWith('>') && trimmed.endsWith('<')) {
    return {
      type: 'centered',
      content: trimmed.substring(1, trimmed.length - 1).trim(),
      lineNumber
    };
  }
  
  if (trimmed.startsWith('>')) {
    return {
      type: 'transition',
      content: trimmed.substring(1).trim(),
      lineNumber,
      metadata: { forced: true }
    };
  }
  
  // Check for natural elements
  if (isSceneHeading(trimmed)) {
    return { type: 'scene_heading', content: trimmed, lineNumber };
  }
  
  if (isTransition(trimmed)) {
    return { type: 'transition', content: trimmed, lineNumber };
  }
  
  if (isParenthetical(trimmed)) {
    return { type: 'parenthetical', content: trimmed, lineNumber };
  }
  
  if (isCharacterName(trimmed, context)) {
    return { type: 'character', content: trimmed, lineNumber };
  }
  
  // Check if this is dialogue (follows character name)
  if (context.previousElement?.type === 'character' || 
      context.previousElement?.type === 'parenthetical') {
    return { type: 'dialogue', content: trimmed, lineNumber };
  }
  
  // Default to action
  return { type: 'action', content: trimmed, lineNumber };
}

/**
 * Check if line is a scene heading
 */
function isSceneHeading(line: string): boolean {
  const sceneHeadingPattern = /^(INT|EXT|INT\.\/EXT|INT\/EXT|I\/E)[\.\s]/i;
  return sceneHeadingPattern.test(line);
}

/**
 * Check if line is a transition
 */
function isTransition(line: string): boolean {
  // Must be all caps and end with TO: or OUT.
  if (line !== line.toUpperCase()) {
    return false;
  }

  return line.endsWith('TO:') || line.endsWith('OUT.');
}

/**
 * Check if line is a parenthetical
 */
function isParenthetical(line: string): boolean {
  return line.startsWith('(') && line.endsWith(')');
}

/**
 * Check if line is a character name (context-aware)
 */
function isCharacterName(line: string, context: ParserContext): boolean {
  // Must be all caps
  if (line !== line.toUpperCase()) {
    return false;
  }

  // Reject if it's a bullet list item
  if (line.match(/^[-*]\s+/)) {
    return false;
  }

  // Reject if it ends with a colon (likely a label, not a character)
  if (line.endsWith(':')) {
    return false;
  }

  // Reject if it's a scene heading
  if (isSceneHeading(line)) {
    return false;
  }

  // Reject if it's a transition
  if (isTransition(line)) {
    return false;
  }

  // Check if next line looks like dialogue or parenthetical
  if (context.nextLine) {
    const nextTrimmed = context.nextLine.trim();

    // Next line should be dialogue (not empty, not all caps)
    if (nextTrimmed !== '' && nextTrimmed !== nextTrimmed.toUpperCase()) {
      return true;
    }

    // Or next line is a parenthetical
    if (isParenthetical(nextTrimmed)) {
      return true;
    }
  }

  // If no next line or next line doesn't look like dialogue, not a character name
  return false;
}


