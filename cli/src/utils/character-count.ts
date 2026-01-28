import * as fs from 'fs';
import * as path from 'path';

/**
 * Character count result interface
 */
export interface CharacterCountResult {
  totalCharacters: number;
  fileCount: number;
  files: { path: string; characters: number }[];
}

/**
 * Character count limits
 */
export const CHARACTER_LIMITS = {
  AUGMENT_MIN: 48599,
  AUGMENT_MAX: 49299,
  AUGMENT_TARGET: 49000,
  MODULE_SMALL: 10000,
  MODULE_MEDIUM: 25000,
  MODULE_LARGE: 50000,
};

/**
 * Calculate character count for a directory
 */
export function calculateCharacterCount(dirPath: string, options: {
  includeHidden?: boolean;
  extensions?: string[];
} = {}): CharacterCountResult {
  const { includeHidden = false, extensions } = options;
  
  let totalCharacters = 0;
  let fileCount = 0;
  const files: { path: string; characters: number }[] = [];

  function countFilesRecursively(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      // Skip hidden files/directories unless includeHidden is true
      if (!includeHidden && entry.name.startsWith('.')) {
        continue;
      }

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        countFilesRecursively(fullPath);
      } else if (entry.isFile()) {
        // Filter by extension if specified
        if (extensions && extensions.length > 0) {
          const ext = path.extname(entry.name);
          if (!extensions.includes(ext)) {
            continue;
          }
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        const charCount = content.length;
        
        totalCharacters += charCount;
        fileCount++;
        
        files.push({
          path: path.relative(dirPath, fullPath),
          characters: charCount
        });
      }
    }
  }

  if (fs.existsSync(dirPath)) {
    countFilesRecursively(dirPath);
  }

  return {
    totalCharacters,
    fileCount,
    files: files.sort((a, b) => b.characters - a.characters) // Sort by size descending
  };
}

/**
 * Calculate character count for .augment/ directory
 */
export function calculateAugmentCharacterCount(augmentDir: string = '.augment'): CharacterCountResult {
  return calculateCharacterCount(augmentDir, {
    includeHidden: false,
    extensions: ['.md', '.json']
  });
}

/**
 * Validate .augment/ directory character count
 */
export function validateAugmentCharacterCount(augmentDir: string = '.augment'): {
  valid: boolean;
  count: number;
  min: number;
  max: number;
  message: string;
} {
  const result = calculateAugmentCharacterCount(augmentDir);
  const { totalCharacters } = result;
  const { AUGMENT_MIN, AUGMENT_MAX } = CHARACTER_LIMITS;

  const valid = totalCharacters >= AUGMENT_MIN && totalCharacters <= AUGMENT_MAX;
  
  let message = '';
  if (totalCharacters < AUGMENT_MIN) {
    message = `Character count (${totalCharacters}) is below minimum (${AUGMENT_MIN}). Consider adding more content.`;
  } else if (totalCharacters > AUGMENT_MAX) {
    message = `Character count (${totalCharacters}) exceeds maximum (${AUGMENT_MAX}). Move content to extension modules.`;
  } else {
    message = `Character count (${totalCharacters}) is within target range (${AUGMENT_MIN}-${AUGMENT_MAX}).`;
  }

  return {
    valid,
    count: totalCharacters,
    min: AUGMENT_MIN,
    max: AUGMENT_MAX,
    message
  };
}

/**
 * Get module size category
 */
export function getModuleSizeCategory(characterCount: number): 'small' | 'medium' | 'large' | 'too-large' {
  if (characterCount < CHARACTER_LIMITS.MODULE_SMALL) {
    return 'small';
  } else if (characterCount < CHARACTER_LIMITS.MODULE_MEDIUM) {
    return 'medium';
  } else if (characterCount < CHARACTER_LIMITS.MODULE_LARGE) {
    return 'large';
  } else {
    return 'too-large';
  }
}

/**
 * Format character count for display
 */
export function formatCharacterCount(count: number): string {
  if (count < 1000) {
    return `${count}`;
  } else if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K`;
  } else {
    return `${(count / 1000000).toFixed(1)}M`;
  }
}

/**
 * Generate character count report
 */
export function generateCharacterCountReport(dirPath: string, title: string = 'Character Count Report'): string {
  const result = calculateCharacterCount(dirPath);
  const sizeCategory = getModuleSizeCategory(result.totalCharacters);
  
  let report = `# ${title}\n\n`;
  report += `**Total Characters**: ${result.totalCharacters.toLocaleString()} (${formatCharacterCount(result.totalCharacters)})\n`;
  report += `**File Count**: ${result.fileCount}\n`;
  report += `**Size Category**: ${sizeCategory}\n\n`;
  
  if (result.files.length > 0) {
    report += `## Files by Size\n\n`;
    report += `| File | Characters | % of Total |\n`;
    report += `|------|------------|------------|\n`;
    
    for (const file of result.files) {
      const percentage = ((file.characters / result.totalCharacters) * 100).toFixed(1);
      report += `| ${file.path} | ${file.characters.toLocaleString()} | ${percentage}% |\n`;
    }
  }
  
  return report;
}

