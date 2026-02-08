/**
 * Fountain Preprocessor
 * Cleans fountain files before parsing to remove markdown syntax,
 * normalize whitespace, and detect special structures like character lists.
 */

export interface PreprocessedFountain {
  content: string;
  titlePage: Record<string, string>;
  characterLists: CharacterListInfo[];
  metadata: PreprocessingMetadata;
}

export interface CharacterListInfo {
  startLine: number;
  endLine: number;
  characters: string[];
}

export interface PreprocessingMetadata {
  originalLineCount: number;
  processedLineCount: number;
  markdownRemoved: boolean;
  commentsRemoved: boolean;
  whitespaceNormalized: boolean;
}

/**
 * Preprocess fountain content
 */
export function preprocessFountain(content: string): PreprocessedFountain {
  const lines = content.split('\n');
  const titlePage = extractTitlePage(lines);
  const characterLists: CharacterListInfo[] = [];
  
  // Remove title page from content
  let contentLines = removeTitlePage(lines);
  
  // Detect character lists before removing markdown
  const detectedLists = detectCharacterLists(contentLines);
  characterLists.push(...detectedLists);
  
  // Remove markdown syntax
  contentLines = removeMarkdownSyntax(contentLines);
  
  // Remove fountain comments
  contentLines = removeFountainComments(contentLines);
  
  // Normalize whitespace
  contentLines = normalizeWhitespace(contentLines);
  
  return {
    content: contentLines.join('\n'),
    titlePage,
    characterLists,
    metadata: {
      originalLineCount: lines.length,
      processedLineCount: contentLines.length,
      markdownRemoved: true,
      commentsRemoved: true,
      whitespaceNormalized: true
    }
  };
}

/**
 * Extract title page metadata
 */
function extractTitlePage(lines: string[]): Record<string, string> {
  const titlePage: Record<string, string> = {};
  let inTitlePage = true;
  
  for (const line of lines) {
    if (line.trim() === '') {
      if (Object.keys(titlePage).length > 0) {
        inTitlePage = false;
      }
      continue;
    }
    
    if (!inTitlePage) break;
    
    const match = line.match(/^([A-Za-z\s]+):\s*(.+)$/);
    if (match) {
      const key = match[1].trim().toLowerCase();
      const value = match[2].trim();
      titlePage[key] = value;
    } else {
      break;
    }
  }
  
  return titlePage;
}

/**
 * Remove title page from content
 */
function removeTitlePage(lines: string[]): string[] {
  let firstContentLine = 0;
  let foundTitlePage = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^([A-Za-z\s]+):\s*(.+)$/)) {
      foundTitlePage = true;
    } else if (foundTitlePage && line.trim() === '') {
      continue;
    } else if (foundTitlePage) {
      firstContentLine = i;
      break;
    } else {
      break;
    }
  }
  
  return lines.slice(firstContentLine);
}

/**
 * Detect character lists in content
 */
function detectCharacterLists(lines: string[]): CharacterListInfo[] {
  const lists: CharacterListInfo[] = [];
  let currentList: CharacterListInfo | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for character list header
    if (line.match(/^\*\*CHARACTERS?\s*(PRESENT|IN\s+SCENE)?\*\*:?$/i) || 
        line.match(/^CHARACTERS?\s*(PRESENT|IN\s+SCENE)?:?$/i)) {
      currentList = {
        startLine: i,
        endLine: i,
        characters: []
      };
      continue;
    }
    
    // Check for bullet list items (character entries)
    if (currentList && line.match(/^[-*]\s+(.+)$/)) {
      const match = line.match(/^[-*]\s+(.+)$/);
      if (match) {
        currentList.characters.push(match[1]);
        currentList.endLine = i;
      }
    } else if (currentList && line === '') {
      // Empty line ends the list
      lists.push(currentList);
      currentList = null;
    } else if (currentList) {
      // Non-empty, non-bullet line ends the list
      lists.push(currentList);
      currentList = null;
    }
  }
  
  if (currentList) {
    lists.push(currentList);
  }
  
  return lists;
}

/**
 * Remove markdown syntax from lines
 */
function removeMarkdownSyntax(lines: string[]): string[] {
  return lines.map(line => {
    let processed = line;

    // Remove bold (**text** or __text__)
    processed = processed.replace(/\*\*(.+?)\*\*/g, '$1');
    processed = processed.replace(/__(.+?)__/g, '$1');

    // Remove italic (*text* or _text_)
    processed = processed.replace(/\*(.+?)\*/g, '$1');
    processed = processed.replace(/_(.+?)_/g, '$1');

    // Remove headers (# text)
    processed = processed.replace(/^#+\s+/, '');

    // Remove links [text](url)
    processed = processed.replace(/\[(.+?)\]\(.+?\)/g, '$1');

    // Remove inline code `code`
    processed = processed.replace(/`(.+?)`/g, '$1');

    // Remove horizontal rules
    if (processed.match(/^[-*_]{3,}$/)) {
      processed = '';
    }

    return processed;
  });
}

/**
 * Remove fountain comments (notes and boneyard)
 */
function removeFountainComments(lines: string[]): string[] {
  const result: string[] = [];
  let inBoneyard = false;

  for (const line of lines) {
    // Check for boneyard start/end
    if (line.trim() === '/*') {
      inBoneyard = true;
      continue;
    }
    if (line.trim() === '*/') {
      inBoneyard = false;
      continue;
    }

    // Skip lines in boneyard
    if (inBoneyard) {
      continue;
    }

    // Remove inline notes [[note]]
    let processed = line.replace(/\[\[.+?\]\]/g, '');

    result.push(processed);
  }

  return result;
}

/**
 * Normalize whitespace
 */
function normalizeWhitespace(lines: string[]): string[] {
  const result: string[] = [];
  let consecutiveEmptyLines = 0;

  for (const line of lines) {
    // Trim trailing whitespace
    const trimmed = line.trimEnd();

    // Limit consecutive empty lines to 2
    if (trimmed === '') {
      consecutiveEmptyLines++;
      if (consecutiveEmptyLines <= 2) {
        result.push('');
      }
    } else {
      consecutiveEmptyLines = 0;
      result.push(trimmed);
    }
  }

  // Remove trailing empty lines
  while (result.length > 0 && result[result.length - 1] === '') {
    result.pop();
  }

  return result;
}


