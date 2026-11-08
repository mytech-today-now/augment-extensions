# Visual Design System Module

Comprehensive visual design module for Augment AI with vendor-specific design systems and domain-specific styles.

## Overview

This module provides AI agents with structured visual design knowledge including:
- **Design Elements**: Color, typography, layout, imagery, iconography, spacing, motion, elevation
- **Design Principles**: Balance, contrast, hierarchy, unity, emphasis, rhythm, proportion, white space, consistency, accessibility, responsiveness
- **Vendor Design Systems**: Google Material 3 Expressive, Microsoft Fluent 2, Amazon Cloudscape
- **Domain Styles**: Website, Web-app, Mobile, .NET Application, Linux, Windows, Motion Picture, AI Prompt Helper, Print Campaigns
- **Default Fallback**: google → microsoft → amazon

## Guidance Structure and Discovery

This module combines its selectable TypeScript vendor and domain styles with indexed rules, progressive guidelines, and task-oriented skills:

- Start at rules/index.md for the decision order and task router. The CLI lists direct Markdown files in rules.
- Review rules/design-practice.md for research, UX, product, service, interaction, information architecture, visual language, and design-system work.
- Review rules/accessibility-and-color.md and rules/platform-guidance.md for accessibility, themes, typography, motion, and platform constraints.
- Use guidelines/design-levels.md and guidelines/coverage-map.md for basic, intermediate, and advanced coverage.
- Use skills/design-brief.md and skills/design-review.md for repeatable design work.
- Use skills/responsive-validation/SKILL.md and its runner for caller-supplied web applications.

Read module-local files through augx show visual-design <module-relative-path>, for example rules/index.md or skills/responsive-validation/SKILL.md. The repository-level augx skill command indexes the root skills directory only; module-local skill files are discoverable through the module index and file-view command.

The responsive workflow applies to screen interfaces. Print, film, and image-generation work retain their existing domain-specific constraints and do not use browser viewport rules.

## Architecture

```
visual-design/
├── module.json                 # Module metadata
├── README.md                   # This file
├── metadata.json               # Version, character count, and indexed content files
├── VERSION                     # Version used by the version-aware module loader
├── visual-design-core.ts       # Core design elements, principles, skills
├── types.ts                    # TypeScript interfaces
├── style-selector.ts           # Vendor priority logic
├── rules/                      # Directly listed module rules and task index
├── guidelines/                 # Design levels and coverage map
├── skills/                     # Module-local task procedures and responsive runner
├── scripts/                    # Guidance manifest validator
├── domains/
│   ├── web-page-styles/
│   │   ├── google-modern.ts    # Material 3 Expressive
│   │   ├── microsoft-fluent.ts # Fluent 2
│   │   └── amazon-cloudscape.ts# Cloudscape + amazon.com
│   └── other/
│       ├── website.ts          # Multi-page websites
│       ├── web-app.ts          # Single-page applications
│       ├── mobile-application.ts # iOS/Android apps
│       ├── dotnet-application.ts # WPF/WinForms/MAUI
│       ├── linux-platform.ts   # GNOME/KDE applications
│       ├── windows-platform.ts # Windows 11 applications
│       ├── motion-picture.ts   # Film/TV/web-series
│       ├── ai-prompt-helper.ts # AI image generation prompts
│       ├── print-campaigns.ts  # Flyers, posters, banners
│       └── os-application.ts   # General OS applications
├── __tests__/                  # Unit and integration tests
│   ├── README.md               # Test documentation
│   ├── guidance-contract.test.ts # Guidance and responsive plan contract tests
│   ├── style-selector.test.ts  # Style selector tests
│   └── vendor-styles.test.ts   # Vendor integration tests
└── examples/                   # Usage examples
    ├── README.md               # Examples overview
    ├── basic-usage.md          # Getting started
    ├── domain-workflows.md     # Domain-specific workflows
    ├── vendor-comparison.md    # Vendor style comparison
    └── ai-prompt-generation.md # AI prompt examples
```

## Vendor Priority Order

The module uses a default fallback chain:

1. **Google Modern** (Material 3 Expressive) - Primary
2. **Microsoft Fluent 2** - Secondary
3. **Amazon Cloudscape** - Tertiary

This can be overridden in `.augment/extensions.json`:

```json
{
  "linked": ["visual-design"],
  "config": {
    "visual-design": {
      "vendorPriority": ["microsoft", "google", "amazon"]
    }
  }
}
```

## Installation

```bash
# Link the module
augx link visual-design

# View module content
augx show visual-design

# View specific vendor style
augx show visual-design domains/web-page-styles/google-modern.ts
```

## Usage

### For AI Agents

When generating visual designs:

1. **Query the module**: `augx show visual-design`
2. **Select vendor style**: Use default priority or user-specified preference
3. **Apply design elements**: Color, typography, layout, spacing, etc.
4. **Follow design principles**: Balance, contrast, hierarchy, accessibility
5. **Generate output**: HTML/CSS, design specs, or visual mockups

### Example Prompt

```
Using the visual-design module with Google Modern style, create a landing page 
for a SaaS product with:
- Hero section with CTA
- Feature cards (3 columns)
- Testimonials section
- Footer with links

Apply Material 3 Expressive characteristics such as dynamic color and rounded corners. Measure contrast for each rendered state against the product target.
```

## Design Elements (8)

1. **Color** - Palettes, contrast, accessibility
2. **Typography** - Fonts, hierarchy, readability
3. **Layout** - Grid systems, alignment, flow
4. **Imagery** - Photos, illustrations, aspect ratios
5. **Iconography** - Icon sets, sizes, styles
6. **Spacing** - Margins, padding, rhythm
7. **Motion** - Animations, transitions, easing
8. **Elevation** - Shadows, depth, layering

## Design Principles (11)

1. **Balance** - Visual weight distribution
2. **Contrast** - Differentiation and emphasis
3. **Hierarchy** - Information priority
4. **Unity** - Cohesive visual language
5. **Emphasis** - Focal points
6. **Rhythm** - Repetition and pattern
7. **Proportion** - Size relationships
8. **White Space** - Breathing room
9. **Consistency** - Predictable patterns
10. **Accessibility** - Inclusive design reviewed against the applicable target
11. **Responsiveness** - Multi-device adaptation

## Core TypeScript Skill Categories (5)

1. **Color Theory** - Palettes, harmony, psychology
2. **Typography** - Font pairing, hierarchy, readability
3. **Layout Design** - Grid systems, composition, flow
4. **Visual Hierarchy** - Emphasis, contrast, scale
5. **Accessibility** - Inclusive design and accessibility review

## Vendor Characteristics

### Google Modern (Material 3 Expressive)
- Dynamic color theming with tonal palettes
- Rounded corners (8px-24px)
- Springy motion with easing curves
- Accessible design patterns that must be verified against the current product target

### Microsoft Fluent 2
- Acrylic and Mica materials for depth
- Segoe UI Variable typography
- Cross-platform consistency
- Subtle shadows and elevation

### Amazon Cloudscape
- Enterprise dashboard patterns
- Amazon Ember typography
- Component-heavy architecture
- Data visualization focus

## Domain Styles

### Website Domain
- Multi-page structure with consistent navigation
- SEO-optimized layouts
- Content-focused typography
- Blog post templates
- Contact forms and landing pages

### Web-app Domain
- Single-page application architecture
- App-like navigation (sidebar, tabs)
- Interactive components (charts, tables)
- State management patterns
- Real-time data updates

### Mobile Application Domain
- Touch-first interaction design
- Native navigation patterns (iOS/Android)
- Gesture-based interactions
- Bottom navigation and tab bars
- Safe area inset handling

### .NET Application Domain
- XAML-based UI definition
- MVVM architecture pattern
- WPF/WinForms/MAUI controls
- Cross-platform with .NET MAUI
- Visual Studio designer support

### Linux Platform Domain
- GNOME HIG / KDE HIG compliance
- GTK/Qt integration
- Desktop environment theming
- System integration (notifications, tray)

### Windows Platform Domain
- Windows 11 design principles
- Acrylic/Mica materials
- Fluent Design System
- WinUI 3 controls

### Motion Picture Design Domain
- Cinematography principles
- Color grading techniques
- Composition rules (rule of thirds)
- Visual storytelling
- Motion graphics for film/TV/web-series

### AI Prompt Helper Domain
- Platform-specific prompt templates (Midjourney, DALL-E, Stable Diffusion)
- Style keyword suggestions
- Composition guidance
- Lighting and mood descriptors

### Print Campaigns Domain
- Print-specific color (CMYK)
- High resolution (300 DPI)
- Bleed and safe zones
- Physical media constraints
- Large-format typography for posters, flyers, banners, billboards

## Examples

The `examples/` directory contains comprehensive usage examples:

- **basic-usage.md**: Getting started with the module
- **domain-workflows.md**: Domain-specific workflows for all 9 domains
- **vendor-comparison.md**: Detailed comparison of Google/Microsoft/Amazon styles
- **ai-prompt-generation.md**: AI image generation prompt examples

## Testing

The `__tests__/` directory contains comprehensive test coverage:

- **style-selector.test.ts**: Tests for vendor priority chain and fallback logic
- **vendor-styles.test.ts**: Integration tests for all vendor design systems
- **guidance-contract.test.ts**: Checks metadata references, module discovery, skill coverage, and responsive sweep planning
- **scripts/validate-guidance.cjs**: Validates metadata paths and local guidance links
- **README.md**: Test documentation and usage instructions

All tests validate:
- ✅ Default vendor priority chain (google → microsoft → amazon)
- ✅ Custom priority configuration
- ✅ Vendor preference handling
- ✅ Fallback logic for invalid vendors
- ✅ Cross-vendor consistency
- ✅ Required properties validation
- ✅ Current accessibility guidance and metadata contract

## License

Part of Augment Extensions. See repository root for license information.

