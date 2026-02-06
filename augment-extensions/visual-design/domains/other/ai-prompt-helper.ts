/**
 * AI Image Generation Prompt Helper Domain Module
 * 
 * Design patterns and guidelines for creating effective prompts
 * for AI image generation tools (Midjourney, DALL-E, Stable Diffusion).
 */

import { DomainStyle, ColorPalette, TypographyRules, LayoutSystem } from '../../types';

// ============================================================================
// AI Prompt Helper Color Palette
// ============================================================================

const AI_PROMPT_COLORS: ColorPalette = {
  primary: {
    name: 'Creative Purple',
    hex: '#8B5CF6',
    rgb: { r: 139, g: 92, b: 246 },
    hsl: { h: 258, s: 90, l: 66 },
    variants: [
      { name: 'Purple Light', hex: '#C4B5FD', usage: 'Highlights' },
      { name: 'Purple Dark', hex: '#7C3AED', usage: 'Emphasis' }
    ]
  },
  neutral: [
    { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    { name: 'Gray 50', hex: '#FAFAF9', rgb: { r: 250, g: 250, b: 249 }, hsl: { h: 60, s: 9, l: 98 } },
    { name: 'Gray 100', hex: '#F5F5F4', rgb: { r: 245, g: 245, b: 244 }, hsl: { h: 60, s: 9, l: 96 } },
    { name: 'Gray 800', hex: '#27272A', rgb: { r: 39, g: 39, b: 42 }, hsl: { h: 240, s: 4, l: 16 } },
    { name: 'Black', hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } }
  ],
  semantic: {
    success: { hex: '#22C55E', usage: 'Successful generation' },
    warning: { hex: '#EAB308', usage: 'Prompt warnings' },
    error: { hex: '#EF4444', usage: 'Generation errors' },
    info: { hex: '#3B82F6', usage: 'Tips and suggestions' }
  },
  accessibility: {
    minimumContrast: 4.5,
    targetContrast: 7,
    colorBlindSafe: true,
    guidelines: [
      'Ensure readable text on all backgrounds',
      'Use color coding for prompt categories',
      'Provide visual feedback for generation status',
      'Support dark mode for extended use'
    ]
  }
};

// ============================================================================
// AI Prompt Helper Typography
// ============================================================================

const AI_PROMPT_TYPOGRAPHY: TypographyRules = {
  fontFamilies: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    secondary: 'system-ui, sans-serif',
    monospace: '"Fira Code", "JetBrains Mono", monospace'
  },
  hierarchy: {
    h1: { fontSize: '36px', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontSize: '28px', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' },
    h3: { fontSize: '22px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h4: { fontSize: '18px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h5: { fontSize: '16px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    h6: { fontSize: '14px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    body: { fontSize: '16px', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0' },
    small: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
    caption: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0' }
  },
  scale: {
    base: 16,
    ratio: 1.25,
    sizes: [12, 14, 16, 18, 22, 28, 36]
  },
  guidelines: [
    'Use monospace for prompt text',
    'Use sans-serif for UI elements',
    'Ensure readability for long prompts',
    'Highlight keywords and modifiers',
    'Use consistent formatting for examples'
  ]
};

// ============================================================================
// AI Prompt Helper Layout System
// ============================================================================

const AI_PROMPT_LAYOUT: LayoutSystem = {
  grid: {
    columns: 12,
    gutter: '24px',
    margin: '24px',
    breakpoints: {
      mobile: '0-639px',
      tablet: '640-1023px',
      desktop: '1024px+'
    }
  },
  spacing: {
    unit: 8,
    scale: [0, 8, 16, 24, 32, 40, 48, 64, 80],
    guidelines: [
      'Use 8px base unit for spacing',
      'Group related prompt elements',
      'Provide clear visual hierarchy',
      'Use cards for prompt templates'
    ]
  },
  containerWidths: {
    mobile: '100%',
    tablet: '768px',
    desktop: '1024px',
    max: '1280px'
  },
  guidelines: [
    'Use two-column layout (prompt builder + preview)',
    'Provide collapsible sections for categories',
    'Use tags for prompt modifiers',
    'Implement search and filter for templates',
    'Show real-time character count',
    'Provide copy-to-clipboard functionality'
  ]
};

// ============================================================================
// AI Prompt Helper Domain Export
// ============================================================================

export const AI_PROMPT_HELPER_DOMAIN: DomainStyle = {
  domain: 'ai-prompt-helper',
  characteristics: [
    'Prompt template library',
    'Keyword and modifier suggestions',
    'Style and artist references',
    'Technical parameter guidance',
    'Aspect ratio and resolution presets',
    'Negative prompt suggestions',
    'Prompt weight and emphasis syntax',
    'Multi-platform compatibility (Midjourney, DALL-E, SD)',
    'Prompt history and favorites',
    'Community prompt sharing'
  ],
  colorScheme: AI_PROMPT_COLORS,
  typography: AI_PROMPT_TYPOGRAPHY,
  layout: AI_PROMPT_LAYOUT,
  examples: [
    'Portrait photography prompt: "professional headshot, studio lighting, 85mm lens, shallow depth of field"',
    'Landscape prompt: "mountain vista at golden hour, dramatic clouds, wide angle, photorealistic"',
    'Illustration prompt: "anime style character, vibrant colors, detailed linework, by Studio Ghibli"',
    'Abstract art prompt: "geometric patterns, bold colors, minimalist composition, vector art"',
    'Product photography: "product shot on white background, soft lighting, high detail, commercial photography"',
    'Architectural visualization: "modern building exterior, glass facade, sunset lighting, architectural photography"'
  ]
};

