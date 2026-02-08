/**
 * Tests for Fountain Parser
 */

import { parseFountain } from '../parser';
import { CharacterListInfo } from '../preprocessor';

describe('Fountain Parser', () => {
  describe('Scene Heading Detection', () => {
    it('should detect INT. scene headings', () => {
      const input = 'INT. OFFICE - DAY';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('scene_heading');
      expect(result.elements[0].content).toBe('INT. OFFICE - DAY');
    });

    it('should detect EXT. scene headings', () => {
      const input = 'EXT. CITY STREET - NIGHT';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('scene_heading');
    });

    it('should detect INT./EXT. scene headings', () => {
      const input = 'INT./EXT. CAR - MOVING - DAY';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('scene_heading');
    });

    it('should detect forced scene headings with .', () => {
      const input = '.FLASHBACK - 10 YEARS EARLIER';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('scene_heading');
      expect(result.elements[0].content).toBe('FLASHBACK - 10 YEARS EARLIER');
      expect(result.elements[0].metadata?.forced).toBe(true);
    });
  });

  describe('Character Name Detection', () => {
    it('should detect character names followed by dialogue', () => {
      const input = 'JOHN\nThis is dialogue.';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[0].content).toBe('JOHN');
      expect(result.elements[1].type).toBe('dialogue');
    });

    it('should detect character names with extensions', () => {
      const input = 'JOHN (O.S.)\nThis is off-screen dialogue.';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[0].content).toBe('JOHN (O.S.)');
    });

    it('should NOT detect character names without dialogue', () => {
      const input = 'JOHN\n\nINT. OFFICE - DAY';
      const result = parseFountain(input);
      // JOHN should be classified as action since no dialogue follows
      expect(result.elements[0].type).toBe('action');
    });

    it('should NOT detect bullet list items as character names', () => {
      const input = '- JOHN DOE\n- JANE SMITH';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('action');
      expect(result.elements[1].type).toBe('action');
    });

    it('should NOT detect labels ending with colon as character names', () => {
      const input = 'CHARACTERS PRESENT:\n- John\n- Jane';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('action');
    });

    it('should detect forced character names with @', () => {
      const input = '@john\nThis is dialogue.';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[0].content).toBe('john');
      expect(result.elements[0].metadata?.forced).toBe(true);
    });
  });

  describe('Dialogue Detection', () => {
    it('should detect dialogue after character name', () => {
      const input = 'SARAH\nI can\'t believe this.';
      const result = parseFountain(input);
      expect(result.elements[1].type).toBe('dialogue');
      expect(result.elements[1].content).toBe('I can\'t believe this.');
    });

    it('should detect dialogue after parenthetical', () => {
      const input = 'SARAH\n(concerned)\nAre you okay?';
      const result = parseFountain(input);
      expect(result.elements[2].type).toBe('dialogue');
    });
  });

  describe('Action Detection', () => {
    it('should detect action lines', () => {
      const input = 'Sarah walks to the window.';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('action');
    });

    it('should detect action with sound effects', () => {
      const input = 'The phone RINGS loudly.';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('action');
    });

    it('should classify character lists as action', () => {
      const characterLists: CharacterListInfo[] = [{
        startLine: 0,
        endLine: 2,
        characters: ['JOHN DOE', 'JANE SMITH']
      }];
      const input = 'CHARACTERS PRESENT:\n- JOHN DOE\n- JANE SMITH';
      const result = parseFountain(input, characterLists);
      
      expect(result.elements[0].type).toBe('action');
      expect(result.elements[1].type).toBe('action');
      expect(result.elements[2].type).toBe('action');
      expect(result.elements[1].metadata?.inCharacterList).toBe(true);
    });
  });

  describe('Parenthetical Detection', () => {
    it('should detect parentheticals', () => {
      const input = 'JOHN\n(nervous)\nI need to tell you something.';
      const result = parseFountain(input);
      expect(result.elements[1].type).toBe('parenthetical');
      expect(result.elements[1].content).toBe('(nervous)');
    });
  });

  describe('Transition Detection', () => {
    it('should detect CUT TO:', () => {
      const input = 'CUT TO:';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('transition');
    });

    it('should detect FADE OUT.', () => {
      const input = 'FADE OUT.';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('transition');
    });

    it('should detect forced transitions with >', () => {
      const input = '> FADE TO BLACK';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('transition');
      expect(result.elements[0].metadata?.forced).toBe(true);
    });
  });

  describe('Centered Text Detection', () => {
    it('should detect centered text', () => {
      const input = '> FADE IN: <';
      const result = parseFountain(input);
      expect(result.elements[0].type).toBe('centered');
      expect(result.elements[0].content).toBe('FADE IN:');
    });
  });
});

