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

/**
 * JSONL Writer class
 */
export class JSONLWriter {
  private filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();
  
  constructor(filePath: string) {
    this.filePath = filePath;
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
   * Write a log entry to the JSONL file
   * 
   * This method is thread-safe and ensures atomic writes
   */
  async write(entry: any): Promise<void> {
    // Queue the write to ensure sequential writes
    this.writeQueue = this.writeQueue.then(async () => {
      try {
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

