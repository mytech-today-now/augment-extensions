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

### Auteur Directors (11 Guides)

#### 1. Christopher Nolan
**File**: `rules/christopher-nolan.md`
**Core Concept**: Cerebral blockbusters with non-linear narratives and philosophical depth
**Key Characteristics**: Time manipulation, practical effects, moral ambiguity, puzzle-box structures
**Best For**: Sci-fi thrillers, heist films, psychological dramas, complex narratives

#### 2. Coen Brothers
**File**: `rules/coen-brothers.md`
**Core Concept**: Dark comedy with regional authenticity and fatalistic worldview
**Key Characteristics**: Quirky characters, regional dialects, moral ambiguity, absurdist humor
**Best For**: Crime comedies, neo-noir, character-driven dark comedies

#### 3. David Lynch
**File**: `rules/david-lynch.md`
**Core Concept**: Surrealist psychological horror with dreamlike logic
**Key Characteristics**: Subconscious imagery, unsettling atmosphere, non-linear storytelling, symbolic visuals
**Best For**: Psychological horror, surreal dramas, mystery thrillers

#### 4. Denis Villeneuve
**File**: `rules/denis-villeneuve.md`
**Core Concept**: Atmospheric sci-fi with slow-burn tension and environmental scale
**Key Characteristics**: Visual storytelling, minimal dialogue, existential themes, immersive soundscapes
**Best For**: Sci-fi epics, atmospheric thrillers, contemplative dramas

#### 5. Francis Ford Coppola
**File**: `rules/francis-ford-coppola.md`
**Core Concept**: Epic family sagas with operatic scope and moral complexity
**Key Characteristics**: Multi-generational narratives, power dynamics, Italian-American culture, visual symbolism
**Best For**: Crime epics, family dramas, historical epics, character studies

#### 6. George Lucas
**File**: `rules/george-lucas.md`
**Core Concept**: Mythic space opera with serialized storytelling
**Key Characteristics**: Hero's journey, world-building, visual effects innovation, archetypal characters
**Best For**: Space opera, fantasy adventures, serialized franchises

#### 7. Martin Scorsese
**File**: `rules/martin-scorsese.md`
**Core Concept**: Crime dramas with psychological depth and Catholic guilt
**Key Characteristics**: Kinetic camera work, voiceover narration, moral complexity, urban authenticity
**Best For**: Crime dramas, biographical films, character studies, psychological thrillers

#### 8. Quentin Tarantino
**File**: `rules/quentin-tarantino.md`
**Core Concept**: Dialogue-heavy non-linear narratives with pop culture references
**Key Characteristics**: Chapter structure, stylized violence, pop culture dialogue, revenge themes
**Best For**: Crime films, revenge thrillers, ensemble pieces, dialogue-driven narratives

#### 9. Stanley Kubrick
**File**: `rules/stanley-kubrick.md`
**Core Concept**: Meticulous visual storytelling with thematic precision
**Key Characteristics**: Symmetrical compositions, slow pacing, psychological horror, perfectionist detail
**Best For**: Psychological horror, sci-fi, war films, period pieces

#### 10. Steven Spielberg
**File**: `rules/steven-spielberg.md`
**Core Concept**: Humanist adventure films with emotional resonance
**Key Characteristics**: Wonder and awe, family themes, accessible storytelling, visual spectacle
**Best For**: Adventure films, family dramas, historical epics, sci-fi

#### 11. Wes Anderson
**File**: `rules/wes-anderson.md`
**Core Concept**: Symmetrical whimsical ensembles with emotional restraint
**Key Characteristics**: Centered compositions, pastel palettes, quirky characters, deadpan humor
**Best For**: Ensemble comedies, coming-of-age stories, whimsical dramas

### Franchises (2 Guides)

#### 12. Marvel Cinematic Universe (MCU) - Avengers
**File**: `rules/mcu-avengers.md`
**Films Analyzed**: 20+ MCU films (2008-2021)
**Core Concept**: Character-driven spectacle with heart, humor, and interconnected world-building
**Key Characteristics**: Ensemble superhero epic, quippy dialogue, emotional depth, found family themes
**Best For**: Superhero ensemble films, action-adventure with heart, franchise/universe building

#### 13. Star Wars
**File**: `rules/star-wars.md`
**Core Concept**: Space opera with mythological storytelling and serialized narrative
**Key Characteristics**: Hero's journey, Force mythology, visual world-building, archetypal characters
**Best For**: Space opera, fantasy adventures, serialized storytelling, mythic narratives

### Individual Films (1 Guide)

#### 14. Blue Ruin
**File**: `rules/blue-ruin.md`
**Film**: Blue Ruin (2013) - Jeremy Saulnier
**Core Concept**: Authentic incompetence in a revenge narrative
**Key Characteristics**: Realistic protagonist limitations, minimal dialogue, unglamorous violence, slow-burn tension
**Best For**: Revenge thrillers, crime dramas, survival stories, anti-hero narratives

### Comedy Formats (2 Guides)

#### 15. Monty Python
**File**: `rules/monty-python.md`
**Core Concept**: Absurdist British comedy with surreal sketches
**Key Characteristics**: Non-sequiturs, breaking fourth wall, historical parody, intellectual absurdism
**Best For**: Comedy films, sketch-based narratives, satirical comedies, absurdist humor

#### 16. Saturday Night Live
**File**: `rules/saturday-night-live.md`
**Core Concept**: Sketch comedy format with topical satire
**Key Characteristics**: Cold opens, recurring characters, celebrity impressions, musical breaks
**Best For**: Sketch comedy, satirical content, variety shows, topical humor

### Narrative Theory (1 Guide)

#### 17. Joseph Campbell - The Hero's Journey
**File**: `rules/joseph-campbell.md`
**Core Concept**: Monomyth narrative structure and archetypal storytelling
**Key Characteristics**: 12-stage journey, archetypal characters, universal themes, mythological patterns
**Best For**: Adventure films, fantasy epics, coming-of-age stories, mythic narratives

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
├── module.json                    # Module metadata
├── README.md                      # This file
├── MIGRATION.md                   # Migration history
├── rules/                         # Film/franchise/director-specific style guides
│   ├── blue-ruin.md              # Jeremy Saulnier - Incompetent protagonist thriller
│   ├── christopher-nolan.md      # Cerebral blockbusters
│   ├── coen-brothers.md          # Dark comedy with regional dialects
│   ├── david-lynch.md            # Surrealist psychological horror
│   ├── denis-villeneuve.md       # Atmospheric sci-fi
│   ├── francis-ford-coppola.md   # Epic family sagas
│   ├── george-lucas.md           # Mythic space opera
│   ├── joseph-campbell.md        # Hero's Journey narrative theory
│   ├── martin-scorsese.md        # Crime dramas and character studies
│   ├── mcu-avengers.md           # Marvel Cinematic Universe ensemble style
│   ├── monty-python.md           # Absurdist British comedy
│   ├── quentin-tarantino.md      # Dialogue-heavy non-linear narratives
│   ├── saturday-night-live.md    # Sketch comedy format
│   ├── stanley-kubrick.md        # Meticulous visual storytelling
│   ├── star-wars.md              # Space opera franchise
│   ├── steven-spielberg.md       # Humanist adventure films
│   └── wes-anderson.md           # Symmetrical whimsical ensembles
└── examples/
    └── style-applications.md      # Practical application examples
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

This module may expand to include additional film and franchise style guides:

- **Edgar Wright** - Fast-paced visual comedy with kinetic editing
- **Lord of the Rings** - Epic fantasy ensemble adventure
- **John Wick** - Stylized action with world-building through visuals
- **A24 Horror** - Elevated horror with slow-burn dread
- **Pixar** - Emotional animated storytelling
- **Ghibli** - Whimsical animated fantasy
- **James Cameron** - Technological spectacle with environmental themes
- **Ridley Scott** - Atmospheric sci-fi and historical epics
- **Paul Thomas Anderson** - Character-driven ensemble dramas
- **Terrence Malick** - Poetic visual storytelling
- And many more...

## Character Count

**Current**: ~257,000 characters (17 style guides)
**Breakdown**:
- 11 Auteur Directors
- 2 Franchises
- 1 Individual Film
- 2 Comedy Formats
- 1 Narrative Theory

**Projected**: 400,000+ characters (25+ style guides)

## Contents

### Rules (17 Style Guides)
- `rules/blue-ruin.md` - Jeremy Saulnier incompetent protagonist thriller
- `rules/christopher-nolan.md` - Cerebral blockbusters with non-linear narratives
- `rules/coen-brothers.md` - Dark comedy with regional authenticity
- `rules/david-lynch.md` - Surrealist psychological horror
- `rules/denis-villeneuve.md` - Atmospheric sci-fi with slow-burn tension
- `rules/francis-ford-coppola.md` - Epic family sagas with operatic scope
- `rules/george-lucas.md` - Mythic space opera and serialized storytelling
- `rules/joseph-campbell.md` - Hero's Journey narrative theory
- `rules/martin-scorsese.md` - Crime dramas with psychological depth
- `rules/mcu-avengers.md` - Marvel Cinematic Universe ensemble superhero style
- `rules/monty-python.md` - Absurdist British comedy
- `rules/quentin-tarantino.md` - Dialogue-heavy non-linear narratives
- `rules/saturday-night-live.md` - Sketch comedy format
- `rules/stanley-kubrick.md` - Meticulous visual storytelling
- `rules/star-wars.md` - Space opera franchise mythology
- `rules/steven-spielberg.md` - Humanist adventure films
- `rules/wes-anderson.md` - Symmetrical whimsical ensembles

### Examples
- `examples/style-applications.md` - Practical examples of applying cinematic styles

## Related Modules

- `writing-standards/screenplay` - Core screenplay standards
- `writing-standards/screenplay/styles` - Narrative style techniques
- `writing-standards/screenplay/genres` - Genre-specific conventions
- `writing-standards/screenplay/themes` - Thematic integration

## References

### Directors
- **Christopher Nolan** - Memento, The Dark Knight trilogy, Inception, Interstellar, Dunkirk, Tenet, Oppenheimer
- **Coen Brothers** - Fargo, The Big Lebowski, No Country for Old Men, True Grit
- **David Lynch** - Eraserhead, Blue Velvet, Twin Peaks, Mulholland Drive
- **Denis Villeneuve** - Arrival, Blade Runner 2049, Dune
- **Francis Ford Coppola** - The Godfather trilogy, Apocalypse Now, The Conversation
- **George Lucas** - Star Wars original trilogy, American Graffiti, THX 1138
- **Martin Scorsese** - Taxi Driver, Raging Bull, Goodfellas, The Departed, The Irishman
- **Quentin Tarantino** - Pulp Fiction, Kill Bill, Inglourious Basterds, Django Unchained
- **Stanley Kubrick** - 2001: A Space Odyssey, The Shining, A Clockwork Orange, Full Metal Jacket
- **Steven Spielberg** - Jaws, E.T., Jurassic Park, Schindler's List, Saving Private Ryan
- **Wes Anderson** - The Royal Tenenbaums, The Grand Budapest Hotel, Moonrise Kingdom

### Franchises
- **Marvel Cinematic Universe** (2008-present) - Kevin Feige, Marvel Studios
- **Star Wars** (1977-present) - George Lucas, Lucasfilm

### Films
- **Blue Ruin** (2013) - Jeremy Saulnier (Writer/Director)

### Comedy Formats
- **Monty Python** - Monty Python's Flying Circus, Monty Python and the Holy Grail, Life of Brian
- **Saturday Night Live** (1975-present) - Lorne Michaels, NBC

### Narrative Theory
- **Joseph Campbell** - The Hero with a Thousand Faces, The Power of Myth

Additional references and film-specific details in individual style guide files.

