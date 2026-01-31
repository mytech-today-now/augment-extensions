# Screenplay Writing Standards

## Overview

Comprehensive screenplay writing and crafting standards for AI-driven content creation across multiple formats and industries.

**Version**: 1.0.0
**Type**: writing-standards
**Character Count**: ~163,500

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

### Final Draft (.fdx)
**Industry Standard** - Most widely used professional screenplay format

**Tools**:
- **Better Fountain** (VS Code): Export → Final Draft
- **Fountain CLI**: `fountain --fdx screenplay.fountain`
- **Highland 2**: Native Fountain support with FDX export
- **WriterDuet**: Import Fountain, export FDX

**Use Cases**:
- Professional submissions
- Studio collaboration
- Production scheduling
- Script breakdowns

### PDF
**Print-Ready** - Universal format for reading and distribution

**Tools**:
- **Better Fountain** (VS Code): `Ctrl+Shift+P` → "Fountain: Export to PDF"
- **Fountain CLI**: `fountain --pdf screenplay.fountain`
- **Highland 2**: Export → PDF
- **Wrap**: Online Fountain to PDF converter

**Formatting**:
- Industry-standard margins
- Courier 12pt font
- Page numbers
- Title page
- Proper scene numbering

**Use Cases**:
- Script distribution
- Table reads
- Submissions
- Archival

### HTML
**Web-Friendly** - For online viewing and sharing

**Tools**:
- **Better Fountain** (VS Code): Export → HTML
- **Fountain CLI**: `fountain --html screenplay.fountain`
- **Afterwriting**: Online Fountain editor with HTML export

**Features**:
- Responsive design
- Searchable text
- Hyperlinked scenes
- Mobile-friendly
- Easy sharing

**Use Cases**:
- Online portfolios
- Web publishing
- Collaborative review
- Mobile reading

### Conversion Workflow

**Fountain → Final Draft**:
```bash
# Using Better Fountain in VS Code
1. Open .fountain file
2. Ctrl+Shift+P
3. "Fountain: Export to Final Draft"
4. Save as .fdx
```

**Fountain → PDF**:
```bash
# Using Better Fountain in VS Code
1. Open .fountain file
2. Ctrl+Shift+P
3. "Fountain: Export to PDF"
4. Configure settings (title page, scene numbers)
5. Save as .pdf
```

**Fountain → HTML**:
```bash
# Using Fountain CLI
fountain --html screenplay.fountain > screenplay.html
```

### Recommended Tools

**VS Code + Better Fountain** (Free):
- Syntax highlighting
- Live preview
- Export to PDF/FDX/HTML
- Autocomplete
- Snippet support

**Highland 2** ($50):
- Native Fountain support
- Professional export options
- Revision tracking
- Gender analysis
- Sprint mode

**WriterDuet** (Free/Pro):
- Real-time collaboration
- Cloud-based
- Import/export Fountain
- Mobile apps
- Version control

**Fade In** ($80):
- Professional screenwriting software
- Fountain import/export
- Production features
- Cross-platform

### Export Best Practices

**Before Exporting**:
- ✅ Spell check
- ✅ Verify scene headings
- ✅ Check character name consistency
- ✅ Review dialogue formatting
- ✅ Confirm page count
- ✅ Add title page
- ✅ Number scenes (if required)

**For Submissions**:
- Use PDF for most submissions
- Use FDX for production/collaboration
- Include title page with contact info
- Follow specific submission guidelines
- Verify file size limits
- Test file opens correctly

## References

- [AMPAS Nicholl Fellowship Requirements](https://www.oscars.org/nicholl/requirements)
- [Fountain Specification](https://fountain.io/)
- [Final Draft](https://www.finaldraft.com/)
- Syd Field: "Screenplay: The Foundations of Screenwriting"
- Blake Snyder: "Save the Cat!"
- Joseph Campbell: "The Hero with a Thousand Faces"
- Robert McKee: "Story"

