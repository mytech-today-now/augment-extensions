/**
 * PDF Parser Tests
 */

import { PDFParser } from '../pdf-parser';
import { Screenplay } from '../types';

// Mock pdf-parse module
jest.mock('pdf-parse', () => {
  return jest.fn((buffer: Buffer) => {
    const content = buffer.toString('utf-8');
    
    // Simulate PDF text extraction
    if (content.includes('MOCK_PDF_CONTENT')) {
      return Promise.resolve({
        text: `INT. COFFEE SHOP - DAY

SARAH, 30s, enters carrying a laptop. She scans the room.

SARAH
(to barista)
Large coffee, please.

The BARISTA nods and starts making the drink.

EXT. STREET - NIGHT

JOHN walks alone, hands in pockets.`,
        numpages: 1,
        info: {},
        metadata: null,
        version: '1.10.100'
      });
    }
    
    return Promise.resolve({
      text: '',
      numpages: 0,
      info: {},
      metadata: null,
      version: '1.10.100'
    });
  });
});

describe('PDFParser', () => {
  let parser: PDFParser;

  beforeEach(() => {
    parser = new PDFParser();
  });

  describe('getName()', () => {
    it('should return parser name', () => {
      expect(parser.getName()).toBe('PDF');
    });
  });

  describe('canParse()', () => {
    it('should detect PDF by file extension', () => {
      const content = '%PDF-1.4';
      expect(parser.canParse(content, 'script.pdf')).toBe(true);
    });

    it('should detect PDF by magic number', () => {
      const content = '%PDF-1.4\n%âãÏÓ';
      expect(parser.canParse(content)).toBe(true);
    });

    it('should reject non-PDF content', () => {
      const content = 'INT. COFFEE SHOP - DAY';
      expect(parser.canParse(content)).toBe(false);
    });

    it('should reject files without PDF magic number', () => {
      const content = 'This is not a PDF file';
      expect(parser.canParse(content, 'script.txt')).toBe(false);
    });
  });

  describe('parse()', () => {
    it('should parse PDF and extract text', async () => {
      const mockPdfBuffer = Buffer.from('MOCK_PDF_CONTENT', 'utf-8');
      
      const screenplay = await parser.parse(mockPdfBuffer);

      expect(screenplay.scenes).toHaveLength(2);
      expect(screenplay.scenes[0].heading.intExt).toBe('INT');
      expect(screenplay.scenes[0].heading.location).toBe('COFFEE SHOP');
      expect(screenplay.scenes[1].heading.intExt).toBe('EXT');
      expect(screenplay.scenes[1].heading.location).toBe('STREET');
    });

    it('should handle string input by converting to Buffer', async () => {
      const mockPdfString = 'MOCK_PDF_CONTENT';
      
      const screenplay = await parser.parse(mockPdfString);
      
      expect(screenplay.scenes).toHaveLength(2);
    });

    it('should delegate to PlainTextParser after extraction', async () => {
      const mockPdfBuffer = Buffer.from('MOCK_PDF_CONTENT', 'utf-8');
      
      const screenplay = await parser.parse(mockPdfBuffer);
      
      // Verify that PlainTextParser was used (scenes were parsed)
      expect(screenplay.scenes.length).toBeGreaterThan(0);
      expect(screenplay.scenes[0].elements.length).toBeGreaterThan(0);
    });

    it('should throw error for empty PDF', async () => {
      const emptyPdfBuffer = Buffer.from('EMPTY_PDF', 'utf-8');

      await expect(parser.parse(emptyPdfBuffer)).rejects.toThrow('PDF contains no extractable text');
    });

    it('should throw error if pdf-parse fails', async () => {
      // Mock pdf-parse to throw error
      const pdfParse = require('pdf-parse');
      pdfParse.mockImplementationOnce(() => {
        return Promise.reject(new Error('PDF parsing failed'));
      });

      const mockPdfBuffer = Buffer.from('INVALID_PDF', 'utf-8');
      
      await expect(parser.parse(mockPdfBuffer)).rejects.toThrow('Failed to parse PDF');
    });

    it('should handle Buffer input correctly', async () => {
      const mockPdfBuffer = Buffer.from('MOCK_PDF_CONTENT', 'utf-8');
      
      const screenplay = await parser.parse(mockPdfBuffer);
      
      expect(screenplay).toBeDefined();
      expect(screenplay.scenes).toBeDefined();
    });

    it('should extract dialogue from PDF text', async () => {
      const mockPdfBuffer = Buffer.from('MOCK_PDF_CONTENT', 'utf-8');
      
      const screenplay = await parser.parse(mockPdfBuffer);
      
      const dialogue = screenplay.scenes[0].elements.find(e => e.type === 'dialogue');
      expect(dialogue).toBeDefined();
      if (dialogue && dialogue.type === 'dialogue') {
        expect(dialogue.dialogue.character.name).toBe('SARAH');
        expect(dialogue.dialogue.speech).toContain('Large coffee');
      }
    });
  });
});

