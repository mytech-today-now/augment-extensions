/**
 * OS Application Domain Module
 * 
 * General OS application design patterns for desktop applications
 * across Windows, macOS, and Linux platforms.
 */

import { DomainStyle, ColorPalette, TypographyRules, LayoutSystem } from '../../types';

// ============================================================================
// OS Application Color Palette
// ============================================================================

const OS_APP_COLORS: ColorPalette = {
  primary: {
    name: 'App Accent',
    hex: '#0078D4',
    rgb: { r: 0, g: 120, b: 212 },
    hsl: { h: 206, s: 100, l: 42 },
    variants: [
      { name: 'Accent Light', hex: '#4A9EFF', usage: 'Hover states' },
      { name: 'Accent Dark', hex: '#005A9E', usage: 'Pressed states' }
    ]
  },
  neutral: [
    { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    { name: 'Gray 10', hex: '#FAFAFA', rgb: { r: 250, g: 250, b: 250 }, hsl: { h: 0, s: 0, l: 98 } },
    { name: 'Gray 20', hex: '#F3F3F3', rgb: { r: 243, g: 243, b: 243 }, hsl: { h: 0, s: 0, l: 95 } },
    { name: 'Gray 130', hex: '#8A8A8A', rgb: { r: 138, g: 138, b: 138 }, hsl: { h: 0, s: 0, l: 54 } },
    { name: 'Gray 190', hex: '#201F1E', rgb: { r: 32, g: 31, b: 30 }, hsl: { h: 30, s: 3, l: 12 } }
  ],
  semantic: {
    success: { hex: '#107C10', usage: 'Success states' },
    warning: { hex: '#FFB900', usage: 'Warnings' },
    error: { hex: '#D13438', usage: 'Errors' },
    info: { hex: '#0078D4', usage: 'Information' }
  },
  accessibility: {
    minimumContrast: 4.5,
    targetContrast: 7,
    colorBlindSafe: true,
    guidelines: [
      'Support system theme (light/dark)',
      'Respect OS high contrast mode',
      'Ensure keyboard focus visibility',
      'Test with platform accessibility tools'
    ]
  }
};

// ============================================================================
// OS Application Typography
// ============================================================================

const OS_APP_TYPOGRAPHY: TypographyRules = {
  fontFamilies: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    secondary: 'system-ui, sans-serif',
    monospace: '"SF Mono", "Consolas", "Courier New", monospace'
  },
  hierarchy: {
    h1: { fontSize: '28px', fontWeight: 600, lineHeight: 1.3, letterSpacing: '0' },
    h2: { fontSize: '20px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h3: { fontSize: '16px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h4: { fontSize: '14px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    h5: { fontSize: '12px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    h6: { fontSize: '11px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    body: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
    small: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0' },
    caption: { fontSize: '11px', fontWeight: 400, lineHeight: 1.3, letterSpacing: '0' }
  },
  scale: {
    base: 14,
    ratio: 1.15,
    sizes: [11, 12, 14, 16, 20, 28]
  },
  guidelines: [
    'Use system fonts for native feel',
    'Follow platform typography conventions',
    'Ensure readability at default system zoom',
    'Support dynamic type/font scaling',
    'Use platform-specific font weights'
  ]
};

// ============================================================================
// OS Application Layout System
// ============================================================================

const OS_APP_LAYOUT: LayoutSystem = {
  grid: {
    columns: 12,
    gutter: '12px',
    margin: '12px',
    breakpoints: {
      compact: '0-639px',
      medium: '640-1023px',
      expanded: '1024px+'
    }
  },
  spacing: {
    unit: 4,
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48],
    guidelines: [
      'Use 4px base unit for consistency',
      'Follow platform spacing conventions',
      'Maintain touch-friendly targets (44x44px minimum)',
      'Use consistent padding in panels'
    ]
  },
  containerWidths: {
    compact: '100%',
    medium: '100%',
    expanded: '100%'
  },
  guidelines: [
    'Use native window chrome and controls',
    'Implement platform-specific menu bars',
    'Support window resizing and states',
    'Follow platform keyboard shortcuts',
    'Implement proper focus management',
    'Support drag-and-drop where appropriate'
  ]
};

// ============================================================================
// OS Application Domain Export
// ============================================================================

export const OS_APPLICATION_DOMAIN: DomainStyle = {
  domain: 'os-application',
  characteristics: [
    'Native window management',
    'Platform-specific menu bars and toolbars',
    'Keyboard shortcuts and accessibility',
    'System tray/menu bar integration',
    'File system integration',
    'Multi-window support',
    'Drag-and-drop functionality',
    'System theme integration (light/dark)',
    'High DPI/Retina display support',
    'Offline-first architecture'
  ],
  colorScheme: OS_APP_COLORS,
  typography: OS_APP_TYPOGRAPHY,
  layout: OS_APP_LAYOUT,
  examples: [
    'Text editor with syntax highlighting',
    'File manager with tree view',
    'Email client with multi-pane layout',
    'Media player with playback controls',
    'Settings/preferences application',
    'Development IDE with panels and toolbars'
  ]
};

