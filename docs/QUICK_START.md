# Quick Start Guide

Get started with Augment Extensions in 5 minutes.

## Step 1: Install CLI

```bash
npm install -g @augment-extensions/cli
```

Verify installation:
```bash
augx --version
```

## Step 2: Initialize in Your Project

Navigate to your project directory:
```bash
cd /path/to/your/project
```

Initialize Augment Extensions:
```bash
augx init
```

This creates:
- `.augment/extensions.json` - Configuration file
- `AGENTS.md` - AI agent instructions (or updates existing)

## Step 3: Link Modules

Link relevant extension modules:

```bash
# For TypeScript projects
augx link coding-standards/typescript

# For Python projects
augx link coding-standards/python

# For web development
augx link domain-rules/web-development
```

View linked modules:
```bash
augx list --linked
```

## Step 4: Use with AI Agent

Your AI agent can now query extensions:

**Human**: "Show me the TypeScript naming conventions"

**AI Agent**: 
```bash
augx show coding-standards/typescript
```

The AI will read and apply the rules from the module.

## Common Workflows

### View Available Modules

```bash
augx list
```

### Search for Modules

```bash
augx search typescript
augx search "error handling"
```

### View Module Details

```bash
augx show coding-standards/typescript
```

### Update Modules

```bash
# Check for updates
augx check-updates

# Update all modules
augx update

# Update specific module
augx update --module coding-standards/typescript
```

### Unlink Module

```bash
augx unlink coding-standards/typescript
```

## Example: TypeScript Project

```bash
# Initialize
augx init

# Link TypeScript standards
augx link coding-standards/typescript

# AI agent can now reference:
# - Naming conventions
# - Type safety guidelines
# - Error handling patterns
# - Async/await best practices
```

## Example: Multi-Language Project

```bash
# Link multiple language standards
augx link coding-standards/typescript
augx link coding-standards/python
augx link coding-standards/rust

# Link domain rules
augx link domain-rules/api-design
augx link domain-rules/security
```

## Troubleshooting

### "Command not found: augx"

```bash
# Reinstall globally
npm install -g @augment-extensions/cli

# Or use npx
npx @augment-extensions/cli init
```

### "Module not found"

```bash
# List available modules
augx list

# Verify module name
augx search <keyword>
```

### "Not initialized"

```bash
# Run init in project directory
augx init
```

## Next Steps

- [Integration Guide](./INTEGRATION.md) - Detailed integration instructions
- [CLI Reference](./CLI_REFERENCE.md) - Complete command reference
- [Module Development](./MODULE_DEVELOPMENT.md) - Create custom modules
- [FAQ](./FAQ.md) - Common questions

## Tips

1. **Start small**: Link only modules you need
2. **Update regularly**: Run `augx check-updates` weekly
3. **Pin versions**: Use version pinning for production
4. **Review changes**: Use `augx diff` before updating
5. **Share with team**: Commit `.augment/extensions.json` to git

