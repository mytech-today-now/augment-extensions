# Screenplay Module Integration Guide

## Overview

The Screenplay Writing Standards module is designed with a modular architecture that allows selective activation of sub-features (genres, themes, styles) based on project needs.

## Architecture

```
screenplay/                    # Base module
├── module.json               # Parent module metadata
├── README.md                 # Main documentation
├── rules/                    # Universal screenplay rules
├── schemas/                  # Configuration schemas
│   └── feature-selection.json
├── genres/                   # Genre sub-feature
│   ├── module.json
│   ├── README.md
│   └── rules/
├── themes/                   # Theme sub-feature
│   ├── module.json
│   ├── README.md
│   └── rules/
└── styles/                   # Style sub-feature
    ├── module.json
    ├── README.md
    └── rules/
```

## Sub-Feature Integration

### 1. Genres Module

**Purpose**: Apply genre-specific conventions to screenplay writing

**Integration Points**:
- Loaded when `screenplay_enhancements.features.genres.enabled = true`
- Selected genres specified in `screenplay_enhancements.features.genres.selected[]`
- Supports hybrid mode for multi-genre projects

**Example Configuration**:
```json
{
  "screenplay_enhancements": {
    "features": {
      "genres": {
        "enabled": true,
        "selected": ["action", "thriller"],
        "hybridMode": true,
        "conflictResolution": "merge"
      }
    }
  }
}
```

**Conflict Resolution**:
- `merge`: Combine rules from all selected genres
- `priority`: First genre takes precedence
- `manual`: Require explicit resolution

### 2. Themes Module

**Purpose**: Integrate thematic elements into screenplay narrative

**Integration Points**:
- Loaded when `screenplay_enhancements.features.themes.enabled = true`
- Selected themes specified in `screenplay_enhancements.features.themes.selected[]`
- Primary theme takes precedence in conflicts

**Example Configuration**:
```json
{
  "screenplay_enhancements": {
    "features": {
      "themes": {
        "enabled": true,
        "selected": ["redemption", "revenge", "identity"],
        "primaryTheme": "redemption",
        "integrationLevel": "moderate"
      }
    }
  }
}
```

**Integration Levels**:
- `subtle`: Theme present but not dominant
- `moderate`: Theme clearly present and influential
- `prominent`: Theme drives the narrative

### 3. Styles Module

**Purpose**: Apply narrative style techniques to screenplay structure

**Integration Points**:
- Loaded when `screenplay_enhancements.features.styles.enabled = true`
- Single style specified in `screenplay_enhancements.features.styles.selected[]`
- Typically only one style per screenplay

**Example Configuration**:
```json
{
  "screenplay_enhancements": {
    "features": {
      "styles": {
        "enabled": true,
        "selected": ["non-linear"]
      }
    }
  }
}
```

## Loading Mechanism

### Configuration Loader

The configuration loader (`utils/file-organization.ts`) reads `.augment/screenplay-config.json` and:

1. Validates against `schemas/feature-selection.json`
2. Loads enabled sub-features
3. Merges rules based on conflict resolution strategy
4. Provides unified rule set to AI

### Validation

Validation occurs at multiple levels:

1. **Schema Validation**: JSON schema validation of configuration
2. **Conflict Detection**: Identifies conflicting rules between features
3. **Completeness Check**: Ensures all required features are configured

## Usage Patterns

### Pattern 1: Single Genre, Single Theme, Single Style

```json
{
  "screenplay_enhancements": {
    "enabled": true,
    "features": {
      "genres": {
        "enabled": true,
        "selected": ["horror"]
      },
      "themes": {
        "enabled": true,
        "selected": ["survival"],
        "primaryTheme": "survival"
      },
      "styles": {
        "enabled": true,
        "selected": ["minimalist"]
      }
    }
  }
}
```

**Result**: Horror screenplay with survival theme using minimalist narrative style

### Pattern 2: Hybrid Genre, Multiple Themes

```json
{
  "screenplay_enhancements": {
    "enabled": true,
    "features": {
      "genres": {
        "enabled": true,
        "selected": ["action", "comedy"],
        "hybridMode": true
      },
      "themes": {
        "enabled": true,
        "selected": ["friendship", "redemption"],
        "primaryTheme": "friendship"
      }
    }
  }
}
```

**Result**: Action-comedy with friendship as primary theme and redemption as secondary

## Best Practices

1. **Start Simple**: Begin with single genre, theme, and style
2. **Test Combinations**: Validate feature combinations before full implementation
3. **Document Choices**: Record why specific features were selected
4. **Monitor Conflicts**: Review conflict resolution logs
5. **Iterate**: Adjust feature selection based on results

## Troubleshooting

### Issue: Conflicting Rules

**Symptom**: Rules from different features contradict each other

**Solution**: 
- Set `conflictResolution: "priority"` to use first feature's rules
- Review conflict detection logs
- Manually resolve conflicts by adjusting feature selection

### Issue: Feature Not Loading

**Symptom**: Selected feature rules not appearing

**Solution**:
- Verify `enabled: true` for the feature
- Check feature is in `selected[]` array
- Validate configuration against schema
- Review loader logs for errors

## Version Compatibility

- **Base Module**: v1.0.0
- **Genres Module**: v1.0.0
- **Themes Module**: v1.0.0
- **Styles Module**: v1.0.0

All sub-features are compatible with base module v1.0.0+.

