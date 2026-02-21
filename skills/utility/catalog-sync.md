---
id: catalog-sync
name: Catalog Sync
version: 1.0.0
category: utility
tags: [catalog, modules, sync, automation, maintenance]
tokenBudget: 2000
priority: medium
dependencies: []
cliCommand: augx-catalog
---

# Catalog Sync

## Purpose

Maintain and synchronize the MODULES.md catalog file with the current state of Augment Extension modules. Ensures catalog is always up-to-date with module metadata, character counts, and descriptions.

## Usage

1. **Check status**: Verify if catalog is out of date
2. **Update catalog**: Regenerate MODULES.md from module metadata
3. **Auto-sync**: Set up git hooks for automatic updates
4. **Validate**: Ensure all modules are documented

**Operations**:
- Check if catalog is out of date
- Force update catalog
- Auto-update only if out of date
- Install/remove git hooks for auto-sync

## Examples

### Example 1: Check Catalog Status

```bash
augx catalog --check
```

**Result**:
```
✓ Catalog is up to date
```

Or:
```
⚠ Catalog is out of date
```

### Example 2: Update Catalog

```bash
augx catalog
```

**Result**:
```
📚 Updating module catalog...

✓ Scanned 45 modules
✓ Updated MODULES.md
✓ Catalog synchronized
```

### Example 3: Auto-Update (Only if Out of Date)

```bash
augx catalog --auto
```

**Result**:
```
✓ Module catalog updated: MODULES.md
```

Or:
```
Catalog is already up to date
```

### Example 4: Custom Output Path

```bash
augx catalog --output docs/CATALOG.md
```

**Result**: Creates/updates catalog at custom location.

### Example 5: Install Git Hook

```bash
augx catalog hook
```

**Result**:
```
✓ Git hook installed: .git/hooks/pre-commit
✓ Catalog will auto-update on commit
```

### Example 6: Remove Git Hook

```bash
augx catalog hook --remove
```

**Result**:
```
✓ Git hook removed
```

## CLI

### Command Syntax

```bash
augx catalog [options]
augx catalog hook [options]
```

### Options

- `--output <path>` - Custom output path (default: MODULES.md)
- `--check` - Check if catalog is out of date (exit 1 if outdated)
- `--auto` - Update only if out of date
- `--json` - JSON output format

### Hook Options

- `--remove` - Remove git hook
- `--type <type>` - Hook type: pre-commit, post-commit (default: pre-commit)

### Examples

```bash
# Check status
augx catalog --check

# Force update
augx catalog

# Auto-update if needed
augx catalog --auto

# Custom output
augx catalog --output docs/MODULES.md

# Install git hook
augx catalog hook

# Remove git hook
augx catalog hook --remove

# Post-commit hook
augx catalog hook --type post-commit
```

## Notes

**Features**:
- **Automatic Detection**: Scans all module.json files
- **Character Counting**: Calculates accurate character counts
- **Git Integration**: Optional git hooks for auto-sync
- **CI/CD Ready**: Exit codes for validation in pipelines
- **Incremental**: Only updates if changes detected

**Catalog Format**:
```markdown
# Augment Extensions Module Catalog

## Coding Standards

### TypeScript Standards
- **Module**: `coding-standards/typescript`
- **Version**: 1.0.0
- **Character Count**: ~45,000
- **Description**: TypeScript coding standards...
```

**Use Cases**:
- Keep MODULES.md synchronized with module changes
- CI/CD validation (ensure catalog is current)
- Documentation generation
- Module discovery for AI agents
- Pre-commit validation

**Performance**:
- Scan time: ~100-500ms for 50 modules
- Update time: ~50-200ms
- Hook execution: < 100ms overhead

