/**
 * Amazon Cloudscape Design System
 *
 * Cloudscape (2020-present) is Amazon's open-source design system for building
 * intuitive, efficient, and accessible web applications. Originally developed for
 * AWS Console, it emphasizes enterprise dashboards, data-dense interfaces, and
 * component-heavy patterns with Amazon Ember typography.
 *
 * Key characteristics:
 * - Enterprise-focused: Optimized for complex, data-rich applications
 * - Component-heavy: Extensive library of pre-built UI components
 * - Accessibility-first: WCAG 2.1 Level AA compliance built-in
 * - Responsive: Mobile-first approach with adaptive layouts
 * - Dark mode: Full support for light and dark themes
 *
 * References:
 * - Cloudscape Design System Documentation: https://cloudscape.design/
 * - AWS Design Language: https://aws.amazon.com/design/
 * - Amazon Ember Font: https://developer.amazon.com/en-US/alexa/branding/echo-guidelines/identity-guidelines/typography
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
// Color System - Cloudscape Design Tokens
// ============================================================================

const AMAZON_CLOUDSCAPE_COLORS: ColorPalette = {
  primary: {
    name: 'Primary Blue',
    hex: '#0972D3',
    rgb: { r: 9, g: 114, b: 211 },
    hsl: { h: 209, s: 92, l: 43 },
    variants: [
      { name: 'Blue 900', hex: '#033160', usage: 'Darkest blue, pressed states' },
      { name: 'Blue 800', hex: '#05467E', usage: 'Dark blue, hover states' },
      { name: 'Blue 700', hex: '#0762A8', usage: 'Primary dark' },
      { name: 'Blue 600', hex: '#0972D3', usage: 'Primary brand color' },
      { name: 'Blue 500', hex: '#2E8DE0', usage: 'Primary light' },
      { name: 'Blue 400', hex: '#539FE5', usage: 'Hover backgrounds' },
      { name: 'Blue 300', hex: '#7AAFEB', usage: 'Light accents' },
      { name: 'Blue 200', hex: '#A1C4F0', usage: 'Very light backgrounds' },
      { name: 'Blue 100', hex: '#C8DAF5', usage: 'Subtle highlights' },
      { name: 'Blue 50', hex: '#EFF4FA', usage: 'Lightest blue' }
    ]
  },
  secondary: {
    name: 'Grey Neutral',
    hex: '#5F6B7A',
    rgb: { r: 95, g: 107, b: 122 },
    hsl: { h: 213, s: 12, l: 43 },
    variants: [
      { name: 'Grey 900', hex: '#16191F', usage: 'Text primary (dark mode)' },
      { name: 'Grey 800', hex: '#2A2E33', usage: 'Text secondary (dark mode)' },
      { name: 'Grey 700', hex: '#414750', usage: 'Borders (dark mode)' },
      { name: 'Grey 600', hex: '#5F6B7A', usage: 'Text tertiary' },
      { name: 'Grey 550', hex: '#7D8998', usage: 'Disabled text' },
      { name: 'Grey 500', hex: '#9BA7B6', usage: 'Placeholder text' },
      { name: 'Grey 450', hex: '#AAB7C3', usage: 'Dividers' },
      { name: 'Grey 400', hex: '#C1C9D2', usage: 'Borders' },
      { name: 'Grey 300', hex: '#D5DBDF', usage: 'Light borders' },
      { name: 'Grey 200', hex: '#E9EBED', usage: 'Background secondary' },
      { name: 'Grey 150', hex: '#F2F3F3', usage: 'Background tertiary' },
      { name: 'Grey 100', hex: '#FAFAFA', usage: 'Background primary' }
    ]
  },
  neutral: [
    { name: 'White', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 }, hsl: { h: 0, s: 0, l: 100 } },
    { name: 'Grey 100', hex: '#FAFAFA', rgb: { r: 250, g: 250, b: 250 }, hsl: { h: 0, s: 0, l: 98 } },
    { name: 'Grey 150', hex: '#F2F3F3', rgb: { r: 242, g: 243, b: 243 }, hsl: { h: 180, s: 2, l: 95 } },
    { name: 'Grey 200', hex: '#E9EBED', rgb: { r: 233, g: 235, b: 237 }, hsl: { h: 210, s: 7, l: 92 } },
    { name: 'Grey 300', hex: '#D5DBDF', rgb: { r: 213, g: 219, b: 223 }, hsl: { h: 204, s: 11, l: 85 } },
    { name: 'Grey 400', hex: '#C1C9D2', rgb: { r: 193, g: 201, b: 210 }, hsl: { h: 212, s: 14, l: 79 } },
    { name: 'Grey 500', hex: '#9BA7B6', rgb: { r: 155, g: 167, b: 182 }, hsl: { h: 213, s: 15, l: 66 } },
    { name: 'Grey 600', hex: '#5F6B7A', rgb: { r: 95, g: 107, b: 122 }, hsl: { h: 213, s: 12, l: 43 } },
    { name: 'Grey 700', hex: '#414750', rgb: { r: 65, g: 71, b: 80 }, hsl: { h: 216, s: 10, l: 28 } },
    { name: 'Grey 800', hex: '#2A2E33', rgb: { r: 42, g: 46, b: 51 }, hsl: { h: 213, s: 10, l: 18 } },
    { name: 'Grey 900', hex: '#16191F', rgb: { r: 22, g: 25, b: 31 }, hsl: { h: 220, s: 17, l: 10 } },
    { name: 'Black', hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } }
  ],
  semantic: {
    success: '#037F0C',
    warning: '#8D6605',
    error: '#D91515',
    info: '#0972D3'
  },
  accessibility: {
    minContrastRatio: 4.5,
    wcagLevel: 'AA',
    colorBlindSafe: true
  }
};

// ============================================================================
// Typography System - Amazon Ember
// ============================================================================

const AMAZON_CLOUDSCAPE_TYPOGRAPHY: TypographyRules = {
  fontFamilies: [
    {
      name: 'Amazon Ember',
      fallbacks: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      weights: [300, 400, 500, 700],
      styles: ['normal', 'italic'],
      usage: 'Primary font for all UI elements, optimized for readability in data-dense interfaces'
    },
    {
      name: 'Amazon Ember Mono',
      fallbacks: ['Monaco', 'Menlo', 'Consolas', 'Courier New', 'monospace'],
      weights: [400, 700],
      styles: ['normal'],
      usage: 'Code snippets, technical data, API responses'
    }
  ],
  typeScale: {
    base: 14,
    ratio: 1.125,
    sizes: {
      'display-large': 48,
      'display': 36,
      'heading-xl': 28,
      'heading-l': 24,
      'heading-m': 20,
      'heading-s': 18,
      'heading-xs': 16,
      'body-l': 16,
      'body-m': 14,
      'body-s': 12
    }
  },
  hierarchy: {
    h1: {
      fontSize: '28px',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em'
    },
    h2: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.005em'
    },
    h3: {
      fontSize: '20px',
      fontWeight: 700,
      lineHeight: 1.4
    },
    h4: {
      fontSize: '18px',
      fontWeight: 700,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '16px',
      fontWeight: 700,
      lineHeight: 1.5
    },
    h6: {
      fontSize: '14px',
      fontWeight: 700,
      lineHeight: 1.5,
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    body: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5
    },
    caption: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.5
    }
  },
  lineHeight: {
    tight: 1.3,
    normal: 1.5,
    relaxed: 1.7
  },
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.05em'
  }
};


// ============================================================================
// Layout System - Responsive Grid
// ============================================================================

const AMAZON_CLOUDSCAPE_LAYOUT: LayoutSystem = {
  grid: {
    columns: 12,
    gutter: '20px',
    margin: '20px',
    maxWidth: '1600px'
  },
  spacing: {
    base: 4,
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80],
    tokens: {
      'xxxs': '4px',
      'xxs': '8px',
      'xs': '12px',
      's': '16px',
      'm': '20px',
      'l': '24px',
      'xl': '32px',
      'xxl': '40px',
      'xxxl': '48px'
    }
  },
  breakpoints: {
    xs: '0px',
    sm: '688px',
    md: '1120px',
    lg: '1440px',
    xl: '1920px'
  },
  containers: {
    maxWidth: {
      xs: '100%',
      sm: '688px',
      md: '1120px',
      lg: '1440px',
      xl: '1600px'
    },
    padding: {
      xs: '20px',
      sm: '20px',
      md: '40px',
      lg: '40px',
      xl: '40px'
    }
  }
};

// ============================================================================
// Motion System - Subtle Animations
// ============================================================================

const AMAZON_CLOUDSCAPE_MOTION: MotionSystem = {
  durations: {
    instant: '0ms',
    fast: '100ms',
    normal: '200ms',
    slow: '300ms'
  },
  easings: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  animations: [
    {
      name: 'fade-in',
      duration: '200ms',
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
      properties: ['opacity']
    },
    {
      name: 'slide-down',
      duration: '200ms',
      easing: 'cubic-bezier(0, 0, 0.2, 1)',
      properties: ['transform', 'opacity']
    },
    {
      name: 'expand',
      duration: '300ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      properties: ['height', 'opacity']
    }
  ]
};

// ============================================================================
// Elevation System - Subtle Shadows
// ============================================================================

const AMAZON_CLOUDSCAPE_ELEVATION: ElevationSystem = {
  levels: [
    {
      level: 0,
      shadow: 'none',
      usage: 'Flat surfaces, no elevation'
    },
    {
      level: 1,
      shadow: '0 1px 1px 0 rgba(0, 28, 36, 0.3), 1px 1px 1px 0 rgba(0, 28, 36, 0.15), -1px 1px 1px 0 rgba(0, 28, 36, 0.15)',
      usage: 'Cards, containers, raised surfaces'
    },
    {
      level: 2,
      shadow: '0 4px 8px 0 rgba(0, 28, 36, 0.1), 0 1px 1px 0 rgba(0, 28, 36, 0.3)',
      usage: 'Dropdowns, popovers, tooltips'
    },
    {
      level: 3,
      shadow: '0 8px 16px 0 rgba(0, 28, 36, 0.15), 0 2px 4px 0 rgba(0, 28, 36, 0.3)',
      usage: 'Modals, dialogs, overlays'
    },
    {
      level: 4,
      shadow: '0 16px 24px 0 rgba(0, 28, 36, 0.2), 0 4px 8px 0 rgba(0, 28, 36, 0.3)',
      usage: 'Sticky headers, floating action buttons'
    }
  ],
  shadows: {
    none: 'none',
    sm: '0 1px 1px 0 rgba(0, 28, 36, 0.3)',
    md: '0 4px 8px 0 rgba(0, 28, 36, 0.1)',
    lg: '0 8px 16px 0 rgba(0, 28, 36, 0.15)',
    xl: '0 16px 24px 0 rgba(0, 28, 36, 0.2)'
  }
};

// ============================================================================
// Component Library - Enterprise UI Components
// ============================================================================

const AMAZON_CLOUDSCAPE_COMPONENTS: ComponentLibrary = {
  buttons: {
    variants: ['primary', 'normal', 'link', 'icon'],
    states: ['default', 'hover', 'active', 'disabled', 'loading'],
    sizes: ['small', 'normal'],
    examples: [
      'Primary button for main actions',
      'Normal button for secondary actions',
      'Link button for tertiary actions',
      'Icon button for compact interfaces'
    ]
  },
  inputs: {
    variants: ['text', 'textarea', 'select', 'multiselect', 'autosuggest', 'date-picker', 'time-input'],
    states: ['default', 'focus', 'error', 'warning', 'disabled', 'readonly'],
    sizes: ['small', 'normal'],
    examples: [
      'Form input with validation',
      'Autosuggest for search',
      'Date picker for scheduling',
      'Multiselect for filters'
    ]
  },
  cards: {
    variants: ['container', 'expandable-section', 'tiles', 'cards'],
    states: ['default', 'selected', 'disabled'],
    sizes: ['default'],
    examples: [
      'Container for grouping content',
      'Expandable section for progressive disclosure',
      'Tiles for grid layouts',
      'Cards for dashboard widgets'
    ]
  },
  navigation: {
    variants: ['top-navigation', 'side-navigation', 'breadcrumb', 'pagination', 'tabs'],
    states: ['default', 'active', 'disabled'],
    sizes: ['default'],
    examples: [
      'Top navigation for global navigation',
      'Side navigation for hierarchical navigation',
      'Breadcrumb for location awareness',
      'Pagination for large datasets',
      'Tabs for content organization'
    ]
  }
};

// ============================================================================
// Amazon Cloudscape Style Export
// ============================================================================

export const AMAZON_CLOUDSCAPE: VendorStyle = {
  vendor: 'amazon',
  name: 'Cloudscape Design System',
  version: '3.0',
  characteristics: [
    'Enterprise-focused design for complex applications',
    'Component-heavy architecture with extensive pre-built UI library',
    'Data-dense interfaces optimized for dashboards and analytics',
    'Amazon Ember typography for brand consistency',
    'WCAG 2.1 Level AA accessibility compliance built-in',
    'Full dark mode support with adaptive color tokens',
    'Responsive design with mobile-first approach',
    'Subtle animations and transitions for professional feel',
    'Comprehensive form components with validation states',
    'Advanced data visualization components (tables, charts, graphs)',
    'Optimized for AWS Console and enterprise web applications',
    'Consistent spacing system based on 4px grid',
    'Extensive documentation and code examples',
    'Open-source and actively maintained by Amazon',
    'Cross-browser compatibility and performance optimization'
  ],
  colorPalette: AMAZON_CLOUDSCAPE_COLORS,
  typography: AMAZON_CLOUDSCAPE_TYPOGRAPHY,
  layout: AMAZON_CLOUDSCAPE_LAYOUT,
  motion: AMAZON_CLOUDSCAPE_MOTION,
  elevation: AMAZON_CLOUDSCAPE_ELEVATION,
  components: AMAZON_CLOUDSCAPE_COMPONENTS
};

// ============================================================================
// Design Patterns & Best Practices
// ============================================================================

/**
 * Cloudscape Design Patterns
 *
 * Common patterns used in Cloudscape applications:
 *
 * 1. Dashboard Layout
 *    - Top navigation with breadcrumbs
 *    - Side navigation for hierarchical content
 *    - Main content area with cards/containers
 *    - Responsive grid for widgets
 *
 * 2. Data Tables
 *    - Sortable columns with clear indicators
 *    - Filterable data with inline filters
 *    - Pagination for large datasets
 *    - Row selection with checkboxes
 *    - Expandable rows for details
 *
 * 3. Forms
 *    - Clear labels and help text
 *    - Inline validation with error messages
 *    - Progressive disclosure for complex forms
 *    - Form sections with expandable containers
 *    - Action buttons aligned to the right
 *
 * 4. Modals & Dialogs
 *    - Clear title and close button
 *    - Scrollable content area
 *    - Footer with action buttons
 *    - Overlay with backdrop
 *    - Focus management for accessibility
 *
 * 5. Notifications
 *    - Flash messages for temporary feedback
 *    - Alert banners for important information
 *    - Toast notifications for background actions
 *    - Status indicators for system state
 */

/**
 * Accessibility Guidelines
 *
 * Cloudscape enforces WCAG 2.1 Level AA compliance:
 *
 * - Color contrast: Minimum 4.5:1 for text, 3:1 for UI components
 * - Keyboard navigation: All interactive elements accessible via keyboard
 * - Screen reader support: Semantic HTML and ARIA labels
 * - Focus indicators: Clear visual focus states
 * - Responsive text: Supports browser zoom up to 200%
 * - Motion preferences: Respects prefers-reduced-motion
 * - Touch targets: Minimum 44x44px for mobile
 */

/**
 * Component Usage Examples
 *
 * Button:
 * ```tsx
 * <Button variant="primary" onClick={handleClick}>
 *   Save changes
 * </Button>
 * ```
 *
 * Input:
 * ```tsx
 * <FormField label="Email" description="Enter your email address">
 *   <Input
 *     value={email}
 *     onChange={({ detail }) => setEmail(detail.value)}
 *     type="email"
 *   />
 * </FormField>
 * ```
 *
 * Table:
 * ```tsx
 * <Table
 *   columnDefinitions={columns}
 *   items={data}
 *   sortingColumn={sortingColumn}
 *   onSortingChange={handleSortingChange}
 *   pagination={<Pagination currentPageIndex={1} pagesCount={10} />}
 * />
 * ```
 */

export default AMAZON_CLOUDSCAPE;


