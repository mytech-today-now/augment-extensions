# Cinematic Style Guides Module

**Version**: 1.0.0  
**Type**: Writing Standards  
**Category**: Screenplay

## Overview

This module provides film and franchise-specific screenplay style guides that capture the unique voice, structure, and techniques of iconic films and cinematic universes. Each style guide is a comprehensive analysis of how specific films or franchises approach storytelling, character development, dialogue, action, pacing, and visual style.

## Key Features

- **Film/Franchise Specific**: Deep-dive style guides for specific films or cinematic universes
- **Comprehensive Analysis**: Structure, dialogue, character development, visual style, sound design
- **Practical Templates**: Scene construction templates and writing approaches
- **Real Examples**: Actual scenes and techniques from the analyzed films
- **Modular Activation**: Select the cinematic style that fits your screenplay vision

## Available Style Guides

### 1. Marvel Cinematic Universe (MCU) - Avengers Style
**File**: `rules/mcu-avengers.md`  
**Films Analyzed**: 20+ MCU films (2008-2021)  
**Core Concept**: Character-driven spectacle with heart, humor, and interconnected world-building

**Key Characteristics**:
- Ensemble superhero epic
- Quippy dialogue with emotional depth
- Character first, spectacle second
- Grounded spectacle with human stakes
- Found family themes

**Best For**: Superhero ensemble films, action-adventure with heart, franchise/universe building

### 2. Blue Ruin - Incompetent Protagonist Thriller
**File**: `rules/blue-ruin.md`  
**Film**: Blue Ruin (2013) - Jeremy Saulnier  
**Core Concept**: Authentic incompetence in a revenge narrative

**Key Characteristics**:
- Realistic protagonist limitations
- Minimal dialogue, visual storytelling
- Unglamorous, consequential violence
- Slow-burn tension
- Anti-action film approach

**Best For**: Revenge thrillers, crime dramas, survival stories, anti-hero narratives

## Installation

### With CLI (Recommended)
```bash
augx link writing-standards/screenplay/cinematic-styles
```

### Manual Setup
1. Copy `augment-extensions/writing-standards/screenplay/cinematic-styles/` to your project
2. Reference style files in your `.augment/` configuration
3. Configure active style in `.augment/screenplay-config.json`

## Configuration

Create or update `.augment/screenplay-config.json`:

```json
{
  "screenplay_enhancements": {
    "enabled": true,
    "features": {
      "cinematic_styles": {
        "enabled": true,
        "selected": ["mcu-avengers"]
      }
    }
  }
}
```

**Note**: Typically only ONE cinematic style should be selected per screenplay project.

## Directory Structure

```
cinematic-styles/
├── module.json           # Module metadata
├── README.md             # This file
├── rules/                # Film/franchise-specific style guides
│   ├── mcu-avengers.md   # Marvel Cinematic Universe style
│   └── blue-ruin.md      # Blue Ruin incompetent protagonist style
└── examples/
    └── style-applications.md
```

## Usage

### Selecting a Cinematic Style

When developing a screenplay, select the cinematic style that best matches your vision:

```json
{
  "cinematic_styles": {
    "selected": ["mcu-avengers"]
  }
}
```

### Applying Style Rules

AI agents will automatically apply the selected cinematic style rules when:
- Structuring the screenplay
- Writing dialogue
- Crafting action sequences
- Developing characters
- Determining pacing and tone
- Creating visual descriptions

## Future Additions

This module will expand to include additional film and franchise style guides:

- **Christopher Nolan** - Non-linear, cerebral blockbusters
- **Quentin Tarantino** - Dialogue-heavy, non-linear crime films
- **Wes Anderson** - Symmetrical, whimsical, ensemble comedies
- **Denis Villeneuve** - Atmospheric, slow-burn sci-fi
- **Edgar Wright** - Fast-paced, visual comedy
- **Coen Brothers** - Dark comedy, regional dialects
- **Star Wars** - Space opera, hero's journey
- **Lord of the Rings** - Epic fantasy, ensemble adventure
- **John Wick** - Stylized action, world-building through visuals
- **A24 Horror** - Elevated horror, slow-burn dread
- And many more...

## Character Count

**Current**: ~150,000 characters (2 style guides)  
**Projected**: 500,000+ characters (10+ style guides)

## Contents

- `rules/mcu-avengers.md` - Marvel Cinematic Universe ensemble superhero style guide
- `rules/blue-ruin.md` - Incompetent protagonist thriller style guide (Jeremy Saulnier)
- `examples/style-applications.md` - Practical examples of applying cinematic styles

## Related Modules

- `writing-standards/screenplay` - Core screenplay standards
- `writing-standards/screenplay/styles` - Narrative style techniques
- `writing-standards/screenplay/genres` - Genre-specific conventions
- `writing-standards/screenplay/themes` - Thematic integration

## References

- Marvel Cinematic Universe (2008-present) - Kevin Feige, Marvel Studios
- Blue Ruin (2013) - Jeremy Saulnier (Writer/Director)
- Additional references in individual style guide files

