/**
 * Integration Tests: Go Module Integration
 * 
 * Tests for end-to-end module integration with Augment Extensions.
 * Covers GOL.4.2 - Integration Tests
 */

import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const MODULE_ROOT = join(__dirname, '../..');
const AUGMENT_ROOT = join(__dirname, '../../../..');

describe('Module Integration', () => {
  describe('Single Category Selection', () => {
    it('should load web category successfully', () => {
      const webRulesPath = join(MODULE_ROOT, 'rules/web');
      const universalRulesPath = join(MODULE_ROOT, 'rules/universal');
      
      expect(existsSync(webRulesPath)).toBe(true);
      expect(existsSync(universalRulesPath)).toBe(true);
    });

    it('should load microservices category successfully', () => {
      const microRulesPath = join(MODULE_ROOT, 'rules/microservices');
      const universalRulesPath = join(MODULE_ROOT, 'rules/universal');
      
      expect(existsSync(microRulesPath)).toBe(true);
      expect(existsSync(universalRulesPath)).toBe(true);
    });

    it('should load cli category successfully', () => {
      const cliRulesPath = join(MODULE_ROOT, 'rules/cli');
      const universalRulesPath = join(MODULE_ROOT, 'rules/universal');
      
      expect(existsSync(cliRulesPath)).toBe(true);
      expect(existsSync(universalRulesPath)).toBe(true);
    });
  });

  describe('Multiple Category Combinations', () => {
    it('should support web + api combination', () => {
      const webPath = join(MODULE_ROOT, 'rules/web');
      const apiPath = join(MODULE_ROOT, 'rules/api');
      
      expect(existsSync(webPath)).toBe(true);
      expect(existsSync(apiPath)).toBe(true);
    });

    it('should support microservices + distributed combination', () => {
      const microPath = join(MODULE_ROOT, 'rules/microservices');
      const distPath = join(MODULE_ROOT, 'rules/distributed');
      
      expect(existsSync(microPath)).toBe(true);
      expect(existsSync(distPath)).toBe(true);
    });

    it('should support cli + devops combination', () => {
      const cliPath = join(MODULE_ROOT, 'rules/cli');
      const devopsPath = join(MODULE_ROOT, 'rules/devops');
      
      expect(existsSync(cliPath)).toBe(true);
      expect(existsSync(devopsPath)).toBe(true);
    });
  });

  describe('Rule Application Workflow', () => {
    it('should have accessible universal rules', () => {
      const universalPath = join(MODULE_ROOT, 'rules/universal');
      const namingPath = join(universalPath, 'naming-conventions.md');
      const errorPath = join(universalPath, 'error-handling.md');
      
      expect(existsSync(namingPath)).toBe(true);
      expect(existsSync(errorPath)).toBe(true);
      
      const namingContent = readFileSync(namingPath, 'utf-8');
      expect(namingContent).toContain('MixedCaps');
    });

    it('should have accessible category rules', () => {
      const webPath = join(MODULE_ROOT, 'rules/web');
      const files = require('fs').readdirSync(webPath);
      
      expect(files.length).toBeGreaterThan(0);
      files.forEach((file: string) => {
        const filePath = join(webPath, file);
        const content = readFileSync(filePath, 'utf-8');
        expect(content.length).toBeGreaterThan(0);
      });
    });
  });

  describe('AI Prompt Generation', () => {
    it('should have web-service template for AI', () => {
      const templatePath = join(MODULE_ROOT, 'templates/web-service.md');
      expect(existsSync(templatePath)).toBe(true);
      
      const content = readFileSync(templatePath, 'utf-8');
      expect(content).toContain('## Context');
      expect(content).toContain('## Standards');
      expect(content).toContain('## Examples');
    });

    it('should have microservice template for AI', () => {
      const templatePath = join(MODULE_ROOT, 'templates/microservice.md');
      expect(existsSync(templatePath)).toBe(true);
      
      const content = readFileSync(templatePath, 'utf-8');
      expect(content).toContain('gRPC');
      expect(content).toContain('service discovery');
    });

    it('should have cli-tool template for AI', () => {
      const templatePath = join(MODULE_ROOT, 'templates/cli-tool.md');
      expect(existsSync(templatePath)).toBe(true);
      
      const content = readFileSync(templatePath, 'utf-8');
      expect(content).toContain('Cobra');
      expect(content).toContain('command-line');
    });

    it('should reference universal rules in templates', () => {
      const templatePath = join(MODULE_ROOT, 'templates/web-service.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toContain('Naming Conventions');
      expect(content).toContain('Error Handling');
      expect(content).toContain('Testing');
    });
  });

  describe('Module Catalog Integration', () => {
    it('should be listed in augment-extensions', () => {
      const modulePath = join(MODULE_ROOT, 'module.json');
      expect(existsSync(modulePath)).toBe(true);
    });

    it('should have proper module type', () => {
      const modulePath = join(MODULE_ROOT, 'module.json');
      const module = JSON.parse(readFileSync(modulePath, 'utf-8'));
      
      expect(module.type).toBe('coding-standards');
      expect(module.language).toBe('go');
    });
  });

  describe('Configuration Integration', () => {
    it('should have valid configuration schema', () => {
      const schemaPath = join(MODULE_ROOT, 'config/schema.json');
      const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
      
      expect(schema.type).toBe('object');
      expect(schema.properties).toBeDefined();
      expect(schema.properties.categories).toBeDefined();
    });

    it('should have example configurations', () => {
      const examplesPath = join(MODULE_ROOT, 'config/examples');
      expect(existsSync(examplesPath)).toBe(true);
    });
  });
});

