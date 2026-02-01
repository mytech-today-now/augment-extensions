# MCP Server Configuration

This directory contains configuration for Model Context Protocol (MCP) server integrations.

## Configuration File

**File**: `servers.json`

**Format**:
```json
{
  "servers": [
    {
      "name": "server-name",
      "command": "command-to-run",
      "args": ["arg1", "arg2"],
      "transport": "stdio",
      "env": {
        "ENV_VAR": "value"
      }
    }
  ]
}
```

## CLI Commands

### List Servers
```bash
augx mcp list
augx mcp list --json
```

### Add Server
```bash
# Stdio transport
augx mcp add my-server "npx -y my-mcp-server@latest" --transport stdio

# HTTP transport
augx mcp add my-server "node server.js" --transport http --url http://localhost:3000/mcp

# With environment variables
augx mcp add my-server "npx server" --env '{"API_KEY":"xyz"}'
```

### Remove Server
```bash
augx mcp remove my-server
```

### Execute Tool
```bash
augx mcp exec my-server tool-name --args '{"param":"value"}'
augx mcp exec my-server tool-name --args '{"param":"value"}' --json
```

### Generate Skill Wrapper
```bash
augx mcp wrap my-server tool-name skill-id --category integration
```

### Discover Tools
```bash
augx mcp discover my-server
augx mcp discover my-server --json
```

### Generate CLI with mcporter
```bash
augx mcp generate-cli "npx -y my-mcp-server@latest" dist/my-cli.js
```

## Example Configuration

See `servers.json.example` for example configurations.

## MCP Porter Integration

This integration is inspired by [mcporter](https://github.com/steipete/mcporter), a TypeScript runtime and CLI toolkit for Model Context Protocol.

### Features

- **CLI Wrapping**: Wrap MCP servers as CLI commands
- **Skill Generation**: Auto-generate skill files for MCP tools
- **Type Safety**: TypeScript-based integration
- **Multiple Transports**: Support for stdio and HTTP transports
- **Environment Variables**: Configure server environment

### Workflow

1. **Add MCP Server**: Configure server connection
2. **Discover Tools**: List available tools from server
3. **Generate Skill**: Create skill wrapper for tool
4. **Execute**: Run tool via CLI or inject into AI context

## Notes

- Only stdio transport is fully implemented
- HTTP transport support is planned
- Tool discovery requires MCP protocol negotiation (not yet fully implemented)
- mcporter CLI generation requires mcporter to be installed globally

