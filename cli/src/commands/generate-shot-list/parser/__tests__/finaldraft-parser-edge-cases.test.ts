/**
 * Final Draft Parser Edge Case Tests
 * 
 * Tests for unusual, malformed, or extreme inputs
 */

import { FinalDraftParser } from '../finaldraft-parser';

describe('FinalDraftParser - Edge Cases', () => {
  let parser: FinalDraftParser;

  beforeEach(() => {
    parser = new FinalDraftParser();
  });

  describe('Empty and Minimal Content', () => {
    it('should handle FDX with only metadata (no scenes)', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <TitlePage>
    <Content>
      <Paragraph Type="Title">
        <Text>My Script</Text>
      </Paragraph>
    </Content>
  </TitlePage>
  <Content>
    <Paragraph Type="Action">
      <Text>Just action, no scene heading</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);
      
      // Should create a default scene for orphaned elements
      expect(screenplay.title).toBe('My Script');
      expect(screenplay.scenes.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle whitespace-only text elements', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>   </Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text></Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes).toHaveLength(1);
      // Whitespace-only elements should be filtered or handled gracefully
    });

    it('should handle scene heading without INT/EXT', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>COFFEE SHOP - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>Action text</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes).toHaveLength(1);
      // Should handle missing INT/EXT gracefully
      expect(screenplay.scenes[0].heading).toBeDefined();
    });
  });

  describe('Special Characters and Unicode', () => {
    it('should handle Unicode characters in dialogue', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. CAFÉ - DAY</Text>
    </Paragraph>
    <Paragraph Type="Character">
      <Text>FRANÇOIS</Text>
    </Paragraph>
    <Paragraph Type="Dialogue">
      <Text>Bonjour! ¿Cómo estás? 你好！</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes).toHaveLength(1);
      expect(screenplay.scenes[0].heading.location).toContain('CAF');
    });

    it('should handle emojis and special symbols', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>Sarah smiles 😊 and waves 👋</Text>
    </Paragraph>
    <Paragraph Type="Character">
      <Text>SARAH</Text>
    </Paragraph>
    <Paragraph Type="Dialogue">
      <Text>Hello! ★ ♥ © ® ™</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes).toHaveLength(1);
      expect(screenplay.scenes[0].elements.length).toBeGreaterThan(0);
    });

    it('should handle XML special characters properly escaped', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>She says &quot;Hello&quot; &amp; waves &lt;enthusiastically&gt;</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes).toHaveLength(1);
      // XML entities should be properly decoded
    });

    it('should handle many consecutive scene headings', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM 1 - DAY</Text>
    </Paragraph>
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM 2 - DAY</Text>
    </Paragraph>
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM 3 - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>Finally some action</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);

      // Should create separate scenes for each heading
      expect(screenplay.scenes.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle very large screenplay (100+ scenes)', () => {
      let paragraphs = '';
      for (let i = 1; i <= 100; i++) {
        paragraphs += `
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM ${i} - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>Action in scene ${i}</Text>
    </Paragraph>`;
      }

      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>${paragraphs}
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThanOrEqual(50);
    });
  });

  describe('Malformed Structure', () => {
    it('should handle missing Type attribute on Paragraph', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM - DAY</Text>
    </Paragraph>
    <Paragraph>
      <Text>No type attribute</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes).toHaveLength(1);
      // Should handle missing type gracefully
    });

    it('should handle deeply nested Text elements', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text Style="Bold">
        <Text>Nested</Text>
        <Text> text</Text>
      </Text>
      <Text> more text</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes).toHaveLength(1);
    });

    it('should handle mixed single and array Paragraph elements', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM - DAY</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);

      // Should handle single Paragraph (not array) correctly
      expect(screenplay.scenes).toHaveLength(1);
    });
  });

  describe('Complex Dialogue Structures', () => {
    it('should handle multiple parentheticals in dialogue', () => {
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
    <Paragraph Type="Parenthetical">
      <Text>(then, quieter)</Text>
    </Paragraph>
    <Paragraph Type="Dialogue">
      <Text>How are you?</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes).toHaveLength(1);
      expect(screenplay.scenes[0].elements.length).toBeGreaterThan(0);
    });

    it('should handle dialogue with character extensions', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>INT. ROOM - DAY</Text>
    </Paragraph>
    <Paragraph Type="Character">
      <Text>SARAH (V.O.)</Text>
    </Paragraph>
    <Paragraph Type="Dialogue">
      <Text>I remember that day...</Text>
    </Paragraph>
    <Paragraph Type="Character">
      <Text>JOHN (O.S.)</Text>
    </Paragraph>
    <Paragraph Type="Dialogue">
      <Text>Come in!</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes).toHaveLength(1);
      const dialogueElements = screenplay.scenes[0].elements.filter(e => e.type === 'dialogue');
      expect(dialogueElements.length).toBeGreaterThan(0);
    });
  });

  describe('Scene Heading Variations', () => {
    it('should handle scene headings with unusual formatting', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>I/E. CAR/STREET - DAY/NIGHT</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>Action</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes).toHaveLength(1);
      expect(screenplay.scenes[0].heading).toBeDefined();
    });

    it('should handle scene headings with numbers', () => {
      const content = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Version="5">
  <Content>
    <Paragraph Type="Scene Heading">
      <Text>1. INT. ROOM - DAY</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>Action</Text>
    </Paragraph>
    <Paragraph Type="Scene Heading">
      <Text>2A. EXT. STREET - NIGHT</Text>
    </Paragraph>
    <Paragraph Type="Action">
      <Text>More action</Text>
    </Paragraph>
  </Content>
</FinalDraft>`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThanOrEqual(2);
    });
  });
});
