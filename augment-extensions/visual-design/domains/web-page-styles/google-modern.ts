/**
 * Google Modern (Material 3 Expressive) Design System
 *
 * Material Design 3 (2021-present) represents Google's evolution toward more
 * expressive, personalized, and accessible design. Key characteristics include
 * dynamic color theming, rounded corners, springy motion, and enhanced accessibility.
 *
 * References:
 * - Material Design 3 Documentation (2025-2026)
 * - https://m3.material.io/
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
// Color System - Dynamic Color Theming
// ============================================================================

const GOOGLE_MODERN_COLORS: ColorPalette = {
  primary: {
    name: 'Primary',
    hex: '#6750A4',
    rgb: 'rgb(103, 80, 164)',
    usage: 'Primary brand color, key actions, important UI elements',
    accessibility: 'WCAG AA compliant with white text',
    tones: {
      0: '#000000',
      10: '#21005D',
      20: '#381E72',
      30: '#4F378B',
      40: '#6750A4',
      50: '#7F67BE',
      60: '#9A82DB',
      70: '#B69DF8',
      80: '#D0BCFF',
      90: '#EADDFF',
      95: '#F6EDFF',
      99: '#FFFBFE',
      100: '#FFFFFF'
    }
  },
  secondary: {
    name: 'Secondary',
    hex: '#625B71',
    rgb: 'rgb(98, 91, 113)',
    usage: 'Secondary actions, less prominent UI elements',
    accessibility: 'WCAG AA compliant',
    tones: {
      0: '#000000',
      10: '#1D192B',
      20: '#332D41',
      30: '#4A4458',
      40: '#625B71',
      50: '#7A7289',
      60: '#958DA5',
      70: '#B0A7C0',
      80: '#CCC2DC',
      90: '#E8DEF8',
      95: '#F6EDFF',
      99: '#FFFBFE',
      100: '#FFFFFF'
    }
  },
  tertiary: {
    name: 'Tertiary',
    hex: '#7D5260',
    rgb: 'rgb(125, 82, 96)',
    usage: 'Accent color, highlights, contrasting elements',
    accessibility: 'WCAG AA compliant',
    tones: {
      0: '#000000',
      10: '#31111D',
      20: '#492532',
      30: '#633B48',
      40: '#7D5260',
      50: '#986977',
      60: '#B58392',
      70: '#D29DAC',
      80: '#EFB8C8',
      90: '#FFD8E4',
      95: '#FFECF1',
      99: '#FFFBFA',
      100: '#FFFFFF'
    }
  },
  error: {
    name: 'Error',
    hex: '#B3261E',
    rgb: 'rgb(179, 38, 30)',
    usage: 'Error states, destructive actions, warnings',
    accessibility: 'WCAG AA compliant with white text'
  },
  neutral: {
    name: 'Neutral',
    hex: '#79747E',
    rgb: 'rgb(121, 116, 126)',
    usage: 'Backgrounds, surfaces, outlines',
    accessibility: 'WCAG AA compliant'
  },
  neutralVariant: {
    name: 'Neutral Variant',
    hex: '#79747E',
    rgb: 'rgb(121, 116, 126)',
    usage: 'Medium emphasis backgrounds, subtle outlines',
    accessibility: 'WCAG AA compliant'
  }
};

// ============================================================================
// Typography - Google Sans & Roboto
// ============================================================================

const GOOGLE_MODERN_TYPOGRAPHY: TypographyRules = {
  fontFamilies: {
    primary: "'Google Sans', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    secondary: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    monospace: "'Roboto Mono', 'Courier New', monospace"
  },
  typeScale: {
    displayLarge: {
      fontSize: '57px',
      lineHeight: '64px',
      fontWeight: 400,
      letterSpacing: '-0.25px',
      usage: 'Largest display text, hero sections'
    },
    displayMedium: {
      fontSize: '45px',
      lineHeight: '52px',
      fontWeight: 400,
      letterSpacing: '0px',
      usage: 'Large display text'
    },
    displaySmall: {
      fontSize: '36px',
      lineHeight: '44px',
      fontWeight: 400,
      letterSpacing: '0px',
      usage: 'Small display text'
    },
    headlineLarge: {
      fontSize: '32px',
      lineHeight: '40px',
      fontWeight: 400,
      letterSpacing: '0px',
      usage: 'Large headlines'
    },
    headlineMedium: {
      fontSize: '28px',
      lineHeight: '36px',
      fontWeight: 400,
      letterSpacing: '0px',
      usage: 'Medium headlines'
    },
    headlineSmall: {
      fontSize: '24px',
      lineHeight: '32px',
      fontWeight: 400,
      letterSpacing: '0px',
      usage: 'Small headlines'
    },
    titleLarge: {
      fontSize: '22px',
      lineHeight: '28px',
      fontWeight: 400,
      letterSpacing: '0px',
      usage: 'Large titles'
    },
    titleMedium: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 500,
      letterSpacing: '0.15px',
      usage: 'Medium titles, card headers'
    },
    titleSmall: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 500,
      letterSpacing: '0.1px',
      usage: 'Small titles'
    },
    bodyLarge: {
      fontSize: '16px',
      lineHeight: '24px',
      fontWeight: 400,
      letterSpacing: '0.5px',
      usage: 'Large body text'
    },
    bodyMedium: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 400,
      letterSpacing: '0.25px',
      usage: 'Default body text'
    },
    bodySmall: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
      letterSpacing: '0.4px',
      usage: 'Small body text, captions'
    },
    labelLarge: {
      fontSize: '14px',
      lineHeight: '20px',
      fontWeight: 500,
      letterSpacing: '0.1px',
      usage: 'Large labels, buttons'
    },
    labelMedium: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 500,
      letterSpacing: '0.5px',
      usage: 'Medium labels'
    },
    labelSmall: {
      fontSize: '11px',
      lineHeight: '16px',
      fontWeight: 500,
      letterSpacing: '0.5px',
      usage: 'Small labels'
    }
  },
  guidelines: [
    'Use Google Sans for display and headlines',
    'Use Roboto for body text and UI elements',
    'Maintain consistent type scale across application',
    'Ensure minimum 16px font size for body text',
    'Use font weights: 400 (regular), 500 (medium), 700 (bold)',
    'Apply appropriate letter spacing for readability'
  ]
};


// ============================================================================
// Layout System - Responsive Grid
// ============================================================================

const GOOGLE_MODERN_LAYOUT: LayoutSystem = {
  grid: {
    columns: 12,
    gutter: '16px',
    margin: '16px',
    breakpoints: {
      compact: '0-599px',
      medium: '600-839px',
      expanded: '840-1199px',
      large: '1200-1599px',
      extraLarge: '1600px+'
    }
  },
  spacing: {
    unit: 4,
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128],
    guidelines: [
      'Use 4px base unit for all spacing',
      'Apply consistent spacing scale',
      'Use larger spacing for visual hierarchy',
      'Maintain breathing room around interactive elements'
    ]
  },
  containerWidths: {
    compact: '100%',
    medium: '840px',
    expanded: '1200px',
    large: '1600px'
  },
  guidelines: [
    'Use 12-column grid for flexible layouts',
    'Apply responsive breakpoints for different screen sizes',
    'Maintain consistent spacing using 4px base unit',
    'Use container widths for content readability',
    'Apply adaptive layouts for different form factors'
  ]
};

// ============================================================================
// Motion System - Springy, Expressive Animations
// ============================================================================

const GOOGLE_MODERN_MOTION: MotionSystem = {
  durations: {
    short1: '50ms',
    short2: '100ms',
    short3: '150ms',
    short4: '200ms',
    medium1: '250ms',
    medium2: '300ms',
    medium3: '350ms',
    medium4: '400ms',
    long1: '450ms',
    long2: '500ms',
    long3: '550ms',
    long4: '600ms',
    extraLong1: '700ms',
    extraLong2: '800ms',
    extraLong3: '900ms',
    extraLong4: '1000ms'
  },
  easings: {
    standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    standardAccelerate: 'cubic-bezier(0.3, 0.0, 1, 1)',
    standardDecelerate: 'cubic-bezier(0, 0.0, 0, 1)',
    emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
    emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
    emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
    legacy: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    legacyAccelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    legacyDecelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)'
  },
  patterns: {
    fadeIn: {
      duration: '300ms',
      easing: 'emphasizedDecelerate',
      properties: ['opacity']
    },
    fadeOut: {
      duration: '200ms',
      easing: 'emphasizedAccelerate',
      properties: ['opacity']
    },
    scaleUp: {
      duration: '300ms',
      easing: 'emphasizedDecelerate',
      properties: ['transform', 'opacity']
    },
    scaleDown: {
      duration: '200ms',
      easing: 'emphasizedAccelerate',
      properties: ['transform', 'opacity']
    },
    slideIn: {
      duration: '400ms',
      easing: 'emphasizedDecelerate',
      properties: ['transform']
    },
    slideOut: {
      duration: '300ms',
      easing: 'emphasizedAccelerate',
      properties: ['transform']
    }
  },
  guidelines: [
    'Use emphasized easing for important transitions',
    'Apply standard easing for common UI interactions',
    'Keep durations short for micro-interactions (50-200ms)',
    'Use medium durations for component transitions (250-400ms)',
    'Apply long durations for page transitions (450-600ms)',
    'Ensure animations are smooth and natural',
    'Provide reduced motion alternatives for accessibility'
  ]
};

// ============================================================================
// Elevation System - Subtle Shadows
// ============================================================================

const GOOGLE_MODERN_ELEVATION: ElevationSystem = {
  levels: {
    level0: {
      shadow: 'none',
      usage: 'No elevation, flat surface'
    },
    level1: {
      shadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
      usage: 'Minimal elevation, cards at rest'
    },
    level2: {
      shadow: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
      usage: 'Low elevation, raised cards'
    },
    level3: {
      shadow: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
      usage: 'Medium elevation, dialogs, menus'
    },
    level4: {
      shadow: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
      usage: 'High elevation, navigation drawer'
    },
    level5: {
      shadow: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
      usage: 'Highest elevation, modal dialogs'
    }
  },
  guidelines: [
    'Use elevation to establish visual hierarchy',
    'Apply consistent elevation levels across similar components',
    'Increase elevation for interactive states (hover, focus)',
    'Use level 0-1 for most surfaces',
    'Reserve level 3-5 for overlays and modals',
    'Ensure shadows are subtle and natural'
  ]
};

// ============================================================================
// Component Library - Material 3 Components
// ============================================================================

const GOOGLE_MODERN_COMPONENTS: ComponentLibrary = {
  buttons: {
    variants: [
      'filled',
      'outlined',
      'text',
      'elevated',
      'tonal'
    ],
    states: [
      'enabled',
      'disabled',
      'hovered',
      'focused',
      'pressed'
    ],
    sizes: [
      'small',
      'medium',
      'large'
    ],
    examples: [
      'Filled button: Primary actions with solid background',
      'Outlined button: Secondary actions with border',
      'Text button: Low-emphasis actions without background',
      'Elevated button: Raised appearance with shadow',
      'Tonal button: Medium-emphasis with tinted background'
    ]
  },
  inputs: {
    variants: [
      'filled',
      'outlined'
    ],
    states: [
      'enabled',
      'disabled',
      'error',
      'focused',
      'populated'
    ],
    sizes: [
      'small',
      'medium',
      'large'
    ],
    examples: [
      'Filled text field: Default input with filled background',
      'Outlined text field: Input with border outline',
      'Text area: Multi-line input field',
      'Select dropdown: Single or multi-select options',
      'Checkbox: Binary selection control',
      'Radio button: Single selection from group',
      'Switch: Toggle between two states'
    ]
  },
  cards: {
    variants: [
      'elevated',
      'filled',
      'outlined'
    ],
    states: [
      'enabled',
      'disabled',
      'hovered',
      'pressed',
      'dragged'
    ],
    sizes: [
      'compact',
      'medium',
      'expanded'
    ],
    examples: [
      'Elevated card: Card with shadow elevation',
      'Filled card: Card with tinted background',
      'Outlined card: Card with border outline',
      'Interactive card: Clickable card with hover state',
      'Media card: Card with image or video content'
    ]
  },
  navigation: {
    variants: [
      'navigation-bar',
      'navigation-drawer',
      'navigation-rail',
      'top-app-bar',
      'bottom-app-bar',
      'tabs'
    ],
    states: [
      'active',
      'inactive',
      'selected',
      'hovered',
      'focused'
    ],
    sizes: [
      'compact',
      'medium',
      'expanded'
    ],
    examples: [
      'Navigation bar: Bottom navigation for mobile',
      'Navigation drawer: Side navigation panel',
      'Navigation rail: Compact side navigation',
      'Top app bar: Header with title and actions',
      'Bottom app bar: Footer with actions',
      'Tabs: Horizontal navigation between views'
    ]
  }
};

// ============================================================================
// Google Modern Style Export
// ============================================================================

export const GOOGLE_MODERN: VendorStyle = {
  vendor: 'google',
  name: 'Material 3 Expressive',
  version: '3.0',
  characteristics: [
    'Dynamic color theming with tonal palettes',
    'Rounded corners (8px-24px radius)',
    'Springy, expressive motion with emphasized easing',
    'High accessibility standards (WCAG 2.1 AA+)',
    'Personalized and adaptive design',
    'Subtle elevation with layered shadows',
    'Google Sans and Roboto typography',
    'Responsive 12-column grid system',
    'Component-based architecture',
    'Support for light and dark themes',
    'Emphasis on user expression and customization'
  ],
  colorPalette: GOOGLE_MODERN_COLORS,
  typography: GOOGLE_MODERN_TYPOGRAPHY,
  layout: GOOGLE_MODERN_LAYOUT,
  motion: GOOGLE_MODERN_MOTION,
  elevation: GOOGLE_MODERN_ELEVATION,
  components: GOOGLE_MODERN_COMPONENTS
};

// ============================================================================
// Usage Guidelines
// ============================================================================

/**
 * USAGE GUIDELINES FOR AI AGENTS
 *
 * When applying Google Modern (Material 3 Expressive) design:
 *
 * 1. COLOR THEMING
 *    - Use dynamic color system with tonal palettes
 *    - Apply primary color for key actions and branding
 *    - Use secondary and tertiary for supporting elements
 *    - Ensure WCAG AA compliance for all color combinations
 *    - Support both light and dark themes
 *
 * 2. TYPOGRAPHY
 *    - Use Google Sans for display and headlines
 *    - Use Roboto for body text and UI elements
 *    - Follow type scale for consistent hierarchy
 *    - Maintain minimum 16px for body text
 *    - Apply appropriate letter spacing
 *
 * 3. LAYOUT
 *    - Use 12-column responsive grid
 *    - Apply 4px base spacing unit
 *    - Use breakpoints for responsive design
 *    - Maintain consistent spacing scale
 *
 * 4. MOTION
 *    - Use emphasized easing for important transitions
 *    - Keep micro-interactions short (50-200ms)
 *    - Apply medium durations for components (250-400ms)
 *    - Provide reduced motion alternatives
 *
 * 5. ELEVATION
 *    - Use subtle shadows for depth
 *    - Apply consistent elevation levels
 *    - Increase elevation for interactive states
 *    - Reserve high elevation for modals
 *
 * 6. COMPONENTS
 *    - Use Material 3 component variants
 *    - Apply appropriate states (hover, focus, pressed)
 *    - Maintain consistent sizing
 *    - Follow accessibility guidelines
 *
 * 7. ACCESSIBILITY
 *    - Ensure WCAG 2.1 AA compliance minimum
 *    - Provide sufficient color contrast
 *    - Support keyboard navigation
 *    - Include ARIA labels and roles
 *    - Provide reduced motion alternatives
 *    - Ensure touch targets are at least 48x48px
 *
 * REFERENCES:
 * - Material Design 3: https://m3.material.io/
 * - Color System: https://m3.material.io/styles/color/overview
 * - Typography: https://m3.material.io/styles/typography/overview
 * - Motion: https://m3.material.io/styles/motion/overview
 * - Components: https://m3.material.io/components
 */


