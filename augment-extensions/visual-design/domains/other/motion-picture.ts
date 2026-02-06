/**
 * Motion Picture Design Domain Module
 * 
 * Design patterns for cinematography, TV production, and web series
 * including color grading, composition, and visual storytelling.
 */

import { DomainStyle, ColorPalette, TypographyRules, LayoutSystem } from '../../types';

// ============================================================================
// Motion Picture Color Palette
// ============================================================================

const MOTION_PICTURE_COLORS: ColorPalette = {
  primary: {
    name: 'Cinematic Gold',
    hex: '#D4AF37',
    rgb: { r: 212, g: 175, b: 55 },
    hsl: { h: 46, s: 65, l: 52 },
    variants: [
      { name: 'Gold Light', hex: '#FFD700', usage: 'Highlights, awards' },
      { name: 'Gold Dark', hex: '#B8860B', usage: 'Shadows, depth' }
    ]
  },
  neutral: [
    { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    { name: 'Light Gray', hex: '#E0E0E0', rgb: { r: 224, g: 224, b: 224 }, hsl: { h: 0, s: 0, l: 88 } },
    { name: 'Mid Gray', hex: '#808080', rgb: { r: 128, g: 128, b: 128 }, hsl: { h: 0, s: 0, l: 50 } },
    { name: 'Dark Gray', hex: '#404040', rgb: { r: 64, g: 64, b: 64 }, hsl: { h: 0, s: 0, l: 25 } },
    { name: 'Black', hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } }
  ],
  semantic: {
    success: { hex: '#4CAF50', usage: 'Approved takes' },
    warning: { hex: '#FF9800', usage: 'Review needed' },
    error: { hex: '#F44336', usage: 'Rejected takes' },
    info: { hex: '#2196F3', usage: 'Production notes' }
  },
  accessibility: {
    minimumContrast: 4.5,
    targetContrast: 7,
    colorBlindSafe: true,
    guidelines: [
      'Use color grading for mood and atmosphere',
      'Maintain skin tone accuracy',
      'Ensure proper white balance',
      'Test on calibrated monitors'
    ]
  }
};

// ============================================================================
// Motion Picture Typography
// ============================================================================

const MOTION_PICTURE_TYPOGRAPHY: TypographyRules = {
  fontFamilies: {
    primary: '"Helvetica Neue", Arial, sans-serif',
    secondary: '"Times New Roman", Georgia, serif',
    monospace: '"Courier New", monospace'
  },
  hierarchy: {
    h1: { fontSize: '48px', fontWeight: 700, lineHeight: 1.2, letterSpacing: '0' },
    h2: { fontSize: '36px', fontWeight: 600, lineHeight: 1.3, letterSpacing: '0' },
    h3: { fontSize: '28px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h4: { fontSize: '24px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h5: { fontSize: '20px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    h6: { fontSize: '18px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    body: { fontSize: '16px', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0' },
    small: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
    caption: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0' }
  },
  scale: {
    base: 16,
    ratio: 1.25,
    sizes: [12, 14, 16, 18, 20, 24, 28, 36, 48]
  },
  guidelines: [
    'Use Courier for screenplay format',
    'Use sans-serif for production documents',
    'Ensure readability in low light',
    'Follow industry standard formatting',
    'Use consistent font sizes for hierarchy'
  ]
};

// ============================================================================
// Motion Picture Layout System
// ============================================================================

const MOTION_PICTURE_LAYOUT: LayoutSystem = {
  grid: {
    columns: 16,
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
    scale: [0, 8, 16, 24, 32, 40, 48, 64, 80, 96],
    guidelines: [
      'Use 16:9 aspect ratio for HD',
      'Use 2.39:1 for cinematic widescreen',
      'Follow rule of thirds for composition',
      'Maintain safe zones for titles'
    ]
  },
  containerWidths: {
    mobile: '100%',
    tablet: '100%',
    desktop: '100%'
  },
  guidelines: [
    'Use storyboard templates for planning',
    'Follow shot composition rules',
    'Maintain consistent framing',
    'Use color grading for mood',
    'Implement proper lighting setups',
    'Follow continuity guidelines'
  ]
};

// ============================================================================
// Motion Picture Domain Export
// ============================================================================

export const MOTION_PICTURE_DOMAIN: DomainStyle = {
  domain: 'motion-picture',
  characteristics: [
    'Cinematic aspect ratios (16:9, 2.39:1, 1.85:1)',
    'Color grading and LUT application',
    'Rule of thirds composition',
    'Three-point lighting setups',
    'Shot types (wide, medium, close-up)',
    'Camera movements (pan, tilt, dolly, crane)',
    'Depth of field control',
    'Visual storytelling techniques',
    'Continuity and match cuts',
    'Sound design integration'
  ],
  colorScheme: MOTION_PICTURE_COLORS,
  typography: MOTION_PICTURE_TYPOGRAPHY,
  layout: MOTION_PICTURE_LAYOUT,
  examples: [
    'Feature film with cinematic color grading',
    'TV series with consistent visual style',
    'Web series with episodic structure',
    'Documentary with interview setups',
    'Music video with creative visuals',
    'Commercial with product focus'
  ]
};

