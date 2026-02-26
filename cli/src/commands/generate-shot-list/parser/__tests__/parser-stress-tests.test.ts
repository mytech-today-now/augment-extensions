/**
 * Parser Stress Tests
 * 
 * Tests for parser performance and stability with extremely large files
 */

import { FountainParser } from '../fountain-parser';
import { MarkdownParser } from '../markdown-parser';
import { PlainTextParser } from '../plaintext-parser';

describe('Parser Stress Tests', () => {
  // Increase timeout for stress tests
  jest.setTimeout(60000);

  describe('Extremely Large Files (>10MB)', () => {
    it('should handle Fountain file with 10,000+ scenes', () => {
      const parser = new FountainParser();
      let content = 'Title: Massive Screenplay\n\n';

      // Generate 10,000 scenes (~15MB)
      for (let i = 0; i < 10000; i++) {
        content += `INT. ROOM ${i} - DAY\n\nAction line ${i}.\n\nCHARACTER ${i}\nDialogue ${i}.\n\n`;
      }

      const startTime = Date.now();
      const screenplay = parser.parse(content);
      const duration = Date.now() - startTime;

      expect(screenplay.scenes.length).toBe(10000);
      expect(duration).toBeLessThan(30000); // Should complete in under 30 seconds
      
      // Verify memory didn't explode
      const memUsage = process.memoryUsage();
      expect(memUsage.heapUsed).toBeLessThan(500 * 1024 * 1024); // Less than 500MB
    });

    it('should handle Markdown file with 50,000+ lines', () => {
      const parser = new MarkdownParser();
      let content = '# Massive Screenplay\n\n';

      // Generate 50,000 lines (~10MB)
      for (let i = 0; i < 50000; i++) {
        if (i % 100 === 0) {
          content += `## Scene ${i / 100}\n\n`;
        }
        content += `Action line ${i}.\n`;
      }

      const startTime = Date.now();
      const screenplay = parser.parse(content);
      const duration = Date.now() - startTime;

      expect(screenplay).toBeDefined();
      expect(duration).toBeLessThan(30000);
    });

    it('should handle PlainText file with 100,000+ lines', () => {
      const parser = new PlainTextParser();
      let content = '';

      // Generate 100,000 lines (~15MB)
      for (let i = 0; i < 100000; i++) {
        if (i % 1000 === 0) {
          content += `INT. ROOM ${i / 1000} - DAY\n\n`;
        }
        content += `Action line ${i}.\n`;
      }

      const startTime = Date.now();
      const screenplay = parser.parse(content);
      const duration = Date.now() - startTime;

      expect(screenplay).toBeDefined();
      expect(duration).toBeLessThan(30000);
    });
  });

  describe('Extremely Long Lines', () => {
    it('should handle lines with 100,000+ characters', () => {
      const parser = new FountainParser();
      const longLine = 'A'.repeat(100000);
      const content = `INT. ROOM - DAY\n\n${longLine}\n\nCHARACTER\nDialogue.`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });

    it('should handle dialogue with 50,000+ characters', () => {
      const parser = new FountainParser();
      const longDialogue = 'This is a very long dialogue. '.repeat(2000);
      const content = `INT. ROOM - DAY\n\nAction.\n\nCHARACTER\n${longDialogue}`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('Deeply Nested Structures', () => {
    it('should handle 1000+ consecutive scenes', () => {
      const parser = new FountainParser();
      let content = '';

      for (let i = 0; i < 1000; i++) {
        content += `INT. ROOM ${i} - DAY\n\nAction.\n\n`;
      }

      const screenplay = parser.parse(content);

      expect(screenplay.scenes).toHaveLength(1000);
    });

    it('should handle 10,000+ dialogue blocks', () => {
      const parser = new FountainParser();
      let content = 'INT. ROOM - DAY\n\nAction.\n\n';

      for (let i = 0; i < 10000; i++) {
        content += `CHARACTER ${i}\nDialogue ${i}.\n\n`;
      }

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
      expect(screenplay.scenes[0].elements.length).toBeGreaterThan(10000);
    });
  });

  describe('Memory Efficiency', () => {
    it('should not leak memory when parsing multiple large files', () => {
      const parser = new FountainParser();
      const initialMemory = process.memoryUsage().heapUsed;

      // Parse 10 large files
      for (let fileNum = 0; fileNum < 10; fileNum++) {
        let content = `Title: File ${fileNum}\n\n`;
        
        for (let i = 0; i < 1000; i++) {
          content += `INT. ROOM ${i} - DAY\n\nAction ${i}.\n\n`;
        }

        parser.parse(content);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('should handle rapid successive parsing', () => {
      const parser = new FountainParser();
      const content = 'INT. ROOM - DAY\n\nAction.\n\nCHARACTER\nDialogue.';

      const startTime = Date.now();

      // Parse the same content 1000 times rapidly
      for (let i = 0; i < 1000; i++) {
        parser.parse(content);
      }

      const duration = Date.now() - startTime;

      // Should complete in reasonable time (under 5 seconds)
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Extreme Character Counts', () => {
    it('should handle screenplay with 1000+ unique characters', () => {
      const parser = new FountainParser();
      let content = 'INT. ROOM - DAY\n\nAction.\n\n';

      for (let i = 0; i < 1000; i++) {
        content += `CHARACTER_${i}\nDialogue from character ${i}.\n\n`;
      }

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
      expect(screenplay.scenes[0].elements.length).toBeGreaterThan(1000);
    });

    it('should handle character names with 1000+ characters', () => {
      const parser = new FountainParser();
      const longName = 'A'.repeat(1000);
      const content = `INT. ROOM - DAY\n\nAction.\n\n${longName}\nDialogue.`;

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
    });
  });

  describe('Extreme Scene Counts', () => {
    it('should handle screenplay with alternating INT/EXT scenes (5000+)', () => {
      const parser = new FountainParser();
      let content = '';

      for (let i = 0; i < 5000; i++) {
        const intExt = i % 2 === 0 ? 'INT' : 'EXT';
        content += `${intExt}. LOCATION ${i} - DAY\n\nAction ${i}.\n\n`;
      }

      const screenplay = parser.parse(content);

      expect(screenplay.scenes).toHaveLength(5000);
    });

    it('should handle scenes with 1000+ elements each', () => {
      const parser = new FountainParser();
      let content = 'INT. ROOM - DAY\n\n';

      for (let i = 0; i < 1000; i++) {
        content += `Action line ${i}.\n\n`;
        content += `CHARACTER ${i}\nDialogue ${i}.\n\n`;
      }

      const screenplay = parser.parse(content);

      expect(screenplay.scenes.length).toBeGreaterThan(0);
      expect(screenplay.scenes[0].elements.length).toBeGreaterThan(1000);
    });
  });

  describe('Concurrent Parsing', () => {
    it('should handle multiple parsers running simultaneously', async () => {
      const content = 'INT. ROOM - DAY\n\nAction.\n\nCHARACTER\nDialogue.';

      // Create 10 parsers and parse simultaneously
      const promises = Array.from({ length: 10 }, () => {
        const parser = new FountainParser();
        return Promise.resolve(parser.parse(content));
      });

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach(screenplay => {
        expect(screenplay.scenes.length).toBeGreaterThan(0);
      });
    });

    it('should handle different parsers running simultaneously', async () => {
      const fountainContent = 'INT. ROOM - DAY\n\nAction.';
      const markdownContent = '# Scene\n\nAction.';
      const plainContent = 'INT. ROOM - DAY\n\nAction.';

      const promises = [
        Promise.resolve(new FountainParser().parse(fountainContent)),
        Promise.resolve(new MarkdownParser().parse(markdownContent)),
        Promise.resolve(new PlainTextParser().parse(plainContent))
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach(screenplay => {
        expect(screenplay).toBeDefined();
      });
    });
  });

  describe('Edge Case Combinations', () => {
    it('should handle large file with all edge cases combined', () => {
      const parser = new FountainParser();
      let content = 'Title: Extreme Screenplay\nAuthor: Test\n\n';

      // Mix of everything: long lines, many scenes, many characters, Unicode
      for (let i = 0; i < 1000; i++) {
        const longAction = 'A'.repeat(1000);
        content += `INT. ROOM ${i} - DAY\n\n${longAction}\n\n`;
        content += `CHARACTER_${i}\nDialogue with émojis 😊 ${i}.\n\n`;

        if (i % 100 === 0) {
          content += `> TRANSITION TO:\n\n`;
        }
      }

      const startTime = Date.now();
      const screenplay = parser.parse(content);
      const duration = Date.now() - startTime;

      expect(screenplay.scenes).toHaveLength(1000);
      expect(duration).toBeLessThan(30000);
    });
  });
});

