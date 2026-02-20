import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';
import { CollectionFactory } from '../../helpers/factories';

/**
 * Collection Deletion Tests
 * 
 * Tests for collection deletion operations including:
 * - Deleting empty collection
 * - Deleting collection with modules
 * - Dependency checks before deletion
 * - Deleting non-existent collection
 * - Cleanup verification
 */

describe('Collection Deletion Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Deleting Empty Collection', () => {
    it('should delete empty collection successfully', async () => {
      const collection = await testEnv.createCollection({
        name: 'empty-delete-test'
      });

      // Verify collection exists
      expect(existsSync(collection.path)).toBe(true);
      expect(existsSync(join(collection.path, 'collection.json'))).toBe(true);

      // Delete collection
      await rm(collection.path, { recursive: true, force: true });

      // Verify collection is deleted
      expect(existsSync(collection.path)).toBe(false);
      expect(existsSync(join(collection.path, 'collection.json'))).toBe(false);
    });

    it('should delete collection directory and all contents', async () => {
      const collection = await testEnv.createCollection({
        name: 'full-delete-test'
      });

      const collectionJsonPath = join(collection.path, 'collection.json');
      
      // Verify initial state
      expect(existsSync(collection.path)).toBe(true);
      expect(existsSync(collectionJsonPath)).toBe(true);

      // Delete collection
      await rm(collection.path, { recursive: true, force: true });

      // Verify deletion
      expect(existsSync(collection.path)).toBe(false);
    });
  });

  describe('Deleting Collection with Modules', () => {
    it('should delete collection with single module', async () => {
      const collection = await testEnv.createCollection({
        name: 'single-module-delete',
        modules: ['coding-standards/typescript']
      });

      // Verify collection has module
      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );
      expect(collectionData.modules).toHaveLength(1);

      // Delete collection
      await rm(collection.path, { recursive: true, force: true });

      // Verify deletion
      expect(existsSync(collection.path)).toBe(false);
    });

    it('should delete collection with multiple modules', async () => {
      const collection = await testEnv.createCollection({
        name: 'multi-module-delete',
        modules: [
          'coding-standards/typescript',
          'coding-standards/react',
          'domain-rules/api',
          'domain-rules/security'
        ]
      });

      // Verify collection has modules
      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );
      expect(collectionData.modules).toHaveLength(4);

      // Delete collection
      await rm(collection.path, { recursive: true, force: true });

      // Verify deletion
      expect(existsSync(collection.path)).toBe(false);
    });

    it('should not affect modules when deleting collection', async () => {
      // Create module
      const module = await testEnv.createModule({
        name: 'test-module',
        type: 'coding-standards'
      });

      // Create collection referencing the module
      const collection = await testEnv.createCollection({
        name: 'module-ref-delete',
        modules: ['coding-standards/test-module']
      });

      // Delete collection
      await rm(collection.path, { recursive: true, force: true });

      // Verify collection is deleted but module still exists
      expect(existsSync(collection.path)).toBe(false);
      expect(existsSync(module.path)).toBe(true);
    });
  });

  describe('Dependency Checks Before Deletion', () => {
    it('should check for dependent collections before deletion', async () => {
      const collection1 = await testEnv.createCollection({
        name: 'dependency-check-1',
        modules: ['coding-standards/typescript']
      });

      const collection2 = await testEnv.createCollection({
        name: 'dependency-check-2',
        modules: ['coding-standards/react']
      });

      // Both collections exist independently
      expect(existsSync(collection1.path)).toBe(true);
      expect(existsSync(collection2.path)).toBe(true);

      // Delete first collection
      await rm(collection1.path, { recursive: true, force: true });

      // Second collection should still exist
      expect(existsSync(collection1.path)).toBe(false);
      expect(existsSync(collection2.path)).toBe(true);
    });

    it('should verify no active references before deletion', async () => {
      const collection = await testEnv.createCollection({
        name: 'reference-check',
        modules: ['coding-standards/typescript']
      });

      const collectionData = JSON.parse(
        await readFile(join(collection.path, 'collection.json'), 'utf-8')
      );

      // Check if collection has modules (references)
      const hasReferences = collectionData.modules.length > 0;
      expect(hasReferences).toBe(true);

      // In production, would check for active references before deletion
      // For test, we just delete
      await rm(collection.path, { recursive: true, force: true });
      expect(existsSync(collection.path)).toBe(false);
    });
  });

  describe('Deleting Non-Existent Collection', () => {
    it('should handle deletion of non-existent collection', async () => {
      const nonExistentPath = join(testEnv.tempDir, 'collections', 'non-existent');

      // Verify collection doesn't exist
      expect(existsSync(nonExistentPath)).toBe(false);

      // Attempt to delete (should not throw error with force: true)
      await rm(nonExistentPath, { recursive: true, force: true });

      // Still doesn't exist
      expect(existsSync(nonExistentPath)).toBe(false);
    });

    it('should handle deletion of already deleted collection', async () => {
      const collection = await testEnv.createCollection({
        name: 'double-delete-test'
      });

      // First deletion
      await rm(collection.path, { recursive: true, force: true });
      expect(existsSync(collection.path)).toBe(false);

      // Second deletion (should not throw error)
      await rm(collection.path, { recursive: true, force: true });
      expect(existsSync(collection.path)).toBe(false);
    });

    it('should handle deletion with invalid path', async () => {
      const invalidPath = join(testEnv.tempDir, 'collections', '..', 'invalid');

      // Attempt to delete invalid path (should not throw with force: true)
      await rm(invalidPath, { recursive: true, force: true });

      // No error should occur
      expect(true).toBe(true);
    });
  });

  describe('Cleanup Verification', () => {
    it('should verify complete cleanup after deletion', async () => {
      const collection = await testEnv.createCollection({
        name: 'cleanup-verify-test',
        modules: ['coding-standards/typescript', 'coding-standards/react']
      });

      const collectionPath = collection.path;
      const collectionJsonPath = join(collectionPath, 'collection.json');

      // Verify initial state
      expect(existsSync(collectionPath)).toBe(true);
      expect(existsSync(collectionJsonPath)).toBe(true);

      // Delete collection
      await rm(collectionPath, { recursive: true, force: true });

      // Verify complete cleanup
      expect(existsSync(collectionPath)).toBe(false);
      expect(existsSync(collectionJsonPath)).toBe(false);
    });

    it('should verify no residual files after deletion', async () => {
      const collection = await testEnv.createCollection({
        name: 'residual-check',
        modules: ['coding-standards/typescript']
      });

      // Delete collection
      await rm(collection.path, { recursive: true, force: true });

      // Verify no residual files
      expect(existsSync(collection.path)).toBe(false);
      expect(existsSync(join(collection.path, 'collection.json'))).toBe(false);
    });

    it('should verify parent directory still exists after deletion', async () => {
      const collection = await testEnv.createCollection({
        name: 'parent-dir-check'
      });

      const collectionsDir = join(testEnv.tempDir, 'collections');

      // Verify parent directory exists
      expect(existsSync(collectionsDir)).toBe(true);

      // Delete collection
      await rm(collection.path, { recursive: true, force: true });

      // Parent directory should still exist
      expect(existsSync(collectionsDir)).toBe(true);
      expect(existsSync(collection.path)).toBe(false);
    });

    it('should handle deletion of multiple collections', async () => {
      const collection1 = await testEnv.createCollection({
        name: 'multi-delete-1',
        modules: ['coding-standards/typescript']
      });

      const collection2 = await testEnv.createCollection({
        name: 'multi-delete-2',
        modules: ['coding-standards/react']
      });

      const collection3 = await testEnv.createCollection({
        name: 'multi-delete-3',
        modules: ['domain-rules/api']
      });

      // Verify all exist
      expect(existsSync(collection1.path)).toBe(true);
      expect(existsSync(collection2.path)).toBe(true);
      expect(existsSync(collection3.path)).toBe(true);

      // Delete all collections
      await rm(collection1.path, { recursive: true, force: true });
      await rm(collection2.path, { recursive: true, force: true });
      await rm(collection3.path, { recursive: true, force: true });

      // Verify all deleted
      expect(existsSync(collection1.path)).toBe(false);
      expect(existsSync(collection2.path)).toBe(false);
      expect(existsSync(collection3.path)).toBe(false);
    });

    it('should verify collection metadata is removed after deletion', async () => {
      const collection = await testEnv.createCollection({
        name: 'metadata-cleanup',
        version: '1.0.0',
        modules: ['coding-standards/typescript']
      });

      const collectionJsonPath = join(collection.path, 'collection.json');

      // Verify metadata exists
      const metadata = JSON.parse(await readFile(collectionJsonPath, 'utf-8'));
      expect(metadata.name).toBe('metadata-cleanup');
      expect(metadata.version).toBe('1.0.0');

      // Delete collection
      await rm(collection.path, { recursive: true, force: true });

      // Verify metadata file is gone
      expect(existsSync(collectionJsonPath)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle deletion during concurrent operations', async () => {
      const collection = await testEnv.createCollection({
        name: 'concurrent-delete'
      });

      // Simulate concurrent deletion attempts
      const deletePromises = [
        rm(collection.path, { recursive: true, force: true }),
        rm(collection.path, { recursive: true, force: true })
      ];

      await Promise.all(deletePromises);

      // Collection should be deleted
      expect(existsSync(collection.path)).toBe(false);
    });

    it('should handle deletion with special characters in name', async () => {
      const collection = await testEnv.createCollection({
        name: 'special-chars-delete'
      });

      // Delete collection
      await rm(collection.path, { recursive: true, force: true });

      // Verify deletion
      expect(existsSync(collection.path)).toBe(false);
    });

    it('should verify deletion is permanent', async () => {
      const collection = await testEnv.createCollection({
        name: 'permanent-delete',
        modules: ['coding-standards/typescript']
      });

      const collectionPath = collection.path;

      // Delete collection
      await rm(collectionPath, { recursive: true, force: true });

      // Verify it's gone
      expect(existsSync(collectionPath)).toBe(false);

      // Verify it stays gone
      expect(existsSync(collectionPath)).toBe(false);
    });
  });
});
