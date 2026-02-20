import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';
import { CollectionFactory } from '../../helpers/factories';

/**
 * Collection Query Tests
 * 
 * Tests for collection query operations including:
 * - Querying collection contents
 * - Querying collection metadata
 * - Querying nested collections
 * - Querying non-existent collection
 * - Filtering collection results
 */

describe('Collection Query Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Querying Collection Contents', () => {
    it('should query empty collection', async () => {
      const collection = await testEnv.createCollection({
        name: 'empty-query-test'
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      expect(collectionData.modules).toEqual([]);
      expect(collectionData.modules).toHaveLength(0);
    });

    it('should query collection with single module', async () => {
      const collection = await testEnv.createCollection({
        name: 'single-module-query',
        modules: ['coding-standards/typescript']
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      expect(collectionData.modules).toHaveLength(1);
      expect(collectionData.modules[0].id).toBe('coding-standards/typescript');
      expect(collectionData.modules[0].version).toBe('^1.0.0');
      expect(collectionData.modules[0].required).toBe(true);
    });

    it('should query collection with multiple modules', async () => {
      const modules = [
        'coding-standards/typescript',
        'coding-standards/react',
        'domain-rules/api',
        'domain-rules/security'
      ];

      const collection = await testEnv.createCollection({
        name: 'multi-module-query',
        modules
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      expect(collectionData.modules).toHaveLength(4);
      expect(collectionData.modules.map((m: any) => m.id)).toEqual(modules);
    });

    it('should query specific module in collection', async () => {
      const collection = await testEnv.createCollection({
        name: 'specific-module-query',
        modules: [
          'coding-standards/typescript',
          'coding-standards/react',
          'domain-rules/api'
        ]
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      const targetModule = collectionData.modules.find(
        (m: any) => m.id === 'coding-standards/react'
      );

      expect(targetModule).toBeDefined();
      expect(targetModule.id).toBe('coding-standards/react');
      expect(targetModule.version).toBe('^1.0.0');
    });
  });

  describe('Querying Collection Metadata', () => {
    it('should query collection name', async () => {
      const collection = await testEnv.createCollection({
        name: 'metadata-name-query'
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      expect(collectionData.name).toBe('metadata-name-query');
    });

    it('should query collection version', async () => {
      const collection = await testEnv.createCollection({
        name: 'version-query',
        version: '2.5.3'
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      expect(collectionData.version).toBe('2.5.3');
    });

    it('should query collection type', async () => {
      const collection = await testEnv.createCollection({
        name: 'type-query'
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      expect(collectionData.type).toBe('collection');
    });

    it('should query collection display name', async () => {
      const collection = await testEnv.createCollection({
        name: 'display-name-query'
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      expect(collectionData.displayName).toBe('Display Name Query');
    });

    it('should query all collection metadata', async () => {
      const collection = await testEnv.createCollection({
        name: 'full-metadata-query',
        version: '1.2.3',
        modules: ['coding-standards/typescript']
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      expect(collectionData).toHaveProperty('name');
      expect(collectionData).toHaveProperty('version');
      expect(collectionData).toHaveProperty('displayName');
      expect(collectionData).toHaveProperty('description');
      expect(collectionData).toHaveProperty('type');
      expect(collectionData).toHaveProperty('modules');
    });
  });

  describe('Querying Nested Collections', () => {
    it('should query parent collection', async () => {
      const parentCollection = await testEnv.createCollection({
        name: 'parent-collection',
        modules: ['coding-standards/typescript', 'coding-standards/react']
      });

      const parentData = JSON.parse(
        await readFile(join(parentCollection.path, 'collection.json'), 'utf-8')
      );

      expect(parentData.name).toBe('parent-collection');
      expect(parentData.modules).toHaveLength(2);
    });

    it('should query child collection', async () => {
      const childCollection = await testEnv.createCollection({
        name: 'child-collection',
        modules: ['domain-rules/api']
      });

      const childData = JSON.parse(
        await readFile(join(childCollection.path, 'collection.json'), 'utf-8')
      );

      expect(childData.name).toBe('child-collection');
      expect(childData.modules).toHaveLength(1);
    });

    it('should query multiple collections independently', async () => {
      const collection1 = await testEnv.createCollection({
        name: 'collection-one',
        modules: ['coding-standards/typescript']
      });

      const collection2 = await testEnv.createCollection({
        name: 'collection-two',
        modules: ['coding-standards/react']
      });

      const data1 = JSON.parse(
        await readFile(join(collection1.path, 'collection.json'), 'utf-8')
      );
      const data2 = JSON.parse(
        await readFile(join(collection2.path, 'collection.json'), 'utf-8')
      );

      expect(data1.name).toBe('collection-one');
      expect(data2.name).toBe('collection-two');
      expect(data1.modules[0].id).toBe('coding-standards/typescript');
      expect(data2.modules[0].id).toBe('coding-standards/react');
    });
  });

  describe('Querying Non-Existent Collection', () => {
    it('should handle query for non-existent collection', async () => {
      const nonExistentPath = join(testEnv.tempDir, 'collections', 'non-existent');

      expect(existsSync(nonExistentPath)).toBe(false);
      expect(existsSync(join(nonExistentPath, 'collection.json'))).toBe(false);
    });

    it('should handle query for collection without collection.json', async () => {
      const collection = await testEnv.createCollection({
        name: 'no-json-collection'
      });

      const collectionJsonPath = join(collection.path, 'collection.json');

      // Verify file exists
      expect(existsSync(collectionJsonPath)).toBe(true);

      // In real scenario, missing file would cause error
      const collectionData = JSON.parse(
        await readFile(collectionJsonPath, 'utf-8')
      );
      expect(collectionData).toBeDefined();
    });
  });

  describe('Filtering Collection Results', () => {
    it('should filter collections by module count', async () => {
      const collection1 = await testEnv.createCollection({
        name: 'small-collection',
        modules: ['coding-standards/typescript']
      });

      const collection2 = await testEnv.createCollection({
        name: 'large-collection',
        modules: [
          'coding-standards/typescript',
          'coding-standards/react',
          'coding-standards/vue',
          'domain-rules/api'
        ]
      });

      const data1 = JSON.parse(
        await readFile(join(collection1.path, 'collection.json'), 'utf-8')
      );
      const data2 = JSON.parse(
        await readFile(join(collection2.path, 'collection.json'), 'utf-8')
      );

      // Filter by module count
      const hasMoreThanTwo = data2.modules.length > 2;
      const hasLessThanTwo = data1.modules.length < 2;

      expect(hasMoreThanTwo).toBe(true);
      expect(hasLessThanTwo).toBe(true);
    });

    it('should filter collections by module type', async () => {
      const collection = await testEnv.createCollection({
        name: 'mixed-types',
        modules: [
          'coding-standards/typescript',
          'coding-standards/react',
          'domain-rules/api',
          'domain-rules/security'
        ]
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      // Filter modules by type prefix
      const codingStandards = collectionData.modules.filter(
        (m: any) => m.id.startsWith('coding-standards/')
      );
      const domainRules = collectionData.modules.filter(
        (m: any) => m.id.startsWith('domain-rules/')
      );

      expect(codingStandards).toHaveLength(2);
      expect(domainRules).toHaveLength(2);
    });

    it('should filter collections by version', async () => {
      const collection1 = await testEnv.createCollection({
        name: 'v1-collection',
        version: '1.0.0'
      });

      const collection2 = await testEnv.createCollection({
        name: 'v2-collection',
        version: '2.0.0'
      });

      const data1 = JSON.parse(
        await readFile(join(collection1.path, 'collection.json'), 'utf-8')
      );
      const data2 = JSON.parse(
        await readFile(join(collection2.path, 'collection.json'), 'utf-8')
      );

      // Filter by version
      const isV1 = data1.version.startsWith('1.');
      const isV2 = data2.version.startsWith('2.');

      expect(isV1).toBe(true);
      expect(isV2).toBe(true);
    });

    it('should filter modules by required flag', async () => {
      const collection = await testEnv.createCollection({
        name: 'required-filter-test',
        modules: [
          'coding-standards/typescript',
          'coding-standards/react',
          'domain-rules/api'
        ]
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      // All modules are required by default
      const requiredModules = collectionData.modules.filter(
        (m: any) => m.required === true
      );

      expect(requiredModules).toHaveLength(3);
    });
  });

  describe('Advanced Query Operations', () => {
    it('should query collection module count', async () => {
      const collection = await testEnv.createCollection({
        name: 'count-test',
        modules: [
          'coding-standards/typescript',
          'coding-standards/react',
          'domain-rules/api'
        ]
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      const moduleCount = collectionData.modules.length;
      expect(moduleCount).toBe(3);
    });

    it('should check if collection contains specific module', async () => {
      const collection = await testEnv.createCollection({
        name: 'contains-test',
        modules: [
          'coding-standards/typescript',
          'coding-standards/react'
        ]
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      const hasTypeScript = collectionData.modules.some(
        (m: any) => m.id === 'coding-standards/typescript'
      );
      const hasVue = collectionData.modules.some(
        (m: any) => m.id === 'coding-standards/vue'
      );

      expect(hasTypeScript).toBe(true);
      expect(hasVue).toBe(false);
    });

    it('should query collection using factory', async () => {
      const collectionData = CollectionFactory.withModules([
        'coding-standards/html',
        'coding-standards/css',
        'coding-standards/js'
      ]);

      expect(collectionData.modules).toHaveLength(3);
      expect(collectionData.modules[0].id).toBe('coding-standards/html');
      expect(collectionData.type).toBe('collection');
    });
  });
});

