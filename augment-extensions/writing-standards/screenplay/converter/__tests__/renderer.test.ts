import { renderToHTML, estimatePageCount } from '../renderer';
import { FountainElement } from '../parser';

describe('Renderer', () => {
  describe('estimatePageCount', () => {
    it('should estimate pages based on 55 lines per page', () => {
      const elements: FountainElement[] = [
        { type: 'scene-heading', text: 'INT. OFFICE - DAY', lineNumber: 1 },
        { type: 'action', text: 'John enters.', lineNumber: 2 },
        { type: 'character', text: 'JOHN', lineNumber: 3 },
        { type: 'dialogue', text: 'Hello.', lineNumber: 4 }
      ];
      
      const result = estimatePageCount(elements);
      expect(result.pages).toBeGreaterThan(0);
      expect(result.lines).toBeGreaterThan(0);
    });
    
    it('should account for spacing between elements', () => {
      const elements: FountainElement[] = [
        { type: 'scene-heading', text: 'INT. OFFICE - DAY', lineNumber: 1 }
      ];
      
      const result = estimatePageCount(elements);
      // Scene heading (1 line) + spacing (2 lines) = 3 lines total
      expect(result.lines).toBe(3);
    });
    
    it('should handle multi-line action', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'Line 1\nLine 2\nLine 3', lineNumber: 1 }
      ];
      
      const result = estimatePageCount(elements);
      // 3 lines + 1 spacing = 4 lines
      expect(result.lines).toBe(4);
    });
    
    it('should calculate pages correctly', () => {
      // Create 55 lines worth of content
      const elements: FountainElement[] = [];
      for (let i = 0; i < 27; i++) {
        elements.push({ type: 'action', text: 'Action line', lineNumber: i });
      }
      
      const result = estimatePageCount(elements);
      // 27 actions * 2 lines each (1 content + 1 spacing) = 54 lines
      expect(result.lines).toBe(54);
      expect(result.pages).toBe(1);
    });
  });
  
  describe('renderToHTML', () => {
    it('should render scene heading', () => {
      const elements: FountainElement[] = [
        { type: 'scene-heading', text: 'INT. OFFICE - DAY', lineNumber: 1 }
      ];
      
      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).toContain('<div class="scene-heading">INT. OFFICE - DAY</div>');
    });
    
    it('should render action', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'John enters.', lineNumber: 1 }
      ];
      
      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).toContain('<div class="action">John enters.</div>');
    });
    
    it('should render character and dialogue', () => {
      const elements: FountainElement[] = [
        { type: 'character', text: 'JOHN', lineNumber: 1 },
        { type: 'dialogue', text: 'Hello.', lineNumber: 2 }
      ];
      
      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).toContain('<div class="character">JOHN</div>');
      expect(result.html).toContain('<div class="dialogue">Hello.</div>');
    });
    
    it('should render parenthetical', () => {
      const elements: FountainElement[] = [
        { type: 'parenthetical', text: '(whispering)', lineNumber: 1 }
      ];
      
      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).toContain('<div class="parenthetical">(whispering)</div>');
    });
    
    it('should render transition', () => {
      const elements: FountainElement[] = [
        { type: 'transition', text: 'CUT TO:', lineNumber: 1 }
      ];
      
      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).toContain('<div class="transition">CUT TO:</div>');
    });
    
    it('should render centered text', () => {
      const elements: FountainElement[] = [
        { type: 'centered', text: 'THE END', lineNumber: 1 }
      ];
      
      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).toContain('<div class="centered">THE END</div>');
    });
    
    it('should render act heading', () => {
      const elements: FountainElement[] = [
        { type: 'act-heading', text: 'ACT I', lineNumber: 1 }
      ];
      
      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).toContain('<div class="act-heading">ACT I</div>');
    });
    
    it('should emphasize sound effects in action', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'The door SLAMS shut.', lineNumber: 1 }
      ];
      
      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).toContain('<span class="sound-effect">SLAMS</span>');
    });
    
    it('should include CSS when requested', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'Test', lineNumber: 1 }
      ];
      
      const result = renderToHTML(elements, { includeCSS: true });
      expect(result.html).toContain('<!DOCTYPE html>');
      expect(result.html).toContain('<style>');
      expect(result.html).toContain('font-family');
      expect(result.html).toContain('</html>');
    });
    
    it('should not include CSS when not requested', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'Test', lineNumber: 1 }
      ];
      
      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).not.toContain('<!DOCTYPE html>');
      expect(result.html).not.toContain('<style>');
    });

    it('should set custom title', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'Test', lineNumber: 1 }
      ];

      const result = renderToHTML(elements, { includeCSS: true, title: 'My Screenplay' });
      expect(result.html).toContain('<title>My Screenplay</title>');
    });

    it('should return estimated pages', () => {
      const elements: FountainElement[] = [
        { type: 'scene-heading', text: 'INT. OFFICE - DAY', lineNumber: 1 },
        { type: 'action', text: 'John enters.', lineNumber: 2 }
      ];

      const result = renderToHTML(elements);
      expect(result.estimatedPages).toBeGreaterThan(0);
      expect(result.lineCount).toBeGreaterThan(0);
    });

    it('should handle empty elements array', () => {
      const elements: FountainElement[] = [];

      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).toBe('');
      expect(result.estimatedPages).toBe(0);
      expect(result.lineCount).toBe(0);
    });

    it('should handle multiple sound effects in one action', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'The door SLAMS and glass SHATTERS.', lineNumber: 1 }
      ];

      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).toContain('<span class="sound-effect">SLAMS</span>');
      expect(result.html).toContain('<span class="sound-effect">SHATTERS</span>');
    });

    it('should not emphasize single capital letters', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'I see you.', lineNumber: 1 }
      ];

      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).not.toContain('<span class="sound-effect">I</span>');
    });

    it('should render complete screenplay correctly', () => {
      const elements: FountainElement[] = [
        { type: 'scene-heading', text: 'INT. OFFICE - DAY', lineNumber: 1 },
        { type: 'action', text: 'John enters the room.', lineNumber: 2 },
        { type: 'character', text: 'JOHN', lineNumber: 3 },
        { type: 'dialogue', text: 'Hello, everyone.', lineNumber: 4 },
        { type: 'action', text: 'The door SLAMS behind him.', lineNumber: 5 },
        { type: 'transition', text: 'CUT TO:', lineNumber: 6 }
      ];

      const result = renderToHTML(elements, { includeCSS: false });
      expect(result.html).toContain('scene-heading');
      expect(result.html).toContain('action');
      expect(result.html).toContain('character');
      expect(result.html).toContain('dialogue');
      expect(result.html).toContain('transition');
      expect(result.html).toContain('<span class="sound-effect">SLAMS</span>');
    });
  });
});

