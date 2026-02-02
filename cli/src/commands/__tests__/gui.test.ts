/**
 * Unit tests for GUI components
 * Tests multi-selection, search/filtering, and keyboard navigation
 */

import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';
import { guiCommand } from '../gui';
import * as moduleSystem from '../../utils/module-system';
import * as linkCommand from '../link';

// Mock dependencies
jest.mock('fs');
jest.mock('inquirer');
jest.mock('../../utils/module-system');
jest.mock('../link');
jest.mock('chalk', () => ({
  default: {
    blue: (str: string) => str,
    green: (str: string) => str,
    red: (str: string) => str,
    gray: (str: string) => str,
    yellow: (str: string) => str,
    cyan: (str: string) => str,
    bold: {
      blue: (str: string) => str
    }
  },
  blue: (str: string) => str,
  green: (str: string) => str,
  red: (str: string) => str,
  gray: (str: string) => str,
  yellow: (str: string) => str,
  cyan: (str: string) => str
}));

const mockFs = fs as jest.Mocked<typeof fs>;
const mockInquirer = inquirer as jest.Mocked<typeof inquirer>;
const mockModuleSystem = moduleSystem as jest.Mocked<typeof moduleSystem>;
const mockLinkCommand = linkCommand as jest.Mocked<typeof linkCommand>;

describe('GUI Components', () => {
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

  describe('Multi-Selection', () => {
    it('should allow selecting multiple modules', async () => {
      const config = { modules: [] };
      const modules = [
        {
          fullName: 'coding-standards/html',
          metadata: { displayName: 'HTML Standards', description: 'HTML coding standards' }
        },
        {
          fullName: 'coding-standards/css',
          metadata: { displayName: 'CSS Standards', description: 'CSS coding standards' }
        }
      ];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverModules.mockReturnValue(modules);
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      mockInquirer.prompt.mockResolvedValueOnce({ action: 'link-modules' })
        .mockResolvedValueOnce({ selectedModules: ['coding-standards/html', 'coding-standards/css'] });

      mockLinkCommand.linkCommand.mockResolvedValue(undefined);

      await guiCommand();

      expect(mockInquirer.prompt).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'checkbox',
            name: 'selectedModules'
          })
        ])
      );
    });

    it('should handle no modules selected', async () => {
      const config = { modules: [] };
      const modules = [
        {
          fullName: 'coding-standards/html',
          metadata: { displayName: 'HTML Standards', description: 'HTML coding standards' }
        }
      ];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverModules.mockReturnValue(modules);
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      mockInquirer.prompt.mockResolvedValueOnce({ action: 'link-modules' })
        .mockResolvedValueOnce({ selectedModules: [] });

      await guiCommand();

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No modules selected'));
    });

    it('should show already linked modules as checked', async () => {
      const config = {
        modules: [
          { name: 'coding-standards/html', version: '1.0.0' }
        ]
      };
      const modules = [
        {
          fullName: 'coding-standards/html',
          metadata: { displayName: 'HTML Standards', description: 'HTML coding standards' }
        },
        {
          fullName: 'coding-standards/css',
          metadata: { displayName: 'CSS Standards', description: 'CSS coding standards' }
        }
      ];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverModules.mockReturnValue(modules);
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      mockInquirer.prompt.mockResolvedValueOnce({ action: 'link-modules' })
        .mockResolvedValueOnce({ selectedModules: ['coding-standards/html'] });

      await guiCommand();

      expect(mockLinkCommand.linkCommand).not.toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('already linked'));
    });
  });

  describe('Search and Filtering', () => {
    it('should filter modules by name', async () => {
      const config = { modules: [] };
      const modules = [
        {
          fullName: 'coding-standards/html',
          metadata: { displayName: 'HTML Standards', description: 'HTML coding standards', tags: ['html', 'web'] }
        },
        {
          fullName: 'coding-standards/python',
          metadata: { displayName: 'Python Standards', description: 'Python coding standards', tags: ['python'] }
        }
      ];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverModules.mockReturnValue(modules);
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      mockInquirer.prompt.mockResolvedValueOnce({ action: 'search' })
        .mockResolvedValueOnce({ searchTerm: 'html' })
        .mockResolvedValueOnce({ linkNow: false });

      await guiCommand();

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('HTML Standards'));
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Python Standards'));
    });

    it('should filter modules by description', async () => {
      const config = { modules: [] };
      const modules = [
        {
          fullName: 'coding-standards/html',
          metadata: { displayName: 'HTML Standards', description: 'HTML coding standards', tags: [] }
        },
        {
          fullName: 'workflows/openspec',
          metadata: { displayName: 'OpenSpec', description: 'Spec-driven development workflow', tags: [] }
        }
      ];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverModules.mockReturnValue(modules);
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      mockInquirer.prompt.mockResolvedValueOnce({ action: 'search' })
        .mockResolvedValueOnce({ searchTerm: 'workflow' })
        .mockResolvedValueOnce({ linkNow: false });

      await guiCommand();

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('OpenSpec'));
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('HTML Standards'));
    });

    it('should filter modules by tags', async () => {
      const config = { modules: [] };
      const modules = [
        {
          fullName: 'coding-standards/html',
          metadata: { displayName: 'HTML Standards', description: 'HTML coding standards', tags: ['html', 'web'] }
        },
        {
          fullName: 'coding-standards/python',
          metadata: { displayName: 'Python Standards', description: 'Python coding standards', tags: ['python', 'backend'] }
        }
      ];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverModules.mockReturnValue(modules);
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      mockInquirer.prompt.mockResolvedValueOnce({ action: 'search' })
        .mockResolvedValueOnce({ searchTerm: 'web' })
        .mockResolvedValueOnce({ linkNow: false });

      await guiCommand();

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('HTML Standards'));
    });

    it('should handle no search results', async () => {
      const config = { modules: [] };
      const modules = [
        {
          fullName: 'coding-standards/html',
          metadata: { displayName: 'HTML Standards', description: 'HTML coding standards', tags: [] }
        }
      ];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverModules.mockReturnValue(modules);
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      mockInquirer.prompt.mockResolvedValueOnce({ action: 'search' })
        .mockResolvedValueOnce({ searchTerm: 'nonexistent' })
        .mockResolvedValueOnce({ linkNow: false });

      await guiCommand();

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('No modules found'));
    });
  });

  describe('Keyboard Navigation', () => {
    it('should display keyboard shortcuts help', async () => {
      const config = { modules: [] };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverModules.mockReturnValue([]);
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      mockInquirer.prompt.mockResolvedValueOnce({ action: 'help' })
        .mockResolvedValueOnce({ action: 'exit' });

      await guiCommand();

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Keyboard Shortcuts'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Ctrl+A'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Ctrl+S'));
    });

    it('should show keyboard shortcut hint on startup', async () => {
      const config = { modules: [] };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverModules.mockReturnValue([]);
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      mockInquirer.prompt.mockResolvedValueOnce({ action: 'exit' });

      await guiCommand();

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Ctrl+H'));
    });

    it('should provide navigation instructions in checkbox prompts', async () => {
      const config = { modules: [] };
      const modules = [
        {
          fullName: 'coding-standards/html',
          metadata: { displayName: 'HTML Standards', description: 'HTML coding standards' }
        }
      ];

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(config));
      mockModuleSystem.discoverModules.mockReturnValue(modules);
      mockModuleSystem.discoverCollections.mockReturnValue([]);

      mockInquirer.prompt.mockResolvedValueOnce({ action: 'link-modules' })
        .mockResolvedValueOnce({ selectedModules: [] });

      await guiCommand();

      expect(mockInquirer.prompt).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            message: expect.stringContaining('↑↓')
          })
        ])
      );
    });
  });
});
