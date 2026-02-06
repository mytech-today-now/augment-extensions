/**
 * Linux Platform Domain Module
 * 
 * Linux-specific application design patterns following
 * GNOME HIG, KDE HIG, and freedesktop.org standards.
 */

import { DomainStyle, ColorPalette, TypographyRules, LayoutSystem } from '../../types';

// ============================================================================
// Linux Platform Color Palette
// ============================================================================

const LINUX_COLORS: ColorPalette = {
  primary: {
    name: 'Blue Accent',
    hex: '#3584E4',
    rgb: { r: 53, g: 132, b: 228 },
    hsl: { h: 213, s: 76, l: 55 },
    variants: [
      { name: 'Blue Light', hex: '#62A0EA', usage: 'Hover states' },
      { name: 'Blue Dark', hex: '#1C71D8', usage: 'Active states' }
    ]
  },
  neutral: [
    { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    { name: 'Light 1', hex: '#F6F5F4', rgb: { r: 246, g: 245, b: 244 }, hsl: { h: 30, s: 11, l: 96 } },
    { name: 'Light 2', hex: '#DEDDDA', rgb: { r: 222, g: 221, b: 218 }, hsl: { h: 45, s: 9, l: 86 } },
    { name: 'Dark 3', hex: '#5E5C64', rgb: { r: 94, g: 92, b: 100 }, hsl: { h: 255, s: 4, l: 38 } },
    { name: 'Dark 5', hex: '#241F31', rgb: { r: 36, g: 31, b: 49 }, hsl: { h: 257, s: 23, l: 16 } }
  ],
  semantic: {
    success: { hex: '#26A269', usage: 'Success states' },
    warning: { hex: '#E5A50A', usage: 'Warnings' },
    error: { hex: '#C01C28', usage: 'Errors, destructive actions' },
    info: { hex: '#3584E4', usage: 'Information' }
  },
  accessibility: {
    minimumContrast: 4.5,
    targetContrast: 7,
    colorBlindSafe: true,
    guidelines: [
      'Follow GNOME HIG color guidelines',
      'Support GTK theme integration',
      'Respect system dark/light preference',
      'Test with Orca screen reader'
    ]
  }
};

// ============================================================================
// Linux Platform Typography
// ============================================================================

const LINUX_TYPOGRAPHY: TypographyRules = {
  fontFamilies: {
    primary: '"Cantarell", "Ubuntu", "Noto Sans", sans-serif',
    secondary: 'system-ui, sans-serif',
    monospace: '"Source Code Pro", "Liberation Mono", monospace'
  },
  hierarchy: {
    h1: { fontSize: '24px', fontWeight: 700, lineHeight: 1.3, letterSpacing: '0' },
    h2: { fontSize: '20px', fontWeight: 700, lineHeight: 1.4, letterSpacing: '0' },
    h3: { fontSize: '16px', fontWeight: 700, lineHeight: 1.4, letterSpacing: '0' },
    h4: { fontSize: '14px', fontWeight: 700, lineHeight: 1.5, letterSpacing: '0' },
    h5: { fontSize: '12px', fontWeight: 700, lineHeight: 1.5, letterSpacing: '0' },
    h6: { fontSize: '11px', fontWeight: 700, lineHeight: 1.5, letterSpacing: '0' },
    body: { fontSize: '11px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
    small: { fontSize: '10px', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0' },
    caption: { fontSize: '9px', fontWeight: 400, lineHeight: 1.3, letterSpacing: '0' }
  },
  scale: {
    base: 11,
    ratio: 1.2,
    sizes: [9, 10, 11, 12, 14, 16, 20, 24]
  },
  guidelines: [
    'Use Cantarell for GNOME applications',
    'Use Ubuntu font for Ubuntu-based apps',
    'Follow freedesktop.org font standards',
    'Support font scaling preferences',
    'Ensure readability at small sizes'
  ]
};

// ============================================================================
// Linux Platform Layout System
// ============================================================================

const LINUX_LAYOUT: LayoutSystem = {
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
    unit: 6,
    scale: [0, 6, 12, 18, 24, 30, 36, 48],
    guidelines: [
      'Use 6px base unit (GNOME HIG)',
      'Follow GTK spacing conventions',
      'Maintain consistent padding',
      'Use headerbar for window controls'
    ]
  },
  containerWidths: {
    compact: '100%',
    medium: '100%',
    expanded: '100%'
  },
  guidelines: [
    'Use GTK/Qt widgets and patterns',
    'Implement headerbar with window controls',
    'Follow GNOME HIG or KDE HIG guidelines',
    'Support keyboard navigation',
    'Integrate with desktop environment',
    'Use native file choosers and dialogs'
  ]
};

// ============================================================================
// Linux Platform Domain Export
// ============================================================================

export const LINUX_PLATFORM_DOMAIN: DomainStyle = {
  domain: 'linux-platform',
  characteristics: [
    'GTK or Qt widget toolkit integration',
    'Headerbar with integrated window controls',
    'Desktop environment theme integration',
    'D-Bus integration for system services',
    'XDG standards compliance',
    'Keyboard-first navigation',
    'Native file chooser dialogs',
    'System tray/notification area support',
    'Wayland and X11 compatibility',
    'Flatpak/Snap packaging support'
  ],
  colorScheme: LINUX_COLORS,
  typography: LINUX_TYPOGRAPHY,
  layout: LINUX_LAYOUT,
  examples: [
    'GNOME application with headerbar',
    'KDE Plasma application with menu bar',
    'File manager with sidebar navigation',
    'Terminal emulator with tabs',
    'System settings application',
    'Text editor with syntax highlighting'
  ]
};

