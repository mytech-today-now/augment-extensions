# Screenplay Writing Standards

## Overview

Comprehensive screenplay writing and crafting standards for AI-driven content creation across multiple formats and industries.

**Version**: 1.0.0  
**Type**: writing-standards  
**Character Count**: ~TBD

## Key Benefits

✅ **Industry-Standard Formatting** - AMPAS Nicholl Fellowship formatting standards  
✅ **Narrative Frameworks** - Syd Field, Blake Snyder, Joseph Campbell structures  
✅ **Category-Specific Rules** - 8 screenplay categories (Hollywood, indie, TV, web, news, commercials, streaming, live TV)  
✅ **Character Development** - Programmatic character arcs, traits, motivations  
✅ **Dialogue Mastery** - Natural speech, subtext, character voice  
✅ **Screen Continuity** - Visual consistency rules (180-degree rule, match cuts)  
✅ **Fountain Format** - Industry-standard plain-text screenplay markup  
✅ **VS Code Integration** - Better Fountain extension support  
✅ **Export Tools** - Final Draft (.fdx), PDF, HTML export

## Installation

### With CLI (Recommended)

```bash
augx link writing-standards/screenplay
```

### Manual Setup

1. Copy `augment-extensions/writing-standards/screenplay/` to your project
2. Create `.augment/screenplay-config.json` with category selection
3. Reference rule files in your AI prompts

## Configuration

Create `.augment/screenplay-config.json`:

```json
{
  "categories": ["aaa-hollywood-films"],
  "universalRules": true,
  "fountainFormat": true,
  "exportFormats": ["fdx", "pdf"]
}
```

### Available Categories

1. **aaa-hollywood-films** - AAA Hollywood blockbusters
2. **independent-films** - Independent/art-house films
3. **tv-series** - Television series (episodic)
4. **web-content** - Web series and short-form content
5. **news-broadcasts** - News segments and broadcasts
6. **commercials** - Advertising and commercials
7. **streaming-content** - Streaming platform content
8. **live-tv-productions** - Live TV productions

## Directory Structure

```
augment-extensions/writing-standards/screenplay/
├── module.json                    # Module metadata
├── README.md                      # This file
├── rules/                         # Screenplay writing rules
│   ├── universal-formatting.md   # AMPAS formatting standards
│   ├── narrative-structures.md   # Three-act, beat sheets, hero's journey
│   ├── character-development.md  # Character arcs and development
│   ├── dialogue-writing.md       # Dialogue best practices
│   ├── screen-continuity.md      # Visual consistency rules
│   ├── pacing-timing.md          # Pacing and timing guidelines
│   ├── diversity-inclusion.md    # Diversity and inclusion standards
│   ├── aaa-hollywood-films.md    # AAA Hollywood category rules
│   ├── independent-films.md      # Independent film category rules
│   ├── tv-series.md              # TV series category rules
│   ├── web-content.md            # Web content category rules
│   ├── news-broadcasts.md        # News broadcast category rules
│   ├── commercials.md            # Commercial category rules
│   ├── streaming-content.md      # Streaming content category rules
│   └── live-tv-productions.md    # Live TV category rules
├── schemas/                       # JSON schemas for screenplay data
│   ├── character-profile.json    # Character profile schema
│   ├── beat-sheet.json           # Beat sheet schema
│   ├── plot-outline.json         # Plot outline schema
│   └── trope-inventory.json      # Trope inventory schema
└── examples/                      # Example screenplay files
    ├── aaa-hollywood-scene.fountain
    ├── independent-monologue.fountain
    ├── tv-episode-teaser.fountain
    ├── news-segment.fountain
    ├── commercial-30sec.fountain
    ├── character-profile-example.yaml
    ├── beat-sheet-example.yaml
    └── plot-outline-example.yaml
```

## Core Guidelines

### Universal Formatting (AMPAS Standards)

- **Font**: 12-point Courier or Courier New
- **Margins**: 1-inch top/bottom/right, 1.5-inch left
- **Page Length**: ~1 page per minute of screen time
- **Scene Headings**: ALL CAPS, INT./EXT., location, time of day
- **Action**: Present tense, active voice, visual descriptions
- **Dialogue**: Character name centered, dialogue indented
- **Transitions**: RIGHT-ALIGNED (FADE IN:, CUT TO:, DISSOLVE TO:)

### Narrative Structures

1. **Three-Act Structure** (Syd Field)
   - Act I: Setup (25% - pages 1-30)
   - Act II: Confrontation (50% - pages 30-90)
   - Act III: Resolution (25% - pages 90-120)

2. **Save the Cat Beat Sheet** (Blake Snyder)
   - Opening Image, Theme Stated, Setup, Catalyst, Debate, Break into Two, B Story, Fun and Games, Midpoint, Bad Guys Close In, All Is Lost, Dark Night of the Soul, Break into Three, Finale, Final Image

3. **Hero's Journey** (Joseph Campbell)
   - Ordinary World, Call to Adventure, Refusal, Meeting the Mentor, Crossing the Threshold, Tests/Allies/Enemies, Approach, Ordeal, Reward, The Road Back, Resurrection, Return with Elixir

### Character Development

- **Character Arc**: Transformation from beginning to end
- **Traits**: Physical, psychological, sociological
- **Motivations**: Internal and external goals
- **Relationships**: Protagonist, antagonist, allies, mentors
- **Dialogue Voice**: Unique speech patterns per character

## VS Code Integration

### Better Fountain Extension

1. Install: `ext install piersdeseilligny.betterfountain`
2. Open `.fountain` files for syntax highlighting
3. Use `Ctrl+Shift+P` → "Fountain: Export to PDF"

### Fountain Syntax

```fountain
INT. COFFEE SHOP - DAY

SARAH, 30s, sits alone with a laptop.

SARAH
(to herself)
This is it. The moment of truth.

She hits ENTER. Waits.

FADE OUT.
```

## Export Formats

- **Final Draft (.fdx)**: Industry-standard format
- **PDF**: Print-ready screenplay
- **HTML**: Web-friendly format

## References

- [AMPAS Nicholl Fellowship Requirements](https://www.oscars.org/nicholl/requirements)
- [Fountain Specification](https://fountain.io/)
- [Final Draft](https://www.finaldraft.com/)
- Syd Field: "Screenplay: The Foundations of Screenwriting"
- Blake Snyder: "Save the Cat!"
- Joseph Campbell: "The Hero with a Thousand Faces"
- Robert McKee: "Story"

