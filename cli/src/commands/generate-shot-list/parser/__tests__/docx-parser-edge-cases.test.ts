/**
 * DOCX Parser Edge Case Tests
 * 
 * Tests for edge cases in DOCX screenplay parsing
 */

import { DOCXParser } from '../docx-parser';

// Mock mammoth library
jest.mock('mammoth', () => ({
  convertToHtml: jest.fn(),
  extractRawText: jest.fn()
}));

describe('DOCXParser - Edge Cases', () => {
  let parser: DOCXParser;
  let mammoth: any;

  beforeEach(() => {
    parser = new DOCXParser();
    mammoth = require('mammoth');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty and Minimal Content', () => {
    it('should handle DOCX with only whitespace', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '<p>   </p><p>   </p>',
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04DOCX_DATA', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay.scenes).toHaveLength(0);
    });

    it('should handle DOCX with only metadata (no content)', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '',
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04DOCX_DATA', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay.scenes).toHaveLength(0);
    });

    it('should handle DOCX with only title page', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '<h1>My Screenplay</h1><p>By John Doe</p>',
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04DOCX_DATA', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay.title).toBeDefined();
      expect(screenplay.scenes).toHaveLength(0);
    });
  });

  describe('Complex Formatting', () => {
    it('should handle DOCX with complex styles', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '<p style="font-weight: bold;">INT. ROOM - DAY</p><p>Action.</p>',
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04DOCX_DATA', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle DOCX with tables', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '<table><tr><td>INT. ROOM - DAY</td></tr><tr><td>Action.</td></tr></table>',
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04DOCX_DATA', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay).toBeDefined();
    });

    it('should handle DOCX with images', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '<p>INT. ROOM - DAY</p><img src="data:image/png;base64,..." /><p>Action.</p>',
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04DOCX_DATA', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle DOCX with footnotes and endnotes', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '<p>INT. ROOM - DAY<sup>1</sup></p><p>Action.</p><p class="footnote">1. Note</p>',
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04DOCX_DATA', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle DOCX with headers and footers', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '<header>Page Header</header><p>INT. ROOM - DAY</p><p>Action.</p><footer>Page 1</footer>',
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04DOCX_DATA', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('Unicode and Special Characters', () => {
    it('should handle DOCX with Unicode characters', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '<p>INT. CAFÉ - DAY</p><p>Action with émojis 😊.</p>',
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04DOCX_DATA', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle DOCX with RTL text', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '<p dir="rtl">مشهد داخلي</p><p>Action in English.</p>',
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04DOCX_DATA', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay).toBeDefined();
    });

    it('should handle DOCX with mixed scripts (CJK)', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '<p>场景 (Chinese)</p><p>日本語</p><p>한국어</p>',
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04DOCX_DATA', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay).toBeDefined();
    });
  });

  describe('Malformed or Corrupted DOCX', () => {
    it('should handle corrupted DOCX structure', async () => {
      mammoth.convertToHtml.mockRejectedValue(new Error('Invalid DOCX structure'));

      const buffer = Buffer.from('PK\x03\x04CORRUPTED', 'binary');

      await expect(parser.parse(buffer)).rejects.toThrow();
    });

    it('should handle DOCX with missing content.xml', async () => {
      mammoth.convertToHtml.mockRejectedValue(new Error('content.xml not found'));

      const buffer = Buffer.from('PK\x03\x04INCOMPLETE', 'binary');

      await expect(parser.parse(buffer)).rejects.toThrow();
    });

    it('should handle password-protected DOCX', async () => {
      mammoth.convertToHtml.mockRejectedValue(new Error('Document is password protected'));

      const buffer = Buffer.from('PK\x03\x04PROTECTED', 'binary');

      await expect(parser.parse(buffer)).rejects.toThrow('password protected');
    });

    it('should handle DOCX with invalid XML', async () => {
      mammoth.convertToHtml.mockRejectedValue(new Error('XML parsing error'));

      const buffer = Buffer.from('PK\x03\x04INVALID_XML', 'binary');

      await expect(parser.parse(buffer)).rejects.toThrow();
    });
  });

  describe('Large Documents', () => {
    it('should handle very large DOCX (1000+ paragraphs)', async () => {
      let html = '<p>INT. ROOM - DAY</p>';
      for (let i = 0; i < 1000; i++) {
        html += `<p>Action line ${i}.</p>`;
      }

      mammoth.convertToHtml.mockResolvedValue({
        value: html,
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04LARGE_DOCX', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay).toBeDefined();
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle DOCX with very long paragraphs', async () => {
      const longText = 'A'.repeat(10000);
      mammoth.convertToHtml.mockResolvedValue({
        value: `<p>INT. ROOM - DAY</p><p>${longText}</p>`,
        messages: []
      });

      const buffer = Buffer.from('PK\x03\x04LONG_PARA', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('Conversion Warnings', () => {
    it('should handle mammoth conversion warnings', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '<p>INT. ROOM - DAY</p><p>Action.</p>',
        messages: [
          { type: 'warning', message: 'Unsupported style' },
          { type: 'warning', message: 'Unknown element' }
        ]
      });

      const buffer = Buffer.from('PK\x03\x04WITH_WARNINGS', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle DOCX with unsupported features', async () => {
      mammoth.convertToHtml.mockResolvedValue({
        value: '<p>INT. ROOM - DAY</p><p>Action.</p>',
        messages: [
          { type: 'warning', message: 'SmartArt not supported' },
          { type: 'warning', message: 'Charts not supported' }
        ]
      });

      const buffer = Buffer.from('PK\x03\x04UNSUPPORTED', 'binary');
      const screenplay = await parser.parse(buffer);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('Format Detection', () => {
    it('should detect DOCX from magic number', () => {
      const buffer = Buffer.from('PK\x03\x04', 'binary');

      expect(parser.canParse(buffer)).toBe(true);
    });

    it('should detect DOCX from file extension', () => {
      const content = 'any content';

      expect(parser.canParse(content, 'script.docx')).toBe(true);
      expect(parser.canParse(content, 'script.doc')).toBe(true);
    });

    it('should reject non-DOCX content', () => {
      const content = 'Plain text content';

      expect(parser.canParse(content)).toBe(false);
    });
  });
});

