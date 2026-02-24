/**
 * Exit Codes for AI Shot List Generator
 * 
 * Standard exit codes for proper error handling in scripts and CI/CD
 */

/**
 * Exit code constants
 */
export const ExitCode = {
  /** Success - command completed successfully */
  SUCCESS: 0,
  
  /** General error - unspecified error occurred */
  GENERAL_ERROR: 1,
  
  /** Invalid arguments - command line arguments are invalid */
  INVALID_ARGUMENTS: 2,
  
  /** Input file error - cannot read input file */
  INPUT_FILE_ERROR: 3,
  
  /** Output file error - cannot write output file */
  OUTPUT_FILE_ERROR: 4,
  
  /** Parsing error - cannot parse screenplay */
  PARSING_ERROR: 5,
  
  /** Validation error - screenplay validation failed */
  VALIDATION_ERROR: 6,
} as const;

export type ExitCodeValue = typeof ExitCode[keyof typeof ExitCode];

/**
 * Exit code descriptions for documentation
 */
export const EXIT_CODE_DESCRIPTIONS: Record<ExitCodeValue, string> = {
  [ExitCode.SUCCESS]: 'Command completed successfully',
  [ExitCode.GENERAL_ERROR]: 'General error occurred',
  [ExitCode.INVALID_ARGUMENTS]: 'Invalid command line arguments',
  [ExitCode.INPUT_FILE_ERROR]: 'Cannot read input file',
  [ExitCode.OUTPUT_FILE_ERROR]: 'Cannot write output file',
  [ExitCode.PARSING_ERROR]: 'Cannot parse screenplay',
  [ExitCode.VALIDATION_ERROR]: 'Screenplay validation failed',
};

/**
 * Get exit code from error definition
 */
export function getExitCodeFromError(errorCode: string): ExitCodeValue {
  // Map error codes to exit codes based on error catalog
  if (errorCode.startsWith('PE')) return ExitCode.PARSING_ERROR;
  if (errorCode.startsWith('VE')) return ExitCode.VALIDATION_ERROR;
  if (errorCode.startsWith('FE')) return ExitCode.INVALID_ARGUMENTS;
  if (errorCode.startsWith('IO001') || errorCode.startsWith('IO002')) return ExitCode.INPUT_FILE_ERROR;
  if (errorCode.startsWith('IO003') || errorCode.startsWith('IO004') || errorCode.startsWith('IO005')) return ExitCode.OUTPUT_FILE_ERROR;
  if (errorCode.startsWith('RE')) return ExitCode.GENERAL_ERROR;
  
  return ExitCode.GENERAL_ERROR;
}

/**
 * Exit with proper code and message
 */
export function exitWithCode(code: ExitCodeValue, message?: string): never {
  if (message) {
    if (code === ExitCode.SUCCESS) {
      console.log(message);
    } else {
      console.error(message);
    }
  }
  
  process.exit(code);
}

/**
 * Exit with error from error catalog
 */
export function exitWithError(errorCode: string, message: string): never {
  const exitCode = getExitCodeFromError(errorCode);
  exitWithCode(exitCode, message);
}

