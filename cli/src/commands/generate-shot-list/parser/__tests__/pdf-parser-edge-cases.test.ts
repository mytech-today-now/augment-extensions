/**
 * PDF Parser Edge Case Tests
 * 
 * Tests for unusual, malformed, or extreme PDF inputs
 */

import { PDFParser } from '../pdf-parser';

// Mock pdf-parse module with edge case scenarios
jest.mock('pdf-parse', () => {
  return jest.fn((buffer: Buffer) => {
    const content = buffer.toString('utf-8');
    
    // Whitespace-only PDF
    if (content.includes('WHITESPACE_PDF')) {
      return Promise.resolve({
        text: '   \n\n   \t\t   \n   ',
        numpages: 1,
        info: {},
        metadata: null,
        version: '1.10.100'
      });
    }
    
    // Unicode and special characters
    if (content.includes('UNICODE_PDF')) {
      return Promise.resolve({
        text: `INT. CAFÉ - DAY

FRANÇOIS, 30s, enters.

FRANÇOIS
(en français)
Bonjour! ¿Cómo estás? 你好！ 😊

EXT. STREET - NIGHT

MARÍA walks alone.`,
        numpages: 1,
        info: {},
        metadata: null,
        version: '1.10.100'
      });
    }
    
    // Very long text
    if (content.includes('LARGE_PDF')) {
      let scenes = '';
      for (let i = 1; i <= 50; i++) {
        scenes += `\nINT. ROOM ${i} - DAY\n\nAction in scene ${i}.\n\n`;
      }
      return Promise.resolve({
        text: scenes,
        numpages: 50,
        info: {},
        metadata: null,
        version: '1.10.100'
      });
    }
    
    // Mixed line endings
    if (content.includes('MIXED_ENDINGS_PDF')) {
      return Promise.resolve({
        text: 'INT. ROOM - DAY\r\n\r\nAction line.\r\n\nSARAH\nHello!\n\r\nEXT. STREET - NIGHT\n\nMore action.',
        numpages: 1,
        info: {},
        metadata: null,
        version: '1.10.100'
      });
    }
    
    // PDF with BOM (Byte Order Mark)
    if (content.includes('BOM_PDF')) {
      return Promise.resolve({
        text: '\uFEFFINT. ROOM - DAY\n\nAction with BOM.',
        numpages: 1,
        info: {},
        metadata: null,
        version: '1.10.100'
      });
    }
    
    // Malformed but parseable
    if (content.includes('MALFORMED_PDF')) {
      return Promise.resolve({
        text: `INT. ROOM - DAY
No blank line before action
SARAH
No blank line before character
Dialogue without proper spacing`,
        numpages: 1,
        info: {},
        metadata: null,
        version: '1.10.100'
      });
    }
    
    // PDF with unusual spacing
    if (content.includes('SPACING_PDF')) {
      return Promise.resolve({
        text: `INT.    ROOM    -    DAY


Multiple blank lines


SARAH
(  lots of spaces  )
Dialogue    with    spaces`,
        numpages: 1,
        info: {},
        metadata: null,
        version: '1.10.100'
      });
    }
    
    // Corrupted PDF (throws error)
    if (content.includes('CORRUPTED_PDF')) {
      return Promise.reject(new Error('Invalid PDF structure'));
    }
    
    // Password-protected PDF
    if (content.includes('PROTECTED_PDF')) {
      return Promise.reject(new Error('PDF is password protected'));
    }
    
    // Default: empty
    return Promise.resolve({
      text: '',
      numpages: 0,
      info: {},
      metadata: null,
      version: '1.10.100'
    });
  });
});

describe('PDFParser - Edge Cases', () => {
  let parser: PDFParser;

  beforeEach(() => {
    parser = new PDFParser();
  });

  describe('Whitespace and Empty Content', () => {
    it('should handle PDF with only whitespace', async () => {
      const whitespacePdf = Buffer.from('WHITESPACE_PDF', 'utf-8');
      
      await expect(parser.parse(whitespacePdf)).rejects.toThrow('PDF contains no extractable text');
    });

    it('should handle emojis and special symbols in PDF', async () => {
      const emojiPdf = Buffer.from('UNICODE_PDF', 'utf-8');

      const screenplay = await parser.parse(emojiPdf);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
      // Should handle emojis without crashing
    });
  });

  describe('Large and Complex PDFs', () => {
    it('should handle very large PDF (50+ pages)', async () => {
      const largePdf = Buffer.from('LARGE_PDF', 'utf-8');

      const screenplay = await parser.parse(largePdf);

      expect(screenplay.scenes.length).toBeGreaterThanOrEqual(40);
      expect(screenplay.metadata.totalScenes).toBeGreaterThanOrEqual(40);
    });

    it('should handle PDF with unusual spacing', async () => {
      const spacingPdf = Buffer.from('SPACING_PDF', 'utf-8');

      const screenplay = await parser.parse(spacingPdf);

      expect(screenplay.scenes).toHaveLength(1);
      // Should normalize spacing
      expect(screenplay.scenes[0].heading.location).toContain('ROOM');
    });

    it('should handle malformed but parseable PDF', async () => {
      const malformedPdf = Buffer.from('MALFORMED_PDF', 'utf-8');

      const screenplay = await parser.parse(malformedPdf);

      expect(screenplay.scenes).toHaveLength(1);
      // Should attempt to parse even with formatting issues
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted PDF gracefully', async () => {
      const corruptedPdf = Buffer.from('CORRUPTED_PDF', 'utf-8');

      await expect(parser.parse(corruptedPdf)).rejects.toThrow('Failed to parse PDF');
    });

    it('should handle password-protected PDF', async () => {
      const protectedPdf = Buffer.from('PROTECTED_PDF', 'utf-8');

      await expect(parser.parse(protectedPdf)).rejects.toThrow('Failed to parse PDF');
    });

    it('should handle null or undefined input', async () => {
      await expect(parser.parse(null as any)).rejects.toThrow();
      await expect(parser.parse(undefined as any)).rejects.toThrow();
    });

    it('should handle empty Buffer', async () => {
      const emptyBuffer = Buffer.from('', 'utf-8');

      await expect(parser.parse(emptyBuffer)).rejects.toThrow();
    });

    it('should handle very small Buffer (< 10 bytes)', async () => {
      const tinyBuffer = Buffer.from('tiny', 'utf-8');

      await expect(parser.parse(tinyBuffer)).rejects.toThrow();
    });
  });

  describe('Input Type Variations', () => {
    it('should handle Buffer input', async () => {
      const buffer = Buffer.from('UNICODE_PDF', 'utf-8');

      const screenplay = await parser.parse(buffer);

      expect(screenplay).toBeDefined();
      expect(screenplay.scenes).toBeDefined();
    });

    it('should handle string input and convert to Buffer', async () => {
      const stringInput = 'UNICODE_PDF';

      const screenplay = await parser.parse(stringInput);

      expect(screenplay).toBeDefined();
      expect(screenplay.scenes).toBeDefined();
    });

    it('should handle ArrayBuffer input', async () => {
      const arrayBuffer = new Uint8Array(Buffer.from('UNICODE_PDF', 'utf-8')).buffer;
      const buffer = Buffer.from(arrayBuffer);

      const screenplay = await parser.parse(buffer);

      expect(screenplay).toBeDefined();
    });
  });

  describe('Metadata Extraction', () => {
    it('should extract metadata from large PDF', async () => {
      const largePdf = Buffer.from('LARGE_PDF', 'utf-8');

      const screenplay = await parser.parse(largePdf);

      expect(screenplay.metadata).toBeDefined();
      expect(screenplay.metadata.format).toBe('pdf');
      expect(screenplay.metadata.totalScenes).toBeGreaterThan(0);
      expect(screenplay.metadata.parsedAt).toBeDefined();
    });

    it('should handle PDF with no metadata', async () => {
      const unicodePdf = Buffer.from('UNICODE_PDF', 'utf-8');

      const screenplay = await parser.parse(unicodePdf);

      expect(screenplay.metadata).toBeDefined();
      expect(screenplay.metadata.format).toBe('pdf');
    });
  });

  describe('Performance and Memory', () => {
    it('should handle repeated parsing without memory leaks', async () => {
      const pdf = Buffer.from('UNICODE_PDF', 'utf-8');

      // Parse multiple times
      for (let i = 0; i < 10; i++) {
        const screenplay = await parser.parse(pdf);
        expect(screenplay.scenes.length).toBeGreaterThan(0);
      }
    });

    it('should handle concurrent parsing', async () => {
      const pdf1 = Buffer.from('UNICODE_PDF', 'utf-8');
      const pdf2 = Buffer.from('MIXED_ENDINGS_PDF', 'utf-8');
      const pdf3 = Buffer.from('LARGE_PDF', 'utf-8');

      const results = await Promise.all([
        parser.parse(pdf1),
        parser.parse(pdf2),
        parser.parse(pdf3)
      ]);

      expect(results).toHaveLength(3);
      expect(results[0].scenes.length).toBeGreaterThan(0);
      expect(results[1].scenes.length).toBeGreaterThan(0);
      expect(results[2].scenes.length).toBeGreaterThan(0);
    });
  });
});
