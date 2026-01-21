# Augment Extensions - AI Agent Integration

This repository provides extension modules for Augment Code AI that exceed the standard `.augment/` character limit.

## For AI Agents

### Discovery

You can discover and use extension modules through the `augx` CLI:

```bash
# List all available modules
augx list

# Show module details
augx show <module-name>

# Search for modules
augx search <keyword>
```

### Usage in Projects

When working on a project that has Augment Extensions linked:

1. **Check linked modules**: `augx list --linked`
2. **View module content**: `augx show <module-name>`
3. **Apply module rules**: Follow the guidelines in the module's rules/ directory

### Module Structure

Each module contains:
- `module.json` - Metadata and configuration
- `rules/` - Markdown files with detailed guidelines
- `examples/` - Code examples demonstrating best practices
- `README.md` - Module overview

### Integration Workflow

1. Human initializes: `augx init`
2. Human links modules: `augx link coding-standards/typescript`
3. AI agent queries: `augx show typescript-standards`
4. AI agent applies rules from module content

### CLI Commands Reference

- `augx list` - List all available modules
- `augx list --linked` - List modules linked to current project
- `augx show <module>` - Display module content
- `augx search <term>` - Search for modules
- `augx update` - Update all linked modules
- `augx version` - Show CLI version

## Module Types

1. **coding-standards** - Language/framework specific standards
2. **domain-rules** - Domain-specific guidelines (web, API, security, etc.)
3. **workflows** - Process and methodology integration (OpenSpec, Beads, etc.)
4. **examples** - Extensive code examples and patterns

## Character Limit Context

- Standard `.augment/` limit: ~49,400 characters
- Extension modules: No limit (stored separately)
- Modules are loaded on-demand when relevant to current task

## Best Practices for AI Agents

1. **Query before applying**: Always check module content before applying rules
2. **Respect versions**: Use pinned versions for consistency
3. **Combine modules**: Multiple modules can be active simultaneously
4. **Report issues**: If module content conflicts, notify the human

## Example Usage

```bash
# AI agent working on TypeScript project
$ augx list --linked
typescript-standards (v1.0.0)
react-patterns (v2.1.0)

$ augx show typescript-standards
# Returns full module content including all rules and examples
```

---

## OpenSpec Integration

This repository uses **OpenSpec** for spec-driven development.

### OpenSpec Workflow

1. **Draft Change Proposal**: Create `openspec/changes/[change-name]/proposal.md`
2. **Review & Align**: Create spec deltas in `openspec/changes/[change-name]/specs/`
3. **Implement Tasks**: Create `openspec/changes/[change-name]/tasks.md` and implement
4. **Archive**: Move completed change to `openspec/archive/[change-name]/`

### OpenSpec Files

- `openspec/project-context.md` - Project overview and architecture
- `openspec/specs/` - Source of truth specifications
- `openspec/changes/` - Proposed changes (deltas)
- `openspec/archive/` - Completed changes

### For AI Agents

When making architectural changes:
1. Create a change proposal in `openspec/changes/`
2. Define spec deltas (ADDED/MODIFIED/REMOVED sections)
3. Break down into tasks
4. Implement and archive when complete

**Learn More**: See `modules/workflows/openspec/` for comprehensive workflow documentation.

---

## Beads Integration

This repository uses **Beads** for task tracking and memory.

### Beads Workflow

1. **Create Task**: Append to `.beads/issues.jsonl` with unique hash-based ID
2. **Add Dependencies**: Use `blocks` and `blocked_by` fields
3. **Find Ready Tasks**: Tasks with no open blockers
4. **Work on Task**: Update status to `in-progress`, add comments
5. **Close Task**: Update status to `closed`

### Beads Files

- `.beads/issues.jsonl` - All issues (append-only JSONL log)
- `.beads/config.json` - Beads configuration
- `.beads/cache.db` - SQLite cache (gitignored, CLI only)

### For AI Agents

When tracking work:
1. Create tasks by appending JSON to `.beads/issues.jsonl`
2. Use hash-based IDs: `bd-<hash>` (e.g., `bd-a1b2`)
3. Track dependencies with `blocks`/`blocked_by` fields
4. Find ready tasks (status: "open", no blockers)
5. Update status and add comments as work progresses

**Task States**: `open`, `in-progress`, `blocked`, `closed`

**Learn More**: See `modules/workflows/beads/` for comprehensive workflow documentation.

---

**Note**: This is a meta-repository for extending Augment Code AI. The actual project-specific `.augment/` folder remains in individual projects.

