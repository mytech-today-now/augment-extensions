/**
 * Jest wrapper for test-all.ts
 * 
 * This file integrates the comprehensive test suite with Jest framework.
 * It imports and runs all test functions from test-all.ts.
 */

import {
  TestRunner,
  testInitCommands,
  testListCommands,
  testShowCommands,
  testLinkCommands,
  testUnlinkCommands,
  testCoordCommands,
  testSyncCommands,
  testSkillCommands,
  testMcpCommands,
  testOtherCommands,
  testPhase3Commands,
  testUtilities
} from '../test-all';

describe('Augment Extensions CLI - Comprehensive Test Suite', () => {
  let runner: TestRunner;

  beforeEach(() => {
    runner = new TestRunner();
  });

  describe('Init Commands', () => {
    it('should run all init command tests', () => {
      testInitCommands(runner);
      const results = runner.getResults();
      const failures = results.filter(r => r.status === 'failure');
      expect(failures.length).toBe(0);
    }, 60000); // 60 second timeout
  });

  describe('List Commands', () => {
    it('should run all list command tests', () => {
      testListCommands(runner);
      const results = runner.getResults();
      const failures = results.filter(r => r.status === 'failure');
      expect(failures.length).toBe(0);
    }, 60000);
  });

  describe('Show Commands', () => {
    it('should run all show command tests', () => {
      testShowCommands(runner);
      const results = runner.getResults();
      const failures = results.filter(r => r.status === 'failure');
      expect(failures.length).toBe(0);
    }, 60000);
  });

  describe('Link Commands', () => {
    it('should run all link command tests', () => {
      testLinkCommands(runner);
      const results = runner.getResults();
      const failures = results.filter(r => r.status === 'failure');
      expect(failures.length).toBe(0);
    }, 60000);
  });

  describe('Unlink Commands', () => {
    it('should run all unlink command tests', () => {
      testUnlinkCommands(runner);
      const results = runner.getResults();
      const failures = results.filter(r => r.status === 'failure');
      expect(failures.length).toBe(0);
    }, 60000);
  });

  describe('Coordination Commands', () => {
    it('should run all coord command tests', () => {
      testCoordCommands(runner);
      const results = runner.getResults();
      const failures = results.filter(r => r.status === 'failure');
      expect(failures.length).toBe(0);
    }, 60000);
  });

  describe('Sync Commands', () => {
    it('should run all sync command tests', () => {
      testSyncCommands(runner);
      const results = runner.getResults();
      const failures = results.filter(r => r.status === 'failure');
      expect(failures.length).toBe(0);
    }, 60000);
  });

  describe('Skill Commands', () => {
    it('should run all skill command tests', () => {
      testSkillCommands(runner);
      const results = runner.getResults();
      const failures = results.filter(r => r.status === 'failure');
      expect(failures.length).toBe(0);
    }, 60000);
  });

  describe('MCP Commands', () => {
    it('should run all MCP command tests', () => {
      testMcpCommands(runner);
      const results = runner.getResults();
      const failures = results.filter(r => r.status === 'failure');
      expect(failures.length).toBe(0);
    }, 60000);
  });

  describe('Other Commands', () => {
    it('should run all other command tests', () => {
      testOtherCommands(runner);
      const results = runner.getResults();
      const failures = results.filter(r => r.status === 'failure');
      expect(failures.length).toBe(0);
    }, 60000);
  });

  describe('Phase 3 Commands (Beads, Task, Spec, Change)', () => {
    it('should run all Phase 3 command tests', () => {
      testPhase3Commands(runner);
      const results = runner.getResults();
      const failures = results.filter(r => r.status === 'failure');
      expect(failures.length).toBe(0);
    }, 60000);
  });

  describe('Utilities', () => {
    it('should run all utility import tests', () => {
      testUtilities(runner);
      const results = runner.getResults();
      const failures = results.filter(r => r.status === 'failure');
      expect(failures.length).toBe(0);
    }, 120000); // 2 minute timeout for all utilities
  });

  describe('Summary', () => {
    it('should have overall passing rate above 80%', () => {
      const summary = runner.getSummary();
      const passingRate = (summary.passed / summary.total) * 100;
      expect(passingRate).toBeGreaterThan(80);
    });
  });
});

