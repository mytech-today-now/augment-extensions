# Frequently Asked Questions

## General

### What is Augment Extensions?

Augment Extensions is a modular repository system that extends Augment Code AI's capabilities beyond the ~49,400 character limit of the `.augment/` folder. It provides domain-specific rules, coding standards, and extensive examples that can be consumed across multiple projects.

### How does it work?

1. Install the `augx` CLI tool
2. Initialize in your project with `augx init`
3. Link extension modules with `augx link <module>`
4. AI agents query modules using `augx show <module>`

### Is it similar to OpenSpec or Beads?

Yes! Augment Extensions follows similar patterns:
- **CLI-first** approach like Beads (`bd`) and OpenSpec (`openspec`)
- **Git-native** versioning and distribution
- **AGENTS.md** integration for AI discovery
- **Modular** and composable design

## Installation

### How do I install the CLI?

```bash
npm install -g @augment-extensions/cli
```

### Can I use it without npm?

Yes, you can clone the repository and use git submodules:

```bash
git submodule add https://github.com/your-org/augment-extensions .augment-extensions
```

### What are the system requirements?

- Node.js >= 16.0.0
- Git
- Augment Code AI

## Usage

### How do I know which modules to link?

1. List available modules: `augx list`
2. Search by keyword: `augx search typescript`
3. View module details: `augx show <module>`

### Can I link multiple modules?

Yes! Link as many modules as needed:

```bash
augx link coding-standards/typescript
augx link domain-rules/web-development
augx link examples/design-patterns
```

### How do AI agents use the modules?

AI agents can:
1. Query linked modules: `augx list --linked`
2. View module content: `augx show <module>`
3. Apply rules from module guidelines

### Do modules count toward the .augment/ character limit?

No! Modules are stored separately and don't count toward the ~49,400 character limit.

## Versioning

### How does versioning work?

Modules follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features
- **PATCH**: Bug fixes

### How do I pin a module version?

```bash
augx pin coding-standards/typescript 1.2.0
```

### How do I update modules?

```bash
# Check for updates
augx check-updates

# Update all
augx update

# Update specific module
augx update --module coding-standards/typescript
```

## Module Development

### Can I create custom modules?

Yes! See [Module Development Guide](../module-development.md).

```bash
augx create my-custom-module --type coding-standards
```

### What's the character limit for modules?

Recommended limits:
- Small: < 10,000 characters
- Medium: 10,000 - 25,000 characters
- Large: 25,000 - 50,000 characters

Split modules if they exceed 50,000 characters.

### How do I share my module?

1. Create module in `augment-extensions/` directory
2. Add to `modules.md` catalog
3. Submit pull request
4. See [Contributing Guide](../CONTRIBUTING.md)

## Integration

### Does it work with existing .augment/ folders?

Yes! Augment Extensions complements your existing `.augment/` folder:
- Core rules stay in `.augment/`
- Extended rules go in modules

### Can I use it with other AI coding tools?

The CLI is designed for Augment Code AI, but the module structure can be adapted for other tools that support similar patterns.

### How do I integrate with my team?

1. Initialize: `augx init`
2. Link modules: `augx link <module>`
3. Commit `.augment/extensions.json`
4. Team members run `augx update`

## Troubleshooting

### "Command not found: augx"

```bash
# Reinstall globally
npm install -g @augment-extensions/cli

# Or use npx
npx @augment-extensions/cli <command>
```

### "Module not found"

```bash
# Verify module exists
augx list | grep <module-name>

# Check spelling
augx search <keyword>
```

### "Not initialized"

```bash
# Run init in project root
augx init
```

### Modules not updating

```bash
# Force update
augx update --force

# Or unlink and relink
augx unlink <module>
augx link <module>
```

## Performance

### Does it slow down AI agents?

No. Modules are loaded on-demand only when queried by the AI agent.

### How much disk space do modules use?

Typical modules:
- Small: ~10 KB
- Medium: ~25 KB
- Large: ~50 KB

Total for all modules: < 5 MB

## Best Practices

### Should I commit extensions.json?

Yes! Commit `.augment/extensions.json` to track linked modules in version control.

### How often should I update modules?

- **Development**: Weekly
- **Production**: Monthly or when needed

### Should I pin versions?

- **Development**: No (use latest)
- **Production**: Yes (pin for stability)

## Support

### Where can I get help?

- [GitHub Issues](https://github.com/your-org/augment-extensions/issues)
- [Documentation](./README.md)
- [Contributing Guide](../CONTRIBUTING.md)

### How do I report a bug?

Open an issue on GitHub with:
- Module name and version
- Command that failed
- Error message
- Expected behavior

