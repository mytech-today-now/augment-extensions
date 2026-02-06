/**
 * Web-app Domain Module
 * 
 * Interactive SPA/PWA patterns for single-page applications
 * with dynamic content, state management, and app-like experiences.
 */

import { DomainStyle, ColorPalette, TypographyRules, LayoutSystem } from '../../types';

// ============================================================================
// Web-app Color Palette
// ============================================================================

const WEBAPP_COLORS: ColorPalette = {
  primary: {
    name: 'App Primary',
    hex: '#6366F1',
    rgb: { r: 99, g: 102, b: 241 },
    hsl: { h: 239, s: 84, l: 67 },
    variants: [
      { name: 'Primary Light', hex: '#A5B4FC', usage: 'Hover states, highlights' },
      { name: 'Primary Dark', hex: '#4F46E5', usage: 'Active states, pressed' }
    ]
  },
  neutral: [
    { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    { name: 'Gray 50', hex: '#F9FAFB', rgb: { r: 249, g: 250, b: 251 }, hsl: { h: 210, s: 20, l: 98 } },
    { name: 'Gray 100', hex: '#F3F4F6', rgb: { r: 243, g: 244, b: 246 }, hsl: { h: 220, s: 14, l: 96 } },
    { name: 'Gray 700', hex: '#374151', rgb: { r: 55, g: 65, b: 81 }, hsl: { h: 217, s: 19, l: 27 } },
    { name: 'Gray 900', hex: '#111827', rgb: { r: 17, g: 24, b: 39 }, hsl: { h: 221, s: 39, l: 11 } }
  ],
  semantic: {
    success: { hex: '#10B981', usage: 'Success states, confirmations' },
    warning: { hex: '#F59E0B', usage: 'Warnings, pending states' },
    error: { hex: '#EF4444', usage: 'Errors, validation failures' },
    info: { hex: '#3B82F6', usage: 'Information, tooltips' }
  },
  accessibility: {
    minimumContrast: 4.5,
    targetContrast: 7,
    colorBlindSafe: true,
    guidelines: [
      'Ensure 4.5:1 contrast for all interactive elements',
      'Use focus indicators with 3:1 contrast',
      'Support dark mode with proper contrast',
      'Test with accessibility tools'
    ]
  }
};

// ============================================================================
// Web-app Typography
// ============================================================================

const WEBAPP_TYPOGRAPHY: TypographyRules = {
  fontFamilies: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    secondary: 'Inter, system-ui, sans-serif',
    monospace: '"SF Mono", Monaco, "Cascadia Code", monospace'
  },
  hierarchy: {
    h1: { fontSize: '32px', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontSize: '24px', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' },
    h3: { fontSize: '20px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h4: { fontSize: '18px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h5: { fontSize: '16px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    h6: { fontSize: '14px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    body: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
    small: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0' },
    caption: { fontSize: '11px', fontWeight: 400, lineHeight: 1.3, letterSpacing: '0.01em' }
  },
  scale: {
    base: 14,
    ratio: 1.2,
    sizes: [11, 12, 14, 16, 18, 20, 24, 32, 40]
  },
  guidelines: [
    'Use system fonts for native app feel',
    'Smaller base size (14px) for dense interfaces',
    'Consistent font weights for UI hierarchy',
    'Monospace for code and data display',
    'Optimize for readability at small sizes'
  ]
};

// ============================================================================
// Web-app Layout System
// ============================================================================

const WEBAPP_LAYOUT: LayoutSystem = {
  grid: {
    columns: 12,
    gutter: '16px',
    margin: '16px',
    breakpoints: {
      mobile: '0-639px',
      tablet: '640-1023px',
      desktop: '1024px+'
    }
  },
  spacing: {
    unit: 4,
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
    guidelines: [
      'Use 4px base unit for tight spacing',
      'Compact spacing for dense interfaces',
      'Consistent padding in panels and cards',
      'Minimal margins for app-like feel'
    ]
  },
  containerWidths: {
    mobile: '100%',
    tablet: '100%',
    desktop: '100%',
    fullscreen: '100vw'
  },
  guidelines: [
    'Use app shell pattern (persistent header/sidebar)',
    'Implement virtual scrolling for large lists',
    'Use fixed positioning for navigation',
    'Optimize for single-hand mobile use',
    'Support offline-first architecture',
    'Implement skeleton screens for loading states'
  ]
};

// ============================================================================
// Web-app Domain Export
// ============================================================================

export const WEBAPP_DOMAIN: DomainStyle = {
  domain: 'web-app',
  characteristics: [
    'Single-page application architecture',
    'Client-side routing and state management',
    'Real-time data updates and synchronization',
    'Offline-first with service workers',
    'App-like navigation patterns',
    'Persistent UI shell (header, sidebar)',
    'Loading states and skeleton screens',
    'Optimistic UI updates',
    'Touch-friendly interactions',
    'Progressive Web App capabilities'
  ],
  colorScheme: WEBAPP_COLORS,
  typography: WEBAPP_TYPOGRAPHY,
  layout: WEBAPP_LAYOUT,
  examples: [
    'Dashboard with data visualization and charts',
    'Project management tool with kanban boards',
    'Email client with inbox and compose views',
    'Social media feed with infinite scroll',
    'Collaborative document editor',
    'Task management app with drag-and-drop'
  ]
};

