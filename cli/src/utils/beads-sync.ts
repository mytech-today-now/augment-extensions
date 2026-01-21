/**
 * Beads ↔ Coordination Sync Utility
 * 
 * Syncs Beads tasks with the coordination manifest.
 * Handles task status changes, creation, and deletion.
 */

import * as fs from 'fs';
import * as path from 'path';

interface BeadsTask {
  id: string;
  title: string;
  status: string;
  priority?: number;
  description?: string;
  labels?: string[];
  spec?: string;
  rules?: string[];
  blocks?: string[];
  blocked_by?: string[];
  created?: string;
  updated?: string;
  closed?: string;
}

interface CoordinationManifest {
  version: string;
  lastUpdated: string;
  specs: Record<string, any>;
  tasks: Record<string, any>;
  rules: Record<string, any>;
  files: Record<string, any>;
}

/**
 * Read all tasks from .beads/issues.jsonl
 */
export function readBeadsTasks(beadsPath: string = '.beads/issues.jsonl'): BeadsTask[] {
  if (!fs.existsSync(beadsPath)) {
    return [];
  }

  const content = fs.readFileSync(beadsPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  const tasksMap = new Map<string, BeadsTask>();
  
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.id) {
        // Merge updates into existing task
        if (tasksMap.has(entry.id)) {
          const existing = tasksMap.get(entry.id)!;
          tasksMap.set(entry.id, { ...existing, ...entry });
        } else {
          tasksMap.set(entry.id, entry);
        }
      }
    } catch (error) {
      console.error(`Failed to parse line: ${line}`, error);
    }
  }
  
  return Array.from(tasksMap.values());
}

/**
 * Read coordination manifest
 */
export function readCoordinationManifest(manifestPath: string = '.augment/coordination.json'): CoordinationManifest {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Coordination manifest not found at ${manifestPath}`);
  }
  
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

/**
 * Write coordination manifest
 */
export function writeCoordinationManifest(manifest: CoordinationManifest, manifestPath: string = '.augment/coordination.json'): void {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

/**
 * Validate task ID format
 */
function validateTaskId(taskId: string): boolean {
  const pattern = /^bd-[a-z0-9]+([.-][a-z0-9]+)*$/;
  return pattern.test(taskId);
}

/**
 * Sync Beads tasks to coordination manifest
 */
export function syncBeadsToCoordination(
  beadsPath: string = '.beads/issues.jsonl',
  manifestPath: string = '.augment/coordination.json'
): { added: number; updated: number; removed: number } {
  const beadsTasks = readBeadsTasks(beadsPath);
  const manifest = readCoordinationManifest(manifestPath);

  let added = 0;
  let updated = 0;
  let removed = 0;

  // Validate all task IDs
  const invalidTaskIds: string[] = [];
  for (const task of beadsTasks) {
    if (!validateTaskId(task.id)) {
      invalidTaskIds.push(task.id);
    }
  }

  if (invalidTaskIds.length > 0) {
    console.error('Error: Invalid task IDs found in Beads (must use "bd-" prefix):');
    for (const taskId of invalidTaskIds) {
      console.error(`  - ${taskId}`);
    }
    console.error('');
    console.error('Valid formats:');
    console.error('  - bd-<hash>        (e.g., bd-a1b2)');
    console.error('  - bd-<name>        (e.g., bd-init, bd-rename1)');
    console.error('  - bd-<hash>.<num>  (e.g., bd-a1b2.1)');
    console.error('  - bd-<name>-<num>  (e.g., bd-prefix1-1)');
    console.error('');
    console.error('See openspec/specs/beads/naming-convention.md for details');
    throw new Error('Invalid task IDs found in Beads');
  }

  // Track which task IDs exist in Beads
  const beadsTaskIds = new Set(beadsTasks.map(t => t.id));
  
  // Update or add tasks from Beads
  for (const task of beadsTasks) {
    const existingTask = manifest.tasks[task.id];
    
    if (!existingTask) {
      // Add new task
      manifest.tasks[task.id] = {
        title: task.title,
        status: task.status,
        relatedSpecs: task.spec ? [task.spec] : [],
        relatedRules: task.rules || [],
        outputFiles: [],
        dependencies: task.blocked_by || []
      };
      added++;
    } else if (existingTask.status !== task.status) {
      // Update task status
      existingTask.status = task.status;
      updated++;
    }
    
    // Update spec's relatedTasks if spec field exists
    if (task.spec && manifest.specs[task.spec]) {
      if (!manifest.specs[task.spec].relatedTasks.includes(task.id)) {
        manifest.specs[task.spec].relatedTasks.push(task.id);
      }
    }
  }
  
  // Remove tasks that no longer exist in Beads
  for (const taskId of Object.keys(manifest.tasks)) {
    if (!beadsTaskIds.has(taskId)) {
      delete manifest.tasks[taskId];
      removed++;
    }
  }
  
  // Update lastUpdated timestamp
  manifest.lastUpdated = new Date().toISOString();
  
  writeCoordinationManifest(manifest, manifestPath);
  
  return { added, updated, removed };
}

