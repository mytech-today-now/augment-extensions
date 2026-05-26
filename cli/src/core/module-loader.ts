import { VersionManager, type VersionMetadata } from './version-manager';
import { VersionResolver, type VersionResolutionResult } from './version-resolver';
import { loadModule, type Module } from '../utils/module-system';

interface ModuleCacheEntry {
  module: Module;
  version: string;
  metadata: VersionMetadata;
  timestamp: number;
}

export interface ModuleLoadOptions {
  version?: string;
  useCache?: boolean;
  cacheTTL?: number;
}

export interface ModuleLoadResult {
  module: Module;
  version: string;
  metadata: VersionMetadata;
  resolution: VersionResolutionResult;
}

export class ModuleLoader {
  private versionManager: VersionManager;
  private versionResolver: VersionResolver;
  private cache = new Map<string, ModuleCacheEntry>();
  private cacheTTL = 3600000;

  constructor(versionManager?: VersionManager, versionResolver?: VersionResolver) {
    this.versionManager = versionManager || new VersionManager();
    this.versionResolver = versionResolver || new VersionResolver(this.versionManager);
  }

  load(modulePath: string, options: ModuleLoadOptions = {}): ModuleLoadResult | null {
    const { version = 'latest', useCache = true, cacheTTL } = options;

    if (cacheTTL !== undefined) {
      this.cacheTTL = cacheTTL;
    }

    const cacheKey = this.getCacheKey(modulePath, version);
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
        return {
          module: cached.module,
          version: cached.version,
          metadata: cached.metadata,
          resolution: {
            version: cached.version,
            path: modulePath,
            strategy: version === 'latest' ? 'latest' : 'specific',
            available: [cached.version]
          }
        };
      }
    }

    const resolution = this.versionResolver.resolve(modulePath, version);
    if (!resolution) {
      return null;
    }

    const module = loadModule(resolution.path);
    if (!module) {
      return null;
    }

    const metadata = this.versionManager.getVersion(resolution.path);
    if (!metadata) {
      return null;
    }

    const result: ModuleLoadResult = {
      module,
      version: resolution.version,
      metadata,
      resolution
    };

    if (useCache) {
      this.cache.set(cacheKey, {
        module,
        version: resolution.version,
        metadata,
        timestamp: Date.now()
      });
    }

    return result;
  }

  getVersionMetadata(modulePath: string): VersionMetadata | null {
    return this.versionManager.getVersion(modulePath);
  }

  getAvailableVersions(modulePath: string): string[] {
    const resolution = this.versionResolver.resolveLatest(modulePath);
    return resolution?.available || [];
  }

  clearCache(modulePath?: string): void {
    if (!modulePath) {
      this.cache.clear();
      return;
    }

    for (const key of Array.from(this.cache.keys())) {
      if (key.startsWith(`${modulePath}:`)) {
        this.cache.delete(key);
      }
    }
  }

  setCacheTTL(ttl: number): void {
    this.cacheTTL = ttl;
  }

  private getCacheKey(modulePath: string, version: string): string {
    return `${modulePath}:${version}`;
  }
}