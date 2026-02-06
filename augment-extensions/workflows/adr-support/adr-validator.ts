/**
 * ADR Validation Module
 * Implements validation rules from validation-rules.md
 */

export interface ADR {
  id: string;
  title: string;
  status: string;
  date: string;
  deciders: string[];
  tags?: string[];
  supersedes?: string[];
  superseded_by?: string;
  related_decisions?: string[];
  related_specs?: string[];
  related_tasks?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

const VALID_STATUSES = ['draft', 'proposed', 'approved', 'implemented', 'maintained', 'superseded', 'sunset'];

/**
 * Validate ISO 8601 date format (YYYY-MM-DD)
 */
export function isValidISO8601(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }

  const [year, month, day] = date.split('-').map(Number);

  // Check basic ranges
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  // Create date in UTC to avoid timezone issues
  const d = new Date(Date.UTC(year, month - 1, day));

  if (isNaN(d.getTime())) {
    return false;
  }

  // Verify the date components match (handles invalid dates like 2024-02-30)
  return d.getUTCFullYear() === year &&
         d.getUTCMonth() === month - 1 &&
         d.getUTCDate() === day;
}

/**
 * Validate required metadata fields
 */
export function validateMetadata(adr: ADR): ValidationResult {
  const errors: string[] = [];
  
  // ID validation
  if (!adr.id) {
    errors.push("Missing required field: id");
  } else if (!/^adr-\d{4}$/.test(adr.id)) {
    errors.push("Invalid ID format. Must be adr-NNNN (e.g., adr-0001)");
  }
  
  // Title validation
  if (!adr.title) {
    errors.push("Missing required field: title");
  } else if (adr.title.length < 10 || adr.title.length > 100) {
    errors.push("Title must be 10-100 characters");
  }
  
  // Status validation
  if (!adr.status) {
    errors.push("Missing required field: status");
  } else if (!VALID_STATUSES.includes(adr.status)) {
    errors.push(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  
  // Date validation
  if (!adr.date) {
    errors.push("Missing required field: date");
  } else if (!isValidISO8601(adr.date)) {
    errors.push("Invalid date format. Must be ISO 8601 (YYYY-MM-DD)");
  }
  
  // Deciders validation
  if (!adr.deciders || adr.deciders.length === 0) {
    errors.push("At least one decider must be specified");
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate optional fields
 */
export function validateOptionalFields(adr: ADR): ValidationResult {
  const warnings: string[] = [];
  
  // Tags validation
  if (adr.tags && !Array.isArray(adr.tags)) {
    warnings.push("Tags must be an array");
  }
  
  // Supersedes validation
  if (adr.supersedes) {
    if (!Array.isArray(adr.supersedes)) {
      warnings.push("Supersedes must be an array");
    } else {
      adr.supersedes.forEach(id => {
        if (!/^adr-\d{4}$/.test(id)) {
          warnings.push(`Invalid ADR ID in supersedes: ${id}`);
        }
      });
    }
  }
  
  // Superseded_by validation
  if (adr.superseded_by && !/^adr-\d{4}$/.test(adr.superseded_by)) {
    warnings.push(`Invalid ADR ID in superseded_by: ${adr.superseded_by}`);
  }
  
  return { valid: warnings.length === 0, warnings };
}

/**
 * Validate ADR references (related_decisions, supersedes, etc.)
 */
export function validateADRReferences(adr: ADR, allADRs: ADR[]): ValidationResult {
  const warnings: string[] = [];
  const adrIds = new Set(allADRs.map(a => a.id));
  
  // Validate supersedes references
  if (adr.supersedes) {
    adr.supersedes.forEach(id => {
      if (!adrIds.has(id)) {
        warnings.push(`Referenced ADR does not exist: ${id}`);
      }
    });
  }
  
  // Validate superseded_by reference
  if (adr.superseded_by && !adrIds.has(adr.superseded_by)) {
    warnings.push(`Referenced ADR does not exist: ${adr.superseded_by}`);
  }
  
  // Validate related_decisions
  if (adr.related_decisions) {
    adr.related_decisions.forEach(id => {
      if (!adrIds.has(id)) {
        warnings.push(`Related ADR does not exist: ${id}`);
      }
    });
  }
  
  return { valid: warnings.length === 0, warnings };
}

