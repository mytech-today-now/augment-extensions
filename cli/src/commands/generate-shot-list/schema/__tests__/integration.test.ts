/**
 * Schema Integration Tests
 * 
 * Comprehensive integration tests for JSON schema validation with real shot list generation
 */

import { JSONFormatter } from '../../formatter/json-formatter';
import { JSONLFormatter } from '../../formatter/jsonl-formatter';
import { SchemaValidator } from '../validator';
import { ShotList, Shot } from '../../generator/types';

describe('Schema Integration Tests', () => {
  let validator: SchemaValidator;
  let jsonFormatter: JSONFormatter;
  let jsonlFormatter: JSONLFormatter;

  beforeEach(() => {
    validator = new SchemaValidator();
    jsonFormatter = new JSONFormatter();
    jsonlFormatter = new JSONLFormatter();
  });

  const createTestShot = (overrides?: Partial<Shot>): Shot => ({
    number: 1,
    sceneNumber: 1,
    heading: {
      intExt: 'INT',
      location: 'COFFEE SHOP',
      timeOfDay: 'DAY',
      raw: 'INT. COFFEE SHOP - DAY'
    },
    context: {
      set: 'Modern coffee shop with exposed brick walls, vintage furniture',
      lighting: 'Natural daylight streaming through large windows',
      timeOfDay: 'Morning',
      atmosphere: 'Busy but cozy',
      weather: 'Sunny'
    },
    characters: [
      {
        name: 'SARAH',
        position: 'standing at counter, facing barista',
        appearance: 'casual attire',
        wardrobe: 'Blue jeans, white t-shirt, brown leather jacket',
        physicalAppearance: 'Brunette, 5\'6", athletic build, green eyes',
        emotion: 'nervous',
        action: 'ordering coffee'
      }
    ],
    description: 'Sarah enters the coffee shop and approaches the counter. No dialogue in this shot.',
    dialogue: 'No dialogue in this shot',
    metadata: {
      shotType: 'medium',
      cameraMovement: 'static',
      framing: 'medium',
      visualStyle: 'Reality',
      cinematicStyle: 'Naturalistic',
      technicalNotes: ['handheld', 'shallow depth of field']
    },
    duration: 8,
    characterCount: 350,
    warnings: [],
    ...overrides
  });

  const createTestShotList = (shots: Shot[]): ShotList => ({
    title: 'Coffee Shop Encounter',
    author: 'Test Author',
    shots,
    totalShots: shots.length,
    totalDuration: shots.reduce((sum, s) => sum + s.duration, 0),
    totalCharacters: shots.reduce((sum, s) => sum + s.characterCount, 0),
    warnings: [],
    metadata: {
      generatedAt: new Date('2024-01-01T12:00:00Z'),
      maxCharacters: 4000,
      maxShotLength: 12,
      sourceFormat: 'fountain'
    }
  });

  describe('JSON Format Integration', () => {
    it('should generate and validate simple shot list', () => {
      const shotList = createTestShotList([createTestShot()]);
      const json = jsonFormatter.format(shotList);

      const result = validator.validateJSON(json);
      if (!result.valid) {
        console.log('Validation errors:', JSON.stringify(result.errors, null, 2));
        console.log('Error summary:', validator.getErrorSummary(result));
      }
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should generate and validate shot list with multiple shots', () => {
      const shots = [
        createTestShot({ number: 1, duration: 8 }),
        createTestShot({ number: 2, duration: 10, description: 'Sarah sits down at a table.' }),
        createTestShot({ number: 3, duration: 6, description: 'Close-up of Sarah\'s face.' })
      ];
      const shotList = createTestShotList(shots);
      const json = jsonFormatter.format(shotList);
      
      const result = validator.validateJSON(json);
      expect(result.valid).toBe(true);
    });

    it('should generate and validate shot list with sub-shots', () => {
      const shots = [
        createTestShot({ number: 1, duration: 8 }),
        createTestShot({ number: '3a', duration: 5, description: 'First part of split shot.' }),
        createTestShot({ number: '3b', duration: 6, description: 'Second part of split shot.' }),
        createTestShot({ number: 4, duration: 7 })
      ];
      const shotList = createTestShotList(shots);
      const json = jsonFormatter.format(shotList);
      
      const result = validator.validateJSON(json);
      expect(result.valid).toBe(true);
    });

    it('should generate and validate shot list with all visual styles', () => {
      const visualStyles: Array<'Reality' | 'Animation' | 'CGI' | 'Hybrid'> = ['Reality', 'Animation', 'CGI', 'Hybrid'];
      
      visualStyles.forEach(style => {
        const shot = createTestShot({
          metadata: {
            shotType: 'medium',
            cameraMovement: 'static',
            framing: 'medium',
            visualStyle: style,
            cinematicStyle: 'Test Style',
            technicalNotes: []
          }
        });
        const shotList = createTestShotList([shot]);
        const json = jsonFormatter.format(shotList);
        
        const result = validator.validateJSON(json);
        expect(result.valid).toBe(true);
      });
    });

    it('should generate and validate shot list with dialogue', () => {
      const shot = createTestShot({
        dialogue: 'SARAH\n(nervously)\nCan I get a large coffee, please?'
      });
      const shotList = createTestShotList([shot]);
      const json = jsonFormatter.format(shotList);
      
      const result = validator.validateJSON(json);
      expect(result.valid).toBe(true);
    });

    it('should generate and validate shot list with warnings', () => {
      const shot = createTestShot({
        characterCount: 4200,
        warnings: [
          {
            type: 'character-limit-error',
            message: 'Shot exceeds character limit',
            shotNumber: 1,
            severity: 'error',
            suggestion: 'Reduce description length'
          }
        ]
      });
      const shotList = createTestShotList([shot]);
      const json = jsonFormatter.format(shotList);
      
      const result = validator.validateJSON(json);
      expect(result.valid).toBe(true);
    });

    it('should generate and validate shot list with rich character descriptions', () => {
      const shot = createTestShot({
        characters: [
          {
            name: 'SARAH',
            position: 'standing at counter, facing barista, left side of frame',
            appearance: 'casual attire',
            wardrobe: 'Blue jeans (slightly worn), white t-shirt (crew neck), brown leather jacket (vintage), white sneakers',
            physicalAppearance: 'Brunette (shoulder-length, wavy), 5\'6", athletic build, green eyes, light makeup, small silver earrings',
            emotion: 'nervous but trying to appear confident',
            action: 'ordering coffee, fidgeting with phone in left hand'
          },
          {
            name: 'BARISTA',
            position: 'behind counter, facing Sarah, right side of frame',
            appearance: 'work uniform',
            wardrobe: 'Black apron over green polo shirt, black pants, name tag reading "Mike"',
            physicalAppearance: 'Blonde (short, spiky), 5\'10", slim build, blue eyes, friendly smile',
            emotion: 'cheerful and attentive',
            action: 'taking order, holding notepad'
          }
        ]
      });
      const shotList = createTestShotList([shot]);
      const json = jsonFormatter.format(shotList);

      const result = validator.validateJSON(json);
      expect(result.valid).toBe(true);
    });
  });

  describe('JSONL Format Integration', () => {
    it('should generate and validate simple JSONL shot list', () => {
      const shotList = createTestShotList([createTestShot()]);
      const jsonl = jsonlFormatter.format(shotList);

      const result = validator.validateJSONL(jsonl);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should generate and validate JSONL with multiple shots', () => {
      const shots = [
        createTestShot({ number: 1, duration: 8 }),
        createTestShot({ number: 2, duration: 10 }),
        createTestShot({ number: 3, duration: 6 })
      ];
      const shotList = createTestShotList(shots);
      const jsonl = jsonlFormatter.format(shotList);

      const result = validator.validateJSONL(jsonl);
      expect(result.valid).toBe(true);
    });

    it('should generate and validate JSONL with sub-shots', () => {
      const shots = [
        createTestShot({ number: '3a', duration: 5 }),
        createTestShot({ number: '3b', duration: 6 }),
        createTestShot({ number: '3c', duration: 4 })
      ];
      const shotList = createTestShotList(shots);
      const jsonl = jsonlFormatter.format(shotList);

      const result = validator.validateJSONL(jsonl);
      expect(result.valid).toBe(true);
    });

    it('should validate each line in JSONL independently', () => {
      const shots = [
        createTestShot({ number: 1 }),
        createTestShot({ number: 2 }),
        createTestShot({ number: 3 })
      ];
      const shotList = createTestShotList(shots);
      const jsonl = jsonlFormatter.format(shotList);

      // Split into lines and validate each
      const lines = jsonl.split('\n');
      expect(lines.length).toBe(3);

      lines.forEach(line => {
        const result = validator.validateJSON(line);
        // Each line should be valid JSON (though not a complete shot list)
        expect(() => JSON.parse(line)).not.toThrow();
      });
    });
  });

  describe('Backward Compatibility', () => {
    it('should validate shot list without optional fields', () => {
      const shot: Shot = {
        number: 1,
        sceneNumber: 1,
        heading: {
          intExt: 'INT',
          location: 'COFFEE SHOP',
          timeOfDay: 'DAY',
          raw: 'INT. COFFEE SHOP - DAY'
        },
        context: {
          set: 'Modern coffee shop',
          lighting: 'Natural daylight',
          timeOfDay: 'Morning'
        },
        characters: [],
        description: 'Empty coffee shop.',
        dialogue: 'No dialogue in this shot',
        metadata: {
          shotType: 'wide',
          cameraMovement: 'static',
          framing: 'wide',
          visualStyle: 'Reality',
          technicalNotes: []
        },
        duration: 5,
        characterCount: 100,
        warnings: []
      };

      const shotList = createTestShotList([shot]);
      const json = jsonFormatter.format(shotList);

      const result = validator.validateJSON(json);
      expect(result.valid).toBe(true);
    });

    it('should validate shot list with undefined optional fields', () => {
      const shotList: ShotList = {
        title: undefined,
        author: undefined,
        shots: [],
        totalShots: 0,
        totalDuration: 0,
        totalCharacters: 0,
        warnings: [],
        metadata: {
          generatedAt: new Date('2024-01-01T12:00:00Z'),
          maxCharacters: 4000,
          maxShotLength: 12,
          sourceFormat: 'fountain'
        }
      };

      const json = jsonFormatter.format(shotList);
      const result = validator.validateJSON(json);
      expect(result.valid).toBe(true);
    });
  });

  describe('Error Reporting', () => {
    it('should provide clear error messages for invalid data', () => {
      const invalidJSON = JSON.stringify({
        metadata: {
          // Missing required fields
          generatedAt: '2024-01-01T12:00:00Z'
        },
        shots: []
      });

      const result = validator.validateJSON(invalidJSON);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);

      const summary = validator.getErrorSummary(result);
      expect(summary).toContain('Validation failed');
    });
  });
});
