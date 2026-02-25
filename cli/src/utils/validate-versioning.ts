import * as fs from 'fs';
import * as path from 'path';
import { isValidSemanticVersion } from './module-system';

/**
 * Versioning validation result
 */
export interface VersioningValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  modules: ModuleVersioningStatus[];
}

/**
 * Module versioning status
 */
export interface ModuleVersioningStatus {
  modulePath: string;
  moduleName: string;
  hasVersion: boolean;
  hasMetadata: boolean;
  hasChangelog: boolean;
  versionValid: boolean;
  metadataValid: boolean;
  changelogValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate versioning metadata for all modules
 * @param modulesDir Path to the modules directory
 * @returns Validation result
 */
export function validateVersioning(modulesDir: string): VersioningValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const modules: ModuleVersioningStatus[] = [];

  if (!fs.existsSync(modulesDir)) {
    errors.push(`Modules directory not found: ${modulesDir}`);
    return { valid: false, errors, warnings, modules };
  }

  // Find all module directories
  const modulePaths = findModuleDirectories(modulesDir);

  for (const modulePath of modulePaths) {
    const status = validateModuleVersioning(modulePath);
    modules.push(status);

    // Aggregate errors and warnings
    errors.push(...status.errors.map(e => `${status.moduleName}: ${e}`));
    warnings.push(...status.warnings.map(w => `${status.moduleName}: ${w}`));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    modules
  };
}

/**
 * Validate versioning for a single module
 * @param modulePath Path to the module directory
 * @returns Module versioning status
 */
export function validateModuleVersioning(modulePath: string): ModuleVersioningStatus {
  const moduleName = path.basename(modulePath);
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check VERSION file
  const versionFile = path.join(modulePath, 'VERSION');
  const hasVersion = fs.existsSync(versionFile);
  let versionValid = false;

  if (!hasVersion) {
    errors.push('Missing VERSION file');
  } else {
    const version = fs.readFileSync(versionFile, 'utf-8').trim();
    versionValid = isValidSemanticVersion(version);
    
    if (!versionValid) {
      errors.push(`Invalid version format in VERSION file: ${version}`);
    }
  }

  // Check metadata.json
  const metadataFile = path.join(modulePath, 'metadata.json');
  const hasMetadata = fs.existsSync(metadataFile);
  let metadataValid = false;

  if (!hasMetadata) {
    warnings.push('Missing metadata.json file');
  } else {
    const metadataValidation = validateMetadataJson(metadataFile);
    metadataValid = metadataValidation.valid;
    errors.push(...metadataValidation.errors);
    warnings.push(...metadataValidation.warnings);
  }

  // Check CHANGELOG.md
  const changelogFile = path.join(modulePath, 'CHANGELOG.md');
  const hasChangelog = fs.existsSync(changelogFile);
  let changelogValid = false;

  if (!hasChangelog) {
    warnings.push('Missing CHANGELOG.md file');
  } else {
    const changelogValidation = validateChangelog(changelogFile);
    changelogValid = changelogValidation.valid;
    errors.push(...changelogValidation.errors);
    warnings.push(...changelogValidation.warnings);
  }

  return {
    modulePath,
    moduleName,
    hasVersion,
    hasMetadata,
    hasChangelog,
    versionValid,
    metadataValid,
    changelogValid,
    errors,
    warnings
  };
}

/**
 * Validate metadata.json structure
 * @param metadataFile Path to metadata.json
 * @returns Validation result
 */
function validateMetadataJson(metadataFile: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const content = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));

    // Required fields
    if (!content.version) errors.push('metadata.json missing required field: version');
    if (!content.name) errors.push('metadata.json missing required field: name');
    if (!content.displayName) errors.push('metadata.json missing required field: displayName');
    if (!content.description) errors.push('metadata.json missing required field: description');
    if (!content.type) errors.push('metadata.json missing required field: type');

    // Validate version format
    if (content.version && !isValidSemanticVersion(content.version)) {
      errors.push(`metadata.json has invalid version format: ${content.version}`);
    }

    // Optional but recommended fields
    if (!content.tags || content.tags.length === 0) {
      warnings.push('metadata.json missing tags array');
    }

    if (!content.compatibility) {
      warnings.push('metadata.json missing compatibility section');
    }

    return { valid: errors.length === 0, errors, warnings };
  } catch (error) {
    errors.push(`Failed to parse metadata.json: ${error instanceof Error ? error.message : error}`);
    return { valid: false, errors, warnings };
  }
}

/**
 * Validate CHANGELOG.md format (keep-a-changelog)
 * @param changelogFile Path to CHANGELOG.md
 * @returns Validation result
 */
function validateChangelog(changelogFile: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    const content = fs.readFileSync(changelogFile, 'utf-8');

    // Check for required sections
    if (!content.includes('# Changelog')) {
      warnings.push('CHANGELOG.md missing "# Changelog" header');
    }

    // Check for version entries
    const versionPattern = /## \[(\d+\.\d+\.\d+)\]/g;
    const versions = content.match(versionPattern);

    if (!versions || versions.length === 0) {
      warnings.push('CHANGELOG.md has no version entries');
    }

    return { valid: errors.length === 0, errors, warnings };
  } catch (error) {
    errors.push(`Failed to read CHANGELOG.md: ${error instanceof Error ? error.message : error}`);
    return { valid: false, errors, warnings };
  }
}

/**
 * Find all module directories (containing module.json)
 * @param baseDir Base directory to search
 * @returns Array of module directory paths
 */
function findModuleDirectories(baseDir: string): string[] {
  const results: string[] = [];

  function scan(dir: string) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Check if this directory has module.json
        if (fs.existsSync(path.join(fullPath, 'module.json'))) {
          results.push(fullPath);
        } else {
          // Recursively scan subdirectories
          scan(fullPath);
        }
      }
    }
  }

  scan(baseDir);
  return results;
}

/**
 * Generate validation report
 * @param result Validation result
 * @returns Formatted report string
 */
export function generateValidationReport(result: VersioningValidationResult): string {
  const lines: string[] = [];

  lines.push('=== Versioning Validation Report ===\n');
  lines.push(`Total modules checked: ${result.modules.length}`);
  lines.push(`Valid: ${result.modules.filter(m => m.errors.length === 0).length}`);
  lines.push(`Errors: ${result.errors.length}`);
  lines.push(`Warnings: ${result.warnings.length}\n`);

  if (result.errors.length > 0) {
    lines.push('ERRORS:');
    result.errors.forEach(e => lines.push(`  - ${e}`));
    lines.push('');
  }

  if (result.warnings.length > 0) {
    lines.push('WARNINGS:');
    result.warnings.forEach(w => lines.push(`  - ${w}`));
    lines.push('');
  }

  lines.push('MODULE DETAILS:');
  result.modules.forEach(m => {
    lines.push(`\n${m.moduleName}:`);
    lines.push(`  VERSION: ${m.hasVersion ? (m.versionValid ? '✓' : '✗') : '✗ (missing)'}`);
    lines.push(`  metadata.json: ${m.hasMetadata ? (m.metadataValid ? '✓' : '✗') : '✗ (missing)'}`);
    lines.push(`  CHANGELOG.md: ${m.hasChangelog ? (m.changelogValid ? '✓' : '✗') : '✗ (missing)'}`);
  });

  return lines.join('\n');
}

