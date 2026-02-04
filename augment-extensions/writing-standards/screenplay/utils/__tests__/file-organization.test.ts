/**
 * Integration tests for screenplay file organization utilities
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  getScreenplaysDir,
  ensureScreenplaysDir,
  getProjectNameFromOpenSpec,
  getProjectNameFromBeads,
  getProjectName,
  createProjectDir,
  ScreenplayProjectInfo
} from '../file-organization';

describe('Screenplay File Organization', () => {
  let testDir: string;

  beforeEach(() => {
    // Create a temporary test directory
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'screenplay-test-'));
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('getScreenplaysDir', () => {
    it('should return screenplays directory path', () => {
      const result = getScreenplaysDir(testDir);
      expect(result).toBe(path.join(testDir, 'screenplays'));
    });
  });

  describe('ensureScreenplaysDir', () => {
    it('should create screenplays directory if it does not exist', () => {
      const screenplaysDir = ensureScreenplaysDir(testDir);
      expect(fs.existsSync(screenplaysDir)).toBe(true);
      expect(fs.statSync(screenplaysDir).isDirectory()).toBe(true);
    });

    it('should not fail if screenplays directory already exists', () => {
      const screenplaysDir = path.join(testDir, 'screenplays');
      fs.mkdirSync(screenplaysDir);
      
      const result = ensureScreenplaysDir(testDir);
      expect(result).toBe(screenplaysDir);
      expect(fs.existsSync(screenplaysDir)).toBe(true);
    });
  });

  describe('getProjectNameFromOpenSpec', () => {
    it('should return null if openspec directory does not exist', () => {
      const result = getProjectNameFromOpenSpec(testDir);
      expect(result).toBeNull();
    });

    it('should return project info from OpenSpec changes', () => {
      // Create mock OpenSpec structure
      const changesDir = path.join(testDir, 'openspec', 'changes', 'heist-movie');
      fs.mkdirSync(changesDir, { recursive: true });

      const result = getProjectNameFromOpenSpec(testDir);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('heist-movie');
      expect(result?.source).toBe('openspec');
      expect(result?.specId).toBe('heist-movie');
    });
  });

  describe('getProjectNameFromBeads', () => {
    it('should return null if .beads directory does not exist', () => {
      const result = getProjectNameFromBeads(testDir);
      expect(result).toBeNull();
    });

    it('should return project info from Beads epic', () => {
      // Create mock Beads structure
      const beadsDir = path.join(testDir, '.beads');
      fs.mkdirSync(beadsDir);
      
      const issue = {
        id: 'bd-scr-test',
        title: 'Test Screenplay',
        issue_type: 'epic',
        status: 'open',
        labels: ['screenplay', 'writing-standards']
      };
      
      fs.writeFileSync(
        path.join(beadsDir, 'issues.jsonl'),
        JSON.stringify(issue) + '\n'
      );

      const result = getProjectNameFromBeads(testDir);
      expect(result).not.toBeNull();
      expect(result?.name).toBe('bd-scr-test');
      expect(result?.source).toBe('beads');
      expect(result?.epicId).toBe('bd-scr-test');
    });
  });

  describe('getProjectName', () => {
    it('should prefer OpenSpec over Beads', () => {
      // Create both OpenSpec and Beads structures
      const changesDir = path.join(testDir, 'openspec', 'changes', 'openspec-project');
      fs.mkdirSync(changesDir, { recursive: true });

      const beadsDir = path.join(testDir, '.beads');
      fs.mkdirSync(beadsDir);
      fs.writeFileSync(
        path.join(beadsDir, 'issues.jsonl'),
        JSON.stringify({
          id: 'bd-beads-project',
          issue_type: 'epic',
          status: 'open',
          labels: ['screenplay']
        }) + '\n'
      );

      const result = getProjectName(testDir);
      expect(result.name).toBe('openspec-project');
      expect(result.source).toBe('openspec');
    });

    it('should use timestamp fallback if no context available', () => {
      const result = getProjectName(testDir);
      expect(result.source).toBe('manual');
      expect(result.name).toMatch(/^screenplay-\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('createProjectDir', () => {
    it('should create project directory', () => {
      const projectInfo: ScreenplayProjectInfo = {
        name: 'test-project',
        source: 'manual'
      };

      const projectDir = createProjectDir(projectInfo, { rootDir: testDir });
      expect(fs.existsSync(projectDir)).toBe(true);
      expect(projectDir).toBe(path.join(testDir, 'screenplays', 'test-project'));
    });

    it('should handle conflicts with append-number strategy', () => {
      const projectInfo: ScreenplayProjectInfo = {
        name: 'conflict-test',
        source: 'manual'
      };

      // Create first project
      const firstDir = createProjectDir(projectInfo, { rootDir: testDir });
      expect(firstDir).toBe(path.join(testDir, 'screenplays', 'conflict-test'));

      // Create second project with same name
      const secondDir = createProjectDir(projectInfo, { 
        rootDir: testDir,
        handleConflicts: 'append-number'
      });
      expect(secondDir).toBe(path.join(testDir, 'screenplays', 'conflict-test-1'));
    });
  });
});

