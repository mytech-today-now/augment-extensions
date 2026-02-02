/**
 * Integration tests for module inspection commands
 * Tests complete workflows, VS Code integration, and error handling
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const TEST_MODULE_PATH = path.join(__dirname, '../../../test-fixtures/test-module');
const CLI_PATH = path.join(__dirname, '../../../dist/cli.js');

describe('Module Inspection Integration Tests', () => {
  beforeAll(() => {
    // Create test module fixture
    if (!fs.existsSync(TEST_MODULE_PATH)) {
      fs.mkdirSync(TEST_MODULE_PATH, { recursive: true });
      fs.mkdirSync(path.join(TEST_MODULE_PATH, 'rules'));
      fs.mkdirSync(path.join(TEST_MODULE_PATH, 'examples'));
      
      // Create module.json
      fs.writeFileSync(
        path.join(TEST_MODULE_PATH, 'module.json'),
        JSON.stringify({
          name: 'test-module',
          version: '1.0.0',
          displayName: 'Test Module',
          description: 'A test module for integration testing',
          type: 'testing'
        }, null, 2)
      );
      
      // Create test rule file
      fs.writeFileSync(
        path.join(TEST_MODULE_PATH, 'rules', 'test-rule.md'),
        '# Test Rule\n\nThis is a test rule file.\n\n## Example\n\n```javascript\nconsole.log("test");\n```'
      );
      
      // Create test example file
      fs.writeFileSync(
        path.join(TEST_MODULE_PATH, 'examples', 'test-example.md'),
        '# Test Example\n\nThis is a test example file.'
      );
    }
  });

  afterAll(() => {
    // Clean up test fixtures
    if (fs.existsSync(TEST_MODULE_PATH)) {
      fs.rmSync(TEST_MODULE_PATH, { recursive: true, force: true });
    }
  });

  describe('Complete Workflow Tests', () => {
    it('should discover and display module overview', () => {
      const output = execSync(`node ${CLI_PATH} show module test-module`, { encoding: 'utf-8' });
      expect(output).toContain('Test Module');
      expect(output).toContain('1.0.0');
      expect(output).toContain('testing');
    });

    it('should list all files in module', () => {
      const output = execSync(`node ${CLI_PATH} show module test-module`, { encoding: 'utf-8' });
      expect(output).toContain('test-rule.md');
      expect(output).toContain('test-example.md');
    });

    it('should display aggregated content', () => {
      const output = execSync(`node ${CLI_PATH} show module test-module --content`, { encoding: 'utf-8' });
      expect(output).toContain('Test Rule');
      expect(output).toContain('Test Example');
    });

    it('should display individual file with line numbers', () => {
      const output = execSync(`node ${CLI_PATH} show module test-module rules/test-rule.md`, { encoding: 'utf-8' });
      expect(output).toContain('Test Rule');
      expect(output).toMatch(/\d+\s+#\s+Test\s+Rule/);
    });

    it('should output JSON format', () => {
      const output = execSync(`node ${CLI_PATH} show module test-module --json`, { encoding: 'utf-8' });
      const json = JSON.parse(output);
      expect(json.module).toBe('test-module');
      expect(json.metadata.version).toBe('1.0.0');
    });

    it('should output Markdown format', () => {
      const output = execSync(`node ${CLI_PATH} show module test-module --content --format markdown`, { encoding: 'utf-8' });
      expect(output).toContain('# test-module');
      expect(output).toContain('**Module Type:**');
      expect(output).toContain('**Version:**');
    });

    it('should output plain text format', () => {
      const output = execSync(`node ${CLI_PATH} show module test-module --content --format text`, { encoding: 'utf-8' });
      expect(output).toContain('Aggregated Content: test-module');
      expect(output).toMatch(/={60}/);
    });

    it('should filter files by pattern', () => {
      const output = execSync(`node ${CLI_PATH} show module test-module --content --filter "*.md"`, { encoding: 'utf-8' });
      expect(output).toContain('test-rule.md');
      expect(output).toContain('test-example.md');
    });

    it('should search within module content', () => {
      const output = execSync(`node ${CLI_PATH} show module test-module --search "test"`, { encoding: 'utf-8' });
      expect(output).toContain('test');
    });

    it('should paginate large output', () => {
      const output = execSync(`node ${CLI_PATH} show module test-module --content --page 1 --page-size 1`, { encoding: 'utf-8' });
      expect(output).toContain('Page 1');
    });

    it('should redact sensitive data with --secure flag', () => {
      // Create file with sensitive data
      const sensitiveFile = path.join(TEST_MODULE_PATH, 'rules', 'sensitive.md');
      fs.writeFileSync(sensitiveFile, 'API_KEY=secret123\nPASSWORD=mypassword');
      
      const output = execSync(`node ${CLI_PATH} show module test-module rules/sensitive.md --secure`, { encoding: 'utf-8' });
      expect(output).not.toContain('secret123');
      expect(output).not.toContain('mypassword');
      expect(output).toContain('[REDACTED]');
      
      // Clean up
      fs.unlinkSync(sensitiveFile);
    });

    it('should use caching for repeated requests', () => {
      const start1 = Date.now();
      execSync(`node ${CLI_PATH} show module test-module`, { encoding: 'utf-8' });
      const time1 = Date.now() - start1;
      
      const start2 = Date.now();
      execSync(`node ${CLI_PATH} show module test-module`, { encoding: 'utf-8' });
      const time2 = Date.now() - start2;
      
      // Second request should be faster due to caching
      expect(time2).toBeLessThanOrEqual(time1);
    });

    it('should bypass cache with --no-cache flag', () => {
      const output = execSync(`node ${CLI_PATH} show module test-module --no-cache`, { encoding: 'utf-8' });
      expect(output).toContain('Test Module');
    });
  });

  describe('Error Handling Tests', () => {
    it('should handle non-existent module gracefully', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} show module non-existent-module`, { encoding: 'utf-8' });
      }).toThrow();
    });

    it('should handle non-existent file gracefully', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} show module test-module non-existent-file.md`, { encoding: 'utf-8' });
      }).toThrow();
    });

    it('should handle invalid format option', () => {
      expect(() => {
        execSync(`node ${CLI_PATH} show module test-module --format invalid`, { encoding: 'utf-8' });
      }).toThrow();
    });
  });
});

