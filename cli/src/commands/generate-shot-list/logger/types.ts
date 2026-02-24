/**
 * Logger Types for AI Shot List Generator
 * 
 * Type definitions for structured logging system
 */

import { ErrorDefinition } from '../errors';

/**
 * Log entry types
 */
export type LogEntryType = 'error' | 'success' | 'warning' | 'info';

/**
 * Base log entry structure
 */
export interface BaseLogEntry {
  /** Unique identifier for this log entry */
  id: string;
  
  /** Timestamp in ISO 8601 format */
  timestamp: string;
  
  /** Type of log entry */
  type: LogEntryType;
  
  /** Version of the logger format */
  version: string;
}

/**
 * Error log entry
 */
export interface ErrorLogEntry extends BaseLogEntry {
  type: 'error';
  
  /** Error code from error catalog */
  errorCode: string;
  
  /** Error name */
  errorName: string;
  
  /** Error message */
  message: string;
  
  /** Fix suggestion */
  fixSuggestion: string;
  
  /** Error severity */
  severity: 'critical' | 'error' | 'warning' | 'info';
  
  /** Exit code */
  exitCode: number;
  
  /** Steps to reproduce the error */
  reproductionSteps?: string[];
  
  /** Metadata about the environment */
  metadata: {
    /** Node.js version */
    nodeVersion: string;
    
    /** Platform (win32, darwin, linux) */
    platform: string;
    
    /** CLI version */
    cliVersion: string;
    
    /** Input file path */
    inputFile?: string;
    
    /** Output file path */
    outputFile?: string;
    
    /** Command line arguments */
    args?: Record<string, any>;
  };
  
  /** Stack trace if available */
  stackTrace?: string;
  
  /** Additional context */
  context?: Record<string, any>;
}

/**
 * Success log entry
 */
export interface SuccessLogEntry extends BaseLogEntry {
  type: 'success';
  
  /** Success message */
  message: string;
  
  /** Statistics about the generation */
  statistics: {
    /** Number of shots generated */
    shotCount: number;
    
    /** Total duration in seconds */
    duration: number;
    
    /** Total character count */
    characterCount: number;
    
    /** Processing time in milliseconds */
    processingTime: number;
    
    /** Number of warnings */
    warningCount: number;
    
    /** Input file size in bytes */
    inputFileSize: number;
    
    /** Output file size in bytes */
    outputFileSize: number;
  };
  
  /** Input file path */
  inputFile: string;
  
  /** Output file path */
  outputFile: string;
  
  /** Format used */
  format: string;
}

/**
 * Warning log entry
 */
export interface WarningLogEntry extends BaseLogEntry {
  type: 'warning';
  
  /** Warning code */
  warningCode: string;
  
  /** Warning message */
  message: string;
  
  /** Context about the warning */
  context?: Record<string, any>;
}

/**
 * Info log entry
 */
export interface InfoLogEntry extends BaseLogEntry {
  type: 'info';
  
  /** Info message */
  message: string;
  
  /** Additional data */
  data?: Record<string, any>;
}

/**
 * Union type for all log entries
 */
export type LogEntry = ErrorLogEntry | SuccessLogEntry | WarningLogEntry | InfoLogEntry;

/**
 * Logger interface
 */
export interface Logger {
  /**
   * Log an error
   */
  logError(error: ErrorDefinition, context?: any, stackTrace?: string): Promise<void>;
  
  /**
   * Log a success
   */
  logSuccess(
    message: string,
    statistics: SuccessLogEntry['statistics'],
    inputFile: string,
    outputFile: string,
    format: string
  ): Promise<void>;
  
  /**
   * Log a warning
   */
  logWarning(code: string, message: string, context?: any): Promise<void>;
  
  /**
   * Log info
   */
  logInfo(message: string, data?: any): Promise<void>;
  
  /**
   * Flush any pending log entries
   */
  flush(): Promise<void>;
}

