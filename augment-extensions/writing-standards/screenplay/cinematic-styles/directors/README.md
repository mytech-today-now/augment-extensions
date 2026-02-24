# Cinematic Styles - Directors Module

**Version**: 1.0.0  
**Type**: Writing Standards  
**Category**: Screenplay / Cinematic Styles

## Overview

This module provides comprehensive screenplay style guides for 60 iconic film directors, capturing their unique voice, structure, techniques, and storytelling approaches. Each director guide analyzes their distinctive cinematic language, from visual style to narrative structure to character development.

## Key Features

- **60 Director Style Guides**: From classic auteurs to contemporary visionaries
- **Comprehensive Analysis**: Visual style, narrative structure, dialogue, pacing, themes
- **Film Examples**: Specific techniques demonstrated in their notable works
- **Modular Selection**: Choose individual directors or use the entire collection

## Installation

### Link Entire Directors Module
```bash
augx link writing-standards/screenplay/cinematic-styles/directors
```

### Link Specific Director
```bash
augx link writing-standards/screenplay/cinematic-styles/directors/christopher-nolan
augx link writing-standards/screenplay/cinematic-styles/directors/wes-anderson
```

## Available Directors

### Classic Auteurs
- Alfred Hitchcock - Master of suspense
- Orson Welles - Innovative visual storytelling
- John Ford - American Western pioneer
- Stanley Kubrick - Meticulous perfectionist
- Francis Ford Coppola - Epic family sagas

### Contemporary Masters
- Christopher Nolan - Cerebral blockbusters
- Denis Villeneuve - Atmospheric sci-fi
- Quentin Tarantino - Dialogue-heavy non-linear narratives
- Wes Anderson - Symmetrical whimsical ensembles
- David Fincher - Dark psychological thrillers

### Genre Specialists
- George A. Romero - Zombie horror
- John Carpenter - Atmospheric horror/thriller
- Guillermo del Toro - Gothic fantasy
- Tobe Hooper - Horror classics
- Sam Peckinpah - Violent Westerns

### Character-Driven Directors
- Martin Scorsese - Crime dramas and character studies
- Paul Thomas Anderson - Ensemble character dramas
- Sidney Lumet - Intense character-focused narratives
- Mike Nichols - Sophisticated character studies
- Robert Altman - Multi-character ensemble pieces

### Comedy Directors
- Mel Brooks - Parody and satire
- Coen Brothers - Dark comedy with regional dialects
- Terry Gilliam - Surreal comedy
- Rob Reiner - Heartfelt comedies
- Kevin Smith - Dialogue-driven indie comedy

### International Voices
- Park Chan-wook - Korean revenge thrillers
- Buster Keaton - Silent film physical comedy

### And Many More...
See the complete list in module.json

## Usage

### Selecting a Director Style

Configure in `.augment/screenplay-config.json`:

```json
{
  "screenplay_enhancements": {
    "features": {
      "cinematic_styles": {
        "enabled": true,
        "directors": ["christopher-nolan", "denis-villeneuve"]
      }
    }
  }
}
```

### Querying Director Styles

```bash
# Show all directors
augx show writing-standards/screenplay/cinematic-styles/directors

# Show specific director
augx show writing-standards/screenplay/cinematic-styles/directors/christopher-nolan
```

## Directory Structure

```
directors/
├── module.json           # Module metadata
├── README.md             # This file
└── rules/                # Director-specific style guides
    ├── alfred-hitchcock.md
    ├── christopher-nolan.md
    ├── wes-anderson.md
    └── ... (60 total)
```

## Integration

This module integrates with:
- **Core Screenplay Module**: Universal formatting and narrative structures
- **Narrative Styles Module**: Complementary narrative techniques
- **Genre Conventions**: Genre-specific screenplay rules

## License

MIT License - See parent module for details

