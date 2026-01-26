# Available Extension Modules

This document catalogs all available extension modules for Augment Code AI.

## Coding Standards

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

### Python Standards (Coming Soon)
- **Module**: `coding-standards/python`
- **Status**: Planned

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
- **Character Count**: ~81,445
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

## Domain Rules

### WordPress Plugin Development
- **Module**: `domain-rules/wordpress-plugin`
- **Version**: 1.1.0
- **Character Count**: ~331,037
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
  - **WooCommerce integration** (products, cart, checkout, orders, payment gateways, emails)
  - **Testing patterns** (PHPUnit, unit tests, integration tests, WooCommerce tests)
  - Documentation standards (PHPDoc, readme.txt)
  - WordPress.org submission process

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

