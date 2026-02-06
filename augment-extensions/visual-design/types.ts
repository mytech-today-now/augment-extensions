/**
 * TypeScript Interface Definitions for Visual Design Module
 * 
 * Defines core types for design elements, principles, and vendor-specific styles
 */

// ============================================================================
// Core Design Interfaces
// ============================================================================

export interface DesignModule {
  name: string;
  version: string;
  description: string;
  elements: DesignElement[];
  principles: DesignPrinciple[];
  skills: SkillCategory[];
  vendorPriority: string[];
}

export interface DesignElement {
  name: string;
  description: string;
  properties: Record<string, any>;
}

export interface DesignPrinciple {
  name: string;
  description: string;
  guidelines: string[];
}

export interface SkillCategory {
  name: string;
  description: string;
  skills: string[];
}

// ============================================================================
// Color System
// ============================================================================

export interface ColorPalette {
  primary: ColorDefinition;
  secondary?: ColorDefinition;
  accent?: ColorDefinition;
  neutral: ColorDefinition[];
  semantic: SemanticColors;
  accessibility: AccessibilityRequirements;
}

export interface ColorDefinition {
  name: string;
  hex: string;
  rgb: RGB;
  hsl: HSL;
  variants?: ColorVariant[];
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ColorVariant {
  name: string;
  hex: string;
  usage: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface AccessibilityRequirements {
  minContrastRatio: number;
  wcagLevel: 'A' | 'AA' | 'AAA';
  colorBlindSafe: boolean;
}

// ============================================================================
// Typography System
// ============================================================================

export interface TypographyRules {
  fontFamilies: FontFamily[];
  typeScale: TypeScale;
  hierarchy: TypographyHierarchy;
  lineHeight: LineHeightRules;
  letterSpacing: LetterSpacingRules;
}

export interface FontFamily {
  name: string;
  fallbacks: string[];
  weights: number[];
  styles: ('normal' | 'italic')[];
  usage: string;
}

export interface TypeScale {
  base: number;
  ratio: number;
  sizes: Record<string, number>;
}

export interface TypographyHierarchy {
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  h4: TypographyStyle;
  h5: TypographyStyle;
  h6: TypographyStyle;
  body: TypographyStyle;
  caption: TypographyStyle;
}

export interface TypographyStyle {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export interface LineHeightRules {
  tight: number;
  normal: number;
  relaxed: number;
}

export interface LetterSpacingRules {
  tight: string;
  normal: string;
  wide: string;
}

// ============================================================================
// Layout System
// ============================================================================

export interface LayoutSystem {
  grid: GridSystem;
  spacing: SpacingSystem;
  breakpoints: Breakpoints;
  containers: ContainerRules;
}

export interface GridSystem {
  columns: number;
  gutter: string;
  margin: string;
  maxWidth?: string;
}

export interface SpacingSystem {
  base: number;
  scale: number[];
  tokens: Record<string, string>;
}

export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl?: string;
}

export interface ContainerRules {
  maxWidth: Record<string, string>;
  padding: Record<string, string>;
}

// ============================================================================
// Motion & Animation
// ============================================================================

export interface MotionSystem {
  durations: DurationTokens;
  easings: EasingTokens;
  animations: AnimationPreset[];
}

export interface DurationTokens {
  instant: string;
  fast: string;
  normal: string;
  slow: string;
}

export interface EasingTokens {
  linear: string;
  easeIn: string;
  easeOut: string;
  easeInOut: string;
  spring?: string;
}

export interface AnimationPreset {
  name: string;
  duration: string;
  easing: string;
  properties: string[];
}

// ============================================================================
// Elevation & Shadows
// ============================================================================

export interface ElevationSystem {
  levels: ElevationLevel[];
  shadows: ShadowTokens;
}

export interface ElevationLevel {
  level: number;
  shadow: string;
  usage: string;
}

export interface ShadowTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

// ============================================================================
// Vendor-Specific Styles
// ============================================================================

export interface VendorStyle {
  vendor: 'google' | 'microsoft' | 'amazon';
  name: string;
  version: string;
  characteristics: string[];
  colorPalette: ColorPalette;
  typography: TypographyRules;
  layout: LayoutSystem;
  motion: MotionSystem;
  elevation: ElevationSystem;
  components?: ComponentLibrary;
}

export interface ComponentLibrary {
  buttons: ComponentSpec;
  inputs: ComponentSpec;
  cards: ComponentSpec;
  navigation: ComponentSpec;
}

export interface ComponentSpec {
  variants: string[];
  states: string[];
  sizes: string[];
  examples: string[];
}

// ============================================================================
// Domain-Specific Styles
// ============================================================================

export interface DomainStyle {
  domain: string;
  era?: string;
  characteristics: string[];
  colorScheme: ColorPalette;
  typography: TypographyRules;
  layout: LayoutSystem;
  examples: string[];
}

// ============================================================================
// Style Selector
// ============================================================================

export interface StyleSelector {
  vendorPriority: string[];
  fallbackChain: string[];
  selectStyle(preferences?: StylePreferences): VendorStyle | DomainStyle;
}

export interface StylePreferences {
  vendor?: string;
  domain?: string;
  era?: string;
  accessibility?: 'A' | 'AA' | 'AAA';
}

