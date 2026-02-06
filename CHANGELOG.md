# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.3.0] - 2026-02-06

### Added

#### ADR Support Module
- **Architecture Decision Records (ADR) Workflow Module** - Complete ADR lifecycle management
  - Automatic decision detection from code changes and conversations
  - 4 ADR templates: Nygard, MADR Simple, MADR Elaborate, Business Case
  - Full lifecycle management: draft → proposed → approved → implemented → maintained
  - OpenSpec and Beads integration for traceability
  - Validation and conflict detection
  - Template selection logic based on decision complexity
  - 8 comprehensive rule files
  - 4 ready-to-use templates
  - 3 complete examples with integration workflows
  - 2 JSON schemas for configuration and metadata

#### Visual Design Module
- **Visual Design System Module** - Multi-domain visual design support
  - Support for web pages, motion pictures, print campaigns, and other visual domains
  - Vendor-agnostic style definitions (Tailwind, Bootstrap, Material-UI, custom CSS)
  - AI prompt generation for visual design tools
  - Style comparison and selection utilities
  - Domain-specific workflows and examples
  - TypeScript utilities for style management
  - Comprehensive test coverage

### Changed
- Updated package version from 1.2.2 to 1.3.0
- Enhanced module catalog with new workflow and domain modules


## [0.4.0] - 2026-01-31

### Added

#### Skills System (Beta)
- **Token-Efficient Skills** - Lightweight, focused modules (500-10K tokens vs 50K+ for full modules)
  - 97.2% average token reduction compared to full modules
  - On-demand loading with dynamic dependency resolution
  - 6 skill categories: retrieval, transformation, analysis, generation, integration, utility
  - Intelligent caching for performance optimization

#### Skill Commands
- `augx skill list` - List all available skills
- `augx skill show <skill-id>` - Show skill details and content
- `augx skill search <keyword>` - Search for skills by name, description, or tags
- `augx skill validate <file>` - Validate skill file format and metadata
- `augx skill exec <skill-id>` - Execute skill CLI commands
- `augx skill inject <skill-id>` - Inject skill content into AI context with dependency resolution
- `augx skill load <skill-ids...>` - Load multiple skills in batch
- `augx skill cache-clear` - Clear skill cache
- `augx skill cache-stats` - Show cache statistics
- `augx skill create-mcp` - Create new MCP skill wrapper

#### MCP Integration (Beta)
- **MCP Server Management** - Wrap Model Context Protocol servers as CLI commands and skills
  - Inspired by [mcporter](https://github.com/steipete/mcporter)
  - Configure MCP servers in `.augment/mcp/servers.json`
  - Execute MCP tools via CLI
  - Generate skill wrappers for MCP tools
  - Discover available tools from MCP servers

#### MCP Commands
- `augx mcp list` - List configured MCP servers
- `augx mcp add <name> <command>` - Add MCP server configuration
- `augx mcp remove <name>` - Remove MCP server
- `augx mcp exec <server> <tool>` - Execute MCP tool
- `augx mcp wrap <server> <tool> <skill-id>` - Generate skill wrapper
- `augx mcp discover <server>` - Discover tools from server
- `augx mcp generate-cli <command> <output>` - Generate CLI using mcporter

#### Documentation
- **Skill Development Guide** (`docs/SKILL_DEVELOPMENT.md`) - Comprehensive guide for creating skills
- **Migration Guide** (`docs/MIGRATION_GUIDE.md`) - Migrate from modules to skills
- **CLI Reference** (`docs/CLI_REFERENCE.md`) - Complete CLI command reference
- **MCP Integration** (`.augment/mcp/README.md`) - MCP integration documentation

#### Initial Skills
- **sdk-query** (retrieval) - Query SDK documentation and code examples
- **context-retrieval** (retrieval) - Retrieve code context using semantic search
- **code-analysis** (analysis) - Analyze code for quality and security
- **add-mcp-skill** (generation) - Meta-skill for automating MCP skill creation

### Changed
- Updated repository structure to include `skills/` directory
- Enhanced README.md with Skills System and MCP Integration sections
- Updated package.json repository URLs to `mytech-today-now/augment-extensions`
- Improved coordination system to track skills alongside modules

### Performance
- **97.2% token reduction** - Measured in benchmarks (skills vs full modules)
- **Faster context injection** - Smaller files, faster parsing
- **Better organization** - Focused, single-purpose skills

### Statistics
- **Total Skills**: 4 (1 retrieval, 1 analysis, 1 generation)
- **Total Modules**: 20 (8 coding standards, 6 domain rules, 2 workflows, 4 examples, 1 collection)
- **Total Character Count**: ~1,774,692 (1.7M+ characters in modules)

## [0.3.0] - 2026-01-29

### Added

#### New Modules
- **Model Context Protocol (MCP) Guidelines** (`domain-rules/mcp`) - 219,130 characters
  - 6 MCP types: token-based, state-based, vector-based, hybrid, graph-augmented, compressed
  - Universal rules for context optimization, error handling, security, monitoring, testing
  - Configuration system with JSON schema and validation
  - Testing framework with unit, integration, and synthetic testing strategies
  - 6 complete implementation examples with production-ready code
  - RAG patterns with embeddings and vector search
  - State management with Redis, serialization, and concurrency control
  - Graph integration with Neo4j knowledge graphs

- **PHP Coding Standards** (`coding-standards/php`) - 186,539 characters
  - PSR standards (PSR-1, PSR-12, PSR-4, PSR-7, PSR-11)
  - Security guidelines following OWASP best practices
  - Testing standards with PHPUnit
  - CMS integration patterns (WordPress, Drupal)
  - E-commerce development (WooCommerce)
  - Legacy migration strategies

- **Database Design Guidelines** (`domain-rules/database`) - 449,449 characters
  - Relational databases: schema design, normalization, indexing, query optimization, transactions
  - NoSQL databases: document stores (MongoDB), key-value stores (Redis), graph databases (Neo4j)
  - Vector databases: embeddings, indexing, semantic search (Pinecone, Weaviate, Qdrant)
  - Flat databases: CSV, JSON, SQLite use cases
  - Performance optimization and security standards

#### CLI Features
- **GUI Module Manager** - Interactive terminal UI for module selection (`augx gui`)
- **Unlink Command** - Remove modules or collections with dependency checking
- **Self-Remove Command** - Safely uninstall all Augment Extensions with dry-run mode
- **Enhanced Search** - Find modules by name, description, or tags in the GUI

#### Module System
- **Collections System** - Bundle multiple related modules together
  - `collections/html-css-js` - Complete frontend development bundle (164,851 chars)
- **Modular HTML/CSS/JS** - Split monolithic module into independent modules
  - `coding-standards/html` (32,477 chars)
  - `coding-standards/css` (30,556 chars)
  - `coding-standards/js` (101,818 chars)

### Changed
- Refactored README.md to accurately reflect all 20 modules and 1.7M+ characters of content
- Updated repository structure documentation
- Enhanced usage examples for different project types (frontend, Python/AI, WordPress, full-stack, PHP)
- Improved module statistics and categorization

### Deprecated
- `coding-standards/html-css-js` - Use `collections/html-css-js` or individual modules instead

### Statistics
- **Total Modules**: 20 (8 coding standards, 6 domain rules, 2 workflows, 4 examples, 1 collection)
- **Total Character Count**: ~1,774,692 (1.7M+ characters)
- **Languages Covered**: HTML, CSS, JavaScript, TypeScript, Python, React, PHP
- **Domains Covered**: APIs, Databases, MCP, Security, WordPress

## [0.2.0] - 2026-01-XX

### Added
- **WordPress Plugin Development Module** (`domain-rules/wordpress-plugin`) - 344,186 characters
- **WordPress Plugin Workflow** (`workflows/wordpress-plugin`)
- **Beads Workflow Integration** (`workflows/beads`) - 39,912 characters
- **Example Modules**: Gutenberg blocks, REST API plugins, WooCommerce extensions
- **Migration Guides**: WordPress core, PHP, theme, and plugin migrations
- **VS Code Integration**: Complete IDE setup for WordPress development
- **Python Coding Standards** (`coding-standards/python`) - 116,868 characters
- **React Patterns** (`coding-standards/react`) - 32,000 characters

## [0.1.3] - 2025-XX-XX

### Added
- Initial module system
- TypeScript coding standards
- OpenSpec workflow integration

## [0.1.2] - 2025-XX-XX

### Added
- CLI improvements
- Module validation

## [0.1.1] - 2025-XX-XX

### Added
- Bug fixes and improvements

## [0.1.0] - 2025-XX-XX

### Added
- Initial release
- Basic CLI functionality
- Module linking system

[0.4.0]: https://github.com/mytech-today-now/augment-extensions/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/mytech-today-now/augment-extensions/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/mytech-today-now/augment-extensions/compare/v0.1.3...v0.2.0
[0.1.3]: https://github.com/mytech-today-now/augment-extensions/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/mytech-today-now/augment-extensions/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/mytech-today-now/augment-extensions/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/mytech-today-now/augment-extensions/releases/tag/v0.1.0

