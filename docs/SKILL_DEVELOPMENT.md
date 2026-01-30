# Skill Development Guide

## Overview

Skills are focused, token-efficient modules that provide specific functionality to AI agents. This guide covers how to create, test, and publish new skills.

## Skill Structure

Every skill is a Markdown file with YAML frontmatter:

```markdown
---
id: my-skill
name: My Skill Name
version: 1.0.0
category: retrieval
tags: [search, query]
tokenBudget: 2000
priority: high
dependencies: []
cliCommand: augx-my-skill
autoLoad: false
replaces: []
---

# Skill Content

Detailed instructions for the AI agent...
```

## Skill Categories

- **retrieval**: Fetch data from external sources
- **transformation**: Transform or process data
- **analysis**: Analyze code or data
- **generation**: Generate code or content
- **integration**: Integrate with external tools
- **utility**: General utility functions

## Creating a New Skill

### Step 1: Choose Category

Determine which category best fits your skill's purpose.

### Step 2: Create Skill File

Create a new file in `skills/<category>/<skill-id>.md`:

```bash
# Example: Create a new retrieval skill
touch skills/retrieval/my-skill.md
```

### Step 3: Add Frontmatter

Add YAML frontmatter with required fields:

```yaml
---
id: my-skill                    # Unique identifier (kebab-case)
name: My Skill Name             # Human-readable name
version: 1.0.0                  # Semantic version
category: retrieval             # One of: retrieval, transformation, analysis, generation, integration, utility
tags: [search, query]           # Searchable tags
tokenBudget: 2000               # Estimated token count
priority: high                  # critical, high, medium, low
dependencies: []                # Other skill IDs this depends on
cliCommand: augx-my-skill       # CLI command to execute (optional)
autoLoad: false                 # Auto-load on startup (optional)
replaces: []                    # Module IDs this skill replaces (optional)
---
```

### Step 4: Write Skill Content

Write clear, concise instructions for the AI agent:

```markdown
# My Skill

## Purpose

Brief description of what this skill does.

## Usage

How to use this skill:

1. Step 1
2. Step 2
3. Step 3

## Examples

### Example 1

\`\`\`typescript
// Example code
\`\`\`

## Best Practices

- Tip 1
- Tip 2
```

### Step 5: Validate Skill

```bash
augx skill validate my-skill
```

### Step 6: Test Skill

```bash
# Show skill details
augx skill show my-skill

# Inject into context
augx skill inject my-skill

# Execute CLI command (if defined)
augx skill exec my-skill --arg value
```

## Token Budget Guidelines

- **Small**: < 1,000 tokens (focused, single-purpose)
- **Medium**: 1,000 - 3,000 tokens (moderate complexity)
- **Large**: 3,000 - 5,000 tokens (comprehensive)
- **Split if exceeds**: > 5,000 tokens (break into multiple skills)

## Best Practices

### DO

✅ Keep skills focused on a single purpose  
✅ Use clear, actionable language  
✅ Provide concrete examples  
✅ Stay within token budget  
✅ Test thoroughly before publishing  
✅ Document dependencies clearly  

### DON'T

❌ Mix multiple unrelated purposes  
❌ Exceed 5,000 token budget  
❌ Use vague or ambiguous instructions  
❌ Forget to validate frontmatter  
❌ Skip testing  

## Publishing Skills

### Internal Use

Skills in the `skills/` directory are automatically discovered by the CLI.

### External Distribution

To share skills with others:

1. Create a skill collection in `augment-extensions/collections/`
2. Add skill files to the collection
3. Update collection metadata
4. Publish to npm or share repository

## CLI Commands Reference

```bash
# List all skills
augx skill list

# List skills by category
augx skill list --category retrieval

# Show skill details
augx skill show <skill-id>

# Validate skill
augx skill validate <skill-id>

# Search skills
augx skill search <query>

# Execute skill CLI command
augx skill exec <skill-id> [args...]

# Inject skill into AI context
augx skill inject <skill-id>
```

## Next Steps

- Review existing skills in `skills/` directory
- Create your first skill
- Test with `augx skill` commands
- Share with the community

