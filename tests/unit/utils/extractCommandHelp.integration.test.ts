/**
 * Integration tests for extractCommandHelp utility.
 * Uses a real child process with deterministic help commands.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  extractCommandHelp,
  extractAllHelp,
  detectTools
} from '@cli/utils/extractCommandHelp';
import type { Tool } from '@cli/utils/extractCommandHelp';

const NODE_HELP_TOOLS: Tool[] = [
  { name: 'Beads', command: `"${process.execPath}"`, directory: '.beads' },
  { name: 'OpenSpec', command: `"${process.execPath}"`, directory: 'openspec' },
  { name: 'Augx', command: `"${process.execPath}"`, directory: '.augment' }
];

describe('extractCommandHelp integration tests', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'augx-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('extractCommandHelp with configured tools', () => {
    it('extracts help from all detected tools and writes the result', async () => {
      for (const tool of NODE_HELP_TOOLS) {
        fs.mkdirSync(path.join(tempDir, tool.directory), { recursive: true });
      }

      const outputPath = '.augment/COMMAND_HELP.md';
      const result = await extractCommandHelp(tempDir, outputPath, NODE_HELP_TOOLS);
      const fullOutputPath = path.join(tempDir, outputPath);

      expect(fs.existsSync(fullOutputPath)).toBe(true);
      expect(result).toContain('# Command Help Reference');
      expect(result).toContain('**Generated**:');
      expect(result).toContain('**Version**: 1.0.0');
      expect(result).toContain('Beads Commands');
      expect(fs.readFileSync(fullOutputPath, 'utf8')).toBe(result);
    });

    it('handles a subset of configured tools', async () => {
      const augxTool = NODE_HELP_TOOLS[2];
      fs.mkdirSync(path.join(tempDir, augxTool.directory), { recursive: true });

      const result = await extractCommandHelp(tempDir, undefined, NODE_HELP_TOOLS);

      expect(result).toContain('# Command Help Reference');
      expect(result).toContain('Augx Commands');
      expect(result).not.toContain('Beads Commands');
    });

    it('skips extraction when no configured tool directories exist', async () => {
      const outputPath = '.augment/COMMAND_HELP.md';

      const result = await extractCommandHelp(tempDir, outputPath, NODE_HELP_TOOLS);

      expect(result).toBe('');
      expect(fs.existsSync(path.join(tempDir, outputPath))).toBe(false);
    });
  });

  describe('extractAllHelp', () => {
    it('executes help for detected tools in child processes', async () => {
      const beadsTool = NODE_HELP_TOOLS[0];
      fs.mkdirSync(path.join(tempDir, beadsTool.directory), { recursive: true });

      const helpMap = await extractAllHelp(tempDir, NODE_HELP_TOOLS);

      expect(helpMap.size).toBe(1);
      const [tool, helpNode] = Array.from(helpMap.entries())[0];
      expect(tool.name).toBe('Beads');
      expect(helpNode.command).toBe(`"${process.execPath}"`);
      expect(helpNode.help).toContain('Usage:');
    });

    it('handles command execution failures gracefully', async () => {
      const failingTool: Tool = {
        name: 'Missing Tool',
        command: 'augx-command-that-does-not-exist',
        directory: '.beads'
      };
      fs.mkdirSync(path.join(tempDir, failingTool.directory), { recursive: true });

      await expect(extractAllHelp(tempDir, [failingTool])).resolves.toBeDefined();
    });
  });

  describe('detectTools', () => {
    it('detects configured tools with existing directories', () => {
      for (const tool of NODE_HELP_TOOLS) {
        fs.mkdirSync(path.join(tempDir, tool.directory), { recursive: true });
      }

      const tools = detectTools(tempDir, NODE_HELP_TOOLS);

      expect(tools).toHaveLength(3);
      expect(tools.map(tool => tool.name)).toEqual(['Beads', 'OpenSpec', 'Augx']);
    });

    it('only detects configured tools with existing directories', () => {
      const beadsTool = NODE_HELP_TOOLS[0];
      fs.mkdirSync(path.join(tempDir, beadsTool.directory), { recursive: true });

      expect(detectTools(tempDir, NODE_HELP_TOOLS)).toEqual([beadsTool]);
    });

    it('returns an empty array when no configured tool directories exist', () => {
      expect(detectTools(tempDir, NODE_HELP_TOOLS)).toEqual([]);
    });
  });

  describe('output file creation', () => {
    it('creates the output directory when needed', async () => {
      const augxTool = NODE_HELP_TOOLS[2];
      fs.mkdirSync(path.join(tempDir, augxTool.directory), { recursive: true });
      const outputPath = 'nested/dir/COMMAND_HELP.md';

      await extractCommandHelp(tempDir, outputPath, NODE_HELP_TOOLS);

      expect(fs.existsSync(path.join(tempDir, outputPath))).toBe(true);
    });
  });
});
