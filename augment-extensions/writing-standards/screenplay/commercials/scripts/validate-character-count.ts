#!/usr/bin/env node
/**
 * Validate Character Count for Commercials Module
 * Version: 3.0.0
 * Last Updated: 2026-03-03
 * 
 * Validates that each individual content file is between 3,000 and 45,000 characters
 * 
 * Usage:
 *   npx tsx validate-character-count.ts [--verbose] [--json]
 *   npm run validate:commercials [-- --verbose] [-- --json]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';

// Configuration
const FILE_MIN = 3000;
const FILE_MAX = 45000;

const EXCLUDED_FILES = [
  'module.json',
  'README.md',
  'CONFIGURATION.md',
  'REFERENCES.md',
  'CHARACTER-COUNT-TRACKING.md',
  'VALIDATION-REPORT.md'
];

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  white: '\x1b[37m',
  yellow: '\x1b[33m'
};

interface FileInfo {
  file: string;
  path: string;
  characters: number;
  status: string;
  statusColor: keyof typeof colors;
  isExcluded: boolean;
  directory: string;
}

interface ValidationResult {
  totalCharacters: number;
  fileMin: number;
  fileMax: number;
  status: 'PASS' | 'FAIL';
  message: string;
  passedFiles: number;
  failedFiles: number;
  files: FileInfo[];
}

// Parse command line arguments
const args = process.argv.slice(2);
const verbose = args.includes('--verbose') || args.includes('-v');
const jsonOutput = args.includes('--json') || args.includes('-j');

// Get module root (parent of scripts directory)
const moduleRoot = path.resolve(__dirname, '..');

/**
 * Find all markdown files recursively
 */
function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  function traverse(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Validate character counts
 */
function validateCharacterCounts(): ValidationResult {
  const markdownFiles = findMarkdownFiles(moduleRoot);
  const fileBreakdown: FileInfo[] = [];
  let totalChars = 0;
  let passedCount = 0;
  let failedCount = 0;
  
  for (const filePath of markdownFiles) {
    const fileName = path.basename(filePath);
    const relativePath = path.relative(moduleRoot, filePath);
    const directory = path.basename(path.dirname(filePath));
    const isExcluded = EXCLUDED_FILES.includes(fileName);
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const charCount = content.length;
    totalChars += charCount;
    
    let status: string;
    let statusColor: keyof typeof colors;
    
    if (isExcluded) {
      status = 'EXCLUDED';
      statusColor = 'gray';
    } else if (charCount >= FILE_MIN && charCount <= FILE_MAX) {
      status = 'PASS';
      statusColor = 'green';
      passedCount++;
    } else if (charCount < FILE_MIN) {
      const deficit = FILE_MIN - charCount;
      status = `FAIL (too short by ${deficit} chars)`;
      statusColor = 'red';
      failedCount++;
    } else {
      const excess = charCount - FILE_MAX;
      status = `FAIL (too long by ${excess} chars)`;
      statusColor = 'red';
      failedCount++;
    }
    
    fileBreakdown.push({
      file: fileName,
      path: relativePath,
      characters: charCount,
      status,
      statusColor,
      isExcluded,
      directory
    });
  }
  
  const overallStatus: 'PASS' | 'FAIL' = failedCount === 0 ? 'PASS' : 'FAIL';
  const message = failedCount === 0
    ? 'All content files within 3,000 - 45,000 character range'
    : `${failedCount} file(s) outside target range`;
  
  return {
    totalCharacters: totalChars,
    fileMin: FILE_MIN,
    fileMax: FILE_MAX,
    status: overallStatus,
    message,
    passedFiles: passedCount,
    failedFiles: failedCount,
    files: fileBreakdown
  };
}

/**
 * Print colored text to console
 */
function printColor(text: string, color: keyof typeof colors) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

/**
 * Print validation results to console
 */
function printResults(result: ValidationResult) {
  console.log('');
  printColor('=== Commercial Writing Standards - Per-File Character Count Validation ===', 'cyan');
  printColor(`Per-File Target Range: ${FILE_MIN} - ${FILE_MAX} characters`, 'gray');
  printColor(`Total Module Characters: ${result.totalCharacters}`, 'white');
  console.log('');

  const symbol = result.status === 'PASS' ? '✓' : '✗';
  printColor(`${symbol} ${result.status} : ${result.message}`, result.status === 'PASS' ? 'green' : 'red');

  // Show failed files prominently
  const failedFiles = result.files.filter(f => f.status.startsWith('FAIL'));
  if (failedFiles.length > 0) {
    console.log('');
    printColor('=== Failed Files ===', 'red');
    for (const file of failedFiles) {
      printColor(`  ✗ ${file.file}: ${file.characters} chars - ${file.status}`, 'red');
    }
  }

  // Verbose output
  if (verbose) {
    console.log('');
    printColor('=== All Files ===', 'cyan');

    const sortedFiles = [...result.files].sort((a, b) => {
      if (a.isExcluded !== b.isExcluded) return a.isExcluded ? 1 : -1;
      return b.characters - a.characters;
    });

    for (const file of sortedFiles) {
      const symbol = file.status === 'PASS' ? '✓' : file.status === 'EXCLUDED' ? '○' : '✗';
      printColor(`  ${symbol} ${file.file}: ${file.characters} chars - ${file.status}`, file.statusColor);
    }

    // Category totals
    console.log('');
    printColor('=== Category Totals ===', 'cyan');

    const categories = {
      'Foundational Rules': result.files.filter(f => /^commercial(s|-(formats|types))\.md$/.test(f.file)),
      'Technique Rules': result.files.filter(f => /^commercial-(techniques|persuasion|audience|scripts|tips)\.md$/.test(f.file)),
      'Legal/Ethical Rules': result.files.filter(f => /^commercial-(laws|ethics)\.md$/.test(f.file)),
      'Supporting Rules': result.files.filter(f => /^commercial-(counter-principles-examples|templates|mistakes|history|glossary)\.md$/.test(f.file)),
      'Example Files': result.files.filter(f => /^(effective|ineffective)-commercials\.md$/.test(f.file)),
      'Infrastructure': result.files.filter(f => f.isExcluded)
    };

    for (const [category, files] of Object.entries(categories)) {
      if (files.length > 0) {
        const total = files.reduce((sum, f) => sum + f.characters, 0);
        const passCount = files.filter(f => f.status === 'PASS' || f.status === 'EXCLUDED').length;
        printColor(`${category} : ${total} chars - ${files.length} files (${passCount} passing)`, 'white');
      } else {
        printColor(`${category} : 0 chars - 0 files`, 'gray');
      }
    }

    // Summary
    console.log('');
    printColor('=== Summary ===', 'cyan');
    printColor(`Content Files: ${result.files.length - EXCLUDED_FILES.length}`, 'white');
    printColor(`Passed: ${result.passedFiles}`, 'green');
    printColor(`Failed: ${result.failedFiles}`, result.failedFiles === 0 ? 'green' : 'red');
    printColor(`Excluded: ${EXCLUDED_FILES.length}`, 'gray');
  }

  console.log('');
}

/**
 * Main execution
 */
function main() {
  const result = validateCharacterCounts();

  if (jsonOutput) {
    // JSON output
    const output = {
      totalCharacters: result.totalCharacters,
      fileMin: result.fileMin,
      fileMax: result.fileMax,
      status: result.status,
      message: result.message,
      passedFiles: result.passedFiles,
      failedFiles: result.failedFiles,
      files: result.files.map(f => ({
        file: f.file,
        path: f.path,
        characters: f.characters,
        status: f.status,
        isExcluded: f.isExcluded
      }))
    };

    console.log(JSON.stringify(output, null, 2));
  } else {
    // Console output
    printResults(result);
  }

  // Exit with appropriate code
  process.exit(result.status === 'PASS' ? 0 : 1);
}

// Run if executed directly
if (require.main === module) {
  main();
}

