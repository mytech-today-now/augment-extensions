import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import {
  findModule,
  findModuleEnhanced,
  getModuleSuggestions,
  discoverModules,
  extractModuleMetadata,
  Module
} from '../utils/module-system';

interface ShowOptions {
  json?: boolean;
}

interface ShowModuleOptions {
  json?: boolean;
  content?: boolean;
  format?: 'json' | 'markdown' | 'text';
  depth?: number;
  filter?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Legacy show command - displays basic module information
 * @deprecated Use showModuleCommand for enhanced inspection
 */
export async function showCommand(moduleName: string, options: ShowOptions): Promise<void> {
  try {
    const module = findModule(moduleName);

    if (!module) {
      console.error(chalk.red(`Module not found: ${moduleName}`));

      // Suggest similar modules
      const suggestions = await getSimilarModules(moduleName);
      if (suggestions.length > 0) {
        console.log(chalk.yellow('\nDid you mean one of these?'));
        suggestions.forEach(suggestion => {
          console.log(chalk.cyan(`  • ${suggestion}`));
        });
      }

      console.log(chalk.gray('\nUse "augx list" to see all available modules.'));
      process.exit(1);
    }

    if (options.json) {
      const moduleInfo = {
        name: module.fullName,
        version: module.metadata.version,
        type: module.metadata.type,
        description: module.metadata.description,
        rules: module.rules,
        examples: module.examples,
        characterCount: module.metadata.augment?.characterCount
      };
      console.log(JSON.stringify(moduleInfo, null, 2));
      return;
    }

    console.log(chalk.bold.blue(`\n📦 ${module.fullName}\n`));
    console.log(chalk.gray(`Version: ${module.metadata.version}`));
    console.log(chalk.gray(`Type: ${module.metadata.type}`));
    console.log(chalk.gray(`Description: ${module.metadata.description}\n`));

    if (module.rules && module.rules.length > 0) {
      console.log(chalk.bold('Rules:'));
      module.rules.forEach((rule: string) => {
        console.log(chalk.cyan(`  • ${rule}`));
      });
      console.log();
    }

    if (module.examples && module.examples.length > 0) {
      console.log(chalk.bold('Examples:'));
      module.examples.forEach((example: string) => {
        console.log(chalk.green(`  • ${example}`));
      });
      console.log();
    }

    const charCount = module.metadata.augment?.characterCount;
    console.log(chalk.gray(`Character count: ~${charCount ? charCount.toLocaleString() : 'unknown'}`));
    console.log();

  } catch (error) {
    console.error(chalk.red('Error showing module:'), error);
    process.exit(1);
  }
}

/**
 * Enhanced module inspection command with advanced features
 * Supports module overview, content viewing, and file inspection
 */
export async function showModuleCommand(
  moduleName: string,
  filePath: string | undefined,
  options: ShowModuleOptions
): Promise<void> {
  try {
    // Validate module name
    if (!moduleName || moduleName.trim() === '') {
      console.error(chalk.red('Error: Module name is required'));
      console.log(chalk.gray('\nUsage: augx show module <module-name> [file-path] [options]'));
      console.log(chalk.gray('Example: augx show module php-standards'));
      console.log(chalk.gray('         augx show module php-standards rules/psr-standards.md'));
      process.exit(1);
    }

    // Discover and validate module using enhanced discovery
    const module = findModuleEnhanced(moduleName);

    if (!module) {
      console.error(chalk.red(`Module not found: ${moduleName}`));

      // Suggest similar modules using enhanced suggestions
      const suggestions = getModuleSuggestions(moduleName, 5);
      if (suggestions.length > 0) {
        console.log(chalk.yellow('\nDid you mean one of these?'));
        suggestions.forEach(suggestion => {
          console.log(chalk.cyan(`  • ${suggestion.fullName}`));
        });
      }

      console.log(chalk.gray('\nUse "augx list" to see all available modules.'));
      process.exit(1);
    }

    // Route to appropriate handler based on options and arguments
    if (filePath) {
      // Individual file inspection
      await showModuleFile(module, filePath, options);
    } else if (options.content) {
      // Aggregated content view
      await showModuleContent(module, options);
    } else {
      // Module overview (default)
      await showModuleOverview(module, options);
    }

  } catch (error) {
    console.error(chalk.red('Error inspecting module:'), error);
    if (error instanceof Error) {
      console.error(chalk.gray(error.message));
    }
    process.exit(1);
  }
}

/**
 * Display module overview with metadata and file listing
 */
async function showModuleOverview(module: Module, options: ShowModuleOptions): Promise<void> {
  // Extract comprehensive metadata
  const extendedMetadata = extractModuleMetadata(module.path);

  if (!extendedMetadata) {
    console.error(chalk.red('Failed to extract module metadata'));
    return;
  }

  // Handle JSON output format
  if (options.json || options.format === 'json') {
    const jsonOutput = {
      name: module.fullName,
      version: extendedMetadata.version,
      type: extendedMetadata.type,
      description: extendedMetadata.description,
      displayName: extendedMetadata.displayName,
      tags: extendedMetadata.tags,
      path: module.path,
      files: {
        total: extendedMetadata.files?.total || 0,
        rules: extendedMetadata.files?.rules || 0,
        examples: extendedMetadata.files?.examples || 0,
        other: extendedMetadata.files?.other || 0
      },
      size: {
        totalBytes: extendedMetadata.size?.totalBytes || 0,
        totalCharacters: extendedMetadata.size?.totalCharacters || 0
      },
      lastModified: extendedMetadata.lastModified,
      augment: extendedMetadata.augment
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
    return;
  }

  // Text output format (default)
  console.log();
  console.log(chalk.bold.blue(`📦 ${module.fullName}`));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  // Basic metadata
  console.log(chalk.bold('Metadata:'));
  console.log(chalk.gray(`  Name:        ${extendedMetadata.displayName}`));
  console.log(chalk.gray(`  Version:     ${extendedMetadata.version}`));
  console.log(chalk.gray(`  Type:        ${extendedMetadata.type}`));
  console.log(chalk.gray(`  Description: ${extendedMetadata.description}`));

  if (extendedMetadata.tags && extendedMetadata.tags.length > 0) {
    console.log(chalk.gray(`  Tags:        ${extendedMetadata.tags.join(', ')}`));
  }
  console.log();

  // File statistics
  console.log(chalk.bold('Files:'));
  console.log(chalk.gray(`  Total:       ${extendedMetadata.files?.total || 0}`));
  console.log(chalk.cyan(`  Rules:       ${extendedMetadata.files?.rules || 0}`));
  console.log(chalk.green(`  Examples:    ${extendedMetadata.files?.examples || 0}`));
  console.log(chalk.gray(`  Other:       ${extendedMetadata.files?.other || 0}`));
  console.log();

  // Size statistics
  console.log(chalk.bold('Size:'));
  const totalBytes = extendedMetadata.size?.totalBytes || 0;
  const totalChars = extendedMetadata.size?.totalCharacters || 0;
  console.log(chalk.gray(`  Total:       ${formatBytes(totalBytes)} (${totalBytes.toLocaleString()} bytes)`));
  console.log(chalk.gray(`  Characters:  ${totalChars.toLocaleString()}`));
  console.log();

  // Last modified
  if (extendedMetadata.lastModified) {
    console.log(chalk.bold('Last Modified:'));
    console.log(chalk.gray(`  ${formatDate(extendedMetadata.lastModified)}`));
    console.log();
  }

  // Augment configuration
  if (extendedMetadata.augment) {
    console.log(chalk.bold('Augment Configuration:'));
    if (extendedMetadata.augment.priority) {
      console.log(chalk.gray(`  Priority:    ${extendedMetadata.augment.priority}`));
    }
    if (extendedMetadata.augment.category) {
      console.log(chalk.gray(`  Category:    ${extendedMetadata.augment.category}`));
    }
    if (extendedMetadata.augment.characterCount !== undefined) {
      console.log(chalk.gray(`  Char Count:  ${extendedMetadata.augment.characterCount.toLocaleString()}`));
    }
    console.log();
  }

  // Path information
  console.log(chalk.bold('Location:'));
  console.log(chalk.gray(`  ${module.path}`));
  console.log();

  // Helpful commands
  console.log(chalk.bold('Commands:'));
  console.log(chalk.gray(`  View content:     augx show module ${module.fullName} --content`));
  console.log(chalk.gray(`  List files:       augx show module ${module.fullName} --filter "*.md"`));
  console.log(chalk.gray(`  Search content:   augx show module ${module.fullName} --search "keyword"`));
  console.log();
}

/**
 * Format bytes to human-readable format
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Format date to human-readable format
 */
function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString()}`;
  } else if (diffDays === 1) {
    return `Yesterday at ${date.toLocaleTimeString()}`;
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Display aggregated content from all module files
 */
async function showModuleContent(module: Module, options: ShowModuleOptions): Promise<void> {
  const { listModuleFiles } = await import('../utils/module-system');

  // Get all markdown files from the module
  const files = listModuleFiles(module.path, {
    recursive: true,
    filter: options.filter || '*.md',
    groupByDirectory: true
  });

  if (files.length === 0) {
    console.log(chalk.yellow('No markdown files found in module'));
    return;
  }

  // Apply search filter if provided
  let searchResults: Array<{file: any, matches: Array<{line: number, text: string, context: string[]}>}> = [];

  if (options.search) {
    searchResults = performSearch(files, options.search);

    if (searchResults.length === 0) {
      console.log(chalk.yellow(`No matches found for: "${options.search}"`));
      return;
    }
  }

  // Handle search results display
  if (options.search && searchResults.length > 0) {
    displaySearchResults(module, searchResults, options);
    return;
  }

  // Handle JSON output format
  if (options.json || options.format === 'json') {
    const jsonOutput = {
      module: module.fullName,
      fileCount: files.length,
      files: files.map(f => ({
        path: f.relativePath,
        size: f.size,
        modified: f.modified,
        type: f.type
      })),
      content: files.map(f => ({
        file: f.relativePath,
        content: fs.readFileSync(f.path, 'utf-8')
      }))
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
    return;
  }

  // Handle Markdown output format
  if (options.format === 'markdown') {
    console.log(`# ${module.fullName}\n`);
    console.log(`**Module Type:** ${module.metadata.type}\n`);
    console.log(`**Version:** ${module.metadata.version}\n`);
    console.log(`---\n`);

    for (const file of files) {
      console.log(`## ${file.relativePath}\n`);
      const content = fs.readFileSync(file.path, 'utf-8');
      console.log(content);
      console.log('\n---\n');
    }
    return;
  }

  // Text output format (default)
  console.log();
  console.log(chalk.bold.blue(`📄 Aggregated Content: ${module.fullName}`));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  // Apply pagination if requested
  const pageSize = options.pageSize || 10;
  const currentPage = options.page || 1;
  const totalPages = Math.ceil(files.length / pageSize);

  let filesToDisplay = files;
  let paginationInfo = '';

  if (options.page) {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, files.length);
    filesToDisplay = files.slice(startIndex, endIndex);
    paginationInfo = ` (Page ${currentPage} of ${totalPages})`;
  }

  console.log(chalk.bold(`Files: ${files.length}${paginationInfo}`));
  console.log();

  // Display each file with section headers
  for (const file of filesToDisplay) {
    console.log(chalk.bold.cyan(`┌─ ${file.relativePath}`));
    console.log(chalk.gray(`│  Size: ${formatBytes(file.size)} | Modified: ${formatDate(file.modified)}`));
    console.log(chalk.bold.cyan('└' + '─'.repeat(58)));
    console.log();

    const content = fs.readFileSync(file.path, 'utf-8');

    // Preserve markdown formatting
    console.log(content);
    console.log();
    console.log(chalk.gray('─'.repeat(60)));
    console.log();
  }

  // Summary
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  console.log(chalk.bold('Summary:'));
  console.log(chalk.gray(`  Total files:  ${files.length}`));
  console.log(chalk.gray(`  Displayed:    ${filesToDisplay.length}`));
  console.log(chalk.gray(`  Total size:   ${formatBytes(totalSize)}`));

  if (options.page && totalPages > 1) {
    console.log();
    console.log(chalk.bold('Pagination:'));
    console.log(chalk.gray(`  Current page: ${currentPage} of ${totalPages}`));

    if (currentPage < totalPages) {
      console.log(chalk.cyan(`  Next page:    augx show module ${module.fullName} --content --page ${currentPage + 1}`));
    }
    if (currentPage > 1) {
      console.log(chalk.cyan(`  Prev page:    augx show module ${module.fullName} --content --page ${currentPage - 1}`));
    }
  }

  console.log();
}

/**
 * Display individual file content with line numbers and optional syntax highlighting
 */
async function showModuleFile(module: Module, filePath: string, options: ShowModuleOptions): Promise<void> {
  // Resolve file path (support both absolute and relative paths)
  let fullPath: string;

  if (path.isAbsolute(filePath)) {
    fullPath = filePath;
  } else {
    // Try relative to module path
    fullPath = path.join(module.path, filePath);
  }

  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    console.error(chalk.red(`File not found: ${filePath}`));
    console.log(chalk.gray(`\nSearched in: ${fullPath}`));
    console.log(chalk.gray(`Module path: ${module.path}`));
    process.exit(1);
  }

  // Read file content
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');
  const stats = fs.statSync(fullPath);

  // Get relative path for display
  const relativePath = path.relative(module.path, fullPath);

  // Handle JSON output format
  if (options.json || options.format === 'json') {
    const jsonOutput = {
      module: module.fullName,
      file: relativePath,
      path: fullPath,
      size: stats.size,
      modified: stats.mtime,
      lines: lines.length,
      content: content
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
    return;
  }

  // Handle Markdown output format
  if (options.format === 'markdown') {
    console.log(`# ${relativePath}\n`);
    console.log(`**Module:** ${module.fullName}\n`);
    console.log(`**Size:** ${formatBytes(stats.size)} | **Lines:** ${lines.length}\n`);
    console.log('```');
    console.log(content);
    console.log('```');
    return;
  }

  // Text output format (default) with line numbers
  console.log();
  console.log(chalk.bold.blue(`📄 ${relativePath}`));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  console.log(chalk.bold('File Information:'));
  console.log(chalk.gray(`  Module:   ${module.fullName}`));
  console.log(chalk.gray(`  Path:     ${relativePath}`));
  console.log(chalk.gray(`  Size:     ${formatBytes(stats.size)}`));
  console.log(chalk.gray(`  Lines:    ${lines.length}`));
  console.log(chalk.gray(`  Modified: ${formatDate(stats.mtime)}`));
  console.log();

  console.log(chalk.bold('Content:'));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  // Display content with line numbers
  const lineNumberWidth = lines.length.toString().length;
  lines.forEach((line, index) => {
    const lineNumber = (index + 1).toString().padStart(lineNumberWidth, ' ');
    console.log(chalk.gray(`${lineNumber} │ `) + line);
  });

  console.log();
  console.log(chalk.gray('─'.repeat(60)));
  console.log();
}

/**
 * Display search results with highlighting and context
 */
function displaySearchResults(
  module: Module,
  searchResults: Array<{file: any, matches: Array<{line: number, text: string, context: string[]}>}>,
  options: ShowModuleOptions
): void {
  const searchTerm = options.search || '';

  // JSON output
  if (options.json || options.format === 'json') {
    const jsonOutput = {
      module: module.fullName,
      searchTerm: searchTerm,
      totalMatches: searchResults.reduce((sum, r) => sum + r.matches.length, 0),
      results: searchResults.map(r => ({
        file: r.file.relativePath,
        matchCount: r.matches.length,
        matches: r.matches.map(m => ({
          line: m.line,
          text: m.text
        }))
      }))
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
    return;
  }

  // Text output
  console.log();
  console.log(chalk.bold.blue(`🔍 Search Results: "${searchTerm}"`));
  console.log(chalk.gray('─'.repeat(60)));
  console.log();

  const totalMatches = searchResults.reduce((sum, r) => sum + r.matches.length, 0);
  console.log(chalk.bold(`Found ${totalMatches} matches in ${searchResults.length} files`));
  console.log();

  for (const result of searchResults) {
    console.log(chalk.bold.cyan(`📄 ${result.file.relativePath}`));
    console.log(chalk.gray(`   ${result.matches.length} matches`));
    console.log();

    for (const match of result.matches) {
      console.log(chalk.gray(`   Line ${match.line}:`));
      console.log('   ' + highlightSearchTerm(match.text, searchTerm));
      console.log();
    }

    console.log(chalk.gray('─'.repeat(60)));
    console.log();
  }

  console.log(chalk.bold('Summary:'));
  console.log(chalk.gray(`  Total matches: ${totalMatches}`));
  console.log(chalk.gray(`  Files with matches: ${searchResults.length}`));
  console.log();
}

/**
 * Perform search within module files
 */
function performSearch(
  files: any[],
  searchTerm: string
): Array<{file: any, matches: Array<{line: number, text: string, context: string[]}>}> {
  const results: Array<{file: any, matches: Array<{line: number, text: string, context: string[]}>}> = [];
  const searchLower = searchTerm.toLowerCase();

  for (const file of files) {
    const content = fs.readFileSync(file.path, 'utf-8');
    const lines = content.split('\n');
    const matches: Array<{line: number, text: string, context: string[]}> = [];

    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(searchLower)) {
        // Get context lines (2 before, 2 after)
        const contextBefore = lines.slice(Math.max(0, index - 2), index);
        const contextAfter = lines.slice(index + 1, Math.min(lines.length, index + 3));

        matches.push({
          line: index + 1,
          text: line,
          context: [...contextBefore, line, ...contextAfter]
        });
      }
    });

    if (matches.length > 0) {
      results.push({ file, matches });
    }
  }

  return results;
}

/**
 * Highlight search term in text
 */
function highlightSearchTerm(text: string, searchTerm: string): string {
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, chalk.yellow.bold('$1'));
}

/**
 * Get similar modules for legacy showCommand
 * @deprecated Use getModuleSuggestions from module-system instead
 */
async function getSimilarModules(searchTerm: string): Promise<string[]> {
  const suggestions = getModuleSuggestions(searchTerm, 5);
  return suggestions.map(m => m.fullName);
}

