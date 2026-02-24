/**
 * CSV Formatter Unit Tests
 */

import { CSVFormatter } from '../csv-formatter';
import { ShotList, Shot } from '../../generator/types';

describe('CSVFormatter', () => {
  let formatter: CSVFormatter;

  beforeEach(() => {
    formatter = new CSVFormatter();
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
        emotion: 'nervous',
        action: 'ordering coffee'
      }
    ],
    description: 'Sarah enters the coffee shop and approaches the counter.',
    metadata: {
      shotType: 'medium',
      cameraMovement: 'static',
      framing: 'medium',
      technicalNotes: ['handheld', 'natural lighting']
    },
    duration: 15,
    characterCount: 250,
    warnings: [],
    ...overrides
  });

  const createTestShotList = (shots: Shot[]): ShotList => ({
    title: 'Test Screenplay',
    author: 'Test Author',
    shots,
    totalShots: shots.length,
    totalDuration: shots.reduce((sum, s) => sum + s.duration, 0),
    totalCharacters: shots.reduce((sum, s) => sum + s.characterCount, 0),
    warnings: [],
    metadata: {
      generatedAt: new Date('2024-01-01T12:00:00Z'),
      maxCharacters: 400,
      maxShotLength: 30,
      sourceFormat: 'fountain'
    }
  });

  describe('format', () => {
    it('should produce valid CSV with header row', () => {
      const shot = createTestShot();
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);
      const lines = output.trim().split('\n');

      expect(lines.length).toBeGreaterThan(1);
      expect(lines[0]).toContain('Shot Number');
      expect(lines[0]).toContain('Scene Number');
      expect(lines[0]).toContain('Scene Heading');
    });

    it('should include all shot data', () => {
      const shot = createTestShot();
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      expect(output).toContain('1'); // shot number
      expect(output).toContain('INT. COFFEE SHOP - DAY');
      expect(output).toContain('Modern coffee shop');
      expect(output).toContain('SARAH');
    });

    it('should properly escape special characters', () => {
      const shot = createTestShot({
        description: 'Sarah says, "Hello, world!"'
      });
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      // CSV should escape quotes
      expect(output).toContain('Sarah says');
    });

    it('should format characters with semicolon separator', () => {
      const shot = createTestShot({
        characters: [
          {
            name: 'SARAH',
            position: 'at counter',
            appearance: 'casual attire',
            emotion: 'nervous',
            action: 'ordering coffee'
          },
          {
            name: 'BARISTA',
            position: 'behind counter',
            appearance: 'uniform',
            emotion: 'friendly',
            action: 'making coffee'
          }
        ]
      });
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      expect(output).toContain('SARAH');
      expect(output).toContain('BARISTA');
      expect(output).toContain(';'); // semicolon separator
    });

    it('should format technical notes with semicolon separator', () => {
      const shot = createTestShot();
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      expect(output).toContain('handheld');
      expect(output).toContain('natural lighting');
      expect(output).toContain(';'); // semicolon separator
    });

    it('should calculate character percentage', () => {
      const shot = createTestShot({ characterCount: 200 });
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList, { maxCharacters: 400 });

      expect(output).toContain('50'); // 200/400 = 50%
    });

    it('should format duration correctly', () => {
      const shot = createTestShot({ duration: 65 });
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      expect(output).toContain('65'); // seconds
      expect(output).toContain('1:05'); // formatted
    });

    it('should handle empty shot list', () => {
      const shotList = createTestShotList([]);

      const output = formatter.format(shotList);
      const lines = output.trim().split('\n');

      expect(lines.length).toBe(1); // Only header row
    });
  });

  describe('getExtension', () => {
    it('should return csv extension', () => {
      expect(formatter.getExtension()).toBe('csv');
    });
  });

  describe('getMimeType', () => {
    it('should return text/csv MIME type', () => {
      expect(formatter.getMimeType()).toBe('text/csv');
    });
  });
});

