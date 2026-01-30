---
id: add-mcp-skill
name: Add New MCP Skill Meta-Skill
version: 1.0.0
category: generation
tokenBudget: 3500
priority: high
tags: [meta-skill, mcp, automation, skill-creation, onboarding]
dependencies: []
cliCommand: augx skill exec add-mcp-skill
---

# Add New MCP Skill Meta-Skill

## Purpose

This meta-skill automates the process of onboarding new Model Context Protocol (MCP) integrations as skills in the Augment Extensions system.

## Workflow

### 1. Gather MCP Information

**Inputs Required:**
- MCP server name (e.g., "github-mcp", "slack-mcp")
- MCP server description
- MCP server URL or npm package
- Available tools/resources
- Authentication requirements
- Token budget estimate (500-10,000)

**Questions to Ask:**

```
1. What is the MCP server name?
2. What does this MCP server do? (brief description)
3. How is it installed? (npm package, git repo, or URL)
4. What tools does it provide? (list main capabilities)
5. Does it require authentication? (API keys, OAuth, etc.)
6. What category does it belong to? (retrieval, transformation, analysis, generation, integration, utility)
7. Estimated token budget? (500-10K, default: 2000)
```

### 2. Determine Skill Category

**Category Selection Logic:**

- **retrieval** - Fetches data (GitHub repos, Slack messages, databases)
- **transformation** - Converts/processes data (format conversion, data mapping)
- **analysis** - Analyzes data (code review, sentiment analysis, metrics)
- **generation** - Creates content (code generation, documentation, templates)
- **integration** - Connects systems (webhooks, API bridges, sync tools)
- **utility** - Helper functions (validation, formatting, utilities)

### 3. Create Skill File

**File Location:** `skills/{category}/{mcp-name}.md`

**Template:**

```markdown
---
id: {mcp-name}
name: {MCP Server Name}
version: 1.0.0
category: {category}
tokenBudget: {budget}
priority: medium
tags: [mcp, {domain}, {capability}]
dependencies: []
cliCommand: {cli-command}
mcpServer: {mcp-server-url-or-package}
---

# {MCP Server Name}

## Purpose

{Description of what this MCP server does}

## Installation

\`\`\`bash
# Install MCP server
{installation-command}
\`\`\`

## Configuration

{Authentication and configuration steps}

## Available Tools

{List of tools provided by MCP server}

## CLI Command

\`\`\`bash
{cli-command} [options]
\`\`\`

### Options

{List of CLI options}

## Examples

### Example 1: {Use Case}

\`\`\`bash
{example-command}
\`\`\`

### Example 2: {Use Case}

\`\`\`bash
{example-command}
\`\`\`

## Performance

- **Query Time**: {estimated-time}
- **Token Usage**: {estimated-tokens}
- **Rate Limits**: {rate-limits}

## Best Practices

1. {Best practice 1}
2. {Best practice 2}
3. {Best practice 3}

## Troubleshooting

{Common issues and solutions}
```

### 4. Validate Skill

**Validation Steps:**

```bash
# Validate skill metadata
augx skill validate {mcp-name}

# Test skill loading
augx skill show {mcp-name}

# Test skill search
augx skill search {mcp-name}
```

### 5. Register in Coordination Manifest

**Update `.augment/coordination.json`:**

```json
{
  "skills": {
    "{mcp-name}": {
      "category": "{category}",
      "tokenBudget": {budget},
      "mcpServer": "{mcp-server}",
      "status": "active"
    }
  }
}
```

### 6. Create Documentation

**Update `skills/README.md`:**

Add entry to the appropriate category section.

### 7. Test Integration

**Integration Tests:**

```bash
# Test CLI execution (if applicable)
augx skill exec {mcp-name} --help

# Test skill injection
augx skill inject {mcp-name} --json

# Test with dependencies
augx skill inject {mcp-name} --no-deps
```

## Automation Script

This meta-skill can be automated with a CLI command:

```bash
augx skill create-mcp \
  --name "github-mcp" \
  --description "GitHub repository management" \
  --category "integration" \
  --package "@modelcontextprotocol/server-github" \
  --token-budget 2500
```

## Output

- ✅ Skill file created at `skills/{category}/{mcp-name}.md`
- ✅ Skill validated successfully
- ✅ Coordination manifest updated
- ✅ Documentation updated
- ✅ Integration tests passed

## Success Criteria

1. Skill file exists and is valid
2. Skill appears in `augx skill list`
3. Skill can be searched with `augx skill search`
4. Skill can be injected with `augx skill inject`
5. CLI command works (if applicable)
6. Documentation is complete

