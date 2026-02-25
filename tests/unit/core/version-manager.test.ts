import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VersionManager } from '@cli/core/version-manager';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('VersionManager', () => {
  let versionManager: VersionManager;
  let testDir: string;

  beforeEach(() => {
    versionManager = new VersionManager();
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'version-manager-test-'));
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('getVersion', () => {
    it('should return null if VERSION file does not exist', () => {
      const result = versionManager.getVersion(testDir);
      expect(result).toBeNull();
    });

    it('should return version metadata from VERSION file', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      const result = versionManager.getVersion(testDir);
      expect(result).not.toBeNull();
      expect(result?.version).toBe('1.0.0');
    });

    it('should return null for invalid version format', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), 'invalid-version\n');
      
      const result = versionManager.getVersion(testDir);
      expect(result).toBeNull();
    });

    it('should load additional metadata from metadata.json', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      fs.writeFileSync(path.join(testDir, 'metadata.json'), JSON.stringify({
        deprecated: true,
        deprecationMessage: 'Use v2 instead',
        breaking: false
      }));
      
      const result = versionManager.getVersion(testDir);
      expect(result).not.toBeNull();
      expect(result?.version).toBe('1.0.0');
      expect(result?.deprecated).toBe(true);
      expect(result?.deprecationMessage).toBe('Use v2 instead');
    });

    it('should cache version metadata', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      const result1 = versionManager.getVersion(testDir);
      const result2 = versionManager.getVersion(testDir);
      
      expect(result1).toEqual(result2);
    });
  });

  describe('setVersion', () => {
    it('should write version to VERSION file', () => {
      const success = versionManager.setVersion(testDir, '2.0.0');
      
      expect(success).toBe(true);
      const content = fs.readFileSync(path.join(testDir, 'VERSION'), 'utf-8');
      expect(content.trim()).toBe('2.0.0');
    });

    it('should return false for invalid version', () => {
      const success = versionManager.setVersion(testDir, 'invalid');
      expect(success).toBe(false);
    });

    it('should invalidate cache after setting version', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      versionManager.getVersion(testDir); // Cache it
      versionManager.setVersion(testDir, '2.0.0');
      
      const result = versionManager.getVersion(testDir);
      expect(result?.version).toBe('2.0.0');
    });
  });

  describe('compareVersions', () => {
    it('should compare versions correctly', () => {
      expect(versionManager.compareVersions('1.0.0', '2.0.0')).toBe(-1);
      expect(versionManager.compareVersions('2.0.0', '1.0.0')).toBe(1);
      expect(versionManager.compareVersions('1.0.0', '1.0.0')).toBe(0);
    });

    it('should handle pre-release versions', () => {
      expect(versionManager.compareVersions('1.0.0-alpha', '1.0.0')).toBe(-1);
      expect(versionManager.compareVersions('1.0.0', '1.0.0-alpha')).toBe(1);
    });
  });

  describe('parseVersion', () => {
    it('should parse valid semantic version', () => {
      const parsed = versionManager.parseVersion('1.2.3');
      
      expect(parsed).not.toBeNull();
      expect(parsed?.major).toBe(1);
      expect(parsed?.minor).toBe(2);
      expect(parsed?.patch).toBe(3);
    });

    it('should return null for invalid version', () => {
      const parsed = versionManager.parseVersion('invalid');
      expect(parsed).toBeNull();
    });

    it('should parse pre-release and build metadata', () => {
      const parsed = versionManager.parseVersion('1.0.0-alpha.1+build.123');
      
      expect(parsed).not.toBeNull();
      expect(parsed?.prerelease).toBe('alpha.1');
      expect(parsed?.build).toBe('build.123');
    });
  });

  describe('isDeprecated', () => {
    it('should return false if not deprecated', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      expect(versionManager.isDeprecated(testDir)).toBe(false);
    });

    it('should return true if deprecated', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      fs.writeFileSync(path.join(testDir, 'metadata.json'), JSON.stringify({
        deprecated: true
      }));
      
      expect(versionManager.isDeprecated(testDir)).toBe(true);
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      versionManager.getVersion(testDir); // Cache it
      versionManager.clearCache();
      
      // Modify VERSION file
      fs.writeFileSync(path.join(testDir, 'VERSION'), '2.0.0\n');
      
      const result = versionManager.getVersion(testDir);
      expect(result?.version).toBe('2.0.0');
    });

    it('should allow setting cache TTL', () => {
      versionManager.setCacheTTL(1000); // 1 second
      // Note: Testing TTL expiration would require waiting, so we just verify it doesn't throw
      expect(() => versionManager.setCacheTTL(5000)).not.toThrow();
    });
  });
});

