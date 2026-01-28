import * as fs from 'fs';
import * as path from 'path';

/**
 * Module metadata interface
 */
export interface ModuleMetadata {
  name: string;
  version: string;
  displayName: string;
  description: string;
  type: 'coding-standards' | 'domain-rules' | 'workflows' | 'examples';
  tags?: string[];
  augment?: {
    characterCount?: number;
    priority?: 'high' | 'medium' | 'low';
    category?: string;
  };
  installation?: 'required' | 'optional';
  dependencies?: string[];
}

/**
 * Module structure interface
 */
export interface Module {
  metadata: ModuleMetadata;
  path: string;
  fullName: string;
  rules: string[];
  examples: string[];
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Get the modules directory path
 */
export function getModulesDir(): string {
  return path.join(__dirname, '../../../augment-extensions');
}

/**
 * Validate module.json structure
 */
export function validateModuleMetadata(metadata: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!metadata.name) errors.push('Missing required field: name');
  if (!metadata.version) errors.push('Missing required field: version');
  if (!metadata.displayName) errors.push('Missing required field: displayName');
  if (!metadata.description) errors.push('Missing required field: description');
  if (!metadata.type) errors.push('Missing required field: type');

  // Validate type
  const validTypes = ['coding-standards', 'domain-rules', 'workflows', 'examples'];
  if (metadata.type && !validTypes.includes(metadata.type)) {
    errors.push(`Invalid type: ${metadata.type}. Must be one of: ${validTypes.join(', ')}`);
  }

  // Validate version format (semantic versioning)
  if (metadata.version && !isValidSemanticVersion(metadata.version)) {
    errors.push(`Invalid version format: ${metadata.version}. Must follow MAJOR.MINOR.PATCH`);
  }

  // Validate augment.characterCount if present
  if (metadata.augment?.characterCount !== undefined) {
    if (typeof metadata.augment.characterCount !== 'number' || metadata.augment.characterCount < 0) {
      errors.push('augment.characterCount must be a positive number');
    }
  }

  // Validate augment.priority if present
  if (metadata.augment?.priority) {
    const validPriorities = ['high', 'medium', 'low'];
    if (!validPriorities.includes(metadata.augment.priority)) {
      warnings.push(`Invalid priority: ${metadata.augment.priority}. Should be one of: ${validPriorities.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate semantic version format
 * Supports: MAJOR.MINOR.PATCH[-prerelease][+build]
 * Examples: 1.0.0, 1.0.0-alpha, 1.0.0-beta.1, 1.0.0+20130313144700, 1.0.0-beta+exp.sha.5114f85
 */
export function isValidSemanticVersion(version: string): boolean {
  // Full semver pattern with optional pre-release and build metadata
  const semverPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverPattern.test(version);
}

/**
 * Parse semantic version into components
 */
export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

export function parseSemanticVersion(version: string): SemanticVersion | null {
  if (!isValidSemanticVersion(version)) {
    return null;
  }

  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9a-zA-Z-.]+))?(?:\+([0-9a-zA-Z-.]+))?$/);
  if (!match) {
    return null;
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
    build: match[5]
  };
}

/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareSemanticVersions(v1: string, v2: string): number {
  const parsed1 = parseSemanticVersion(v1);
  const parsed2 = parseSemanticVersion(v2);

  if (!parsed1 || !parsed2) {
    throw new Error('Invalid semantic version format');
  }

  // Compare major, minor, patch
  if (parsed1.major !== parsed2.major) {
    return parsed1.major > parsed2.major ? 1 : -1;
  }
  if (parsed1.minor !== parsed2.minor) {
    return parsed1.minor > parsed2.minor ? 1 : -1;
  }
  if (parsed1.patch !== parsed2.patch) {
    return parsed1.patch > parsed2.patch ? 1 : -1;
  }

  // Handle pre-release versions
  // Version without pre-release > version with pre-release
  if (!parsed1.prerelease && parsed2.prerelease) return 1;
  if (parsed1.prerelease && !parsed2.prerelease) return -1;
  if (parsed1.prerelease && parsed2.prerelease) {
    return parsed1.prerelease.localeCompare(parsed2.prerelease);
  }

  // Build metadata is ignored in version precedence
  return 0;
}

/**
 * Check if version satisfies a range (simple implementation)
 * Supports: ^1.0.0 (compatible), ~1.0.0 (patch), >=1.0.0, >1.0.0, <=1.0.0, <1.0.0, 1.0.0 (exact)
 */
export function satisfiesVersionRange(version: string, range: string): boolean {
  const parsed = parseSemanticVersion(version);
  if (!parsed) return false;

  // Exact match
  if (!range.match(/^[~^<>=]/)) {
    return version === range;
  }

  // Caret (^) - compatible with version
  if (range.startsWith('^')) {
    const rangeVersion = range.slice(1);
    const rangeParsed = parseSemanticVersion(rangeVersion);
    if (!rangeParsed) return false;

    if (parsed.major !== rangeParsed.major) return false;
    if (parsed.major === 0) {
      // For 0.x.y, minor version must match
      if (parsed.minor !== rangeParsed.minor) return false;
    }
    return compareSemanticVersions(version, rangeVersion) >= 0;
  }

  // Tilde (~) - patch updates
  if (range.startsWith('~')) {
    const rangeVersion = range.slice(1);
    const rangeParsed = parseSemanticVersion(rangeVersion);
    if (!rangeParsed) return false;

    if (parsed.major !== rangeParsed.major || parsed.minor !== rangeParsed.minor) {
      return false;
    }
    return compareSemanticVersions(version, rangeVersion) >= 0;
  }

  // Comparison operators
  if (range.startsWith('>=')) {
    return compareSemanticVersions(version, range.slice(2)) >= 0;
  }
  if (range.startsWith('>')) {
    return compareSemanticVersions(version, range.slice(1)) > 0;
  }
  if (range.startsWith('<=')) {
    return compareSemanticVersions(version, range.slice(2)) <= 0;
  }
  if (range.startsWith('<')) {
    return compareSemanticVersions(version, range.slice(1)) < 0;
  }

  return false;
}

/**
 * Load module from path
 */
export function loadModule(modulePath: string): Module | null {
  const moduleJsonPath = path.join(modulePath, 'module.json');

  if (!fs.existsSync(moduleJsonPath)) {
    return null;
  }

  try {
    const metadata: ModuleMetadata = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));

    // Get rules
    const rulesDir = path.join(modulePath, 'rules');
    const rules = fs.existsSync(rulesDir)
      ? fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'))
      : [];

    // Get examples
    const examplesDir = path.join(modulePath, 'examples');
    const examples = fs.existsSync(examplesDir)
      ? fs.readdirSync(examplesDir)
      : [];

    // Extract full name from path
    const modulesDir = getModulesDir();
    const relativePath = path.relative(modulesDir, modulePath);
    const fullName = relativePath.replace(/\\/g, '/');

    return {
      metadata,
      path: modulePath,
      fullName,
      rules,
      examples
    };
  } catch (error) {
    return null;
  }
}

/**
 * Discover all modules in the modules directory
 */
export function discoverModules(): Module[] {
  const modules: Module[] = [];
  const modulesDir = getModulesDir();

  if (!fs.existsSync(modulesDir)) {
    return modules;
  }

  const categories = fs.readdirSync(modulesDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const category of categories) {
    const categoryPath = path.join(modulesDir, category);
    const moduleNames = fs.readdirSync(categoryPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const moduleName of moduleNames) {
      const modulePath = path.join(categoryPath, moduleName);
      const module = loadModule(modulePath);

      if (module) {
        modules.push(module);
      }
    }
  }

  return modules;
}

/**
 * Find module by name (supports both "category/module" and "module" formats)
 */
export function findModule(moduleName: string): Module | null {
  const modulesDir = getModulesDir();

  // If moduleName includes category (e.g., "coding-standards/typescript")
  if (moduleName.includes('/')) {
    const modulePath = path.join(modulesDir, moduleName);
    return loadModule(modulePath);
  }

  // Search all categories for the module
  const modules = discoverModules();
  return modules.find(m => m.fullName.endsWith(`/${moduleName}`)) || null;
}

/**
 * Validate module structure
 */
export function validateModuleStructure(modulePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check module.json exists
  const moduleJsonPath = path.join(modulePath, 'module.json');
  if (!fs.existsSync(moduleJsonPath)) {
    errors.push('Missing required file: module.json');
    return { valid: false, errors, warnings };
  }

  // Validate module.json content
  try {
    const metadata = JSON.parse(fs.readFileSync(moduleJsonPath, 'utf-8'));
    const metadataValidation = validateModuleMetadata(metadata);
    errors.push(...metadataValidation.errors);
    warnings.push(...metadataValidation.warnings);
  } catch (error) {
    errors.push(`Invalid JSON in module.json: ${error instanceof Error ? error.message : error}`);
    return { valid: false, errors, warnings };
  }

  // Check README.md exists
  const readmePath = path.join(modulePath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    errors.push('Missing required file: README.md');
  }

  // Check rules directory exists
  const rulesDir = path.join(modulePath, 'rules');
  if (!fs.existsSync(rulesDir)) {
    errors.push('Missing required directory: rules/');
  } else {
    // Check that rules directory has at least one .md file
    const ruleFiles = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md'));
    if (ruleFiles.length === 0) {
      warnings.push('rules/ directory is empty - should contain at least one .md file');
    }
  }

  // Check examples directory (optional, but warn if missing)
  const examplesDir = path.join(modulePath, 'examples');
  if (!fs.existsSync(examplesDir)) {
    warnings.push('Optional directory missing: examples/');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate module category matches directory structure
 */
export function validateModuleCategory(module: Module): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const modulesDir = getModulesDir();
  const relativePath = path.relative(modulesDir, module.path);
  const category = relativePath.split(path.sep)[0];

  if (module.metadata.type !== category) {
    errors.push(`Module type "${module.metadata.type}" does not match directory category "${category}"`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate character count for a module
 */
export function calculateModuleCharacterCount(modulePath: string): number {
  let totalChars = 0;

  function countFilesRecursively(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        countFilesRecursively(fullPath);
      } else if (entry.isFile()) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        totalChars += content.length;
      }
    }
  }

  if (fs.existsSync(modulePath)) {
    countFilesRecursively(modulePath);
  }

  return totalChars;
}

/**
 * Validate module is project-agnostic (no hardcoded paths or URLs)
 */
export function validateProjectAgnostic(modulePath: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Patterns to detect project-specific content
  const pathPatterns = [
    /[A-Z]:\\/g,  // Windows absolute paths (C:\, D:\, etc.)
    /\/home\/[a-zA-Z0-9_-]+\//g,  // Linux home paths
    /\/Users\/[a-zA-Z0-9_-]+\//g,  // macOS home paths
  ];

  const urlPatterns = [
    /https?:\/\/(?!github\.com|npmjs\.com|pypi\.org|crates\.io)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,  // URLs (excluding common registries)
  ];

  function scanFile(filePath: string) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check for hardcoded paths
    for (const pattern of pathPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        warnings.push(`Potential hardcoded path in ${path.basename(filePath)}: ${matches[0]}`);
      }
    }

    // Check for project-specific URLs
    for (const pattern of urlPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        warnings.push(`Potential project-specific URL in ${path.basename(filePath)}: ${matches[0]}`);
      }
    }
  }

  function scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.json'))) {
        scanFile(fullPath);
      }
    }
  }

  if (fs.existsSync(modulePath)) {
    scanDirectory(modulePath);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

