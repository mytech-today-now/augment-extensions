import { describe, it, expect } from 'vitest';
import { loadModule, discoverModules } from '@cli/utils/module-system';
import { join } from 'path';

const MODULES_ROOT = join(process.cwd(), 'augment-extensions');
const SOFTWARE_ARCHITECTURE_PATH = join(
  MODULES_ROOT,
  'domain-rules',
  'software-architecture'
);
const CATPPUCCIN_MOCHA_PATH = join(
  MODULES_ROOT,
  'domain-rules',
  'design',
  'color',
  'themes',
  'catppuccin-mocha'
);

describe('Submodule Discovery', () => {
  describe('Submodule metadata', () => {
    it('loads declared software architecture submodules', () => {
      const architecture = loadModule(SOFTWARE_ARCHITECTURE_PATH);

      expect(architecture).not.toBeNull();
      expect(architecture?.isSubModule).toBe(false);
      expect(architecture?.subModules).toHaveLength(5);
      expect(architecture?.subModules).toEqual(expect.arrayContaining([
        'domain-rules/software-architecture/fundamentals',
        'domain-rules/software-architecture/patterns',
        'domain-rules/software-architecture/quality',
        'domain-rules/software-architecture/practices',
        'domain-rules/software-architecture/specialized'
      ]));
    });

    it('derives the parent path for a real nested module', () => {
      const theme = loadModule(CATPPUCCIN_MOCHA_PATH);

      expect(theme).not.toBeNull();
      expect(theme?.fullName).toBe('domain-rules/design/color/themes/catppuccin-mocha');
      expect(theme?.isSubModule).toBe(true);
      expect(theme?.parentModule).toBe('domain-rules/design/color/themes');
    });
  });

  describe('Module discovery', () => {
    it('discovers the real parent module and nested theme module', () => {
      const modules = discoverModules();

      expect(modules.find(module => module.fullName === 'domain-rules/software-architecture'))
        .toBeDefined();
      expect(modules.find(module => module.fullName === 'domain-rules/design/color/themes/catppuccin-mocha'))
        .toMatchObject({
          isSubModule: true,
          parentModule: 'domain-rules/design/color/themes'
        });
    });

    it('does not mark known top-level modules as submodules', () => {
      const modules = discoverModules();
      const topLevelPaths = [
        'coding-standards/typescript',
        'coding-standards/php',
        'domain-rules/api-design',
        'workflows/beads'
      ];

      for (const modulePath of topLevelPaths) {
        const module = modules.find(item => item.fullName === modulePath);
        if (module) {
          expect(module.isSubModule).toBe(false);
          expect(module.parentModule).toBeUndefined();
        }
      }
    });

    it('preserves valid parent references for discovered nested modules', () => {
      const modules = discoverModules();

      for (const subModule of modules.filter(module => module.isSubModule)) {
        expect(subModule.parentModule).toBeDefined();

        const parent = modules.find(module => module.fullName === subModule.parentModule);
        if (parent) {
          expect(parent.subModules).toContain(subModule.fullName);
        }
      }
    });
  });
});
