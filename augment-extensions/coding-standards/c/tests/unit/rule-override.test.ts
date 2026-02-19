/**
 * Unit Tests for RuleOverrideSystem
 * Tests rule override application, validation, and management
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { RuleOverrideSystem } from '../../src/rule-override';
import { RuleRegistry } from '../../src/registry';
import { ConfigurationManager } from '../../src/config-manager';

describe('RuleOverrideSystem', () => {
  let tempDir: string;
  let rulesPath: string;
  let configPath: string;
  let registry: RuleRegistry;
  let configManager: ConfigurationManager;
  let overrideSystem: RuleOverrideSystem;

  beforeEach(async () => {
    // Create temporary directories
    tempDir = path.join(__dirname, '../fixtures/temp-overrides');
    rulesPath = path.join(tempDir, 'rules');
    configPath = tempDir;
    
    await fs.mkdir(path.join(rulesPath, 'universal'), { recursive: true });
    await fs.mkdir(path.join(configPath, '.augment'), { recursive: true });
    
    // Create sample rules
    await createSampleRules();
    
    // Initialize components
    registry = new RuleRegistry(rulesPath);
    await registry.loadRules();
    
    configManager = new ConfigurationManager(configPath);
    await configManager.load();
    
    overrideSystem = new RuleOverrideSystem(registry, configManager);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  async function createSampleRules() {
    const namingRule = `# Rule: Naming Conventions

## Metadata
- **ID**: universal-naming
- **Category**: universal
- **Severity**: ERROR

## Description
Use snake_case for functions and variables.
`;

    await fs.writeFile(path.join(rulesPath, 'universal/naming.md'), namingRule);
  }

  describe('applyOverride()', () => {
    it('should apply severity override', () => {
      overrideSystem.applyOverride('universal-naming', {
        severity: 'WARNING'
      });
      
      const rule = registry.getRule('universal-naming');
      expect(rule?.severity).toBe('WARNING');
    });

    it('should apply enabled override', () => {
      overrideSystem.applyOverride('universal-naming', {
        enabled: false
      });
      
      const rule = registry.getRule('universal-naming');
      expect(rule?.enabled).toBe(false);
    });

    it('should apply multiple overrides', () => {
      overrideSystem.applyOverride('universal-naming', {
        severity: 'WARNING',
        enabled: false
      });
      
      const rule = registry.getRule('universal-naming');
      expect(rule?.severity).toBe('WARNING');
      expect(rule?.enabled).toBe(false);
    });

    it('should throw error for non-existent rule', () => {
      expect(() => {
        overrideSystem.applyOverride('nonexistent-rule', {
          severity: 'WARNING'
        });
      }).toThrow('Rule not found');
    });
  });

  describe('removeOverride()', () => {
    it('should remove override and restore original', () => {
      const originalRule = registry.getRule('universal-naming');
      const originalSeverity = originalRule?.severity;
      
      overrideSystem.applyOverride('universal-naming', {
        severity: 'WARNING'
      });
      
      overrideSystem.removeOverride('universal-naming');
      
      const rule = registry.getRule('universal-naming');
      expect(rule?.severity).toBe(originalSeverity);
    });

    it('should handle removing non-existent override', () => {
      expect(() => {
        overrideSystem.removeOverride('universal-naming');
      }).not.toThrow();
    });
  });

  describe('getOverride()', () => {
    it('should return override for rule', () => {
      overrideSystem.applyOverride('universal-naming', {
        severity: 'WARNING'
      });
      
      const override = overrideSystem.getOverride('universal-naming');
      
      expect(override).toBeDefined();
      expect(override?.severity).toBe('WARNING');
    });

    it('should return undefined for non-overridden rule', () => {
      const override = overrideSystem.getOverride('universal-naming');
      expect(override).toBeUndefined();
    });
  });

  describe('getAllOverrides()', () => {
    it('should return all active overrides', () => {
      overrideSystem.applyOverride('universal-naming', {
        severity: 'WARNING'
      });
      
      const overrides = overrideSystem.getAllOverrides();
      
      expect(Object.keys(overrides).length).toBeGreaterThan(0);
      expect(overrides['universal-naming']).toBeDefined();
    });

    it('should return empty object when no overrides', () => {
      const overrides = overrideSystem.getAllOverrides();
      expect(Object.keys(overrides).length).toBe(0);
    });
  });

  describe('validateOverride()', () => {
    it('should validate correct override', () => {
      const result = overrideSystem.validateOverride('universal-naming', {
        severity: 'WARNING'
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid severity', () => {
      const result = overrideSystem.validateOverride('universal-naming', {
        severity: 'INVALID' as any
      });
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject override for non-existent rule', () => {
      const result = overrideSystem.validateOverride('nonexistent-rule', {
        severity: 'WARNING'
      });
      
      expect(result.valid).toBe(false);
    });
  });

  describe('applyBatchOverrides()', () => {
    it('should apply multiple overrides at once', () => {
      const overrides = {
        'universal-naming': {
          severity: 'WARNING' as const
        }
      };

      overrideSystem.applyBatchOverrides(overrides);

      const rule = registry.getRule('universal-naming');
      expect(rule?.severity).toBe('WARNING');
    });

    it('should validate all overrides before applying', () => {
      const overrides = {
        'universal-naming': {
          severity: 'INVALID' as any
        }
      };

      expect(() => {
        overrideSystem.applyBatchOverrides(overrides);
      }).toThrow();
    });
  });

  describe('clearAllOverrides()', () => {
    it('should clear all overrides', () => {
      overrideSystem.applyOverride('universal-naming', {
        severity: 'WARNING'
      });

      overrideSystem.clearAllOverrides();

      const overrides = overrideSystem.getAllOverrides();
      expect(Object.keys(overrides).length).toBe(0);
    });

    it('should restore original rule values', () => {
      const originalRule = registry.getRule('universal-naming');
      const originalSeverity = originalRule?.severity;

      overrideSystem.applyOverride('universal-naming', {
        severity: 'WARNING'
      });

      overrideSystem.clearAllOverrides();

      const rule = registry.getRule('universal-naming');
      expect(rule?.severity).toBe(originalSeverity);
    });
  });

  describe('exportOverrides()', () => {
    it('should export overrides to JSON', () => {
      overrideSystem.applyOverride('universal-naming', {
        severity: 'WARNING'
      });

      const json = overrideSystem.exportOverrides('json');

      expect(json).toBeDefined();
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('should export overrides to YAML', () => {
      overrideSystem.applyOverride('universal-naming', {
        severity: 'WARNING'
      });

      const yaml = overrideSystem.exportOverrides('yaml');

      expect(yaml).toBeDefined();
      expect(yaml.length).toBeGreaterThan(0);
    });
  });

  describe('importOverrides()', () => {
    it('should import overrides from JSON', () => {
      const json = JSON.stringify({
        'universal-naming': {
          severity: 'WARNING'
        }
      });

      overrideSystem.importOverrides(json, 'json');

      const rule = registry.getRule('universal-naming');
      expect(rule?.severity).toBe('WARNING');
    });

    it('should validate imported overrides', () => {
      const invalidJson = JSON.stringify({
        'universal-naming': {
          severity: 'INVALID'
        }
      });

      expect(() => {
        overrideSystem.importOverrides(invalidJson, 'json');
      }).toThrow();
    });
  });

  describe('hasOverride()', () => {
    it('should return true for overridden rule', () => {
      overrideSystem.applyOverride('universal-naming', {
        severity: 'WARNING'
      });

      expect(overrideSystem.hasOverride('universal-naming')).toBe(true);
    });

    it('should return false for non-overridden rule', () => {
      expect(overrideSystem.hasOverride('universal-naming')).toBe(false);
    });
  });

  describe('getOverrideHistory()', () => {
    it('should track override history', () => {
      overrideSystem.applyOverride('universal-naming', {
        severity: 'WARNING'
      });

      overrideSystem.applyOverride('universal-naming', {
        severity: 'ERROR'
      });

      const history = overrideSystem.getOverrideHistory('universal-naming');

      expect(history).toBeDefined();
      expect(history.length).toBeGreaterThan(0);
    });
  });
});

