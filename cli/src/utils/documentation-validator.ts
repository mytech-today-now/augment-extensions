import * as fs from 'fs';
import * as path from 'path';
import { Module, ValidationResult } from './module-system';

/**
 * Required sections in README.md
 */
const REQUIRED_README_SECTIONS = [
  'Overview',
  'Contents',
  'Character Count'
];

/**
 * Validate module README.md has required sections
 */
export function validateReadmeStructure(modulePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const readmePath = path.join(modulePath, 'README.md');

  if (!fs.existsSync(readmePath)) {
    errors.push('README.md file is missing');
    return { valid: false, errors, warnings };
  }

  const content = fs.readFileSync(readmePath, 'utf-8');

  // Check for required sections
  for (const section of REQUIRED_README_SECTIONS) {
    // Look for markdown headers (# Section or ## Section)
    const sectionPattern = new RegExp(`^#{1,3}\\s+${section}`, 'mi');
    if (!sectionPattern.test(content)) {
      errors.push(`README.md missing required section: ${section}`);
    }
  }

  // Check for empty README
  if (content.trim().length < 100) {
    warnings.push('README.md appears to be too short (< 100 characters)');
  }

  // Check for module name in title
  const titlePattern = /^#\s+(.+)/m;
  const titleMatch = content.match(titlePattern);
  if (!titleMatch) {
    warnings.push('README.md missing title (# heading)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate module has comprehensive documentation
 */
export function validateModuleDocumentation(module: Module): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate README.md structure
  const readmeValidation = validateReadmeStructure(module.path);
  errors.push(...readmeValidation.errors);
  warnings.push(...readmeValidation.warnings);

  // Check for rule files
  if (module.rules.length === 0) {
    errors.push('Module has no rule files in rules/ directory');
  }

  // Check for examples (optional but recommended for certain module types)
  if (module.examples.length === 0) {
    if (module.metadata.type === 'examples') {
      errors.push('Examples module must have files in examples/ directory');
    } else if (module.metadata.type === 'coding-standards') {
      warnings.push('Coding standards module should have examples in examples/ directory (recommended)');
    } else {
      warnings.push('Module has no examples in examples/ directory (optional but recommended)');
    }
  }

  // Validate each rule file has content
  const rulesDir = path.join(module.path, 'rules');
  for (const ruleFile of module.rules) {
    const rulePath = path.join(rulesDir, ruleFile);
    const content = fs.readFileSync(rulePath, 'utf-8');

    if (content.trim().length < 100) {
      warnings.push(`Rule file ${ruleFile} appears to be too short (< 100 characters)`);
    }

    // Check for markdown headers
    if (!content.match(/^#{1,3}\s+/m)) {
      warnings.push(`Rule file ${ruleFile} missing markdown headers`);
    }

    // Check for code examples in rule files (recommended)
    if (!content.match(/```/)) {
      warnings.push(`Rule file ${ruleFile} has no code examples (recommended for clarity)`);
    }

    // Check for actionable content (should have lists or steps)
    if (!content.match(/^[-*]\s+/m) && !content.match(/^\d+\.\s+/m)) {
      warnings.push(`Rule file ${ruleFile} lacks actionable content (lists or numbered steps recommended)`);
    }
  }

  // Validate module.json completeness
  if (!module.metadata.displayName) {
    errors.push('module.json missing displayName field');
  }

  if (!module.metadata.description) {
    errors.push('module.json missing description field');
  } else if (module.metadata.description.length < 20) {
    warnings.push('module.json description is too short (< 20 characters)');
  } else if (module.metadata.description.length > 200) {
    warnings.push('module.json description is too long (> 200 characters) - consider shortening');
  }

  if (!module.metadata.tags || module.metadata.tags.length === 0) {
    warnings.push('module.json missing tags field (recommended for discoverability)');
  }

  if (!module.metadata.augment?.characterCount) {
    warnings.push('module.json missing augment.characterCount field (required for catalog)');
  }

  if (!module.metadata.augment?.priority) {
    warnings.push('module.json missing augment.priority field (recommended: high, medium, or low)');
  }

  // Validate README.md has usage examples
  const readmePath = path.join(module.path, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');

    // Check for usage section
    if (!readmeContent.match(/^#{1,3}\s+Usage/mi)) {
      warnings.push('README.md missing Usage section (recommended)');
    }

    // Check for installation/setup section
    if (!readmeContent.match(/^#{1,3}\s+(Installation|Setup)/mi)) {
      warnings.push('README.md missing Installation or Setup section (recommended)');
    }

    // Check for examples in README
    if (!readmeContent.match(/```/)) {
      warnings.push('README.md has no code examples (recommended)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Extract module overview from README.md
 */
export function extractModuleOverview(modulePath: string): string {
  const readmePath = path.join(modulePath, 'README.md');

  if (!fs.existsSync(readmePath)) {
    return '';
  }

  const content = fs.readFileSync(readmePath, 'utf-8');

  // Extract first paragraph after title
  const lines = content.split('\n');
  let overview = '';
  let foundTitle = false;

  for (const line of lines) {
    if (line.match(/^#\s+/)) {
      foundTitle = true;
      continue;
    }

    if (foundTitle && line.trim().length > 0 && !line.match(/^#{1,3}\s+/)) {
      overview += line + ' ';
      
      // Stop at next heading or after a reasonable length
      if (overview.length > 200) {
        break;
      }
    }

    // Stop at next heading
    if (foundTitle && line.match(/^#{1,3}\s+/)) {
      break;
    }
  }

  return overview.trim();
}

/**
 * Extract character count from README.md
 */
export function extractCharacterCountFromReadme(modulePath: string): number | null {
  const readmePath = path.join(modulePath, 'README.md');

  if (!fs.existsSync(readmePath)) {
    return null;
  }

  const content = fs.readFileSync(readmePath, 'utf-8');

  // Look for character count patterns
  const patterns = [
    /Character Count[:\s]+~?(\d{1,3}(?:,\d{3})*)/i,
    /~(\d{1,3}(?:,\d{3})*)\s+characters/i,
    /Total:\s+~?(\d{1,3}(?:,\d{3})*)/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return parseInt(match[1].replace(/,/g, ''), 10);
    }
  }

  return null;
}

