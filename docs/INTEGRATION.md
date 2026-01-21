# Integration Guide

This guide explains how to integrate Augment Extensions into your existing projects.

## Prerequisites

- Node.js >= 16.0.0
- Git
- Augment Code AI installed

## Installation Methods

### Method 1: NPM Global Install (Recommended)

```bash
# Install CLI globally
npm install -g @augment-extensions/cli

# Verify installation
augx --version
```

### Method 2: Git Submodule

```bash
# Add as submodule to your project
git submodule add https://github.com/your-org/augment-extensions .augment-extensions

# Initialize submodule
git submodule update --init --recursive

# Install CLI from submodule
cd .augment-extensions/cli
npm install
npm link
```

### Method 3: Local Clone

```bash
# Clone repository
git clone https://github.com/your-org/augment-extensions.git

# Install CLI
cd augment-extensions/cli
npm install
npm link
```

## Project Setup

### 1. Initialize in Your Project

```bash
# Navigate to your project
cd /path/to/your/project

# Initialize Augment Extensions
augx init
```

This creates:
- `.augment/extensions.json` - Configuration file
- `AGENTS.md` - AI agent integration instructions (or updates existing)
- `.gitignore` entry for extensions.json

### 2. Link Extension Modules

```bash
# Link TypeScript standards
augx link coding-standards/typescript

# Link multiple modules
augx link domain-rules/web-development
augx link examples/design-patterns

# View linked modules
augx list --linked
```

### 3. Configure AI Agent

The `augx init` command automatically updates your `AGENTS.md` file. AI agents will read this file and understand how to use the extensions.

## Usage Patterns

### For Human Developers

```bash
# List all available modules
augx list

# Search for specific modules
augx search typescript

# View module details
augx show coding-standards/typescript

# Check for updates
augx check-updates

# Update all modules
augx update
```

### For AI Agents

AI agents can query extensions using the same CLI:

```bash
# List linked modules
augx list --linked --json

# Get module content
augx show coding-standards/typescript --json

# Search for relevant modules
augx search "error handling" --json
```

## Integration with `.augment/` Folder

### Character Limit Strategy

1. **Core rules** (< 49,400 chars) → `.augment/` folder
2. **Extended rules** → Extension modules
3. **Examples** → Extension modules

### Example Structure

```
your-project/
├── .augment/
│   ├── rules/
│   │   └── core-guidelines.md      # Core rules (condensed)
│   └── extensions.json              # Linked modules config
├── .augment-extensions/             # Optional: submodule
│   └── augment-extensions/
│       └── coding-standards/
│           └── typescript/
│               ├── module.json
│               └── rules/
│                   └── naming-conventions.md  # Extended rules
└── AGENTS.md                        # AI integration
```

## Workflow Examples

### Example 1: TypeScript Project

```bash
# Initialize
augx init

# Link TypeScript standards
augx link coding-standards/typescript

# AI agent can now query:
# "Show me the TypeScript naming conventions"
# Agent runs: augx show coding-standards/typescript
```

### Example 2: Multi-Language Project

```bash
# Link multiple language standards
augx link coding-standards/typescript
augx link coding-standards/python
augx link coding-standards/rust

# Link domain-specific rules
augx link domain-rules/api-design
augx link domain-rules/security
```

### Example 3: Team Collaboration

```bash
# Developer A links modules
augx link coding-standards/typescript
git add .augment/extensions.json
git commit -m "Add TypeScript standards"
git push

# Developer B pulls changes
git pull
augx update  # Updates to latest module versions
```

## Version Pinning

```bash
# Pin to specific version
augx pin coding-standards/typescript 1.2.0

# Update to latest (respects pins)
augx update

# Remove pin
augx unpin coding-standards/typescript
```

## Troubleshooting

### Module Not Found

```bash
# Verify module exists
augx list | grep typescript

# Check module path
augx show coding-standards/typescript
```

### Extensions Not Initialized

```bash
# Error: "Augment Extensions not initialized"
# Solution: Run init command
augx init
```

### Outdated Modules

```bash
# Check for updates
augx check-updates

# View differences
augx diff coding-standards/typescript

# Update
augx update
```

## Best Practices

1. **Commit extensions.json**: Track linked modules in version control
2. **Pin versions**: Use version pinning for production projects
3. **Regular updates**: Check for module updates weekly
4. **Selective linking**: Only link modules relevant to your project
5. **Review changes**: Use `augx diff` before updating

## Advanced Configuration

### Custom Module Repository

Edit `.augment/extensions.json`:

```json
{
  "version": "0.1.0",
  "repository": "https://github.com/your-org/custom-extensions",
  "modules": [
    {
      "name": "coding-standards/typescript",
      "version": "1.0.0"
    }
  ]
}
```

### Auto-Update on Pull

Add to `.git/hooks/post-merge`:

```bash
#!/bin/bash
if [ -f .augment/extensions.json ]; then
  augx update --auto
fi
```

## Next Steps

- [Module Development](./MODULE_DEVELOPMENT.md) - Create custom modules
- [CLI Reference](./CLI_REFERENCE.md) - Complete command reference
- [FAQ](./FAQ.md) - Common questions

