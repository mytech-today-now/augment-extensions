/**
 * File Organization Utilities for Screenplay Module
 * 
 * Provides utilities for organizing screenplay files into structured directories
 * based on OpenSpec specs or Beads epics.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface ScreenplayProjectInfo {
  name: string;
  source: 'openspec' | 'beads' | 'manual';
  specId?: string;
  epicId?: string;
  timestamp?: string;
}

export interface OrganizationOptions {
  rootDir?: string;
  createIfMissing?: boolean;
  handleConflicts?: 'append-timestamp' | 'append-number' | 'error';
}

/**
 * Get the screenplays directory path
 */
export function getScreenplaysDir(rootDir: string = process.cwd()): string {
  return path.join(rootDir, 'screenplays');
}

/**
 * Ensure the screenplays directory exists
 */
export function ensureScreenplaysDir(rootDir: string = process.cwd()): string {
  const screenplaysDir = getScreenplaysDir(rootDir);
  
  if (!fs.existsSync(screenplaysDir)) {
    fs.mkdirSync(screenplaysDir, { recursive: true });
  }
  
  return screenplaysDir;
}

/**
 * Get project name from OpenSpec spec
 */
export function getProjectNameFromOpenSpec(rootDir: string = process.cwd()): ScreenplayProjectInfo | null {
  const openspecDir = path.join(rootDir, 'openspec');
  
  if (!fs.existsSync(openspecDir)) {
    return null;
  }
  
  // Check for active changes
  const changesDir = path.join(openspecDir, 'changes');
  if (fs.existsSync(changesDir)) {
    const changes = fs.readdirSync(changesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    if (changes.length > 0) {
      // Use the first active change as the project name
      return {
        name: changes[0],
        source: 'openspec',
        specId: changes[0]
      };
    }
  }
  
  return null;
}

/**
 * Get project name from Beads epic
 */
export function getProjectNameFromBeads(rootDir: string = process.cwd()): ScreenplayProjectInfo | null {
  const beadsFile = path.join(rootDir, '.beads', 'issues.jsonl');
  
  if (!fs.existsSync(beadsFile)) {
    return null;
  }
  
  try {
    const lines = fs.readFileSync(beadsFile, 'utf-8').split('\n').filter(line => line.trim());
    
    // Find the most recent open epic with screenplay labels
    for (let i = lines.length - 1; i >= 0; i--) {
      const issue = JSON.parse(lines[i]);
      
      if (issue.issue_type === 'epic' && 
          issue.status === 'open' && 
          (issue.labels?.includes('screenplay') || issue.labels?.includes('writing-standards'))) {
        return {
          name: issue.id,
          source: 'beads',
          epicId: issue.id
        };
      }
    }
  } catch (error) {
    console.warn('Error reading Beads issues:', error);
  }
  
  return null;
}

/**
 * Get project name with fallback logic
 */
export function getProjectName(rootDir: string = process.cwd()): ScreenplayProjectInfo {
  // Try OpenSpec first
  const openspecInfo = getProjectNameFromOpenSpec(rootDir);
  if (openspecInfo) {
    return openspecInfo;
  }
  
  // Try Beads second
  const beadsInfo = getProjectNameFromBeads(rootDir);
  if (beadsInfo) {
    return beadsInfo;
  }
  
  // Fallback to timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  return {
    name: `screenplay-${timestamp}`,
    source: 'manual',
    timestamp
  };
}

/**
 * Create project directory with conflict resolution
 */
export function createProjectDir(
  projectInfo: ScreenplayProjectInfo,
  options: OrganizationOptions = {}
): string {
  const { rootDir = process.cwd(), handleConflicts = 'append-number' } = options;
  
  const screenplaysDir = ensureScreenplaysDir(rootDir);
  let projectDir = path.join(screenplaysDir, projectInfo.name);
  
  // Handle conflicts
  if (fs.existsSync(projectDir)) {
    if (handleConflicts === 'error') {
      throw new Error(`Project directory already exists: ${projectDir}`);
    } else if (handleConflicts === 'append-timestamp') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      projectDir = path.join(screenplaysDir, `${projectInfo.name}-${timestamp}`);
    } else if (handleConflicts === 'append-number') {
      let counter = 1;
      while (fs.existsSync(projectDir)) {
        projectDir = path.join(screenplaysDir, `${projectInfo.name}-${counter}`);
        counter++;
      }
    }
  }
  
  fs.mkdirSync(projectDir, { recursive: true });
  return projectDir;
}

