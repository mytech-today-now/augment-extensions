/**
 * Unit Tests: Go Module Structure
 * 
 * Tests for module structure validation, file existence, and metadata correctness.
 * Covers GOL.4.1.1 - Configuration Loading Tests
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const MODULE_ROOT = join(__dirname, '../..');

describe('Go Module Structure', () => {
  describe('Required Files', () => {
    it('should have module.json', () => {
      const modulePath = join(MODULE_ROOT, 'module.json');
      expect(existsSync(modulePath)).toBe(true);
    });

    it('should have README.md', () => {
      const readmePath = join(MODULE_ROOT, 'README.md');
      expect(existsSync(readmePath)).toBe(true);
    });

    it('should have config/schema.json', () => {
      const schemaPath = join(MODULE_ROOT, 'config/schema.json');
      expect(existsSync(schemaPath)).toBe(true);
    });
  });

  describe('Module Metadata', () => {
    it('should have valid module.json structure', () => {
      const modulePath = join(MODULE_ROOT, 'module.json');
      const content = readFileSync(modulePath, 'utf-8');
      const module = JSON.parse(content);

      expect(module.name).toBe('go-coding-standards');
      expect(module.version).toBe('1.0.0');
      expect(module.description).toBeTruthy();
      expect(module.type).toBe('coding-standards');
      expect(module.language).toBe('go');
    });

    it('should have all required categories', () => {
      const modulePath = join(MODULE_ROOT, 'module.json');
      const content = readFileSync(modulePath, 'utf-8');
      const module = JSON.parse(content);

      const expectedCategories = [
        'web',
        'microservices',
        'cli',
        'cloud',
        'distributed',
        'devops',
        'api'
      ];

      expect(module.categories).toBeDefined();
      expectedCategories.forEach(cat => {
        expect(module.categories).toContain(cat);
      });
    });

    it('should have configuration schema reference', () => {
      const modulePath = join(MODULE_ROOT, 'module.json');
      const content = readFileSync(modulePath, 'utf-8');
      const module = JSON.parse(content);

      expect(module.configSchema).toBe('./config/schema.json');
    });
  });

  describe('Directory Structure', () => {
    it('should have rules directory', () => {
      const rulesPath = join(MODULE_ROOT, 'rules');
      expect(existsSync(rulesPath)).toBe(true);
    });

    it('should have examples directory', () => {
      const examplesPath = join(MODULE_ROOT, 'examples');
      expect(existsSync(examplesPath)).toBe(true);
    });

    it('should have templates directory', () => {
      const templatesPath = join(MODULE_ROOT, 'templates');
      expect(existsSync(templatesPath)).toBe(true);
    });

    it('should have config directory', () => {
      const configPath = join(MODULE_ROOT, 'config');
      expect(existsSync(configPath)).toBe(true);
    });

    it('should have universal rules directory', () => {
      const universalPath = join(MODULE_ROOT, 'rules/universal');
      expect(existsSync(universalPath)).toBe(true);
    });
  });

  describe('Universal Rules', () => {
    const universalRules = [
      'naming-conventions.md',
      'error-handling.md',
      'concurrency.md',
      'testing.md',
      'code-organization.md',
      'documentation.md',
      'performance.md'
    ];

    universalRules.forEach(rule => {
      it(`should have ${rule}`, () => {
        const rulePath = join(MODULE_ROOT, 'rules/universal', rule);
        expect(existsSync(rulePath)).toBe(true);
      });
    });
  });

  describe('Configuration Schema', () => {
    it('should have valid JSON schema', () => {
      const schemaPath = join(MODULE_ROOT, 'config/schema.json');
      const content = readFileSync(schemaPath, 'utf-8');
      const schema = JSON.parse(content);

      expect(schema.$schema).toBeTruthy();
      expect(schema.type).toBe('object');
      expect(schema.properties).toBeDefined();
    });

    it('should define categories property', () => {
      const schemaPath = join(MODULE_ROOT, 'config/schema.json');
      const content = readFileSync(schemaPath, 'utf-8');
      const schema = JSON.parse(content);

      expect(schema.properties.categories).toBeDefined();
      expect(schema.properties.categories.type).toBe('array');
    });
  });

  describe('README Content', () => {
    it('should have comprehensive README', () => {
      const readmePath = join(MODULE_ROOT, 'README.md');
      const content = readFileSync(readmePath, 'utf-8');

      expect(content.length).toBeGreaterThan(500);
      expect(content).toContain('# Go Coding Standards');
      expect(content).toContain('## Overview');
      expect(content).toContain('## Categories');
    });
  });
});

