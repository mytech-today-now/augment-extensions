/**
 * Windows Platform Domain Module
 * 
 * Windows-specific application design patterns following
 * Windows 11 design principles and WinUI 3 guidelines.
 */

import { DomainStyle, ColorPalette, TypographyRules, LayoutSystem } from '../../types';

// ============================================================================
// Windows Platform Color Palette
// ============================================================================

const WINDOWS_COLORS: ColorPalette = {
  primary: {
    name: 'System Accent',
    hex: '#0078D4',
    rgb: { r: 0, g: 120, b: 212 },
    hsl: { h: 206, s: 100, l: 42 },
    variants: [
      { name: 'Accent Light 1', hex: '#4A9EFF', usage: 'Hover states' },
      { name: 'Accent Dark 1', hex: '#005A9E', usage: 'Pressed states' }
    ]
  },
  neutral: [
    { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    { name: 'Card Background', hex: '#F3F3F3', rgb: { r: 243, g: 243, b: 243 }, hsl: { h: 0, s: 0, l: 95 } },
    { name: 'Layer', hex: '#EBEBEB', rgb: { r: 235, g: 235, b: 235 }, hsl: { h: 0, s: 0, l: 92 } },
    { name: 'Text Primary', hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } },
    { name: 'Text Secondary', hex: '#605E5C', rgb: { r: 96, g: 94, b: 92 }, hsl: { h: 30, s: 2, l: 37 } }
  ],
  semantic: {
    success: { hex: '#107C10', usage: 'Success states' },
    warning: { hex: '#FFB900', usage: 'Warnings, cautions' },
    error: { hex: '#D13438', usage: 'Errors, critical actions' },
    info: { hex: '#0078D4', usage: 'Information, tips' }
  },
  accessibility: {
    minimumContrast: 4.5,
    targetContrast: 7,
    colorBlindSafe: true,
    guidelines: [
      'Use system accent color from Windows settings',
      'Support Windows high contrast themes',
      'Respect dark/light mode preference',
      'Test with Windows Narrator'
    ]
  }
};

// ============================================================================
// Windows Platform Typography
// ============================================================================

const WINDOWS_TYPOGRAPHY: TypographyRules = {
  fontFamilies: {
    primary: '"Segoe UI Variable", "Segoe UI", sans-serif',
    secondary: 'system-ui, sans-serif',
    monospace: '"Cascadia Code", "Consolas", monospace'
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
    sizes: [11, 12, 14, 16, 20, 28, 40]
  },
  guidelines: [
    'Use Segoe UI Variable for Windows 11',
    'Use Segoe UI for Windows 10',
    'Follow Windows typography ramp',
    'Support variable font weights',
    'Ensure ClearType rendering'
  ]
};

// ============================================================================
// Windows Platform Layout System
// ============================================================================

const WINDOWS_LAYOUT: LayoutSystem = {
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
      'Use 4px base unit for spacing',
      'Follow WinUI 3 spacing guidelines',
      'Maintain 44x44px touch targets',
      'Use consistent padding in controls'
    ]
  },
  containerWidths: {
    compact: '100%',
    medium: '100%',
    expanded: '100%'
  },
  guidelines: [
    'Use WinUI 3 controls and patterns',
    'Implement title bar with window controls',
    'Support Acrylic and Mica materials',
    'Follow Windows 11 rounded corners (8px)',
    'Implement proper focus visuals',
    'Support snap layouts and window management'
  ]
};

// ============================================================================
// Windows Platform Domain Export
// ============================================================================

export const WINDOWS_PLATFORM_DOMAIN: DomainStyle = {
  domain: 'windows-platform',
  characteristics: [
    'WinUI 3 controls and components',
    'Acrylic and Mica background materials',
    'Rounded corners (8px radius)',
    'System accent color integration',
    'Title bar with window controls',
    'Fluent Design System principles',
    'Reveal highlight on hover',
    'Smooth animations and transitions',
    'High DPI and touch support',
    'Windows 11 snap layouts integration'
  ],
  colorScheme: WINDOWS_COLORS,
  typography: WINDOWS_TYPOGRAPHY,
  layout: WINDOWS_LAYOUT,
  examples: [
    'Settings app with navigation view',
    'File Explorer with ribbon interface',
    'Calculator with number pad layout',
    'Photos app with gallery view',
    'Mail app with reading pane',
    'Store app with product listings'
  ]
};

