/**
 * Unit Tests for ConfigurationManager
 * Tests configuration loading, validation, merging, and hot-reload
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ConfigurationManager } from '../../src/config-manager';
import { Configuration } from '../../src/types';

describe('ConfigurationManager', () => {
  let tempDir: string;
  let configManager: ConfigurationManager;

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = path.join(__dirname, '../fixtures/temp-config');
    await fs.mkdir(tempDir, { recursive: true });
    await fs.mkdir(path.join(tempDir, '.augment'), { recursive: true });
    
    configManager = new ConfigurationManager(tempDir);
  });

  afterEach(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('load()', () => {
    it('should load default configuration when no user config exists', async () => {
      const config = await configManager.load();
      
      expect(config).toBeDefined();
      expect(config.c_standards).toBeDefined();
      expect(config.c_standards.version).toBe('1.0.0');
      expect(config.c_standards.categories).toContain('systems');
    });

    it('should load and merge JSON configuration', async () => {
      const userConfig: Configuration = {
        c_standards: {
          version: '1.0.0',
          categories: ['embedded', 'realtime'],
          c_standard: 'c99',
          universal_rules: {
            naming: 'enabled',
            memory_safety: 'enabled',
            error_handling: 'warning',
            documentation: 'enabled',
            header_guards: 'enabled',
            const_correctness: 'warning'
          },
          category_overrides: {
            embedded: {
              allow_dynamic_allocation: false
            }
          },
          static_analysis: {
            clang_tidy: true,
            cppcheck: true,
            valgrind: false
          },
          custom_rules: {
            enabled: false,
            path: '.augment/c-standards/custom-rules/'
          }
        }
      };

      await fs.writeFile(
        path.join(tempDir, '.augment/c-standards.json'),
        JSON.stringify(userConfig, null, 2)
      );

      const config = await configManager.load();
      
      expect(config.c_standards.categories).toEqual(['embedded', 'realtime']);
      expect(config.c_standards.c_standard).toBe('c99');
      expect(config.c_standards.universal_rules?.error_handling).toBe('warning');
    });

    it('should load and merge YAML configuration', async () => {
      const yamlConfig = `
c_standards:
  version: "1.0.0"
  categories:
    - kernel
    - drivers
  c_standard: c11
  universal_rules:
    naming: enabled
    memory_safety: enabled
    error_handling: enabled
    documentation: warning
    header_guards: enabled
    const_correctness: enabled
`;

      await fs.writeFile(
        path.join(tempDir, '.augment/c-standards.yaml'),
        yamlConfig
      );

      const config = await configManager.load();
      
      expect(config.c_standards.categories).toEqual(['kernel', 'drivers']);
      expect(config.c_standards.c_standard).toBe('c11');
    });

    it('should throw error for invalid JSON', async () => {
      await fs.writeFile(
        path.join(tempDir, '.augment/c-standards.json'),
        '{ invalid json }'
      );

      await expect(configManager.load()).rejects.toThrow('Failed to parse JSON configuration');
    });

    it('should throw error for invalid schema', async () => {
      const invalidConfig = {
        c_standards: {
          version: '1.0.0',
          categories: 'not-an-array', // Should be array
          c_standard: 'c11'
        }
      };

      await fs.writeFile(
        path.join(tempDir, '.augment/c-standards.json'),
        JSON.stringify(invalidConfig)
      );

      await expect(configManager.load()).rejects.toThrow('Invalid configuration');
    });
  });

  describe('validateConfiguration()', () => {
    it('should validate correct configuration', async () => {
      await configManager.load();
      const config = configManager.getConfiguration();
      const result = configManager.validateConfiguration(config);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about inactive category overrides', async () => {
      const config: Configuration = {
        c_standards: {
          version: '1.0.0',
          categories: ['systems'],
          c_standard: 'c11',
          universal_rules: {
            naming: 'enabled',
            memory_safety: 'enabled',
            error_handling: 'enabled',
            documentation: 'enabled',
            header_guards: 'enabled',
            const_correctness: 'enabled'
          },
          category_overrides: {
            embedded: { // Not in active categories
              allow_dynamic_allocation: false
            }
          },
          static_analysis: {
            clang_tidy: false,
            cppcheck: false,
            valgrind: false
          },
          custom_rules: {
            enabled: false,
            path: '.augment/c-standards/custom-rules/'
          }
        }
      };

      await configManager.load();
      const result = configManager.validateConfiguration(config);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('embedded');
    });
  });

  describe('getConfiguration()', () => {
    it('should return loaded configuration', async () => {
      await configManager.load();
      const config = configManager.getConfiguration();

      expect(config).toBeDefined();
      expect(config.c_standards).toBeDefined();
    });

    it('should throw error if configuration not loaded', () => {
      const newManager = new ConfigurationManager(tempDir);
      expect(() => newManager.getConfiguration()).toThrow('Configuration not loaded');
    });
  });

  describe('isRuleEnabled()', () => {
    beforeEach(async () => {
      await configManager.load();
    });

    it('should return true for enabled rules', () => {
      expect(configManager.isRuleEnabled('universal-naming')).toBe(true);
      expect(configManager.isRuleEnabled('universal-memory_safety')).toBe(true);
    });

    it('should return true for warning rules', async () => {
      const config: Configuration = {
        c_standards: {
          version: '1.0.0',
          categories: ['systems'],
          c_standard: 'c11',
          universal_rules: {
            naming: 'warning',
            memory_safety: 'enabled',
            error_handling: 'enabled',
            documentation: 'enabled',
            header_guards: 'enabled',
            const_correctness: 'enabled'
          },
          category_overrides: {},
          static_analysis: { clang_tidy: false, cppcheck: false, valgrind: false },
          custom_rules: { enabled: false, path: '' }
        }
      };

      await fs.writeFile(
        path.join(tempDir, '.augment/c-standards.json'),
        JSON.stringify(config)
      );

      await configManager.load();
      expect(configManager.isRuleEnabled('universal-naming')).toBe(true);
    });
  });

  describe('getRuleSeverity()', () => {
    beforeEach(async () => {
      await configManager.load();
    });

    it('should return ERROR for enabled rules', () => {
      expect(configManager.getRuleSeverity('universal-naming')).toBe('ERROR');
    });

    it('should return WARNING for warning rules', async () => {
      const config: Configuration = {
        c_standards: {
          version: '1.0.0',
          categories: ['systems'],
          c_standard: 'c11',
          universal_rules: {
            naming: 'warning',
            memory_safety: 'enabled',
            error_handling: 'enabled',
            documentation: 'enabled',
            header_guards: 'enabled',
            const_correctness: 'enabled'
          },
          category_overrides: {},
          static_analysis: { clang_tidy: false, cppcheck: false, valgrind: false },
          custom_rules: { enabled: false, path: '' }
        }
      };

      await fs.writeFile(
        path.join(tempDir, '.augment/c-standards.json'),
        JSON.stringify(config)
      );

      await configManager.load();
      expect(configManager.getRuleSeverity('universal-naming')).toBe('WARNING');
    });
  });

  describe('reload()', () => {
    it('should reload configuration', async () => {
      await configManager.load();
      const config1 = configManager.getConfiguration();

      // Modify configuration file
      const newConfig: Configuration = {
        c_standards: {
          ...config1.c_standards,
          categories: ['networking']
        }
      };

      await fs.writeFile(
        path.join(tempDir, '.augment/c-standards.json'),
        JSON.stringify(newConfig)
      );

      await configManager.reload();
      const config2 = configManager.getConfiguration();

      expect(config2.c_standards.categories).toEqual(['networking']);
    });

    it('should notify watchers on reload', async () => {
      await configManager.load();

      let notified = false;
      configManager.watch((config) => {
        notified = true;
      });

      await configManager.reload();
      expect(notified).toBe(true);
    });
  });

  describe('watch()', () => {
    it('should register watcher callback', async () => {
      await configManager.load();

      const callback = jest.fn();
      configManager.watch(callback);

      await configManager.reload();
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('dispose()', () => {
    it('should clean up resources', async () => {
      await configManager.load();
      configManager.watch(() => {});

      configManager.dispose();

      // Should not throw
      expect(() => configManager.dispose()).not.toThrow();
    });
  });
});

