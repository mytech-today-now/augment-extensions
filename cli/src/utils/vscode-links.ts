/**
 * VS Code Terminal Links Utility
 * 
 * Provides utilities for creating clickable file links in VS Code terminal.
 * Supports file paths with line numbers and column numbers.
 */

import * as path from 'path';
import * as fs from 'fs';

export interface LinkOptions {
  line?: number;
  column?: number;
  absolute?: boolean;
  workspaceRoot?: string;
}

/**
 * Format a file path as a clickable VS Code terminal link
 * 
 * VS Code recognizes these formats:
 * - file:///absolute/path/to/file.ts
 * - file:///absolute/path/to/file.ts:10
 * - file:///absolute/path/to/file.ts:10:5
 * - ./relative/path/to/file.ts
 * - ./relative/path/to/file.ts:10
 * - ./relative/path/to/file.ts:10:5
 */
export function formatVSCodeLink(filePath: string, options: LinkOptions = {}): string {
  const { line, column, absolute = false, workspaceRoot } = options;

  let formattedPath: string;

  if (absolute || path.isAbsolute(filePath)) {
    // Use absolute path
    const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
    formattedPath = absPath;
  } else {
    // Use relative path
    if (workspaceRoot && path.isAbsolute(filePath)) {
      formattedPath = path.relative(workspaceRoot, filePath);
    } else {
      formattedPath = filePath;
    }
  }

  // Normalize path separators for consistency
  formattedPath = formattedPath.replace(/\\/g, '/');

  // Add line and column numbers if provided
  if (line !== undefined) {
    formattedPath += `:${line}`;
    if (column !== undefined) {
      formattedPath += `:${column}`;
    }
  }

  return formattedPath;
}

/**
 * Format a file path as a file:// URI for VS Code
 */
export function formatFileUri(filePath: string, options: LinkOptions = {}): string {
  const { line, column } = options;

  // Convert to absolute path
  const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);

  // Convert to file:// URI
  let uri = `file:///${absPath.replace(/\\/g, '/')}`;

  // Add line and column numbers if provided
  if (line !== undefined) {
    uri += `:${line}`;
    if (column !== undefined) {
      uri += `:${column}`;
    }
  }

  return uri;
}

/**
 * Create a clickable link with custom text
 */
export function createClickableLink(filePath: string, displayText?: string, options: LinkOptions = {}): string {
  const link = formatVSCodeLink(filePath, options);
  const text = displayText || path.basename(filePath);

  // VS Code terminal supports ANSI escape codes for links
  // Format: \x1b]8;;{uri}\x1b\\{text}\x1b]8;;\x1b\\
  const uri = formatFileUri(filePath, options);
  return `\x1b]8;;${uri}\x1b\\${text}\x1b]8;;\x1b\\`;
}

/**
 * Format a file path with line number for display
 */
export function formatFilePathWithLine(filePath: string, line?: number, column?: number): string {
  let formatted = filePath;

  if (line !== undefined) {
    formatted += `:${line}`;
    if (column !== undefined) {
      formatted += `:${column}`;
    }
  }

  return formatted;
}

/**
 * Check if running in VS Code terminal
 */
export function isVSCodeTerminal(): boolean {
  return process.env.TERM_PROGRAM === 'vscode' || process.env.VSCODE_PID !== undefined;
}

/**
 * Get workspace root from environment
 */
export function getWorkspaceRoot(): string | undefined {
  // Try to get from environment variables
  if (process.env.VSCODE_WORKSPACE_FOLDER) {
    return process.env.VSCODE_WORKSPACE_FOLDER;
  }

  // Try to find .git directory
  let currentDir = process.cwd();
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.join(currentDir, '.git'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  return undefined;
}

/**
 * Format a file path as a clickable link (auto-detects VS Code)
 */
export function formatClickablePath(filePath: string, options: LinkOptions = {}): string {
  if (isVSCodeTerminal()) {
    return createClickableLink(filePath, undefined, options);
  } else {
    return formatVSCodeLink(filePath, options);
  }
}

