/**
 * Markdown Parser Edge Case Tests
 * 
 * Tests for edge cases in Markdown screenplay parsing
 */

import { MarkdownParser } from '../markdown-parser';

describe('MarkdownParser - Edge Cases', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  describe('Empty and Minimal Content', () => {
    it('should handle Markdown with only title (no scenes)', () => {
      const content = '# My Screenplay\n\nSome description.';
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.title).toBe('My Screenplay');
      expect(screenplay.scenes).toHaveLength(0);
    });

    it('should handle whitespace-only content', () => {
      const content = '   \n\n   \t\t   \n\n';
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes).toHaveLength(0);
    });

    it('should handle content with only comments', () => {
      const content = '<!-- This is a comment -->\n<!-- Another comment -->';
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes).toHaveLength(0);
    });
  });

  describe('Heading Variations', () => {
    it('should handle all heading levels (H1-H6)', () => {
      const content = `# H1 Scene
## H2 Scene
### H3 Scene
#### H4 Scene
##### H5 Scene
###### H6 Scene

Action.`;
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle headings without space after hash', () => {
      const content = '#No Space\n\nAction.';
      
      const screenplay = parser.parse(content);
      
      // Should not parse as heading (requires space)
      expect(screenplay.scenes).toHaveLength(0);
    });

    it('should handle headings with trailing hashes', () => {
      const content = '# Scene Heading #\n\nAction.';
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle ATX-style headings with many hashes', () => {
      const content = '####### Too Many Hashes\n\nAction.';
      
      const screenplay = parser.parse(content);
      
      // Should not parse as heading (max 6 hashes)
      expect(screenplay.scenes).toHaveLength(0);
    });
  });

  describe('Special Characters and Unicode', () => {
    it('should handle Unicode characters in headings', () => {
      const content = '# Café Scene 🎬\n\nAction with émojis 😊.';
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle RTL text in Markdown', () => {
      const content = '# مشهد (Arabic Scene)\n\nAction in English.';
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle mixed scripts (CJK)', () => {
      const content = '# 场景 (Chinese Scene)\n\n日本語のアクション\n\n한국어 대화';
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle Markdown special characters escaped', () => {
      const content = '# Scene with \\* asterisks \\_ underscores\n\nAction with \\[brackets\\].';
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('Markdown Formatting Edge Cases', () => {
    it('should handle inline code in headings', () => {
      const content = '# Scene with `code`\n\nAction.';
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle bold/italic in headings', () => {
      const content = '# **Bold** and *Italic* Scene\n\nAction.';
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle links in content', () => {
      const content = '# Scene\n\nAction with [link](http://example.com).';
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle images in content', () => {
      const content = '# Scene\n\n![Image](image.jpg)\n\nAction.';
      
      const screenplay = parser.parse(content);
      
      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle blockquotes', () => {
      const content = '# Scene\n\n> Quoted text\n\nAction.';

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle code blocks', () => {
      const content = '# Scene\n\n```\nCode block\n```\n\nAction.';

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle horizontal rules', () => {
      const content = '# Scene 1\n\nAction.\n\n---\n\n# Scene 2\n\nMore action.';

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle lists in content', () => {
      const content = '# Scene\n\n- Item 1\n- Item 2\n- Item 3\n\nAction.';

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle tables', () => {
      const content = '# Scene\n\n| Col1 | Col2 |\n|------|------|\n| A    | B    |\n\nAction.';

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('Malformed Markdown', () => {
    it('should handle unclosed formatting', () => {
      const content = '# Scene\n\n**Bold without closing\n\nAction.';

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle mixed line endings', () => {
      const content = '# Scene\r\n\r\nAction.\r\n\nMore action.\n\r\n';

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle very long lines (>1000 chars)', () => {
      const longLine = 'A'.repeat(2000);
      const content = `# Scene\n\n${longLine}`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle many consecutive headings', () => {
      let content = '';
      for (let i = 0; i < 100; i++) {
        content += `# Scene ${i}\n\n`;
      }

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle large Markdown file (1000+ lines)', () => {
      let content = '# Screenplay\n\n';
      for (let i = 0; i < 1000; i++) {
        content += `Action line ${i}.\n`;
      }

      const screenplay = parser.parse(content);

      expect(screenplay).toBeDefined();
    });

    it('should handle deeply nested lists', () => {
      const content = '# Scene\n\n- Level 1\n  - Level 2\n    - Level 3\n      - Level 4\n        - Level 5\n\nAction.';

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });
});

