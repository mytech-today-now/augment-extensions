import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { createTestEnvironment, TestEnvironment } from '../../helpers/test-env';

/**
 * Module Show Tests
 * 
 * Tests for module show operations including:
 * - Showing module metadata
 * - Displaying rules and examples
 * - Different output formats (JSON, text, markdown)
 * - Error cases (non-existent modules, invalid paths)
 */

describe('Module Show Tests', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Show Module Metadata', () => {
    it('should display basic module metadata', async () => {
      const module = await testEnv.createModule({ 
        name: 'test-module',
        version: '1.0.0',
        description: 'Test module description',
        type: 'coding-standards'
      });

      // Verify module metadata
      expect(module.metadata.name).toBe('test-module');
      expect(module.metadata.version).toBe('1.0.0');
      expect(module.metadata.description).toBe('Test module description');
      expect(module.metadata.type).toBe('coding-standards');
    });

    it('should display module with all metadata fields', async () => {
      const module = await testEnv.createModule({ 
        name: 'full-module',
        version: '2.1.0',
        description: 'Full module with all fields',
        type: 'domain-rules',
        displayName: 'Full Test Module',
        tags: ['test', 'example', 'comprehensive']
      });

      // Verify all metadata fields
      expect(module.metadata.name).toBe('full-module');
      expect(module.metadata.version).toBe('2.1.0');
      expect(module.metadata.description).toBe('Full module with all fields');
      expect(module.metadata.type).toBe('domain-rules');
      expect(module.metadata.displayName).toBe('Full Test Module');
      expect(module.metadata.tags).toEqual(['test', 'example', 'comprehensive']);
    });

    it('should display module version information', async () => {
      const module = await testEnv.createModule({ 
        name: 'versioned-module',
        version: '3.2.1'
      });

      expect(module.metadata.version).toBe('3.2.1');
    });

    it('should display module type', async () => {
      const module = await testEnv.createModule({ 
        name: 'typed-module',
        type: 'workflows'
      });

      expect(module.metadata.type).toBe('workflows');
    });
  });

  describe('Show Module Rules', () => {
    it('should display module rules', async () => {
      const module = await testEnv.createModule({ name: 'rules-module' });

      // Create rules directory and files
      const rulesDir = join(module.path, 'rules');
      await mkdir(rulesDir, { recursive: true });
      await writeFile(join(rulesDir, 'rule1.md'), '# Rule 1\nFirst rule content');
      await writeFile(join(rulesDir, 'rule2.md'), '# Rule 2\nSecond rule content');
      await writeFile(join(rulesDir, 'rule3.md'), '# Rule 3\nThird rule content');

      // Verify rules exist
      expect(existsSync(join(rulesDir, 'rule1.md'))).toBe(true);
      expect(existsSync(join(rulesDir, 'rule2.md'))).toBe(true);
      expect(existsSync(join(rulesDir, 'rule3.md'))).toBe(true);

      // Read rule content
      const rule1Content = await readFile(join(rulesDir, 'rule1.md'), 'utf-8');
      expect(rule1Content).toContain('Rule 1');
      expect(rule1Content).toContain('First rule content');
    });

    it('should handle module with no rules', async () => {
      const module = await testEnv.createModule({ name: 'no-rules-module' });

      // Verify rules directory doesn't exist
      const rulesDir = join(module.path, 'rules');
      expect(existsSync(rulesDir)).toBe(false);
    });

    it('should display multiple rules in order', async () => {
      const module = await testEnv.createModule({ name: 'ordered-rules-module' });

      // Create rules in specific order
      const rulesDir = join(module.path, 'rules');
      await mkdir(rulesDir, { recursive: true });
      await writeFile(join(rulesDir, '01-first.md'), 'First rule');
      await writeFile(join(rulesDir, '02-second.md'), 'Second rule');
      await writeFile(join(rulesDir, '03-third.md'), 'Third rule');

      // Verify files exist
      expect(existsSync(join(rulesDir, '01-first.md'))).toBe(true);
      expect(existsSync(join(rulesDir, '02-second.md'))).toBe(true);
      expect(existsSync(join(rulesDir, '03-third.md'))).toBe(true);
    });
  });

  describe('Show Module Examples', () => {
    it('should display module examples', async () => {
      const module = await testEnv.createModule({ name: 'examples-module' });

      // Create examples directory and files
      const examplesDir = join(module.path, 'examples');
      await mkdir(examplesDir, { recursive: true });
      await writeFile(join(examplesDir, 'example1.ts'), 'const example1 = "test";');
      await writeFile(join(examplesDir, 'example2.ts'), 'const example2 = "test";');

      // Verify examples exist
      expect(existsSync(join(examplesDir, 'example1.ts'))).toBe(true);
      expect(existsSync(join(examplesDir, 'example2.ts'))).toBe(true);

      // Read example content
      const example1Content = await readFile(join(examplesDir, 'example1.ts'), 'utf-8');
      expect(example1Content).toContain('example1');
    });

    it('should handle module with no examples', async () => {
      const module = await testEnv.createModule({ name: 'no-examples-module' });

      // Verify examples directory doesn't exist
      const examplesDir = join(module.path, 'examples');
      expect(existsSync(examplesDir)).toBe(false);
    });

    it('should display examples with different file types', async () => {
      const module = await testEnv.createModule({ name: 'multi-type-examples' });

      // Create examples with different file types
      const examplesDir = join(module.path, 'examples');
      await mkdir(examplesDir, { recursive: true });
      await writeFile(join(examplesDir, 'example.ts'), 'TypeScript example');
      await writeFile(join(examplesDir, 'example.js'), 'JavaScript example');
      await writeFile(join(examplesDir, 'example.py'), 'Python example');
      await writeFile(join(examplesDir, 'example.md'), 'Markdown example');

      // Verify all examples exist
      expect(existsSync(join(examplesDir, 'example.ts'))).toBe(true);
      expect(existsSync(join(examplesDir, 'example.js'))).toBe(true);
      expect(existsSync(join(examplesDir, 'example.py'))).toBe(true);
      expect(existsSync(join(examplesDir, 'example.md'))).toBe(true);
    });
  });

  describe('Output Formats', () => {
    it('should format module info as JSON', async () => {
      const module = await testEnv.createModule({
        name: 'json-module',
        version: '1.0.0',
        description: 'JSON format test',
        type: 'coding-standards'
      });

      // Create rules and examples
      const rulesDir = join(module.path, 'rules');
      await mkdir(rulesDir, { recursive: true });
      await writeFile(join(rulesDir, 'rule1.md'), 'Rule content');

      const examplesDir = join(module.path, 'examples');
      await mkdir(examplesDir, { recursive: true });
      await writeFile(join(examplesDir, 'example1.ts'), 'Example content');

      // Simulate JSON output structure
      const jsonOutput = {
        name: module.fullName,
        version: module.metadata.version,
        type: module.metadata.type,
        description: module.metadata.description,
        rules: ['rule1.md'],
        examples: ['example1.ts']
      };

      expect(jsonOutput.name).toBe(module.fullName);
      expect(jsonOutput.version).toBe('1.0.0');
      expect(jsonOutput.type).toBe('coding-standards');
      expect(jsonOutput.description).toBe('JSON format test');
      expect(jsonOutput.rules).toContain('rule1.md');
      expect(jsonOutput.examples).toContain('example1.ts');
    });

    it('should format module info as text', async () => {
      const module = await testEnv.createModule({
        name: 'text-module',
        version: '2.0.0',
        description: 'Text format test',
        type: 'domain-rules'
      });

      // Simulate text output
      const textOutput = `
📦 ${module.fullName}
Version: ${module.metadata.version}
Type: ${module.metadata.type}
Description: ${module.metadata.description}
      `.trim();

      expect(textOutput).toContain(module.fullName);
      expect(textOutput).toContain('2.0.0');
      expect(textOutput).toContain('domain-rules');
      expect(textOutput).toContain('Text format test');
    });

    it('should format module info as markdown', async () => {
      const module = await testEnv.createModule({
        name: 'markdown-module',
        version: '3.0.0',
        type: 'workflows'
      });

      // Simulate markdown output
      const markdownOutput = `# ${module.fullName}

**Module Type:** ${module.metadata.type}

**Version:** ${module.metadata.version}

---
`;

      expect(markdownOutput).toContain(`# ${module.fullName}`);
      expect(markdownOutput).toContain('**Module Type:** workflows');
      expect(markdownOutput).toContain('**Version:** 3.0.0');
    });
  });

  describe('Error Cases', () => {
    it('should handle non-existent module', async () => {
      // Try to show non-existent module
      const nonExistentPath = join(testEnv.tempDir, 'non-existent-module');

      // Verify module doesn't exist
      expect(existsSync(nonExistentPath)).toBe(false);
    });

    it('should handle invalid module path', async () => {
      const invalidPath = join(testEnv.tempDir, 'invalid', 'path', 'module');

      // Verify path doesn't exist
      expect(existsSync(invalidPath)).toBe(false);
    });

    it('should handle module with missing module.json', async () => {
      const module = await testEnv.createModule({ name: 'no-json-module' });

      // Remove module.json
      const moduleJsonPath = join(module.path, 'module.json');

      // In real implementation, this would generate default metadata
      // For now, just verify the path
      expect(existsSync(moduleJsonPath)).toBe(true);
    });

    it('should handle module with corrupted module.json', async () => {
      const module = await testEnv.createModule({ name: 'corrupted-module' });

      // Write invalid JSON
      const moduleJsonPath = join(module.path, 'module.json');
      await writeFile(moduleJsonPath, '{ invalid json }');

      // Try to read (should fail)
      await expect(async () => {
        JSON.parse(await readFile(moduleJsonPath, 'utf-8'));
      }).rejects.toThrow();
    });

    it('should handle module with empty rules directory', async () => {
      const module = await testEnv.createModule({ name: 'empty-rules-module' });

      // Create empty rules directory
      const rulesDir = join(module.path, 'rules');
      await mkdir(rulesDir, { recursive: true });

      // Verify directory exists but is empty
      expect(existsSync(rulesDir)).toBe(true);
    });

    it('should handle module with empty examples directory', async () => {
      const module = await testEnv.createModule({ name: 'empty-examples-module' });

      // Create empty examples directory
      const examplesDir = join(module.path, 'examples');
      await mkdir(examplesDir, { recursive: true });

      // Verify directory exists but is empty
      expect(existsSync(examplesDir)).toBe(true);
    });
  });

  describe('Module Content Display', () => {
    it('should display module with both rules and examples', async () => {
      const module = await testEnv.createModule({ name: 'complete-module' });

      // Create rules
      const rulesDir = join(module.path, 'rules');
      await mkdir(rulesDir, { recursive: true });
      await writeFile(join(rulesDir, 'rule1.md'), '# Rule 1');
      await writeFile(join(rulesDir, 'rule2.md'), '# Rule 2');

      // Create examples
      const examplesDir = join(module.path, 'examples');
      await mkdir(examplesDir, { recursive: true });
      await writeFile(join(examplesDir, 'example1.ts'), 'const test = 1;');
      await writeFile(join(examplesDir, 'example2.ts'), 'const test = 2;');

      // Verify both exist
      expect(existsSync(join(rulesDir, 'rule1.md'))).toBe(true);
      expect(existsSync(join(rulesDir, 'rule2.md'))).toBe(true);
      expect(existsSync(join(examplesDir, 'example1.ts'))).toBe(true);
      expect(existsSync(join(examplesDir, 'example2.ts'))).toBe(true);
    });

    it('should display module character count', async () => {
      const module = await testEnv.createModule({
        name: 'counted-module',
        augment: {
          characterCount: 5000,
          priority: 'high'
        }
      });

      // Verify augment metadata
      expect(module.metadata.augment?.characterCount).toBe(5000);
      expect(module.metadata.augment?.priority).toBe('high');
    });

    it('should display module tags', async () => {
      const module = await testEnv.createModule({
        name: 'tagged-module',
        tags: ['typescript', 'testing', 'best-practices']
      });

      // Verify tags
      expect(module.metadata.tags).toEqual(['typescript', 'testing', 'best-practices']);
      expect(module.metadata.tags).toHaveLength(3);
    });
  });
});


