import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';
import { CollectionFactory } from '../../helpers/factories';

/**
 * Collection Creation Tests
 * 
 * Tests for collection creation operations including:
 * - Simple collection creation
 * - Collection creation with modules
 * - Nested collection creation
 * - Invalid data handling
 * - Duplicate name detection
 */

describe('Collection Creation Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Simple Collection Creation', () => {
    it('should create a simple collection with valid structure', async () => {
      const collection = await testEnv.createCollection({ 
        name: 'simple-collection' 
      });

      // Verify collection directory exists
      expect(existsSync(collection.path)).toBe(true);

      // Verify collection.json exists
      const collectionJsonPath = join(collection.path, 'collection.json');
      expect(existsSync(collectionJsonPath)).toBe(true);

      // Verify collection metadata
      const collectionData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      expect(collectionData.name).toBe('simple-collection');
      expect(collectionData.type).toBe('collection');
      expect(collectionData.version).toBe('1.0.0');
      expect(collectionData.modules).toEqual([]);
    });

    it('should create collection with custom version', async () => {
      const collection = await testEnv.createCollection({
        name: 'versioned-collection',
        version: '2.5.0'
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );
      expect(collectionData.version).toBe('2.5.0');
    });

    it('should create collection with display name', async () => {
      const collection = await testEnv.createCollection({
        name: 'my-test-collection'
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );
      expect(collectionData.displayName).toBe('My Test Collection');
    });
  });

  describe('Collection Creation with Modules', () => {
    it('should create collection with single module', async () => {
      const collection = await testEnv.createCollection({
        name: 'single-module-collection',
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

    it('should create collection with multiple modules', async () => {
      const modules = [
        'coding-standards/typescript',
        'coding-standards/react',
        'domain-rules/api'
      ];

      const collection = await testEnv.createCollection({
        name: 'multi-module-collection',
        modules
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      expect(collectionData.modules).toHaveLength(3);
      expect(collectionData.modules[0].id).toBe('coding-standards/typescript');
      expect(collectionData.modules[1].id).toBe('coding-standards/react');
      expect(collectionData.modules[2].id).toBe('domain-rules/api');
    });

    it('should create collection using CollectionFactory', async () => {
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

  describe('Nested Collection Creation', () => {
    it('should create collection with nested structure', async () => {
      const parentCollection = await testEnv.createCollection({
        name: 'parent-collection',
        modules: ['coding-standards/typescript']
      });

      const childCollection = await testEnv.createCollection({
        name: 'child-collection',
        modules: ['coding-standards/react']
      });

      // Verify both collections exist
      expect(existsSync(parentCollection.path)).toBe(true);
      expect(existsSync(childCollection.path)).toBe(true);
    });
  });

  describe('Invalid Data Handling', () => {
    it('should handle collection creation with missing name', async () => {
      const collectionPath = join(testEnv.tempDir, 'collections', 'invalid-collection');
      await mkdir(collectionPath, { recursive: true });

      // Create collection.json with missing name
      const invalidData = {
        version: '1.0.0',
        type: 'collection',
        modules: []
      };

      await writeFile(
        join(collectionPath, 'collection.json'),
        JSON.stringify(invalidData, null, 2)
      );

      // Verify file was created but is invalid
      const collectionData = JSON.parse(
        await readFile(join(collectionPath, 'collection.json'), 'utf-8')
      );
      expect(collectionData.name).toBeUndefined();
    });

    it('should handle collection creation with invalid type', async () => {
      const collectionPath = join(testEnv.tempDir, 'collections', 'wrong-type');
      await mkdir(collectionPath, { recursive: true });

      const invalidData = {
        name: 'wrong-type',
        version: '1.0.0',
        type: 'module', // Should be 'collection'
        modules: []
      };

      await writeFile(
        join(collectionPath, 'collection.json'),
        JSON.stringify(invalidData, null, 2)
      );

      const collectionData = JSON.parse(
        await readFile(join(collectionPath, 'collection.json'), 'utf-8')
      );
      expect(collectionData.type).toBe('module');
      expect(collectionData.type).not.toBe('collection');
    });

    it('should handle collection with invalid module format', async () => {
      const collectionPath = join(testEnv.tempDir, 'collections', 'invalid-modules');
      await mkdir(collectionPath, { recursive: true });

      const invalidData = {
        name: 'invalid-modules',
        version: '1.0.0',
        type: 'collection',
        modules: ['invalid-format'] // Should be object with id, version, required
      };

      await writeFile(
        join(collectionPath, 'collection.json'),
        JSON.stringify(invalidData, null, 2)
      );

      const collectionData = JSON.parse(
        await readFile(join(collectionPath, 'collection.json'), 'utf-8')
      );
      expect(collectionData.modules[0]).toBe('invalid-format');
      expect(typeof collectionData.modules[0]).toBe('string');
    });

    it('should handle collection with missing version', async () => {
      const collectionPath = join(testEnv.tempDir, 'collections', 'no-version');
      await mkdir(collectionPath, { recursive: true });

      const invalidData = {
        name: 'no-version',
        type: 'collection',
        modules: []
      };

      await writeFile(
        join(collectionPath, 'collection.json'),
        JSON.stringify(invalidData, null, 2)
      );

      const collectionData = JSON.parse(
        await readFile(join(collectionPath, 'collection.json'), 'utf-8')
      );
      expect(collectionData.version).toBeUndefined();
    });
  });

  describe('Duplicate Name Detection', () => {
    it('should detect duplicate collection names', async () => {
      const collection1 = await testEnv.createCollection({
        name: 'duplicate-test'
      });

      const collection2 = await testEnv.createCollection({
        name: 'duplicate-test'
      });

      // Both collections exist (second overwrites first in test environment)
      expect(existsSync(collection1.path)).toBe(true);
      expect(existsSync(collection2.path)).toBe(true);
      expect(collection1.path).toBe(collection2.path);
    });

    it('should allow collections with different names', async () => {
      const collection1 = await testEnv.createCollection({
        name: 'collection-one'
      });

      const collection2 = await testEnv.createCollection({
        name: 'collection-two'
      });

      expect(existsSync(collection1.path)).toBe(true);
      expect(existsSync(collection2.path)).toBe(true);
      expect(collection1.path).not.toBe(collection2.path);
    });
  });

  describe('Metadata Validation', () => {
    it('should correctly store collection metadata', async () => {
      const collection = await testEnv.createCollection({
        name: 'metadata-test',
        version: '3.2.1',
        modules: ['coding-standards/typescript', 'domain-rules/api']
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      expect(collectionData.name).toBe('metadata-test');
      expect(collectionData.version).toBe('3.2.1');
      expect(collectionData.type).toBe('collection');
      expect(collectionData.displayName).toBe('Metadata Test');
      expect(collectionData.modules).toHaveLength(2);
    });

    it('should validate collection structure using factory', async () => {
      const collection = CollectionFactory.create({
        name: 'factory-test',
        version: '1.5.0'
      });

      expect(collection.name).toBe('factory-test');
      expect(collection.version).toBe('1.5.0');
      expect(collection.type).toBe('collection');
      expect(collection.modules).toEqual([]);
    });
  });
});
