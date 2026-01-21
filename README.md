# Augment Extensions

**Reusable augmentation modules for Augment Code AI - Beyond the 49,400 character limit.**

Augment Extensions is a modular repository system that extends Augment Code AI's capabilities by providing domain-specific rules, coding standards, and extensive examples that can be consumed across multiple projects.

## 🎯 Purpose

Augment Code AI limits the `.augment/` folder to ~49,400 characters. This repository provides:

- **Domain-specific rules** that exceed the character limit
- **Coding standards** for various languages and frameworks
- **Extensive examples** and best practices
- **Versioned updates** that propagate to consuming projects
- **Project-agnostic modules** that work across different codebases

## 🚀 Quick Start

### For Humans (One-time Setup)

```bash
# Install the CLI
npm install -g @mytechtoday/augment-extensions

# Initialize in your project
augx init

# Link extension modules
augx link coding-standards/typescript
augx link domain-rules/api-design
augx link domain-rules/security
```

### For AI Agents

Once initialized, AI agents automatically discover available extensions through:
- `AGENTS.md` integration (similar to OpenSpec/Beads)
- `.augment/extensions.json` manifest
- CLI commands: `augx list`, `augx show <module>`

## 📦 Repository Structure

```
augment-extensions/
├── modules/                    # Extension modules
│   ├── coding-standards/      # Language/framework standards
│   │   ├── typescript/
│   │   ├── python/
│   │   ├── react/
│   │   └── ...
│   ├── domain-rules/          # Domain-specific rules
│   │   ├── web-development/
│   │   ├── api-design/
│   │   ├── security/
│   │   └── ...
│   └── examples/              # Extensive code examples
│       ├── design-patterns/
│       ├── testing-strategies/
│       └── ...
├── cli/                       # CLI tool source
├── templates/                 # Module templates
└── docs/                      # Documentation
```

## 🔧 How It Works

### 1. Module Structure

Each module is self-contained:

```
modules/coding-standards/typescript/
├── module.json               # Metadata (version, dependencies)
├── rules/                    # Rule files
│   ├── naming-conventions.md
│   ├── type-safety.md
│   └── error-handling.md
├── examples/                 # Code examples
│   └── best-practices.ts
└── README.md                 # Module documentation
```

### 2. Consumption Model

**Git Submodule Approach:**
```bash
# Add as submodule
git submodule add https://github.com/your-org/augment-extensions .augment-extensions

# Initialize
augx init --from-submodule
```

**Direct Link Approach:**
```bash
# Link specific modules
augx link typescript-standards
augx link api-design-rules
```

### 3. Version Management

```bash
# Update all linked modules
augx update

# Update specific module
augx update typescript-standards

# Pin to specific version
augx pin typescript-standards@1.2.0
```

## 📖 Available Modules

See [MODULES.md](./MODULES.md) for a complete catalog of available extension modules.

## 🛠 Creating Custom Modules

```bash
# Create new module
augx create my-custom-rules --type domain-rules

# Publish to registry (optional)
augx publish my-custom-rules
```

## 🔗 Integration with Augment Code AI

Extensions integrate seamlessly:

1. **Character Limit Bypass**: Core rules stay in `.augment/`, extended content in modules
2. **Automatic Discovery**: AI agents can query available modules via CLI
3. **Versioned Updates**: `augx update` propagates changes to all consuming projects
4. **Selective Loading**: Only load modules relevant to current task

## 📚 Documentation

- [Quick Start Guide](./docs/QUICK_START.md) - Get started in 5 minutes
- [Integration Guide](./docs/INTEGRATION.md) - Detailed integration instructions
- [CLI Reference](./docs/CLI_REFERENCE.md) - Complete command reference
- [FAQ](./docs/FAQ.md) - Common questions and answers

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on creating and sharing modules.

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

## 🌟 Examples

### Example 1: TypeScript Project

```bash
augx link coding-standards/typescript
augx link domain-rules/web-development
augx link examples/react-patterns
```

### Example 2: Python API Project

```bash
augx link coding-standards/python
augx link domain-rules/api-design
augx link examples/fastapi-patterns
```

## 🔄 Update Propagation

When module maintainers release updates:

```bash
# Check for updates
augx check-updates

# Update all modules
augx update --all

# Review changes before applying
augx diff typescript-standards
```

## 🎯 Design Principles

1. **Modular**: Each module is independent and composable
2. **Versioned**: Semantic versioning for predictable updates
3. **Git-native**: Leverage git for distribution and versioning
4. **AI-friendly**: JSON output, structured data, CLI-first
5. **Project-agnostic**: Works across different project types

---

**Status**: Active Development | **Version**: 0.1.0 | **Maintainer**: @your-username

