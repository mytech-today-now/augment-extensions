/**
 * JSON Schema Validator
 * 
 * Validates shot list JSON output against the JSON schema
 */

import Ajv, { ValidateFunction, ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import * as schema from './shot-list.schema.json';

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  path: string;
  message: string;
  keyword?: string;
  params?: Record<string, any>;
}

/**
 * Schema validator for shot lists
 */
export class SchemaValidator {
  private ajv: Ajv;
  private validator: ValidateFunction;
  private shotValidator: ValidateFunction | null = null;

  constructor() {
    // Initialize AJV with strict mode and formats
    this.ajv = new Ajv({
      strict: true,
      allErrors: true,
      verbose: true
    });

    // Add format validators (date-time, etc.)
    addFormats(this.ajv);

    // Compile schema
    this.validator = this.ajv.compile(schema);

    // Compile shot schema for JSONL validation
    if (schema.definitions?.shot) {
      this.shotValidator = this.ajv.compile({
        ...schema.definitions.shot,
        definitions: schema.definitions
      });
    }
  }

  /**
   * Validate shot list JSON against schema
   */
  validate(data: any): ValidationResult {
    const valid = this.validator(data);

    if (valid) {
      return { valid: true };
    }

    // Format errors
    const errors = this.formatErrors(this.validator.errors || []);
    return { valid: false, errors };
  }

  /**
   * Validate JSON string
   */
  validateJSON(jsonString: string): ValidationResult {
    try {
      const data = JSON.parse(jsonString);
      return this.validate(data);
    } catch (error) {
      return {
        valid: false,
        errors: [{
          path: '',
          message: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`
        }]
      };
    }
  }

  /**
   * Validate JSONL string (one shot per line)
   */
  validateJSONL(jsonlString: string): ValidationResult {
    const lines = jsonlString.trim().split('\n');
    const errors: ValidationError[] = [];

    if (!this.shotValidator) {
      return {
        valid: false,
        errors: [{
          path: '',
          message: 'Shot schema not available for JSONL validation'
        }]
      };
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      try {
        const shot = JSON.parse(line);

        // Validate against shot schema
        const valid = this.shotValidator(shot);

        if (!valid) {
          const lineErrors = this.formatErrors(this.shotValidator.errors || [], `line ${i + 1}`);
          errors.push(...lineErrors);
        }
      } catch (error) {
        errors.push({
          path: `line ${i + 1}`,
          message: `Invalid JSON: ${error instanceof Error ? error.message : String(error)}`
        });
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    return { valid: true };
  }

  /**
   * Format AJV errors into readable format
   */
  private formatErrors(ajvErrors: ErrorObject[], prefix: string = ''): ValidationError[] {
    return ajvErrors.map(error => ({
      path: prefix ? `${prefix}${error.instancePath}` : error.instancePath,
      message: error.message || 'Validation error',
      keyword: error.keyword,
      params: error.params
    }));
  }

  /**
   * Get human-readable error summary
   */
  getErrorSummary(result: ValidationResult): string {
    if (result.valid) {
      return 'Validation passed';
    }

    const errors = result.errors || [];
    const summary = errors.map(err => 
      `  - ${err.path || 'root'}: ${err.message}`
    ).join('\n');

    return `Validation failed with ${errors.length} error(s):\n${summary}`;
  }
}

/**
 * Singleton validator instance
 */
let validatorInstance: SchemaValidator | null = null;

/**
 * Get or create validator instance
 */
export function getValidator(): SchemaValidator {
  if (!validatorInstance) {
    validatorInstance = new SchemaValidator();
  }
  return validatorInstance;
}

