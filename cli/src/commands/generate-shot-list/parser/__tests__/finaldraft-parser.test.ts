/**
 * Final Draft Parser Tests
 */

import { FinalDraftParser } from '../finaldraft-parser';
import { Screenplay } from '../types';
import * as fs from 'fs';
import * as path from 'path';

describe('FinalDraftParser', () => {
  let parser: FinalDraftParser;

  beforeEach(() => {
    parser = new FinalDraftParser();
  });

  describe('getName()', () => {
    it('should return parser name', () => {
      expect(parser.getName()).toBe('FinalDraft');
    });
  });

  describe('canParse()', () => {
    it('should detect FDX by file extension', () => {
      const content = '<?xml version="1.0"?><FinalDraft></FinalDraft>';
      expect(parser.canParse(content, 'script.fdx')).toBe(true);
    });

    it('should detect FDX by XML structure', () => {
      const content = '<?xml version="1.0"?><FinalDraft DocumentType="Script"></FinalDraft>';
      expect(parser.canParse(content)).toBe(true);
    });

    it('should reject non-FDX content', () => {
      const content = 'INT. COFFEE SHOP - DAY';
      expect(parser.canParse(content)).toBe(false);
    });

    it('should reject XML without FinalDraft root', () => {
      const content = '<?xml version="1.0"?><Script></Script>';
      expect(parser.canParse(content)).toBe(false);
    });
  });

  describe('parse()', () => {
    it('should parse valid FDX with scene headings', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. COFFEE SHOP - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>SARAH enters.</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes).toHaveLength(1);
      expect(screenplay.scenes[0].heading.intExt).toBe('INT');
      expect(screenplay.scenes[0].heading.location).toBe('COFFEE SHOP');
      expect(screenplay.scenes[0].heading.timeOfDay).toBe('DAY');
      expect(screenplay.scenes[0].elements).toHaveLength(1);
    });

    it('should parse dialogue with character and parenthetical', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM - DAY</Text>
    </Paragraph>
    <Paragraph Type="Character">
      <Text>SARAH</Text>
    </Paragraph>
    <Paragraph Type="Parenthetical">
      <Text>(excited)</Text>
    </Paragraph>
    <Paragraph Type="Dialogue">
      <Text>Hello!</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes).toHaveLength(1);
      // FinalDraft parser creates separate elements for Character, Parenthetical, and Dialogue
      const elements = screenplay.scenes[0].elements;
      expect(elements.length).toBeGreaterThan(0);

      // Check that dialogue elements exist
      const dialogueElements = elements.filter(e => e.type === 'dialogue');
      expect(dialogueElements.length).toBeGreaterThan(0);
    });

    it('should parse multiple scenes', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. COFFEE SHOP - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>Action 1</Text>
    </Paragraph>
    <Paragraph Type="Scene Heading">
      <Text>EXT. STREET - NIGHT</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>Action 2</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes).toHaveLength(2);
      expect(screenplay.scenes[0].heading.intExt).toBe('INT');
      expect(screenplay.scenes[0].heading.location).toBe('COFFEE SHOP');
      expect(screenplay.scenes[1].heading.intExt).toBe('EXT');
      expect(screenplay.scenes[1].heading.location).toBe('STREET');
    });

    it('should handle nested Text elements', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text Style="Bold">Bold text</Text>
      <Text> normal text</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes).toHaveLength(1);
      expect(screenplay.scenes[0].elements).toHaveLength(1);
    });

    it('should throw error for invalid FDX structure', () => {
      const content = '<?xml version="1.0"?><InvalidRoot></InvalidRoot>';
      
      expect(() => parser.parse(content)).toThrow('Invalid Final Draft XML');
    });

    it('should throw error for missing Content element', () => {
      const content = '<?xml version="1.0"?><FinalDraft></FinalDraft>';
      
      expect(() => parser.parse(content)).toThrow('Invalid Final Draft XML');
    });
  });
});

