/**
 * Unit Tests for Inspection Handlers
 * Tests the extensible handler system for module inspection
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  BaseInspectionHandler,
  DefaultInspectionHandler,
  HandlerOptions,
  HandlerResult
} from '../inspection-handlers';
import { Module } from '../module-system';

describe('Inspection Handlers', () => {
  describe('BaseInspectionHandler', () => {
    class TestHandler extends BaseInspectionHandler {
      id = 'test-handler';
      supportedTypes = ['test-type', 'another-type'];
      priority = 5;

      async handle(module: Module, options: HandlerOptions): Promise<HandlerResult> {
        return {
          success: true,
          data: { test: 'data' },
          metadata: {
            handlerId: this.id,
            moduleType: module.metadata.type
          }
        };
      }
    }

    it('should support specified module types', () => {
      const handler = new TestHandler();
      
      expect(handler.supports('test-type')).toBe(true);
      expect(handler.supports('another-type')).toBe(true);
      expect(handler.supports('unsupported-type')).toBe(false);
    });

    it('should have correct priority', () => {
      const handler = new TestHandler();
      expect(handler.priority).toBe(5);
    });

    it('should have unique handler ID', () => {
      const handler = new TestHandler();
      expect(handler.id).toBe('test-handler');
    });
  });

  describe('DefaultInspectionHandler', () => {
    let handler: DefaultInspectionHandler;
    let mockModule: Module;

    beforeEach(() => {
      handler = new DefaultInspectionHandler();
      mockModule = {
        fullName: 'test/module',
        metadata: {
          name: 'module',
          version: '1.0.0',
          type: 'coding-standards',
          description: 'Test module'
        },
        rules: ['rule1.md', 'rule2.md'],
        examples: ['example1.ts', 'example2.ts'],
        path: '/test/path'
      } as Module;
    });

    it('should support all module types', () => {
      expect(handler.supports('coding-standards')).toBe(true);
      expect(handler.supports('domain-rules')).toBe(true);
      expect(handler.supports('workflows')).toBe(true);
      expect(handler.supports('any-type')).toBe(true);
    });

    it('should have lowest priority', () => {
      expect(handler.priority).toBe(-1);
    });

    it('should handle module successfully', async () => {
      const result = await handler.handle(mockModule, {});

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.module).toBe('test/module');
      expect(result.data.type).toBe('coding-standards');
      expect(result.data.version).toBe('1.0.0');
      expect(result.data.description).toBe('Test module');
    });

    it('should include rules and examples in result', async () => {
      const result = await handler.handle(mockModule, {});

      expect(result.data.rules).toEqual(['rule1.md', 'rule2.md']);
      expect(result.data.examples).toEqual(['example1.ts', 'example2.ts']);
    });

    it('should include metadata in result', async () => {
      const result = await handler.handle(mockModule, {});

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.handlerId).toBe('default-handler');
      expect(result.metadata?.moduleType).toBe('coding-standards');
      expect(result.metadata?.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors gracefully', async () => {
      const invalidModule = null as any;
      
      const result = await handler.handle(invalidModule, {});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metadata?.handlerId).toBe('default-handler');
    });

    it('should respect handler options', async () => {
      const options: HandlerOptions = {
        format: 'json',
        depth: 3,
        filter: '*.md'
      };

      const result = await handler.handle(mockModule, options);

      expect(result.success).toBe(true);
      // Options are passed but not used by default handler
      // Custom handlers would use these options
    });

    it('should measure processing time', async () => {
      const result = await handler.handle(mockModule, {});

      expect(result.metadata?.processingTime).toBeDefined();
      expect(result.metadata?.processingTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata?.processingTime).toBeLessThan(1000); // Should be fast
    });
  });
});

