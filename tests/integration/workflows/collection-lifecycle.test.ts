import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';
import { CollectionFactory } from '../../helpers/factories';

/**
 * Collection Lifecycle Workflow Tests
 * 
 * Tests for complete collection lifecycle workflows including:
 * - create → modify → query → delete workflow
 * - Collection with module operations
 * - Nested collection workflows
 * - Error handling
 */

describe('Collection Lifecycle Workflows', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Complete Lifecycle: create → modify → query → delete', () => {
    it('should complete full collection lifecycle successfully', async () => {
      // 1. Create: Create collection
      const collection = await testEnv.createCollection({
        name: 'lifecycle-collection',
        modules: ['coding-standards/typescript']
      });

      expect(existsSync(collection.path)).toBe(true);
      expect(existsSync(join(collection.path, 'collection.json'))).toBe(true);

      // 2. Modify: Add more modules
      const collectionJsonPath = join(collection.path, 'collection.json');
      let collectionData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      
      collectionData.modules.push({
        id: 'coding-standards/react',
        version: '^1.0.0',
        required: true
      });
      
      await writeFile(collectionJsonPath, JSON.stringify(collectionData, null, 2));

      // 3. Query: Verify collection contents
      collectionData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      expect(collectionData.modules).toHaveLength(2);
      expect(collectionData.modules[0].id).toBe('coding-standards/typescript');
      expect(collectionData.modules[1].id).toBe('coding-standards/react');

      // 4. Delete: Remove collection
      await rm(collection.path, { recursive: true, force: true });
      expect(existsSync(collection.path)).toBe(false);
    });

    it('should maintain state consistency throughout lifecycle', async () => {
      const collection = await testEnv.createCollection({ name: 'state-collection' });
      const collectionJsonPath = join(collection.path, 'collection.json');

      // Initial state: empty modules
      let collectionData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      expect(collectionData.modules).toHaveLength(0);

      // Add module
      collectionData.modules.push({
        id: 'domain-rules/api',
        version: '^1.0.0',
        required: true
      });
      await writeFile(collectionJsonPath, JSON.stringify(collectionData, null, 2));

      // State after add: 1 module
      collectionData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      expect(collectionData.modules).toHaveLength(1);

      // Remove module
      collectionData.modules = [];
      await writeFile(collectionJsonPath, JSON.stringify(collectionData, null, 2));

      // Final state: empty modules
      collectionData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      expect(collectionData.modules).toHaveLength(0);
    });
  });

  describe('Collection with Module Operations', () => {
    it('should handle adding and removing modules', async () => {
      const collection = await testEnv.createCollection({ name: 'module-ops-collection' });
      const collectionJsonPath = join(collection.path, 'collection.json');

      // Add multiple modules
      const collectionData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      collectionData.modules = [
        { id: 'coding-standards/typescript', version: '^1.0.0', required: true },
        { id: 'coding-standards/react', version: '^1.0.0', required: true },
        { id: 'domain-rules/api', version: '^1.0.0', required: false }
      ];
      await writeFile(collectionJsonPath, JSON.stringify(collectionData, null, 2));

      // Verify all modules added
      let updatedData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      expect(updatedData.modules).toHaveLength(3);

      // Remove one module
      updatedData.modules = updatedData.modules.filter(m => m.id !== 'coding-standards/react');
      await writeFile(collectionJsonPath, JSON.stringify(updatedData, null, 2));

      // Verify module removed
      updatedData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      expect(updatedData.modules).toHaveLength(2);
      expect(updatedData.modules.find(m => m.id === 'coding-standards/react')).toBeUndefined();
    });

    it('should handle updating module metadata', async () => {
      const collection = await testEnv.createCollection({
        name: 'metadata-collection',
        modules: ['coding-standards/typescript']
      });
      const collectionJsonPath = join(collection.path, 'collection.json');

      // Update collection metadata
      const collectionData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      collectionData.version = '2.0.0';
      collectionData.description = 'Updated description';
      await writeFile(collectionJsonPath, JSON.stringify(collectionData, null, 2));

      // Verify metadata updated
      const updatedData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      expect(updatedData.version).toBe('2.0.0');
      expect(updatedData.description).toBe('Updated description');
    });

    it('should handle module version updates', async () => {
      const collection = await testEnv.createCollection({
        name: 'version-collection',
        modules: ['coding-standards/typescript']
      });
      const collectionJsonPath = join(collection.path, 'collection.json');

      // Update module version
      const collectionData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      collectionData.modules[0].version = '^2.0.0';
      await writeFile(collectionJsonPath, JSON.stringify(collectionData, null, 2));

      // Verify version updated
      const updatedData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      expect(updatedData.modules[0].version).toBe('^2.0.0');
    });
  });

  describe('Nested Collection Workflows', () => {
    it('should handle nested collection creation', async () => {
      // Create parent collection
      const parentCollection = await testEnv.createCollection({
        name: 'parent-collection',
        modules: ['coding-standards/typescript']
      });

      // Create child collection
      const childCollection = await testEnv.createCollection({
        name: 'child-collection',
        modules: ['coding-standards/react']
      });

      // Add child collection reference to parent
      const parentJsonPath = join(parentCollection.path, 'collection.json');
      const parentData = JSON.parse(await readFile(parentJsonPath, 'utf-8'));
      parentData.collections = [childCollection.name];
      await writeFile(parentJsonPath, JSON.stringify(parentData, null, 2));

      // Verify nested structure
      const updatedParent = JSON.parse(await readFile(parentJsonPath, 'utf-8'));
      expect(updatedParent.collections).toContain(childCollection.name);
      expect(updatedParent.modules).toHaveLength(1);
    });

    it('should handle multiple nested collections', async () => {
      const parent = await testEnv.createCollection({ name: 'parent' });
      const child1 = await testEnv.createCollection({ name: 'child-1' });
      const child2 = await testEnv.createCollection({ name: 'child-2' });

      // Add multiple children to parent
      const parentJsonPath = join(parent.path, 'collection.json');
      const parentData = JSON.parse(await readFile(parentJsonPath, 'utf-8'));
      parentData.collections = [child1.name, child2.name];
      await writeFile(parentJsonPath, JSON.stringify(parentData, null, 2));

      // Verify multiple children
      const updatedParent = JSON.parse(await readFile(parentJsonPath, 'utf-8'));
      expect(updatedParent.collections).toHaveLength(2);
      expect(updatedParent.collections).toContain(child1.name);
      expect(updatedParent.collections).toContain(child2.name);
    });

    it('should handle deep nesting', async () => {
      const level1 = await testEnv.createCollection({ name: 'level-1' });
      const level2 = await testEnv.createCollection({ name: 'level-2' });
      const level3 = await testEnv.createCollection({ name: 'level-3' });

      // Create deep nesting: level1 -> level2 -> level3
      let jsonPath = join(level1.path, 'collection.json');
      let data = JSON.parse(await readFile(jsonPath, 'utf-8'));
      data.collections = [level2.name];
      await writeFile(jsonPath, JSON.stringify(data, null, 2));

      jsonPath = join(level2.path, 'collection.json');
      data = JSON.parse(await readFile(jsonPath, 'utf-8'));
      data.collections = [level3.name];
      await writeFile(jsonPath, JSON.stringify(data, null, 2));

      // Verify deep nesting
      const level1Data = JSON.parse(await readFile(join(level1.path, 'collection.json'), 'utf-8'));
      const level2Data = JSON.parse(await readFile(join(level2.path, 'collection.json'), 'utf-8'));

      expect(level1Data.collections).toContain(level2.name);
      expect(level2Data.collections).toContain(level3.name);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing collection.json', async () => {
      const collection = await testEnv.createCollection({ name: 'missing-json' });
      const collectionJsonPath = join(collection.path, 'collection.json');

      // Delete collection.json
      await rm(collectionJsonPath);

      // Attempting to read should fail
      expect(existsSync(collectionJsonPath)).toBe(false);
    });

    it('should handle corrupted collection.json', async () => {
      const collection = await testEnv.createCollection({ name: 'corrupted' });
      const collectionJsonPath = join(collection.path, 'collection.json');

      // Write invalid JSON
      await writeFile(collectionJsonPath, '{ invalid json }');

      // Reading should fail
      await expect(async () => {
        await readFile(collectionJsonPath, 'utf-8').then(JSON.parse);
      }).rejects.toThrow();
    });

    it('should handle adding duplicate modules', async () => {
      const collection = await testEnv.createCollection({
        name: 'duplicate-modules',
        modules: ['coding-standards/typescript']
      });
      const collectionJsonPath = join(collection.path, 'collection.json');

      // Attempt to add duplicate module
      const collectionData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      collectionData.modules.push({
        id: 'coding-standards/typescript',
        version: '^1.0.0',
        required: true
      });
      await writeFile(collectionJsonPath, JSON.stringify(collectionData, null, 2));

      // Collection should have duplicate (no validation at this level)
      const updatedData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      expect(updatedData.modules).toHaveLength(2);
      expect(updatedData.modules[0].id).toBe(updatedData.modules[1].id);
    });

    it('should handle deleting non-existent collection', async () => {
      const nonExistentPath = join(testEnv.tempDir, 'non-existent-collection');

      // Attempting to delete should not throw
      await rm(nonExistentPath, { recursive: true, force: true });
      expect(existsSync(nonExistentPath)).toBe(false);
    });

    it('should handle invalid module references', async () => {
      const collection = await testEnv.createCollection({ name: 'invalid-refs' });
      const collectionJsonPath = join(collection.path, 'collection.json');

      // Add invalid module reference
      const collectionData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      collectionData.modules.push({
        id: 'invalid/non-existent-module',
        version: '^1.0.0',
        required: true
      });
      await writeFile(collectionJsonPath, JSON.stringify(collectionData, null, 2));

      // Collection should accept invalid reference (validation happens elsewhere)
      const updatedData = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      expect(updatedData.modules).toHaveLength(1);
      expect(updatedData.modules[0].id).toBe('invalid/non-existent-module');
    });
  });

  describe('Complex Workflows', () => {
    it('should handle collection with modules and nested collections', async () => {
      const parent = await testEnv.createCollection({
        name: 'complex-parent',
        modules: ['coding-standards/typescript', 'coding-standards/react']
      });
      const child = await testEnv.createCollection({
        name: 'complex-child',
        modules: ['domain-rules/api']
      });

      // Add child to parent
      const parentJsonPath = join(parent.path, 'collection.json');
      const parentData = JSON.parse(await readFile(parentJsonPath, 'utf-8'));
      parentData.collections = [child.name];
      await writeFile(parentJsonPath, JSON.stringify(parentData, null, 2));

      // Verify complex structure
      const updatedParent = JSON.parse(await readFile(parentJsonPath, 'utf-8'));
      expect(updatedParent.modules).toHaveLength(2);
      expect(updatedParent.collections).toHaveLength(1);
      expect(updatedParent.collections[0]).toBe(child.name);
    });

    it('should handle collection factory integration', async () => {
      // Use factory to create collection data
      const factoryData = CollectionFactory.withModules([
        'coding-standards/typescript',
        'coding-standards/react',
        'domain-rules/api'
      ]);

      expect(factoryData.modules).toHaveLength(3);
      expect(factoryData.type).toBe('collection');

      // Create actual collection with factory data
      const collection = await testEnv.createCollection({
        name: 'factory-collection',
        modules: factoryData.modules.map(m => m.id)
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );
      expect(collectionData.modules).toHaveLength(3);
    });

    it('should handle sequential collection operations', async () => {
      const collections = [];

      // Create multiple collections sequentially
      for (let i = 1; i <= 3; i++) {
        const collection = await testEnv.createCollection({
          name: `sequential-collection-${i}`,
          modules: [`coding-standards/module-${i}`]
        });
        collections.push(collection);

        expect(existsSync(collection.path)).toBe(true);
      }

      // Verify all collections exist
      expect(collections).toHaveLength(3);
      collections.forEach(c => {
        expect(existsSync(c.path)).toBe(true);
      });
    });
  });
});
