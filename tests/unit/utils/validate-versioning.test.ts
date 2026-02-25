import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  validateVersioning,
  validateModuleVersioning,
  generateValidationReport
} from '@cli/utils/validate-versioning';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('validate-versioning', () => {
  let testDir: string;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-versioning-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('validateModuleVersioning', () => {
    it('should report missing VERSION file', () => {
      const result = validateModuleVersioning(testDir);
      
      expect(result.hasVersion).toBe(false);
      expect(result.errors).toContain('Missing VERSION file');
    });

    it('should validate correct VERSION file', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      const result = validateModuleVersioning(testDir);
      
      expect(result.hasVersion).toBe(true);
      expect(result.versionValid).toBe(true);
    });

    it('should report invalid version format', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), 'invalid-version\n');
      
      const result = validateModuleVersioning(testDir);
      
      expect(result.hasVersion).toBe(true);
      expect(result.versionValid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid version format'))).toBe(true);
    });

    it('should warn about missing metadata.json', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      const result = validateModuleVersioning(testDir);
      
      expect(result.hasMetadata).toBe(false);
      expect(result.warnings).toContain('Missing metadata.json file');
    });

    it('should validate correct metadata.json', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      fs.writeFileSync(path.join(testDir, 'metadata.json'), JSON.stringify({
        version: '1.0.0',
        name: 'test-module',
        displayName: 'Test Module',
        description: 'A test module',
        type: 'coding-standards'
      }));
      
      const result = validateModuleVersioning(testDir);
      
      expect(result.hasMetadata).toBe(true);
      expect(result.metadataValid).toBe(true);
    });

    it('should report missing required fields in metadata.json', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      fs.writeFileSync(path.join(testDir, 'metadata.json'), JSON.stringify({
        version: '1.0.0'
        // Missing name, displayName, description, type
      }));
      
      const result = validateModuleVersioning(testDir);
      
      expect(result.hasMetadata).toBe(true);
      expect(result.metadataValid).toBe(false);
      expect(result.errors.some(e => e.includes('missing required field'))).toBe(true);
    });

    it('should warn about missing CHANGELOG.md', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      const result = validateModuleVersioning(testDir);
      
      expect(result.hasChangelog).toBe(false);
      expect(result.warnings).toContain('Missing CHANGELOG.md file');
    });

    it('should validate CHANGELOG.md format', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      fs.writeFileSync(path.join(testDir, 'CHANGELOG.md'), 
        '# Changelog\n\n## [1.0.0] - 2024-01-01\n\n### Added\n- Initial release\n');
      
      const result = validateModuleVersioning(testDir);
      
      expect(result.hasChangelog).toBe(true);
      expect(result.changelogValid).toBe(true);
    });

    it('should warn about missing changelog header', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      fs.writeFileSync(path.join(testDir, 'CHANGELOG.md'), 'Some content without proper header');
      
      const result = validateModuleVersioning(testDir);
      
      expect(result.hasChangelog).toBe(true);
      expect(result.warnings.some(w => w.includes('missing "# Changelog" header'))).toBe(true);
    });
  });

  describe('validateVersioning', () => {
    it('should return error if modules directory does not exist', () => {
      const nonExistentDir = path.join(testDir, 'non-existent');
      const result = validateVersioning(nonExistentDir);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('not found'))).toBe(true);
    });

    it('should validate multiple modules', () => {
      // Create two test modules
      const module1 = path.join(testDir, 'module1');
      const module2 = path.join(testDir, 'module2');
      
      fs.mkdirSync(module1);
      fs.mkdirSync(module2);
      
      // Module 1: valid
      fs.writeFileSync(path.join(module1, 'module.json'), '{}');
      fs.writeFileSync(path.join(module1, 'VERSION'), '1.0.0\n');
      
      // Module 2: invalid version
      fs.writeFileSync(path.join(module2, 'module.json'), '{}');
      fs.writeFileSync(path.join(module2, 'VERSION'), 'invalid\n');
      
      const result = validateVersioning(testDir);
      
      expect(result.modules).toHaveLength(2);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should find nested modules', () => {
      const category = path.join(testDir, 'category');
      const module = path.join(category, 'module');
      
      fs.mkdirSync(category);
      fs.mkdirSync(module);
      
      fs.writeFileSync(path.join(module, 'module.json'), '{}');
      fs.writeFileSync(path.join(module, 'VERSION'), '1.0.0\n');
      
      const result = validateVersioning(testDir);
      
      expect(result.modules).toHaveLength(1);
      expect(result.modules[0].moduleName).toBe('module');
    });
  });

  describe('generateValidationReport', () => {
    it('should generate formatted report', () => {
      const result = {
        valid: true,
        errors: [],
        warnings: ['Warning 1'],
        modules: [
          {
            modulePath: testDir,
            moduleName: 'test-module',
            hasVersion: true,
            hasMetadata: true,
            hasChangelog: true,
            versionValid: true,
            metadataValid: true,
            changelogValid: true,
            errors: [],
            warnings: []
          }
        ]
      };
      
      const report = generateValidationReport(result);
      
      expect(report).toContain('Versioning Validation Report');
      expect(report).toContain('Total modules checked: 1');
      expect(report).toContain('test-module');
    });

    it('should include errors and warnings in report', () => {
      const result = {
        valid: false,
        errors: ['Error 1', 'Error 2'],
        warnings: ['Warning 1'],
        modules: []
      };
      
      const report = generateValidationReport(result);
      
      expect(report).toContain('ERRORS:');
      expect(report).toContain('Error 1');
      expect(report).toContain('Error 2');
      expect(report).toContain('WARNINGS:');
      expect(report).toContain('Warning 1');
    });
  });

  describe('edge cases', () => {
    it('should handle empty modules directory', () => {
      const result = validateVersioning(testDir);
      
      expect(result.valid).toBe(true);
      expect(result.modules).toHaveLength(0);
    });

    it('should handle malformed metadata.json', () => {
      const module = path.join(testDir, 'module');
      fs.mkdirSync(module);
      fs.writeFileSync(path.join(module, 'module.json'), '{}');
      fs.writeFileSync(path.join(module, 'VERSION'), '1.0.0\n');
      fs.writeFileSync(path.join(module, 'metadata.json'), 'invalid json');
      
      const result = validateVersioning(testDir);
      
      expect(result.modules).toHaveLength(1);
      expect(result.modules[0].metadataValid).toBe(false);
      expect(result.errors.some(e => e.includes('Failed to parse'))).toBe(true);
    });
  });
});

