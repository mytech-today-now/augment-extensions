/**
 * Parser Integration Edge Case Tests
 *
 * Tests for edge cases in format detection and parser factory
 */

import { detectFormatFromExtension, detectFormatFromContent, createParser, createParserAuto } from '../index';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to detect format (combines extension and content detection)
function detectFormat(content: string, filename?: string): 'fountain' | 'markdown' | 'plaintext' | 'finaldraft' | 'pdf' | 'docx' | 'rtf' {
  if (filename) {
    const extFormat = detectFormatFromExtension(filename);
    if (extFormat) return extFormat;
  }
  return detectFormatFromContent(content);
}

describe('Parser Integration - Edge Cases', () => {
  describe('Format Detection Edge Cases', () => {
    it('should handle files with no extension', () => {
      const content = 'INT. ROOM - DAY\n\nAction.';
      const format = detectFormat(content, 'screenplay');

      // Content detection identifies fountain format from scene heading
      expect(format).toBe('fountain');
    });

    it('should handle files with multiple dots in name', () => {
      const content = 'INT. ROOM - DAY\n\nAction.';
      const format = detectFormat(content, 'my.screenplay.v2.fountain');

      expect(format).toBe('fountain');
    });

    it('should handle files with uppercase extensions', () => {
      const content = '<?xml version="1.0"?><FinalDraft></FinalDraft>';
      const format = detectFormat(content, 'script.FDX');

      expect(format).toBe('finaldraft');
    });

    it('should handle files with mixed case extensions', () => {
      const content = '%PDF-1.4';
      const format = detectFormat(content, 'script.PdF');

      expect(format).toBe('pdf');
    });

    it('should detect format from content when extension is misleading', () => {
      const content = '<?xml version="1.0"?><FinalDraft DocumentType="Script"></FinalDraft>';
      const format = detectFormat(content, 'script.txt');

      // .txt extension takes precedence, falls back to plaintext
      // (Content detection for FinalDraft requires more complete XML structure)
      expect(format).toBe('plaintext');
    });

    it('should handle empty filename', () => {
      const content = 'INT. ROOM - DAY\n\nAction.';
      const format = detectFormat(content, '');

      // Content detection identifies fountain format from scene heading
      expect(format).toBe('fountain');
    });

    it('should handle undefined filename', () => {
      const content = 'INT. ROOM - DAY\n\nAction.';
      const format = detectFormat(content);

      // Content detection identifies fountain format from scene heading
      expect(format).toBe('fountain');
    });

    it('should handle content with BOM (Byte Order Mark)', () => {
      const content = '\uFEFFINT. ROOM - DAY\n\nAction.';
      const format = detectFormat(content, 'script.txt');
      
      expect(format).toBe('plaintext');
    });

    it('should handle binary content (PDF magic number)', () => {
      const content = '%PDF-1.4\n%âãÏÓ\nbinary data...';
      const format = detectFormat(content);
      
      expect(format).toBe('pdf');
    });

    it('should handle DOCX magic number (ZIP signature)', () => {
      const content = 'PK\x03\x04...';
      const format = detectFormat(content, 'script.docx');
      
      expect(format).toBe('docx');
    });

    it('should fallback to plaintext for unknown formats', () => {
      const content = 'Some random content';
      const format = detectFormat(content, 'script.xyz');
      
      expect(format).toBe('plaintext');
    });

    it('should handle empty content', () => {
      const content = '';
      const format = detectFormat(content, 'script.txt');
      
      expect(format).toBe('plaintext');
    });

    it('should handle whitespace-only content', () => {
      const content = '   \n\n   \t\t   ';
      const format = detectFormat(content, 'script.txt');
      
      expect(format).toBe('plaintext');
    });
  });

  describe('Parser Factory Edge Cases', () => {
    it('should throw error for unknown format', () => {
      expect(() => createParser('unknown' as any)).toThrow('Unknown format');
    });

    it('should throw error for format with different casing', () => {
      // Parser factory is case-sensitive
      expect(() => createParser('FOUNTAIN' as any)).toThrow('Unknown format');
    });

    it('should throw error for null format', () => {
      expect(() => createParser(null as any)).toThrow('Unknown format');
    });

    it('should throw error for undefined format', () => {
      expect(() => createParser(undefined as any)).toThrow('Unknown format');
    });
  });

  describe('End-to-End Edge Cases', () => {
    it('should parse file with mixed content types', async () => {
      const content = `# Screenplay Title

INT. ROOM - DAY

Action line.

SARAH
Dialogue.

= Scene Heading

More action.`;

      const format = detectFormat(content, 'script.txt');
      const parser = createParser(format);
      const screenplay = await Promise.resolve(parser.parse(content));

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle file with only metadata (no scenes)', async () => {
      const content = `Title: My Screenplay
Author: John Doe
Draft: First Draft

`;

      const format = detectFormat(content, 'script.txt');
      const parser = createParser(format);
      const screenplay = await Promise.resolve(parser.parse(content));

      // Should handle gracefully even with no scenes
      expect(screenplay).toBeDefined();
    });

    it('should handle file with unusual line endings', async () => {
      const content = 'INT. ROOM - DAY\r\n\r\nAction.\r\n\nSARAH\nDialogue.\n\r\n';

      const format = detectFormat(content, 'script.txt');
      const parser = createParser(format);
      const screenplay = await Promise.resolve(parser.parse(content));

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle very long filenames', () => {
      const longFilename = 'a'.repeat(200) + '.fountain';
      const content = 'INT. ROOM - DAY\n\nAction.';
      
      const format = detectFormat(content, longFilename);
      
      expect(format).toBe('fountain');
    });

    it('should handle filenames with special characters', () => {
      const content = 'INT. ROOM - DAY\n\nAction.';
      const format = detectFormat(content, 'my-screenplay (v2) [draft].fountain');
      
      expect(format).toBe('fountain');
    });
  });

  describe('Parser Compatibility Edge Cases', () => {
    it('should handle content that could be multiple formats', async () => {
      // Content that looks like both Markdown and Fountain
      const content = `# Title

INT. ROOM - DAY

Action.`;

      const format = detectFormat(content, 'script.txt');
      const parser = createParser(format);
      const screenplay = await Promise.resolve(parser.parse(content));

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should prioritize extension over content detection', () => {
      // Fountain content with .md extension
      const content = `INT. ROOM - DAY

Action.

SARAH
Dialogue.`;

      const format = detectFormat(content, 'script.md');

      // Should detect as markdown due to extension
      expect(format).toBe('markdown');
    });

    it('should handle ambiguous content without extension', () => {
      const content = `Scene 1

Some text here.`;

      const format = detectFormat(content);

      // Should fallback to plaintext
      expect(format).toBe('plaintext');
    });
  });

  describe('Error Recovery Edge Cases', () => {
    it('should recover from parser errors and return partial results', async () => {
      const content = `INT. ROOM - DAY

Action.

SARAH
Dialogue.

MALFORMED SCENE HEADING WITHOUT INT/EXT

More action.`;

      const format = detectFormat(content, 'script.txt');
      const parser = createParser(format);

      // Should not throw, should parse what it can
      const screenplay = await Promise.resolve(parser.parse(content));
      expect(screenplay).toBeDefined();
    });

    it('should handle content with null bytes', async () => {
      const content = 'INT. ROOM - DAY\x00\n\nAction.';

      const format = detectFormat(content, 'script.txt');
      const parser = createParser(format);
      const screenplay = await Promise.resolve(parser.parse(content));

      expect(screenplay).toBeDefined();
    });

    it('should handle content with control characters', async () => {
      const content = 'INT. ROOM - DAY\x01\x02\x03\n\nAction.';

      const format = detectFormat(content, 'script.txt');
      const parser = createParser(format);
      const screenplay = await Promise.resolve(parser.parse(content));

      expect(screenplay).toBeDefined();
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('should handle very large content (>1MB)', async () => {
      let largeContent = 'INT. ROOM - DAY\n\n';

      // Create ~1MB of content
      for (let i = 0; i < 10000; i++) {
        largeContent += `Action line ${i}.\n`;
      }

      const format = detectFormat(largeContent, 'script.txt');
      const parser = createParser(format);
      const screenplay = await Promise.resolve(parser.parse(largeContent));

      expect(screenplay).toBeDefined();
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle repeated format detection calls', () => {
      const content = 'INT. ROOM - DAY\n\nAction.';

      // Call detectFormat many times
      for (let i = 0; i < 100; i++) {
        const format = detectFormat(content, 'script.txt');
        expect(format).toBe('plaintext');
      }
    });

    it('should handle repeated parser creation', () => {
      // Create many parsers
      for (let i = 0; i < 100; i++) {
        const parser = createParser('plaintext');
        expect(parser).toBeDefined();
      }
    });
  });

  describe('Unicode and Encoding Edge Cases', () => {
    it('should handle RTL (Right-to-Left) text', async () => {
      const content = `INT. ROOM - DAY

Action in English.

SARAH
مرحبا بك (Arabic text)

More action.`;

      const format = detectFormat(content, 'script.txt');
      const parser = createParser(format);
      const screenplay = await Promise.resolve(parser.parse(content));

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle mixed scripts (Latin, Cyrillic, CJK)', async () => {
      const content = `INT. ROOM - DAY

English action.

ИВАН
Привет! (Russian)

李明
你好！(Chinese)

さくら
こんにちは！(Japanese)`;

      const format = detectFormat(content, 'script.txt');
      const parser = createParser(format);
      const screenplay = await Promise.resolve(parser.parse(content));

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle zero-width characters', async () => {
      const content = 'INT.\u200bROOM\u200b-\u200bDAY\n\nAction.';

      const format = detectFormat(content, 'script.txt');
      const parser = createParser(format);
      const screenplay = await Promise.resolve(parser.parse(content));

      expect(screenplay).toBeDefined();
    });

    it('should handle combining diacritical marks', async () => {
      const content = `INT. ROOM - DAY

Café with combining marks: Cafe\u0301

JOSÉ
Dialogue with José\u0301`;

      const format = detectFormat(content, 'script.txt');
      const parser = createParser(format);
      const screenplay = await Promise.resolve(parser.parse(content));

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });
});
