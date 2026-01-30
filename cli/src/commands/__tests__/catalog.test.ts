/**
 * Unit tests for catalog commands
 * Tests catalog command execution layer
 */

import * as catalogCommands from '../catalog';
import * as modulesCatalog from '../../utils/modules-catalog';
import * as catalogSync from '../../utils/catalog-sync';

// Mock dependencies
jest.mock('../../utils/modules-catalog');
jest.mock('../../utils/catalog-sync');
jest.mock('chalk', () => ({
  default: {
    blue: (str: string) => str,
    green: (str: string) => str,
    red: (str: string) => str,
    gray: (str: string) => str,
    yellow: (str: string) => str,
    cyan: (str: string) => str,
    bold: (str: string) => str
  },
  blue: (str: string) => str,
  green: (str: string) => str,
  red: (str: string) => str,
  gray: (str: string) => str,
  yellow: (str: string) => str,
  cyan: (str: string) => str,
  bold: (str: string) => str
}));

describe('Catalog Commands', () => {
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

  describe('catalogCommand', () => {
    it('should check catalog is up to date', async () => {
      (catalogSync.isCatalogOutOfDate as jest.Mock).mockReturnValue(false);

      await catalogCommands.catalogCommand({ check: true });

      expect(catalogSync.isCatalogOutOfDate).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('up to date'));
      expect(processExitSpy).toHaveBeenCalledWith(0);
    });

    it('should report out of date catalog', async () => {
      (catalogSync.isCatalogOutOfDate as jest.Mock).mockReturnValue(true);

      await catalogCommands.catalogCommand({ check: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('out of date'));
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it('should auto-update catalog when out of date', async () => {
      (catalogSync.autoUpdateCatalog as jest.Mock).mockReturnValue(true);

      await catalogCommands.catalogCommand({ auto: true });

      expect(catalogSync.autoUpdateCatalog).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('updated'));
    });

    it('should skip update when catalog is already up to date', async () => {
      (catalogSync.autoUpdateCatalog as jest.Mock).mockReturnValue(false);

      await catalogCommands.catalogCommand({ auto: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('already up to date'));
    });

    it('should handle update errors', async () => {
      (catalogSync.autoUpdateCatalog as jest.Mock).mockImplementation(() => {
        throw new Error('Update failed');
      });

      await catalogCommands.catalogCommand({ auto: true });

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('catalogHookCommand', () => {
    it('should create git hook', async () => {
      (catalogSync.createCatalogGitHook as jest.Mock).mockImplementation();

      await catalogCommands.catalogHookCommand();

      expect(catalogSync.createCatalogGitHook).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('configured'));
    });

    it('should remove git hook', async () => {
      (catalogSync.removeCatalogGitHook as jest.Mock).mockImplementation();

      await catalogCommands.catalogHookCommand({ remove: true });

      expect(catalogSync.removeCatalogGitHook).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('removed'));
    });

    it('should handle hook creation errors', async () => {
      (catalogSync.createCatalogGitHook as jest.Mock).mockImplementation(() => {
        throw new Error('Creation failed');
      });

      await catalogCommands.catalogHookCommand();

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});

