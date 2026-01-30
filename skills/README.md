# Skills Directory

## Overview

This directory contains lightweight, focused skill definitions that can be dynamically injected into AI context on-demand.

## Directory Structure

```
skills/
├── README.md                    # This file
├── retrieval/                   # Retrieval skills
│   ├── sdk-query.md
│   ├── context-retrieval.md
│   └── code-search.md
├── transformation/              # Transformation skills
│   ├── code-refactor.md
│   └── format-conversion.md
├── analysis/                    # Analysis skills
│   ├── code-review.md
│   └── security-audit.md
├── generation/                  # Generation skills
│   ├── code-generation.md
│   └── documentation-generation.md
├── integration/                 # Integration skills
│   ├── api-integration.md
│   └── database-integration.md
└── utility/                     # Utility skills
    ├── file-operations.md
    └── text-processing.md
```

## Skill Categories

### Retrieval
Skills that retrieve information from codebases, SDKs, or documentation.

**Examples**: sdk-query, context-retrieval, code-search

### Transformation
Skills that transform code or data from one format to another.

**Examples**: code-refactor, format-conversion, syntax-migration

### Analysis
Skills that analyze code for quality, security, or performance.

**Examples**: code-review, security-audit, performance-analysis

### Generation
Skills that generate new code, documentation, or tests.

**Examples**: code-generation, documentation-generation, test-generation

### Integration
Skills that integrate with external systems or APIs.

**Examples**: api-integration, database-integration, cloud-integration

### Utility
General-purpose utility skills.

**Examples**: file-operations, text-processing, data-validation

## Skill File Format

Each skill is defined in a Markdown file with YAML frontmatter:

```markdown
---
id: skill-id
name: Skill Name
version: 1.0.0
category: category-name
tags: [tag1, tag2]
tokenBudget: 2000
priority: high
dependencies: []
cliCommand: augx-skill-command
---

# Skill Name

## Purpose
Brief description

## Usage
How to use

## Examples
Code examples

## CLI
CLI usage (if applicable)

## Notes
Additional notes (optional)
```

## Creating a New Skill

1. Choose appropriate category
2. Create skill file: `skills/<category>/<skill-id>.md`
3. Follow skill.md schema (see `openspec/changes/skill-based-refactor/specs/skill-md-schema.md`)
4. Keep within token budget (500-10k tokens)
5. Test with `augx skill validate <skill-id>`

## Token Budget Guidelines

- **Micro skills**: 500-1000 tokens (single focused task)
- **Small skills**: 1000-2000 tokens (simple functionality)
- **Medium skills**: 2000-5000 tokens (moderate complexity)
- **Large skills**: 5000-10000 tokens (complex functionality)
- **Never exceed**: 10000 tokens per skill

## Naming Conventions

- **File names**: kebab-case (e.g., `sdk-query.md`)
- **Skill IDs**: kebab-case (e.g., `sdk-query`)
- **CLI commands**: `augx-<skill-id>` (e.g., `augx-sdk-query`)

## Usage

### List Available Skills

```bash
augx skill list
```

### Show Skill Details

```bash
augx skill show sdk-query
```

### Execute Skill

```bash
augx skill exec sdk-query --query "authentication"
```

### Inject Skill into Context

```bash
augx skill inject sdk-query
```

## Validation

Validate skill files:

```bash
augx skill validate sdk-query
```

Validates:
- Frontmatter is valid YAML
- All required fields present
- Token budget realistic
- Dependencies exist
- CLI command unique

## Best Practices

1. **Keep skills focused**: One skill, one purpose
2. **Minimize token usage**: Be concise, avoid redundancy
3. **Provide examples**: Show common use cases
4. **Document dependencies**: List required skills
5. **Test thoroughly**: Validate before committing
6. **Version properly**: Follow semantic versioning

## Migration from Modules

To migrate module functionality to skills:

1. Identify focused functionality within module
2. Extract into separate skill files
3. Keep token budget under 10k per skill
4. Add CLI wrapper if needed
5. Update module to reference skills

See migration guide: `openspec/changes/skill-based-refactor/specs/migration-guide.md`

