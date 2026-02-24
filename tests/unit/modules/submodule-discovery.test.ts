import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestEnvironment, type TestEnvironment } from '../../helpers/test-env';
import { loadModule, discoverModules } from '@cli/utils/module-system';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import * as fs from 'fs';

describe('Submodule Discovery', () => {
  let testEnv: TestEnvironment;

  beforeEach(async () => {
    testEnv = await createTestEnvironment();
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  describe('Submodule Detection', () => {
    it('should detect screenplay cinematic-styles as a submodule', () => {
      // Load the actual screenplay module
      const screenplayPath = join(process.cwd(), 'augment-extensions', 'writing-standards', 'screenplay');
      const screenplay = loadModule(screenplayPath);

      expect(screenplay).not.toBeNull();
      expect(screenplay?.isSubModule).toBe(false);
      expect(screenplay?.subModules).toBeDefined();
      expect(screenplay?.subModules?.length).toBeGreaterThan(0);
      
      // Check if cinematic-styles is in submodules
      const hasCinematicStyles = screenplay?.subModules?.some(
        sub => sub.includes('cinematic-styles')
      );
      expect(hasCinematicStyles).toBe(true);
    });

    it('should detect cinematic-styles as a submodule with parent reference', () => {
      const cinematicStylesPath = join(
        process.cwd(), 
        'augment-extensions', 
        'writing-standards', 
        'screenplay', 
        'cinematic-styles'
      );
      const cinematicStyles = loadModule(cinematicStylesPath);

      expect(cinematicStyles).not.toBeNull();
      expect(cinematicStyles?.isSubModule).toBe(true);
      expect(cinematicStyles?.parentModule).toBe('writing-standards/screenplay');
    });

    it('should detect all screenplay submodules', () => {
      const screenplayPath = join(process.cwd(), 'augment-extensions', 'writing-standards', 'screenplay');
      const screenplay = loadModule(screenplayPath);

      expect(screenplay?.subModules).toBeDefined();
      
      // Based on module.json, should have: styles, cinematic-styles, genres, themes
      const expectedSubModules = ['styles', 'cinematic-styles', 'genres', 'themes'];
      
      for (const expectedSub of expectedSubModules) {
        const hasSubModule = screenplay?.subModules?.some(
          sub => sub.endsWith(expectedSub)
        );
        
        // Only check if the submodule directory exists
        const subModulePath = join(screenplayPath, expectedSub);
        if (fs.existsSync(join(subModulePath, 'module.json'))) {
          expect(hasSubModule).toBe(true);
        }
      }
    });
  });

  describe('Module Discovery with Submodules', () => {
    it('should discover both parent and submodules', () => {
      const modules = discoverModules();
      
      // Find screenplay module
      const screenplay = modules.find(m => m.fullName === 'writing-standards/screenplay');
      expect(screenplay).toBeDefined();
      expect(screenplay?.isSubModule).toBe(false);
      
      // Find cinematic-styles submodule
      const cinematicStyles = modules.find(m => 
        m.fullName === 'writing-standards/screenplay/cinematic-styles'
      );
      expect(cinematicStyles).toBeDefined();
      expect(cinematicStyles?.isSubModule).toBe(true);
      expect(cinematicStyles?.parentModule).toBe('writing-standards/screenplay');
    });

    it('should include submodules in total module count', () => {
      const modules = discoverModules();
      const writingStandardsModules = modules.filter(m => 
        m.fullName.startsWith('writing-standards/')
      );
      
      // Should include screenplay and its submodules
      expect(writingStandardsModules.length).toBeGreaterThan(1);
    });
  });

  describe('Top-level Module Detection', () => {
    it('should not mark top-level modules as submodules', () => {
      const modules = discoverModules();
      
      // Check some known top-level modules
      const topLevelPaths = [
        'coding-standards/typescript',
        'coding-standards/php',
        'domain-rules/api-design',
        'workflows/beads'
      ];
      
      for (const modulePath of topLevelPaths) {
        const module = modules.find(m => m.fullName === modulePath);
        if (module) {
          expect(module.isSubModule).toBe(false);
          expect(module.parentModule).toBeUndefined();
        }
      }
    });
  });

  describe('Submodule Hierarchy', () => {
    it('should maintain correct parent-child relationships', () => {
      const modules = discoverModules();
      
      // Find all submodules
      const subModules = modules.filter(m => m.isSubModule);
      
      // Each submodule should have a valid parent
      for (const subModule of subModules) {
        expect(subModule.parentModule).toBeDefined();
        
        // Parent should exist in modules list
        const parent = modules.find(m => m.fullName === subModule.parentModule);
        expect(parent).toBeDefined();
        
        // Parent should list this submodule
        expect(parent?.subModules).toBeDefined();
        expect(parent?.subModules).toContain(subModule.fullName);
      }
    });
  });
});

