/**
 * Tests for configuration loading and validation
 */

import { sampleConfigs, validateConfig, createTempConfig, cleanupTempFiles } from './test-utils';

describe('Configuration Validation', () => {
  describe('Valid Configurations', () => {
    test('should validate single genre configuration', () => {
      const result = validateConfig(sampleConfigs.singleGenre);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate hybrid genre configuration', () => {
      const result = validateConfig(sampleConfigs.hybridGenre);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate multiple themes configuration', () => {
      const result = validateConfig(sampleConfigs.multipleThemes);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate full features configuration', () => {
      const result = validateConfig(sampleConfigs.fullFeatures);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate all disabled configuration', () => {
      const result = validateConfig(sampleConfigs.allDisabled);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid Configurations', () => {
    test('should reject missing screenplay_enhancements', () => {
      const result = validateConfig({});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing screenplay_enhancements object');
    });

    test('should reject missing features object', () => {
      const result = validateConfig({
        screenplay_enhancements: {
          enabled: true
        }
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing features object');
    });

    test('should reject invalid enabled flag', () => {
      const result = validateConfig({
        screenplay_enhancements: {
          enabled: 'yes',
          features: {
            genres: { enabled: true, selected: [] },
            themes: { enabled: true, selected: [] },
            styles: { enabled: true, selected: [] }
          }
        }
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('screenplay_enhancements.enabled must be boolean');
    });

    test('should reject missing genre configuration', () => {
      const result = validateConfig({
        screenplay_enhancements: {
          enabled: true,
          features: {
            themes: { enabled: true, selected: [] },
            styles: { enabled: true, selected: [] }
          }
        }
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing genres configuration');
    });

    test('should reject non-array selected field', () => {
      const result = validateConfig({
        screenplay_enhancements: {
          enabled: true,
          features: {
            genres: { enabled: true, selected: 'action' },
            themes: { enabled: true, selected: [] },
            styles: { enabled: true, selected: [] }
          }
        }
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('genres.selected must be array');
    });
  });
});

describe('Configuration File Operations', () => {
  let tempConfigPath: string;

  afterEach(() => {
    if (tempConfigPath) {
      cleanupTempFiles(tempConfigPath);
    }
  });

  test('should create temporary config file', () => {
    tempConfigPath = createTempConfig(sampleConfigs.singleGenre);
    expect(tempConfigPath).toBeTruthy();
    
    const fs = require('fs');
    expect(fs.existsSync(tempConfigPath)).toBe(true);
  });

  test('should write valid JSON to config file', () => {
    tempConfigPath = createTempConfig(sampleConfigs.fullFeatures);
    
    const fs = require('fs');
    const content = fs.readFileSync(tempConfigPath, 'utf-8');
    const parsed = JSON.parse(content);
    
    expect(parsed).toEqual(sampleConfigs.fullFeatures);
  });

  test('should clean up temporary files', () => {
    tempConfigPath = createTempConfig(sampleConfigs.singleGenre);
    
    const fs = require('fs');
    expect(fs.existsSync(tempConfigPath)).toBe(true);
    
    cleanupTempFiles(tempConfigPath);
    expect(fs.existsSync(tempConfigPath)).toBe(false);
  });
});

describe('Feature Selection Logic', () => {
  test('should handle single genre selection', () => {
    const config = sampleConfigs.singleGenre;
    expect(config.screenplay_enhancements.features.genres.selected).toHaveLength(1);
    expect(config.screenplay_enhancements.features.genres.selected[0]).toBe('action');
  });

  test('should handle hybrid genre mode', () => {
    const config = sampleConfigs.hybridGenre;
    expect(config.screenplay_enhancements.features.genres.hybridMode).toBe(true);
    expect(config.screenplay_enhancements.features.genres.selected).toHaveLength(2);
  });

  test('should handle primary theme selection', () => {
    const config = sampleConfigs.multipleThemes;
    expect(config.screenplay_enhancements.features.themes.primaryTheme).toBe('redemption');
    expect(config.screenplay_enhancements.features.themes.selected).toContain('redemption');
  });

  test('should handle integration level', () => {
    const config = sampleConfigs.fullFeatures;
    expect(config.screenplay_enhancements.features.themes.integrationLevel).toBe('prominent');
  });
});

