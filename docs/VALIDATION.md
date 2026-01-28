# Module Validation System

This document describes the comprehensive validation system for Augment Extensions modules.

## Overview

The validation system ensures module quality, consistency, and project-agnostic content through automated checks.

## Validation Categories

### 1. Module Structure Validation

**Purpose**: Ensure all required files and directories exist.

**Checks**:
- ✅ `module.json` exists and is valid JSON
- ✅ `README.md` exists
- ✅ `rules/` directory exists
- ✅ At least one `.md` file in `rules/` directory
- ⚠️ `examples/` directory exists (optional but recommended)

**Command**:
```bash
augx validate <module-name>
```

### 2. Module Category Validation

**Purpose**: Ensure module type matches directory structure.

**Checks**:
- ✅ Module type in `module.json` matches parent directory
  - `coding-standards/typescript` → type must be `coding-standards`
  - `domain-rules/api-design` → type must be `domain-rules`
  - `workflows/openspec` → type must be `workflows`
  - `examples/design-patterns` → type must be `examples`

**Valid Types**:
- `coding-standards`
- `domain-rules`
- `workflows`
- `examples`

### 3. Semantic Versioning Validation

**Purpose**: Ensure version follows semantic versioning specification.

**Format**: `MAJOR.MINOR.PATCH[-prerelease][+build]`

**Valid Examples**:
- `1.0.0` - Basic version
- `1.0.0-alpha` - Pre-release
- `1.0.0-beta.1` - Pre-release with number
- `1.0.0+20130313144700` - Build metadata
- `1.0.0-beta+exp.sha.5114f85` - Pre-release with build

**Invalid Examples**:
- `1.0` - Missing patch version
- `v1.0.0` - Prefix not allowed
- `1.0.0.0` - Too many version parts

**Version Comparison**:
```typescript
compareSemanticVersions('2.0.0', '1.0.0') // Returns 1 (2.0.0 > 1.0.0)
compareSemanticVersions('1.0.0', '2.0.0') // Returns -1 (1.0.0 < 2.0.0)
compareSemanticVersions('1.0.0', '1.0.0') // Returns 0 (equal)
```

**Version Ranges**:
```typescript
satisfiesVersionRange('1.2.3', '^1.0.0') // true (compatible)
satisfiesVersionRange('1.0.5', '~1.0.0') // true (patch updates)
satisfiesVersionRange('1.0.1', '>=1.0.0') // true (greater or equal)
```

### 4. Project-Agnostic Content Validation

**Purpose**: Ensure modules don't contain project-specific paths or URLs.

**Checks**:
- ⚠️ No Windows absolute paths (`C:\`, `D:\`)
- ⚠️ No Linux home paths (`/home/username/`)
- ⚠️ No macOS home paths (`/Users/username/`)
- ⚠️ No project-specific URLs (excluding common registries)

**Allowed URLs**:
- `github.com`
- `npmjs.com`
- `pypi.org`
- `crates.io`

**Example Warnings**:
```
⚠ Potential hardcoded path in example.md: C:\Users\john\project
⚠ Potential project-specific URL in guide.md: https://mycompany.com/api
```

### 5. Documentation Validation

**Purpose**: Ensure comprehensive and well-structured documentation.

**README.md Required Sections**:
- ✅ Title (# heading)
- ✅ Overview
- ✅ Contents
- ✅ Character Count

**README.md Recommended Sections**:
- ⚠️ Usage
- ⚠️ Installation or Setup

**Rule Files Checks**:
- ✅ At least 100 characters
- ✅ Contains markdown headers
- ⚠️ Contains code examples (recommended)
- ⚠️ Contains actionable content (lists or steps)

**module.json Checks**:
- ✅ `name` field present
- ✅ `version` field present and valid
- ✅ `displayName` field present
- ✅ `description` field present (20-200 characters recommended)
- ✅ `type` field present and valid
- ⚠️ `tags` field present (recommended)
- ⚠️ `augment.characterCount` field present (required for catalog)
- ⚠️ `augment.priority` field present (recommended)

**Examples Requirements**:
- ✅ Examples modules MUST have files in `examples/` directory
- ⚠️ Coding standards modules SHOULD have examples (recommended)
- ⚠️ Other modules MAY have examples (optional)

### 6. Character Count Validation

**Purpose**: Ensure declared character count matches actual count.

**Checks**:
- ✅ Actual count matches `augment.characterCount` in `module.json`
- ⚠️ Character count declared in `module.json`
- ⚠️ Module size within recommended limits

**Size Categories**:
- **Small**: < 10,000 characters
- **Medium**: 10,000 - 25,000 characters
- **Large**: 25,000 - 50,000 characters
- **Too Large**: > 50,000 characters (consider splitting)

**Calculation**:
```bash
# PowerShell
Get-ChildItem -Path "augment-extensions/category/module" -Recurse -File | Get-Content -Raw | Measure-Object -Character | Select-Object -ExpandProperty Characters

# Bash
find augment-extensions/category/module -type f -exec wc -m {} + | tail -1
```

## Running Validation

### Basic Validation

```bash
augx validate <module-name>
```

### Verbose Validation

```bash
augx validate <module-name> --verbose
```

Shows detailed information including:
- All validation checks
- Module details (name, version, type)
- File listings (rules, examples)
- Character count breakdown

### Example Output

```
🔍 Validating module: coding-standards/typescript

1. Module Structure
  ✓ Module structure is valid

2. Module Category
  ✓ Module type matches directory category (coding-standards)

3. Project-Agnostic Content
  ✓ No project-specific content detected

4. Documentation
  ✓ Documentation is complete
  ⚠ module.json missing tags field (recommended for discoverability)

5. Character Count
  Actual: 15,420 characters
  Declared: 15,420 characters
  ✓ Character count matches declaration
  Size category: medium

Summary
✓ Validation passed
```

## Catalog Auto-Update

### Manual Update

```bash
# Update catalog
augx catalog

# Check if out of date
augx catalog --check

# Auto-update only if needed
augx catalog --auto
```

### Git Hook Setup

```bash
# Set up pre-commit hook
augx catalog-hook

# Set up post-commit hook
augx catalog-hook --type post-commit

# Remove hook
augx catalog-hook --remove
```

The git hook automatically:
1. Detects changes to `module.json` files
2. Updates `MODULES.md` catalog
3. Adds catalog to commit if changed

## Best Practices

1. **Always validate before committing**
   ```bash
   augx validate <module-name> --verbose
   ```

2. **Set up catalog auto-update**
   ```bash
   augx catalog-hook
   ```

3. **Keep character counts accurate**
   - Update `augment.characterCount` after changes
   - Run validation to verify

4. **Maintain project-agnostic content**
   - Use relative paths
   - Avoid hardcoded URLs
   - Use placeholders for examples

5. **Write comprehensive documentation**
   - Include all required sections
   - Add code examples
   - Provide actionable steps

## Troubleshooting

### Validation Fails

1. Check error messages for specific issues
2. Fix reported errors
3. Re-run validation
4. Use `--verbose` for detailed output

### Character Count Mismatch

1. Recalculate actual count
2. Update `module.json`
3. Re-run validation

### Project-Specific Content Warnings

1. Review flagged content
2. Replace with generic examples
3. Use placeholders or relative paths
4. Re-run validation

## See Also

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Module creation guidelines
- [Module Development](./.augment/rules/module-development.md) - Detailed development guide
- [Character Count Management](./.augment/rules/character-count-management.md) - Managing limits

