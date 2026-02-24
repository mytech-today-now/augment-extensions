/**
 * TXT Formatter Unit Tests
 */

import { TXTFormatter } from '../txt-formatter';
import { ShotList, Shot } from '../../generator/types';

describe('TXTFormatter', () => {
  let formatter: TXTFormatter;

  beforeEach(() => {
    formatter = new TXTFormatter();
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
    it('should produce plain text output', () => {
      const shot = createTestShot();
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      expect(output).toContain('AI SHOT LIST: Test Screenplay');
      expect(output).toContain('Total Shots: 1');
      expect(output).toContain('SHOT 1');
    });

    it('should include summary section', () => {
      const shot = createTestShot({ duration: 15 });
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      expect(output).toContain('Total Shots: 1');
      expect(output).toContain('Total Duration:');
      expect(output).toContain('Average Shot Length:');
      expect(output).toContain('Character Count:');
    });

    it('should include shot metadata', () => {
      const shot = createTestShot();
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      expect(output).toContain('Duration:');
      expect(output).toContain('Scene:');
      expect(output).toContain('Heading: INT. COFFEE SHOP - DAY');
      expect(output).toContain('Shot Type: medium');
      expect(output).toContain('Camera Movement: static');
      expect(output).toContain('Framing: medium');
    });

    it('should include context information', () => {
      const shot = createTestShot();
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      expect(output).toContain('SET:');
      expect(output).toContain('Modern coffee shop');
      expect(output).toContain('LIGHTING: Natural daylight');
      expect(output).toContain('TIME OF DAY: Morning');
      expect(output).toContain('ATMOSPHERE: Busy');
      expect(output).toContain('WEATHER: Sunny');
    });

    it('should include character information', () => {
      const shot = createTestShot();
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      expect(output).toContain('CHARACTERS:');
      expect(output).toContain('SARAH');
      expect(output).toContain('Position: at counter');
      expect(output).toContain('Appearance: casual attire');
      expect(output).toContain('Emotion: nervous');
      expect(output).toContain('Action: ordering coffee');
    });

    it('should include description', () => {
      const shot = createTestShot();
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      expect(output).toContain('DESCRIPTION:');
      expect(output).toContain('Sarah enters the coffee shop and approaches the counter.');
    });

    it('should include technical notes', () => {
      const shot = createTestShot();
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      expect(output).toContain('TECHNICAL NOTES:');
      expect(output).toContain('- handheld');
      expect(output).toContain('- natural lighting');
    });

    it('should include character count', () => {
      const shot = createTestShot({ characterCount: 200 });
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList, { maxCharacters: 400 });

      expect(output).toContain('CHARACTER COUNT: 200 / 400 (50%)');
    });

    it('should use separators for readability', () => {
      const shot = createTestShot();
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);

      expect(output).toContain('='.repeat(80));
      expect(output).toContain('-'.repeat(6));
    });

    it('should handle empty shot list', () => {
      const shotList = createTestShotList([]);

      const output = formatter.format(shotList);

      expect(output).toContain('AI SHOT LIST:');
      expect(output).toContain('Total Shots: 0');
    });
  });

  describe('getExtension', () => {
    it('should return txt extension', () => {
      expect(formatter.getExtension()).toBe('txt');
    });
  });

  describe('getMimeType', () => {
    it('should return text/plain MIME type', () => {
      expect(formatter.getMimeType()).toBe('text/plain');
    });
  });
});

