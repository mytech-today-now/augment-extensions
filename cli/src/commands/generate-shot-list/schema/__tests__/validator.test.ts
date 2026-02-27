/**
 * Schema Validator Unit Tests
 */

import { SchemaValidator, getValidator } from '../validator';

describe('SchemaValidator', () => {
  let validator: SchemaValidator;

  beforeEach(() => {
    validator = new SchemaValidator();
  });

  describe('validate', () => {
    it('should validate valid shot list JSON', () => {
      const validData = {
        metadata: {
          title: 'Test Screenplay',
          author: 'Test Author',
          generatedAt: '2024-01-01T12:00:00.000Z',
          sourceFormat: 'fountain',
          maxCharacters: 4000,
          maxShotLength: 12
        },
        summary: {
          totalShots: 1,
          totalDuration: 15,
          totalDurationFormatted: '15s',
          totalCharacters: 250,
          averageShotLength: 15,
          averageCharacters: 250,
          maxCharacters: 250
        },
        warnings: [],
        shots: [
          {
            number: 1,
            sceneNumber: 1,
            heading: {
              raw: 'INT. COFFEE SHOP - DAY',
              intExt: 'INT',
              location: 'COFFEE SHOP',
              timeOfDay: 'DAY'
            },
            context: {
              set: 'Modern coffee shop',
              lighting: 'Natural daylight',
              timeOfDay: 'Morning',
              atmosphere: 'Busy',
              weather: 'Sunny'
            },
            characters: [
              {
                name: 'SARAH',
                position: 'at counter',
                appearance: 'casual attire',
                wardrobe: 'Blue jeans, white t-shirt',
                physicalAppearance: 'Brunette, 5\'6", athletic build',
                emotion: 'nervous',
                action: 'ordering coffee'
              }
            ],
            description: 'Sarah enters the coffee shop and approaches the counter.',
            dialogue: 'No dialogue in this shot',
            metadata: {
              shotType: 'medium',
              cameraMovement: 'static',
              framing: 'medium',
              visualStyle: 'Reality',
              cinematicStyle: 'Naturalistic',
              technicalNotes: ['handheld']
            },
            duration: {
              seconds: 15,
              formatted: '0:15'
            },
            characterCount: {
              count: 250,
              limit: 4000,
              percentage: 6
            },
            warnings: []
          }
        ]
      };

      const result = validator.validate(validData);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject invalid shot list with missing required fields', () => {
      const invalidData = {
        metadata: {
          generatedAt: '2024-01-01T12:00:00.000Z'
          // Missing required fields
        },
        shots: []
      };

      const result = validator.validate(invalidData);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('should reject shot with invalid shot number format', () => {
      const invalidData = {
        metadata: {
          title: null,
          author: null,
          generatedAt: '2024-01-01T12:00:00.000Z',
          sourceFormat: 'fountain',
          maxCharacters: 4000,
          maxShotLength: 12
        },
        summary: {
          totalShots: 1,
          totalDuration: 15,
          totalCharacters: 250
        },
        warnings: [],
        shots: [
          {
            number: 'invalid123',  // Invalid format
            sceneNumber: 1,
            heading: {
              raw: 'INT. COFFEE SHOP - DAY',
              intExt: 'INT',
              location: 'COFFEE SHOP',
              timeOfDay: 'DAY'
            },
            context: {
              set: 'Modern coffee shop',
              lighting: 'Natural daylight',
              timeOfDay: 'Morning'
            },
            characters: [],
            description: 'Test',
            dialogue: 'No dialogue in this shot',
            metadata: {
              shotType: 'medium',
              cameraMovement: 'static',
              framing: 'medium',
              visualStyle: 'Reality',
              technicalNotes: []
            },
            duration: {
              seconds: 15,
              formatted: '0:15'
            },
            characterCount: {
              count: 250,
              limit: 4000,
              percentage: 6
            },
            warnings: []
          }
        ]
      };

      const result = validator.validate(invalidData);
      expect(result.valid).toBe(false);
    });

    it('should validate sub-shot numbers (3a, 3b, etc.)', () => {
      const validData = {
        metadata: {
          title: null,
          author: null,
          generatedAt: '2024-01-01T12:00:00.000Z',
          sourceFormat: 'fountain',
          maxCharacters: 4000,
          maxShotLength: 12
        },
        summary: {
          totalShots: 2,
          totalDuration: 20,
          totalCharacters: 400
        },
        warnings: [],
        shots: [
          {
            number: '3a',  // Sub-shot format
            sceneNumber: 1,
            heading: {
              raw: 'INT. COFFEE SHOP - DAY',
              intExt: 'INT',
              location: 'COFFEE SHOP',
              timeOfDay: 'DAY'
            },
            context: {
              set: 'Modern coffee shop',
              lighting: 'Natural daylight',
              timeOfDay: 'Morning'
            },
            characters: [],
            description: 'Test',
            dialogue: 'No dialogue in this shot',
            metadata: {
              shotType: 'medium',
              cameraMovement: 'static',
              framing: 'medium',
              visualStyle: 'Reality',
              technicalNotes: []
            },
            duration: {
              seconds: 10,
              formatted: '0:10'
            },
            characterCount: {
              count: 200,
              limit: 4000,
              percentage: 5
            },
            warnings: []
          }
        ]
      };

      const result = validator.validate(validData);
      expect(result.valid).toBe(true);
    });

    it('should validate all visual styles', () => {
      const visualStyles = ['Reality', 'Animation', 'CGI', 'Hybrid'];

      visualStyles.forEach(style => {
        const data = {
          metadata: {
            title: null,
            author: null,
            generatedAt: '2024-01-01T12:00:00.000Z',
            sourceFormat: 'fountain',
            maxCharacters: 4000,
            maxShotLength: 12
          },
          summary: {
            totalShots: 1,
            totalDuration: 10,
            totalCharacters: 200
          },
          warnings: [],
          shots: [
            {
              number: 1,
              sceneNumber: 1,
              heading: {
                raw: 'INT. COFFEE SHOP - DAY',
                intExt: 'INT',
                location: 'COFFEE SHOP',
                timeOfDay: 'DAY'
              },
              context: {
                set: 'Modern coffee shop',
                lighting: 'Natural daylight',
                timeOfDay: 'Morning'
              },
              characters: [],
              description: 'Test',
              dialogue: 'No dialogue in this shot',
              metadata: {
                shotType: 'medium',
                cameraMovement: 'static',
                framing: 'medium',
                visualStyle: style,
                technicalNotes: []
              },
              duration: {
                seconds: 10,
                formatted: '0:10'
              },
              characterCount: {
                count: 200,
                limit: 4000,
                percentage: 5
              },
              warnings: []
            }
          ]
        };

        const result = validator.validate(data);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('validateJSON', () => {
    it('should validate valid JSON string', () => {
      const jsonString = JSON.stringify({
        metadata: {
          title: null,
          author: null,
          generatedAt: '2024-01-01T12:00:00.000Z',
          sourceFormat: 'fountain',
          maxCharacters: 4000,
          maxShotLength: 12
        },
        summary: {
          totalShots: 0,
          totalDuration: 0,
          totalCharacters: 0
        },
        warnings: [],
        shots: []
      });

      const result = validator.validateJSON(jsonString);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid JSON string', () => {
      const invalidJSON = '{ invalid json }';

      const result = validator.validateJSON(invalidJSON);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain('Invalid JSON');
    });
  });

  describe('validateJSONL', () => {
    it('should validate valid JSONL string', () => {
      const shot = {
        number: 1,
        sceneNumber: 1,
        heading: {
          raw: 'INT. COFFEE SHOP - DAY',
          intExt: 'INT',
          location: 'COFFEE SHOP',
          timeOfDay: 'DAY'
        },
        context: {
          set: 'Modern coffee shop',
          lighting: 'Natural daylight',
          timeOfDay: 'Morning'
        },
        characters: [],
        description: 'Test',
        dialogue: 'No dialogue in this shot',
        metadata: {
          shotType: 'medium',
          cameraMovement: 'static',
          framing: 'medium',
          visualStyle: 'Reality',
          technicalNotes: []
        },
        duration: {
          seconds: 10,
          formatted: '0:10'
        },
        characterCount: {
          count: 200,
          limit: 4000,
          percentage: 5
        },
        warnings: []
      };

      const jsonlString = JSON.stringify(shot) + '\n' + JSON.stringify(shot);

      const result = validator.validateJSONL(jsonlString);
      expect(result.valid).toBe(true);
    });

    it('should reject JSONL with invalid shot', () => {
      const invalidShot = {
        number: 1
        // Missing required fields
      };

      const jsonlString = JSON.stringify(invalidShot);

      const result = validator.validateJSONL(jsonlString);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should reject JSONL with invalid JSON line', () => {
      const jsonlString = '{ invalid json }\n{"valid": "json"}';

      const result = validator.validateJSONL(jsonlString);
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].path).toContain('line 1');
    });
  });

  describe('getErrorSummary', () => {
    it('should return success message for valid result', () => {
      const result = { valid: true };
      const summary = validator.getErrorSummary(result);
      expect(summary).toBe('Validation passed');
    });

    it('should return formatted error summary for invalid result', () => {
      const result = {
        valid: false,
        errors: [
          { path: '/metadata/title', message: 'must be string' },
          { path: '/shots/0/number', message: 'must be integer' }
        ]
      };

      const summary = validator.getErrorSummary(result);
      expect(summary).toContain('Validation failed');
      expect(summary).toContain('/metadata/title');
      expect(summary).toContain('must be string');
    });
  });

  describe('getValidator', () => {
    it('should return singleton instance', () => {
      const validator1 = getValidator();
      const validator2 = getValidator();
      expect(validator1).toBe(validator2);
    });
  });
});

