/**
 * MCP Integration Utilities
 * 
 * Provides integration with Model Context Protocol (MCP) servers
 * using mcporter-inspired patterns for CLI wrapping.
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

export interface MCPServerConfig {
  name: string;
  command: string;
  args?: string[];
  transport: 'stdio' | 'http';
  url?: string;
  env?: Record<string, string>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
}

export interface MCPServerInfo {
  config: MCPServerConfig;
  tools: MCPTool[];
  connected: boolean;
}

/**
 * Get MCP configuration directory
 */
export function getMCPConfigDir(repoRoot?: string): string {
  const root = repoRoot || process.cwd();
  return path.join(root, '.augment', 'mcp');
}

/**
 * Load MCP server configurations
 */
export function loadMCPConfigs(repoRoot?: string): MCPServerConfig[] {
  const configDir = getMCPConfigDir(repoRoot);
  const configFile = path.join(configDir, 'servers.json');

  if (!fs.existsSync(configFile)) {
    return [];
  }

  try {
    const content = fs.readFileSync(configFile, 'utf-8');
    const config = JSON.parse(content);
    return config.servers || [];
  } catch (error) {
    console.warn(`Failed to load MCP configs: ${error}`);
    return [];
  }
}

/**
 * Save MCP server configurations
 */
export function saveMCPConfigs(configs: MCPServerConfig[], repoRoot?: string): void {
  const configDir = getMCPConfigDir(repoRoot);
  const configFile = path.join(configDir, 'servers.json');

  // Ensure directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(
    configFile,
    JSON.stringify({ servers: configs }, null, 2),
    'utf-8'
  );
}

/**
 * Add MCP server configuration
 */
export function addMCPServer(config: MCPServerConfig, repoRoot?: string): void {
  const configs = loadMCPConfigs(repoRoot);
  
  // Check if server already exists
  const existing = configs.findIndex(c => c.name === config.name);
  if (existing >= 0) {
    configs[existing] = config;
  } else {
    configs.push(config);
  }

  saveMCPConfigs(configs, repoRoot);
}

/**
 * Remove MCP server configuration
 */
export function removeMCPServer(name: string, repoRoot?: string): boolean {
  const configs = loadMCPConfigs(repoRoot);
  const filtered = configs.filter(c => c.name !== name);
  
  if (filtered.length === configs.length) {
    return false; // Server not found
  }

  saveMCPConfigs(filtered, repoRoot);
  return true;
}

/**
 * Execute MCP server command (stdio transport)
 */
export function executeMCPCommand(
  serverName: string,
  toolName: string,
  args: any,
  repoRoot?: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const configs = loadMCPConfigs(repoRoot);
    const config = configs.find(c => c.name === serverName);

    if (!config) {
      reject(new Error(`MCP server not found: ${serverName}`));
      return;
    }

    if (config.transport !== 'stdio') {
      reject(new Error(`Only stdio transport is currently supported`));
      return;
    }

    // Spawn the MCP server process
    const child = spawn(config.command, config.args || [], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...config.env }
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to spawn MCP server: ${error.message}`));
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`MCP server exited with code ${code}\nStderr: ${stderr}`));
        return;
      }

      try {
        // Parse JSON-RPC response
        const response = JSON.parse(stdout);
        resolve(response);
      } catch (error) {
        reject(new Error(`Failed to parse MCP response: ${error}\nStdout: ${stdout}`));
      }
    });

    // Send JSON-RPC request
    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: `tools/${toolName}`,
      params: args
    };

    child.stdin?.write(JSON.stringify(request) + '\n');
    child.stdin?.end();
  });
}

/**
 * Generate CLI wrapper for MCP server
 *
 * This creates a skill file that wraps an MCP server tool as a CLI command.
 */
export function generateMCPSkillWrapper(
  serverName: string,
  toolName: string,
  skillId: string,
  category: string,
  repoRoot?: string
): string {
  const configs = loadMCPConfigs(repoRoot);
  const config = configs.find(c => c.name === serverName);

  if (!config) {
    throw new Error(`MCP server not found: ${serverName}`);
  }

  // Generate skill file content
  const skillContent = `---
id: ${skillId}
name: ${toolName} (MCP)
version: 1.0.0
category: ${category}
tags: [mcp, ${serverName}, ${toolName}]
tokenBudget: 1500
priority: medium
dependencies: []
cliCommand: augx mcp exec ${serverName} ${toolName}
mcpServer: ${serverName}
autoLoad: false
---

# ${toolName} (MCP Tool)

## Purpose

This skill wraps the \`${toolName}\` tool from the \`${serverName}\` MCP server.

## Usage

Execute this skill using the MCP integration:

\`\`\`bash
augx mcp exec ${serverName} ${toolName} --args '{"key": "value"}'
\`\`\`

Or inject into context:

\`\`\`bash
augx skill inject ${skillId}
\`\`\`

## MCP Server Configuration

- **Server**: ${serverName}
- **Transport**: ${config.transport}
- **Command**: ${config.command}

## Notes

This is an auto-generated skill wrapper for an MCP server tool.
The actual tool execution is handled by the MCP integration layer.
`;

  return skillContent;
}

/**
 * Discover available MCP tools from a server
 *
 * Note: This is a simplified version. Full implementation would require
 * proper MCP protocol negotiation and tool discovery.
 */
export async function discoverMCPTools(serverName: string, repoRoot?: string): Promise<MCPTool[]> {
  // Placeholder implementation
  // In a full implementation, this would:
  // 1. Connect to the MCP server
  // 2. Send a tools/list request
  // 3. Parse the response
  // 4. Return the list of available tools

  console.warn('MCP tool discovery not yet fully implemented');
  return [];
}

/**
 * Check if mcporter is available
 */
export function isMCPorterAvailable(): boolean {
  try {
    const { execSync } = require('child_process');
    execSync('npx mcporter --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate CLI using mcporter (if available)
 */
export async function generateCLIWithMCPorter(
  serverCommand: string,
  outputPath: string
): Promise<void> {
  const { spawn } = require('child_process');

  return new Promise((resolve, reject) => {
    const child = spawn('npx', [
      'mcporter',
      'generate-cli',
      '--command',
      serverCommand,
      '--bundle',
      outputPath
    ], {
      stdio: 'inherit'
    });

    child.on('error', (error: Error) => {
      reject(new Error(`Failed to run mcporter: ${error.message}`));
    });

    child.on('exit', (code: number) => {
      if (code !== 0) {
        reject(new Error(`mcporter exited with code ${code}`));
        return;
      }
      resolve();
    });
  });
}

