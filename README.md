# Augment Extensions

**Reusable augmentation modules for Augment Code AI - Beyond the 49,400 character limit.**

[![Version](https://img.shields.io/badge/version-0.4.0--beta-blue.svg)](https://github.com/mytech-today-now/augment)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![npm](https://img.shields.io/badge/npm-%40mytechtoday%2Faugment--extensions-red.svg)](https://www.npmjs.com/package/@mytechtoday/augment-extensions)

Augment Extensions is a modular repository system that extends Augment Code AI's capabilities by providing domain-specific rules, coding standards, workflow integrations, and extensive examples that can be consumed across multiple projects.

## 🎯 Purpose

Augment Code AI limits the `.augment/` folder to ~49,400 characters. This repository provides:

- **1.7M+ characters** of comprehensive guidelines across 20+ modules
- **Coding standards** for 8 languages/frameworks (HTML, CSS, JS, TypeScript, Python, React, PHP)
- **Domain-specific rules** (WordPress, API design, security, databases, MCP)
- **Workflow integrations** (OpenSpec, Beads)
- **Extensive examples** (Gutenberg blocks, REST API, WooCommerce, design patterns)
- **Versioned updates** that propagate to consuming projects
- **Project-agnostic modules** that work across different codebases

## ✨ What's New in v0.4.0 (Beta)

- 🧠 **Skills System** - Token-efficient, on-demand skill loading (500-10K tokens vs 50K+ for modules)
- 🔧 **CLI Integration** - Wrap external tools and MCP servers as skills
- 📊 **Skill Categories** - 6 categories: retrieval, transformation, analysis, generation, integration, utility
- 🔍 **Skill Discovery** - `augx skill list`, `augx skill show`, `augx skill search`
- ⚡ **Dynamic Loading** - Load skills only when needed, reducing context overhead
- 🔗 **Dependency Resolution** - Automatic skill dependency management
- 📝 **Skill Development** - Comprehensive guide for creating new skills

### Previous Releases

**v0.3.0:**
- 🎨 **GUI Module Manager** - Interactive terminal UI for module selection (`augx gui`)
- 📦 **Modular HTML/CSS/JS** - Split into independent modules for better flexibility
- 📚 **Collections System** - Bundle multiple modules together (e.g., `html-css-js` collection)
- 🔗 **Unlink Command** - Remove modules or collections with dependency checking
- 🗑️ **Self-Remove** - Safely uninstall all Augment Extensions with dry-run mode
- 🔍 **Enhanced Search** - Find modules by name, description, or tags in the GUI
- 🧠 **Model Context Protocol (MCP)** - 219K+ characters of MCP guidelines (6 types, examples)
- 🐘 **PHP Standards** - 186K+ characters of comprehensive PHP coding standards
- 🗄️ **Database Guidelines** - 449K+ characters covering SQL, NoSQL, vector, and graph databases

**v0.2.0:**
- 🎉 **WordPress Plugin Development Module** - 344K+ characters of comprehensive guidelines
- 🔧 **WordPress Plugin Workflow** - Development, testing, and submission workflows
- 📦 **Beads Workflow Integration** - Git-backed issue tracking for AI agents
- 🧩 **Example Modules** - Gutenberg blocks, REST API plugins, WooCommerce extensions
- 📝 **Migration Guides** - WordPress core, PHP, theme, and plugin migrations
- 💻 **VS Code Integration** - Complete IDE setup for WordPress development

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

## 🧠 Skills System (Beta)

The Skills System provides lightweight, token-efficient modules that can be dynamically loaded on-demand, reducing context overhead while maintaining powerful capabilities.

### What are Skills?

Skills are focused Markdown files with YAML frontmatter that provide specific functionality:
- **Token-efficient**: 500-10K tokens per skill (vs 50K+ for full modules)
- **On-demand loading**: Only loaded when needed
- **CLI integration**: Can wrap external tools and MCP servers
- **Dependency-aware**: Automatic dependency resolution

### Skill Categories

- **retrieval**: Fetch data from codebases, SDKs, or documentation
- **transformation**: Transform code or data formats
- **analysis**: Analyze code for quality, security, or performance
- **generation**: Generate code, documentation, or tests
- **integration**: Integrate with external systems or APIs
- **utility**: General-purpose utility functions

### Using Skills

```bash
# List available skills
augx skill list

# Show skill details
augx skill show sdk-query

# Search for skills
augx skill search "code review"

# Validate a skill file
augx skill validate skills/retrieval/my-skill.md

# Execute a skill (if it has a CLI command)
augx skill exec sdk-query --args "search term"

# Inject skill content into context (with dynamic loading)
augx skill inject sdk-query
augx skill inject sdk-query --no-deps  # Skip dependencies
augx skill inject sdk-query --max-tokens 5000  # Limit token budget

# Load multiple skills in batch
augx skill load sdk-query code-review api-design

# Cache management
augx skill cache-clear
augx skill cache-stats
```

### For AI Agents: Skill Discovery

AI agents can discover and use skills through:

```bash
# Discover all available skills
augx skill list

# Get skill content for injection (with dependencies)
augx skill show <skill-id>

# Execute skill CLI commands
augx skill exec <skill-id> --args "..."

# Dynamic loading with dependency resolution
augx skill inject <skill-id> --max-tokens 10000
```

### Creating New Skills

See [docs/SKILL_DEVELOPMENT.md](./docs/SKILL_DEVELOPMENT.md) for detailed instructions on creating, testing, and publishing new skills.

## 🔌 MCP Integration (Beta)

The MCP Integration allows wrapping Model Context Protocol (MCP) servers as CLI commands and skills, enabling seamless integration with external tools and services.

### What is MCP?

Model Context Protocol (MCP) is a protocol for AI agents to interact with external tools and services. This integration is inspired by [mcporter](https://github.com/steipete/mcporter).

### MCP Commands

```bash
# List configured MCP servers
augx mcp list

# Add MCP server
augx mcp add my-server "npx -y my-mcp-server@latest" --transport stdio

# Execute MCP tool
augx mcp exec my-server tool-name --args '{"param":"value"}'

# Generate skill wrapper for MCP tool
augx mcp wrap my-server tool-name skill-id --category integration

# Discover tools from MCP server
augx mcp discover my-server

# Generate CLI using mcporter (requires mcporter installed)
augx mcp generate-cli "npx -y server" dist/cli.js
```

### MCP Configuration

MCP servers are configured in `.augment/mcp/servers.json`:

```json
{
  "servers": [
    {
      "name": "my-server",
      "command": "npx",
      "args": ["-y", "my-mcp-server@latest"],
      "transport": "stdio",
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  ]
}
```

### MCP Workflow

1. **Add MCP Server**: Configure server connection
2. **Discover Tools**: List available tools from server
3. **Generate Skill**: Create skill wrapper for tool
4. **Execute**: Run tool via CLI or inject into AI context

See [.augment/mcp/README.md](./.augment/mcp/README.md) for detailed MCP integration documentation.

## 📦 Repository Structure

```
augment-extensions/
├── augment-extensions/              # Extension modules (1.7M+ characters)
│   ├── coding-standards/           # Language/framework standards (8 modules)
│   │   ├── html/                   # HTML standards (32K chars)
│   │   ├── css/                    # CSS standards (30K chars)
│   │   ├── js/                     # JavaScript ES6+ standards (101K chars)
│   │   ├── typescript/             # TypeScript standards (6K chars)
│   │   ├── python/                 # Python standards with type hints (116K chars)
│   │   ├── react/                  # React patterns and hooks (32K chars)
│   │   ├── php/                    # PHP PSR standards (186K chars)
│   │   └── html-css-js/            # Legacy monolithic module (deprecated)
│   ├── collections/                # Module collections
│   │   └── html-css-js/            # HTML/CSS/JS frontend collection (164K chars)
│   ├── domain-rules/               # Domain-specific rules (6 modules)
│   │   ├── api-design/             # REST/GraphQL API design (35K chars)
│   │   ├── database/               # Database design (SQL, NoSQL, vector) (449K chars) ✨ NEW
│   │   ├── mcp/                    # Model Context Protocol (219K chars) ✨ NEW
│   │   ├── security/               # OWASP security guidelines (38K chars)
│   │   ├── wordpress/              # WordPress development (general)
│   │   └── wordpress-plugin/       # WordPress plugin development (344K chars)
│   ├── workflows/                  # Workflow integrations (2 modules)
│   │   ├── openspec/               # Spec-driven development (32K chars)
│   │   └── beads/                  # Git-backed issue tracking (39K chars)
│   └── examples/                   # Extensive code examples (4 modules)
│       ├── design-patterns/        # Design patterns (42K chars)
│       ├── gutenberg-block-plugin/ # Gutenberg block examples (15K chars)
│       ├── rest-api-plugin/        # REST API plugin examples (40K chars)
│       └── woocommerce-extension/  # WooCommerce extension examples (24K chars)
├── skills/                         # Skills system (Beta) 🆕
│   ├── retrieval/                  # Retrieval skills (SDK query, context search)
│   ├── transformation/             # Transformation skills (code refactor, format conversion)
│   ├── analysis/                   # Analysis skills (code review, security audit)
│   ├── generation/                 # Generation skills (code gen, docs gen)
│   ├── integration/                # Integration skills (API, database)
│   └── utility/                    # Utility skills (file ops, text processing)
├── cli/                            # CLI tool source (augx)
│   ├── src/                        # TypeScript source
│   │   ├── commands/               # CLI commands (including skill commands)
│   │   └── utils/                  # Utilities (including skill-system.ts)
│   └── dist/                       # Compiled JavaScript
├── .augment/                       # Core rules (character-limited)
│   ├── rules/                      # Core workflow rules
│   └── coordination.json           # Coordination manifest (OpenSpec + Beads + Skills)
├── .beads/                         # Beads issue tracking
│   ├── issues.jsonl                # Issue log
│   └── config.json                 # Beads configuration
├── openspec/                       # OpenSpec specifications
│   ├── specs/                      # Source of truth specs
│   └── changes/                    # Proposed changes
└── docs/                           # Documentation
    └── SKILL_DEVELOPMENT.md        # Skill development guide 🆕
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

### Coding Standards (8 modules, ~504K chars)

- **[HTML Standards](./augment-extensions/coding-standards/html/)** (v1.0.0, ~32K chars)
  - Semantic HTML, accessibility (ARIA, WCAG), forms, SEO, performance

- **[CSS Standards](./augment-extensions/coding-standards/css/)** (v1.0.0, ~30K chars)
  - Modern CSS (Grid, Flexbox, Custom Properties), responsive design, BEM/SMACSS

- **[JavaScript Standards](./augment-extensions/coding-standards/js/)** (v1.0.0, ~101K chars)
  - ES6+ features, async patterns, DOM manipulation, error handling, tooling

- **[TypeScript Standards](./augment-extensions/coding-standards/typescript/)** (v1.0.0, ~6K chars)
  - Naming conventions, type safety, best practices

- **[Python Standards](./augment-extensions/coding-standards/python/)** (v1.1.0, ~116K chars)
  - Type hints (PEP 484, 585, 604), async patterns, testing, documentation

- **[React Patterns](./augment-extensions/coding-standards/react/)** (v1.0.0, ~32K chars)
  - Component patterns, hooks, state management, performance, TypeScript integration

- **[PHP Standards](./augment-extensions/coding-standards/php/)** (v1.0.0, ~186K chars) ✨ NEW
  - PSR standards (PSR-1, PSR-12, PSR-4, PSR-7, PSR-11), security (OWASP), testing, CMS integration

- **[HTML/CSS/JS Collection](./augment-extensions/collections/html-css-js/)** (v1.0.0, ~164K chars)
  - Bundles HTML, CSS, and JavaScript modules together

### Domain Rules (6 modules, ~1.08M chars)

- **[API Design Guidelines](./augment-extensions/domain-rules/api-design/)** (v1.0.0, ~35K chars)
  - REST/GraphQL API design, authentication, versioning, error handling

- **[Database Design Guidelines](./augment-extensions/domain-rules/database/)** (v1.0.0, ~449K chars) ✨ NEW
  - Relational databases (schema design, indexing, query optimization, transactions)
  - NoSQL databases (document stores, key-value stores, graph databases)
  - Vector databases (embeddings, indexing, semantic search)
  - Flat databases, performance optimization, security standards

- **[Model Context Protocol (MCP)](./augment-extensions/domain-rules/mcp/)** (v1.0.0, ~219K chars) ✨ NEW
  - Token-based MCP (compression, chunking, budgeting)
  - State-based MCP (persistence, state machines, concurrency)
  - Vector-based MCP (RAG, embeddings, semantic search)
  - Hybrid MCP (multi-memory coordination)
  - Graph-augmented MCP (knowledge graphs, entity relationships)
  - Compressed MCP (mobile optimization)
  - 6 complete implementation examples with code

- **[Security Guidelines](./augment-extensions/domain-rules/security/)** (v1.0.0, ~38K chars)
  - OWASP Top 10, authentication, encryption, input validation, secure coding

- **[WordPress Development](./augment-extensions/domain-rules/wordpress/)** (v1.0.0)
  - Project detection, directory structure, coding standards, themes, plugins, blocks

- **[WordPress Plugin Development](./augment-extensions/domain-rules/wordpress-plugin/)** (v1.1.0, ~344K chars)
  - **Most comprehensive module** - 7 architecture patterns, Gutenberg blocks, REST API
  - AJAX handlers, database management, security, performance, WooCommerce
  - Testing patterns, WordPress.org submission, migration workflows, VS Code integration

### Workflows (2 modules, ~71K chars)

- **[OpenSpec](./augment-extensions/workflows/openspec/)** (v1.0.0, ~32K chars)
  - Spec-driven development workflow for AI coding assistants
  - Proposal → Specs → Tasks → Implement → Archive

- **[Beads](./augment-extensions/workflows/beads/)** (v1.0.0, ~39K chars)
  - Distributed, git-backed graph issue tracker for AI agents
  - Create → Dependencies → Ready → Work → Close

### Examples (4 modules, ~122K chars)

- **[Design Patterns](./augment-extensions/examples/design-patterns/)** (v1.0.0, ~42K chars)
  - Common design patterns with TypeScript/JavaScript implementations

- **[Gutenberg Block Plugin](./augment-extensions/examples/gutenberg-block-plugin/)** (v1.0.0, ~15K chars)
  - Complete Gutenberg block plugin with testimonial example

- **[REST API Plugin](./augment-extensions/examples/rest-api-plugin/)** (v1.0.0, ~40K chars)
  - Task manager API with CRUD operations, authentication, validation

- **[WooCommerce Extension](./augment-extensions/examples/woocommerce-extension/)** (v1.0.0, ~24K chars)
  - Product customizer with custom fields, checkout customization

### Statistics

- **Total Modules**: 20 (8 coding standards, 6 domain rules, 2 workflows, 4 examples)
- **Total Character Count**: ~1,774,692 (1.7M+ characters)
- **Languages Covered**: HTML, CSS, JavaScript, TypeScript, Python, React, PHP
- **Domains Covered**: APIs, Databases, MCP, Security, WordPress

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

### Example 1: Frontend Web Development

```bash
# Install CLI
npm install -g @mytechtoday/augment-extensions

# Initialize in your project
augx init

# Option 1: Use the collection (recommended)
augx link collections/html-css-js

# Option 2: Link individual modules
augx link coding-standards/html
augx link coding-standards/css
augx link coding-standards/js

# Add workflows
augx link workflows/openspec
augx link workflows/beads
```

### Example 2: Python AI/ML Project with MCP

```bash
# Link Python standards and MCP guidelines
augx link coding-standards/python
augx link domain-rules/mcp
augx link domain-rules/database  # For vector databases

# View MCP guidelines
augx show mcp

# Search for specific MCP patterns
augx search "vector-based MCP"
augx search "RAG"
```

### Example 3: WordPress Plugin Development

```bash
# Link WordPress plugin modules
augx link domain-rules/wordpress-plugin
augx link coding-standards/php
augx link workflows/beads

# Link example modules
augx link examples/gutenberg-block-plugin
augx link examples/rest-api-plugin
augx link examples/woocommerce-extension

# View module content
augx show wordpress-plugin
```

### Example 4: Full-Stack TypeScript/React Project

```bash
# Link TypeScript and React standards
augx link coding-standards/typescript
augx link coding-standards/react
augx link domain-rules/api-design
augx link domain-rules/database
augx link domain-rules/security

# Add workflows
augx link workflows/openspec
augx link workflows/beads

# Add design patterns
augx link examples/design-patterns
```

### Example 5: PHP Web Application

```bash
# Link PHP standards and domain rules
augx link coding-standards/php
augx link domain-rules/api-design
augx link domain-rules/database
augx link domain-rules/security

# Add workflows
augx link workflows/openspec
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

### Comprehensive Coverage

- **1.7M+ characters** of guidelines across 20+ modules
- **8 programming languages/frameworks** - HTML, CSS, JavaScript, TypeScript, Python, React, PHP
- **6 domain-specific areas** - APIs, Databases, MCP, Security, WordPress
- **2 workflow systems** - OpenSpec (spec-driven development), Beads (issue tracking)
- **4 example modules** - Design patterns, Gutenberg blocks, REST API, WooCommerce

### Model Context Protocol (MCP) - 219K chars ✨ NEW

The most comprehensive MCP guidelines available:

- ✅ **6 MCP Types** - Token-based, state-based, vector-based, hybrid, graph-augmented, compressed
- ✅ **Universal Rules** - Context optimization, error handling, security, monitoring, testing
- ✅ **Configuration System** - JSON schema, validation, override semantics
- ✅ **Testing Framework** - Unit, integration, synthetic testing strategies
- ✅ **6 Complete Examples** - Legal contract analysis, customer support, knowledge base Q&A, research assistant, supply chain analysis, mobile assistant
- ✅ **RAG Patterns** - Retrieval Augmented Generation with embeddings and vector search
- ✅ **State Management** - Persistent conversation state with Redis, serialization, concurrency
- ✅ **Graph Integration** - Neo4j knowledge graphs with entity extraction and traversal

### Database Design Guidelines - 449K chars ✨ NEW

The largest module with comprehensive database coverage:

- ✅ **Relational Databases** - Schema design, normalization, indexing, query optimization, transactions
- ✅ **NoSQL Databases** - Document stores (MongoDB), key-value stores (Redis), graph databases (Neo4j)
- ✅ **Vector Databases** - Embeddings, indexing, semantic search (Pinecone, Weaviate, Qdrant)
- ✅ **Flat Databases** - CSV, JSON, SQLite use cases
- ✅ **Performance Optimization** - Query optimization, caching, connection pooling
- ✅ **Security Standards** - Encryption, access control, SQL injection prevention

### PHP Coding Standards - 186K chars ✨ NEW

Comprehensive PHP standards for modern development:

- ✅ **PSR Standards** - PSR-1, PSR-12, PSR-4, PSR-7, PSR-11
- ✅ **Security** - OWASP guidelines, input validation, SQL injection prevention
- ✅ **Testing** - PHPUnit, integration testing, mocking
- ✅ **CMS Integration** - WordPress, Drupal best practices
- ✅ **E-commerce** - WooCommerce development patterns
- ✅ **Legacy Migration** - Modernizing legacy PHP codebases

### WordPress Plugin Development - 344K chars

The most comprehensive WordPress module:

- ✅ **7 Architecture Patterns** - Procedural, OOP, MVC, singleton, DI, boilerplate
- ✅ **Gutenberg Blocks** - Block development with block.json and React
- ✅ **REST API** - Custom endpoints with authentication and validation
- ✅ **AJAX Handlers** - Secure AJAX with nonces and capability checks
- ✅ **Database Management** - Custom tables, queries, migrations
- ✅ **Security** - Nonces, sanitization, escaping, capability checks
- ✅ **WooCommerce** - Product fields, checkout, payment gateways, orders
- ✅ **Testing** - PHPUnit, Theme Check, Plugin Check, accessibility
- ✅ **VS Code Integration** - Complete IDE setup with tasks and snippets

### Workflow Integrations

- **OpenSpec** - Spec-driven development with proposal → specs → tasks → implement → archive
- **Beads** - Git-backed issue tracking with dependencies and graph visualization
- **Coordination System** - Harmonizes OpenSpec, Beads, and .augment/ rules

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

## 📊 Module Statistics

| Category | Modules | Total Characters | Highlights |
|----------|---------|------------------|------------|
| **Coding Standards** | 8 | ~504,000 | HTML, CSS, JS, TypeScript, Python, React, PHP |
| **Domain Rules** | 6 | ~1,085,000 | APIs, Databases, MCP, Security, WordPress |
| **Workflows** | 2 | ~71,000 | OpenSpec, Beads |
| **Examples** | 4 | ~122,000 | Design Patterns, Gutenberg, REST API, WooCommerce |
| **Collections** | 1 | ~164,000 | HTML/CSS/JS Bundle |
| **TOTAL** | **20** | **~1,774,000** | **1.7M+ characters** |

## 🔗 Links

- **npm Package**: [@mytechtoday/augment-extensions](https://www.npmjs.com/package/@mytechtoday/augment-extensions)
- **Repository**: [github.com/mytech-today-now/augment](https://github.com/mytech-today-now/augment)
- **Issues**: [github.com/mytech-today-now/augment/issues](https://github.com/mytech-today-now/augment/issues)
- **Documentation**: [MODULES.md](./MODULES.md) | [AGENTS.md](./AGENTS.md)

---

**Status**: Active Development | **Version**: 0.3.0 | **Maintainer**: @mytech-today-now

**Latest Release**: Model Context Protocol (MCP) module, PHP standards, Database guidelines, and enhanced module management with GUI.

