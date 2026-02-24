# MCP Integration

This directory contains configuration for Model Context Protocol (MCP) server integrations.

## What is MCP?

Model Context Protocol (MCP) is a protocol for AI agents to interact with external tools and services. This integration allows wrapping MCP servers as CLI commands and skills, enabling seamless integration with external tools.

## Configuration

MCP servers are configured in `servers.json`:

```json
{
  "version": "1.0",
  "servers": [
    {
      "name": "server-name",
      "description": "Server description",
      "command": "command-to-run",
      "args": ["arg1", "arg2"],
      "transport": "stdio",
      "env": {
        "ENV_VAR": "value"
      },
      "capabilities": ["tool1", "tool2"],
      "enabled": true,
      "autoStart": false
    }
  ],
  "settings": {
    "enableCache": true,
    "cacheRefreshInterval": 5000,
    "logLevel": "info",
    "timeout": 30000
  }
}
```

## CLI Commands

### List MCP Servers

```bash
augx mcp list
augx mcp list --json
```

### Add MCP Server

```bash
augx mcp add <name> <command> [options]

# Options:
#   --args <args>         Command arguments (space-separated)
#   --transport <type>    Transport type (stdio or http)
#   --url <url>          Server URL (for HTTP transport)
#   --env <json>         Environment variables (JSON)

# Example:
augx mcp add my-server "npx -y my-mcp-server@latest" --transport stdio
```

### Remove MCP Server

```bash
augx mcp remove <name>
```

### Execute MCP Tool

```bash
augx mcp exec <serverName> <toolName> [options]

# Options:
#   --args <json>    Tool arguments (JSON)
#   --json          Output as JSON

# Example:
augx mcp exec beads tasks/list --args '{"status":"open"}'
```

### Discover Tools

```bash
augx mcp discover <serverName>
augx mcp discover <serverName> --json
```

### Generate Skill Wrapper

```bash
augx mcp wrap <serverName> <toolName> <skillId> [options]

# Options:
#   --category <category>    Skill category (default: integration)

# Example:
augx mcp wrap beads tasks/list beads-task-list --category integration
```

### Generate CLI with MCPorter

```bash
augx mcp generate-cli <serverCommand> <outputPath>

# Example:
augx mcp generate-cli "npx -y my-server@latest" dist/cli.js
```

## MCP Workflow

1. **Add MCP Server**: Configure server connection
2. **Discover Tools**: List available tools from server
3. **Generate Skill**: Create skill wrapper for tool
4. **Execute**: Run tool via CLI or inject into AI context

## Transport Types

### stdio (Standard Input/Output)

Most common transport for local MCP servers. The server communicates via stdin/stdout using JSON-RPC.

```json
{
  "transport": "stdio",
  "command": "python",
  "args": ["-m", "my_mcp_server"]
}
```

### http (HTTP/HTTPS)

For remote MCP servers accessible via HTTP.

```json
{
  "transport": "http",
  "url": "https://mcp.example.com/api"
}
```

## Environment Variables

MCP servers can use environment variables for configuration:

```json
{
  "env": {
    "API_KEY": "your-api-key",
    "DEBUG": "true",
    "CUSTOM_CONFIG": "/path/to/config"
  }
}
```

## Integration with Skills

MCP tools can be wrapped as skills for AI context injection:

```bash
# Generate skill wrapper
augx mcp wrap beads tasks/list beads-task-list

# Inject skill into context
augx skill inject beads-task-list
```

## Inspiration

This integration is inspired by [mcporter](https://github.com/steipete/mcporter), a TypeScript runtime and CLI toolkit for Model Context Protocol.

## See Also

- [Main README](../../README.md#-mcp-integration-beta)
- [Skills Documentation](../../skills/README.md)
- [MCP Specification](https://modelcontextprotocol.io/)

