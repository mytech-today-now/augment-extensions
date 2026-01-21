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

See [docs/MODULE_DEVELOPMENT.md](./docs/MODULE_DEVELOPMENT.md) for guidelines on creating new modules.

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

