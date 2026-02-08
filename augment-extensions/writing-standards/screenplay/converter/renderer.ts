import { FountainElement, ElementType } from './parser';

export interface RendererOptions {
  includeCSS?: boolean;
  title?: string;
}

export interface RenderResult {
  html: string;
  estimatedPages: number;
  lineCount: number;
}

/**
 * Industry-standard CSS template for screenplay formatting
 * Reduced line-height and margins for accurate page length
 */
function getCSSTemplate(): string {
  return `
<style>
  body {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12pt;
    line-height: 1; /* Reduced from 1.5 */
    max-width: 6in;
    margin: 0 auto;
    padding: 1in;
    background: white;
    color: black;
  }
  
  .scene-heading {
    font-weight: bold;
    margin-top: 1em; /* Reduced from 2em */
    margin-bottom: 0.5em; /* Reduced from 1em */
    text-transform: uppercase;
  }
  
  .action {
    margin-top: 0.5em; /* Reduced from 1em */
    margin-bottom: 0.5em; /* Reduced from 1em */
    white-space: pre-wrap;
  }
  
  .character {
    margin-top: 0.5em; /* Reduced from 1em */
    margin-bottom: 0;
    margin-left: 2in;
    text-transform: uppercase;
  }
  
  .dialogue {
    margin-top: 0;
    margin-bottom: 0.5em; /* Reduced from 1em */
    margin-left: 1.5in;
    margin-right: 1.5in;
  }
  
  .parenthetical {
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 1.8in;
    margin-right: 2in;
  }
  
  .transition {
    margin-top: 0.5em; /* Reduced from 1em */
    margin-bottom: 0.5em; /* Reduced from 1em */
    margin-left: 4in;
    text-transform: uppercase;
  }
  
  .centered {
    text-align: center;
    margin-top: 0.5em; /* Reduced from 1em */
    margin-bottom: 0.5em; /* Reduced from 1em */
    text-transform: uppercase;
  }
  
  .act-heading {
    font-weight: bold;
    text-align: center;
    margin-top: 1em; /* Reduced from 2em */
    margin-bottom: 0.5em; /* Reduced from 1em */
    text-transform: uppercase;
  }
  
  .sound-effect {
    font-weight: bold;
  }
</style>
`;
}

/**
 * Estimate page count based on line count
 * Industry standard: 55 lines per page
 */
export function estimatePageCount(elements: FountainElement[]): { pages: number; lines: number } {
  let lineCount = 0;
  
  for (const element of elements) {
    const lines = element.text.split('\n').length;
    
    // Add spacing between elements
    switch (element.type) {
      case 'scene-heading':
        lineCount += lines + 2; // Scene heading + spacing
        break;
      case 'action':
        lineCount += lines + 1; // Action + spacing
        break;
      case 'character':
        lineCount += lines + 1; // Character + spacing
        break;
      case 'dialogue':
        lineCount += lines; // Dialogue (no extra spacing)
        break;
      case 'parenthetical':
        lineCount += lines; // Parenthetical (no extra spacing)
        break;
      case 'transition':
        lineCount += lines + 1; // Transition + spacing
        break;
      case 'centered':
        lineCount += lines + 1; // Centered + spacing
        break;
      case 'act-heading':
        lineCount += lines + 2; // Act heading + spacing
        break;
      default:
        lineCount += lines;
    }
  }
  
  const pages = Math.ceil(lineCount / 55);
  return { pages, lines: lineCount };
}

/**
 * Render action with emphasis on sound effects
 * Sound effects in ALL CAPS are bolded
 */
function renderAction(text: string): string {
  // Check for markdown syntax (safety check)
  if (text.includes('**') || text.includes('*') || text.includes('##')) {
    console.warn('Markdown syntax detected in action text - should have been preprocessed');
  }
  
  // Emphasize sound effects (words in ALL CAPS)
  const emphasized = text.replace(/\b([A-Z]{2,})\b/g, '<span class="sound-effect">$1</span>');
  
  return `<div class="action">${emphasized}</div>`;
}

/**
 * Render fountain elements to HTML
 */
export function renderToHTML(elements: FountainElement[], options: RendererOptions = {}): RenderResult {
  const { includeCSS = true, title = 'Screenplay' } = options;
  
  let html = '';
  
  if (includeCSS) {
    html += `<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<title>${title}</title>\n`;
    html += getCSSTemplate();
    html += `</head>\n<body>\n`;
  }

  // Render each element
  for (const element of elements) {
    switch (element.type) {
      case 'scene-heading':
        html += `<div class="scene-heading">${element.text}</div>\n`;
        break;
      case 'action':
        html += renderAction(element.text);
        html += '\n';
        break;
      case 'character':
        html += `<div class="character">${element.text}</div>\n`;
        break;
      case 'dialogue':
        html += `<div class="dialogue">${element.text}</div>\n`;
        break;
      case 'parenthetical':
        html += `<div class="parenthetical">${element.text}</div>\n`;
        break;
      case 'transition':
        html += `<div class="transition">${element.text}</div>\n`;
        break;
      case 'centered':
        html += `<div class="centered">${element.text}</div>\n`;
        break;
      case 'act-heading':
        html += `<div class="act-heading">${element.text}</div>\n`;
        break;
      default:
        html += `<div>${element.text}</div>\n`;
    }
  }

  if (includeCSS) {
    html += `</body>\n</html>`;
  }

  const { pages, lines } = estimatePageCount(elements);

  return {
    html,
    estimatedPages: pages,
    lineCount: lines
  };
}

