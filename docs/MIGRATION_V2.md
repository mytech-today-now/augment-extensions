# Migration Guide: v1.x to v2.0.0

This guide helps you migrate from Augment Extensions v1.x to v2.0.0, which introduces a comprehensive module versioning system.

## Overview

Version 2.0.0 introduces **breaking changes** to the module system:

- **Module Versioning**: All modules now have semantic versions (MAJOR.MINOR.PATCH)
- **Version Selection**: CLI and GUI support explicit version selection
- **Metadata Files**: Modules now include VERSION, CHANGELOG.md, and metadata.json
- **Enhanced CLI**: New commands for version management (`use`, `upgrade`, `version-info`)
- **Modern GUI**: Redesigned TUI with tree navigation, version selection, and search

## Breaking Changes

### 1. Module Structure Changes

**Before (v1.x)**:
```
augment-extensions/coding-standards/typescript/
├── module.json
├── README.md
└── rules/
```

**After (v2.0.0)**:
```
augment-extensions/coding-standards/typescript/
├── VERSION              # NEW: Semantic version (e.g., 2.0.0)
├── CHANGELOG.md         # NEW: Version history
├── metadata.json        # NEW: Compatibility info
├── module.json
├── README.md
└── rules/
```

### 2. CLI Command Changes

**Removed**:
- None (all v1.x commands still work)

**Added**:
- `augx use <module> [--version <version>] [--pin]` - Select specific module version
- `augx upgrade <module> [--force] [--dry-run]` - Upgrade module to latest version
- `augx version-info <module> [--version <version>]` - Show detailed version information
- `augx list --versions` - Show available versions for all modules

**Modified**:
- `augx list` - Now shows current version for each module
- `augx show <module>` - Now includes version information
- `augx gui` - Completely redesigned with version selection

### 3. Configuration Schema Changes

**Before (v1.x)** - `.augment/extensions.json`:
```json
{
  "linkedModules": [
    "coding-standards/typescript",
    "domain-rules/api-design"
  ]
}
```

**After (v2.0.0)** - `.augment/extensions.json`:
```json
{
  "linkedModules": [
    "coding-standards/typescript",
    "domain-rules/api-design"
  ],
  "pinnedVersions": {
    "coding-standards/typescript": "2.0.0"
  }
}
```

### 4. Module Metadata Format

**New metadata.json** (required for all modules):
```json
{
  "version": "2.0.0",
  "name": "typescript-standards",
  "displayName": "TypeScript Coding Standards",
  "description": "Comprehensive TypeScript coding standards...",
  "type": "coding-standards",
  "tags": ["typescript", "coding-standards"],
  "compatibility": {
    "augmentMinVersion": "1.0.0",
    "nodeMinVersion": "18.0.0",
    "typescriptMinVersion": "5.0.0"
  },
  "deprecated": false,
  "breaking": false
}
```

## Migration Steps

### Step 1: Update Augment Extensions CLI

```bash
# Update to v2.0.0
npm install -g augx@2.0.0

# Verify installation
augx --version
# Should show: 2.0.0
```

### Step 2: Check Linked Modules

```bash
# List currently linked modules
augx list --linked

# Check for available updates
augx list --versions
```

### Step 3: Review Breaking Changes

```bash
# Check version information for each linked module
augx version-info coding-standards/typescript
augx version-info domain-rules/api-design

# Look for "Breaking Changes" section in output
```

### Step 4: Update Modules (Recommended)

**Option A: Update all modules to latest**:
```bash
# Update all linked modules
augx update

# Verify versions
augx list --linked
```

**Option B: Selective updates**:
```bash
# Update specific module
augx upgrade coding-standards/typescript

# Pin to specific version if needed
augx use coding-standards/typescript --version 2.0.0 --pin
```

### Step 5: Test Your Project

After updating modules:

1. **Review AI-generated code** - Ensure it follows new standards
2. **Check for deprecation warnings** - Run `augx version-info <module>`
3. **Validate compatibility** - Ensure your Node.js/TypeScript versions meet requirements

### Step 6: Pin Critical Modules (Optional)

If you need stability, pin modules to specific versions:

```bash
# Pin TypeScript standards to v2.0.0
augx use coding-standards/typescript --version 2.0.0 --pin

# Verify pinned versions
cat .augment/extensions.json
```

## Common Migration Scenarios

### Scenario 1: "I want to stay on v1.x modules"

```bash
# Pin all modules to their current versions
augx use coding-standards/typescript --version 1.0.0 --pin
augx use domain-rules/api-design --version 1.0.0 --pin
```

### Scenario 2: "I want the latest features"

```bash
# Update all modules to latest
augx update

# Or use the new GUI to browse and select versions
augx gui
```

### Scenario 3: "I need to test v2.0.0 before committing"

```bash
# Use specific version without pinning
augx use coding-standards/typescript --version 2.0.0

# Test your project...

# If satisfied, pin it
augx use coding-standards/typescript --version 2.0.0 --pin
```

## FAQ

### Q: Will v1.x modules still work?

**Yes!** All v1.x modules are backward compatible. The CLI automatically detects modules without VERSION files and treats them as v1.0.0.

### Q: Do I need to update immediately?

**No.** You can continue using v1.x modules indefinitely. However, new features and improvements will only be available in v2.0.0+.

### Q: What happens if I don't pin versions?

By default, `augx update` will upgrade modules to the latest version. If you need stability, pin critical modules:

```bash
augx use <module> --version <version> --pin
```

### Q: How do I know if a module has breaking changes?

```bash
# Check version info
augx version-info <module>

# Look for "Breaking Changes" section
# Or check metadata
augx show <module> --json | grep breaking
```

### Q: Can I use different versions of the same module in different projects?

**Yes!** Version pinning is per-project (stored in `.augment/extensions.json`). Each project can use different versions.

### Q: What if a module doesn't have a VERSION file?

The CLI treats modules without VERSION files as v1.0.0. You can generate VERSION files for custom modules:

```bash
# Generate VERSION, CHANGELOG.md, metadata.json
node scripts/generate-module-metadata.js
```

### Q: How do I downgrade a module?

```bash
# Use specific older version
augx use <module> --version 1.0.0 --pin
```

### Q: What's the difference between `augx update` and `augx upgrade`?

- **`augx update`**: Updates ALL linked modules to latest versions
- **`augx upgrade <module>`**: Upgrades a SPECIFIC module with compatibility checks and warnings

## Troubleshooting

### Issue: "Module version not found"

**Cause**: Requested version doesn't exist for the module.

**Solution**:
```bash
# List available versions
augx list --versions

# Or check specific module
augx version-info <module>
```

### Issue: "Compatibility check failed"

**Cause**: Module requires newer Node.js or TypeScript version.

**Solution**:
```bash
# Check compatibility requirements
augx version-info <module>

# Upgrade Node.js/TypeScript, or use older module version
augx use <module> --version <older-version> --pin
```

### Issue: "Pinned version conflicts with update"

**Cause**: You're trying to update a pinned module.

**Solution**:
```bash
# Unpin the module first
augx use <module> --version latest

# Or force the upgrade
augx upgrade <module> --force
```

### Issue: "GUI doesn't show version selector"

**Cause**: Module doesn't have VERSION file.

**Solution**:
```bash
# Generate VERSION file for custom modules
node scripts/generate-module-metadata.js

# Or update to latest augx CLI
npm install -g augx@latest
```

### Issue: "Breaking changes broke my project"

**Cause**: Module update introduced breaking changes.

**Solution**:
```bash
# Downgrade to previous version
augx use <module> --version <previous-version> --pin

# Check CHANGELOG for migration steps
augx version-info <module>
```

## Getting Help

- **Documentation**: See `docs/CLI_REFERENCE.md` for complete command reference
- **GUI Help**: Press `?` in `augx gui` for keyboard shortcuts
- **Version Info**: Run `augx version-info <module>` for detailed version information
- **Issues**: Report bugs at https://github.com/mytech-today-now/augment-extensions/issues

## Next Steps

After migration:

1. ✅ **Explore new features** - Try `augx gui` for the modern TUI
2. ✅ **Review module updates** - Check `augx list --versions` for new releases
3. ✅ **Pin critical modules** - Ensure stability for production projects
4. ✅ **Update documentation** - Document your team's version pinning strategy

---

**Migration completed?** Run `augx list --linked` to verify all modules are at the desired versions.


