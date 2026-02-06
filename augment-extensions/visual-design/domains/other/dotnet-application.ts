/**
 * .NET Application Domain Module
 * 
 * .NET-specific application design patterns for WPF, WinForms,
 * MAUI, and Blazor applications following Microsoft design guidelines.
 */

import { DomainStyle, ColorPalette, TypographyRules, LayoutSystem } from '../../types';

// ============================================================================
// .NET Application Color Palette
// ============================================================================

const DOTNET_COLORS: ColorPalette = {
  primary: {
    name: '.NET Purple',
    hex: '#512BD4',
    rgb: { r: 81, g: 43, b: 212 },
    hsl: { h: 253, s: 66, l: 50 },
    variants: [
      { name: 'Purple Light', hex: '#8B5CF6', usage: 'Hover states' },
      { name: 'Purple Dark', hex: '#3B1FA2', usage: 'Active states' }
    ]
  },
  neutral: [
    { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    { name: 'Gray 10', hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 }, hsl: { h: 0, s: 0, l: 96 } },
    { name: 'Gray 20', hex: '#E0E0E0', rgb: { r: 224, g: 224, b: 224 }, hsl: { h: 0, s: 0, l: 88 } },
    { name: 'Gray 80', hex: '#424242', rgb: { r: 66, g: 66, b: 66 }, hsl: { h: 0, s: 0, l: 26 } },
    { name: 'Gray 90', hex: '#212121', rgb: { r: 33, g: 33, b: 33 }, hsl: { h: 0, s: 0, l: 13 } }
  ],
  semantic: {
    success: { hex: '#2E7D32', usage: 'Success states' },
    warning: { hex: '#F57C00', usage: 'Warnings' },
    error: { hex: '#C62828', usage: 'Errors' },
    info: { hex: '#0288D1', usage: 'Information' }
  },
  accessibility: {
    minimumContrast: 4.5,
    targetContrast: 7,
    colorBlindSafe: true,
    guidelines: [
      'Follow WCAG 2.1 AA standards',
      'Support Windows high contrast mode',
      'Test with .NET accessibility tools',
      'Ensure keyboard navigation'
    ]
  }
};

// ============================================================================
// .NET Application Typography
// ============================================================================

const DOTNET_TYPOGRAPHY: TypographyRules = {
  fontFamilies: {
    primary: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    secondary: 'system-ui, sans-serif',
    monospace: '"Cascadia Code", "Consolas", "Courier New", monospace'
  },
  hierarchy: {
    h1: { fontSize: '32px', fontWeight: 600, lineHeight: 1.2, letterSpacing: '0' },
    h2: { fontSize: '24px', fontWeight: 600, lineHeight: 1.3, letterSpacing: '0' },
    h3: { fontSize: '20px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h4: { fontSize: '16px', fontWeight: 600, lineHeight: 1.4, letterSpacing: '0' },
    h5: { fontSize: '14px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    h6: { fontSize: '12px', fontWeight: 600, lineHeight: 1.5, letterSpacing: '0' },
    body: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5, letterSpacing: '0' },
    small: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4, letterSpacing: '0' },
    caption: { fontSize: '11px', fontWeight: 400, lineHeight: 1.3, letterSpacing: '0' }
  },
  scale: {
    base: 14,
    ratio: 1.2,
    sizes: [11, 12, 14, 16, 20, 24, 32]
  },
  guidelines: [
    'Use Segoe UI for Windows applications',
    'Use San Francisco for macOS/iOS (MAUI)',
    'Follow platform typography conventions',
    'Support dynamic font scaling',
    'Ensure readability in data grids'
  ]
};

// ============================================================================
// .NET Application Layout System
// ============================================================================

const DOTNET_LAYOUT: LayoutSystem = {
  grid: {
    columns: 12,
    gutter: '16px',
    margin: '16px',
    breakpoints: {
      compact: '0-639px',
      medium: '640-1023px',
      expanded: '1024px+'
    }
  },
  spacing: {
    unit: 8,
    scale: [0, 8, 16, 24, 32, 40, 48, 64],
    guidelines: [
      'Use 8px base unit for spacing',
      'Follow WPF/WinForms layout conventions',
      'Use Grid and StackPanel for layouts',
      'Maintain consistent margins and padding'
    ]
  },
  containerWidths: {
    compact: '100%',
    medium: '100%',
    expanded: '100%'
  },
  guidelines: [
    'Use XAML layouts (Grid, StackPanel, DockPanel)',
    'Implement MVVM pattern for data binding',
    'Use data templates for list items',
    'Support responsive layouts with AdaptiveTriggers',
    'Implement proper focus management',
    'Use commanding for user actions'
  ]
};

// ============================================================================
// .NET Application Domain Export
// ============================================================================

export const DOTNET_APPLICATION_DOMAIN: DomainStyle = {
  domain: 'dotnet-application',
  characteristics: [
    'XAML-based UI definition',
    'MVVM architecture pattern',
    'Data binding and commanding',
    'WPF/WinForms/MAUI controls',
    'Cross-platform with .NET MAUI',
    'Dependency injection support',
    'Async/await patterns',
    'Entity Framework integration',
    'NuGet package ecosystem',
    'Visual Studio designer support'
  ],
  colorScheme: DOTNET_COLORS,
  typography: DOTNET_TYPOGRAPHY,
  layout: DOTNET_LAYOUT,
  examples: [
    'WPF desktop application with ribbon',
    'WinForms data entry application',
    '.NET MAUI cross-platform app',
    'Blazor web application',
    'Entity Framework data grid',
    'Settings dialog with tabs'
  ]
};

