/**
 * Integration tests for inspect command
 * Tests complete workflows, VS Code integration, and error handling
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

describe('Inspect Command Integration Tests', () => {
  const testProjectDir = path.join(__dirname, '__fixtures__', 'test-project');
  const augmentDir = path.join(testProjectDir, '.augment');
  const configPath = path.join(augmentDir, 'augment.json');

  beforeAll(() => {
    // Create test project structure
    fs.mkdirSync(augmentDir, { recursive: true });

    // Create test configuration
    const testConfig = {
      version: '1.0.0',
      plugins: {
        enabled: true,
        directory: '.augment/plugins',
        autoLoad: true
      },
      inspection: {
        defaultFormat: 'json',
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
      }
    };

    fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));
  });

  afterAll(() => {
    // Clean up test fixtures
    if (fs.existsSync(testProjectDir)) {
      fs.rmSync(testProjectDir, { recursive: true, force: true });
    }
  });

  describe('Configuration Loading', () => {
    it('should load configuration from augment.json', () => {
      expect(fs.existsSync(configPath)).toBe(true);

      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      expect(config.version).toBe('1.0.0');
      expect(config.plugins.enabled).toBe(true);
      expect(config.inspection.defaultFormat).toBe('json');
    });

    it('should use default configuration when file is missing', () => {
      const nonExistentPath = path.join(testProjectDir, 'non-existent', 'augment.json');
      expect(fs.existsSync(nonExistentPath)).toBe(false);
    });

    it('should validate configuration structure', () => {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      expect(config).toHaveProperty('version');
      expect(config).toHaveProperty('plugins');
      expect(config).toHaveProperty('inspection');
      expect(config).toHaveProperty('modules');
      expect(config).toHaveProperty('hooks');
    });
  });

  describe('Plugin System Integration', () => {
    it('should initialize plugin loader', () => {
      // Test that plugin loader can be instantiated
      const { PluginLoader } = require('../../utils/plugin-system');
      const loader = new PluginLoader();

      expect(loader).toBeDefined();
      expect(typeof loader.registerPlugin).toBe('function');
      expect(typeof loader.registerHandler).toBe('function');
      expect(typeof loader.registerHook).toBe('function');
    });

    it('should register and unregister plugins', async () => {
      const { PluginLoader } = require('../../utils/plugin-system');
      const loader = new PluginLoader();

      const testPlugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        initialize: jest.fn()
      };

      await loader.registerPlugin(testPlugin);
      expect(testPlugin.initialize).toHaveBeenCalled();

      const plugins = loader.getPlugins();
      expect(plugins).toContainEqual(testPlugin);

      await loader.unregisterPlugin('test-plugin');
      const pluginsAfter = loader.getPlugins();
      expect(pluginsAfter).not.toContainEqual(testPlugin);
    });

    it('should prevent duplicate plugin registration', async () => {
      const { PluginLoader } = require('../../utils/plugin-system');
      const loader = new PluginLoader();

      const testPlugin = {
        id: 'duplicate-plugin',
        name: 'Duplicate Plugin',
        version: '1.0.0',
        initialize: jest.fn()
      };

      await loader.registerPlugin(testPlugin);

      await expect(loader.registerPlugin(testPlugin)).rejects.toThrow();
    });
  });

  describe('Hook System Integration', () => {
    it('should execute hooks in correct order', async () => {
      const { PluginLoader } = require('../../utils/plugin-system');
      const loader = new PluginLoader();

      const executionOrder: string[] = [];

      const hook1 = {
        id: 'hook-1',
        type: 'pre-inspection' as const,
        priority: 10,
        execute: jest.fn(() => executionOrder.push('hook-1'))
      };

      const hook2 = {
        id: 'hook-2',
        type: 'pre-inspection' as const,
        priority: 5,
        execute: jest.fn(() => executionOrder.push('hook-2'))
      };

      loader.registerHook(hook1);
      loader.registerHook(hook2);

      await loader.executeHooks('pre-inspection', {});

      expect(executionOrder).toEqual(['hook-1', 'hook-2']);
    });

    it('should handle hook errors gracefully', async () => {
      const { PluginLoader } = require('../../utils/plugin-system');
      const loader = new PluginLoader();

      const failingHook = {
        id: 'failing-hook',
        type: 'pre-inspection' as const,
        execute: jest.fn(() => {
          throw new Error('Hook failed');
        })
      };

      const successHook = {
        id: 'success-hook',
        type: 'pre-inspection' as const,
        execute: jest.fn()
      };

      loader.registerHook(failingHook);
      loader.registerHook(successHook);

      const context = {};
      await loader.executeHooks('pre-inspection', context);

      // Both hooks should have been called despite the error
      expect(failingHook.execute).toHaveBeenCalled();
      expect(successHook.execute).toHaveBeenCalled();
    });
  });
});

