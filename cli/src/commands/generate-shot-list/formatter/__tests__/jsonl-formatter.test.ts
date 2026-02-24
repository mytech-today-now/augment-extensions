/**
 * JSONL Formatter Unit Tests
 */

import { JSONLFormatter } from '../jsonl-formatter';
import { ShotList, Shot } from '../../generator/types';

describe('JSONLFormatter', () => {
  let formatter: JSONLFormatter;

  beforeEach(() => {
    formatter = new JSONLFormatter();
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
      technicalNotes: ['handheld']
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
    it('should produce valid JSONL with one shot per line', () => {
      const shot1 = createTestShot({ number: 1 });
      const shot2 = createTestShot({ number: 2 });
      const shotList = createTestShotList([shot1, shot2]);

      const output = formatter.format(shotList);
      const lines = output.split('\n');

      expect(lines.length).toBe(2);
      expect(() => JSON.parse(lines[0])).not.toThrow();
      expect(() => JSON.parse(lines[1])).not.toThrow();
    });

    it('should include all shot data in each line', () => {
      const shot = createTestShot();
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);
      const parsed = JSON.parse(output);

      expect(parsed.number).toBe(1);
      expect(parsed.sceneNumber).toBe(1);
      expect(parsed.heading.raw).toBe('INT. COFFEE SHOP - DAY');
      expect(parsed.context.set).toBe('Modern coffee shop');
      expect(parsed.characters.length).toBe(1);
      expect(parsed.description).toBe('Sarah enters the coffee shop and approaches the counter.');
    });

    it('should format duration correctly', () => {
      const shot = createTestShot({ duration: 65 });
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);
      const parsed = JSON.parse(output);

      expect(parsed.duration.seconds).toBe(65);
      expect(parsed.duration.formatted).toBe('1:05');
    });

    it('should calculate character count percentage', () => {
      const shot = createTestShot({ characterCount: 200 });
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList, { maxCharacters: 400 });
      const parsed = JSON.parse(output);

      expect(parsed.characterCount.count).toBe(200);
      expect(parsed.characterCount.limit).toBe(400);
      expect(parsed.characterCount.percentage).toBe(50);
    });

    it('should handle empty shot list', () => {
      const shotList = createTestShotList([]);

      const output = formatter.format(shotList);

      expect(output).toBe('');
    });

    it('should handle single shot', () => {
      const shot = createTestShot();
      const shotList = createTestShotList([shot]);

      const output = formatter.format(shotList);
      const lines = output.split('\n');

      expect(lines.length).toBe(1);
      expect(() => JSON.parse(lines[0])).not.toThrow();
    });
  });

  describe('getExtension', () => {
    it('should return jsonl extension', () => {
      expect(formatter.getExtension()).toBe('jsonl');
    });
  });

  describe('getMimeType', () => {
    it('should return application/jsonl MIME type', () => {
      expect(formatter.getMimeType()).toBe('application/jsonl');
    });
  });
});

