# Augment Extensions

**Reusable augmentation modules for Augment Code AI - Beyond the 49,400 character limit.**

[![Version](https://img.shields.io/badge/version-2.3.0-blue.svg)](https://github.com/mytech-today-now/augment-extensions)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![npm](https://img.shields.io/badge/npm-%40mytechtoday%2Faugment--extensions-red.svg)](https://www.npmjs.com/package/@mytechtoday/augment-extensions)
[![CI](https://github.com/mytech-today-now/augment-extensions/actions/workflows/ci.yml/badge.svg)](https://github.com/mytech-today-now/augment-extensions/actions/workflows/ci.yml)
[![Tests](https://github.com/mytech-today-now/augment-extensions/actions/workflows/test.yml/badge.svg)](https://github.com/mytech-today-now/augment-extensions/actions/workflows/test.yml)

Augment Extensions is a modular repository system that extends Augment Code AI's capabilities by providing domain-specific rules, coding standards, workflow integrations, and extensive examples that can be consumed across multiple projects.

## 🎯 Purpose

Augment Code AI limits the `.augment/` folder to ~49,400 characters. This repository provides:

- **2.3M+ characters** of comprehensive guidelines across 22+ modules
- **Coding standards** for 8 languages/frameworks (HTML, CSS, JS, TypeScript, Python, React, PHP)
- **Domain-specific rules** (WordPress, API design, security, databases, MCP)
- **Writing standards** (Screenplay with 17 cinematic styles, Shakespeare)
- **Workflow integrations** (OpenSpec, Beads)
- **Extensive examples** (Gutenberg blocks, REST API, WooCommerce, design patterns)
- **Versioned updates** that propagate to consuming projects
- **Project-agnostic modules** that work across different codebases

## ✨ What's New in v2.3.0

### Shot List Generator Refactor - Production Ready 🎬

**Major Refactor Complete (AUGX-SHOT-GEN-001):**
All 12 requirements implemented for production-ready shot list generation:

1. ✅ **Default Output Behavior** - Auto-generates `<input>-ai-shot-list.<ext>` when `--output` not provided
2. ✅ **Intelligent Shot Splitting** - Automatically splits shots exceeding max duration into sub-shots (3a, 3b, 3c)
3. ✅ **Duration Formatting** - Clean MM:SS format for all durations (no decimals)
4. ✅ **Terminal Feedback Severity** - Color-coded warnings (red errors, yellow warnings)
5. ✅ **Visual Style Property** - Reality/Animation/CGI/Hybrid classification per shot
6. ✅ **Simplified Character Count** - Clean `C: #### / 4000` format with color indicators
7. ✅ **No-Dialogue Shots** - Explicit "No dialogue in this shot" in descriptions
8. ✅ **Mandatory Dialogue Property** - MPAA-style screenplay format or "No dialogue in this shot"
9. ✅ **Character Blocking Continuity** - Tracks positions/wardrobe/appearance across shots
10. ✅ **Rich Character Descriptions** - Character Bible with complete wardrobe/appearance/props/emotion
11. ✅ **Rich Set Descriptions** - Set Bible with environment/lighting/atmosphere/weather/timeOfDay
12. ✅ **JSON/JSONL Format Corrections** - Valid JSON with all fields, JSONL one shot per line

**Key Features:**
- 🎭 **Character Bible System** - Maintains consistent character descriptions across all shots
- 🎬 **Set Bible System** - Maintains consistent set/location descriptions across all shots
- 📐 **Blocking Continuity** - Tracks character positions and spatial relationships
- 🎨 **Visual Style Detection** - Automatically determines Reality/Animation/CGI/Hybrid
- 📊 **Production-Ready Output** - Suitable for downstream video generation AI
- ✅ **Validated JSON/JSONL** - Properly structured output for automated processing

### Previous Updates (v1.6.1)

**Shakespeare Module Enhancements:**
- ✅ **Comedy Scene Examples** - Added 2 comprehensive scene examples:
  - Much Ado About Nothing Act 2 Scene 3 (Benedick eavesdropping) - 497 lines
  - Twelfth Night Act 2 Scene 5 (Malvolio letter scene) - 654 lines
  - Full text, comic techniques, character analysis, thematic elements, performance notes
- 📢 **Module Announcement** - Created comprehensive ANNOUNCEMENT.md (177 lines)
  - Release overview, features, installation, quick start examples
  - Module stats: 419,662 characters, 33 files, 10,000+ lines

**Shot List Generator:**
- 🎬 **Plain Text Parser** - Implemented comprehensive PlainTextParser (252 lines)
  - Heuristic-based scene detection (INT/EXT patterns)
  - Character name detection, dialogue parsing, transition handling
  - Complete metadata extraction and validation

**Task Tracking:**
- ✅ **Completed Tasks** - Closed 3 Beads tasks with comprehensive documentation
- 📊 **Updated Tracking** - Synchronized .beads/issues.jsonl and completed.jsonl

### Previous Releases

**v1.4.0 - CLI Expansion - Phase 3 & 4 Complete 🎉**

**Phase 3 - Integration Commands:**
- 📋 **Beads Integration** - Full Beads system management with `augx beads` commands
  - `augx beads status` - System status and statistics
  - `augx beads validate` - Validate task structure
  - `augx beads export/import` - Export/import tasks
  - `augx beads stats` - Detailed statistics
  - `augx beads graph` - Dependency graph visualization
  - `augx beads report` - Generate reports (Markdown, HTML, JSON, CSV)
- ✅ **Task Management** - AI-friendly task commands with `augx task`
  - `augx task list/show/create/update/close` - Task CRUD operations
  - `augx task search` - Search tasks by criteria
  - `augx task deps` - Manage dependencies
- 📝 **OpenSpec Integration** - Spec-driven development with `augx spec`
  - `augx spec list/show/create/validate/archive` - Spec management
  - `augx spec status` - Spec status tracking
- 🔄 **Change Management** - Change proposals with `augx change`
  - `augx change list/show/create/validate/archive` - Change proposal management
- 📦 **Collection Management** - Module collections with `augx collection`
  - `augx collection list/show/link/unlink/validate` - Collection operations

**Phase 4 - Quality & Documentation:**
- 🧪 **Test Runner** - Comprehensive module testing
- 🔍 **Linter** - AI context quality validation
- 📚 **Docs Generator** - Automatic API documentation
- 💡 **Enhanced Help** - Intelligent command suggestions

### Previous Releases

**v1.1.0:**
- 📋 **Beads Completed Tracking** - Track and display completed Beads tasks with `augx show completed`
- 🎨 **Color-Coded Status** - Visual indicators for task status (✓ closed, ⚙ in-progress, ○ open, ✖ blocked)
- 📅 **Date Filtering** - Filter completed tasks by date range with `--since` and `--until` flags
- 🔍 **BD-Style Formatting** - Display tasks in familiar Beads CLI format with full details
- 🛡️ **Robust Parsing** - Graceful handling of corrupted JSON Lines data
- 🚀 **Auto-Initialization** - `augx init` automatically creates `scripts/completed.jsonl` when `.beads` exists
- 📊 **JSON Export** - Export completed tasks as JSON with `--json` flag

**v0.4.0:**
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

## 📋 Beads Integration

Augment Extensions integrates with [Beads](https://github.com/steveyegge/beads) to track completed tasks in a separate record for easy reference and reporting.

### Initializing Beads

```bash
# Initialize Beads task tracking in current project
augx init beads

# Or initialize as part of full Augment Extensions setup
augx init
```

This creates:
- `.beads/` directory with `issues.jsonl` and `config.json`
- `scripts/completed.jsonl` for tracking completed tasks

### Viewing Completed Tasks

```bash
# Show all completed tasks
augx show completed

# Filter by date range (ISO 8601 format)
augx show completed --since 2026-02-01
augx show completed --until 2026-02-02T12:00:00Z
augx show completed --since 2026-02-01 --until 2026-02-02

# Filter by task attributes
augx show completed --type task
augx show completed --priority 1
augx show completed --assignee kyle@mytech.today
augx show completed --labels "beads-completed,cli"

# Search tasks
augx show completed --search "implement feature"

# Sort and limit
augx show completed --sort date --order desc --limit 10

# Output formats
augx show completed --json          # JSON output
augx show completed --verbose       # Detailed output with all fields
augx show completed --quiet         # Only task IDs (one per line)
```

### Features

- **Color-Coded Status**: Visual indicators for task status
  - ✓ closed (green)
  - ⚙ in-progress (yellow)
  - ○ open (blue)
  - ✖ blocked (red)
- **BD-Style Formatting**: Familiar Beads CLI format with task ID, title, status, priority, description, dates, and labels
- **Advanced Filtering**: Filter by date range, type, priority, assignee, labels, or search terms
- **Multiple Output Formats**: Standard, verbose, quiet, or JSON output
- **Sorting**: Sort by date, title, or priority in ascending or descending order
- **Robust Parsing**: Gracefully handles corrupted JSON Lines data with warnings

### For AI Agents

AI agents can query completed tasks to:
- Check if a task has already been executed
- Review task completion history
- Generate reports on completed work
- Avoid duplicate work

```bash
# Check if task is completed
augx show completed --json | grep "bd-xyz"

# Get tasks completed today
augx show completed --since $(date -I)

# Get all task IDs for scripting
augx show completed --quiet

# Filter by multiple criteria
augx show completed --type task --priority 1 --labels cli --verbose
```

## 📖 Command Help Extraction

The CLI automatically extracts and formats command-line help documentation from workflow tools (Beads, OpenSpec, Augx) during initialization, creating an AI-friendly reference file.

### What is Command Help Extraction?

When you run `augx init`, the CLI:
1. **Detects available workflow tools** in your repository (.beads, openspec, .augment directories)
2. **Extracts help documentation** by executing `--help` commands recursively
3. **Generates Markdown reference** at `.augment/COMMAND_HELP.md`
4. **Provides AI-friendly format** for command discovery and usage

### Benefits

- **Automatic Documentation**: No manual documentation needed for CLI tools
- **Always Up-to-Date**: Regenerated on each `augx init` to reflect current tool versions
- **AI-Friendly Format**: Structured Markdown optimized for AI agent consumption
- **Recursive Extraction**: Captures main commands and all subcommands (up to 3 levels deep)
- **Multi-Tool Support**: Works with Beads, OpenSpec, Augx, and custom tools

### Usage

```bash
# Automatic extraction during initialization
augx init

# Manual extraction (if needed)
augx extract-help

# View generated reference
cat .augment/COMMAND_HELP.md
```

### Example Output

The generated `COMMAND_HELP.md` file contains:

```markdown
# Command Help Reference

Auto-generated command-line help for Augment workflow tools.

**Generated**: 2026-02-01T19:30:00.000Z
**Tools**: Augx, Beads, OpenSpec
**Version**: 1.0.0

---

## Augx Commands (augx)

### augx --help
\`\`\`
Usage: augx [command]

Commands:
  init      Initialize Augment Extensions
  link      Link a module
  list      List available modules
  ...
\`\`\`

### augx init --help
\`\`\`
Initialize Augment Extensions in the current project
...
\`\`\`
```

### For AI Agents

AI agents can use the generated reference to:
- **Discover available commands** without executing them
- **Learn command syntax** and options
- **Generate accurate command invocations** based on help text
- **Understand tool capabilities** across the project

### Customization

Add custom tools to extraction by modifying the tool configuration in `cli/src/utils/extractCommandHelp.ts`:

```typescript
const CUSTOM_TOOLS: Tool[] = [
  { name: 'MyTool', command: 'mytool', directory: '.mytool', helpFlag: '--help' }
];
```

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
├── augment-extensions/              # Extension modules (2.3M+ characters)
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
│   ├── writing-standards/          # Writing standards (2 modules, 583K chars) ✨ NEW
│   │   ├── screenplay/             # Screenplay writing (163.5K chars)
│   │   │   ├── cinematic-styles/   # 17 cinematic style guides (257K chars)
│   │   │   │   ├── directors/      # 11 auteur directors (Nolan, Tarantino, Lynch, etc.)
│   │   │   │   ├── franchises/     # Star Wars, MCU/Avengers
│   │   │   │   ├── films/          # Blue Ruin (indie filmmaking)
│   │   │   │   ├── comedy-formats/ # Monty Python, Saturday Night Live
│   │   │   │   └── narrative-theory/ # Joseph Campbell (Hero's Journey)
│   │   │   ├── genres/             # Genre conventions
│   │   │   ├── styles/             # Narrative styles (linear, non-linear, etc.)
│   │   │   └── themes/             # Thematic integration
│   │   └── literature/             # Literature writing standards
│   │       └── shakespeare/        # Shakespeare writing (419.7K chars)
│   │           ├── rules/          # Poetry, drama, language, character & themes
│   │           └── examples/       # Annotated sonnets, scene examples, exercises
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

**New in v2.0.0**: Comprehensive module versioning system with semantic versioning, version selection, and compatibility checking.

#### Quick Start

```bash
# List modules with available versions
augx list --versions

# Use specific module version
augx use coding-standards/typescript --version 2.0.0

# Pin version for stability (saves to .augment/extensions.json)
augx use coding-standards/typescript --version 2.0.0 --pin

# Upgrade module to latest version
augx upgrade coding-standards/typescript

# Show detailed version information
augx version-info coding-standards/typescript
```

#### Version Selection Strategies

**Latest Version (Default)**:
```bash
# Always use latest version
augx use coding-standards/typescript
```

**Specific Version**:
```bash
# Use exact version
augx use coding-standards/typescript --version 2.0.0
```

**Version Pinning** (Recommended for Production):
```bash
# Pin to specific version (prevents automatic updates)
augx use coding-standards/typescript --version 2.0.0 --pin

# Verify pinned versions
cat .augment/extensions.json
```

#### Upgrade Workflow

```bash
# Check for available updates
augx list --versions

# Upgrade specific module (with compatibility checks)
augx upgrade coding-standards/typescript

# Upgrade with breaking change warnings
augx upgrade coding-standards/typescript --dry-run

# Force upgrade (skip compatibility checks)
augx upgrade coding-standards/typescript --force
```

#### GUI Version Selection

Launch the modern TUI for interactive version selection:

```bash
augx gui
```

**Features**:
- 🌲 **Tree Navigator** - Browse modules by category with arrow keys
- 📦 **Version Selector** - View and select available versions
- 🔍 **Search & Filter** - Find modules by name, tag, or category
- 📄 **Preview Pane** - View module details, metadata, and version history
- ⌨️ **Keyboard Shortcuts**:
  - `↑/↓` - Navigate modules
  - `←/→` - Collapse/expand categories
  - `Enter` - Select module/version
  - `P` - Pin/unpin version
  - `C` - Filter by category
  - `T` - Filter by tag
  - `/` - Search
  - `?` - Show help
  - `Q` - Quit

#### Version Compatibility

All modules include compatibility metadata:

```bash
# Check compatibility requirements
augx version-info coding-standards/typescript

# Example output:
# Version: 2.0.0
# Compatibility:
#   - Augment: 1.0.0+
#   - Node.js: 18.0.0+
#   - TypeScript: 5.0.0+
```

#### Migration from v1.x

See **[Migration Guide](./docs/MIGRATION_V2.md)** for detailed migration instructions.

**Quick migration**:
```bash
# Update CLI to v2.0.0
npm install -g augx@2.0.0

# Update all modules
augx update

# Or pin to v1.x for stability
augx use coding-standards/typescript --version 1.0.0 --pin
```

## 📖 Available Modules

### Coding Standards (8 modules, ~504K chars)

- **[HTML Standards](./augment-extensions/coding-standards/html/)** (v1.0.0, ~32K chars)
  - Semantic HTML, accessibility (ARIA, WCAG), forms, SEO, performance

- **[CSS Standards](./augment-extensions/coding-standards/css/)** (v1.0.0, ~30K chars)
  - Modern CSS (Grid, Flexbox, Custom Properties), responsive design, BEM/SMACSS

- **[JavaScript Standards](./augment-extensions/coding-standards/js/)** (v1.0.0, ~101K chars)
  - ES6+ features, async patterns, DOM manipulation, error handling, tooling

- **[TypeScript Standards](./augment-extensions/coding-standards/typescript/)** (v2.0.0, ~25K chars) ✨ UPDATED
  - Modern TypeScript 5.x features (const type parameters, satisfies, inferred type predicates)
  - Advanced type patterns (discriminated unions, branded types, template literal types)
  - Monorepo patterns (Turborepo, Nx), tooling (flat ESLint, Biome, tsup, Vitest)
  - Architecture patterns (DDD, clean architecture, hexagonal), error handling (Neverthrow, Effect-TS)
  - Security & performance best practices, comprehensive testing strategies

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

### Writing Standards (2 modules, ~583K chars)

- **[Screenplay Writing Standards](./augment-extensions/writing-standards/screenplay/)** (v1.0.0, ~163.5K chars)
  - **Industry-Standard Formatting** - AMPAS Nicholl Fellowship formatting standards
  - **Narrative Frameworks** - Syd Field, Blake Snyder, Joseph Campbell structures
  - **8 Screenplay Categories** - Hollywood, indie, TV, web, news, commercials, streaming, live TV
  - **Character Development** - Programmatic character arcs, traits, motivations
  - **Dialogue Mastery** - Natural speech, subtext, character voice
  - **Screen Continuity** - Visual consistency rules (180-degree rule, match cuts)
  - **Fountain Format** - Industry-standard plain-text screenplay markup
  - **Cinematic Styles** (257K chars) - 17 comprehensive style guides:
    - **11 Auteur Directors** - Christopher Nolan, Quentin Tarantino, Coen Brothers, David Lynch, Denis Villeneuve, Martin Scorsese, Steven Spielberg, Stanley Kubrick, Wes Anderson, Francis Ford Coppola, George Lucas
    - **2 Franchises** - Star Wars, MCU/Avengers
    - **1 Film** - Blue Ruin (indie filmmaking)
    - **2 Comedy Formats** - Monty Python, Saturday Night Live
    - **1 Narrative Theory** - Joseph Campbell (Hero's Journey)
  - **VS Code Integration** - Better Fountain extension support
  - **Export Tools** - Final Draft (.fdx), PDF, HTML export

- **[Shakespeare Writing Standards](./augment-extensions/writing-standards/literature/shakespeare/)** (v1.0.0, ~419.7K chars)
  - **Poetry** - Sonnets, narrative poetry, verse forms, iambic pentameter
  - **Drama** - Tragedy, comedy, history plays, scene construction
  - **Language** - Elizabethan English, rhetoric & wordplay, vocabulary guide
  - **Character & Themes** - Character development, thematic elements
  - **Annotated Examples** - Sonnets, scene examples, exercises
  - **Comedy Scene Examples** - Much Ado About Nothing Act 2 Scene 3 (497 lines), Twelfth Night Act 2 Scene 5 (654 lines)
  - **Comprehensive Coverage** - 33 files, 10,000+ lines, complete guide to Shakespearean writing

### Statistics

- **Total Modules**: 22 (8 coding standards, 6 domain rules, 2 workflows, 4 examples, 2 writing standards)
- **Total Character Count**: ~2,357,692 (2.3M+ characters)
- **Languages Covered**: HTML, CSS, JavaScript, TypeScript, Python, React, PHP
- **Domains Covered**: APIs, Databases, MCP, Security, WordPress
- **Writing Formats**: Screenplay (Fountain), Shakespearean Literature

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
- [Module Development](./.augment-guidelines/development/module-development.md) - Creating custom modules
- [Character Count Management](./.augment-guidelines/repository-rules/character-count-management.md) - Managing .augment/ limits

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

### Example 6: Screenplay Writing with Cinematic Styles

```bash
# Link screenplay writing standards
augx link writing-standards/screenplay

# Generate shot list with cinematic style
augx generate-shot-list --path my-screenplay.fountain --style christopher-nolan

# Generate shot list with multiple styles (priority-based merging)
augx generate-shot-list --path my-screenplay.fountain \
  --style christopher-nolan \
  --style denis-villeneuve

# View available cinematic styles
augx show writing-standards/screenplay

# Search for specific director styles
augx search "quentin tarantino"
augx search "wes anderson"
```

### Example 7: Shakespearean Writing

```bash
# Link Shakespeare writing standards
augx link writing-standards/literature/shakespeare

# View Shakespeare module content
augx show shakespeare

# Search for specific topics
augx search "iambic pentameter"
augx search "comedy techniques"
augx search "sonnets"
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

### Module Management
```bash
# List all available modules
augx list

# List linked modules in current project
augx list --linked

# Show module details
augx show <module-name>

# Show all linked modules
augx show linked

# Show all available modules
augx show all

# Show module as JSON
augx show <module-name> --json

# Search for modules
augx search <keyword>

# Update all linked modules
augx update

# Check CLI version
augx version
```

### Beads Integration (Phase 3)
```bash
# System status and statistics
augx beads status [--json] [--verbose]

# Validate task structure
augx beads validate [task-id] [--fix]

# Export/import tasks
augx beads export <output-file> [--format json|csv]
augx beads import <input-file>

# Generate statistics
augx beads stats [--json] [--by-priority|--by-label|--by-owner]

# Dependency graph visualization
augx beads graph [--format ascii|mermaid|dot|svg] [--output file]

# Generate reports
augx beads report [--format markdown|html|json|csv] [--output file]
```

### Task Management (Phase 3)
```bash
# Task CRUD operations
augx task list [--status open|closed] [--priority 0-3]
augx task show <task-id>
augx task create <title> [--priority N] [--tags tag1,tag2]
augx task update <task-id> [--status status] [--priority N]
augx task close <task-id> [--reason reason]

# Search and filter
augx task search <query> [--labels label1,label2]

# Dependency management
augx task deps <task-id> [--add dep-id] [--remove dep-id]
```

### OpenSpec Integration (Phase 3)
```bash
# Spec management
augx spec list [--status active|draft|archived]
augx spec show <spec-id>
augx spec create <name> [--category cat] [--title "Title"]
augx spec validate <spec-id>
augx spec archive <spec-id>
augx spec status [--json]
```

### Change Management (Phase 3)
```bash
# Change proposal management
augx change list [--status active|archived]
augx change show <change-name>
augx change create <name> [--title "Title"] [--jira TICKET-123]
augx change validate <change-name>
augx change archive <change-name>
```

### Collection Management (Phase 3)
```bash
# Collection operations
augx collection list
augx collection show <collection-name>
augx collection link <collection-name>
augx collection unlink <collection-name>
augx collection validate <collection-name>
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

- **2.3M+ characters** of guidelines across 22+ modules
- **8 programming languages/frameworks** - HTML, CSS, JavaScript, TypeScript, Python, React, PHP
- **6 domain-specific areas** - APIs, Databases, MCP, Security, WordPress
- **2 workflow systems** - OpenSpec (spec-driven development), Beads (issue tracking)
- **4 example modules** - Design patterns, Gutenberg blocks, REST API, WooCommerce
- **2 writing standards** - Screenplay (with 17 cinematic styles), Shakespeare

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

1. **Create New Modules** - Follow [module-development.md](./.augment-guidelines/development/module-development.md)
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
| **Writing Standards** | 2 | ~583,000 | Screenplay (Cinematic Styles), Shakespeare |
| **Collections** | 1 | ~164,000 | HTML/CSS/JS Bundle |
| **TOTAL** | **22** | **~2,357,000** | **2.3M+ characters** |

## 🔗 Links

- **npm Package**: [@mytechtoday/augment-extensions](https://www.npmjs.com/package/@mytechtoday/augment-extensions)
- **Repository**: [github.com/mytech-today-now/augment-extensions](https://github.com/mytech-today-now/augment-extensions)
- **Issues**: [github.com/mytech-today-now/augment-extensions/issues](https://github.com/mytech-today-now/augment-extensions/issues)
- **Documentation**: [MODULES.md](./MODULES.md) | [AGENTS.md](./AGENTS.md)

---

**Status**: Active Development | **Version**: 2.3.0 | **Maintainer**: @mytech-today-now

**Latest Release**: Shot List Generator Refactor Complete (AUGX-SHOT-GEN-001) - Production-ready shot list generation with Character/Set Bibles, intelligent shot splitting, blocking continuity, visual style detection, and validated JSON/JSONL output for downstream video generation AI.

