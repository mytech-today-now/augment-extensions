/**
 * Unit Tests for ConflictDetector
 * Tests rule conflict detection and resolution suggestions
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ConflictDetector } from '../../src/conflict-detector';
import { RuleRegistry } from '../../src/registry';
import { Rule } from '../../src/types';

describe('ConflictDetector', () => {
  let tempDir: string;
  let rulesPath: string;
  let registry: RuleRegistry;
  let detector: ConflictDetector;

  beforeEach(async () => {
    // Create temporary directories
    tempDir = path.join(__dirname, '../fixtures/temp-conflicts');
    rulesPath = path.join(tempDir, 'rules');
    
    await fs.mkdir(path.join(rulesPath, 'universal'), { recursive: true });
    await fs.mkdir(path.join(rulesPath, 'categories'), { recursive: true });
    
    // Create sample rules with potential conflicts
    await createConflictingRules();
    
    // Initialize components
    registry = new RuleRegistry(rulesPath);
    await registry.loadRules();
    
    detector = new ConflictDetector(registry);
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  async function createConflictingRules() {
    // Rule 1: Requires dynamic allocation
    const rule1 = `# Rule: Dynamic Memory Required

## Metadata
- **ID**: systems-dynamic-memory
- **Category**: systems
- **Severity**: ERROR

## Description
Use dynamic memory allocation for flexible data structures.

## Conflicts
- embedded-no-dynamic-memory
`;

    await fs.writeFile(path.join(rulesPath, 'categories/systems-dynamic.md'), rule1);

    // Rule 2: Prohibits dynamic allocation
    const rule2 = `# Rule: No Dynamic Memory

## Metadata
- **ID**: embedded-no-dynamic-memory
- **Category**: embedded
- **Severity**: ERROR

## Description
Avoid dynamic memory allocation in embedded systems.

## Conflicts
- systems-dynamic-memory
`;

    await fs.writeFile(path.join(rulesPath, 'categories/embedded-no-dynamic.md'), rule2);

    // Rule 3: Compatible rule
    const rule3 = `# Rule: Naming Conventions

## Metadata
- **ID**: universal-naming
- **Category**: universal
- **Severity**: ERROR

## Description
Use snake_case for functions and variables.
`;

    await fs.writeFile(path.join(rulesPath, 'universal/naming.md'), rule3);
  }

  describe('detectConflicts()', () => {
    it('should detect conflicting rules', async () => {
      const conflicts = await detector.detectConflicts();
      
      expect(conflicts.length).toBeGreaterThan(0);
    });

    it('should identify specific conflicting rule pairs', async () => {
      const conflicts = await detector.detectConflicts();
      
      const hasConflict = conflicts.some(c => 
        (c.rule1.id === 'systems-dynamic-memory' && c.rule2.id === 'embedded-no-dynamic-memory') ||
        (c.rule1.id === 'embedded-no-dynamic-memory' && c.rule2.id === 'systems-dynamic-memory')
      );
      
      expect(hasConflict).toBe(true);
    });

    it('should not report false positives', async () => {
      const conflicts = await detector.detectConflicts();
      
      const falsePositive = conflicts.some(c => 
        c.rule1.id === 'universal-naming' || c.rule2.id === 'universal-naming'
      );
      
      expect(falsePositive).toBe(false);
    });

    it('should include conflict descriptions', async () => {
      const conflicts = await detector.detectConflicts();
      
      if (conflicts.length > 0) {
        expect(conflicts[0].description).toBeDefined();
        expect(conflicts[0].description.length).toBeGreaterThan(0);
      }
    });
  });

  describe('detectConflictsForRules()', () => {
    it('should detect conflicts for specific rule set', async () => {
      const ruleIds = ['systems-dynamic-memory', 'embedded-no-dynamic-memory'];
      
      const conflicts = await detector.detectConflictsForRules(ruleIds);
      
      expect(conflicts.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-conflicting rules', async () => {
      const ruleIds = ['universal-naming'];
      
      const conflicts = await detector.detectConflictsForRules(ruleIds);
      
      expect(conflicts.length).toBe(0);
    });
  });

  describe('suggestResolution()', () => {
    it('should suggest resolution for conflicts', async () => {
      const conflicts = await detector.detectConflicts();
      
      if (conflicts.length > 0) {
        const suggestions = detector.suggestResolution(conflicts[0]);
        
        expect(suggestions).toBeDefined();
        expect(Array.isArray(suggestions)).toBe(true);
        expect(suggestions.length).toBeGreaterThan(0);
      }
    });

    it('should suggest disabling one rule', async () => {
      const conflicts = await detector.detectConflicts();
      
      if (conflicts.length > 0) {
        const suggestions = detector.suggestResolution(conflicts[0]);
        
        const hasDisableSuggestion = suggestions.some(s => 
          s.type === 'disable' && (s.ruleId === conflicts[0].rule1.id || s.ruleId === conflicts[0].rule2.id)
        );
        
        expect(hasDisableSuggestion).toBe(true);
      }
    });

    it('should suggest category-based resolution', async () => {
      const conflicts = await detector.detectConflicts();
      
      if (conflicts.length > 0) {
        const suggestions = detector.suggestResolution(conflicts[0]);
        
        const hasCategorySuggestion = suggestions.some(s => s.type === 'category');
        
        expect(hasCategorySuggestion).toBe(true);
      }
    });
  });

  describe('analyzeConflictSeverity()', () => {
    it('should analyze conflict severity', async () => {
      const conflicts = await detector.detectConflicts();

      if (conflicts.length > 0) {
        const severity = detector.analyzeConflictSeverity(conflicts[0]);

        expect(severity).toBeDefined();
        expect(['HIGH', 'MEDIUM', 'LOW']).toContain(severity);
      }
    });

    it('should rate ERROR-ERROR conflicts as HIGH', async () => {
      const conflicts = await detector.detectConflicts();

      const errorConflict = conflicts.find(c =>
        c.rule1.severity === 'ERROR' && c.rule2.severity === 'ERROR'
      );

      if (errorConflict) {
        const severity = detector.analyzeConflictSeverity(errorConflict);
        expect(severity).toBe('HIGH');
      }
    });
  });

  describe('generateConflictReport()', () => {
    it('should generate text report', async () => {
      const conflicts = await detector.detectConflicts();

      const report = detector.generateConflictReport(conflicts, { format: 'text' });

      expect(report).toBeDefined();
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });

    it('should generate JSON report', async () => {
      const conflicts = await detector.detectConflicts();

      const report = detector.generateConflictReport(conflicts, { format: 'json' });

      expect(report).toBeDefined();
      expect(() => JSON.parse(report)).not.toThrow();
    });

    it('should include resolution suggestions in report', async () => {
      const conflicts = await detector.detectConflicts();

      const report = detector.generateConflictReport(conflicts, {
        format: 'json',
        includeSuggestions: true
      });

      const parsed = JSON.parse(report);
      if (parsed.conflicts && parsed.conflicts.length > 0) {
        expect(parsed.conflicts[0].suggestions).toBeDefined();
      }
    });
  });

  describe('isConflictResolved()', () => {
    it('should check if conflict is resolved', async () => {
      const conflicts = await detector.detectConflicts();

      if (conflicts.length > 0) {
        const isResolved = detector.isConflictResolved(conflicts[0]);
        expect(typeof isResolved).toBe('boolean');
      }
    });

    it('should return true when one rule is disabled', async () => {
      const conflicts = await detector.detectConflicts();

      if (conflicts.length > 0) {
        registry.setRuleEnabled(conflicts[0].rule1.id, false);
        const isResolved = detector.isConflictResolved(conflicts[0]);
        expect(isResolved).toBe(true);
      }
    });
  });

  describe('getConflictsByCategory()', () => {
    it('should group conflicts by category', async () => {
      const conflicts = await detector.detectConflicts();

      const grouped = detector.getConflictsByCategory(conflicts);

      expect(grouped).toBeDefined();
      expect(typeof grouped).toBe('object');
    });

    it('should include all relevant categories', async () => {
      const conflicts = await detector.detectConflicts();

      const grouped = detector.getConflictsByCategory(conflicts);

      if (conflicts.length > 0) {
        const categories = Object.keys(grouped);
        expect(categories.length).toBeGreaterThan(0);
      }
    });
  });
});

