# Commercial Writing Standards - Configuration System

> **Version:** 1.0.0  
> **Last Updated:** 2026-03-03

## Table of Contents

- [Overview](#overview)
- [Configuration Schema](#configuration-schema)
- [Override Semantics](#override-semantics)
- [Conflict Detection](#conflict-detection)
- [Integration with .augment/config.json](#integration-with-augmentconfigjson)
- [Examples](#examples)

---

## Overview

The Commercial Writing Standards module uses a **modular configuration system** that allows fine-grained control over which rules apply to your project. Configuration can be set at multiple levels with clear precedence rules.

### Configuration Levels

1. **Module Defaults** (lowest precedence) - Defined in `module.json`
2. **Global Config** - `.augment/config.json` (project-wide settings)
3. **Commercial Config** - `.augment/commercials-config.json` (commercial-specific)
4. **File-Level Overrides** (highest precedence) - Frontmatter in `.fountain` files

---

## Configuration Schema

### File: `.augment/commercials-config.json`

```json
{
  "$schema": "https://augment-extensions.dev/schemas/commercials-config.json",
  "version": "1.0.0",
  "enabled": true,
  "formats": {
    "tv": {
      "enabled": true,
      "durations": ["15sec", "30sec", "60sec"]
    },
    "streaming": {
      "enabled": true,
      "types": ["pre-roll", "mid-roll"]
    },
    "digital": {
      "enabled": false,
      "types": ["banner", "social-media"]
    },
    "radio": {
      "enabled": false
    }
  },
  "legalCompliance": {
    "enabled": true,
    "ftcGuidelines": true,
    "disclosureRequirements": true,
    "healthClaims": false,
    "financialServices": false
  },
  "brandGuidelines": {
    "toneOfVoice": "professional",
    "prohibitedWords": [],
    "requiredDisclosures": [],
    "logoUsage": "standard"
  },
  "persuasionTechniques": {
    "enabled": true,
    "allowedTechniques": [
      "emotional-appeal",
      "social-proof",
      "scarcity",
      "authority"
    ],
    "prohibitedTechniques": []
  },
  "productionNotes": {
    "enabled": true,
    "aiVideoGeneration": true,
    "shotListGeneration": true
  },
  "validation": {
    "strictMode": false,
    "warningsAsErrors": false,
    "characterCountLimits": true
  }
}
```

### Schema Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | `true` | Enable/disable entire module |
| `formats` | object | See above | Format-specific settings |
| `legalCompliance` | object | See above | Legal compliance settings |
| `brandGuidelines` | object | `{}` | Brand-specific rules |
| `persuasionTechniques` | object | See above | Persuasion technique controls |
| `productionNotes` | object | See above | Production integration settings |
| `validation` | object | See above | Validation behavior |

---

## Override Semantics

### Precedence Order (Highest to Lowest)

1. **File-Level Frontmatter** (`.fountain` file)
2. **Commercial Config** (`.augment/commercials-config.json`)
3. **Global Config** (`.augment/config.json`)
4. **Module Defaults** (`module.json`)

### Override Rules

- **Additive**: Arrays are merged (union)
- **Replacement**: Objects replace entirely unless `merge: true` is specified
- **Boolean**: Higher precedence always wins

### Example: File-Level Override

```fountain
---
config:
  formats: ["tv-30sec"]
  legalCompliance:
    ftcGuidelines: true
  validation:
    strictMode: true
---

INT. KITCHEN - DAY
```

---

## Conflict Detection

The configuration system automatically detects and reports conflicts:

### Conflict Types

1. **Format Conflicts**: Multiple incompatible formats enabled
2. **Legal Conflicts**: Contradictory legal requirements
3. **Brand Conflicts**: Conflicting brand guidelines
4. **Technique Conflicts**: Prohibited technique in allowed list

### Conflict Resolution

**Strategy**: Fail-fast with clear error messages

```json
{
  "error": "Configuration Conflict",
  "type": "format-conflict",
  "message": "Cannot enable both 'tv-15sec' and 'tv-60sec' for same file",
  "resolution": "Choose one format per file",
  "location": ".augment/commercials-config.json:5"
}
```

### Validation Command

```bash
augx validate commercials-config
```

**Output**:
```
✓ Configuration valid
✓ No conflicts detected
✓ All required fields present
```

---

## Integration with .augment/config.json

### Global Configuration

```json
{
  "modules": {
    "screenplay": {
      "enabled": true,
      "categories": ["commercials"]
    }
  },
  "commercials": {
    "$ref": ".augment/commercials-config.json"
  }
}
```

### Inheritance

Commercial config inherits from screenplay config:

```json
{
  "screenplay": {
    "fountainFormat": true,
    "exportFormats": ["pdf", "fdx"]
  },
  "commercials": {
    "formats": ["tv-30sec"]
    // Inherits fountainFormat and exportFormats from screenplay
  }
}
```

---

## Examples

### Example 1: TV Commercial Only

```json
{
  "enabled": true,
  "formats": {
    "tv": {
      "enabled": true,
      "durations": ["30sec"]
    },
    "streaming": { "enabled": false },
    "digital": { "enabled": false },
    "radio": { "enabled": false }
  }
}
```

### Example 2: Streaming with Legal Compliance

```json
{
  "enabled": true,
  "formats": {
    "streaming": {
      "enabled": true,
      "types": ["pre-roll"]
    }
  },
  "legalCompliance": {
    "enabled": true,
    "ftcGuidelines": true,
    "disclosureRequirements": true
  }
}
```

### Example 3: Brand-Specific Configuration

```json
{
  "enabled": true,
  "brandGuidelines": {
    "toneOfVoice": "friendly",
    "prohibitedWords": ["cheap", "free", "guarantee"],
    "requiredDisclosures": [
      "Results may vary",
      "See website for details"
    ]
  }
}
```

---

## Configuration Validation

### Validation Rules

1. ✅ **Schema Compliance**: Must match JSON schema
2. ✅ **No Conflicts**: No contradictory settings
3. ✅ **Required Fields**: All required fields present
4. ✅ **Valid Values**: Enum values must be valid
5. ✅ **Dependencies**: Dependent settings must be enabled

### Validation Errors

```json
{
  "errors": [
    {
      "field": "formats.tv.durations",
      "message": "Invalid duration '45sec'. Valid: 15sec, 30sec, 60sec",
      "severity": "error"
    }
  ]
}
```

---

## Best Practices

1. **Start Simple**: Enable only formats you need
2. **Use Inheritance**: Leverage screenplay config for common settings
3. **Validate Early**: Run `augx validate` before committing
4. **Document Overrides**: Comment why you override defaults
5. **Version Control**: Track config changes in git

---

## Troubleshooting

### Common Issues

**Issue**: Configuration not applied  
**Solution**: Check precedence order, ensure file is in correct location

**Issue**: Validation fails  
**Solution**: Run `augx validate commercials-config --verbose` for details

**Issue**: Conflicts detected  
**Solution**: Review conflict report, adjust settings to resolve

---

## References

- [JSON Schema Specification](https://json-schema.org/)
- [Screenplay Configuration](../schemas/screenplay-config.json)
- [Module Configuration](module.json)

