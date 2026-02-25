import * as fs from 'fs';
import * as path from 'path';
import {
  compareSemanticVersions,
  satisfiesVersionRange,
  isValidSemanticVersion
} from '../utils/module-system';
import { VersionManager } from './version-manager';

/**
 * Version resolution strategy
 */
export type VersionStrategy = 'latest' | 'specific' | 'range';

/**
 * Version resolution result
 */
export interface VersionResolutionResult {
  version: string;
  path: string;
  strategy: VersionStrategy;
  available: string[];
}

/**
 * VersionResolver class
 * Resolves module versions using different strategies
 */
export class VersionResolver {
  private versionManager: VersionManager;

  constructor(versionManager?: VersionManager) {
    this.versionManager = versionManager || new VersionManager();
  }

  /**
   * Resolve latest version of a module
   * @param modulePath Base path to the module (without version)
   * @returns Resolution result or null if not found
   */
  resolveLatest(modulePath: string): VersionResolutionResult | null {
    const versions = this.getAvailableVersions(modulePath);
    
    if (versions.length === 0) {
      return null;
    }

    // Sort versions in descending order
    const sorted = versions.sort((a, b) => compareSemanticVersions(b, a));
    const latestVersion = sorted[0];

    return {
      version: latestVersion,
      path: this.getVersionedPath(modulePath, latestVersion),
      strategy: 'latest',
      available: versions
    };
  }

  /**
   * Resolve specific version of a module
   * @param modulePath Base path to the module
   * @param version Specific version to resolve
   * @returns Resolution result or null if not found
   */
  resolveSpecific(modulePath: string, version: string): VersionResolutionResult | null {
    if (!isValidSemanticVersion(version)) {
      return null;
    }

    const versions = this.getAvailableVersions(modulePath);
    
    if (!versions.includes(version)) {
      return null;
    }

    return {
      version,
      path: this.getVersionedPath(modulePath, version),
      strategy: 'specific',
      available: versions
    };
  }

  /**
   * Resolve version matching a range
   * @param modulePath Base path to the module
   * @param range Version range (e.g., ^1.0.0, ~2.1.0, >=1.5.0)
   * @returns Resolution result or null if no matching version found
   */
  resolveRange(modulePath: string, range: string): VersionResolutionResult | null {
    const versions = this.getAvailableVersions(modulePath);
    
    // Filter versions that satisfy the range
    const matching = versions.filter(v => satisfiesVersionRange(v, range));
    
    if (matching.length === 0) {
      return null;
    }

    // Sort matching versions in descending order and pick the latest
    const sorted = matching.sort((a, b) => compareSemanticVersions(b, a));
    const resolvedVersion = sorted[0];

    return {
      version: resolvedVersion,
      path: this.getVersionedPath(modulePath, resolvedVersion),
      strategy: 'range',
      available: versions
    };
  }

  /**
   * Resolve version using automatic strategy detection
   * @param modulePath Base path to the module
   * @param versionSpec Version specification (latest, 1.0.0, ^1.0.0, etc.)
   * @returns Resolution result or null if not found
   */
  resolve(modulePath: string, versionSpec: string = 'latest'): VersionResolutionResult | null {
    // Latest version
    if (versionSpec === 'latest' || versionSpec === '*') {
      return this.resolveLatest(modulePath);
    }

    // Specific version (no range operators)
    if (isValidSemanticVersion(versionSpec) && !versionSpec.match(/^[~^<>=]/)) {
      return this.resolveSpecific(modulePath, versionSpec);
    }

    // Range version
    return this.resolveRange(modulePath, versionSpec);
  }

  /**
   * Get all available versions for a module
   * @param modulePath Base path to the module
   * @returns Array of version strings
   */
  private getAvailableVersions(modulePath: string): string[] {
    const versions: string[] = [];

    // Check for VERSION file in the module directory
    const versionFile = path.join(modulePath, 'VERSION');
    if (fs.existsSync(versionFile)) {
      const version = fs.readFileSync(versionFile, 'utf-8').trim();
      if (isValidSemanticVersion(version)) {
        versions.push(version);
      }
    }

    // TODO: In the future, support multiple versions in a versions/ directory
    // For now, we only support a single VERSION file per module

    return versions;
  }

  /**
   * Get versioned path for a module
   * @param modulePath Base path to the module
   * @param version Version string
   * @returns Full path including version
   */
  private getVersionedPath(modulePath: string, version: string): string {
    // For now, return the base path since we only support single versions
    // In the future, this could return modulePath/versions/v1.0.0
    return modulePath;
  }
}

