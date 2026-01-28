# Available Extension Modules

This document catalogs all available extension modules for Augment Code AI.

## Coding Standards

### HTML/CSS/JavaScript Standards
- **Module**: `coding-standards/html-css-js`
- **Version**: 1.0.0
- **Character Count**: ~165,097
- **Description**: Comprehensive HTML/CSS/JavaScript coding standards for modern web development with semantic HTML, modern CSS features, and ES6+ JavaScript
- **Contents**:
  - HTML standards (semantic elements, accessibility, document structure)
  - CSS standards (naming conventions, BEM, organization, responsive design)
  - CSS modern features (custom properties, Grid, Flexbox)
  - JavaScript standards (ES6+ features, variables, functions, modules)
  - DOM manipulation patterns
  - Async/await patterns
  - Performance optimization
  - Tooling (ESLint, Prettier, Stylelint, HTMLHint)
  - Core examples (HTML, CSS, JavaScript)
  - Advanced examples (responsive layout, async patterns, DOM manipulation)

**Usage**:
```bash
augx link coding-standards/html-css-js
```

### TypeScript Standards
- **Module**: `coding-standards/typescript`
- **Version**: 1.0.0
- **Character Count**: ~15,420
- **Description**: Comprehensive TypeScript coding standards and best practices
- **Contents**:
  - Naming conventions
  - Type safety guidelines
  - Error handling patterns
  - Async/await best practices

**Usage**:
```bash
augx link coding-standards/typescript
```

### Python Standards
- **Module**: `coding-standards/python`
- **Version**: 1.1.0
- **Character Count**: ~116,868
- **Description**: Comprehensive Python coding standards including PEP 8 naming conventions, modern type hints (PEP 484, 585, 604), error handling, async patterns, testing with pytest, and development tooling (Black, mypy, Ruff)
- **Contents**:
  - Naming conventions (PEP 8)
  - Type hints (PEP 484, 585, 604) with modern syntax
  - Error handling patterns
  - Best practices
  - Code organization (imports, modules, classes)
  - Async/await patterns with asyncio
  - Documentation and docstrings
  - Testing with pytest (fixtures, parametrization, mocking, coverage)
  - Tooling (Black formatter, mypy type checker, Ruff linter)
  - Comprehensive Python code examples

**Usage**:
```bash
augx link coding-standards/python
```

### React Patterns (Coming Soon)
- **Module**: `coding-standards/react`
- **Status**: Planned

## Workflows

### OpenSpec Workflow
- **Module**: `workflows/openspec`
- **Version**: 1.0.0
- **Character Count**: ~30,505
- **Description**: Spec-driven development (SDD) workflow for AI coding assistants
- **Contents**:
  - Complete workflow guide (proposal → specs → tasks → implement → archive)
  - Specification format and delta syntax
  - Manual setup without CLI
  - CLI command reference
  - Best practices and patterns
  - Complete change examples

**Usage**:
```bash
augx link workflows/openspec
```

**Installation**: Optional CLI available via `npm install -g @fission-ai/openspec@latest`

**Learn More**: https://openspec.dev/

### WordPress Plugin Development Workflow
- **Module**: `workflows/wordpress-plugin`
- **Version**: 1.2.0
- **Character Count**: ~81,564
- **Description**: Complete workflows for WordPress plugin development including development cycle, testing setup, WordPress.org submission, and comprehensive best practices. Optimized for AI-assisted development with OpenSpec and Beads integration.
- **Contents**:
  - Development workflow (feature planning, implementation, security-first approach)
  - Testing workflow (PHPUnit setup, TDD, CI/CD integration)
  - Submission workflow (security audit, WPCS compliance, WordPress.org submission)
  - Best practices (code organization, naming conventions, security, performance, accessibility)
  - AI prompt templates for each workflow phase
  - Beads task breakdown patterns
  - OpenSpec spec templates

**Usage**:
```bash
augx link workflows/wordpress-plugin
```

**Dependencies**: `domain-rules/wordpress-plugin`


### Beads Workflow
- **Module**: `workflows/beads`
- **Version**: 1.0.0
- **Character Count**: ~36,816
- **Description**: Distributed, git-backed graph issue tracker for AI agents
- **Contents**:
  - Complete workflow guide (create → dependencies → ready → work → close)
  - JSONL file format specification
  - Manual setup without CLI
  - CLI command reference
  - Best practices and patterns
  - Complete workflow examples

**Usage**:
```bash
augx link workflows/beads
```

**Installation**: Optional CLI available via `npm install -g @beads/bd`

**Learn More**: https://github.com/steveyegge/beads

### Database Design and Development Workflow
- **Module**: `workflows/database`
- **Version**: 1.0.0
- **Character Count**: ~124,548
- **Description**: Comprehensive workflow for database design, schema development, migration management, optimization, and testing. Covers relational, NoSQL, vector, and flat databases.
- **Contents**:
  - Complete workflow guide (requirements → design → implementation → testing → deployment)
  - Schema design workflow (entity modeling, normalization, indexing strategy)
  - Migration workflow (version control, rollback strategies, zero-downtime migrations)
  - Optimization workflow (query analysis, index optimization, performance tuning)
  - Testing patterns (unit tests, integration tests, performance tests, data validation)
  - Documentation standards (schema documentation, migration logs, runbooks)
  - Data migration best practices (ETL patterns, data validation, rollback procedures)
  - AI prompt templates for database tasks
  - Complete workflow examples (schema design, migration, optimization)

**Usage**:
```bash
augx link workflows/database
```

**Dependencies**: `domain-rules/database`

## Domain Rules

### Database Design Guidelines
- **Module**: `domain-rules/database`
- **Version**: 1.0.0
- **Character Count**: ~449,449
- **Description**: Comprehensive database design guidelines including schema design, normalization, indexing, query optimization, and best practices for relational, NoSQL, vector, and flat databases
- **Contents**:
  - Schema design principles (entities, relationships, constraints)
  - Normalization (1NF through 5NF, denormalization strategies)
  - Indexing strategies (B-tree, hash, composite, covering indexes)
  - Query optimization (execution plans, query patterns, anti-patterns)
  - Data types and constraints (choosing appropriate types, NULL handling)
  - Transactions and concurrency (ACID, isolation levels, locking)
  - Database security (authentication, authorization, encryption, SQL injection prevention)
  - Performance optimization (caching, partitioning, sharding)
  - Backup and recovery strategies
  - Migration patterns (schema versioning, zero-downtime migrations)
  - SQL best practices (naming conventions, formatting, common patterns)
  - NoSQL patterns (document stores, key-value, column-family, graph databases)
  - Database testing (unit tests, integration tests, performance tests)
  - Monitoring and maintenance
  - Complete examples (e-commerce schema, social media schema, analytics schema)

**Usage**:
```bash
augx link domain-rules/database
```

### WordPress Plugin Development
- **Module**: `domain-rules/wordpress-plugin`
- **Version**: 1.1.0
- **Character Count**: ~344,186
- **Description**: Comprehensive WordPress plugin development guidelines covering plugin structure, architecture patterns, admin interfaces, frontend functionality, Gutenberg blocks, REST API, AJAX, database management, security, performance, WooCommerce integration, testing patterns, and WordPress.org submission
- **Contents**:
  - Plugin structure and architecture patterns (7 patterns)
  - Activation/deactivation/uninstall hooks
  - Admin interface development (settings pages, meta boxes)
  - Frontend functionality (CPT, taxonomies, shortcodes, widgets)
  - Gutenberg block development
  - REST API endpoints
  - AJAX handlers
  - Database management (custom tables, queries)
  - Cron jobs and scheduled tasks
  - Security best practices (nonces, sanitization, escaping)
  - Performance optimization (caching, query optimization)
  - Internationalization (i18n/l10n)
  - Asset management (scripts and styles)
  - WooCommerce integration (products, cart, checkout, orders, payment gateways, emails)
  - Testing patterns (PHPUnit, unit tests, integration tests, WooCommerce tests)
  - Documentation standards (PHPDoc, readme.txt)
  - WordPress.org submission process
  - **Simple Procedural Plugin Example** (complete working plugin)

**Usage**:
```bash
augx link domain-rules/wordpress-plugin
```

### Web Development (Coming Soon)
- **Module**: `domain-rules/web-development`
- **Status**: Planned
- **Description**: Best practices for web application development

### API Design (Coming Soon)
- **Module**: `domain-rules/api-design`
- **Status**: Planned
- **Description**: RESTful and GraphQL API design guidelines

### Security (Coming Soon)
- **Module**: `domain-rules/security`
- **Status**: Planned
- **Description**: Security best practices and common vulnerabilities

## Examples

### Design Patterns (Coming Soon)
- **Module**: `examples/design-patterns`
- **Status**: Planned
- **Description**: Common design patterns with code examples

### Testing Strategies (Coming Soon)
- **Module**: `examples/testing-strategies`
- **Status**: Planned
- **Description**: Unit, integration, and E2E testing examples

## Contributing New Modules

See [module-development.md](./module-development.md) for guidelines on creating new modules.

## Module Versioning

All modules follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes to module structure or rules
- **MINOR**: New rules or examples added
- **PATCH**: Bug fixes, typos, clarifications

## Character Count Guidelines

- **Small modules**: < 10,000 characters
- **Medium modules**: 10,000 - 25,000 characters
- **Large modules**: > 25,000 characters

Modules should be split if they exceed 50,000 characters.

