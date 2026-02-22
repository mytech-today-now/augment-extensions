# Cinematic Styles Module - Migration Summary

**Date**: 2026-02-22  
**Version**: 1.0.0

## Overview

This document summarizes the refactoring of screenplay style guides from `ai-prompts/` into a proper sub-module structure within the screenplay module.

## What Was Done

### 1. Created New Sub-Module Structure

Created `augment-extensions/writing-standards/screenplay/cinematic-styles/` as a new sub-module following the same pattern as the existing `styles/` sub-module.

**Directory Structure**:
```
cinematic-styles/
├── module.json                    # Module metadata
├── README.md                      # Module overview and usage
├── MIGRATION.md                   # This file
├── rules/                         # Film/franchise style guides
│   ├── mcu-avengers.md           # Marvel Cinematic Universe style
│   └── blue-ruin.md              # Blue Ruin incompetent protagonist style
└── examples/
    └── style-applications.md      # Practical application examples
```

### 2. Migrated Style Guides

**Source Files** (original location):
- `ai-prompts/Avengers-style-guide.md` → `cinematic-styles/rules/mcu-avengers.md`
- `ai-prompts/BlueRuin-style-guide.md` → `cinematic-styles/rules/blue-ruin.md`

**Note**: Original files remain in `ai-prompts/` for now. They can be deleted once migration is verified.

### 3. Created Module Metadata

**module.json**:
- Name: `cinematic-styles`
- Version: 1.0.0
- Character Count: ~150,000 (2 style guides)
- Category: `screenplay`
- Type: `writing-standards`

### 4. Updated Parent Module

Updated `augment-extensions/writing-standards/screenplay/module.json` to include `subModules` array documenting all available sub-modules:
- `styles` - Narrative style techniques
- `cinematic-styles` - Film/franchise style guides (NEW)
- `genres` - Genre conventions (future)
- `themes` - Thematic integration (future)

Updated `augment-extensions/writing-standards/screenplay/README.md` to document the new sub-module structure.

## Usage

### Linking the Module

```bash
# Link the cinematic-styles sub-module
augx link writing-standards/screenplay/cinematic-styles

# Or link the entire screenplay module (includes all sub-modules)
augx link writing-standards/screenplay
```

### Configuration

Add to `.augment/screenplay-config.json`:

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

### Querying the Module

```bash
# Show all available cinematic styles
augx show writing-standards/screenplay/cinematic-styles

# Show specific style guide
augx show writing-standards/screenplay/cinematic-styles/mcu-avengers
```

## Benefits of This Structure

1. **Modular**: Users can selectively load only the cinematic styles they need
2. **Scalable**: Easy to add new film/franchise style guides in the future
3. **Organized**: Clear separation between narrative styles and cinematic styles
4. **Discoverable**: Follows established sub-module pattern (like ADR in software-architecture)
5. **Maintainable**: Each style guide is a standalone file with clear naming

## Future Additions

The following cinematic style guides are planned for future releases:

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

## Cleanup Tasks

Once migration is verified:

1. **Optional**: Delete original files from `ai-prompts/`:
   - `ai-prompts/Avengers-style-guide.md`
   - `ai-prompts/BlueRuin-style-guide.md`

2. **Update**: Any references to the old file paths in documentation or prompts

## Verification

To verify the migration was successful:

```bash
# Check directory structure
ls augment-extensions/writing-standards/screenplay/cinematic-styles/

# Verify files exist
cat augment-extensions/writing-standards/screenplay/cinematic-styles/rules/mcu-avengers.md | head -20
cat augment-extensions/writing-standards/screenplay/cinematic-styles/rules/blue-ruin.md | head -20

# Test linking
augx link writing-standards/screenplay/cinematic-styles
augx show writing-standards/screenplay/cinematic-styles
```

## Related Documentation

- `augment-extensions/writing-standards/screenplay/README.md` - Main screenplay module documentation
- `augment-extensions/writing-standards/screenplay/styles/README.md` - Narrative styles sub-module
- `augment-extensions/writing-standards/screenplay/cinematic-styles/README.md` - This sub-module's documentation

## Questions or Issues

If you encounter any issues with this migration or have questions about the new structure, please refer to:
- The main screenplay module README
- The cinematic-styles README
- The example applications in `examples/style-applications.md`

