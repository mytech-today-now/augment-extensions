# Augment Extensions

**Reusable augmentation modules for Augment Code AI - Beyond the 49,400 character limit.**

Augment Extensions is a modular repository system that extends Augment Code AI's capabilities by providing domain-specific rules, coding standards, workflow integrations, and extensive examples that can be consumed across multiple projects.

## 🎯 Purpose

Augment Code AI limits the `.augment/` folder to ~49,400 characters. This repository provides:

- **Domain-specific rules** that exceed the character limit (WordPress, API design, security)
- **Coding standards** for various languages and frameworks (TypeScript, Python, React)
- **Workflow integrations** (OpenSpec, Beads, WordPress plugin development)
- **Extensive examples** and best practices (Gutenberg blocks, REST API, WooCommerce)
- **Versioned updates** that propagate to consuming projects
- **Project-agnostic modules** that work across different codebases

## ✨ What's New in v0.3.0

- 🎨 **GUI Module Manager** - Interactive terminal UI for module selection (`augx gui`)
- 📦 **Modular HTML/CSS/JS** - Split into independent modules for better flexibility
- 📚 **Collections System** - Bundle multiple modules together (e.g., `html-css-js` collection)
- 🔗 **Unlink Command** - Remove modules or collections with dependency checking
- 🗑️ **Self-Remove** - Safely uninstall all Augment Extensions with dry-run mode
- 🔍 **Enhanced Search** - Find modules by name, description, or tags in the GUI

### Previous Releases (v0.2.0)

- 🎉 **Complete WordPress Plugin Development Module** - 344K+ characters of comprehensive guidelines
- 🔧 **WordPress Plugin Workflow** - Development, testing, and submission workflows
- 📦 **Beads Workflow Integration** - Git-backed issue tracking for AI agents
- 🧩 **Example Modules** - Gutenberg blocks, REST API plugins, WooCommerce extensions
- 📝 **Migration Guides** - WordPress core, PHP, theme, and plugin migrations
- 💻 **VS Code Integration** - Complete IDE setup for WordPress development
- 🔒 **Security & Performance** - Best practices and optimization guides

## 🚀 Quick Start

### For Humans (One-time Setup)

```bash
# Install the CLI
npm install -g @mytechtoday/augment-extensions

# Initialize in your project
augx init

# Option 1: Use the interactive GUI (recommended)
augx gui

# Option 2: Link modules manually
augx link coding-standards/html
augx link coding-standards/css
augx link coding-standards/js

# Option 3: Link a collection
augx link collections/html-css-js

# Unlink modules or collections
augx unlink coding-standards/html
augx unlink collections/html-css-js --force

# Remove all Augment Extensions
augx self-remove --dry-run  # Preview what will be removed
augx self-remove            # Actually remove (with confirmation)
```

### For AI Agents

Once initialized, AI agents automatically discover available extensions through:
- `AGENTS.md` integration (similar to OpenSpec/Beads)
- `.augment/extensions.json` manifest
- CLI commands: `augx list`, `augx show <module>`

## 📦 Repository Structure

```
augment-extensions/
├── augment-extensions/              # Extension modules
│   ├── coding-standards/           # Language/framework standards
│   │   ├── html/                   # HTML standards (32K chars) ✨ NEW
│   │   ├── css/                    # CSS standards (30K chars) ✨ NEW
│   │   ├── js/                     # JavaScript standards (101K chars) ✨ NEW
│   │   ├── html-css-js/            # Legacy monolithic module (deprecated)
│   │   ├── typescript/             # TypeScript coding standards (15K chars)
│   │   ├── python/                 # Python standards
│   │   └── react/                  # React patterns
│   ├── collections/                # Module collections ✨ NEW
│   │   └── html-css-js/            # HTML/CSS/JS frontend collection
│   ├── domain-rules/               # Domain-specific rules
│   │   ├── wordpress/              # WordPress development (general)
│   │   ├── wordpress-plugin/       # WordPress plugin development (344K chars)
│   │   ├── api-design/             # API design guidelines
│   │   └── security/               # Security best practices
│   ├── workflows/                  # Workflow integrations
│   │   ├── openspec/               # Spec-driven development (30K chars)
│   │   ├── beads/                  # Git-backed issue tracking (36K chars)
│   │   └── wordpress-plugin/       # WordPress plugin workflows (81K chars)
│   └── examples/                   # Extensive code examples
│       ├── design-patterns/        # Design patterns
│       ├── gutenberg-block-plugin/ # Gutenberg block examples
│       ├── rest-api-plugin/        # REST API plugin examples
│       └── woocommerce-extension/  # WooCommerce extension examples
├── cli/                            # CLI tool source (augx)
├── .augment/                       # Core rules (character-limited)
├── .beads/                         # Beads issue tracking
└── docs/                           # Documentation
```

## 🔧 How It Works

### 1. Module Structure

Each module is self-contained:

```
augment-extensions/coding-standards/typescript/
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

### Coding Standards

- **[TypeScript Standards](./augment-extensions/coding-standards/typescript/)** (v1.0.0, ~15K chars)
  - Naming conventions, type safety, error handling, async/await best practices
- **Python Standards** (planned)
- **React Patterns** (planned)

### Workflows

- **[OpenSpec](./augment-extensions/workflows/openspec/)** (v1.0.0, ~30K chars)
  - Spec-driven development workflow for AI coding assistants
  - Proposal → Specs → Tasks → Implement → Archive
  - [Learn more](https://openspec.dev/)

- **[Beads](./augment-extensions/workflows/beads/)** (v1.0.0, ~36K chars)
  - Distributed, git-backed graph issue tracker for AI agents
  - Create → Dependencies → Ready → Work → Close
  - [Learn more](https://github.com/steveyegge/beads)

- **[WordPress Plugin Development](./augment-extensions/workflows/wordpress-plugin/)** (v1.2.0, ~81K chars)
  - Complete workflows for WordPress plugin development
  - Development cycle, testing setup, WordPress.org submission
  - AI prompt templates and Beads task breakdown patterns

### Domain Rules

- **[WordPress Development](./augment-extensions/domain-rules/wordpress/)** (general WordPress guidelines)
  - Project detection, directory structure, coding standards
  - Theme development, plugin development, Gutenberg blocks
  - Security, performance, WooCommerce integration

- **[WordPress Plugin Development](./augment-extensions/domain-rules/wordpress-plugin/)** (v1.1.0, ~344K chars)
  - **Most comprehensive module** - Complete WordPress plugin development guide
  - 7 architecture patterns (procedural, OOP, MVC, singleton, DI, boilerplate)
  - Plugin structure, activation hooks, admin interfaces, frontend functionality
  - Gutenberg blocks, REST API, AJAX handlers, database management
  - Security best practices, performance optimization, internationalization
  - WooCommerce integration, testing patterns, WordPress.org submission
  - Migration workflows (WordPress core, PHP, theme, plugin)
  - VS Code integration (settings, tasks, snippets, extensions)
  - Context providers (WordPress-specific file contexts)

- **API Design** (planned)
- **Security** (planned)

### Examples

- **[Gutenberg Block Plugin](./augment-extensions/examples/gutenberg-block-plugin/)**
  - Complete Gutenberg block plugin examples
  - Testimonial block with dynamic rendering

- **[REST API Plugin](./augment-extensions/examples/rest-api-plugin/)**
  - Complete REST API plugin examples
  - Task manager API with CRUD operations

- **[WooCommerce Extension](./augment-extensions/examples/woocommerce-extension/)**
  - Complete WooCommerce extension examples
  - Product customizer with custom fields

- **Design Patterns** (planned)
- **Testing Strategies** (planned)

See [MODULES.md](./MODULES.md) for detailed module documentation.

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

### Core Documentation
- [AGENTS.md](./AGENTS.md) - AI agent integration guide
- [MODULES.md](./MODULES.md) - Complete module catalog
- [Module Development](./.augment/rules/module-development.md) - Creating custom modules
- [Character Count Management](./.augment/rules/character-count-management.md) - Managing .augment/ limits

### Workflow Documentation
- [OpenSpec Workflow](./augment-extensions/workflows/openspec/) - Spec-driven development
- [Beads Workflow](./augment-extensions/workflows/beads/) - Git-backed issue tracking
- [WordPress Plugin Workflow](./augment-extensions/workflows/wordpress-plugin/) - Plugin development cycle

### Module Documentation
- [TypeScript Standards](./augment-extensions/coding-standards/typescript/)
- [WordPress Plugin Development](./augment-extensions/domain-rules/wordpress-plugin/)
- [WordPress Development](./augment-extensions/domain-rules/wordpress/)

## ✅ Module Validation

The CLI includes comprehensive validation to ensure module quality:

```bash
# Validate a module
augx validate coding-standards/typescript --verbose

# Validation checks:
# ✅ Module structure (required files and directories)
# ✅ Category matching (type matches directory)
# ✅ Semantic versioning (MAJOR.MINOR.PATCH format)
# ✅ Project-agnostic content (no hardcoded paths)
# ✅ Documentation completeness (required sections, examples)
# ✅ Character count accuracy (matches declaration)
# ✅ Metadata completeness (all required fields)
```

### Automatic Catalog Updates

Keep the module catalog up to date automatically:

```bash
# Update catalog manually
augx catalog

# Check if catalog is out of date
augx catalog --check

# Auto-update only if needed
augx catalog --auto

# Set up git hook for automatic updates
augx catalog-hook
```

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on creating and sharing modules.

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

## 🌟 Usage Examples

### Example 1: WordPress Plugin Development

```bash
# Install CLI
npm install -g @mytechtoday/augment-extensions

# Initialize in your WordPress plugin project
augx init

# Link WordPress plugin modules
augx link domain-rules/wordpress-plugin
augx link workflows/wordpress-plugin
augx link workflows/beads

# View module content
augx show wordpress-plugin

# Search for specific topics
augx search "gutenberg blocks"
augx search "security"
```

### Example 2: TypeScript Project with OpenSpec

```bash
# Link TypeScript standards and OpenSpec workflow
augx link coding-standards/typescript
augx link workflows/openspec

# View TypeScript standards
augx show typescript-standards
```

### Example 3: Full WordPress Development Stack

```bash
# Link all WordPress-related modules
augx link domain-rules/wordpress
augx link domain-rules/wordpress-plugin
augx link workflows/wordpress-plugin
augx link workflows/beads
augx link workflows/openspec

# Link example modules
augx link examples/gutenberg-block-plugin
augx link examples/rest-api-plugin
augx link examples/woocommerce-extension
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

## 🚀 CLI Commands

```bash
# List all available modules
augx list

# List linked modules in current project
augx list --linked

# Show module details
augx show <module-name>

# Show module as JSON
augx show <module-name> --json

# Search for modules
augx search <keyword>

# Update all linked modules
augx update

# Check CLI version
augx version
```

## 🔧 Integration with AI Agents

Augment Extensions integrates seamlessly with AI coding assistants:

1. **Automatic Discovery**: AI agents discover modules via `AGENTS.md` convention
2. **CLI Integration**: Query modules using `augx` commands
3. **Workflow Integration**: OpenSpec and Beads workflows for structured development
4. **Context Providers**: WordPress-specific file contexts for intelligent assistance
5. **Character Limit Bypass**: Unlimited content in extension modules

### For AI Agents

When working on a project with Augment Extensions:

```bash
# Check linked modules
augx list --linked

# View module content
augx show wordpress-plugin

# Search for specific guidance
augx search "security best practices"
augx search "gutenberg blocks"
augx search "REST API"
```

## 🎯 Key Features

### WordPress Plugin Development

The most comprehensive module with **344K+ characters** of guidelines:

- ✅ **7 Architecture Patterns** - From simple procedural to dependency injection
- ✅ **Complete Plugin Structure** - Activation hooks, admin interfaces, frontend functionality
- ✅ **Gutenberg Blocks** - Block development with block.json and React
- ✅ **REST API** - Custom endpoints with authentication and validation
- ✅ **AJAX Handlers** - Secure AJAX with nonces and capability checks
- ✅ **Database Management** - Custom tables, queries, migrations
- ✅ **Security** - Nonces, sanitization, escaping, capability checks
- ✅ **Performance** - Caching, query optimization, asset management
- ✅ **WooCommerce** - Product fields, checkout, payment gateways, orders
- ✅ **Testing** - PHPUnit, Theme Check, Plugin Check, accessibility
- ✅ **Migration** - WordPress core, PHP, theme, plugin migrations
- ✅ **VS Code Integration** - Complete IDE setup with tasks and snippets
- ✅ **WordPress.org Submission** - Complete submission workflow

### Workflow Integrations

- **OpenSpec** - Spec-driven development with proposal → specs → tasks → implement → archive
- **Beads** - Git-backed issue tracking with dependencies and graph visualization
- **WordPress Plugin Workflow** - Development, testing, and submission workflows

### Example Modules

- **Gutenberg Block Plugin** - Complete block plugin with testimonial example
- **REST API Plugin** - Task manager API with CRUD operations
- **WooCommerce Extension** - Product customizer with custom fields

## 🤝 Contributing

We welcome contributions! Here's how to help:

1. **Create New Modules** - Follow [module-development.md](./.augment/rules/module-development.md)
2. **Improve Existing Modules** - Submit PRs with enhancements
3. **Report Issues** - Use GitHub issues for bugs and feature requests
4. **Share Examples** - Contribute real-world examples

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📄 License

MIT License - See [LICENSE](./LICENSE) for details.

---

**Status**: Active Development | **Version**: 0.2.0 | **Maintainer**: @mytech-today-now

**Latest Release**: Complete WordPress Plugin Development Module with migration guides, VS Code integration, and comprehensive examples.

**npm Package**: `@mytechtoday/augment-extensions`

**Repository**: https://github.com/mytech-today-now/augment

