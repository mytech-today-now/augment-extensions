import {
  validatePageLength,
  validateClassification,
  validateHeuristics,
  validateHTMLQuality,
  generateValidationReport
} from '../validator';
import { FountainElement } from '../parser';
import { RenderResult } from '../renderer';

describe('Validator', () => {
  describe('validatePageLength', () => {
    it('should pass when page count is within tolerance', () => {
      const issues = validatePageLength(5, 5, 0.1);
      expect(issues.length).toBe(1);
      expect(issues[0].severity).toBe('info');
    });
    
    it('should warn when page count is too low', () => {
      const issues = validatePageLength(3, 5, 0.1);
      expect(issues.length).toBe(1);
      expect(issues[0].severity).toBe('warning');
      expect(issues[0].message).toContain('too low');
    });
    
    it('should warn when page count is too high', () => {
      const issues = validatePageLength(7, 5, 0.1);
      expect(issues.length).toBe(1);
      expect(issues[0].severity).toBe('warning');
      expect(issues[0].message).toContain('too high');
    });
    
    it('should use custom tolerance', () => {
      const issues = validatePageLength(6, 5, 0.2);
      expect(issues[0].severity).toBe('info'); // 6 is within 20% of 5
    });
  });
  
  describe('validateClassification', () => {
    it('should pass valid dialogue after character', () => {
      const elements: FountainElement[] = [
        { type: 'character', text: 'JOHN', lineNumber: 1 },
        { type: 'dialogue', text: 'Hello.', lineNumber: 2 }
      ];
      
      const issues = validateClassification(elements);
      const errors = issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
    
    it('should error on dialogue without character', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'John enters.', lineNumber: 1 },
        { type: 'dialogue', text: 'Hello.', lineNumber: 2 }
      ];
      
      const issues = validateClassification(elements);
      const errors = issues.filter(i => i.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('Dialogue without character');
    });
    
    it('should warn on character without dialogue', () => {
      const elements: FountainElement[] = [
        { type: 'character', text: 'JOHN', lineNumber: 1 },
        { type: 'action', text: 'He leaves.', lineNumber: 2 }
      ];
      
      const issues = validateClassification(elements);
      const warnings = issues.filter(i => i.severity === 'warning');
      expect(warnings.length).toBeGreaterThan(0);
      expect(warnings[0].message).toContain('not followed by dialogue');
    });
    
    it('should error on bullet list misclassified as dialogue', () => {
      const elements: FountainElement[] = [
        { type: 'character', text: 'CHARACTERS', lineNumber: 1 },
        { type: 'dialogue', text: '- John Smith', lineNumber: 2 }
      ];
      
      const issues = validateClassification(elements);
      const errors = issues.filter(i => i.severity === 'error');
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].message).toContain('Bullet list misclassified');
    });
    
    it('should allow parenthetical between character and dialogue', () => {
      const elements: FountainElement[] = [
        { type: 'character', text: 'JOHN', lineNumber: 1 },
        { type: 'parenthetical', text: '(whispering)', lineNumber: 2 },
        { type: 'dialogue', text: 'Hello.', lineNumber: 3 }
      ];
      
      const issues = validateClassification(elements);
      const errors = issues.filter(i => i.severity === 'error');
      expect(errors.length).toBe(0);
    });
  });
  
  describe('validateHeuristics', () => {
    it('should warn on very low action ratio', () => {
      const elements: FountainElement[] = [
        { type: 'dialogue', text: 'Line 1', lineNumber: 1 },
        { type: 'dialogue', text: 'Line 2', lineNumber: 2 },
        { type: 'dialogue', text: 'Line 3', lineNumber: 3 },
        { type: 'dialogue', text: 'Line 4', lineNumber: 4 },
        { type: 'dialogue', text: 'Line 5', lineNumber: 5 },
        { type: 'dialogue', text: 'Line 6', lineNumber: 6 },
        { type: 'dialogue', text: 'Line 7', lineNumber: 7 },
        { type: 'dialogue', text: 'Line 8', lineNumber: 8 },
        { type: 'dialogue', text: 'Line 9', lineNumber: 9 },
        { type: 'action', text: 'Action', lineNumber: 10 }
      ];
      
      const issues = validateHeuristics(elements);
      const warnings = issues.filter(i => i.message.includes('low action ratio'));
      expect(warnings.length).toBeGreaterThan(0);
    });
    
    it('should warn on very high dialogue ratio', () => {
      const elements: FountainElement[] = [
        { type: 'dialogue', text: 'Line 1', lineNumber: 1 },
        { type: 'dialogue', text: 'Line 2', lineNumber: 2 },
        { type: 'dialogue', text: 'Line 3', lineNumber: 3 },
        { type: 'dialogue', text: 'Line 4', lineNumber: 4 },
        { type: 'dialogue', text: 'Line 5', lineNumber: 5 },
        { type: 'dialogue', text: 'Line 6', lineNumber: 6 },
        { type: 'dialogue', text: 'Line 7', lineNumber: 7 },
        { type: 'dialogue', text: 'Line 8', lineNumber: 8 },
        { type: 'dialogue', text: 'Line 9', lineNumber: 9 },
        { type: 'action', text: 'Action', lineNumber: 10 }
      ];
      
      const issues = validateHeuristics(elements);
      const warnings = issues.filter(i => i.message.includes('high dialogue ratio'));
      expect(warnings.length).toBeGreaterThan(0);
    });
    
    it('should warn on missing scene headings', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'Action', lineNumber: 1 },
        { type: 'dialogue', text: 'Dialogue', lineNumber: 2 }
      ];
      
      const issues = validateHeuristics(elements);
      const warnings = issues.filter(i => i.message.includes('No scene headings'));
      expect(warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateHTMLQuality', () => {
    it('should error on markdown bold syntax', () => {
      const html = '<div>**Bold text**</div>';
      const issues = validateHTMLQuality(html);
      const errors = issues.filter(i => i.message.includes('bold syntax'));
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should error on markdown italic syntax', () => {
      const html = '<div>*Italic text*</div>';
      const issues = validateHTMLQuality(html);
      const errors = issues.filter(i => i.message.includes('italic syntax'));
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should error on markdown heading syntax', () => {
      const html = '<div>## Heading</div>';
      const issues = validateHTMLQuality(html);
      const errors = issues.filter(i => i.message.includes('heading syntax'));
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should error on unclosed HTML document', () => {
      const html = '<!DOCTYPE html><html><body>Content';
      const issues = validateHTMLQuality(html);
      const errors = issues.filter(i => i.message.includes('not properly closed'));
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should pass on clean HTML', () => {
      const html = '<div class="action">Clean text</div>';
      const issues = validateHTMLQuality(html);
      expect(issues.length).toBe(0);
    });

    it('should pass on complete HTML document', () => {
      const html = '<!DOCTYPE html><html><head></head><body>Content</body></html>';
      const issues = validateHTMLQuality(html);
      expect(issues.length).toBe(0);
    });
  });

  describe('generateValidationReport', () => {
    it('should generate comprehensive report', () => {
      const elements: FountainElement[] = [
        { type: 'scene-heading', text: 'INT. OFFICE - DAY', lineNumber: 1 },
        { type: 'action', text: 'John enters.', lineNumber: 2 },
        { type: 'character', text: 'JOHN', lineNumber: 3 },
        { type: 'dialogue', text: 'Hello.', lineNumber: 4 }
      ];

      const renderResult: RenderResult = {
        html: '<div class="scene-heading">INT. OFFICE - DAY</div>',
        estimatedPages: 1,
        lineCount: 10
      };

      const report = generateValidationReport(elements, renderResult, 1);
      expect(report).toHaveProperty('valid');
      expect(report).toHaveProperty('issues');
      expect(report).toHaveProperty('summary');
      expect(report.summary).toHaveProperty('totalIssues');
      expect(report.summary).toHaveProperty('errors');
      expect(report.summary).toHaveProperty('warnings');
      expect(report.summary).toHaveProperty('infos');
    });

    it('should mark report as invalid when errors exist', () => {
      const elements: FountainElement[] = [
        { type: 'dialogue', text: 'Hello.', lineNumber: 1 } // Dialogue without character
      ];

      const renderResult: RenderResult = {
        html: '<div class="dialogue">Hello.</div>',
        estimatedPages: 1,
        lineCount: 2
      };

      const report = generateValidationReport(elements, renderResult);
      expect(report.valid).toBe(false);
      expect(report.summary.errors).toBeGreaterThan(0);
    });

    it('should mark report as valid when only warnings exist', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'Action', lineNumber: 1 }
      ];

      const renderResult: RenderResult = {
        html: '<div class="action">Action</div>',
        estimatedPages: 1,
        lineCount: 2
      };

      const report = generateValidationReport(elements, renderResult);
      expect(report.valid).toBe(true);
    });

    it('should include page length validation when expected pages provided', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'Action', lineNumber: 1 }
      ];

      const renderResult: RenderResult = {
        html: '<div class="action">Action</div>',
        estimatedPages: 5,
        lineCount: 275
      };

      const report = generateValidationReport(elements, renderResult, 3);
      const pageLengthIssues = report.issues.filter(i => i.category === 'page-length');
      expect(pageLengthIssues.length).toBeGreaterThan(0);
    });

    it('should not include page length validation when expected pages not provided', () => {
      const elements: FountainElement[] = [
        { type: 'action', text: 'Action', lineNumber: 1 }
      ];

      const renderResult: RenderResult = {
        html: '<div class="action">Action</div>',
        estimatedPages: 5,
        lineCount: 275
      };

      const report = generateValidationReport(elements, renderResult);
      const pageLengthIssues = report.issues.filter(i => i.category === 'page-length');
      expect(pageLengthIssues.length).toBe(0);
    });
  });
});

