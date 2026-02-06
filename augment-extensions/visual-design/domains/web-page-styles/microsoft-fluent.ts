/**
 * Microsoft Fluent 2 Design System
 *
 * Fluent 2 (2021-present) represents Microsoft's evolution toward cross-platform
 * consistency, depth through materials (Acrylic/Mica), and adaptive design.
 * Key characteristics include layered materials, subtle depth, Segoe UI Variable
 * typography, and seamless integration across Windows, web, iOS, and Android.
 *
 * References:
 * - Fluent 2 Design System Documentation (2025-2026)
 * - https://fluent2.microsoft.design/
 */

import {
  VendorStyle,
  ColorPalette,
  TypographyRules,
  LayoutSystem,
  MotionSystem,
  ElevationSystem,
  ComponentLibrary
} from '../../types';

// ============================================================================
// Color System - Adaptive Color Tokens
// ============================================================================

const MICROSOFT_FLUENT_COLORS: ColorPalette = {
  primary: {
    name: 'Brand Primary',
    hex: '#0078D4',
    rgb: { r: 0, g: 120, b: 212 },
    hsl: { h: 206, s: 100, l: 42 },
    variants: [
      { name: 'Primary Shade 10', hex: '#004578', usage: 'Pressed state' },
      { name: 'Primary Shade 20', hex: '#005A9E', usage: 'Hover state' },
      { name: 'Primary Shade 30', hex: '#106EBE', usage: 'Active state' },
      { name: 'Primary Tint 10', hex: '#2B88D8', usage: 'Light backgrounds' },
      { name: 'Primary Tint 20', hex: '#C7E0F4', usage: 'Subtle highlights' },
      { name: 'Primary Tint 30', hex: '#DEECF9', usage: 'Very light backgrounds' }
    ]
  },
  secondary: {
    name: 'Secondary',
    hex: '#8764B8',
    rgb: { r: 135, g: 100, b: 184 },
    hsl: { h: 265, s: 38, l: 56 },
    variants: [
      { name: 'Secondary Shade 10', hex: '#5B3B8C', usage: 'Pressed state' },
      { name: 'Secondary Tint 10', hex: '#C4B5D6', usage: 'Light backgrounds' }
    ]
  },
  neutral: [
    { name: 'Grey 2', hex: '#050505', rgb: { r: 5, g: 5, b: 5 }, hsl: { h: 0, s: 0, l: 2 } },
    { name: 'Grey 4', hex: '#0A0A0A', rgb: { r: 10, g: 10, b: 10 }, hsl: { h: 0, s: 0, l: 4 } },
    { name: 'Grey 6', hex: '#0F0F0F', rgb: { r: 15, g: 15, b: 15 }, hsl: { h: 0, s: 0, l: 6 } },
    { name: 'Grey 8', hex: '#141414', rgb: { r: 20, g: 20, b: 20 }, hsl: { h: 0, s: 0, l: 8 } },
    { name: 'Grey 10', hex: '#1A1A1A', rgb: { r: 26, g: 26, b: 26 }, hsl: { h: 0, s: 0, l: 10 } },
    { name: 'Grey 12', hex: '#1F1F1F', rgb: { r: 31, g: 31, b: 31 }, hsl: { h: 0, s: 0, l: 12 } },
    { name: 'Grey 14', hex: '#242424', rgb: { r: 36, g: 36, b: 36 }, hsl: { h: 0, s: 0, l: 14 } },
    { name: 'Grey 16', hex: '#292929', rgb: { r: 41, g: 41, b: 41 }, hsl: { h: 0, s: 0, l: 16 } },
    { name: 'Grey 18', hex: '#2E2E2E', rgb: { r: 46, g: 46, b: 46 }, hsl: { h: 0, s: 0, l: 18 } },
    { name: 'Grey 20', hex: '#333333', rgb: { r: 51, g: 51, b: 51 }, hsl: { h: 0, s: 0, l: 20 } },
    { name: 'Grey 22', hex: '#383838', rgb: { r: 56, g: 56, b: 56 }, hsl: { h: 0, s: 0, l: 22 } },
    { name: 'Grey 24', hex: '#3D3D3D', rgb: { r: 61, g: 61, b: 61 }, hsl: { h: 0, s: 0, l: 24 } },
    { name: 'Grey 26', hex: '#424242', rgb: { r: 66, g: 66, b: 66 }, hsl: { h: 0, s: 0, l: 26 } },
    { name: 'Grey 28', hex: '#474747', rgb: { r: 71, g: 71, b: 71 }, hsl: { h: 0, s: 0, l: 28 } },
    { name: 'Grey 30', hex: '#4D4D4D', rgb: { r: 77, g: 77, b: 77 }, hsl: { h: 0, s: 0, l: 30 } },
    { name: 'Grey 90', hex: '#E6E6E6', rgb: { r: 230, g: 230, b: 230 }, hsl: { h: 0, s: 0, l: 90 } },
    { name: 'Grey 92', hex: '#EBEBEB', rgb: { r: 235, g: 235, b: 235 }, hsl: { h: 0, s: 0, l: 92 } },
    { name: 'Grey 94', hex: '#F0F0F0', rgb: { r: 240, g: 240, b: 240 }, hsl: { h: 0, s: 0, l: 94 } },
    { name: 'Grey 96', hex: '#F5F5F5', rgb: { r: 245, g: 245, b: 245 }, hsl: { h: 0, s: 0, l: 96 } },
    { name: 'Grey 98', hex: '#FAFAFA', rgb: { r: 250, g: 250, b: 250 }, hsl: { h: 0, s: 0, l: 98 } }
  ],
  semantic: {
    success: '#107C10',
    warning: '#F7630C',
    error: '#D13438',
    info: '#0078D4'
  },
  accessibility: {
    minContrastRatio: 4.5,
    wcagLevel: 'AA',
    colorBlindSafe: true
  }
};

// ============================================================================
// Typography System - Segoe UI Variable
// ============================================================================

const MICROSOFT_FLUENT_TYPOGRAPHY: TypographyRules = {
  fontFamilies: [
    {
      name: 'Segoe UI Variable',
      fallbacks: ['Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Helvetica Neue', 'sans-serif'],
      weights: [300, 400, 600, 700],
      styles: ['normal', 'italic'],
      usage: 'Primary font for all UI elements, supports variable font technology'
    },
    {
      name: 'Cascadia Code',
      fallbacks: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      weights: [400, 700],
      styles: ['normal'],
      usage: 'Monospace font for code and technical content'
    }
  ],
  typeScale: {
    base: 14,
    ratio: 1.125,
    sizes: {
      caption: 12,
      body: 14,
      subtitle: 16,
      title3: 20,
      title2: 24,
      title1: 28,
      display: 68
    }
  },
  hierarchy: {
    h1: { fontSize: '68px', fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontSize: '28px', fontWeight: 600, lineHeight: 1.3, letterSpacing: '-0.01em' },
    h3: { fontSize: '24px', fontWeight: 600, lineHeight: 1.3 },
    h4: { fontSize: '20px', fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: '16px', fontWeight: 600, lineHeight: 1.4 },
    h6: { fontSize: '14px', fontWeight: 600, lineHeight: 1.4 },
    body: { fontSize: '14px', fontWeight: 400, lineHeight: 1.5 },
    caption: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4 }
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.02em'
  }
};

// ============================================================================
// Layout System - Responsive Grid
// ============================================================================

const MICROSOFT_FLUENT_LAYOUT: LayoutSystem = {
  grid: {
    columns: 12,
    gutter: '16px',
    margin: '24px',
    maxWidth: '1920px'
  },
  spacing: {
    base: 4,
    scale: [0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96, 120],
    tokens: {
      'spacing-none': '0',
      'spacing-xxs': '2px',
      'spacing-xs': '4px',
      'spacing-s': '8px',
      'spacing-m': '12px',
      'spacing-l': '16px',
      'spacing-xl': '20px',
      'spacing-xxl': '24px',
      'spacing-xxxl': '32px'
    }
  },
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '1024px',
    lg: '1366px',
    xl: '1920px',
    xxl: '2560px'
  },
  containers: {
    maxWidth: {
      xs: '100%',
      sm: '640px',
      md: '1024px',
      lg: '1366px',
      xl: '1920px'
    },
    padding: {
      xs: '16px',
      sm: '24px',
      md: '32px',
      lg: '40px',
      xl: '48px'
    }
  }
};

// ============================================================================
// Motion System - Subtle and Purposeful
// ============================================================================

const MICROSOFT_FLUENT_MOTION: MotionSystem = {
  durations: {
    instant: '50ms',
    fast: '100ms',
    normal: '200ms',
    slow: '400ms'
  },
  easings: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.8, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.8, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.33, 0, 0.67, 1)'
  },
  animations: [
    {
      name: 'fadeIn',
      duration: '200ms',
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
      properties: ['opacity']
    },
    {
      name: 'slideIn',
      duration: '300ms',
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
      properties: ['transform', 'opacity']
    },
    {
      name: 'scaleIn',
      duration: '200ms',
      easing: 'cubic-bezier(0.33, 0, 0.67, 1)',
      properties: ['transform', 'opacity']
    },
    {
      name: 'reveal',
      duration: '400ms',
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
      properties: ['clip-path', 'opacity']
    }
  ]
};

// ============================================================================
// Elevation System - Layered Depth
// ============================================================================

const MICROSOFT_FLUENT_ELEVATION: ElevationSystem = {
  levels: [
    {
      level: 0,
      shadow: 'none',
      usage: 'Base surface, no elevation'
    },
    {
      level: 2,
      shadow: '0 0.3px 0.9px rgba(0, 0, 0, 0.108), 0 1.6px 3.6px rgba(0, 0, 0, 0.132)',
      usage: 'Cards, tiles at rest'
    },
    {
      level: 4,
      shadow: '0 0.6px 1.8px rgba(0, 0, 0, 0.108), 0 3.2px 7.2px rgba(0, 0, 0, 0.132)',
      usage: 'Raised cards, hover states'
    },
    {
      level: 8,
      shadow: '0 1.2px 3.6px rgba(0, 0, 0, 0.108), 0 6.4px 14.4px rgba(0, 0, 0, 0.132)',
      usage: 'Dropdowns, tooltips'
    },
    {
      level: 16,
      shadow: '0 2.4px 7.2px rgba(0, 0, 0, 0.108), 0 12.8px 28.8px rgba(0, 0, 0, 0.132)',
      usage: 'Dialogs, flyouts'
    },
    {
      level: 64,
      shadow: '0 9.6px 28.8px rgba(0, 0, 0, 0.108), 0 51.2px 115.2px rgba(0, 0, 0, 0.132)',
      usage: 'Modal overlays, highest elevation'
    }
  ],
  shadows: {
    none: 'none',
    sm: '0 0.3px 0.9px rgba(0, 0, 0, 0.108), 0 1.6px 3.6px rgba(0, 0, 0, 0.132)',
    md: '0 0.6px 1.8px rgba(0, 0, 0, 0.108), 0 3.2px 7.2px rgba(0, 0, 0, 0.132)',
    lg: '0 1.2px 3.6px rgba(0, 0, 0, 0.108), 0 6.4px 14.4px rgba(0, 0, 0, 0.132)',
    xl: '0 2.4px 7.2px rgba(0, 0, 0, 0.108), 0 12.8px 28.8px rgba(0, 0, 0, 0.132)'
  }
};

// ============================================================================
// Component Library - Fluent 2 Components
// ============================================================================

const MICROSOFT_FLUENT_COMPONENTS: ComponentLibrary = {
  buttons: {
    variants: [
      'primary',
      'subtle',
      'outline',
      'transparent'
    ],
    states: [
      'rest',
      'hover',
      'pressed',
      'disabled',
      'focused'
    ],
    sizes: [
      'small',
      'medium',
      'large'
    ],
    examples: [
      'Primary button: High-emphasis actions with brand color background',
      'Subtle button: Medium-emphasis with subtle background',
      'Outline button: Secondary actions with border',
      'Transparent button: Low-emphasis without background'
    ]
  },
  inputs: {
    variants: [
      'filled',
      'outline',
      'underline'
    ],
    states: [
      'rest',
      'hover',
      'focused',
      'disabled',
      'error'
    ],
    sizes: [
      'small',
      'medium',
      'large'
    ],
    examples: [
      'Text input with label and helper text',
      'Search input with icon',
      'Dropdown with multi-select',
      'Date picker with calendar'
    ]
  },
  cards: {
    variants: [
      'filled',
      'outline',
      'subtle'
    ],
    states: [
      'rest',
      'hover',
      'pressed',
      'selected'
    ],
    sizes: [
      'compact',
      'standard',
      'large'
    ],
    examples: [
      'Content card with image, title, and description',
      'Interactive card with hover elevation',
      'Selectable card with checkbox',
      'Card with action buttons'
    ]
  },
  navigation: {
    variants: [
      'horizontal',
      'vertical',
      'tabs',
      'breadcrumb'
    ],
    states: [
      'default',
      'selected',
      'hover',
      'disabled'
    ],
    sizes: [
      'compact',
      'standard'
    ],
    examples: [
      'Top navigation bar with logo and menu items',
      'Side navigation panel with collapsible sections',
      'Tab navigation for content switching',
      'Breadcrumb trail for hierarchical navigation'
    ]
  }
};

// ============================================================================
// Microsoft Fluent 2 Export
// ============================================================================

export const MICROSOFT_FLUENT: VendorStyle = {
  vendor: 'microsoft',
  name: 'Fluent 2',
  version: '2.0',
  characteristics: [
    'Acrylic and Mica materials for depth and transparency',
    'Subtle layered elevation with soft shadows',
    'Segoe UI Variable typography with variable font support',
    'Cross-platform consistency (Windows, Web, iOS, Android)',
    'Adaptive color system with light and dark themes',
    'Rounded corners (2px-8px radius)',
    'Purposeful, subtle motion with ease-out curves',
    'Accessible design (WCAG 2.1 AA compliant)',
    'Responsive 12-column grid system',
    'Component-based architecture',
    'Focus on productivity and clarity',
    'Seamless integration with Microsoft 365 ecosystem'
  ],
  colorPalette: MICROSOFT_FLUENT_COLORS,
  typography: MICROSOFT_FLUENT_TYPOGRAPHY,
  layout: MICROSOFT_FLUENT_LAYOUT,
  motion: MICROSOFT_FLUENT_MOTION,
  elevation: MICROSOFT_FLUENT_ELEVATION,
  components: MICROSOFT_FLUENT_COMPONENTS
};

/**
 * USAGE GUIDELINES FOR AI AGENTS
 *
 * When applying Microsoft Fluent 2 design:
 *
 * 1. COLOR SYSTEM
 *    - Use adaptive color tokens that work in light and dark themes
 *    - Apply brand primary (#0078D4) for key actions
 *    - Use neutral grays (2-step increments) for backgrounds and surfaces
 *    - Ensure WCAG AA compliance (4.5:1 contrast ratio minimum)
 *    - Support automatic theme switching
 *
 * 2. TYPOGRAPHY
 *    - Use Segoe UI Variable as primary font
 *    - Apply variable font technology for smooth weight transitions
 *    - Follow type scale (12px caption to 68px display)
 *    - Maintain minimum 14px for body text
 *    - Use appropriate font weights (300, 400, 600, 700)
 *
 * 3. LAYOUT
 *    - Use 12-column responsive grid
 *    - Apply 4px base spacing unit
 *    - Use consistent spacing scale (2, 4, 6, 8, 10, 12, 16, 20, 24...)
 *    - Implement responsive breakpoints (640px, 1024px, 1366px, 1920px)
 *    - Maintain adequate padding and margins
 *
 * 4. MATERIALS & DEPTH
 *    - Apply Acrylic material for navigation and panels (blur + transparency)
 *    - Use Mica material for app backgrounds (subtle texture)
 *    - Implement layered elevation (0, 2, 4, 8, 16, 64)
 *    - Use soft, subtle shadows for depth
 *    - Avoid excessive elevation changes
 *
 * 5. MOTION
 *    - Use subtle, purposeful animations
 *    - Apply ease-out curves for natural feel
 *    - Keep durations short (50ms-400ms)
 *    - Animate opacity, transform, and clip-path
 *    - Respect user motion preferences (prefers-reduced-motion)
 *
 * 6. COMPONENTS
 *    - Use Fluent 2 component library
 *    - Apply consistent button styles (primary, subtle, outline, transparent)
 *    - Implement proper focus indicators
 *    - Support keyboard navigation
 *    - Provide clear visual feedback for interactions
 *
 * 7. ACCESSIBILITY
 *    - Ensure WCAG 2.1 AA compliance
 *    - Provide sufficient color contrast
 *    - Support keyboard navigation
 *    - Include ARIA labels and roles
 *    - Test with screen readers
 *    - Support high contrast mode
 *
 * 8. CROSS-PLATFORM
 *    - Design for Windows, Web, iOS, and Android
 *    - Use platform-appropriate patterns
 *    - Maintain consistent brand identity
 *    - Adapt to platform conventions
 *    - Test on multiple devices and screen sizes
 *
 * EXAMPLE USAGE:
 *
 * ```typescript
 * import { MICROSOFT_FLUENT } from './microsoft-fluent';
 *
 * // Apply Fluent 2 colors
 * const primaryColor = MICROSOFT_FLUENT.colorPalette.primary.hex; // #0078D4
 * const neutralBg = MICROSOFT_FLUENT.colorPalette.neutral[17].hex; // #F5F5F5
 *
 * // Use typography scale
 * const headingStyle = MICROSOFT_FLUENT.typography.hierarchy.h2;
 * // fontSize: '28px', fontWeight: 600, lineHeight: 1.3
 *
 * // Apply elevation
 * const cardShadow = MICROSOFT_FLUENT.elevation.levels[1].shadow;
 * // '0 0.3px 0.9px rgba(0, 0, 0, 0.108), 0 1.6px 3.6px rgba(0, 0, 0, 0.132)'
 *
 * // Use motion
 * const fadeAnimation = MICROSOFT_FLUENT.motion.animations.find(a => a.name === 'fadeIn');
 * // duration: '200ms', easing: 'cubic-bezier(0, 0, 0.2, 1)'
 * ```
 *
 * MATERIALS IMPLEMENTATION:
 *
 * Acrylic Material (CSS):
 * ```css
 * .acrylic-surface {
 *   background: rgba(243, 243, 243, 0.7);
 *   backdrop-filter: blur(30px) saturate(125%);
 *   border: 1px solid rgba(255, 255, 255, 0.18);
 * }
 * ```
 *
 * Mica Material (CSS):
 * ```css
 * .mica-surface {
 *   background: linear-gradient(
 *     135deg,
 *     rgba(243, 243, 243, 0.9) 0%,
 *     rgba(250, 250, 250, 0.9) 100%
 *   );
 *   backdrop-filter: blur(50px);
 * }
 * ```
 */

