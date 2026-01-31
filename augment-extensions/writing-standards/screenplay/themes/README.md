# Screenplay Themes Module

**Version**: 1.0.0  
**Type**: Writing Standards  
**Category**: Screenplay

## Overview

This module provides comprehensive thematic integration rules and guidelines for screenplay writing across 15+ universal themes. Each theme includes core concepts, integration strategies across acts, character connection techniques, and real-world film examples.

## Key Features

- **15+ Universal Themes**: Redemption, Love, Revenge, Identity, Power, Survival, Friendship, Betrayal, Growth, Isolation, Justice, Ambition, Fate, Technology, Environment
- **Integration Guidelines**: How to weave themes throughout your screenplay
- **85% Depth Coverage**: Each theme documented with 5-8 core rules and integration strategies
- **Film Examples**: 3-5 real film examples per theme with specific thematic moments
- **Modular Activation**: Select only the themes you need

## Installation

### With CLI (Recommended)
```bash
augx link writing-standards/screenplay/themes
```

### Manual Setup
1. Copy `augment-extensions/writing-standards/screenplay/themes/` to your project
2. Reference theme files in your `.augment/` configuration
3. Configure active themes in `.augment/screenplay-config.json`

## Configuration

Create or update `.augment/screenplay-config.json`:

```json
{
  "screenplay_enhancements": {
    "enabled": true,
    "features": {
      "themes": {
        "enabled": true,
        "selected": ["redemption", "identity", "power"]
      }
    }
  }
}
```

## Directory Structure

```
themes/
├── module.json           # Module metadata
├── README.md             # This file
├── rules/                # Theme-specific integration rules
│   ├── redemption.md
│   ├── love.md
│   ├── revenge.md
│   ├── identity.md
│   ├── power.md
│   ├── survival.md
│   ├── friendship.md
│   ├── betrayal.md
│   ├── growth.md
│   ├── isolation.md
│   ├── justice.md
│   ├── ambition.md
│   ├── fate.md
│   ├── technology.md
│   └── environment.md
└── examples/
    └── theme-integrations.md
```

## Usage

### Selecting Themes

When developing a screenplay, select the primary theme(s) that apply:

```json
{
  "themes": {
    "selected": ["redemption", "betrayal"]
  }
}
```

### Applying Theme Rules

AI agents will automatically apply the selected theme rules when:
- Developing character arcs
- Structuring plot points
- Writing dialogue with subtext
- Creating thematic payoffs

### Multiple Themes

Most screenplays explore multiple themes. Select all relevant themes:

```json
{
  "themes": {
    "selected": ["love", "sacrifice", "identity"]
  }
}
```

The module will help ensure thematic consistency and integration across all selected themes.

## Theme Coverage

### Core Themes (15)
- **Redemption**: Character seeks to atone for past mistakes
- **Love**: Romantic, familial, or platonic connection
- **Revenge**: Character driven by desire for retribution
- **Identity**: Character discovers or questions who they are
- **Power**: Struggle for control, authority, or influence
- **Survival**: Physical or emotional fight to endure
- **Friendship**: Bonds formed through shared experience
- **Betrayal**: Trust broken, loyalty tested
- **Growth**: Character transformation and maturation
- **Isolation**: Physical or emotional separation
- **Justice**: Quest for fairness and moral balance
- **Ambition**: Drive to achieve goals at any cost
- **Fate**: Destiny vs. free will
- **Technology**: Impact of technological advancement
- **Environment**: Ecological concerns and nature's role

## Character Count

**Total**: ~TBD characters (will be calculated after content creation)

## Contents

- `rules/redemption.md` - Redemption theme integration and examples
- `rules/love.md` - Love theme integration and examples
- `rules/revenge.md` - Revenge theme integration and examples
- `rules/identity.md` - Identity theme integration and examples
- `rules/power.md` - Power theme integration and examples
- `rules/survival.md` - Survival theme integration and examples
- `rules/friendship.md` - Friendship theme integration and examples
- `rules/betrayal.md` - Betrayal theme integration and examples
- `rules/growth.md` - Growth theme integration and examples
- `rules/isolation.md` - Isolation theme integration and examples
- `rules/justice.md` - Justice theme integration and examples
- `rules/ambition.md` - Ambition theme integration and examples
- `rules/fate.md` - Fate theme integration and examples
- `rules/technology.md` - Technology's Impact theme integration and examples
- `rules/environment.md` - Environmental Concerns theme integration and examples
- `examples/theme-integrations.md` - Complete theme integration examples

## Related Modules

- `writing-standards/screenplay/genres` - Genre-specific conventions
- `writing-standards/screenplay/styles` - Narrative style guidelines
- `writing-standards/screenplay` - Core screenplay standards

