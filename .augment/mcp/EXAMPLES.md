# MCP Integration Examples

This document provides practical examples of using the MCP integration in Augment Extensions.

## Example 1: Beads Task Tracking

The Beads MCP server provides real-time access to task tracking data.

### Configuration

```json
{
  "name": "beads",
  "description": "Beads task tracking MCP server",
  "command": "python",
  "args": ["-m", "beads_mcp"],
  "transport": "stdio",
  "env": {
    "BEADS_DIR": ".beads",
    "BEADS_ISSUES_FILE": ".beads/issues.jsonl"
  },
  "capabilities": [
    "tasks/list",
    "tasks/get",
    "tasks/search"
  ],
  "enabled": true
}
```

### Usage

```bash
# List all open tasks
augx mcp exec beads tasks/list --args '{"status":"open"}'

# Get specific task
augx mcp exec beads tasks/get --args '{"id":"bd-abc123"}'

# Search tasks
augx mcp exec beads tasks/search --args '{"query":"MCP integration"}'
```

## Example 2: GitHub MCP Server

Integrate with GitHub repositories using the official GitHub MCP server.

### Installation

```bash
npm install -g @modelcontextprotocol/server-github
```

### Configuration

```bash
# Add GitHub MCP server
augx mcp add github "npx -y @modelcontextprotocol/server-github" \
  --transport stdio \
  --env '{"GITHUB_TOKEN":"your-token-here"}'
```

### Usage

```bash
# Discover available tools
augx mcp discover github

# Create an issue
augx mcp exec github create_issue --args '{
  "owner": "myorg",
  "repo": "myrepo",
  "title": "Bug report",
  "body": "Description of the bug"
}'

# List pull requests
augx mcp exec github list_pull_requests --args '{
  "owner": "myorg",
  "repo": "myrepo",
  "state": "open"
}'
```

## Example 3: Custom MCP Server

Create and integrate a custom MCP server.

### Server Implementation (Python)

```python
#!/usr/bin/env python3
import json
import sys

def handle_request(request):
    method = request.get('method')
    params = request.get('params', {})
    
    if method == 'tools/list':
        return {
            'tools': [
                {
                    'name': 'greet',
                    'description': 'Greet a user',
                    'inputSchema': {
                        'type': 'object',
                        'properties': {
                            'name': {'type': 'string'}
                        }
                    }
                }
            ]
        }
    elif method == 'tools/greet':
        name = params.get('name', 'World')
        return {'message': f'Hello, {name}!'}
    
    return {'error': 'Unknown method'}

if __name__ == '__main__':
    for line in sys.stdin:
        request = json.loads(line)
        result = handle_request(request)
        response = {
            'jsonrpc': '2.0',
            'id': request.get('id'),
            'result': result
        }
        print(json.dumps(response))
        sys.stdout.flush()
```

### Configuration

```bash
# Add custom server
augx mcp add my-server "python /path/to/server.py" --transport stdio

# Discover tools
augx mcp discover my-server

# Execute tool
augx mcp exec my-server greet --args '{"name":"Alice"}'
```

## Example 4: Generating CLI with MCPorter

Use MCPorter to generate a standalone CLI from an MCP server.

### Prerequisites

```bash
npm install -g mcporter
```

### Generate CLI

```bash
# Generate CLI for GitHub MCP server
augx mcp generate-cli "npx -y @modelcontextprotocol/server-github" dist/github-cli.js

# The generated CLI can be used standalone
node dist/github-cli.js create_issue --owner myorg --repo myrepo --title "Issue"
```

## Example 5: Skill Wrapper Generation

Wrap MCP tools as skills for AI context injection.

### Generate Skill

```bash
# Generate skill wrapper for Beads task listing
augx mcp wrap beads tasks/list beads-task-list --category integration
```

### Generated Skill (skills/integration/beads-task-list.md)

```markdown
---
id: beads-task-list
name: tasks/list (MCP)
version: 1.0.0
category: integration
tags: [mcp, beads, tasks/list]
tokenBudget: 1500
priority: medium
cliCommand: augx mcp exec beads tasks/list
---

# tasks/list (MCP Tool)

## Purpose

This skill wraps the `tasks/list` tool from the `beads` MCP server.

## Usage

Execute via MCP:
\`\`\`bash
augx mcp exec beads tasks/list --args '{"status":"open"}'
\`\`\`

Or inject into AI context:
\`\`\`bash
augx skill inject beads-task-list
\`\`\`
```

## See Also

- [MCP README](.augment/mcp/README.md)
- [Skills Documentation](../../skills/README.md)
- [MCPorter Documentation](https://github.com/steipete/mcporter)

