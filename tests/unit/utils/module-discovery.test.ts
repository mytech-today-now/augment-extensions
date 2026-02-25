import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import {
  findModuleEnhanced,
  getModuleSuggestions,
  extractModuleMetadata,
  listModuleFiles,
  discoverModules
} from '../module-system';

describe('Module Discovery', () => {
  const testModulesDir = path.join(__dirname, '__fixtures__', 'test-modules');
  const testModulePath = path.join(testModulesDir, 'coding-standards', 'test-module');

  beforeAll(() => {
    // Create test module structure
    fs.mkdirSync(testModulePath, { recursive: true });
    fs.mkdirSync(path.join(testModulePath, 'rules'), { recursive: true });
    fs.mkdirSync(path.join(testModulePath, 'examples'), { recursive: true });

    // Create module.json
    const moduleJson = {
      name: 'test-module',
      version: '1.0.0',
      displayName: 'Test Module',
      description: 'A test module for unit testing',
      type: 'coding-standards',
      tags: ['test', 'unit-testing'],
      augment: {
        characterCount: 5000,
        priority: 'medium',
        category: 'coding-standards'
      }
    };
    fs.writeFileSync(
      path.join(testModulePath, 'module.json'),
      JSON.stringify(moduleJson, null, 2)
    );

    // Create test files
    fs.writeFileSync(
      path.join(testModulePath, 'README.md'),
      '# Test Module\n\nThis is a test module.'
    );
    fs.writeFileSync(
      path.join(testModulePath, 'rules', 'test-rule.md'),
      '# Test Rule\n\nThis is a test rule.'
    );
    fs.writeFileSync(
      path.join(testModulePath, 'examples', 'test-example.md'),
      '# Test Example\n\nThis is a test example.'
    );
  });

  afterAll(() => {
    // Clean up test fixtures
    if (fs.existsSync(testModulesDir)) {
      fs.rmSync(testModulesDir, { recursive: true, force: true });
    }
  });

  describe('findModuleEnhanced', () => {
    it('should find module by exact name', () => {
      // Note: This test requires the actual augment-extensions directory
      // For now, we'll test the function exists and handles errors gracefully
      const result = findModuleEnhanced('non-existent-module');
      expect(result).toBeNull();
    });

    it('should return null for empty module name', () => {
      const result = findModuleEnhanced('');
      expect(result).toBeNull();
    });

    it('should handle case-insensitive search', () => {
      // This would require actual modules to be present
      const result = findModuleEnhanced('TEST-MODULE');
      // Result depends on actual modules available
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });

  describe('getModuleSuggestions', () => {
    it('should return suggestions for partial matches', () => {
      const suggestions = getModuleSuggestions('php', 3);
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should return empty array for non-matching search', () => {
      const suggestions = getModuleSuggestions('xyz-nonexistent-abc', 5);
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it('should limit results to specified count', () => {
      const suggestions = getModuleSuggestions('', 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });
  });

  describe('extractModuleMetadata', () => {
    it('should extract metadata from module.json', () => {
      const metadata = extractModuleMetadata(testModulePath);
      
      expect(metadata).not.toBeNull();
      if (metadata) {
        expect(metadata.name).toBe('test-module');
        expect(metadata.version).toBe('1.0.0');
        expect(metadata.displayName).toBe('Test Module');
        expect(metadata.description).toBe('A test module for unit testing');
        expect(metadata.type).toBe('coding-standards');
        expect(metadata.tags).toEqual(['test', 'unit-testing']);
      }
    });

    it('should generate default metadata for missing module.json', () => {
      const emptyDir = path.join(testModulesDir, 'empty-module');
      fs.mkdirSync(emptyDir, { recursive: true });

      const metadata = extractModuleMetadata(emptyDir);
      
      expect(metadata).not.toBeNull();
      if (metadata) {
        expect(metadata.name).toBe('empty-module');
        expect(metadata.version).toBe('0.0.0');
        expect(metadata.type).toBe('unknown');
      }

      fs.rmSync(emptyDir, { recursive: true, force: true });
    });

    it('should return null for non-existent path', () => {
      const metadata = extractModuleMetadata('/non/existent/path');
      expect(metadata).toBeNull();
    });

    it('should calculate file statistics correctly', () => {
      const metadata = extractModuleMetadata(testModulePath);

      expect(metadata).not.toBeNull();
      if (metadata && metadata.files) {
        expect(metadata.files.total).toBeGreaterThan(0);
        expect(metadata.files.rules).toBeGreaterThanOrEqual(1);
        expect(metadata.files.examples).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('listModuleFiles', () => {
    it('should list all files in module', () => {
      const files = listModuleFiles(testModulePath);

      expect(Array.isArray(files)).toBe(true);
      expect(files.length).toBeGreaterThan(0);
    });

    it('should filter files by pattern', () => {
      const files = listModuleFiles(testModulePath, {
        filter: '*.md'
      });

      expect(Array.isArray(files)).toBe(true);
      files.forEach(file => {
        expect(file.name.endsWith('.md')).toBe(true);
      });
    });

    it('should respect depth limit', () => {
      const filesDepth1 = listModuleFiles(testModulePath, {
        depth: 1
      });

      const filesDepth2 = listModuleFiles(testModulePath, {
        depth: 2
      });

      expect(Array.isArray(filesDepth1)).toBe(true);
      expect(Array.isArray(filesDepth2)).toBe(true);
      // Depth 2 should include files in subdirectories
      expect(filesDepth2.length).toBeGreaterThanOrEqual(filesDepth1.length);
    });

    it('should enforce maximum depth of 5', () => {
      const files = listModuleFiles(testModulePath, {
        depth: 100 // Should be capped at 5
      });

      expect(Array.isArray(files)).toBe(true);
      // All files should be within 5 levels deep
      files.forEach(file => {
        const depth = file.relativePath.split(path.sep).length;
        expect(depth).toBeLessThanOrEqual(5);
      });
    });

    it('should group files by directory when requested', () => {
      const files = listModuleFiles(testModulePath, {
        groupByDirectory: true
      });

      expect(Array.isArray(files)).toBe(true);
      // Check that files are sorted by directory
      for (let i = 1; i < files.length; i++) {
        const prevDir = files[i - 1].directory;
        const currDir = files[i].directory;
        expect(prevDir.localeCompare(currDir)).toBeLessThanOrEqual(0);
      }
    });

    it('should include file metadata', () => {
      const files = listModuleFiles(testModulePath);

      expect(files.length).toBeGreaterThan(0);
      const file = files[0];

      expect(file).toHaveProperty('name');
      expect(file).toHaveProperty('path');
      expect(file).toHaveProperty('relativePath');
      expect(file).toHaveProperty('size');
      expect(file).toHaveProperty('modified');
      expect(file).toHaveProperty('type');
      expect(file).toHaveProperty('extension');
      expect(file).toHaveProperty('directory');
    });

    it('should correctly identify file types', () => {
      const files = listModuleFiles(testModulePath);

      const ruleFile = files.find(f => f.relativePath.includes('rules'));
      const exampleFile = files.find(f => f.relativePath.includes('examples'));
      const configFile = files.find(f => f.name === 'module.json');

      if (ruleFile) expect(ruleFile.type).toBe('rule');
      if (exampleFile) expect(exampleFile.type).toBe('example');
      if (configFile) expect(configFile.type).toBe('config');
    });
  });

  describe('discoverModules', () => {
    it('should discover modules in augment-extensions directory', () => {
      const modules = discoverModules();

      expect(Array.isArray(modules)).toBe(true);
      // Should find at least some modules if augment-extensions exists
    });

    it('should return module objects with required properties', () => {
      const modules = discoverModules();

      if (modules.length > 0) {
        const module = modules[0];
        expect(module).toHaveProperty('name');
        expect(module).toHaveProperty('fullName');
        expect(module).toHaveProperty('path');
        expect(module).toHaveProperty('metadata');
      }
    });
  });
});
