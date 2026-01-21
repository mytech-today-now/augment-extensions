/**
 * Coordination Query Functions
 * 
 * AI agent discovery functions for querying the coordination manifest.
 * All queries must complete in < 100ms.
 */

import * as fs from 'fs';
import { minimatch } from 'minimatch';

interface CoordinationManifest {
  version: string;
  lastUpdated: string;
  specs: Record<string, SpecEntry>;
  tasks: Record<string, TaskEntry>;
  rules: Record<string, RuleEntry>;
  files: Record<string, FileEntry>;
}

interface SpecEntry {
  path: string;
  status: string;
  relatedTasks: string[];
  relatedRules: string[];
  affectedFiles: string[];
  dependencies: string[];
}

interface TaskEntry {
  title: string;
  status: string;
  relatedSpecs: string[];
  relatedRules: string[];
  outputFiles: string[];
  dependencies?: string[];
}

interface RuleEntry {
  path: string;
  appliesTo: {
    filePatterns: string[];
    specs: string[];
    tasks: string[];
  };
  priority: string;
}

interface FileEntry {
  createdBy: string | null;
  modifiedBy: string[];
  governedBy: string[];
  rulesApplied: string[];
}

/**
 * Read coordination manifest with caching
 */
let cachedManifest: CoordinationManifest | null = null;
let cachedManifestPath: string | null = null;
let cachedManifestMtime: number | null = null;

export function readCoordinationManifest(manifestPath: string = '.augment/coordination.json'): CoordinationManifest {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Coordination manifest not found at ${manifestPath}`);
  }
  
  const stats = fs.statSync(manifestPath);
  const mtime = stats.mtimeMs;
  
  // Use cache if available and file hasn't changed
  if (cachedManifest && cachedManifestPath === manifestPath && cachedManifestMtime === mtime) {
    return cachedManifest;
  }

  // Read and cache
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8')) as CoordinationManifest;
  cachedManifest = manifest;
  cachedManifestPath = manifestPath;
  cachedManifestMtime = mtime;

  return manifest;
}

/**
 * Get all active specs
 */
export function getActiveSpecs(manifestPath?: string): Array<{ id: string } & SpecEntry> {
  const manifest = readCoordinationManifest(manifestPath);
  
  return Object.entries(manifest.specs)
    .filter(([id, spec]) => spec.status === 'active')
    .map(([id, spec]) => ({ id, ...spec }));
}

/**
 * Get tasks for a specific spec
 */
export function getTasksForSpec(specId: string, manifestPath?: string): Array<{ id: string } & TaskEntry> {
  const manifest = readCoordinationManifest(manifestPath);
  const spec = manifest.specs[specId];
  
  if (!spec) {
    return [];
  }
  
  return spec.relatedTasks
    .filter(taskId => manifest.tasks[taskId])
    .map(taskId => ({
      id: taskId,
      ...manifest.tasks[taskId]
    }));
}

/**
 * Get rules for a specific task
 */
export function getRulesForTask(taskId: string, manifestPath?: string): Array<{ name: string } & RuleEntry> {
  const manifest = readCoordinationManifest(manifestPath);
  const task = manifest.tasks[taskId];
  
  if (!task) {
    return [];
  }
  
  return task.relatedRules
    .filter(ruleName => manifest.rules[ruleName])
    .map(ruleName => ({
      name: ruleName,
      ...manifest.rules[ruleName]
    }));
}

/**
 * Get specs that govern a specific file
 */
export function getSpecForFile(filePath: string, manifestPath?: string): Array<{ id: string } & SpecEntry> {
  const manifest = readCoordinationManifest(manifestPath);
  
  return Object.entries(manifest.specs)
    .filter(([id, spec]) => {
      return spec.affectedFiles.some(pattern => minimatch(filePath, pattern));
    })
    .map(([id, spec]) => ({ id, ...spec }));
}

/**
 * Get tasks that created or modified a specific file
 */
export function getTasksForFile(filePath: string, manifestPath?: string): Array<{ id: string; relationship: string } & TaskEntry> {
  const manifest = readCoordinationManifest(manifestPath);
  const fileEntry = manifest.files[filePath];
  
  if (!fileEntry) {
    return [];
  }
  
  const tasks: Array<{ id: string; relationship: string } & TaskEntry> = [];
  
  // Add creator task
  if (fileEntry.createdBy && manifest.tasks[fileEntry.createdBy]) {
    tasks.push({
      id: fileEntry.createdBy,
      relationship: 'created',
      ...manifest.tasks[fileEntry.createdBy]
    });
  }
  
  // Add modifier tasks
  for (const taskId of fileEntry.modifiedBy) {
    if (manifest.tasks[taskId]) {
      tasks.push({
        id: taskId,
        relationship: 'modified',
        ...manifest.tasks[taskId]
      });
    }
  }
  
  return tasks;
}

