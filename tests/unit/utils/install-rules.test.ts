/**
 * Tests for install-rules utilities
 */

import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { installCharacterCountRule, InstallRulesError } from '../install-rules';

// Mock fs modules
jest.mock('fs/promises');
jest.mock('fs');

// Mock chalk to avoid ESM issues
jest.mock('chalk', () => ({
  default: {
    green: (str: string) => str,
    yellow: (str: string) => str,
    red: (str: string) => str,
    gray: (str: string) => str,
    blue: (str: string) => str,
    bold: {
      green: (str: string) => str,
      blue: (str: string) => str
    }
  },
  green: (str: string) => str,
  yellow: (str: string) => str,
  red: (str: string) => str,
  gray: (str: string) => str,
  blue: (str: string) => str,
  bold: {
    green: (str: string) => str,
    blue: (str: string) => str
  }
}));

describe('Install Rules', () => {
  const mockTargetDir = '/test/project';
  const mockAugmentDir = path.join(mockTargetDir, '.augment');
  const mockRulesDir = path.join(mockAugmentDir, 'rules');
  const mockRulePath = path.join(mockRulesDir, 'character-count-management.md');

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mocks
    (fsSync.existsSync as jest.Mock).mockReturnValue(false);
    (fs.access as jest.Mock).mockResolvedValue(undefined);
    (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
    (fs.readFile as jest.Mock).mockResolvedValue('');
  });

  describe('installCharacterCountRule', () => {
    it('should create .augment/rules directory and install rule file', async () => {
      const result = await installCharacterCountRule({
        targetDir: mockTargetDir,
        verbose: false
      });

      expect(result.success).toBe(true);
      expect(result.created).toBe(true);
      expect(result.skipped).toBe(false);
      expect(fs.mkdir).toHaveBeenCalledWith(mockAugmentDir, { recursive: true });
      expect(fs.mkdir).toHaveBeenCalledWith(mockRulesDir, { recursive: true });
      expect(fs.writeFile).toHaveBeenCalledWith(
        mockRulePath,
        expect.stringContaining('Character Count Management'),
        'utf-8'
      );
    });

    it('should skip installation if rule already exists with same content', async () => {
      const ruleContent = `---
type: "always_apply"
---

# Character Count Management for .augment/ Directory`;

      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFile as jest.Mock).mockResolvedValue(ruleContent);

      const result = await installCharacterCountRule({
        targetDir: mockTargetDir,
        skipIfExists: true,
        verbose: false
      });

      expect(result.success).toBe(true);
      expect(result.created).toBe(false);
      expect(result.skipped).toBe(true);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should skip installation if rule exists with different content and skipIfExists is true', async () => {
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFile as jest.Mock).mockResolvedValue('Different content');

      const result = await installCharacterCountRule({
        targetDir: mockTargetDir,
        skipIfExists: true,
        verbose: false
      });

      expect(result.success).toBe(true);
      expect(result.created).toBe(false);
      expect(result.skipped).toBe(true);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should replace rule if force option is true', async () => {
      (fsSync.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFile as jest.Mock).mockResolvedValue('Different content');
      (fs.copyFile as jest.Mock).mockResolvedValue(undefined);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);

      const result = await installCharacterCountRule({
        targetDir: mockTargetDir,
        force: true,
        verbose: false
      });

      expect(result.success).toBe(true);
      expect(result.updated).toBe(true);
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should handle permission denied errors', async () => {
      const permError = new Error('Permission denied') as NodeJS.ErrnoException;
      permError.code = 'EACCES';
      (fs.mkdir as jest.Mock).mockRejectedValue(permError);

      const result = await installCharacterCountRule({
        targetDir: mockTargetDir,
        verbose: false
      });

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('PERMISSION_DENIED');
      expect(result.error).toContain('Permission denied');
    });

    it('should handle disk full errors', async () => {
      const diskError = new Error('No space left') as NodeJS.ErrnoException;
      diskError.code = 'ENOSPC';
      (fs.writeFile as jest.Mock).mockRejectedValue(diskError);

      const result = await installCharacterCountRule({
        targetDir: mockTargetDir,
        verbose: false
      });

      expect(result.success).toBe(false);
      expect(result.errorType).toBe('DISK_FULL');
      expect(result.error).toContain('Disk full');
    });

    it('should use default target directory if not provided', async () => {
      const result = await installCharacterCountRule({
        verbose: false
      });

      expect(result.success).toBe(true);
      expect(fs.mkdir).toHaveBeenCalled();
    });
  });
});

