/**
 * Shot List Validator Unit Tests
 */

import { ShotListValidator } from '../validator';
import { Shot, ShotList, GeneratorConfig } from '../types';

describe('ShotListValidator', () => {
  let validator: ShotListValidator;
  let config: GeneratorConfig;

  beforeEach(() => {
    validator = new ShotListValidator();
    config = {
      maxCharacters: 400,
      maxShotLength: 30,
      warningThreshold: 90,
      includeContext: true,
      includeMetadata: true
    };
  });

  const createTestShot = (overrides?: Partial<Shot>): Shot => ({
    number: 1,
    sceneNumber: 1,
    heading: {
      intExt: 'INT',
      location: 'ROOM',
      timeOfDay: 'DAY',
      raw: 'INT. ROOM - DAY'
    },
    context: {
      set: 'Modern room',
      lighting: 'Natural',
      timeOfDay: 'Morning',
      atmosphere: 'Calm',
      weather: 'Sunny'
    },
    characters: [],
    description: 'Test description',
    dialogue: 'No dialogue in this shot',
    metadata: {
      shotType: 'medium',
      cameraMovement: 'static',
      framing: 'medium',
      visualStyle: 'Reality',
      technicalNotes: []
    },
    duration: 15,
    characterCount: 200,
    warnings: [],
    ...overrides
  });

  describe('validateCharacterCount', () => {
    it('should not warn for character count below threshold', () => {
      const shot = createTestShot({ characterCount: 300 }); // 75% of 400
      const warnings = validator.validateShot(shot, config);
      
      const charWarnings = warnings.filter(w => w.type.includes('character'));
      expect(charWarnings).toHaveLength(0);
    });

    it('should warn when approaching character limit', () => {
      const shot = createTestShot({ characterCount: 370 }); // 92.5% of 400
      const warnings = validator.validateShot(shot, config);
      
      const charWarnings = warnings.filter(w => w.type === 'character-limit-warning');
      expect(charWarnings).toHaveLength(1);
      expect(charWarnings[0].severity).toBe('warning');
    });

    it('should error when exceeding character limit', () => {
      const shot = createTestShot({ characterCount: 450 }); // Over 400
      const warnings = validator.validateShot(shot, config);
      
      const charErrors = warnings.filter(w => w.type === 'character-limit-error');
      expect(charErrors).toHaveLength(1);
      expect(charErrors[0].severity).toBe('error');
      expect(charErrors[0].message).toContain('exceeds character limit');
    });

    it('should include suggestion in warning', () => {
      const shot = createTestShot({ characterCount: 450 });
      const warnings = validator.validateShot(shot, config);
      
      expect(warnings[0].suggestion).toBeDefined();
      expect(warnings[0].suggestion).toContain('Reduce description');
    });
  });

  describe('validateDuration', () => {
    it('should not warn for duration below threshold', () => {
      const shot = createTestShot({ duration: 20 }); // 66% of 30
      const warnings = validator.validateShot(shot, config);
      
      const durationWarnings = warnings.filter(w => w.type.includes('duration'));
      expect(durationWarnings).toHaveLength(0);
    });

    it('should warn when approaching duration limit', () => {
      const shot = createTestShot({ duration: 28 }); // 93% of 30
      const warnings = validator.validateShot(shot, config);
      
      const durationWarnings = warnings.filter(w => w.type === 'duration-limit-warning');
      expect(durationWarnings).toHaveLength(1);
      expect(durationWarnings[0].severity).toBe('warning');
    });

    it('should error when exceeding duration limit', () => {
      const shot = createTestShot({ duration: 35 }); // Over 30
      const warnings = validator.validateShot(shot, config);
      
      const durationErrors = warnings.filter(w => w.type === 'duration-limit-error');
      expect(durationErrors).toHaveLength(1);
      expect(durationErrors[0].severity).toBe('error');
    });
  });

  describe('validate', () => {
    it('should validate entire shot list', () => {
      const shots = [
        createTestShot({ number: 1, characterCount: 450 }),
        createTestShot({ number: 2, duration: 35 }),
        createTestShot({ number: 3, characterCount: 200, duration: 15 })
      ];
      
      const shotList: ShotList = {
        title: 'Test',
        author: 'Test',
        shots,
        totalShots: 3,
        totalDuration: 65,
        totalCharacters: 850,
        warnings: [],
        metadata: {
          generatedAt: new Date(),
          maxCharacters: 400,
          maxShotLength: 30,
          sourceFormat: 'fountain'
        }
      };
      
      const warnings = validator.validate(shotList, config);
      
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings.some(w => w.shotNumber === 1)).toBe(true);
      expect(warnings.some(w => w.shotNumber === 2)).toBe(true);
    });
  });

  describe('getValidationSummary', () => {
    it('should count warnings and errors', () => {
      const warnings = [
        { type: 'character-limit-warning' as const, message: 'test', shotNumber: 1, severity: 'warning' as const, suggestion: 'test' },
        { type: 'character-limit-error' as const, message: 'test', shotNumber: 2, severity: 'error' as const, suggestion: 'test' },
        { type: 'duration-limit-warning' as const, message: 'test', shotNumber: 3, severity: 'warning' as const, suggestion: 'test' }
      ];

      const summary = validator.getValidationSummary(warnings);

      expect(summary.totalWarnings).toBe(2);
      expect(summary.totalErrors).toBe(1);
      expect(summary.byType['character-limit-warning']).toBe(1);
      expect(summary.byType['character-limit-error']).toBe(1);
      expect(summary.byType['duration-limit-warning']).toBe(1);
    });
  });
});

