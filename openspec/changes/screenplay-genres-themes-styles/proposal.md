# Screenplay Writing Enhancements - Genres, Themes, and Styles

**Change ID**: `screenplay-genres-themes-styles`  
**Status**: Draft  
**Created**: 2026-01-31  
**JIRA**: AUG-9023

## Overview

Develop a comprehensive Augment extension module for screenplay writing enhancements that provides modular sub-features for genres, themes, and styles. This extension will guide Augmentcode AI in applying professional creative writing standards to screenplay generation, ensuring high-quality outputs across various creative writing projects.

## Problem Statement

The current screenplay writing module lacks comprehensive guidance for:
- **Genre-specific conventions**: Writers need structured rules for Action, Drama, Horror, Sci-Fi, and 15+ other genres
- **Thematic depth**: Screenplays require consistent exploration of themes like Redemption, Identity, Power, and Survival
- **Stylistic approaches**: Different narrative styles (Linear, Non-Linear, Ensemble, etc.) need specific guidelines
- **Modular selection**: Users cannot selectively enable specific enhancements without loading the entire module
- **Extensibility**: Current implementation is screenplay-specific and not adaptable to novels, games, or other narrative projects

## Proposed Solution

Create a modular extension system within `augment-extensions/writing-standards/screenplay/` with:

1. **Modular Architecture**: Independent sub-features for genres, themes, and styles
2. **Configuration System**: JSON/YAML-based selection mechanism for enabling specific features
3. **Comprehensive Coverage**:
   - **Genres**: 90% coverage with 18+ major categories and hybrids
   - **Themes**: 75% coverage with 15+ key motifs
   - **Styles**: 75% coverage with 13+ narrative approaches
4. **Deep Exploration**: Each concept explored to 85% depth with rules, guidelines, and examples
5. **Extensibility**: Adaptable to novels, game narratives, marketing copy, and other creative projects
6. **AI Integration**: Detailed prompts, templates, and validation rules for Augmentcode AI

## Key Benefits

- **Professional Quality**: Industry-standard guidance for screenplay writing
- **Flexibility**: Modular selection allows users to enable only needed features
- **Comprehensive**: Deep coverage of genres, themes, and styles with examples
- **Extensible**: Adaptable beyond screenplays to other narrative projects
- **AI-Powered**: Intelligent application of creative writing principles
- **Educational**: Rules and examples teach best practices

## Scope

### In Scope
- Modular sub-features for genres, themes, and styles
- Configuration system for selective feature activation
- 18+ genres with 85% topic exploration each
- 15+ themes with 85% topic exploration each
- 13+ styles with 85% topic exploration each
- Rules, guidelines, and examples for each concept
- Integration with Augmentcode AI via prompts and templates
- Extensibility hooks for non-screenplay projects
- Documentation with before/after examples
- Testing and validation framework

### Out of Scope
- Real-time screenplay editing tools
- Collaboration features (handled by version control)
- Final Draft or other screenplay software integration
- Automated screenplay generation (AI assists, doesn't replace)
- Market analysis or script coverage services

## Success Criteria

1. **Modular Installation**: Sub-features independently selectable via configuration
2. **Coverage Targets Met**:
   - Genres: 90% coverage, 85% depth per genre
   - Themes: 75% coverage, 85% depth per theme
   - Styles: 75% coverage, 85% depth per style
3. **AI Integration**: Prompts consistently apply enhancements
4. **Documentation**: Comprehensive guides with before/after examples
5. **Extensibility**: Successfully adaptable to at least 2 non-screenplay projects
6. **Testing**: All features pass validation with >80% test coverage
7. **Performance**: No conflicts between features, maintains fast load times

## Estimated Effort

- Design and Planning: 10 hours
- Implementation: 30 hours
- Testing and Documentation: 20 hours
- **Total**: 60 hours

## References

- Augment Framework: https://github.com/mytech-today-now/augment
- OpenSpec: https://github.com/Fission-AI/OpenSpec/
- Beads: https://github.com/steveyegge/beads
- Existing Screenplay Module: `augment-extensions/writing-standards/screenplay/`

## Example Enhancements

### Genre Application (Action)
**Before**: Basic chase scene with minimal detail  
**After**: High-stakes sequence with escalating tension, hero's internal conflict, explosive set pieces inspired by "Mad Max: Fury Road"

### Theme Integration (Redemption)
**Before**: Simple character journey from point A to B  
**After**: Layered arc with moral dilemmas, sacrificial acts, and thematic payoff similar to "The Godfather Part II"

### Style Application (Non-Linear)
**Before**: Linear plot with chronological events  
**After**: Interwoven timelines with timestamps, flashbacks, and thematic cohesion revealing twists like "Memento"

### Extensibility (Novel Outlining)
**Configuration**: `project_type: "novel", feature: "themes"`  
**Application**: Theme of "Identity" adapted to prose chapters with introspective monologues and chapter breaks

## Next Steps

1. Create detailed specification (specs.md)
2. Define implementation tasks (tasks.md)
3. Break down into Beads tasks for execution
4. Implement modular architecture
5. Develop comprehensive content for genres, themes, and styles
6. Create configuration system and AI integration
7. Test and validate with sample screenplays
8. Document and publish extension

