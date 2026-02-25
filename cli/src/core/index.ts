/**
 * Core module exports
 * Provides version management, resolution, compatibility checking, and module loading
 */

export { VersionManager, type VersionMetadata } from './version-manager';
export { VersionResolver, type VersionStrategy, type VersionResolutionResult } from './version-resolver';
export {
  CompatibilityChecker,
  type CompatibilityResult,
  type VersionCheckResult,
  type CompatibilityMetadata
} from './compatibility-checker';
export {
  ModuleLoader,
  type ModuleLoadOptions,
  type ModuleLoadResult
} from './module-loader';

