/**
 * MCP wiring detection for the cross-platform export pipeline.
 *
 * Determines whether a Beads MCP server is declared in this project. The
 * runner inlines the MCP wiring snippet into exported files only when
 * detection returns `true`. Detection itself never makes a network call
 * or spawns a process; it only inspects the two well-known config files.
 *
 * See: openspec/specs/cross-platform/mcp-template.md
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Paths checked, in the order specified by the spec.
 */
const MCP_CONFIG_PATHS: readonly string[] = [
  path.join('.vscode', 'mcp.json'),
  path.join('.augment', 'mcp', 'servers.json'),
];

/** Canonical server id recognized by the Beads MCP wiring detector. */
export const BEADS_MCP_ID = 'beads';

/**
 * Return `true` when either `.vscode/mcp.json` or `.augment/mcp/servers.json`
 * declares an MCP server whose id (or name/key) is `beads`. The check is
 * tolerant of the two common shapes:
 *   { "servers": { "beads": {...} } }
 *   { "mcpServers": { "beads": {...} } }
 *   { "servers": [ { "id": "beads", ... }, ... ] }
 */
export function hasBeadsMcpServer(projectRoot: string): boolean {
  for (const rel of MCP_CONFIG_PATHS) {
    if (configDeclaresBeads(path.join(projectRoot, rel))) {
      return true;
    }
  }
  return false;
}

function configDeclaresBeads(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }
  let parsed: unknown;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
    parsed = JSON.parse(raw);
  } catch {
    return false;
  }
  return objectDeclaresBeads(parsed);
}

function objectDeclaresBeads(value: unknown): boolean {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  for (const containerKey of ['servers', 'mcpServers']) {
    const container = record[containerKey];
    if (container && typeof container === 'object') {
      if (Array.isArray(container)) {
        for (const entry of container) {
          if (entry && typeof entry === 'object') {
            const idLike =
              (entry as Record<string, unknown>).id ??
              (entry as Record<string, unknown>).name;
            if (idLike === BEADS_MCP_ID) {
              return true;
            }
          }
        }
      } else {
        if (Object.prototype.hasOwnProperty.call(container, BEADS_MCP_ID)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Canonical Beads MCP snippet body. Mirrors the content required by
 * `openspec/specs/cross-platform/mcp-template.md`. Used as the fallback
 * when the canonical template file is not yet present on disk (Phase 4
 * delivers the on-disk template; the runner ships with this string so
 * exports work end-to-end ahead of Phase 4).
 */
export const BEADS_MCP_SNIPPET_FALLBACK = [
  '### Live Task Context via Beads MCP',
  '',
  'This project exposes its task tracker through the **Beads MCP server**.',
  'For any task-related context (open tasks, dependencies, status, blocked items),',
  'query the MCP server directly rather than relying on static rules.',
  '',
  '**Server id**: `beads`',
  '',
  '**Common operations**:',
  '',
  '- `tasks/list` - enumerate open tasks',
  '- `tasks/get` - fetch a specific task by id',
  '- `dependencies/list` - blockers / blocked-by graph',
  '- `status/get` - current status of a task',
  '',
  '**Reference**: `augment-extensions/workflows/beads/` for full command guide.',
  '',
  'Do NOT assume task state from prose in this file - this file contains no',
  'live task data by design.',
].join('\n');

/**
 * Canonical on-disk location of the MCP template (Phase 4 deliverable).
 */
export const BEADS_MCP_TEMPLATE_PATH = path.join(
  'augment-extensions',
  'workflows',
  'mcp',
  'templates',
  'beads.md'
);

/**
 * Load the MCP snippet body. Prefers the on-disk template; falls back to
 * the embedded canonical string. Returns `undefined` only when the caller
 * has already determined that no Beads MCP server is declared.
 */
export function loadBeadsMcpSnippet(projectRoot: string): string {
  const onDisk = path.join(projectRoot, BEADS_MCP_TEMPLATE_PATH);
  if (fs.existsSync(onDisk)) {
    try {
      return fs.readFileSync(onDisk, 'utf-8').replace(/\r\n?/g, '\n').trimEnd();
    } catch {
      return BEADS_MCP_SNIPPET_FALLBACK;
    }
  }
  return BEADS_MCP_SNIPPET_FALLBACK;
}
