import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VersionResolver } from '@cli/core/version-resolver';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('VersionResolver', () => {
  let resolver: VersionResolver;
  let testDir: string;

  beforeEach(() => {
    resolver = new VersionResolver();
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'version-resolver-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('resolveLatest', () => {
    it('should return null if no VERSION file exists', () => {
      const result = resolver.resolveLatest(testDir);
      expect(result).toBeNull();
    });

    it('should resolve latest version', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.2.3\n');
      
      const result = resolver.resolveLatest(testDir);
      expect(result).not.toBeNull();
      expect(result?.version).toBe('1.2.3');
      expect(result?.strategy).toBe('latest');
    });

    it('should include available versions in result', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      const result = resolver.resolveLatest(testDir);
      expect(result?.available).toEqual(['1.0.0']);
    });
  });

  describe('resolveSpecific', () => {
    it('should return null if version does not exist', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      const result = resolver.resolveSpecific(testDir, '2.0.0');
      expect(result).toBeNull();
    });

    it('should resolve specific version', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      const result = resolver.resolveSpecific(testDir, '1.0.0');
      expect(result).not.toBeNull();
      expect(result?.version).toBe('1.0.0');
      expect(result?.strategy).toBe('specific');
    });

    it('should return null for invalid version format', () => {
      const result = resolver.resolveSpecific(testDir, 'invalid');
      expect(result).toBeNull();
    });
  });

  describe('resolveRange', () => {
    it('should return null if no matching version found', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      const result = resolver.resolveRange(testDir, '^2.0.0');
      expect(result).toBeNull();
    });

    it('should resolve version matching caret range', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.2.3\n');
      
      const result = resolver.resolveRange(testDir, '^1.0.0');
      expect(result).not.toBeNull();
      expect(result?.version).toBe('1.2.3');
      expect(result?.strategy).toBe('range');
    });

    it('should resolve version matching tilde range', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.2.5\n');
      
      const result = resolver.resolveRange(testDir, '~1.2.0');
      expect(result).not.toBeNull();
      expect(result?.version).toBe('1.2.5');
    });

    it('should resolve version matching >= operator', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '2.0.0\n');
      
      const result = resolver.resolveRange(testDir, '>=1.0.0');
      expect(result).not.toBeNull();
      expect(result?.version).toBe('2.0.0');
    });
  });

  describe('resolve (automatic strategy)', () => {
    beforeEach(() => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.2.3\n');
    });

    it('should resolve "latest" keyword', () => {
      const result = resolver.resolve(testDir, 'latest');
      expect(result?.strategy).toBe('latest');
      expect(result?.version).toBe('1.2.3');
    });

    it('should resolve "*" as latest', () => {
      const result = resolver.resolve(testDir, '*');
      expect(result?.strategy).toBe('latest');
    });

    it('should resolve specific version', () => {
      const result = resolver.resolve(testDir, '1.2.3');
      expect(result?.strategy).toBe('specific');
      expect(result?.version).toBe('1.2.3');
    });

    it('should resolve range version', () => {
      const result = resolver.resolve(testDir, '^1.0.0');
      expect(result?.strategy).toBe('range');
      expect(result?.version).toBe('1.2.3');
    });

    it('should default to latest if no version specified', () => {
      const result = resolver.resolve(testDir);
      expect(result?.strategy).toBe('latest');
    });
  });

  describe('version path resolution', () => {
    it('should return correct path for resolved version', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0\n');
      
      const result = resolver.resolveLatest(testDir);
      expect(result?.path).toBe(testDir);
    });
  });

  describe('edge cases', () => {
    it('should handle empty VERSION file', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '\n');
      
      const result = resolver.resolveLatest(testDir);
      expect(result).toBeNull();
    });

    it('should handle VERSION file with whitespace', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '  1.0.0  \n');
      
      const result = resolver.resolveLatest(testDir);
      expect(result).not.toBeNull();
      expect(result?.version).toBe('1.0.0');
    });

    it('should handle pre-release versions', () => {
      fs.writeFileSync(path.join(testDir, 'VERSION'), '1.0.0-alpha.1\n');
      
      const result = resolver.resolveLatest(testDir);
      expect(result?.version).toBe('1.0.0-alpha.1');
    });
  });
});

