/**
 * Visual Design Core Module
 * 
 * Defines the 8 core design elements, 11 design principles, and 5 skill categories
 * that form the foundation of visual design knowledge for AI agents.
 */

import {
  DesignModule,
  DesignElement,
  DesignPrinciple,
  SkillCategory
} from './types';

// ============================================================================
// 8 Core Design Elements
// ============================================================================

export const DESIGN_ELEMENTS: DesignElement[] = [
  {
    name: 'Color',
    description: 'Color palettes, contrast ratios, and accessibility considerations',
    properties: {
      aspects: [
        'Color theory (primary, secondary, tertiary)',
        'Color harmony (complementary, analogous, triadic)',
        'Contrast ratios (WCAG AA: 4.5:1 for text, AAA: 7:1)',
        'Color psychology and emotional impact',
        'Accessibility (color blindness, high contrast modes)',
        'Brand color consistency'
      ],
      tools: ['Color contrast checkers', 'Palette generators', 'Accessibility validators']
    }
  },
  {
    name: 'Typography',
    description: 'Font selection, hierarchy, readability, and text styling',
    properties: {
      aspects: [
        'Font families (serif, sans-serif, monospace, display)',
        'Type scale and hierarchy (h1-h6, body, caption)',
        'Line height (1.5 for body text, 1.2 for headings)',
        'Letter spacing and kerning',
        'Font weights (100-900)',
        'Responsive typography (fluid type scales)',
        'Web font loading strategies'
      ],
      tools: ['Google Fonts', 'Adobe Fonts', 'Type scale calculators']
    }
  },
  {
    name: 'Layout',
    description: 'Grid systems, alignment, spacing, and visual flow',
    properties: {
      aspects: [
        'Grid systems (12-column, 8-point grid)',
        'Flexbox and CSS Grid',
        'Alignment and distribution',
        'Visual hierarchy and flow',
        'Responsive layouts (mobile-first)',
        'Container widths and breakpoints',
        'Z-index and stacking contexts'
      ],
      tools: ['CSS Grid', 'Flexbox', 'Layout frameworks']
    }
  },
  {
    name: 'Imagery',
    description: 'Photos, illustrations, icons, and visual content',
    properties: {
      aspects: [
        'Image formats (WebP, AVIF, PNG, JPEG, SVG)',
        'Aspect ratios (16:9, 4:3, 1:1, golden ratio)',
        'Image optimization and compression',
        'Responsive images (srcset, picture element)',
        'Lazy loading strategies',
        'Alt text and accessibility',
        'Image composition and cropping'
      ],
      tools: ['Image optimizers', 'CDNs', 'Responsive image generators']
    }
  },
  {
    name: 'Iconography',
    description: 'Icon systems, sizes, styles, and consistency',
    properties: {
      aspects: [
        'Icon styles (outlined, filled, rounded, sharp)',
        'Icon sizes (16px, 24px, 32px, 48px)',
        'SVG vs icon fonts',
        'Icon accessibility (aria-label, role)',
        'Consistent visual language',
        'Icon grid and alignment',
        'Color and state variations'
      ],
      tools: ['Material Icons', 'Font Awesome', 'Heroicons', 'Lucide']
    }
  },
  {
    name: 'Spacing',
    description: 'Margins, padding, and rhythm systems',
    properties: {
      aspects: [
        '8-point grid system (multiples of 8px)',
        'Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)',
        'Vertical rhythm and baseline grid',
        'Component spacing consistency',
        'Responsive spacing (clamp, calc)',
        'Negative space and breathing room',
        'Optical alignment adjustments'
      ],
      tools: ['Spacing tokens', 'Design systems', 'CSS custom properties']
    }
  },
  {
    name: 'Motion',
    description: 'Animations, transitions, and micro-interactions',
    properties: {
      aspects: [
        'Animation durations (100ms instant, 200ms fast, 300ms normal, 500ms slow)',
        'Easing functions (ease-in, ease-out, ease-in-out, spring)',
        'Transition properties (opacity, transform, color)',
        'Micro-interactions (hover, focus, active states)',
        'Loading states and skeletons',
        'Page transitions and route animations',
        'Reduced motion preferences (prefers-reduced-motion)'
      ],
      tools: ['CSS animations', 'Framer Motion', 'GSAP', 'Lottie']
    }
  },
  {
    name: 'Elevation',
    description: 'Shadows, depth, and layering systems',
    properties: {
      aspects: [
        'Shadow levels (0-24 in Material Design)',
        'Box shadows vs drop shadows',
        'Layering and z-index hierarchy',
        'Depth perception and visual weight',
        'Elevation tokens (none, sm, md, lg, xl)',
        'Neumorphism and glassmorphism effects',
        'Dark mode shadow adjustments'
      ],
      tools: ['Shadow generators', 'Elevation systems', 'CSS filters']
    }
  }
];

// ============================================================================
// 11 Design Principles
// ============================================================================

export const DESIGN_PRINCIPLES: DesignPrinciple[] = [
  {
    name: 'Balance',
    description: 'Visual equilibrium through symmetrical or asymmetrical distribution of elements',
    guidelines: [
      'Symmetrical balance: Mirror elements across a central axis',
      'Asymmetrical balance: Different elements with equal visual weight',
      'Radial balance: Elements radiating from a central point',
      'Use visual weight (size, color, position) to create balance',
      'Balance negative and positive space'
    ]
  },
  {
    name: 'Contrast',
    description: 'Difference between elements to create visual interest and hierarchy',
    guidelines: [
      'Color contrast: Light vs dark, complementary colors',
      'Size contrast: Large vs small elements',
      'Shape contrast: Geometric vs organic forms',
      'Texture contrast: Smooth vs rough surfaces',
      'Ensure sufficient contrast for accessibility (WCAG AA: 4.5:1)',
      'Use contrast to guide attention and create focal points'
    ]
  },
  {
    name: 'Hierarchy',
    description: 'Organization of elements to show importance and guide user attention',
    guidelines: [
      'Size hierarchy: Larger elements appear more important',
      'Color hierarchy: Bright/saturated colors draw attention',
      'Position hierarchy: Top-left to bottom-right reading pattern',
      'Typography hierarchy: h1 > h2 > h3 > body > caption',
      'Use F-pattern or Z-pattern for content layout',
      'Limit hierarchy levels to 3-4 for clarity'
    ]
  },
  {
    name: 'Unity',
    description: 'Cohesion and consistency across all design elements',
    guidelines: [
      'Consistent color palette throughout design',
      'Unified typography system (2-3 font families max)',
      'Repeated visual patterns and motifs',
      'Consistent spacing and alignment',
      'Shared design language across components',
      'Brand consistency in all touchpoints'
    ]
  },
  {
    name: 'Emphasis',
    description: 'Creating focal points to draw attention to key elements',
    guidelines: [
      'Use size, color, or position to create emphasis',
      'Limit focal points to 1-2 per screen/section',
      'Contrast emphasized elements with surroundings',
      'Use whitespace to isolate important elements',
      'Apply visual weight through color saturation or boldness',
      'Guide user journey with strategic emphasis'
    ]
  },
  {
    name: 'Rhythm',
    description: 'Repetition and pattern to create visual flow and movement',
    guidelines: [
      'Regular rhythm: Consistent spacing and repetition',
      'Progressive rhythm: Gradual changes in size or spacing',
      'Flowing rhythm: Organic, curved patterns',
      'Use rhythm to guide eye movement',
      'Create visual interest through varied repetition',
      'Maintain rhythm in grid systems and layouts'
    ]
  },
  {
    name: 'Proportion',
    description: 'Relationship between element sizes and the overall composition',
    guidelines: [
      'Golden ratio (1.618) for harmonious proportions',
      'Rule of thirds for composition',
      'Scale elements relative to their importance',
      'Maintain aspect ratios for images and containers',
      'Use proportional spacing systems (8-point grid)',
      'Consider viewport proportions for responsive design'
    ]
  },
  {
    name: 'White Space',
    description: 'Negative space that provides breathing room and improves readability',
    guidelines: [
      'Micro white space: Between letters, lines, and small elements',
      'Macro white space: Between major sections and components',
      'Use white space to create visual hierarchy',
      'Increase white space for premium/luxury feel',
      'Reduce clutter by embracing emptiness',
      'White space is not wasted space—it enhances comprehension'
    ]
  },
  {
    name: 'Consistency',
    description: 'Uniformity in design patterns, behaviors, and visual language',
    guidelines: [
      'Consistent component styling across the application',
      'Predictable interaction patterns (buttons, links, forms)',
      'Unified color usage (primary for actions, red for errors)',
      'Consistent spacing and alignment rules',
      'Standardized iconography and imagery style',
      'Follow platform conventions (iOS, Android, Web)'
    ]
  },
  {
    name: 'Accessibility',
    description: 'Designing for all users, including those with disabilities',
    guidelines: [
      'WCAG 2.1 Level AA compliance minimum',
      'Color contrast ratios: 4.5:1 for text, 3:1 for UI components',
      'Keyboard navigation support (tab order, focus states)',
      'Screen reader compatibility (semantic HTML, ARIA labels)',
      'Responsive text sizing (rem units, no fixed px)',
      'Support for reduced motion preferences',
      'Touch targets minimum 44x44px (iOS) or 48x48px (Android)'
    ]
  },
  {
    name: 'Responsiveness',
    description: 'Adapting design to different screen sizes and devices',
    guidelines: [
      'Mobile-first approach (design for smallest screen first)',
      'Breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop), 1440px (large)',
      'Fluid typography (clamp, vw units)',
      'Flexible layouts (CSS Grid, Flexbox)',
      'Responsive images (srcset, picture element)',
      'Touch-friendly interactions on mobile',
      'Test on real devices, not just browser DevTools'
    ]
  }
];

// ============================================================================
// 5 Skill Categories
// ============================================================================

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'Visual Design Fundamentals',
    description: 'Core visual design skills and principles',
    skills: [
      'Color theory and application',
      'Typography and type hierarchy',
      'Layout and composition',
      'Grid systems and alignment',
      'Visual hierarchy creation',
      'Balance and proportion',
      'Contrast and emphasis',
      'White space utilization',
      'Design system creation',
      'Style guide development'
    ]
  },
  {
    name: 'User Interface (UI) Design',
    description: 'Designing interactive digital interfaces',
    skills: [
      'Component design (buttons, inputs, cards)',
      'Navigation patterns (menus, tabs, breadcrumbs)',
      'Form design and validation states',
      'Modal and dialog design',
      'Responsive design patterns',
      'Mobile-first design',
      'Touch target sizing',
      'Icon design and selection',
      'Micro-interactions and animations',
      'Loading states and feedback'
    ]
  },
  {
    name: 'User Experience (UX) Design',
    description: 'Creating intuitive and delightful user experiences',
    skills: [
      'User research and personas',
      'Information architecture',
      'User flows and journey mapping',
      'Wireframing and prototyping',
      'Usability testing',
      'Accessibility design (WCAG compliance)',
      'Interaction design patterns',
      'Content strategy',
      'Error prevention and recovery',
      'Performance perception optimization'
    ]
  },
  {
    name: 'Technical Implementation',
    description: 'Translating designs into code and technical specifications',
    skills: [
      'HTML semantic structure',
      'CSS (Flexbox, Grid, custom properties)',
      'Responsive CSS (media queries, container queries)',
      'CSS animations and transitions',
      'Design tokens and theming',
      'Component-based architecture',
      'Accessibility implementation (ARIA, semantic HTML)',
      'Performance optimization (lazy loading, code splitting)',
      'Browser compatibility',
      'Design handoff and documentation'
    ]
  },
  {
    name: 'Design Tools & Workflow',
    description: 'Proficiency with design tools and collaborative workflows',
    skills: [
      'Figma (components, auto-layout, variants)',
      'Adobe XD / Sketch',
      'Prototyping tools (Framer, ProtoPie)',
      'Version control for design (Git, Abstract)',
      'Design system management',
      'Collaboration and feedback tools',
      'Asset export and optimization',
      'Design QA and review processes',
      'Handoff to development (Zeplin, Figma Dev Mode)',
      'Documentation and style guides'
    ]
  }
];

// ============================================================================
// Core Module Export
// ============================================================================

export const VISUAL_DESIGN_CORE: DesignModule = {
  name: 'visual-design-core',
  version: '1.0.0',
  description: 'Core visual design knowledge: 8 elements, 11 principles, 5 skill categories',
  elements: DESIGN_ELEMENTS,
  principles: DESIGN_PRINCIPLES,
  skills: SKILL_CATEGORIES,
  vendorPriority: ['google', 'microsoft', 'amazon']
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get a design element by name
 */
export function getElement(name: string): DesignElement | undefined {
  return DESIGN_ELEMENTS.find(
    element => element.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get a design principle by name
 */
export function getPrinciple(name: string): DesignPrinciple | undefined {
  return DESIGN_PRINCIPLES.find(
    principle => principle.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get a skill category by name
 */
export function getSkillCategory(name: string): SkillCategory | undefined {
  return SKILL_CATEGORIES.find(
    category => category.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all elements, principles, and skills as a summary
 */
export function getCoreSummary(): {
  elements: string[];
  principles: string[];
  skillCategories: string[];
} {
  return {
    elements: DESIGN_ELEMENTS.map(e => e.name),
    principles: DESIGN_PRINCIPLES.map(p => p.name),
    skillCategories: SKILL_CATEGORIES.map(s => s.name)
  };
}

/**
 * Validate if a design follows core principles
 */
export function validateDesign(design: {
  hasColorContrast: boolean;
  hasTypographyHierarchy: boolean;
  hasConsistentSpacing: boolean;
  isAccessible: boolean;
  isResponsive: boolean;
}): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!design.hasColorContrast) {
    issues.push('Insufficient color contrast (violates Contrast principle)');
  }
  if (!design.hasTypographyHierarchy) {
    issues.push('Missing typography hierarchy (violates Hierarchy principle)');
  }
  if (!design.hasConsistentSpacing) {
    issues.push('Inconsistent spacing (violates Consistency principle)');
  }
  if (!design.isAccessible) {
    issues.push('Accessibility issues (violates Accessibility principle)');
  }
  if (!design.isResponsive) {
    issues.push('Not responsive (violates Responsiveness principle)');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

