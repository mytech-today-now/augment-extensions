/**
 * VS Code Editor Integration Utility
 * 
 * Provides utilities for opening files in VS Code editor.
 * Supports opening files with line numbers and preview mode.
 */

import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface EditorOptions {
  line?: number;
  column?: number;
  preview?: boolean;
  reuse?: boolean; // Reuse existing window
}

/**
 * Check if VS Code CLI is available
 */
export function isVSCodeAvailable(): boolean {
  try {
    child_process.execSync('code --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Open a file in VS Code editor
 */
export async function openInVSCode(filePath: string, options: EditorOptions = {}): Promise<boolean> {
  const { line, column, preview = false, reuse = true } = options;

  if (!isVSCodeAvailable()) {
    throw new Error('VS Code CLI (code) is not available. Please install VS Code and ensure "code" is in your PATH.');
  }

  // Resolve to absolute path
  const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);

  // Check if file exists
  if (!fs.existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`);
  }

  // Build command arguments
  const args: string[] = [];

  // Reuse window flag
  if (reuse) {
    args.push('-r');
  }

  // Add file path with line/column
  let fileArg = absPath;
  if (line !== undefined) {
    fileArg += `:${line}`;
    if (column !== undefined) {
      fileArg += `:${column}`;
    }
  }
  args.push(fileArg);

  // Preview mode (open in preview tab)
  if (preview) {
    args.push('--preview');
  }

  try {
    // Execute VS Code command
    child_process.execSync(`code ${args.join(' ')}`, {
      stdio: 'ignore',
      windowsHide: true
    });
    return true;
  } catch (error) {
    throw new Error(`Failed to open file in VS Code: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Open a file in VS Code preview pane
 */
export async function openInPreview(filePath: string, options: Omit<EditorOptions, 'preview'> = {}): Promise<boolean> {
  return openInVSCode(filePath, { ...options, preview: true });
}

/**
 * Open a file in VS Code editor (full tab)
 */
export async function openInEditor(filePath: string, options: Omit<EditorOptions, 'preview'> = {}): Promise<boolean> {
  return openInVSCode(filePath, { ...options, preview: false });
}

/**
 * Focus VS Code window
 */
export function focusVSCode(): boolean {
  if (!isVSCodeAvailable()) {
    return false;
  }

  try {
    child_process.execSync('code -r', {
      stdio: 'ignore',
      windowsHide: true
    });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get VS Code version
 */
export function getVSCodeVersion(): string | null {
  if (!isVSCodeAvailable()) {
    return null;
  }

  try {
    const output = child_process.execSync('code --version', {
      encoding: 'utf-8',
      windowsHide: true
    });
    const lines = output.trim().split('\n');
    return lines[0] || null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if running inside VS Code integrated terminal
 */
export function isVSCodeTerminal(): boolean {
  return process.env.TERM_PROGRAM === 'vscode' || process.env.VSCODE_PID !== undefined;
}

/**
 * Get current workspace folder from VS Code environment
 */
export function getVSCodeWorkspace(): string | undefined {
  return process.env.VSCODE_WORKSPACE_FOLDER;
}

