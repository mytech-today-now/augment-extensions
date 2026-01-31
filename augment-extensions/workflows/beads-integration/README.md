# Beads Integration Workflow

## Overview

The **Beads Integration Workflow** module provides comprehensive guidelines and automation for AI-driven Beads task generation, OpenSpec decomposition, and workflow integration. This module ensures that AI agents generate high-quality, detailed, and actionable Beads tasks that follow best practices and maintain consistency across projects.

## Key Benefits

- **Comprehensive Task Generation**: AI-driven task creation with detailed structure and quality standards
- **OpenSpec Integration**: Automated decomposition of OpenSpec specifications into Beads tasks
- **TypeScript Automation**: Command framework for validation, generation, and integration
- **Effectiveness Standards**: Quality criteria ensuring tasks are atomic, complete, clear, and testable
- **Configurable Modes**: Basic, advanced, and custom modes for different project needs

## Installation

### With CLI (Future)

```bash
augx link workflows/beads-integration
```

### Without CLI (Current)

1. Copy the contents of `augment-extensions/workflows/beads-integration/` to your project
2. Reference the module in your project's `.augment/` folder
3. Configure the module in `config/defaults.json`

## Directory Structure

```
beads-integration/
├── module.json                          # Module metadata and configuration
├── README.md                            # This file
├── rules/                               # Detailed guidelines
│   ├── core-rules.md                    # Universal guidelines for all task generation
│   ├── task-generation.md               # Comprehensive task generation guidelines
│   ├── effectiveness-standards.md       # Quality and effectiveness criteria
│   ├── openspec-integration.md          # OpenSpec decomposition automation
│   └── typescript-commands.md           # TypeScript command framework
├── config/                              # Configuration files
│   ├── schema.json                      # Configuration schema
│   └── defaults.json                    # Default configuration
├── examples/                            # Example files
│   ├── basic-task-generation.md         # Basic task generation examples
│   ├── advanced-decomposition.md        # Advanced decomposition examples
│   └── typescript-automation.md         # TypeScript automation examples
└── scripts/                             # Automation scripts
    ├── validators/                      # Validation commands
    ├── generators/                      # Generation commands
    └── integrations/                    # Integration commands
```

## Core Workflow

### 1. Task Generation

AI agents use the task generation guidelines to create comprehensive Beads tasks:

- **Structure**: Description, prerequisites, steps, verification
- **Quality**: Clarity, completeness, actionability
- **Standards**: Versioning, logging, dependencies, error handling

### 2. OpenSpec Decomposition

Automated decomposition of OpenSpec specifications into Beads tasks:

- **Parsing**: Extract requirements and scenarios from OpenSpec files
- **Sequencing**: Determine task order and dependencies
- **Parallelization**: Identify tasks that can run in parallel
- **Progress Tracking**: Monitor decomposition and task completion

### 3. TypeScript Automation

Command framework for validation, generation, and integration:

- **bd-validate**: Validate task structure and quality
- **bd-generate**: Generate tasks from templates
- **bd-decompose**: Decompose OpenSpec specs into tasks

## Configuration Modes

### Basic Mode

Simplified task generation with essential quality checks.

### Advanced Mode

Full task generation with all effectiveness standards and OpenSpec integration.

### Custom Mode

Configurable features and rules for specific project needs.

## Usage Examples

### Generate a Task

```typescript
// Using TypeScript command
bd-generate --template basic --title "Implement feature X"
```

### Decompose OpenSpec

```typescript
// Decompose OpenSpec spec into Beads tasks
bd-decompose --spec openspec/specs/feature-x.md
```

### Validate Task

```typescript
// Validate task structure and quality
bd-validate --task bd-xyz
```

## Character Count

**Total**: TBD (will be calculated after all files are created)

## Contents

1. **rules/core-rules.md** - Universal guidelines for all beads task generation
2. **rules/task-generation.md** - Comprehensive task generation guidelines
3. **rules/effectiveness-standards.md** - Quality and effectiveness criteria
4. **rules/openspec-integration.md** - OpenSpec decomposition automation
5. **rules/typescript-commands.md** - TypeScript command framework
6. **config/schema.json** - Configuration schema
7. **config/defaults.json** - Default configuration
8. **examples/basic-task-generation.md** - Basic task generation examples
9. **examples/advanced-decomposition.md** - Advanced decomposition examples
10. **examples/typescript-automation.md** - TypeScript automation examples

## Version

**1.0.0** - Initial release

## Dependencies

- `workflows/openspec` >= 1.0.0
- `workflows/beads` >= 1.0.0

