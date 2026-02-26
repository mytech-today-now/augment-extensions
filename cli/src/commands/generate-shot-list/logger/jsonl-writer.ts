/**
 * JSONL Writer for AI Shot List Generator
 * 
 * Handles writing log entries to JSONL files with:
 * - Append-only writing
 * - Atomic writes (prevent corruption)
 * - Concurrent write safety
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const appendFile = promisify(fs.appendFile);
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);

/**
 * JSONL Writer class
 */
export class JSONLWriter {
  private filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();
  private maxFileSize: number;  // Max file size in bytes (default: 10MB)
  private maxBackups: number;    // Max number of backup files (default: 5)

  constructor(filePath: string, maxFileSize: number = 10 * 1024 * 1024, maxBackups: number = 5) {
    this.filePath = filePath;
    this.maxFileSize = maxFileSize;
    this.maxBackups = maxBackups;
  }
  
  /**
   * Initialize the writer (create directory if needed)
   */
  async initialize(): Promise<void> {
    const dir = path.dirname(this.filePath);
    
    try {
      await access(dir);
    } catch {
      // Directory doesn't exist, create it
      await mkdir(dir, { recursive: true });
    }
  }
  
  /**
   * Check if file rotation is needed
   */
  private async shouldRotate(): Promise<boolean> {
    try {
      const stats = await stat(this.filePath);
      return stats.size >= this.maxFileSize;
    } catch {
      // File doesn't exist yet
      return false;
    }
  }

  /**
   * Rotate log files
   */
  private async rotateFiles(): Promise<void> {
    try {
      // Delete oldest backup if we're at max backups
      const oldestBackup = `${this.filePath}.${this.maxBackups}`;
      try {
        await access(oldestBackup);
        await fs.promises.unlink(oldestBackup);
      } catch {
        // File doesn't exist, that's fine
      }

      // Rotate existing backups
      for (let i = this.maxBackups - 1; i >= 1; i--) {
        const oldPath = `${this.filePath}.${i}`;
        const newPath = `${this.filePath}.${i + 1}`;

        try {
          await access(oldPath);
          await rename(oldPath, newPath);
        } catch {
          // File doesn't exist, skip
        }
      }

      // Rotate current file to .1
      try {
        await access(this.filePath);
        await rename(this.filePath, `${this.filePath}.1`);
      } catch {
        // File doesn't exist, that's fine
      }
    } catch (error) {
      console.error('Failed to rotate log files:', error);
    }
  }

  /**
   * Write a log entry to the JSONL file
   *
   * This method is thread-safe and ensures atomic writes
   */
  async write(entry: any): Promise<void> {
    // Queue the write to ensure sequential writes
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        // Check if rotation is needed
        if (await this.shouldRotate()) {
          await this.rotateFiles();
        }

        // Convert entry to JSON and add newline
        const line = JSON.stringify(entry) + '\n';

        // Append to file atomically
        await appendFile(this.filePath, line, { encoding: 'utf-8' });
      } catch (error) {
        // Log to stderr but don't throw - we don't want logging failures to crash the app
        console.error('Failed to write log entry:', error);
      }
    });

    // Wait for this write to complete
    await this.writeQueue;
  }
  
  /**
   * Write multiple entries at once
   */
  async writeMany(entries: any[]): Promise<void> {
    for (const entry of entries) {
      await this.write(entry);
    }
  }
  
  /**
   * Flush any pending writes
   */
  async flush(): Promise<void> {
    await this.writeQueue;
  }
  
  /**
   * Get the file path
   */
  getFilePath(): string {
    return this.filePath;
  }
}

/**
 * Create a JSONL writer for a specific log file
 */
export function createJSONLWriter(filePath: string): JSONLWriter {
  return new JSONLWriter(filePath);
}

