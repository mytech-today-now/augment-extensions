import * as fs from 'fs';
import * as path from 'path';
import { compareSemanticVersions, satisfiesVersionRange } from '../utils/module-system';
import { execSync } from 'child_process';

/**
 * Compatibility check result
 */
export interface CompatibilityResult {
  compatible: boolean;
  errors: string[];
  warnings: string[];
  deprecations: string[];
  details: {
    typescript?: VersionCheckResult;
    node?: VersionCheckResult;
    augment?: VersionCheckResult;
  };
}

/**
 * Version check result for a specific runtime
 */
export interface VersionCheckResult {
  required: string;
  current: string;
  compatible: boolean;
  message?: string;
}

/**
 * Module compatibility metadata
 */
export interface CompatibilityMetadata {
  augmentMinVersion?: string;
  nodeMinVersion?: string;
  typescriptMinVersion?: string;
  deprecated?: boolean;
  deprecationMessage?: string;
  breaking?: boolean;
}

/**
 * CompatibilityChecker class
 * Validates module compatibility with runtime environment
 */
export class CompatibilityChecker {
  private nodeVersion: string;
  private typescriptVersion: string | null;

  constructor() {
    this.nodeVersion = process.version.replace('v', '');
    this.typescriptVersion = this.detectTypeScriptVersion();
  }

  /**
   * Check compatibility of a module
   * @param modulePath Path to the module directory
   * @returns Compatibility check result
   */
  checkCompatibility(modulePath: string): CompatibilityResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const deprecations: string[] = [];
    const details: CompatibilityResult['details'] = {};

    // Load module metadata
    const metadata = this.loadCompatibilityMetadata(modulePath);

    if (!metadata) {
      warnings.push('No compatibility metadata found');
      return {
        compatible: true,
        errors,
        warnings,
        deprecations,
        details
      };
    }

    // Check deprecation
    if (metadata.deprecated) {
      deprecations.push(metadata.deprecationMessage || 'This module is deprecated');
    }

    // Check breaking changes
    if (metadata.breaking) {
      warnings.push('This version contains breaking changes');
    }

    // Check Node.js version
    if (metadata.nodeMinVersion) {
      const nodeCheck = this.checkNodeVersion(metadata.nodeMinVersion);
      details.node = nodeCheck;
      if (!nodeCheck.compatible) {
        errors.push(nodeCheck.message || 'Node.js version incompatible');
      }
    }

    // Check TypeScript version
    if (metadata.typescriptMinVersion) {
      const tsCheck = this.checkTypeScriptVersion(metadata.typescriptMinVersion);
      details.typescript = tsCheck;
      if (!tsCheck.compatible) {
        warnings.push(tsCheck.message || 'TypeScript version may be incompatible');
      }
    }

    // Check Augment version (if available)
    if (metadata.augmentMinVersion) {
      // TODO: Implement Augment version detection
      details.augment = {
        required: metadata.augmentMinVersion,
        current: 'unknown',
        compatible: true,
        message: 'Augment version check not implemented'
      };
    }

    return {
      compatible: errors.length === 0,
      errors,
      warnings,
      deprecations,
      details
    };
  }

  /**
   * Check Node.js version compatibility
   * @param requiredVersion Minimum required Node.js version
   * @returns Version check result
   */
  private checkNodeVersion(requiredVersion: string): VersionCheckResult {
    const compatible = compareSemanticVersions(this.nodeVersion, requiredVersion) >= 0;

    return {
      required: requiredVersion,
      current: this.nodeVersion,
      compatible,
      message: compatible
        ? undefined
        : `Node.js ${requiredVersion} or higher required (current: ${this.nodeVersion})`
    };
  }

  /**
   * Check TypeScript version compatibility
   * @param requiredVersion Minimum required TypeScript version
   * @returns Version check result
   */
  private checkTypeScriptVersion(requiredVersion: string): VersionCheckResult {
    if (!this.typescriptVersion) {
      return {
        required: requiredVersion,
        current: 'not installed',
        compatible: false,
        message: `TypeScript ${requiredVersion} or higher required (not installed)`
      };
    }

    const compatible = compareSemanticVersions(this.typescriptVersion, requiredVersion) >= 0;

    return {
      required: requiredVersion,
      current: this.typescriptVersion,
      compatible,
      message: compatible
        ? undefined
        : `TypeScript ${requiredVersion} or higher required (current: ${this.typescriptVersion})`
    };
  }

  /**
   * Load compatibility metadata from module
   * @param modulePath Path to the module directory
   * @returns Compatibility metadata or null
   */
  private loadCompatibilityMetadata(modulePath: string): CompatibilityMetadata | null {
    const metadataFile = path.join(modulePath, 'metadata.json');

    if (!fs.existsSync(metadataFile)) {
      return null;
    }

    try {
      const content = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
      return content.compatibility || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Detect installed TypeScript version
   * @returns TypeScript version string or null if not installed
   */
  private detectTypeScriptVersion(): string | null {
    try {
      const output = execSync('tsc --version', { encoding: 'utf-8', stdio: 'pipe' });
      const match = output.match(/Version (\d+\.\d+\.\d+)/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }
}

