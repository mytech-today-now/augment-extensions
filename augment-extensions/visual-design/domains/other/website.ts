/**
 * Website Domain Module
 * 
 * Holistic multi-page site design patterns for traditional websites
 * with navigation, content hierarchy, and information architecture.
 */

import { DomainStyle, ColorPalette, TypographyRules, LayoutSystem } from '../../types';

// ============================================================================
// Website Color Palette
// ============================================================================

const WEBSITE_COLORS: ColorPalette = {
  primary: {
    name: 'Brand Primary',
    hex: '#2563EB',
    rgb: { r: 37, g: 99, b: 235 },
    hsl: { h: 221, s: 83, l: 53 },
    variants: [
      { name: 'Primary Light', hex: '#60A5FA', usage: 'Hover states, accents' },
      { name: 'Primary Dark', hex: '#1E40AF', usage: 'Active states, emphasis' }
    ]
  },
  neutral: [
    { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    { name: 'Gray 50', hex: '#F9FAFB', rgb: { r: 249, g: 250, b: 251 }, hsl: { h: 210, s: 20, l: 98 } },
    { name: 'Gray 100', hex: '#F3F4F6', rgb: { r: 243, g: 244, b: 246 }, hsl: { h: 220, s: 14, l: 96 } },
    { name: 'Gray 200', hex: '#E5E7EB', rgb: { r: 229, g: 231, b: 235 }, hsl: { h: 220, s: 13, l: 91 } },
    { name: 'Gray 800', hex: '#1F2937', rgb: { r: 31, g: 41, b: 55 }, hsl: { h: 215, s: 28, l: 17 } },
    { name: 'Gray 900', hex: '#111827', rgb: { r: 17, g: 24, b: 39 }, hsl: { h: 221, s: 39, l: 11 } }
  ],
  semantic: {
    success: { hex: '#10B981', usage: 'Success messages, confirmations' },
    warning: { hex: '#F59E0B', usage: 'Warnings, cautions' },
    error: { hex: '#EF4444', usage: 'Errors, destructive actions' },
    info: { hex: '#3B82F6', usage: 'Information, tips' }
  },
  accessibility: {
    minimumContrast: 4.5,
    targetContrast: 7,
    colorBlindSafe: true,
    guidelines: [
      'Ensure 4.5:1 contrast for body text',
      'Ensure 3:1 contrast for large text (18pt+)',
      'Never rely on color alone to convey information',
      'Test with color blindness simulators'
    ]
  }
};

// ============================================================================
// Website Typography
// ============================================================================

const WEBSITE_TYPOGRAPHY: TypographyRules = {
  fontFamilies: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary: 'Georgia, "Times New Roman", serif',
    monospace: '"Fira Code", "Courier New", monospace'
  },
  hierarchy: {
    h1: { fontSize: '48px', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontSize: '36px', fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
    h3: { fontSize: '28px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h4: { fontSize: '24px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h5: { fontSize: '20px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    h6: { fontSize: '18px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    body: { fontSize: '16px', fontWeight: 400, lineHeight: 1.6, letterSpacing: '0' },
    small: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
    caption: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0.01em' }
  },
  scale: {
    base: 16,
    ratio: 1.25,
    sizes: [12, 14, 16, 18, 20, 24, 28, 36, 48, 64]
  },
  guidelines: [
    'Use system font stack for fast loading',
    'Limit to 2-3 font families maximum',
    'Maintain consistent line height (1.5-1.6 for body)',
    'Use font-weight variations for hierarchy',
    'Ensure minimum 16px for body text',
    'Apply responsive typography with clamp()'
  ]
};

// ============================================================================
// Website Layout System
// ============================================================================

const WEBSITE_LAYOUT: LayoutSystem = {
  grid: {
    columns: 12,
    gutter: '24px',
    margin: '24px',
    breakpoints: {
      mobile: '0-639px',
      tablet: '640-1023px',
      desktop: '1024-1279px',
      wide: '1280px+'
    }
  },
  spacing: {
    unit: 8,
    scale: [0, 8, 16, 24, 32, 40, 48, 64, 80, 96, 128, 160],
    guidelines: [
      'Use 8px base unit for all spacing',
      'Apply consistent spacing scale',
      'Increase spacing for visual hierarchy',
      'Maintain breathing room around sections'
    ]
  },
  containerWidths: {
    mobile: '100%',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
    max: '1440px'
  },
  guidelines: [
    'Use semantic HTML5 elements (header, nav, main, aside, footer)',
    'Implement sticky navigation for easy access',
    'Create clear visual hierarchy with spacing',
    'Use grid for complex layouts, flexbox for components',
    'Ensure mobile-first responsive design',
    'Maintain consistent page structure across site'
  ]
};

// ============================================================================
// Website Domain Export
// ============================================================================

export const WEBSITE_DOMAIN: DomainStyle = {
  domain: 'website',
  characteristics: [
    'Multi-page navigation structure',
    'Clear information architecture',
    'Consistent header and footer across pages',
    'Breadcrumb navigation for deep content',
    'Search functionality for content discovery',
    'Responsive design for all devices',
    'SEO-optimized structure and metadata',
    'Accessible navigation and content',
    'Fast page load times',
    'Clear call-to-action placement'
  ],
  colorScheme: WEBSITE_COLORS,
  typography: WEBSITE_TYPOGRAPHY,
  layout: WEBSITE_LAYOUT,
  examples: [
    'Corporate website with About, Services, Contact pages',
    'Blog with article listing and individual post pages',
    'Portfolio site with project gallery and case studies',
    'E-commerce site with product catalog and checkout',
    'Documentation site with sidebar navigation',
    'Landing page with hero section and feature sections'
  ]
};

