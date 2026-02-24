/**
 * Shot List Logger Implementation
 * 
 * Main logger implementation for AI Shot List Generator
 */

import { v4 as uuidv4 } from 'uuid';
import { ErrorDefinition } from '../errors';
import {
  Logger,
  ErrorLogEntry,
  SuccessLogEntry,
  WarningLogEntry,
  InfoLogEntry,
} from './types';
import { JSONLWriter } from './jsonl-writer';

/**
 * Logger version for format compatibility
 */
const LOGGER_VERSION = '1.0.0';

/**
 * Get CLI version from package.json
 */
function getCLIVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require('../../../../../package.json');
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Shot List Logger class
 */
export class ShotListLogger implements Logger {
  private writer: JSONLWriter;
  
  constructor(logFilePath: string) {
    this.writer = new JSONLWriter(logFilePath);
  }
  
  /**
   * Initialize the logger
   */
  async initialize(): Promise<void> {
    await this.writer.initialize();
  }
  
  /**
   * Log an error
   */
  async logError(
    error: ErrorDefinition,
    context?: any,
    stackTrace?: string
  ): Promise<void> {
    const entry: ErrorLogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'error',
      version: LOGGER_VERSION,
      errorCode: error.code,
      errorName: error.name,
      message: error.message(context),
      fixSuggestion: error.fix(context),
      severity: error.severity,
      exitCode: error.exitCode,
      reproductionSteps: this.generateReproductionSteps(context),
      metadata: {
        nodeVersion: process.version,
        platform: process.platform,
        cliVersion: getCLIVersion(),
        inputFile: context?.inputFile,
        outputFile: context?.outputFile,
        args: context?.args,
      },
      stackTrace,
      context,
    };
    
    await this.writer.write(entry);
  }
  
  /**
   * Log a success
   */
  async logSuccess(
    message: string,
    statistics: SuccessLogEntry['statistics'],
    inputFile: string,
    outputFile: string,
    format: string
  ): Promise<void> {
    const entry: SuccessLogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'success',
      version: LOGGER_VERSION,
      message,
      statistics,
      inputFile,
      outputFile,
      format,
    };
    
    await this.writer.write(entry);
  }
  
  /**
   * Log a warning
   */
  async logWarning(code: string, message: string, context?: any): Promise<void> {
    const entry: WarningLogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'warning',
      version: LOGGER_VERSION,
      warningCode: code,
      message,
      context,
    };
    
    await this.writer.write(entry);
  }
  
  /**
   * Log info
   */
  async logInfo(message: string, data?: any): Promise<void> {
    const entry: InfoLogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      type: 'info',
      version: LOGGER_VERSION,
      message,
      data,
    };
    
    await this.writer.write(entry);
  }
  
  /**
   * Flush any pending log entries
   */
  async flush(): Promise<void> {
    await this.writer.flush();
  }
  
  /**
   * Generate reproduction steps from context
   */
  private generateReproductionSteps(context?: any): string[] | undefined {
    if (!context) return undefined;
    
    const steps: string[] = [];
    
    if (context.inputFile) {
      steps.push(`Use input file: ${context.inputFile}`);
    }
    
    if (context.args) {
      const argStr = Object.entries(context.args)
        .map(([key, value]) => `--${key} ${value}`)
        .join(' ');
      steps.push(`Run command with: ${argStr}`);
    }
    
    return steps.length > 0 ? steps : undefined;
  }
}

