/**
 * Logger Module for AI Shot List Generator
 * 
 * Orchestrates logging functionality with JSONL error logging
 */

import * as path from 'path';
import * as os from 'os';
import { ShotListLogger } from './shot-list-logger';
import { Logger } from './types';

// Re-export types
export * from './types';
export { JSONLWriter } from './jsonl-writer';
export { ShotListLogger } from './shot-list-logger';

/**
 * Default log file path
 */
function getDefaultLogPath(): string {
  // Use .augment-extensions/logs directory in user's home
  const homeDir = os.homedir();
  const logDir = path.join(homeDir, '.augment-extensions', 'logs');
  const logFile = path.join(logDir, 'shot-list-generator.jsonl');
  return logFile;
}

/**
 * Create a logger instance
 * 
 * @param logFilePath - Optional custom log file path
 * @returns Logger instance
 */
export async function createLogger(logFilePath?: string): Promise<Logger> {
  const filePath = logFilePath || getDefaultLogPath();
  const logger = new ShotListLogger(filePath);
  await logger.initialize();
  return logger;
}

/**
 * Singleton logger instance
 */
let globalLogger: Logger | null = null;

/**
 * Get or create the global logger instance
 */
export async function getLogger(logFilePath?: string): Promise<Logger> {
  if (!globalLogger) {
    globalLogger = await createLogger(logFilePath);
  }
  return globalLogger;
}

/**
 * Reset the global logger (useful for testing)
 */
export function resetLogger(): void {
  globalLogger = null;
}

