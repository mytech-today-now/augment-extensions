/**
 * Tests for Fountain Preprocessor
 */

import { preprocessFountain } from '../preprocessor';

describe('Fountain Preprocessor', () => {
  describe('Markdown Removal', () => {
    it('should remove bold markdown (**text**)', () => {
      const input = '**CHARACTERS PRESENT**:';
      const result = preprocessFountain(input);
      expect(result.content).toBe('CHARACTERS PRESENT:');
    });

    it('should remove bold markdown (__text__)', () => {
      const input = '__CHARACTERS PRESENT__:';
      const result = preprocessFountain(input);
      expect(result.content).toBe('CHARACTERS PRESENT:');
    });

    it('should remove italic markdown (*text*)', () => {
      const input = 'This is *emphasized* text';
      const result = preprocessFountain(input);
      expect(result.content).toBe('This is emphasized text');
    });

    it('should remove italic markdown (_text_)', () => {
      const input = 'This is _emphasized_ text';
      const result = preprocessFountain(input);
      expect(result.content).toBe('This is emphasized text');
    });

    it('should remove headers (# text)', () => {
      const input = '## Scene Heading';
      const result = preprocessFountain(input);
      expect(result.content).toBe('Scene Heading');
    });

    it('should remove links [text](url)', () => {
      const input = 'See [fountain spec](https://fountain.io)';
      const result = preprocessFountain(input);
      expect(result.content).toBe('See fountain spec');
    });

    it('should remove inline code `code`', () => {
      const input = 'Use `INT.` for interior scenes';
      const result = preprocessFountain(input);
      expect(result.content).toBe('Use INT. for interior scenes');
    });

    it('should remove horizontal rules', () => {
      const input = '---\nContent\n***';
      const result = preprocessFountain(input);
      expect(result.content).not.toContain('---');
      expect(result.content).not.toContain('***');
    });
  });

  describe('Whitespace Normalization', () => {
    it('should trim trailing whitespace', () => {
      const input = 'Line with trailing spaces   \nAnother line  ';
      const result = preprocessFountain(input);
      expect(result.content).toBe('Line with trailing spaces\nAnother line');
    });

    it('should limit consecutive empty lines to 2', () => {
      const input = 'Line 1\n\n\n\n\nLine 2';
      const result = preprocessFountain(input);
      const lines = result.content.split('\n');
      const emptyCount = lines.filter(l => l === '').length;
      expect(emptyCount).toBeLessThanOrEqual(2);
    });

    it('should remove trailing empty lines', () => {
      const input = 'Content\n\n\n';
      const result = preprocessFountain(input);
      expect(result.content).toBe('Content');
    });
  });

  describe('Comment Removal', () => {
    it('should remove inline notes [[note]]', () => {
      const input = 'Action line [[this is a note]]';
      const result = preprocessFountain(input);
      expect(result.content).toBe('Action line ');
    });

    it('should remove boneyard sections /* ... */', () => {
      const input = 'Line 1\n/*\nRemove this\nAnd this\n*/\nLine 2';
      const result = preprocessFountain(input);
      expect(result.content).not.toContain('Remove this');
      expect(result.content).toContain('Line 1');
      expect(result.content).toContain('Line 2');
    });
  });

  describe('Character List Detection', () => {
    it('should detect character list with **CHARACTERS PRESENT**:', () => {
      const input = '**CHARACTERS PRESENT**:\n- JOHN DOE\n- JANE SMITH';
      const result = preprocessFountain(input);
      expect(result.characterLists).toHaveLength(1);
      expect(result.characterLists[0].characters).toEqual(['JOHN DOE', 'JANE SMITH']);
    });

    it('should detect character list with CHARACTERS:', () => {
      const input = 'CHARACTERS:\n- RONALD PEMBERTON\n- BRENDA HARTFORD';
      const result = preprocessFountain(input);
      expect(result.characterLists).toHaveLength(1);
      expect(result.characterLists[0].characters).toHaveLength(2);
    });

    it('should detect character list with bullet points (*)', () => {
      const input = 'CHARACTERS PRESENT:\n* ALICE\n* BOB';
      const result = preprocessFountain(input);
      expect(result.characterLists).toHaveLength(1);
      expect(result.characterLists[0].characters).toEqual(['ALICE', 'BOB']);
    });

    it('should end character list at empty line', () => {
      const input = 'CHARACTERS:\n- JOHN\n- JANE\n\nINT. OFFICE - DAY';
      const result = preprocessFountain(input);
      expect(result.characterLists).toHaveLength(1);
      expect(result.characterLists[0].characters).toHaveLength(2);
    });
  });

  describe('Title Page Extraction', () => {
    it('should extract title page metadata', () => {
      const input = 'Title: My Screenplay\nAuthor: John Doe\n\nINT. OFFICE - DAY';
      const result = preprocessFountain(input);
      expect(result.titlePage.title).toBe('My Screenplay');
      expect(result.titlePage.author).toBe('John Doe');
    });

    it('should remove title page from content', () => {
      const input = 'Title: My Screenplay\nAuthor: John Doe\n\nINT. OFFICE - DAY';
      const result = preprocessFountain(input);
      expect(result.content).toContain('INT. OFFICE - DAY');
      expect(result.content).not.toContain('Title:');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input', () => {
      const input = '';
      const result = preprocessFountain(input);
      expect(result.content).toBe('');
      expect(result.metadata.processedLineCount).toBe(0);
    });

    it('should handle input with only whitespace', () => {
      const input = '   \n\n   \n';
      const result = preprocessFountain(input);
      expect(result.content.trim()).toBe('');
    });
  });
});

