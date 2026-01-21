/**
 * Sync Commands
 * 
 * Commands for syncing Beads and OpenSpec with coordination manifest:
 * - augx sync beads
 * - augx sync openspec
 * - augx sync all
 * - augx sync watch
 */

import chalk from 'chalk';
import { syncBeadsToCoordination } from '../utils/beads-sync';
import { syncOpenSpecToCoordination } from '../utils/openspec-sync';
import { watchForChanges } from '../utils/auto-sync';

/**
 * Sync Beads tasks to coordination manifest
 */
export function syncBeadsCommand(): void {
  try {
    console.log(chalk.blue('Syncing Beads tasks to coordination manifest...'));
    const stats = syncBeadsToCoordination();
    
    console.log(chalk.green('✓ Beads sync complete:'));
    console.log(chalk.gray(`  Added: ${stats.added}`));
    console.log(chalk.gray(`  Updated: ${stats.updated}`));
    console.log(chalk.gray(`  Removed: ${stats.removed}`));
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Sync OpenSpec specs to coordination manifest
 */
export function syncOpenSpecCommand(): void {
  try {
    console.log(chalk.blue('Syncing OpenSpec specs to coordination manifest...'));
    const stats = syncOpenSpecToCoordination();
    
    console.log(chalk.green('✓ OpenSpec sync complete:'));
    console.log(chalk.gray(`  Added: ${stats.added}`));
    console.log(chalk.gray(`  Updated: ${stats.updated}`));
    console.log(chalk.gray(`  Removed: ${stats.removed}`));
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Sync both Beads and OpenSpec
 */
export function syncAllCommand(): void {
  try {
    console.log(chalk.blue('Syncing all sources to coordination manifest...\n'));
    
    // Sync Beads
    console.log(chalk.blue('1. Syncing Beads tasks...'));
    const beadsStats = syncBeadsToCoordination();
    console.log(chalk.green('✓ Beads sync complete:'));
    console.log(chalk.gray(`  Added: ${beadsStats.added}, Updated: ${beadsStats.updated}, Removed: ${beadsStats.removed}\n`));
    
    // Sync OpenSpec
    console.log(chalk.blue('2. Syncing OpenSpec specs...'));
    const openspecStats = syncOpenSpecToCoordination();
    console.log(chalk.green('✓ OpenSpec sync complete:'));
    console.log(chalk.gray(`  Added: ${openspecStats.added}, Updated: ${openspecStats.updated}, Removed: ${openspecStats.removed}\n`));
    
    console.log(chalk.green.bold('✓ All syncs complete!'));
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Watch for changes and auto-sync
 */
export function syncWatchCommand(): void {
  try {
    console.log(chalk.blue('Starting file watcher for auto-sync...'));
    console.log(chalk.gray('Watching .beads/issues.jsonl and openspec/ for changes'));
    console.log(chalk.gray('Press Ctrl+C to stop\n'));
    
    const cleanup = watchForChanges(
      '.beads/issues.jsonl',
      'openspec',
      '.augment/coordination.json',
      (type, stats) => {
        const timestamp = new Date().toLocaleTimeString();
        console.log(chalk.cyan(`[${timestamp}] Synced ${type}:`), 
                   chalk.gray(`${stats.added} added, ${stats.updated} updated, ${stats.removed} removed`));
      }
    );
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\nStopping file watcher...'));
      cleanup();
      process.exit(0);
    });
    
    // Keep process alive
    process.stdin.resume();
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

