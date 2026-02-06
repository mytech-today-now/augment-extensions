/**
 * Mobile Application Domain Module
 * 
 * Mobile-specific design patterns for iOS and Android applications
 * following Human Interface Guidelines and Material Design for mobile.
 */

import { DomainStyle, ColorPalette, TypographyRules, LayoutSystem } from '../../types';

// ============================================================================
// Mobile Application Color Palette
// ============================================================================

const MOBILE_COLORS: ColorPalette = {
  primary: {
    name: 'App Primary',
    hex: '#007AFF',
    rgb: { r: 0, g: 122, b: 255 },
    hsl: { h: 211, s: 100, l: 50 },
    variants: [
      { name: 'Primary Light', hex: '#5AC8FA', usage: 'Highlights' },
      { name: 'Primary Dark', hex: '#0051D5', usage: 'Pressed states' }
    ]
  },
  neutral: [
    { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    { name: 'Gray 1', hex: '#F2F2F7', rgb: { r: 242, g: 242, b: 247 }, hsl: { h: 240, s: 25, l: 96 } },
    { name: 'Gray 2', hex: '#E5E5EA', rgb: { r: 229, g: 229, b: 234 }, hsl: { h: 240, s: 11, l: 91 } },
    { name: 'Gray 5', hex: '#636366', rgb: { r: 99, g: 99, b: 102 }, hsl: { h: 240, s: 1, l: 39 } },
    { name: 'Black', hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } }
  ],
  semantic: {
    success: { hex: '#34C759', usage: 'Success states' },
    warning: { hex: '#FF9500', usage: 'Warnings' },
    error: { hex: '#FF3B30', usage: 'Errors, destructive' },
    info: { hex: '#007AFF', usage: 'Information' }
  },
  accessibility: {
    minimumContrast: 4.5,
    targetContrast: 7,
    colorBlindSafe: true,
    guidelines: [
      'Support iOS Dynamic Type',
      'Support Android Material You theming',
      'Ensure 44x44pt touch targets (iOS)',
      'Ensure 48x48dp touch targets (Android)',
      'Test with accessibility scanners'
    ]
  }
};

// ============================================================================
// Mobile Application Typography
// ============================================================================

const MOBILE_TYPOGRAPHY: TypographyRules = {
  fontFamilies: {
    primary: '-apple-system, BlinkMacSystemFont, "Roboto", "Helvetica Neue", sans-serif',
    secondary: 'system-ui, sans-serif',
    monospace: '"SF Mono", "Roboto Mono", monospace'
  },
  hierarchy: {
    h1: { fontSize: '34px', fontWeight: 700, lineHeight: 1.2, letterSpacing: '0' },
    h2: { fontSize: '28px', fontWeight: 700, lineHeight: 1.3, letterSpacing: '0' },
    h3: { fontSize: '22px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h4: { fontSize: '20px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h5: { fontSize: '17px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    h6: { fontSize: '15px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    body: { fontSize: '17px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
    small: { fontSize: '15px', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0' },
    caption: { fontSize: '13px', fontWeight: 400, lineHeight: 1.3, letterSpacing: '0' }
  },
  scale: {
    base: 17,
    ratio: 1.15,
    sizes: [11, 13, 15, 17, 20, 22, 28, 34]
  },
  guidelines: [
    'Use San Francisco for iOS',
    'Use Roboto for Android',
    'Support Dynamic Type (iOS)',
    'Support scalable text (Android)',
    'Larger base size for mobile readability'
  ]
};

// ============================================================================
// Mobile Application Layout System
// ============================================================================

const MOBILE_LAYOUT: LayoutSystem = {
  grid: {
    columns: 4,
    gutter: '16px',
    margin: '16px',
    breakpoints: {
      phone: '0-599px',
      tablet: '600-839px',
      large: '840px+'
    }
  },
  spacing: {
    unit: 8,
    scale: [0, 8, 16, 24, 32, 40, 48, 64],
    guidelines: [
      'Use 8px base unit for spacing',
      'Maintain 44x44pt touch targets (iOS)',
      'Maintain 48x48dp touch targets (Android)',
      'Use safe area insets for notched devices'
    ]
  },
  containerWidths: {
    phone: '100%',
    tablet: '100%',
    large: '100%'
  },
  guidelines: [
    'Use native navigation patterns (tab bar, navigation bar)',
    'Implement swipe gestures for navigation',
    'Support portrait and landscape orientations',
    'Use bottom navigation for primary actions',
    'Implement pull-to-refresh for lists',
    'Use modal sheets for secondary actions'
  ]
};

// ============================================================================
// Mobile Application Domain Export
// ============================================================================

export const MOBILE_APPLICATION_DOMAIN: DomainStyle = {
  domain: 'mobile-application',
  characteristics: [
    'Touch-first interaction design',
    'Native navigation patterns (iOS/Android)',
    'Gesture-based interactions',
    'Bottom navigation and tab bars',
    'Pull-to-refresh and infinite scroll',
    'Modal sheets and action sheets',
    'Safe area inset handling',
    'Haptic feedback integration',
    'Offline-first architecture',
    'Push notification support'
  ],
  colorScheme: MOBILE_COLORS,
  typography: MOBILE_TYPOGRAPHY,
  layout: MOBILE_LAYOUT,
  examples: [
    'Social media feed with infinite scroll',
    'E-commerce app with product catalog',
    'Messaging app with chat interface',
    'Banking app with dashboard',
    'Fitness tracker with charts',
    'News reader with article cards'
  ]
};

