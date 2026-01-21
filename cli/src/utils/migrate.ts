/**
 * Migration Utility
 * 
 * Migrates existing Beads tasks and OpenSpec specs to coordination system.
 * Ensures no data loss during migration.
 */

import * as fs from 'fs';
import { syncBeadsToCoordination } from './beads-sync';
import { syncOpenSpecToCoordination } from './openspec-sync';

interface MigrationResult {
  beads: {
    added: number;
    updated: number;
    removed: number;
  };
  openspec: {
    added: number;
    updated: number;
    removed: number;
  };
  backup: string;
}

/**
 * Create backup of coordination manifest
 */
function createBackup(manifestPath: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${manifestPath}.backup-${timestamp}`;
  
  if (fs.existsSync(manifestPath)) {
    fs.copyFileSync(manifestPath, backupPath);
  }
  
  return backupPath;
}

/**
 * Validate coordination manifest
 */
function validateManifest(manifestPath: string): boolean {
  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);
    
    // Check required fields
    if (!manifest.version || !manifest.specs || !manifest.tasks || !manifest.rules || !manifest.files) {
      return false;
    }
    
    // Check that all task references in specs exist
    for (const [specId, spec] of Object.entries(manifest.specs)) {
      const specData = spec as any;
      if (specData.relatedTasks) {
        for (const taskId of specData.relatedTasks) {
          if (!manifest.tasks[taskId]) {
            console.warn(`Warning: Spec ${specId} references non-existent task ${taskId}`);
          }
        }
      }
    }

    // Check that all spec references in tasks exist
    for (const [taskId, task] of Object.entries(manifest.tasks)) {
      const taskData = task as any;
      if (taskData.relatedSpecs) {
        for (const specId of taskData.relatedSpecs) {
          if (!manifest.specs[specId]) {
            console.warn(`Warning: Task ${taskId} references non-existent spec ${specId}`);
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

/**
 * Migrate existing data to coordination system
 */
export function migrateExistingData(
  beadsPath: string = '.beads/issues.jsonl',
  openspecDir: string = 'openspec',
  manifestPath: string = '.augment/coordination.json'
): MigrationResult {
  console.log('Starting migration...');
  
  // Create backup
  const backupPath = createBackup(manifestPath);
  console.log(`Created backup at ${backupPath}`);
  
  // Sync Beads tasks
  console.log('Migrating Beads tasks...');
  let beadsStats = { added: 0, updated: 0, removed: 0 };
  
  if (fs.existsSync(beadsPath)) {
    try {
      beadsStats = syncBeadsToCoordination(beadsPath, manifestPath);
      console.log(`Beads: ${beadsStats.added} added, ${beadsStats.updated} updated, ${beadsStats.removed} removed`);
    } catch (error) {
      console.error('Failed to migrate Beads tasks:', error);
      // Restore backup
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, manifestPath);
        console.log('Restored from backup');
      }
      throw error;
    }
  } else {
    console.log('No Beads tasks found, skipping');
  }
  
  // Sync OpenSpec specs
  console.log('Migrating OpenSpec specs...');
  let openspecStats = { added: 0, updated: 0, removed: 0 };
  
  if (fs.existsSync(openspecDir)) {
    try {
      openspecStats = syncOpenSpecToCoordination(openspecDir, manifestPath);
      console.log(`OpenSpec: ${openspecStats.added} added, ${openspecStats.updated} updated, ${openspecStats.removed} removed`);
    } catch (error) {
      console.error('Failed to migrate OpenSpec specs:', error);
      // Restore backup
      if (fs.existsSync(backupPath)) {
        fs.copyFileSync(backupPath, manifestPath);
        console.log('Restored from backup');
      }
      throw error;
    }
  } else {
    console.log('No OpenSpec specs found, skipping');
  }
  
  // Validate result
  console.log('Validating migration...');
  if (!validateManifest(manifestPath)) {
    console.error('Validation failed!');
    // Restore backup
    if (fs.existsSync(backupPath)) {
      fs.copyFileSync(backupPath, manifestPath);
      console.log('Restored from backup');
    }
    throw new Error('Migration validation failed');
  }
  
  console.log('Migration complete!');
  
  return {
    beads: beadsStats,
    openspec: openspecStats,
    backup: backupPath
  };
}

