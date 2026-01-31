# Screenplay Writing Enhancements - Specification

**Change ID**: `screenplay-genres-themes-styles`  
**Version**: 1.0.0  
**Status**: Draft

## Architecture

### System Components

```
augment-extensions/writing-standards/screenplay/
├── module.json (MODIFIED)
├── README.md (MODIFIED)
├── genres/ (ADDED)
│   ├── module.json
│   ├── README.md
│   ├── rules/
│   │   ├── action.md
│   │   ├── adventure.md
│   │   ├── comedy.md
│   │   ├── drama.md
│   │   ├── horror.md
│   │   ├── sci-fi.md
│   │   ├── fantasy.md
│   │   ├── romance.md
│   │   ├── thriller.md
│   │   ├── mystery.md
│   │   ├── western.md
│   │   ├── historical.md
│   │   ├── biographical.md
│   │   ├── animation.md
│   │   ├── documentary.md
│   │   ├── musical.md
│   │   ├── noir.md
│   │   ├── superhero.md
│   │   └── hybrids.md
│   └── examples/
│       └── genre-applications.md
├── themes/ (ADDED)
│   ├── module.json
│   ├── README.md
│   ├── rules/
│   │   ├── redemption.md
│   │   ├── love.md
│   │   ├── revenge.md
│   │   ├── identity.md
│   │   ├── power.md
│   │   ├── survival.md
│   │   ├── friendship.md
│   │   ├── betrayal.md
│   │   ├── growth.md
│   │   ├── isolation.md
│   │   ├── justice.md
│   │   ├── ambition.md
│   │   ├── fate.md
│   │   ├── technology.md
│   │   └── environment.md
│   └── examples/
│       └── theme-integrations.md
├── styles/ (ADDED)
│   ├── module.json
│   ├── README.md
│   ├── rules/
│   │   ├── linear.md
│   │   ├── non-linear.md
│   │   ├── ensemble.md
│   │   ├── minimalist.md
│   │   ├── epic.md
│   │   ├── satirical.md
│   │   ├── poetic.md
│   │   ├── realistic.md
│   │   ├── surreal.md
│   │   ├── experimental.md
│   │   ├── voice-over.md
│   │   ├── flashback.md
│   │   └── dialogue-centric.md
│   └── examples/
│       └── style-applications.md
└── schemas/ (ADDED)
    ├── screenplay-config.json (MODIFIED)
    └── feature-selection.json (ADDED)
```

## Functional Requirements

### FR-1: Modular Feature Selection

**Description**: Enable users to selectively activate genres, themes, and styles

**Configuration Schema** (`feature-selection.json`):
```json
{
  "screenplay_enhancements": {
    "enabled": true,
    "features": {
      "genres": {
        "enabled": true,
        "selected": ["action", "sci-fi", "thriller"]
      },
      "themes": {
        "enabled": true,
        "selected": ["redemption", "identity", "power"]
      },
      "styles": {
        "enabled": true,
        "selected": ["non-linear", "ensemble"]
      }
    },
    "conflict_detection": true,
    "extensibility": {
      "project_type": "screenplay",
      "custom_hooks": []
    }
  }
}
```

**Processing**:
1. Load configuration from `.augment/screenplay-config.json`
2. Validate selected features exist
3. Check for conflicts (e.g., minimalist style + epic genre)
4. Load only selected feature modules
5. Merge rules and guidelines
6. Apply to AI prompts

**Outputs**:
- Active feature set
- Conflict warnings (if any)
- Merged rule set for AI

### FR-2: Genre Coverage (90% Target)

**Required Genres** (18 total):
1. Action
2. Adventure
3. Comedy
4. Drama
5. Horror
6. Sci-Fi
7. Fantasy
8. Romance
9. Thriller
10. Mystery
11. Western
12. Historical
13. Biographical
14. Animation
15. Documentary
16. Musical
17. Noir
18. Superhero

**Hybrid Genres**:
- Rom-Com (Romance + Comedy)
- Sci-Fi Horror
- Action-Comedy
- Historical Drama
- Psychological Thriller

**Per-Genre Content** (85% depth):
- **Rules**: 5-10 core principles (e.g., "Action: Escalate stakes every 10 pages")
- **Guidelines**: 10-15 best practices (e.g., "Use visual action over exposition")
- **Examples**: 3-5 film references with specific scenes
- **Common Pitfalls**: 3-5 mistakes to avoid
- **Character Archetypes**: Typical roles for the genre
- **Structure Notes**: Act breakdown specific to genre

### FR-3: Theme Coverage (75% Target)

**Required Themes** (15 total):
1. Redemption
2. Love
3. Revenge
4. Identity
5. Power
6. Survival
7. Friendship
8. Betrayal
9. Growth
10. Isolation
11. Justice
12. Ambition
13. Fate
14. Technology's Impact
15. Environmental Concerns

**Per-Theme Content** (85% depth):
- **Core Concept**: Definition and narrative purpose
- **Rules**: 5-8 principles for thematic consistency
- **Integration Guidelines**: How to weave theme through acts
- **Character Connection**: How theme affects character arcs
- **Subtext Techniques**: Subtle vs. explicit thematic expression
- **Examples**: 3-5 films with strong thematic execution
- **Thematic Payoff**: Resolution strategies

### FR-4: Style Coverage (75% Target)

**Required Styles** (13 total):
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

**Per-Style Content** (85% depth):
- **Definition**: What defines this style
- **Rules**: 5-8 structural requirements
- **Pacing Guidelines**: Rhythm and tempo considerations
- **Visual Storytelling**: Camera and scene direction notes
- **Dialogue Approach**: How dialogue serves the style
- **Examples**: 3-5 films exemplifying the style
- **Technical Considerations**: Formatting and script notes

### FR-5: AI Integration

**Prompt Templates**:
```markdown
# Genre Application Prompt
You are writing a {genre} screenplay. Apply these rules:
{genre_rules}

Key guidelines:
{genre_guidelines}

Reference examples: {genre_examples}

Ensure the screenplay maintains {genre} conventions while being original.
```

**Validation Rules**:
- Genre adherence score (0-100)
- Theme consistency check
- Style compliance verification
- Conflict detection between features

**Output Enhancement**:
- Before/after comparisons
- Inline suggestions
- Rule violation warnings
- Best practice recommendations

### FR-6: Extensibility Framework

**Project Type Adapters**:
```json
{
  "adapters": {
    "novel": {
      "chapter_mapping": "act_structure",
      "prose_conversion": true,
      "theme_integration": "introspective"
    },
    "game_narrative": {
      "branching_support": true,
      "player_agency": "high",
      "style_adaptation": "interactive"
    },
    "marketing_copy": {
      "genre_as_tone": true,
      "brevity_mode": true,
      "theme_simplification": true
    }
  }
}
```

**Custom Hooks**:
- `onFeatureLoad(feature, config)`
- `onRuleApply(rule, context)`
- `onConflictDetect(feature1, feature2)`
- `onExtensibilityAdapt(projectType, features)`

## Non-Functional Requirements

### NFR-1: Performance
- Feature loading: <500ms
- Configuration parsing: <100ms
- Rule merging: <200ms
- No impact on existing screenplay module performance

### NFR-2: Modularity
- Each sub-feature independently loadable
- No circular dependencies
- Clear separation of concerns
- Minimal coupling between features

### NFR-3: Maintainability
- Consistent file structure across features
- Standardized rule format
- Comprehensive inline documentation
- Version compatibility tracking

### NFR-4: Usability
- Clear configuration examples
- Helpful error messages
- Conflict resolution suggestions
- Progressive disclosure of complexity

## Data Models

### Genre Model
```typescript
interface Genre {
  id: string;
  name: string;
  category: 'primary' | 'hybrid';
  rules: Rule[];
  guidelines: Guideline[];
  examples: Example[];
  archetypes: Archetype[];
  structure: StructureNotes;
  conflicts: string[]; // IDs of conflicting features
}
```

### Theme Model
```typescript
interface Theme {
  id: string;
  name: string;
  concept: string;
  rules: Rule[];
  integration: IntegrationGuideline[];
  characterConnection: string;
  subtextTechniques: Technique[];
  examples: Example[];
  payoff: PayoffStrategy[];
}
```

### Style Model
```typescript
interface Style {
  id: string;
  name: string;
  definition: string;
  rules: Rule[];
  pacing: PacingGuideline[];
  visualStorytelling: VisualNote[];
  dialogueApproach: DialogueGuideline[];
  examples: Example[];
  technicalNotes: TechnicalNote[];
}
```

## Integration Points

### Existing Screenplay Module
- Extends base screenplay rules
- Inherits formatting standards
- Shares example library
- Uses common validation framework

### Augmentcode AI
- Prompt template injection
- Rule-based generation guidance
- Validation feedback loop
- Example-driven learning

### VS Code Extension
- Configuration UI (future)
- Inline suggestions (future)
- Conflict warnings in editor
- Quick-pick feature selection

## Testing Strategy

### Unit Tests
- Configuration parsing
- Feature loading
- Rule merging
- Conflict detection

### Integration Tests
- Multi-feature activation
- AI prompt generation
- Extensibility adapters
- Before/after validation

### Validation Tests
- Coverage verification (90%/75%/75%)
- Depth verification (85% per concept)
- Example quality review
- Professional standards compliance

## Migration Path

### Phase 1: Core Infrastructure
- Create modular structure
- Implement configuration system
- Set up testing framework

### Phase 2: Content Development
- Develop genre content (18 genres)
- Develop theme content (15 themes)
- Develop style content (13 styles)

### Phase 3: AI Integration
- Create prompt templates
- Implement validation rules
- Build example library

### Phase 4: Extensibility
- Develop project adapters
- Create custom hooks
- Document extension API

### Phase 5: Testing & Documentation
- Comprehensive testing
- User documentation
- API documentation
- Example showcase

