/**
 * Unit Tests: Category Selection
 * 
 * Tests for category selection mechanism and rule loading.
 * Covers GOL.4.1.2 - Category Selection Tests
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const MODULE_ROOT = join(__dirname, '../..');

describe('Category Selection', () => {
  const categories = [
    'web',
    'microservices',
    'cli',
    'cloud',
    'distributed',
    'devops',
    'api'
  ];

  describe('Category Directories', () => {
    categories.forEach(category => {
      it(`should have ${category} rules directory`, () => {
        const categoryPath = join(MODULE_ROOT, 'rules', category);
        expect(existsSync(categoryPath)).toBe(true);
      });
    });
  });

  describe('Category Rules', () => {
    it('should have web category rules', () => {
      const webPath = join(MODULE_ROOT, 'rules/web');
      const files = readdirSync(webPath);
      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.endsWith('.md'))).toBe(true);
    });

    it('should have microservices category rules', () => {
      const microPath = join(MODULE_ROOT, 'rules/microservices');
      const files = readdirSync(microPath);
      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.endsWith('.md'))).toBe(true);
    });

    it('should have cli category rules', () => {
      const cliPath = join(MODULE_ROOT, 'rules/cli');
      const files = readdirSync(cliPath);
      expect(files.length).toBeGreaterThan(0);
      expect(files.some(f => f.endsWith('.md'))).toBe(true);
    });
  });

  describe('Category Examples', () => {
    it('should have web examples', () => {
      const webExamplePath = join(MODULE_ROOT, 'examples/web');
      expect(existsSync(webExamplePath)).toBe(true);
    });

    it('should have microservices examples', () => {
      const microExamplePath = join(MODULE_ROOT, 'examples/microservices');
      expect(existsSync(microExamplePath)).toBe(true);
    });

    it('should have cli examples', () => {
      const cliExamplePath = join(MODULE_ROOT, 'examples/cli');
      expect(existsSync(cliExamplePath)).toBe(true);
    });
  });

  describe('Category Templates', () => {
    it('should have web-service template', () => {
      const templatePath = join(MODULE_ROOT, 'templates/web-service.md');
      expect(existsSync(templatePath)).toBe(true);
    });

    it('should have microservice template', () => {
      const templatePath = join(MODULE_ROOT, 'templates/microservice.md');
      expect(existsSync(templatePath)).toBe(true);
    });

    it('should have cli-tool template', () => {
      const templatePath = join(MODULE_ROOT, 'templates/cli-tool.md');
      expect(existsSync(templatePath)).toBe(true);
    });
  });

  describe('Category Metadata', () => {
    it('should have category descriptions in module.json', () => {
      const modulePath = join(MODULE_ROOT, 'module.json');
      const content = require(modulePath);

      categories.forEach(category => {
        expect(content.categories).toContain(category);
      });
    });
  });

  describe('Rule Loading', () => {
    it('should load universal rules for all categories', () => {
      const universalPath = join(MODULE_ROOT, 'rules/universal');
      const files = readdirSync(universalPath);
      
      const expectedRules = [
        'naming-conventions.md',
        'error-handling.md',
        'concurrency.md',
        'testing.md',
        'code-organization.md',
        'documentation.md',
        'performance.md'
      ];

      expectedRules.forEach(rule => {
        expect(files).toContain(rule);
      });
    });

    it('should have category-specific rules separate from universal', () => {
      const webPath = join(MODULE_ROOT, 'rules/web');
      const webFiles = readdirSync(webPath);
      
      const universalPath = join(MODULE_ROOT, 'rules/universal');
      const universalFiles = readdirSync(universalPath);

      // Web rules should not duplicate universal rules
      const overlap = webFiles.filter(f => universalFiles.includes(f));
      expect(overlap.length).toBe(0);
    });
  });

  describe('Multi-Category Support', () => {
    it('should support selecting multiple categories', () => {
      // Test that multiple category directories can coexist
      const selectedCategories = ['web', 'microservices', 'api'];
      
      selectedCategories.forEach(category => {
        const categoryPath = join(MODULE_ROOT, 'rules', category);
        expect(existsSync(categoryPath)).toBe(true);
      });
    });
  });
});

