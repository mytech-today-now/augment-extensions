import * as fs from 'fs';
import * as path from 'path';
import {
  parseSemanticVersion,
  compareSemanticVersions,
  isValidSemanticVersion,
  type SemanticVersion
} from '../utils/module-system';

/**
 * Version metadata interface
 */
export interface VersionMetadata {
  version: string;
  publishedAt?: Date;
  deprecated?: boolean;
  deprecationMessage?: string;
  breaking?: boolean;
  changelog?: string;
}

/**
 * Version cache entry
 */
interface VersionCacheEntry {
  metadata: VersionMetadata;
  timestamp: number;
}

/**
 * VersionManager class
 * Manages module versions including loading, caching, and comparison
 */
export class VersionManager {
  private cache: Map<string, VersionCacheEntry> = new Map();
  private cacheTTL: number = 3600000; // 1 hour in milliseconds

  /**
   * Get version metadata for a module
   * @param modulePath Path to the module directory
   * @returns Version metadata or null if not found
   */
  getVersion(modulePath: string): VersionMetadata | null {
    // Check cache first
    const cached = this.cache.get(modulePath);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.metadata;
    }

    // Load from VERSION file
    const versionFile = path.join(modulePath, 'VERSION');
    if (!fs.existsSync(versionFile)) {
      return null;
    }

    try {
      const version = fs.readFileSync(versionFile, 'utf-8').trim();
      
      if (!isValidSemanticVersion(version)) {
        return null;
      }

      // Load additional metadata if available
      const metadataFile = path.join(modulePath, 'metadata.json');
      let metadata: VersionMetadata = { version };

      if (fs.existsSync(metadataFile)) {
        const metadataContent = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'));
        metadata = {
          version,
          publishedAt: metadataContent.publishedAt ? new Date(metadataContent.publishedAt) : undefined,
          deprecated: metadataContent.deprecated || false,
          deprecationMessage: metadataContent.deprecationMessage,
          breaking: metadataContent.breaking || false,
          changelog: metadataContent.changelog
        };
      }

      // Cache the result
      this.cache.set(modulePath, {
        metadata,
        timestamp: Date.now()
      });

      return metadata;
    } catch (error) {
      return null;
    }
  }

  /**
   * Set version for a module
   * @param modulePath Path to the module directory
   * @param version Version string (must be valid semver)
   * @returns True if successful, false otherwise
   */
  setVersion(modulePath: string, version: string): boolean {
    if (!isValidSemanticVersion(version)) {
      return false;
    }

    try {
      const versionFile = path.join(modulePath, 'VERSION');
      fs.writeFileSync(versionFile, version + '\n', 'utf-8');

      // Invalidate cache
      this.cache.delete(modulePath);

      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Compare two versions
   * @param v1 First version string
   * @param v2 Second version string
   * @returns -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
   */
  compareVersions(v1: string, v2: string): number {
    return compareSemanticVersions(v1, v2);
  }

  /**
   * Parse version string into components
   * @param version Version string
   * @returns Parsed semantic version or null if invalid
   */
  parseVersion(version: string): SemanticVersion | null {
    return parseSemanticVersion(version);
  }

  /**
   * Check if version is deprecated
   * @param modulePath Path to the module directory
   * @returns True if deprecated, false otherwise
   */
  isDeprecated(modulePath: string): boolean {
    const metadata = this.getVersion(modulePath);
    return metadata?.deprecated || false;
  }

  /**
   * Clear version cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Set cache TTL
   * @param ttl Time to live in milliseconds
   */
  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl;
  }
}

