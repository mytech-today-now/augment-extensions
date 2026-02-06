/**
 * Print Campaigns Domain Module
 * 
 * Design patterns for print media including flyers, posters,
 * banners, and billboards with CMYK color and print specifications.
 */

import { DomainStyle, ColorPalette, TypographyRules, LayoutSystem } from '../../types';

// ============================================================================
// Print Campaigns Color Palette
// ============================================================================

const PRINT_COLORS: ColorPalette = {
  primary: {
    name: 'Print Red',
    hex: '#E63946',
    rgb: { r: 230, g: 57, b: 70 },
    hsl: { h: 356, s: 78, l: 56 },
    variants: [
      { name: 'Red Light', hex: '#FF6B6B', usage: 'Highlights' },
      { name: 'Red Dark', hex: '#C1121F', usage: 'Emphasis' }
    ]
  },
  neutral: [
    { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    { name: 'Light Gray', hex: '#F1FAEE', rgb: { r: 241, g: 250, b: 238 }, hsl: { h: 105, s: 60, l: 96 } },
    { name: 'Mid Gray', hex: '#A8DADC', rgb: { r: 168, g: 218, b: 220 }, hsl: { h: 182, s: 41, l: 76 } },
    { name: 'Dark Gray', hex: '#457B9D', rgb: { r: 69, g: 123, b: 157 }, hsl: { h: 203, s: 39, l: 44 } },
    { name: 'Black', hex: '#1D3557', rgb: { r: 29, g: 53, b: 87 }, hsl: { h: 215, s: 50, l: 23 } }
  ],
  semantic: {
    success: { hex: '#2A9D8F', usage: 'Positive messaging' },
    warning: { hex: '#F4A261', usage: 'Attention grabbing' },
    error: { hex: '#E76F51', usage: 'Urgent calls-to-action' },
    info: { hex: '#264653', usage: 'Information blocks' }
  },
  accessibility: {
    minimumContrast: 4.5,
    targetContrast: 7,
    colorBlindSafe: true,
    guidelines: [
      'Use CMYK color mode for print',
      'Ensure 300 DPI resolution minimum',
      'Add bleed area (0.125" standard)',
      'Test with print proofs before production'
    ]
  }
};

// ============================================================================
// Print Campaigns Typography
// ============================================================================

const PRINT_TYPOGRAPHY: TypographyRules = {
  fontFamilies: {
    primary: '"Helvetica", "Arial", sans-serif',
    secondary: '"Garamond", "Georgia", serif',
    monospace: '"Courier", monospace'
  },
  hierarchy: {
    h1: { fontSize: '72pt', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' },
    h2: { fontSize: '48pt', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.01em' },
    h3: { fontSize: '36pt', fontWeight: 600, lineHeight: 1.3, letterSpacing: '0' },
    h4: { fontSize: '24pt', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h5: { fontSize: '18pt', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h6: { fontSize: '14pt', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    body: { fontSize: '12pt', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
    small: { fontSize: '10pt', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0' },
    caption: { fontSize: '8pt', fontWeight: 400, lineHeight: 1.3, letterSpacing: '0' }
  },
  scale: {
    base: 12,
    ratio: 1.5,
    sizes: [8, 10, 12, 14, 18, 24, 36, 48, 72]
  },
  guidelines: [
    'Use points (pt) instead of pixels',
    'Embed fonts or convert to outlines',
    'Ensure minimum 8pt for body text',
    'Use high-quality font files',
    'Test readability at actual print size'
  ]
};

// ============================================================================
// Print Campaigns Layout System
// ============================================================================

const PRINT_LAYOUT: LayoutSystem = {
  grid: {
    columns: 12,
    gutter: '0.25in',
    margin: '0.5in',
    breakpoints: {
      flyer: '8.5x11in',
      poster: '18x24in',
      banner: '3x6ft',
      billboard: '14x48ft'
    }
  },
  spacing: {
    unit: 0.125,
    scale: [0, 0.125, 0.25, 0.5, 0.75, 1, 1.5, 2],
    guidelines: [
      'Use inches for measurements',
      'Add 0.125" bleed on all sides',
      'Maintain 0.25" safe zone from trim',
      'Use consistent margins'
    ]
  },
  containerWidths: {
    flyer: '8.5in',
    poster: '24in',
    banner: '72in',
    billboard: '576in'
  },
  guidelines: [
    'Design at actual size or proportional scale',
    'Use CMYK color mode',
    'Set resolution to 300 DPI minimum',
    'Add bleed and crop marks',
    'Convert text to outlines before printing',
    'Use high-resolution images only'
  ]
};

// ============================================================================
// Print Campaigns Domain Export
// ============================================================================

export const PRINT_CAMPAIGNS_DOMAIN: DomainStyle = {
  domain: 'print-campaigns',
  characteristics: [
    'CMYK color mode for accurate printing',
    '300 DPI resolution minimum',
    'Bleed area (0.125" standard)',
    'Safe zone for important content',
    'High-contrast for visibility',
    'Large, readable typography',
    'Clear visual hierarchy',
    'Strong call-to-action placement',
    'Brand consistency across materials',
    'Print-ready file formats (PDF, EPS)'
  ],
  colorScheme: PRINT_COLORS,
  typography: PRINT_TYPOGRAPHY,
  layout: PRINT_LAYOUT,
  examples: [
    'Event flyer (8.5x11") with bold headline and event details',
    'Concert poster (18x24") with artist photo and venue info',
    'Trade show banner (3x6ft) with company branding',
    'Highway billboard (14x48ft) with simple message',
    'Business card (3.5x2") with contact information',
    'Brochure (tri-fold) with product features'
  ]
};

