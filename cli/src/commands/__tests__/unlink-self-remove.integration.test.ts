/**
 * Integration tests for unlink and self-remove commands
 * Tests module unlinking, collection unlinking, self-remove (dry-run and actual), and dependency checking
 */

import * as fs from 'fs';
import * as path from 'path';
import { unlinkCommand } from '../unlink';
import { selfRemoveCommand } from '../self-remove';
import * as moduleSystem from '../../utils/module-system';

// Mock dependencies
jest.mock('fs');
jest.mock('inquirer');
jest.mock('../../utils/module-system');
jest.mock('chalk', () => ({
  default: {
    blue: (str: string) => str,
    green: (str: string) => str,
    red: (str: string) => str,
    gray: (str: string) => str,
    yellow: (str: string) => str,
    cyan: (str: string) => str
  },
  blue: (str: string) => str,
  green: (str: string) => str,
  red: (str: string) => str,
  gray: (str: string) => str,
  yellow: (str: string) => str,
  cyan: (str: string) => str
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockModuleSystem = moduleSystem as jest.Mocked<typeof moduleSystem>;

describe('Unlink and Self-Remove Integration Tests', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation() as any;
    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('Module Unlinking', () => {
    it('should unlink a single module successfully', async () => {
      const config = {
        modules: [
          { name: 'coding-standards/html', version: '1.0.0', type: 'coding-standards' },
          { name: 'coding-standards/css', version: '1.0.0', type: 'coding-standards' }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockFs.writeFileSync.mockImplementation(() => {});
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      await unlinkCommand('coding-standards/html');

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writtenConfig = JSON.parse(mockFs.writeFileSync.mock.calls[0][1] as string);
      expect(writtenConfig.modules).toHaveLength(1);
      expect(writtenConfig.modules[0].name).toBe('coding-standards/css');
    });

    it('should handle unlinking non-existent module', async () => {
      const config = {
        modules: [
          { name: 'coding-standards/html', version: '1.0.0', type: 'coding-standards' }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      await unlinkCommand('coding-standards/nonexistent');

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('not linked'));
    });

    it('should check dependencies before unlinking', async () => {
      const config = {
        modules: [
          { name: 'coding-standards/html', version: '1.0.0', type: 'coding-standards' },
          { name: 'workflows/web-dev', version: '1.0.0', type: 'workflow', dependencies: ['coding-standards/html'] }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      await unlinkCommand('coding-standards/html');

      expect(processExitSpy).toHaveBeenCalledWith(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('depend on it'));
    });

    it('should force unlink when --force flag is used', async () => {
      const config = {
        modules: [
          { name: 'coding-standards/html', version: '1.0.0', type: 'coding-standards' },
          { name: 'workflows/web-dev', version: '1.0.0', type: 'workflow', dependencies: ['coding-standards/html'] }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockFs.writeFileSync.mockImplementation(() => {});
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      await unlinkCommand('coding-standards/html', { force: true });

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writtenConfig = JSON.parse(mockFs.writeFileSync.mock.calls[0][1] as string);
      expect(writtenConfig.modules).toHaveLength(1);
      expect(writtenConfig.modules[0].name).toBe('workflows/web-dev');
    });
  });

  describe('Collection Unlinking', () => {
    it('should unlink all modules in a collection', async () => {
      const config = {
        modules: [
          { name: 'coding-standards/html', version: '1.0.0', type: 'coding-standards' },
          { name: 'coding-standards/css', version: '1.0.0', type: 'coding-standards' },
          { name: 'coding-standards/js', version: '1.0.0', type: 'coding-standards' }
        ]
      };

      const collection = {
        fullName: 'collections/html-css-js',
        metadata: {
          name: 'html-css-js',
          displayName: 'HTML, CSS, and JavaScript',
          modules: [
            { id: 'coding-standards/html', version: '1.0.0' },
            { id: 'coding-standards/css', version: '1.0.0' },
            { id: 'coding-standards/js', version: '1.0.0' }
          ]
        }
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockFs.writeFileSync.mockImplementation(() => {});
      mockModuleSystem.discoverCollections.mockReturnValue([collection]);

      await unlinkCommand('collections/html-css-js');

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writtenConfig = JSON.parse(mockFs.writeFileSync.mock.calls[0][1] as string);
      expect(writtenConfig.modules).toHaveLength(0);
    });
  });

  describe('Self-Remove (Dry-Run)', () => {
    it('should show what would be removed in dry-run mode', async () => {
      const config = {
        modules: [
          { name: 'coding-standards/html', version: '1.0.0', type: 'coding-standards' },
          { name: 'coding-standards/css', version: '1.0.0', type: 'coding-standards' }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      await selfRemoveCommand({ dryRun: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Dry-run mode'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('coding-standards/html'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('coding-standards/css'));
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('should not remove anything in dry-run mode', async () => {
      const config = {
        modules: [
          { name: 'coding-standards/html', version: '1.0.0', type: 'coding-standards' }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));

      await selfRemoveCommand({ dryRun: true });

      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('Self-Remove (Actual)', () => {
    it('should remove all modules with force flag', async () => {
      const config = {
        modules: [
          { name: 'coding-standards/html', version: '1.0.0', type: 'coding-standards' },
          { name: 'coding-standards/css', version: '1.0.0', type: 'coding-standards' }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockFs.writeFileSync.mockImplementation(() => {});

      await selfRemoveCommand({ force: true });

      expect(mockFs.writeFileSync).toHaveBeenCalled();
      const writtenConfig = JSON.parse(mockFs.writeFileSync.mock.calls[0][1] as string);
      expect(writtenConfig.modules).toHaveLength(0);
    });

    it('should create removal log file', async () => {
      const config = {
        modules: [
          { name: 'coding-standards/html', version: '1.0.0', type: 'coding-standards' }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockFs.writeFileSync.mockImplementation(() => {});

      await selfRemoveCommand({ force: true });

      const logCalls = mockFs.writeFileSync.mock.calls.filter(call =>
        (call[0] as string).includes('.augment-removal.log')
      );
      expect(logCalls.length).toBeGreaterThan(0);
    });

    it('should handle non-existent extensions.json', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await selfRemoveCommand({ force: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('Dependency Checking', () => {
    it('should warn about broken dependencies when unlinking', async () => {
      const config = {
        modules: [
          { name: 'coding-standards/html', version: '1.0.0', type: 'coding-standards' },
          { name: 'workflows/web-dev', version: '1.0.0', type: 'workflow', dependencies: ['coding-standards/html'] }
        ]
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      await unlinkCommand('coding-standards/html');

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('depend on it'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('workflows/web-dev'));
    });
  });
});
