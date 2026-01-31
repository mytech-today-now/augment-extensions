# Screenplay Genres Module

**Version**: 1.0.0  
**Type**: Writing Standards  
**Category**: Screenplay

## Overview

This module provides comprehensive genre-specific rules and guidelines for screenplay writing across 18+ film genres. Each genre includes core conventions, structural requirements, character archetypes, pacing guidelines, and real-world film examples.

## Key Features

- **18+ Primary Genres**: Action, Adventure, Comedy, Drama, Horror, Sci-Fi, Fantasy, Romance, Thriller, Mystery, Western, Historical, Biographical, Animation, Documentary, Musical, Noir, Superhero
- **Hybrid Genre Support**: Guidelines for combining multiple genres (Rom-Com, Sci-Fi Horror, etc.)
- **85% Depth Coverage**: Each genre documented with 5-10 core rules and 10-15 guidelines
- **Film Examples**: 3-5 real film examples per genre with specific scene references
- **Modular Activation**: Select only the genres you need

## Installation

### With CLI (Recommended)
```bash
augx link writing-standards/screenplay/genres
```

### Manual Setup
1. Copy `augment-extensions/writing-standards/screenplay/genres/` to your project
2. Reference genre files in your `.augment/` configuration
3. Configure active genres in `.augment/screenplay-config.json`

## Configuration

Create or update `.augment/screenplay-config.json`:

```json
{
  "screenplay_enhancements": {
    "enabled": true,
    "features": {
      "genres": {
        "enabled": true,
        "selected": ["action", "sci-fi", "thriller"]
      }
    }
  }
}
```

## Directory Structure

```
genres/
├── module.json           # Module metadata
├── README.md             # This file
├── rules/                # Genre-specific rules
│   ├── action.md         ✅ Complete
│   ├── adventure.md      ✅ Complete
│   ├── animation.md      ✅ Complete
│   ├── biographical.md   ✅ Complete
│   ├── comedy.md         ✅ Complete
│   ├── documentary.md    ✅ Complete
│   ├── drama.md          ✅ Complete
│   ├── fantasy.md        ✅ Complete
│   ├── historical.md     ✅ Complete
│   ├── horror.md         ✅ Complete
│   ├── musical.md        ✅ Complete
│   ├── mystery.md        ✅ Complete
│   ├── noir.md           ✅ Complete
│   ├── romance.md        ✅ Complete
│   ├── sci-fi.md         ✅ Complete
│   ├── superhero.md      ✅ Complete
│   ├── thriller.md       ✅ Complete
│   ├── western.md        ✅ Complete
│   └── hybrids.md        🔲 Planned
└── examples/
    └── genre-applications.md
```

## Usage

### Selecting a Genre

When starting a screenplay, select the primary genre(s) that apply:

```json
{
  "genres": {
    "selected": ["thriller", "mystery"]
  }
}
```

### Applying Genre Rules

AI agents will automatically apply the selected genre rules when:
- Creating new screenplay files
- Reviewing existing scenes
- Providing feedback on structure and pacing
- Suggesting character archetypes

### Hybrid Genres

For hybrid genres (e.g., Rom-Com), select multiple genres:

```json
{
  "genres": {
    "selected": ["romance", "comedy"]
  }
}
```

Refer to `rules/hybrids.md` for conflict resolution and integration strategies.

## Genre Coverage

### Primary Genres (18)
- Action
- Adventure
- Comedy
- Drama
- Horror
- Sci-Fi
- Fantasy
- Romance
- Thriller
- Mystery
- Western
- Historical
- Biographical
- Animation
- Documentary
- Musical
- Noir
- Superhero

### Hybrid Genres
- Rom-Com (Romance + Comedy)
- Sci-Fi Horror (Sci-Fi + Horror)
- Action-Comedy (Action + Comedy)
- Historical Drama (Historical + Drama)
- Psychological Thriller (Thriller + Drama)

## Character Count

**Total**: ~TBD characters (will be calculated after content creation)

## Contents

### Completed Genres (18/18) ✅

- `rules/action.md` - Action genre conventions and examples ✅
- `rules/adventure.md` - Adventure genre conventions and examples ✅
- `rules/animation.md` - Animation genre conventions and examples ✅
- `rules/biographical.md` - Biographical genre conventions and examples ✅
- `rules/comedy.md` - Comedy genre conventions and examples ✅
- `rules/documentary.md` - Documentary genre conventions and examples ✅
- `rules/drama.md` - Drama genre conventions and examples ✅
- `rules/fantasy.md` - Fantasy genre conventions and examples ✅
- `rules/historical.md` - Historical genre conventions and examples ✅
- `rules/horror.md` - Horror genre conventions and examples ✅
- `rules/musical.md` - Musical genre conventions and examples ✅
- `rules/mystery.md` - Mystery genre conventions and examples ✅
- `rules/noir.md` - Film Noir genre conventions and examples ✅
- `rules/romance.md` - Romance genre conventions and examples ✅
- `rules/sci-fi.md` - Science Fiction genre conventions and examples ✅
- `rules/superhero.md` - Superhero genre conventions and examples ✅
- `rules/thriller.md` - Thriller genre conventions and examples ✅
- `rules/western.md` - Western genre conventions and examples ✅

### Additional Content (Planned)

- `rules/hybrids.md` - Hybrid genre combination strategies 🔲
- `examples/genre-applications.md` - Complete genre application examples 🔲

## Related Modules

- `writing-standards/screenplay/themes` - Thematic integration
- `writing-standards/screenplay/styles` - Narrative style guidelines
- `writing-standards/screenplay` - Core screenplay standards

