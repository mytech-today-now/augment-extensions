/**
 * Command Help Extraction Utility
 * 
 * Automatically extracts and formats command-line help documentation from workflow tools.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Tool configuration
 */
export interface Tool {
  name: string;        // Display name (e.g., "Beads")
  command: string;     // CLI command (e.g., "bd")
  directory: string;   // Detection directory (e.g., ".beads")
  helpFlag?: string;   // Help flag (default: "--help")
}

/**
 * Help extraction result
 */
export interface HelpNode {
  command: string;
  help: string;
  children: HelpNode[];
}

/**
 * Default tools to extract help from
 */
const DEFAULT_TOOLS: Tool[] = [
  { name: 'Beads', command: 'bd', directory: '.beads' },
  { name: 'OpenSpec', command: 'openspec', directory: 'openspec' },
  { name: 'Augx', command: 'augx', directory: '.augment' }
];

/**
 * Subcommand detection patterns
 */
const SUBCOMMAND_PATTERNS = [
  /Commands?:\s*\n((?:\s+\w+.*\n)+)/,           // "Commands:" section
  /Available commands?:\s*\n((?:\s+\w+.*\n)+)/, // "Available commands:" section
  /Usage:.*\{(\w+(?:\|\w+)*)\}/,                // Usage: cmd {subcmd1|subcmd2}
];

/**
 * Detect available tools in the repository
 */
export function detectTools(repoRoot: string, tools: Tool[] = DEFAULT_TOOLS): Tool[] {
  const availableTools: Tool[] = [];
  
  for (const tool of tools) {
    const toolPath = path.join(repoRoot, tool.directory);
    if (fs.existsSync(toolPath)) {
      availableTools.push(tool);
    }
  }
  
  return availableTools;
}

/**
 * Execute help command and capture output
 */
export async function executeHelp(
  command: string,
  helpFlag: string = '--help',
  timeout: number = 5000
): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(`${command} ${helpFlag}`, {
      timeout,
      encoding: 'utf8'
    });
    
    return stdout || stderr || '';
  } catch (error: any) {
    // Some commands return help on stderr or with non-zero exit code
    if (error.stdout || error.stderr) {
      return error.stdout || error.stderr;
    }
    throw error;
  }
}

/**
 * Detect subcommands from help text
 */
export function detectSubcommands(helpText: string): string[] {
  const subcommands: Set<string> = new Set();
  
  // Try each pattern
  for (const pattern of SUBCOMMAND_PATTERNS) {
    const match = helpText.match(pattern);
    if (match) {
      const commands = extractCommandNames(match[1]);
      commands.forEach(cmd => subcommands.add(cmd));
    }
  }
  
  return Array.from(subcommands).sort();
}

/**
 * Extract command names from matched text
 */
function extractCommandNames(text: string): string[] {
  const lines = text.split('\n');
  const commands: string[] = [];
  
  for (const line of lines) {
    const match = line.match(/^\s+(\w+)/);
    if (match) {
      commands.push(match[1]);
    }
  }
  
  return commands;
}

/**
 * Recursively extract help for command and subcommands
 */
export async function extractHelpRecursive(
  command: string,
  subcommand: string[] = [],
  depth: number = 0,
  maxDepth: number = 3,
  helpFlag: string = '--help'
): Promise<HelpNode> {
  // Prevent infinite recursion
  if (depth >= maxDepth) {
    return { command, help: '', children: [] };
  }
  
  // Build full command
  const fullCommand = [command, ...subcommand].join(' ');
  
  try {
    // Extract help for this command
    const help = await executeHelp(fullCommand, helpFlag);
    
    // Detect subcommands
    const subcommands = detectSubcommands(help);
    
    // Recursively extract help for each subcommand (in parallel)
    const children = await Promise.all(
      subcommands.map(sub =>
        extractHelpRecursive(command, [...subcommand, sub], depth + 1, maxDepth, helpFlag)
      )
    );
    
    return {
      command: fullCommand,
      help,
      children
    };
  } catch (error: any) {
    console.warn(`⚠️  Failed to extract help for "${fullCommand}": ${error.message}`);
    return { command: fullCommand, help: '', children: [] };
  }
}

/**
 * Extract help for all detected tools
 */
export async function extractAllHelp(repoRoot: string): Promise<Map<Tool, HelpNode>> {
  const tools = detectTools(repoRoot);
  const helpMap = new Map<Tool, HelpNode>();

  for (const tool of tools) {
    try {
      console.log(`📖 Extracting help for ${tool.name}...`);
      const helpNode = await extractHelpRecursive(tool.command, [], 0, 3, tool.helpFlag);
      helpMap.set(tool, helpNode);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠️  ${tool.name} command not found - skipping`);
      } else if (error.code === 'ETIMEDOUT') {
        console.error(`❌ ${tool.name} help extraction timed out`);
      } else {
        console.error(`❌ Failed to extract ${tool.name} help: ${error.message}`);
      }
    }
  }

  return helpMap;
}

/**
 * Generate Markdown output from help nodes
 */
export function generateMarkdown(helpMap: Map<Tool, HelpNode>): string {
  const timestamp = new Date().toISOString();
  const toolNames = Array.from(helpMap.keys()).map(t => t.name).sort().join(', ');

  let markdown = `# Command Help Reference\n\n`;
  markdown += `Auto-generated command-line help for Augment workflow tools.\n\n`;
  markdown += `**Generated**: ${timestamp}\n`;
  markdown += `**Tools**: ${toolNames}\n`;
  markdown += `**Version**: 1.0.0\n\n`;
  markdown += `---\n\n`;

  // Sort tools alphabetically
  const sortedTools = Array.from(helpMap.entries()).sort((a, b) =>
    a[0].name.localeCompare(b[0].name)
  );

  for (const [tool, helpNode] of sortedTools) {
    markdown += `## ${tool.name} Commands (${tool.command})\n\n`;
    markdown += formatHelpNode(helpNode);
    markdown += `---\n\n`;
  }

  return markdown;
}

/**
 * Format a help node and its children as Markdown
 */
function formatHelpNode(node: HelpNode, level: number = 3): string {
  let markdown = '';

  if (node.help) {
    const heading = '#'.repeat(level);
    markdown += `${heading} ${node.command} --help\n\n`;
    markdown += '```\n';
    markdown += node.help;
    markdown += '\n```\n\n';
  }

  // Format children
  for (const child of node.children) {
    markdown += formatHelpNode(child, level + 1);
  }

  return markdown;
}

/**
 * Main extraction function
 */
export async function extractCommandHelp(repoRoot: string, outputPath?: string): Promise<string> {
  console.log('🚀 Starting command help extraction...\n');

  // Extract help from all tools
  const helpMap = await extractAllHelp(repoRoot);

  if (helpMap.size === 0) {
    console.warn('⚠️  No tools detected. Skipping help extraction.');
    return '';
  }

  // Generate Markdown
  console.log('\n📝 Generating Markdown output...');
  const markdown = generateMarkdown(helpMap);

  // Write to file if output path provided
  if (outputPath) {
    const fullPath = path.join(repoRoot, outputPath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, markdown, 'utf8');
    console.log(`✅ Command help reference generated: ${outputPath}`);
  }

  return markdown;
}

