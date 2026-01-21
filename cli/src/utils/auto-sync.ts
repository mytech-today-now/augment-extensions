/**
 * Auto-Sync on File Changes
 * 
 * Automatically updates coordination manifest when files change.
 * Uses file watcher with batched updates to avoid performance issues.
 */

import * as fs from 'fs';
import * as path from 'path';
import { trackFileChanges } from './file-tracking';
import { syncBeadsToCoordination } from './beads-sync';
import { syncOpenSpecToCoordination } from './openspec-sync';

interface FileChange {
  filePath: string;
  taskId: string;
  isNew: boolean;
}

/**
 * Batch file changes to avoid excessive writes
 */
class FileChangeBatcher {
  private changes: FileChange[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private batchDelay: number;
  private manifestPath: string;

  constructor(batchDelay: number = 1000, manifestPath: string = '.augment/coordination.json') {
    this.batchDelay = batchDelay;
    this.manifestPath = manifestPath;
  }

  /**
   * Add a file change to the batch
   */
  add(filePath: string, taskId: string, isNew: boolean): void {
    this.changes.push({ filePath, taskId, isNew });
    
    // Reset timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    // Schedule batch processing
    this.timeout = setTimeout(() => {
      this.flush();
    }, this.batchDelay);
  }

  /**
   * Flush all pending changes
   */
  flush(): void {
    if (this.changes.length === 0) {
      return;
    }
    
    try {
      trackFileChanges(this.changes, this.manifestPath);
      console.log(`Synced ${this.changes.length} file changes to coordination manifest`);
      this.changes = [];
    } catch (error) {
      console.error('Failed to sync file changes:', error);
    }
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

/**
 * Watch for changes to Beads and OpenSpec files
 */
export function watchForChanges(
  beadsPath: string = '.beads/issues.jsonl',
  openspecDir: string = 'openspec',
  manifestPath: string = '.augment/coordination.json',
  onSync?: (type: string, stats: any) => void
): () => void {
  const watchers: fs.FSWatcher[] = [];
  
  // Watch Beads issues file
  if (fs.existsSync(beadsPath)) {
    const beadsWatcher = fs.watch(beadsPath, (eventType) => {
      if (eventType === 'change') {
        try {
          const stats = syncBeadsToCoordination(beadsPath, manifestPath);
          console.log(`Synced Beads: ${stats.added} added, ${stats.updated} updated, ${stats.removed} removed`);
          if (onSync) {
            onSync('beads', stats);
          }
        } catch (error) {
          console.error('Failed to sync Beads:', error);
        }
      }
    });
    watchers.push(beadsWatcher);
  }
  
  // Watch OpenSpec directory
  if (fs.existsSync(openspecDir)) {
    const openspecWatcher = fs.watch(openspecDir, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.md')) {
        try {
          const stats = syncOpenSpecToCoordination(openspecDir, manifestPath);
          console.log(`Synced OpenSpec: ${stats.added} added, ${stats.updated} updated, ${stats.removed} removed`);
          if (onSync) {
            onSync('openspec', stats);
          }
        } catch (error) {
          console.error('Failed to sync OpenSpec:', error);
        }
      }
    });
    watchers.push(openspecWatcher);
  }
  
  // Return cleanup function
  return () => {
    for (const watcher of watchers) {
      watcher.close();
    }
  };
}

/**
 * Create a Git hook for auto-sync
 */
export function createGitHook(
  hookType: 'pre-commit' | 'post-commit' = 'pre-commit',
  gitDir: string = '.git'
): void {
  const hookPath = path.join(gitDir, 'hooks', hookType);
  
  const hookContent = `#!/bin/sh
# Auto-sync coordination manifest

# Sync Beads tasks
if [ -f .beads/issues.jsonl ]; then
  echo "Syncing Beads tasks to coordination manifest..."
  augx sync beads
fi

# Sync OpenSpec specs
if [ -d openspec ]; then
  echo "Syncing OpenSpec specs to coordination manifest..."
  augx sync openspec
fi

# Add coordination manifest to commit if changed
if [ -f .augment/coordination.json ]; then
  git add .augment/coordination.json
fi
`;

  fs.writeFileSync(hookPath, hookContent, { mode: 0o755 });
  console.log(`Created ${hookType} hook at ${hookPath}`);
}

export { FileChangeBatcher };

