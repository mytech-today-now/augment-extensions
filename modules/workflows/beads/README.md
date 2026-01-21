# Beads Workflow Module

**Distributed, git-backed graph issue tracker for AI agents.**

## Overview

Beads provides persistent, structured memory for coding agents. It replaces messy markdown plans with a dependency-aware graph, allowing agents to handle long-horizon tasks without losing context.

## Key Benefits

- **Git as Database**: Issues stored as JSONL in `.beads/` directory, versioned with your code
- **Agent-Optimized**: JSON output, dependency tracking, auto-ready task detection
- **Zero Conflict**: Hash-based IDs (`bd-a1b2`) prevent merge collisions in multi-agent workflows
- **Invisible Infrastructure**: SQLite local cache for speed, background daemon for auto-sync
- **Memory Decay**: Semantic compaction summarizes old closed tasks to save context window

## Installation Options

### Option 1: With CLI (Recommended)

Install the Beads CLI for full features:

```bash
# npm
npm install -g @beads/bd

# Homebrew
brew install steveyegge/beads/bd

# Go
go install github.com/steveyegge/beads/cmd/bd@latest

# Initialize in your project
cd your-project
bd init
```

**Benefits**: SQLite cache, auto-sync daemon, validation, JSON output, compaction

### Option 2: Without CLI (Manual)

Work with `.beads/` files directly without installing the CLI. See `rules/manual-setup.md` for instructions.

**Benefits**: No installation required, works immediately

**Limitations**: No SQLite cache, manual sync, no validation, no compaction

## Directory Structure

```
your-project/
├── .beads/
│   ├── issues.jsonl          # All issues (append-only log)
│   ├── config.json           # Beads configuration
│   └── cache.db              # SQLite cache (CLI only, gitignored)
└── AGENTS.md                 # AI agent instructions
```

## Core Workflow

### Creating Tasks

```bash
# With CLI
bd create "Implement user authentication" -p 0

# Without CLI - append to .beads/issues.jsonl
```

### Viewing Ready Tasks

```bash
# With CLI
bd ready

# Shows tasks with no open blockers
```

### Managing Dependencies

```bash
# With CLI
bd dep add <child-id> <parent-id>

# Creates blocks/blocked-by relationships
```

### Closing Tasks

```bash
# With CLI
bd close <id>

# Marks task as closed
```

## Hierarchical IDs

Beads supports epic/task/subtask hierarchy:

- `bd-a3f8` (Epic)
- `bd-a3f8.1` (Task)
- `bd-a3f8.1.1` (Sub-task)

## Stealth Mode

Use Beads locally without committing to the main repo:

```bash
bd init --stealth
```

Perfect for personal use on shared projects.

## Character Count

This module contains comprehensive Beads workflow documentation that exceeds the standard `.augment/` folder character limit.

**Total**: ~28,000 characters across all rule files

## Contents

- `rules/workflow.md` - Complete workflow guide
- `rules/file-format.md` - JSONL file format specification
- `rules/manual-setup.md` - Manual setup without CLI
- `rules/commands.md` - CLI command reference
- `rules/best-practices.md` - Tips and patterns
- `examples/` - Example workflows and use cases

## Learn More

- **GitHub**: https://github.com/steveyegge/beads
- **Agent Instructions**: https://github.com/steveyegge/beads/blob/main/AGENT_INSTRUCTIONS.md
- **Documentation**: See `rules/` directory in this module

