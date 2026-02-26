/**
 * RTF Parser Edge Case Tests
 * 
 * Tests for edge cases in RTF screenplay parsing
 */

import { RTFParser } from '../rtf-parser';

// Mock rtf-parser library
jest.mock('rtf-parser', () => ({
  string: jest.fn()
}));

describe('RTFParser - Edge Cases', () => {
  let parser: RTFParser;
  let rtfParser: any;

  beforeEach(() => {
    parser = new RTFParser();
    rtfParser = require('rtf-parser');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty and Minimal Content', () => {
    it('should handle RTF with only whitespace', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: '   ' }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi   }`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes).toHaveLength(0);
    });

    it('should handle RTF with only metadata', async () => {
      rtfParser.string.mockResolvedValue({
        content: []
      });

      const content = String.raw`{\rtf1\ansi\deff0}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes).toHaveLength(0);
    });

    it('should handle RTF with only title', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'My Screenplay' }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi My Screenplay}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes).toHaveLength(0);
    });
  });

  describe('RTF Control Words', () => {
    it('should handle RTF with font table', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'INT. ROOM - DAY' }] },
          { type: 'paragraph', content: [{ type: 'text', value: 'Action.' }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi{\fonttbl{\f0 Courier;}}INT. ROOM - DAY\par Action.}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle RTF with color table', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'INT. ROOM - DAY' }] },
          { type: 'paragraph', content: [{ type: 'text', value: 'Action.' }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi{\colortbl;\red0\green0\blue0;}INT. ROOM - DAY\par Action.}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle RTF with style sheet', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'INT. ROOM - DAY' }] },
          { type: 'paragraph', content: [{ type: 'text', value: 'Action.' }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi{\stylesheet{\s0 Normal;}}INT. ROOM - DAY\par Action.}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle RTF with formatting codes', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'INT. ROOM - DAY' }] },
          { type: 'paragraph', content: [{ type: 'text', value: 'Bold and italic action.' }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi INT. ROOM - DAY\par {\b Bold} and {\i italic} action.}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('Unicode and Special Characters', () => {
    it('should handle RTF with Unicode escapes', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'INT. CAFÉ - DAY' }] },
          { type: 'paragraph', content: [{ type: 'text', value: 'Action.' }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi INT. CAF\'e9 - DAY\par Action.}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle RTF with Unicode characters (\\u)', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'INT. ROOM - DAY' }] },
          { type: 'paragraph', content: [{ type: 'text', value: 'Action with emoji 😊.' }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi INT. ROOM - DAY\par Action with emoji \u128522?.}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle RTF with special characters', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'INT. ROOM - DAY' }] },
          { type: 'paragraph', content: [{ type: 'text', value: 'Action with { } \\ special chars.' }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi INT. ROOM - DAY\par Action with \{ \} \\ special chars.}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle RTF with mixed encodings', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'INT. ROOM - DAY' }] },
          { type: 'paragraph', content: [{ type: 'text', value: 'Mixed encoding text.' }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi\ansicpg1252 INT. ROOM - DAY\par Mixed encoding text.}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('Malformed or Corrupted RTF', () => {
    it('should handle RTF with missing closing brace', async () => {
      rtfParser.string.mockRejectedValue(new Error('Unexpected end of RTF'));

      const content = String.raw`{\rtf1\ansi INT. ROOM - DAY`;

      await expect(parser.parse(content)).rejects.toThrow();
    });

    it('should handle RTF with invalid control words', async () => {
      rtfParser.string.mockRejectedValue(new Error('Invalid control word'));

      const content = String.raw`{\rtf1\invalidword INT. ROOM - DAY}`;

      await expect(parser.parse(content)).rejects.toThrow();
    });

    it('should handle corrupted RTF structure', async () => {
      rtfParser.string.mockRejectedValue(new Error('Corrupted RTF'));

      const content = String.raw`{\rtf1 CORRUPTED DATA \par \par \par`;

      await expect(parser.parse(content)).rejects.toThrow();
    });

    it('should handle RTF with binary data', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'INT. ROOM - DAY' }] },
          { type: 'paragraph', content: [{ type: 'text', value: 'Action.' }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi INT. ROOM - DAY\par {\*\shppict{\pict\pngblip...}}Action.}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('Large Documents', () => {
    it('should handle very large RTF (1000+ paragraphs)', async () => {
      const content = [];
      content.push({ type: 'paragraph', content: [{ type: 'text', value: 'INT. ROOM - DAY' }] });
      for (let i = 0; i < 1000; i++) {
        content.push({ type: 'paragraph', content: [{ type: 'text', value: `Action line ${i}.` }] });
      }

      rtfParser.string.mockResolvedValue({ content });

      const rtfContent = String.raw`{\rtf1\ansi LARGE_RTF}`;
      const screenplay = await parser.parse(rtfContent);

      expect(screenplay).toBeDefined();
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle RTF with very long paragraphs', async () => {
      const longText = 'A'.repeat(10000);
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'INT. ROOM - DAY' }] },
          { type: 'paragraph', content: [{ type: 'text', value: longText }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi LONG_PARA}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle deeply nested RTF groups', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'INT. ROOM - DAY' }] },
          { type: 'paragraph', content: [{ type: 'text', value: 'Nested content.' }] }
        ]
      });

      const content = String.raw`{\rtf1{\group1{\group2{\group3 INT. ROOM - DAY}}}}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('Format Detection', () => {
    it('should detect RTF from magic string', () => {
      const content = String.raw`{\rtf1\ansi`;

      expect(parser.canParse(content)).toBe(true);
    });

    it('should detect RTF from file extension', () => {
      const content = 'any content';

      expect(parser.canParse(content, 'script.rtf')).toBe(true);
      expect(parser.canParse(content, 'script.RTF')).toBe(true);
    });

    it('should reject non-RTF content', () => {
      const content = 'Plain text content';

      expect(parser.canParse(content)).toBe(false);
    });

    it('should handle RTF with different versions', () => {
      expect(parser.canParse(String.raw`{\rtf1`)).toBe(true);
      expect(parser.canParse(String.raw`{\rtf0`)).toBe(true);
    });
  });

  describe('Edge Case Combinations', () => {
    it('should handle RTF with all features combined', async () => {
      rtfParser.string.mockResolvedValue({
        content: [
          { type: 'paragraph', content: [{ type: 'text', value: 'INT. CAFÉ - DAY' }] },
          { type: 'paragraph', content: [{ type: 'text', value: 'Bold italic action with special chars { }.' }] }
        ]
      });

      const content = String.raw`{\rtf1\ansi{\fonttbl{\f0 Courier;}}{\colortbl;\red0\green0\blue0;}{\b\i INT. CAF\'e9 - DAY}\par Action.}`;
      const screenplay = await parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });
});

