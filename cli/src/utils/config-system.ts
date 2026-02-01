/**
 * Configuration System for Augment Extensions
 * Provides configuration file support with validation and defaults
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Configuration interface
 */
export interface AugmentConfig {
  /** Configuration version */
  version: string;
  /** Plugin configuration */
  plugins?: {
    /** Enable/disable plugins */
    enabled?: boolean;
    /** Plugin directory */
    directory?: string;
    /** Auto-load plugins */
    autoLoad?: boolean;
  };
  /** Inspection configuration */
  inspection?: {
    /** Default output format */
    defaultFormat?: 'text' | 'json' | 'markdown';
    /** Enable caching */
    cache?: boolean;
    /** Cache TTL in seconds */
    cacheTTL?: number;
    /** Max depth for recursive inspection */
    maxDepth?: number;
  };
  /** Module configuration */
  modules?: {
    /** Module search paths */
    searchPaths?: string[];
    /** Auto-discover modules */
    autoDiscover?: boolean;
  };
  /** Hook configuration */
  hooks?: {
    /** Enable/disable hooks */
    enabled?: boolean;
    /** Hook timeout in milliseconds */
    timeout?: number;
  };
  /** Custom handlers */
  handlers?: {
    /** Handler configurations */
    [key: string]: any;
  };
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: AugmentConfig = {
  version: '1.0.0',
  plugins: {
    enabled: true,
    directory: '.augment/plugins',
    autoLoad: true
  },
  inspection: {
    defaultFormat: 'text',
    cache: true,
    cacheTTL: 3600,
    maxDepth: 5
  },
  modules: {
    searchPaths: ['augment-extensions'],
    autoDiscover: true
  },
  hooks: {
    enabled: true,
    timeout: 5000
  },
  handlers: {}
};

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration manager
 */
export class ConfigManager {
  private config: AugmentConfig;
  private configPath: string;

  constructor(configPath: string = '.augment/augment.json') {
    this.configPath = configPath;
    this.config = DEFAULT_CONFIG;
  }

  /**
   * Load configuration from file
   */
  load(): AugmentConfig {
    if (!fs.existsSync(this.configPath)) {
      return this.config;
    }

    try {
      const fileContent = fs.readFileSync(this.configPath, 'utf-8');
      const loadedConfig = JSON.parse(fileContent);

      // Merge with defaults
      this.config = this.mergeConfig(DEFAULT_CONFIG, loadedConfig);

      return this.config;
    } catch (error) {
      console.error(`Failed to load configuration from ${this.configPath}:`, error);
      return this.config;
    }
  }

  /**
   * Save configuration to file
   */
  save(config?: AugmentConfig): void {
    const configToSave = config || this.config;

    // Ensure directory exists
    const dir = path.dirname(this.configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.configPath, JSON.stringify(configToSave, null, 2) + '\n');
  }

  /**
   * Get current configuration
   */
  getConfig(): AugmentConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<AugmentConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
  }

  /**
   * Validate configuration
   */
  validate(config: AugmentConfig = this.config): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate version
    if (!config.version) {
      errors.push('Missing required field: version');
    }

    // Validate inspection format
    if (config.inspection?.defaultFormat) {
      const validFormats = ['text', 'json', 'markdown'];
      if (!validFormats.includes(config.inspection.defaultFormat)) {
        errors.push(`Invalid inspection.defaultFormat: ${config.inspection.defaultFormat}. Must be one of: ${validFormats.join(', ')}`);
      }
    }

    // Validate cache TTL
    if (config.inspection?.cacheTTL !== undefined) {
      if (typeof config.inspection.cacheTTL !== 'number' || config.inspection.cacheTTL < 0) {
        errors.push('inspection.cacheTTL must be a positive number');
      }
    }

    // Validate max depth
    if (config.inspection?.maxDepth !== undefined) {
      if (typeof config.inspection.maxDepth !== 'number' || config.inspection.maxDepth < 1 || config.inspection.maxDepth > 10) {
        errors.push('inspection.maxDepth must be a number between 1 and 10');
      }
    }

    // Validate hook timeout
    if (config.hooks?.timeout !== undefined) {
      if (typeof config.hooks.timeout !== 'number' || config.hooks.timeout < 0) {
        errors.push('hooks.timeout must be a positive number');
      }
    }

    // Validate plugin directory
    if (config.plugins?.directory) {
      if (typeof config.plugins.directory !== 'string') {
        errors.push('plugins.directory must be a string');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate default configuration file
   */
  generateDefault(): void {
    this.save(DEFAULT_CONFIG);
  }

  /**
   * Merge two configurations (deep merge)
   */
  private mergeConfig(base: AugmentConfig, override: Partial<AugmentConfig>): AugmentConfig {
    return {
      version: override.version || base.version,
      plugins: {
        ...base.plugins,
        ...override.plugins
      },
      inspection: {
        ...base.inspection,
        ...override.inspection
      },
      modules: {
        ...base.modules,
        ...override.modules,
        searchPaths: override.modules?.searchPaths || base.modules?.searchPaths
      },
      hooks: {
        ...base.hooks,
        ...override.hooks
      },
      handlers: {
        ...base.handlers,
        ...override.handlers
      }
    };
  }

  /**
   * Get configuration value by path
   */
  get(path: string): any {
    const parts = path.split('.');
    let value: any = this.config;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Set configuration value by path
   */
  set(path: string, value: any): void {
    const parts = path.split('.');
    let current: any = this.config;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current) || typeof current[part] !== 'object') {
        current[part] = {};
      }
      current = current[part];
    }

    current[parts[parts.length - 1]] = value;
  }
}

/**
 * Global configuration manager instance
 */
export const configManager = new ConfigManager();

