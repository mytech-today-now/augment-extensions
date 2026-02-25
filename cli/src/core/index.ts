/**
 * Core module exports
 * Provides version management, resolution, and compatibility checking
 */

export { VersionManager, type VersionMetadata } from './version-manager';
export { VersionResolver, type VersionStrategy, type VersionResolutionResult } from './version-resolver';
export {
  CompatibilityChecker,
  type CompatibilityResult,
  type VersionCheckResult,
  type CompatibilityMetadata
} from './compatibility-checker';

