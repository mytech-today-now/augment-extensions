# Augment Extensions - Project Context

## Project Overview

**Augment Extensions** is a repository system that extends Augment Code AI beyond its ~49,400 character limit for the `.augment/` folder.

## Problem Statement

Augment Code AI's `.augment/` folder is limited to approximately 49,400 characters. This constraint makes it difficult to provide comprehensive coding standards, extensive examples, and detailed workflow documentation.

## Solution

Create a modular extension system where:
- Core meta-rules stay in `.augment/` folder (< 49,400 characters)
- Extension modules live in `augment-extensions/` directory (unlimited size)
- Modules are versioned, reusable, and project-agnostic
- AI agents can access modules via CLI or direct file reference

## Architecture

### Directory Structure

```
augment-extensions/
├── .augment/                    # Core rules (~17,000 chars)
│   └── rules/
├── augment-extensions/                     # Extension modules (unlimited)
│   ├── coding-standards/
│   ├── workflows/
│   ├── domain-rules/
│   └── examples/
├── cli/                         # CLI tool (augx)
├── openspec/                    # Spec-driven development
│   ├── specs/                   # Source of truth specs
│   ├── changes/                 # Proposed changes
│   └── archive/                 # Completed changes
├── .beads/                      # Task tracking
└── docs/                        # Documentation
```

### Module Categories

1. **coding-standards** - Language/framework specific standards
2. **domain-rules** - Domain-specific guidelines (web, API, security)
3. **workflows** - Process integration (OpenSpec, Beads)
4. **examples** - Code examples and patterns

## Current State

### Implemented Modules

1. **TypeScript Standards** (`coding-standards/typescript`)
   - Character count: ~15,420
   - Naming conventions, type safety, error handling

2. **OpenSpec Workflow** (`workflows/openspec`)
   - Character count: ~30,505
   - Spec-driven development workflow

3. **Beads Workflow** (`workflows/beads`)
   - Character count: ~36,816
   - Git-backed issue tracking for AI agents

### CLI Tool

- **Status**: Foundation created, commands not yet implemented
- **Commands**: init, list, show, link, search, update, version
- **Technology**: TypeScript/Node.js

## Integration Pattern

Follows the `AGENTS.md` convention used by OpenSpec and Beads:
- AI agents read `AGENTS.md` for project-specific instructions
- Modules can be used with or without CLI installation
- Manual file operations supported for all workflows

## Key Principles

1. **Project-agnostic** - Modules work across different projects
2. **Versioned** - Semantic versioning for compatibility
3. **CLI-optional** - Works without installation
4. **AI-optimized** - Designed for AI agent consumption
5. **Git-native** - All data versioned with git

## Target Users

- AI coding assistants (Claude Code, Cursor, GitHub Copilot, etc.)
- Development teams using Augment Code AI
- Individual developers wanting to extend AI capabilities
- Organizations standardizing coding practices

## Success Metrics

- Number of modules created
- Module reuse across projects
- Character count efficiency (core vs. modules)
- AI agent adoption
- Community contributions

## Related Projects

- **OpenSpec** - Spec-driven development for AI agents
- **Beads** - Git-backed issue tracker for AI agents
- **Ruler** - Multi-agent instruction distribution (different problem space)

## Technology Stack

- **Language**: TypeScript (CLI), Markdown (modules)
- **Runtime**: Node.js
- **Version Control**: Git
- **Package Manager**: npm
- **Documentation**: Markdown
- **Task Tracking**: Beads (JSONL)
- **Spec Management**: OpenSpec (Markdown)

## Development Workflow

1. Use Beads for task tracking
   - All issue IDs MUST use "bd-" prefix (see `openspec/specs/beads/naming-convention.md`)
2. Use OpenSpec for architectural changes
3. Create modules in `augment-extensions/` directory
4. Update `MODULES.md` catalog
5. Maintain `.augment/` folder within character limits
6. Follow semantic versioning

## Naming Conventions

### Beads Issue IDs

All Beads issue IDs in this project use the **"bd-" prefix**.

**Format**:
- Standard: `bd-<hash>` (e.g., `bd-a1b2`)
- Named: `bd-<name>` (e.g., `bd-init`, `bd-rename1`)
- Hierarchical: `bd-<hash>.<number>` (e.g., `bd-a1b2.1`)

**Specification**: See `openspec/specs/beads/naming-convention.md` for complete details.

## Future Roadmap

- Complete CLI implementation
- Add more coding standard modules (Python, React, etc.)
- Add domain-rule modules (web, API, security)
- Add example modules (design patterns, testing)
- Publish to npm
- Build module marketplace
- Community contribution guidelines

