# Screenplay Narrative Styles Module

**Version**: 1.0.0  
**Type**: Writing Standards  
**Category**: Screenplay

## Overview

This module provides comprehensive narrative style rules and techniques for screenplay writing across 13+ storytelling approaches. Each style includes structural requirements, pacing guidelines, visual storytelling notes, dialogue approaches, and real-world film examples.

## Key Features

- **13+ Narrative Styles**: Linear, Non-Linear, Ensemble, Minimalist, Epic, Satirical, Poetic, Realistic, Surreal, Experimental, Voice-Over Driven, Flashback-Heavy, Dialogue-Centric
- **Structural Requirements**: 5-8 requirements per style
- **85% Depth Coverage**: Each style documented with pacing, visual, and dialogue guidelines
- **Film Examples**: 3-5 real film examples per style with specific technique demonstrations
- **Modular Activation**: Select the narrative style that fits your screenplay

## Installation

### With CLI (Recommended)
```bash
augx link writing-standards/screenplay/styles
```

### Manual Setup
1. Copy `augment-extensions/writing-standards/screenplay/styles/` to your project
2. Reference style files in your `.augment/` configuration
3. Configure active style in `.augment/screenplay-config.json`

## Configuration

Create or update `.augment/screenplay-config.json`:

```json
{
  "screenplay_enhancements": {
    "enabled": true,
    "features": {
      "styles": {
        "enabled": true,
        "selected": ["non-linear"]
      }
    }
  }
}
```

## Directory Structure

```
styles/
├── module.json           # Module metadata
├── README.md             # This file
├── rules/                # Style-specific rules and techniques
│   ├── linear.md
│   ├── non-linear.md
│   ├── ensemble.md
│   ├── minimalist.md
│   ├── epic.md
│   ├── satirical.md
│   ├── poetic.md
│   ├── realistic.md
│   ├── surreal.md
│   ├── experimental.md
│   ├── voice-over.md
│   ├── flashback.md
│   └── dialogue-centric.md
└── examples/
    └── style-applications.md
```

## Usage

### Selecting a Style

When developing a screenplay, select the primary narrative style:

```json
{
  "styles": {
    "selected": ["ensemble"]
  }
}
```

**Note**: Unlike genres and themes, typically only ONE narrative style should be selected per screenplay.

### Applying Style Rules

AI agents will automatically apply the selected style rules when:
- Structuring the screenplay
- Determining pacing and rhythm
- Crafting visual descriptions
- Writing dialogue
- Formatting technical elements

### Style Characteristics

Each style has distinct characteristics:

- **Linear**: Chronological storytelling, clear cause-and-effect
- **Non-Linear**: Time jumps, parallel timelines, fragmented narrative
- **Ensemble**: Multiple protagonists, interwoven storylines
- **Minimalist**: Sparse dialogue, visual storytelling, restraint
- **Epic**: Grand scale, multiple locations, extended timeframe
- **Satirical**: Social commentary, irony, exaggeration
- **Poetic**: Lyrical language, metaphor, visual symbolism
- **Realistic**: Naturalistic dialogue, everyday situations, authenticity
- **Surreal**: Dream logic, abstract imagery, unconventional narrative
- **Experimental**: Breaking conventions, innovative techniques
- **Voice-Over Driven**: Narration-heavy, internal monologue
- **Flashback-Heavy**: Past/present interplay, memory-driven
- **Dialogue-Centric**: Character revealed through conversation

## Style Coverage

### Narrative Styles (13)
1. Linear
2. Non-Linear
3. Ensemble
4. Minimalist
5. Epic
6. Satirical
7. Poetic
8. Realistic
9. Surreal
10. Experimental
11. Voice-Over Driven
12. Flashback-Heavy
13. Dialogue-Centric

## Character Count

**Total**: ~TBD characters (will be calculated after content creation)

## Contents

- `rules/linear.md` - Linear narrative style rules and examples
- `rules/non-linear.md` - Non-linear narrative style rules and examples
- `rules/ensemble.md` - Ensemble narrative style rules and examples
- `rules/minimalist.md` - Minimalist narrative style rules and examples
- `rules/epic.md` - Epic narrative style rules and examples
- `rules/satirical.md` - Satirical narrative style rules and examples
- `rules/poetic.md` - Poetic narrative style rules and examples
- `rules/realistic.md` - Realistic narrative style rules and examples
- `rules/surreal.md` - Surreal narrative style rules and examples
- `rules/experimental.md` - Experimental narrative style rules and examples
- `rules/voice-over.md` - Voice-over driven narrative style rules and examples
- `rules/flashback.md` - Flashback-heavy narrative style rules and examples
- `rules/dialogue-centric.md` - Dialogue-centric narrative style rules and examples
- `examples/style-applications.md` - Complete style application examples

## Related Modules

- `writing-standards/screenplay/genres` - Genre-specific conventions
- `writing-standards/screenplay/themes` - Thematic integration
- `writing-standards/screenplay` - Core screenplay standards

