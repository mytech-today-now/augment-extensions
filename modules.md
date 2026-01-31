# Augment Extensions Module Catalog

This catalog lists all available extension modules for Augment Code AI.

## Quick Start

```bash
# List all modules
augx list

# Show module details
augx show <module-name>

# Link a module to your project
augx link <module-name>
```

## Coding Standards

### HTML Standards
- **Module**: `coding-standards/html`
- **Version**: 1.0.0
- **Character Count**: ~32,477
- **Description**: Comprehensive HTML coding standards for semantic, accessible, and modern web development
- **Contents**:
  - Semantic HTML
  - Accessibility (ARIA, WCAG)
  - Forms and validation
  - SEO best practices
  - Performance optimization

**Usage**:
```bash
augx link coding-standards/html
```

### CSS Standards
- **Module**: `coding-standards/css`
- **Version**: 1.0.0
- **Character Count**: ~30,556
- **Description**: Modern CSS coding standards including CSS Grid, Flexbox, custom properties, and responsive design
- **Contents**:
  - Modern CSS features (Grid, Flexbox, Custom Properties)
  - Responsive design
  - CSS architecture (BEM, SMACSS)
  - Performance optimization
  - Browser compatibility

**Usage**:
```bash
augx link coding-standards/css
```

### JavaScript Standards
- **Module**: `coding-standards/js`
- **Version**: 1.0.0
- **Character Count**: ~101,818
- **Description**: ES6+ JavaScript coding standards including async patterns, DOM manipulation, and modern tooling
- **Contents**:
  - ES6+ features
  - Async patterns (Promises, async/await)
  - DOM manipulation
  - Error handling
  - Performance optimization
  - Modern tooling (ESLint, Prettier)

**Usage**:
```bash
augx link coding-standards/js
```

### HTML/CSS/JavaScript Standards (DEPRECATED)
- **Module**: `coding-standards/html-css-js`
- **Version**: 1.0.0
- **Character Count**: ~165,097
- **Status**: ⚠️ **DEPRECATED** - Use individual modules or the `collections/html-css-js` collection instead
- **Description**: Legacy monolithic module. Replaced by individual HTML, CSS, and JS modules for better flexibility.
- **Migration**: Use `augx link collections/html-css-js` or link individual modules

**Usage** (not recommended):
```bash
augx link coding-standards/html-css-js  # Deprecated
```

### Python Coding Standards
- **Module**: `coding-standards/python`
- **Version**: 1.1.0
- **Character Count**: ~116,868
- **Description**: Comprehensive Python coding standards including naming conventions, type hints (PEP 484, 585, 604), and error handling
- **Contents**:
  - Async patterns
  - Best practices
  - Code organization
  - Documentation
  - Error handling
  - Naming conventions
  - Testing
  - Tooling
  - Type hints

**Usage**:
```bash
augx link coding-standards/python
```

### React Patterns
- **Module**: `coding-standards/react`
- **Version**: 1.0.0
- **Character Count**: ~32,000
- **Description**: Modern React patterns including component design, hooks, and state management best practices
- **Contents**:
  - Component patterns
  - Hooks best practices
  - Performance
  - State management
  - Typescript react

**Usage**:
```bash
augx link coding-standards/react
```

### TypeScript Standards
- **Module**: `coding-standards/typescript`
- **Version**: 1.0.0
- **Character Count**: ~6,416
- **Description**: Comprehensive TypeScript coding standards and best practices
- **Contents**:
  - Naming conventions

**Usage**:
```bash
augx link coding-standards/typescript
```

### PHP Coding Standards
- **Module**: `coding-standards/php`
- **Version**: 1.0.0
- **Character Count**: ~186,539
- **Description**: Comprehensive PHP coding standards following PSR standards and modern PHP best practices across various project types including web applications, APIs, CLI tools, CMS integrations, e-commerce systems, and legacy migrations
- **Contents**:
  - PSR standards (PSR-1, PSR-12, PSR-4, PSR-7, PSR-11)
  - Naming conventions
  - Type declarations
  - Error handling
  - Security (OWASP guidelines)
  - Performance optimization
  - Testing standards
  - Documentation (PHPDoc)
  - Code quality tools
  - Category configuration
  - Web applications
  - API development
  - CLI tools
  - CMS integration (WordPress, Drupal)
  - E-commerce (WooCommerce)
  - Legacy migration

**Usage**:
```bash
augx link coding-standards/php
```

### PowerShell Coding Standards
- **Module**: `coding-standards/powershell`
- **Version**: 1.0.0
- **Character Count**: ~162,000
- **Description**: Comprehensive PowerShell coding standards for professional, maintainable, and secure PowerShell code across automation, modules, DSC, cloud orchestration, administrative tools, cross-platform scripts, and legacy migrations
- **Contents**:
  - Universal standards (naming, error handling, security, performance, testing)
  - Configuration schema documentation (.augment/powershell-config.json)
  - Automation scripts (scheduled tasks, event-driven automation)
  - PowerShell modules and advanced functions
  - Desired State Configuration (DSC)
  - Cloud orchestration (Azure, AWS)
  - Administrative tools (Active Directory, Exchange, SQL Server)
  - Cross-platform scripts (PowerShell Core compatibility)
  - Legacy migrations (Windows PowerShell to PowerShell Core)
  - Category configuration system
  - PSScriptAnalyzer integration
  - Pester testing framework

**Usage**:
```bash
augx link coding-standards/powershell
```

**Configuration** (`.augment/powershell-config.json`):
```json
{
  "powershell_categories": ["automation", "modules", "cloud"],
  "powershell_version": "7.4",
  "strict_mode": true,
  "static_analysis": {
    "tool": "PSScriptAnalyzer",
    "severity": "Warning"
  },
  "testing": {
    "framework": "Pester",
    "version": "5.x"
  }
}
```

## Writing Standards

### Screenplay Writing Standards
- **Module**: `writing-standards/screenplay`
- **Version**: 1.0.0
- **Character Count**: ~163,500
- **Description**: Comprehensive screenplay writing and crafting standards for AI-driven content creation across AAA Hollywood films, independent films, TV series, web content, news broadcasts, commercials, streaming content, and live TV productions
- **Contents**:
  - Universal formatting (AMPAS standards)
  - Narrative structures (Field, Snyder, Campbell)
  - Character development and arcs
  - Dialogue writing and subtext
  - Screen continuity (180-degree rule, match cuts)
  - Pacing and timing
  - Diversity and inclusion
  - AAA Hollywood films
  - Independent films
  - TV series (episodic/serialized)
  - Web content (YouTube, TikTok, social media)
  - News broadcasts (SPJ Code of Ethics)
  - Commercials (15/30/60 second formats)
  - Streaming content (Netflix, Amazon, Disney+)
  - Live TV productions
  - Fountain format support
  - Export to Final Draft, PDF, HTML

**Usage**:
```bash
augx link writing-standards/screenplay
```

**Configuration** (`.augment/screenplay-config.json`):
```json
{
  "categories": ["aaa-hollywood-films", "tv-series"],
  "universalRules": true,
  "fountainFormat": true,
  "exportFormats": ["fdx", "pdf"]
}
```

## Collections

Collections bundle multiple related modules together for easier installation.

### HTML/CSS/JS Frontend Collection
- **Collection**: `collections/html-css-js`
- **Version**: 1.0.0
- **Description**: Complete frontend development standards bundle including HTML, CSS, and JavaScript modules
- **Included Modules**:
  - `coding-standards/html` (v1.0.0) - HTML standards
  - `coding-standards/css` (v1.0.0) - CSS standards
  - `coding-standards/js` (v1.0.0) - JavaScript standards
- **Total Character Count**: ~164,851
- **Backward Compatibility**: Replaces the deprecated `coding-standards/html-css-js` module

**Usage**:
```bash
augx link collections/html-css-js
```

**Or link individual modules**:
```bash
augx link coding-standards/html
augx link coding-standards/css
augx link coding-standards/js
```

## Domain Rules

### API Design Guidelines
- **Module**: `domain-rules/api-design`
- **Version**: 1.0.0
- **Character Count**: ~35,000
- **Description**: Comprehensive API design guidelines including REST, GraphQL, versioning, and best practices
- **Contents**:
  - Authentication
  - Documentation
  - Error handling
  - Graphql api
  - Rest api
  - Versioning

**Usage**:
```bash
augx link domain-rules/api-design
```

### Database Design Guidelines
- **Module**: `domain-rules/database`
- **Version**: 1.0.0
- **Character Count**: ~449,449
- **Description**: Comprehensive database design guidelines including schema design, normalization, indexing, and best practices
- **Contents**:
  - Flat databases
  - Nosql databases
  - Nosql document stores
  - Nosql graph databases
  - Nosql key value stores
  - Performance optimization
  - Relational databases
  - Relational indexing
  - Relational query optimization
  - Relational schema design
  - Relational transactions
  - Security standards
  - Universal best practices
  - Vector databases
  - Vector embeddings
  - Vector indexing

**Usage**:
```bash
augx link domain-rules/database
```

### Model Context Protocol (MCP) Guidelines
- **Module**: `domain-rules/mcp`
- **Version**: 1.0.0
- **Character Count**: ~219,130
- **Description**: Comprehensive guidelines for designing and implementing Model Context Protocol systems including token-based, state-based, vector-based, hybrid, graph-augmented, and compressed MCP
- **Contents**:
  - Universal rules (context optimization, error handling, security, monitoring, testing, documentation)
  - Token-based MCP (compression, chunking, budgeting)
  - State-based MCP (persistence, state machines, concurrency)
  - Vector-based MCP (RAG, embeddings, semantic search)
  - Hybrid MCP (multi-memory coordination, context orchestration)
  - Graph-augmented MCP (knowledge graphs, entity relationships, graph traversal)
  - Compressed MCP (multi-stage compression, mobile optimization)
  - Configuration system (JSON schema, validation, override semantics)
  - Testing framework (unit, integration, synthetic testing)
  - 6 complete implementation examples with code

**Usage**:
```bash
augx link domain-rules/mcp
```

### Security Guidelines
- **Module**: `domain-rules/security`
- **Version**: 1.0.0
- **Character Count**: ~38,000
- **Description**: Comprehensive security guidelines including OWASP best practices, authentication, encryption, and secure coding
- **Contents**:
  - Authentication security
  - Encryption
  - Input validation
  - Owasp top 10
  - Secure coding
  - Web security

**Usage**:
```bash
augx link domain-rules/security
```

### WordPress Development Standards
- **Module**: `domain-rules/wordpress`
- **Version**: 1.0.0
- **Character Count**: ~0
- **Description**: Comprehensive WordPress development guidelines including themes, plugins, blocks, and best practices
- **Contents**:
  - Coding standards
  - Directory structure
  - File patterns
  - Gutenberg blocks
  - Performance
  - Plugin development
  - Project detection
  - Rest api
  - Security
  - Theme development
  - Woocommerce

**Usage**:
```bash
augx link domain-rules/wordpress
```

### WordPress Plugin Development
- **Module**: `domain-rules/wordpress-plugin`
- **Version**: 1.1.0
- **Character Count**: ~344,186
- **Description**: Comprehensive WordPress plugin development guidelines covering plugin structure, architecture patterns, admin interfaces, frontend functionality, Gutenberg blocks, REST API, AJAX, database management, security, performance, WooCommerce integration, testing patterns, and WordPress.org submission.
- **Contents**:
  - Activation hooks
  - Admin interface
  - Ajax handlers
  - Asset management
  - Context providers
  - Cron jobs
  - Database management
  - Documentation standards
  - Frontend functionality
  - Gutenberg blocks
  - Internationalization
  - Migration
  - Performance optimization
  - Plugin architecture
  - Plugin structure
  - Rest api
  - Scaffolding workflow
  - Security best practices
  - Testing patterns
  - Testing
  - Vscode integration
  - Woocommerce integration
  - Wordpress org submission

**Usage**:
```bash
augx link domain-rules/wordpress-plugin
```

## Workflows

### Beads Workflow
- **Module**: `workflows/beads`
- **Version**: 1.0.0
- **Character Count**: ~39,912
- **Description**: Distributed, git-backed graph issue tracker for AI agents. Provides persistent, structured memory for coding agents with dependency tracking.
- **Contents**:
  - Best practices
  - File format
  - Manual setup
  - Workflow

**Usage**:
```bash
augx link workflows/beads
```

### OpenSpec Workflow
- **Module**: `workflows/openspec`
- **Version**: 1.0.0
- **Character Count**: ~32,661
- **Description**: Spec-driven development (SDD) workflow for AI coding assistants. Provides structured change management with proposals, specs, and tasks.
- **Contents**:
  - Best practices
  - Manual setup
  - Spec format
  - Workflow

**Usage**:
```bash
augx link workflows/openspec
```

## Examples

### Design Patterns Examples
- **Module**: `examples/design-patterns`
- **Version**: 1.0.0
- **Character Count**: ~42,000
- **Description**: Common design patterns with TypeScript/JavaScript implementations and use cases

**Usage**:
```bash
augx link examples/design-patterns
```

### Gutenberg Block Plugin Examples
- **Module**: `examples/gutenberg-block-plugin`
- **Version**: 1.0.0
- **Character Count**: ~15,889
- **Description**: Complete Gutenberg block plugin examples with block.json, React components, InspectorControls, RichText, MediaUpload, and build process

**Usage**:
```bash
augx link examples/gutenberg-block-plugin
```

### REST API Plugin Examples
- **Module**: `examples/rest-api-plugin`
- **Version**: 1.0.0
- **Character Count**: ~40,367
- **Description**: Complete REST API plugin examples with custom endpoints (GET, POST, PUT, DELETE), authentication, validation, error handling, and JavaScript client examples

**Usage**:
```bash
augx link examples/rest-api-plugin
```

### WooCommerce Extension Examples
- **Module**: `examples/woocommerce-extension`
- **Version**: 1.0.0
- **Character Count**: ~24,196
- **Description**: Complete WooCommerce extension examples with custom product fields, checkout customization, payment gateway, order hooks, and WooCommerce best practices

**Usage**:
```bash
augx link examples/woocommerce-extension
```

## Skills System

### Overview
- **Location**: `skills/`
- **Version**: 1.0.0
- **Total Skills**: 4
- **Description**: Token-efficient skill-based system for on-demand AI context injection. Skills are lightweight, focused definitions that replace full modules for specific tasks.

### Key Features
- **Token Reduction**: 97.18% average reduction vs full modules
- **Dynamic Loading**: Load only what you need, when you need it
- **Dependency Resolution**: Automatic dependency management
- **CLI Integration**: Wrap MCP servers and external tools
- **Caching**: Intelligent caching for performance

### Skill Categories

#### Retrieval Skills
- **sdk-query**: Query SDK documentation and code examples
- **context-retrieval**: Retrieve code context using semantic search

#### Analysis Skills
- **code-analysis**: Analyze code for quality and patterns

#### Generation Skills
- **add-mcp-skill**: Generate new MCP-based skills

### Usage

```bash
# List available skills
augx skill list

# Show skill details
augx skill show sdk-query

# Inject skill into context
augx skill inject sdk-query

# Load multiple skills
augx skill load sdk-query context-retrieval

# Validate a skill
augx skill validate skills/retrieval/my-skill.md

# Cache management
augx skill cache-clear
augx skill cache-stats
```

### Token Budget Guidelines
- **Micro skills**: 500-1000 tokens (single focused task)
- **Small skills**: 1000-2000 tokens (simple functionality)
- **Medium skills**: 2000-5000 tokens (moderate complexity)
- **Large skills**: 5000-10000 tokens (complex functionality)

### Performance Benchmarks

Based on `benchmarks/results.json`:

| Scenario | Baseline Tokens | Skill Tokens | Reduction |
|----------|----------------|--------------|-----------|
| SDK Query | 27,706 | 804 | 97.10% |
| Context Retrieval | 27,706 | 1,021 | 96.31% |
| Multiple Skills | 27,706 | 1,825 | 93.41% |
| Workflow Task | 8,804 | 8 | 99.91% |
| Coding Standards | 1,440 | 12 | 99.17% |
| **Average** | - | - | **97.18%** |

### Creating New Skills

See `skills/README.md` for detailed instructions on creating new skills.

**Quick Start**:
1. Choose appropriate category
2. Create skill file: `skills/<category>/<skill-id>.md`
3. Follow skill.md schema
4. Keep within token budget (500-10k tokens)
5. Test with `augx skill validate <skill-id>`

**Automated MCP Skill Creation**:
```bash
# Create a new MCP skill automatically
augx skill create-mcp \
  --name "GitHub MCP" \
  --description "GitHub repository management" \
  --category "integration" \
  --package "@modelcontextprotocol/server-github" \
  --token-budget 2500 \
  --tags "github,repository"
```

### MCP Integration

The skills system integrates with Model Context Protocol (MCP) servers:

```bash
# List MCP servers
augx mcp list

# Add MCP server
augx mcp add github-mcp "npx -y @modelcontextprotocol/server-github"

# Execute MCP tool
augx mcp exec github-mcp search-repos --args '{"query": "augment"}'

# Generate skill wrapper for MCP tool
augx mcp wrap github-mcp search-repos github-search --category retrieval
```

### Meta-Skills

**Meta-skills** are skills that help create or manage other skills:

- **add-mcp-skill**: Automates onboarding of new MCP integrations
  - Generates skill files from templates
  - Validates skill structure
  - Updates documentation
  - Reduces skill creation time from 30+ minutes to < 1 minute

---

## Statistics

- **Total Modules**: 19
- **Coding Standards**: 5
- **Writing Standards**: 1
- **Domain Rules**: 5
- **Workflows**: 2
- **Examples**: 4
- **Total Skills**: 4
- **Total Character Count**: ~1,938,192
