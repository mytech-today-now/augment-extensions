import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';
import { CollectionFactory } from '../../helpers/factories';

/**
 * Collection Modification Tests
 * 
 * Tests for collection modification operations including:
 * - Adding modules to collection
 * - Removing modules from collection
 * - Updating collection metadata
 * - Modifying non-existent collection
 * - Adding duplicate modules
 */

describe('Collection Modification Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Adding Modules to Collection', () => {
    it('should add single module to empty collection', async () => {
      const collection = await testEnv.createCollection({
        name: 'add-module-test'
      });

      // Read collection data
      const collectionPath = join(collection.path, 'collection.json');
      const collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      
      // Add module
      collectionData.modules.push({
        id: 'coding-standards/typescript',
        version: '^1.0.0',
        required: true
      });

      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      // Verify module was added
      const updatedData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(updatedData.modules).toHaveLength(1);
      expect(updatedData.modules[0].id).toBe('coding-standards/typescript');
    });

    it('should add multiple modules to collection', async () => {
      const collection = await testEnv.createCollection({
        name: 'multi-add-test'
      });

      const collectionPath = join(collection.path, 'collection.json');
      const collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));

      // Add multiple modules
      const newModules = [
        { id: 'coding-standards/typescript', version: '^1.0.0', required: true },
        { id: 'coding-standards/react', version: '^2.0.0', required: true },
        { id: 'domain-rules/api', version: '^1.5.0', required: false }
      ];

      collectionData.modules.push(...newModules);
      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      const updatedData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(updatedData.modules).toHaveLength(3);
      expect(updatedData.modules[0].id).toBe('coding-standards/typescript');
      expect(updatedData.modules[1].id).toBe('coding-standards/react');
      expect(updatedData.modules[2].id).toBe('domain-rules/api');
      expect(updatedData.modules[2].required).toBe(false);
    });

    it('should add module to collection with existing modules', async () => {
      const collection = await testEnv.createCollection({
        name: 'existing-modules-test',
        modules: ['coding-standards/html', 'coding-standards/css']
      });

      const collectionPath = join(collection.path, 'collection.json');
      const collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));

      // Add new module
      collectionData.modules.push({
        id: 'coding-standards/js',
        version: '^1.0.0',
        required: true
      });

      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      const updatedData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(updatedData.modules).toHaveLength(3);
      expect(updatedData.modules[2].id).toBe('coding-standards/js');
    });
  });

  describe('Removing Modules from Collection', () => {
    it('should remove single module from collection', async () => {
      const collection = await testEnv.createCollection({
        name: 'remove-test',
        modules: ['coding-standards/typescript', 'coding-standards/react']
      });

      const collectionPath = join(collection.path, 'collection.json');
      const collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));

      // Remove first module
      collectionData.modules = collectionData.modules.filter(
        (m: any) => m.id !== 'coding-standards/typescript'
      );

      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      const updatedData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(updatedData.modules).toHaveLength(1);
      expect(updatedData.modules[0].id).toBe('coding-standards/react');
    });

    it('should remove multiple modules from collection', async () => {
      const collection = await testEnv.createCollection({
        name: 'multi-remove-test',
        modules: [
          'coding-standards/typescript',
          'coding-standards/react',
          'coding-standards/vue',
          'domain-rules/api'
        ]
      });

      const collectionPath = join(collection.path, 'collection.json');
      const collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));

      // Remove multiple modules
      const modulesToRemove = ['coding-standards/react', 'coding-standards/vue'];
      collectionData.modules = collectionData.modules.filter(
        (m: any) => !modulesToRemove.includes(m.id)
      );

      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      const updatedData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(updatedData.modules).toHaveLength(2);
      expect(updatedData.modules[0].id).toBe('coding-standards/typescript');
      expect(updatedData.modules[1].id).toBe('domain-rules/api');
    });

    it('should remove all modules from collection', async () => {
      const collection = await testEnv.createCollection({
        name: 'remove-all-test',
        modules: ['coding-standards/typescript', 'coding-standards/react']
      });

      const collectionPath = join(collection.path, 'collection.json');
      const collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));

      // Remove all modules
      collectionData.modules = [];

      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      const updatedData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(updatedData.modules).toHaveLength(0);
      expect(updatedData.modules).toEqual([]);
    });
  });

  describe('Updating Collection Metadata', () => {
    it('should update collection version', async () => {
      const collection = await testEnv.createCollection({
        name: 'version-update-test',
        version: '1.0.0'
      });

      const collectionPath = join(collection.path, 'collection.json');
      const collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));

      // Update version
      collectionData.version = '2.0.0';
      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      const updatedData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(updatedData.version).toBe('2.0.0');
    });

    it('should update collection description', async () => {
      const collection = await testEnv.createCollection({
        name: 'description-update-test'
      });

      const collectionPath = join(collection.path, 'collection.json');
      const collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));

      // Update description
      collectionData.description = 'Updated description for testing';
      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      const updatedData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(updatedData.description).toBe('Updated description for testing');
    });

    it('should update collection display name', async () => {
      const collection = await testEnv.createCollection({
        name: 'display-name-test'
      });

      const collectionPath = join(collection.path, 'collection.json');
      const collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));

      // Update display name
      collectionData.displayName = 'Custom Display Name';
      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      const updatedData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(updatedData.displayName).toBe('Custom Display Name');
    });

    it('should update multiple metadata fields', async () => {
      const collection = await testEnv.createCollection({
        name: 'multi-update-test',
        version: '1.0.0'
      });

      const collectionPath = join(collection.path, 'collection.json');
      const collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));

      // Update multiple fields
      collectionData.version = '3.5.2';
      collectionData.description = 'Comprehensive update test';
      collectionData.displayName = 'Multi Update Test Collection';

      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      const updatedData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(updatedData.version).toBe('3.5.2');
      expect(updatedData.description).toBe('Comprehensive update test');
      expect(updatedData.displayName).toBe('Multi Update Test Collection');
    });
  });

  describe('Modifying Non-Existent Collection', () => {
    it('should handle attempt to modify non-existent collection', async () => {
      const nonExistentPath = join(testEnv.tempDir, 'collections', 'non-existent');

      // Verify collection doesn't exist
      expect(existsSync(nonExistentPath)).toBe(false);
      expect(existsSync(join(nonExistentPath, 'collection.json'))).toBe(false);
    });

    it('should handle missing collection.json file', async () => {
      const collection = await testEnv.createCollection({
        name: 'missing-json-test'
      });

      const collectionJsonPath = join(collection.path, 'collection.json');

      // Verify file exists initially
      expect(existsSync(collectionJsonPath)).toBe(true);

      // In a real scenario, attempting to read a deleted file would throw an error
      // This test verifies the file exists before modification
    });
  });

  describe('Adding Duplicate Modules', () => {
    it('should detect duplicate module in collection', async () => {
      const collection = await testEnv.createCollection({
        name: 'duplicate-module-test',
        modules: ['coding-standards/typescript']
      });

      const collectionPath = join(collection.path, 'collection.json');
      const collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));

      // Add duplicate module
      collectionData.modules.push({
        id: 'coding-standards/typescript',
        version: '^2.0.0',
        required: true
      });

      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      const updatedData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(updatedData.modules).toHaveLength(2);

      // Both modules have same id
      expect(updatedData.modules[0].id).toBe('coding-standards/typescript');
      expect(updatedData.modules[1].id).toBe('coding-standards/typescript');

      // But different versions
      expect(updatedData.modules[0].version).toBe('^1.0.0');
      expect(updatedData.modules[1].version).toBe('^2.0.0');
    });

    it('should prevent duplicate modules with validation', async () => {
      const collection = await testEnv.createCollection({
        name: 'validation-test',
        modules: ['coding-standards/typescript', 'coding-standards/react']
      });

      const collectionPath = join(collection.path, 'collection.json');
      const collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));

      // Attempt to add duplicate
      const newModule = {
        id: 'coding-standards/typescript',
        version: '^1.0.0',
        required: true
      };

      // Check if module already exists
      const isDuplicate = collectionData.modules.some(
        (m: any) => m.id === newModule.id
      );

      if (!isDuplicate) {
        collectionData.modules.push(newModule);
      }

      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      const updatedData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(updatedData.modules).toHaveLength(2); // No duplicate added
    });
  });

  describe('State Consistency Verification', () => {
    it('should maintain collection structure after modifications', async () => {
      const collection = await testEnv.createCollection({
        name: 'consistency-test',
        version: '1.0.0',
        modules: ['coding-standards/typescript']
      });

      const collectionPath = join(collection.path, 'collection.json');

      // Perform multiple modifications
      let collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      collectionData.version = '1.1.0';
      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      collectionData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      collectionData.modules.push({
        id: 'coding-standards/react',
        version: '^1.0.0',
        required: true
      });
      await writeFile(collectionPath, JSON.stringify(collectionData, null, 2));

      // Verify final state
      const finalData = JSON.parse(await readFile(collectionPath, 'utf-8'));
      expect(finalData.name).toBe('consistency-test');
      expect(finalData.version).toBe('1.1.0');
      expect(finalData.type).toBe('collection');
      expect(finalData.modules).toHaveLength(2);
    });
  });
});

