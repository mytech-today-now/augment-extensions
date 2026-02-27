/**
 * jq Validation Tests
 * 
 * Tests JSON/JSONL output using jq command-line tool for validation
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { JSONFormatter } from '../../formatter/json-formatter';
import { JSONLFormatter } from '../../formatter/jsonl-formatter';
import { ShotList, Shot } from '../../generator/types';

describe('jq Validation Tests', () => {
  let tempFiles: string[] = [];

  // Check if jq is available
  const jqAvailable = (() => {
    try {
      execSync('jq --version', { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  })();

  beforeEach(() => {
    tempFiles = [];
  });

  afterEach(() => {
    // Clean up temp files
    tempFiles.forEach(file => {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    });
  });

  const createTempFile = (content: string, ext: string): string => {
    const tempFile = join(tmpdir(), `shot-list-test-${Date.now()}.${ext}`);
    writeFileSync(tempFile, content, 'utf-8');
    tempFiles.push(tempFile);
    return tempFile;
  };

  const runJq = (file: string, query: string): string => {
    try {
      return execSync(`jq ${query} "${file}"`, { encoding: 'utf-8' });
    } catch (error) {
      throw new Error(`jq command failed: ${error}`);
    }
  };

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
      maxCharacters: 4000,
      maxShotLength: 12,
      sourceFormat: 'fountain'
    }
  });

  describe('JSON Format Validation', () => {
    const skipIfNoJq = jqAvailable ? it : it.skip;

    skipIfNoJq('should validate JSON structure with jq', () => {
      const formatter = new JSONFormatter();
      const shotList = createTestShotList([createTestShot()]);
      const json = formatter.format(shotList);
      const tempFile = createTempFile(json, 'json');

      // Validate JSON is parseable
      const result = runJq(tempFile, '.');
      expect(result).toBeTruthy();
    });

    skipIfNoJq('should extract metadata with jq', () => {
      const formatter = new JSONFormatter();
      const shotList = createTestShotList([createTestShot()]);
      const json = formatter.format(shotList);
      const tempFile = createTempFile(json, 'json');

      const title = runJq(tempFile, '.metadata.title').trim();
      expect(title).toBe('"Test Screenplay"');

      const sourceFormat = runJq(tempFile, '.metadata.sourceFormat').trim();
      expect(sourceFormat).toBe('"fountain"');
    });

    skipIfNoJq('should extract shot count with jq', () => {
      const formatter = new JSONFormatter();
      const shotList = createTestShotList([createTestShot(), createTestShot({ number: 2 })]);
      const json = formatter.format(shotList);
      const tempFile = createTempFile(json, 'json');

      const shotCount = runJq(tempFile, '.summary.totalShots').trim();
      expect(shotCount).toBe('2');

      const shotsArrayLength = runJq(tempFile, '.shots | length').trim();
      expect(shotsArrayLength).toBe('2');
    });

    skipIfNoJq('should validate all shots have required fields with jq', () => {
      const formatter = new JSONFormatter();
      const shotList = createTestShotList([createTestShot(), createTestShot({ number: 2 })]);
      const json = formatter.format(shotList);
      const tempFile = createTempFile(json, 'json');

      // Check all shots have number field
      const allHaveNumber = runJq(tempFile, '.shots | all(has("number"))').trim();
      expect(allHaveNumber).toBe('true');

      // Check all shots have dialogue field
      const allHaveDialogue = runJq(tempFile, '.shots | all(has("dialogue"))').trim();
      expect(allHaveDialogue).toBe('true');

      // Check all shots have metadata.visualStyle field
      const allHaveVisualStyle = runJq(tempFile, '.shots | all(.metadata | has("visualStyle"))').trim();
      expect(allHaveVisualStyle).toBe('true');
    });

    skipIfNoJq('should validate duration format with jq', () => {
      const formatter = new JSONFormatter();
      const shotList = createTestShotList([createTestShot({ duration: 90 })]);
      const json = formatter.format(shotList);
      const tempFile = createTempFile(json, 'json');

      // Check duration.formatted matches MM:SS pattern
      const durationFormatted = runJq(tempFile, '.shots[0].duration.formatted').trim();
      expect(durationFormatted).toMatch(/^"[0-9]+:[0-5][0-9]"$/);

      // Check duration.seconds is a number
      const durationSeconds = runJq(tempFile, '.shots[0].duration.seconds | type').trim();
      expect(durationSeconds).toBe('"number"');
    });

    skipIfNoJq('should validate character count structure with jq', () => {
      const formatter = new JSONFormatter();
      const shotList = createTestShotList([createTestShot()]);
      const json = formatter.format(shotList);
      const tempFile = createTempFile(json, 'json');

      // Check characterCount has all required fields
      const hasCount = runJq(tempFile, '.shots[0].characterCount | has("count")').trim();
      expect(hasCount).toBe('true');

      const hasLimit = runJq(tempFile, '.shots[0].characterCount | has("limit")').trim();
      expect(hasLimit).toBe('true');

      const hasPercentage = runJq(tempFile, '.shots[0].characterCount | has("percentage")').trim();
      expect(hasPercentage).toBe('true');

      // Check percentage is between 0 and 100
      const percentage = parseInt(runJq(tempFile, '.shots[0].characterCount.percentage').trim());
      expect(percentage).toBeGreaterThanOrEqual(0);
      expect(percentage).toBeLessThanOrEqual(100);
    });

    skipIfNoJq('should validate visual style enum with jq', () => {
      const formatter = new JSONFormatter();
      const shotList = createTestShotList([createTestShot()]);
      const json = formatter.format(shotList);
      const tempFile = createTempFile(json, 'json');

      const visualStyle = runJq(tempFile, '.shots[0].metadata.visualStyle').trim();
      const validStyles = ['"Reality"', '"Animation"', '"CGI"', '"Hybrid"'];
      expect(validStyles).toContain(visualStyle);
    });
  });

  describe('JSONL Format Validation', () => {
    const skipIfNoJq = jqAvailable ? it : it.skip;

    skipIfNoJq('should validate JSONL has one shot per line with jq', () => {
      const formatter = new JSONLFormatter();
      const shotList = createTestShotList([createTestShot(), createTestShot({ number: 2 })]);
      const jsonl = formatter.format(shotList);
      const tempFile = createTempFile(jsonl, 'jsonl');

      // Count lines with jq -s (slurp mode)
      const lineCount = runJq(tempFile, '-s ". | length"').trim();
      expect(lineCount).toBe('2');
    });

    skipIfNoJq('should validate each JSONL line is valid JSON with jq', () => {
      const formatter = new JSONLFormatter();
      const shotList = createTestShotList([createTestShot(), createTestShot({ number: 2 })]);
      const jsonl = formatter.format(shotList);
      const tempFile = createTempFile(jsonl, 'jsonl');

      // Parse each line and check it's an object
      const allObjects = runJq(tempFile, '-s "all(type == \\"object\\")"').trim();
      expect(allObjects).toBe('true');
    });

    skipIfNoJq('should validate JSONL shots have all required fields with jq', () => {
      const formatter = new JSONLFormatter();
      const shotList = createTestShotList([createTestShot()]);
      const jsonl = formatter.format(shotList);
      const tempFile = createTempFile(jsonl, 'jsonl');

      // Check first line has required fields
      const hasNumber = runJq(tempFile, 'select(. != null) | has("number")').trim();
      expect(hasNumber).toBe('true');

      const hasDialogue = runJq(tempFile, 'select(. != null) | has("dialogue")').trim();
      expect(hasDialogue).toBe('true');

      const hasMetadata = runJq(tempFile, 'select(. != null) | has("metadata")').trim();
      expect(hasMetadata).toBe('true');
    });

    skipIfNoJq('should extract shot numbers from JSONL with jq', () => {
      const formatter = new JSONLFormatter();
      const shotList = createTestShotList([
        createTestShot({ number: 1 }),
        createTestShot({ number: '3a' }),
        createTestShot({ number: '3b' })
      ]);
      const jsonl = formatter.format(shotList);
      const tempFile = createTempFile(jsonl, 'jsonl');

      // Extract all shot numbers
      const shotNumbers = runJq(tempFile, '-s "map(.number)"').trim();
      expect(shotNumbers).toContain('1');
      expect(shotNumbers).toContain('"3a"');
      expect(shotNumbers).toContain('"3b"');
    });

    skipIfNoJq('should validate character data in JSONL with jq', () => {
      const formatter = new JSONLFormatter();
      const shotList = createTestShotList([createTestShot()]);
      const jsonl = formatter.format(shotList);
      const tempFile = createTempFile(jsonl, 'jsonl');

      // Check characters array exists and has items
      const hasCharacters = runJq(tempFile, 'select(. != null) | .characters | length > 0').trim();
      expect(hasCharacters).toBe('true');

      // Check first character has wardrobe field
      const hasWardrobe = runJq(tempFile, 'select(. != null) | .characters[0] | has("wardrobe")').trim();
      expect(hasWardrobe).toBe('true');

      // Check first character has physicalAppearance field
      const hasPhysicalAppearance = runJq(tempFile, 'select(. != null) | .characters[0] | has("physicalAppearance")').trim();
      expect(hasPhysicalAppearance).toBe('true');
    });
  });

  describe('jq Availability', () => {
    it('should report jq availability status', () => {
      if (jqAvailable) {
        console.log('✓ jq is available - all jq tests will run');
      } else {
        console.log('⚠ jq is not available - jq tests will be skipped');
        console.log('  Install jq: https://stedolan.github.io/jq/download/');
      }
      expect(true).toBe(true); // Always pass
    });
  });
});
