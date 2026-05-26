/**
 * Adapter registry.
 *
 * Maps a `MirrorTool` id to its concrete `ToolAdapter` and exposes helpers
 * for resolving `--target` values, including the special `all` keyword.
 */

import type { MirrorTool } from '../types/coordination-export';
import { MIRROR_TOOLS, isMirrorTool } from '../types/coordination-export';
import type { ToolAdapter } from './types';
import { claudeCodeAdapter } from './claude-code';
import { cursorAdapter } from './cursor';
import { windsurfAdapter } from './windsurf';
import { copilotAdapter } from './copilot';

/** All adapters indexed by `MirrorTool` id. */
export const ADAPTERS: Readonly<Record<MirrorTool, ToolAdapter>> = Object.freeze({
  'claude-code': claudeCodeAdapter,
  cursor: cursorAdapter,
  windsurf: windsurfAdapter,
  copilot: copilotAdapter,
});

/** Ordered list of every adapter, alphabetical by id for deterministic loops. */
export function allAdapters(): ToolAdapter[] {
  return [...MIRROR_TOOLS].sort().map((id) => ADAPTERS[id]);
}

/**
 * Resolve a user-supplied `--target` value into the concrete adapter list.
 * Accepts a single tool id, a comma-separated list, or the keyword `all`.
 *
 * @throws if any token is not a valid tool id (caller maps this to exit 1).
 */
export function resolveTargets(rawTarget: string): ToolAdapter[] {
  const trimmed = rawTarget.trim();
  if (trimmed.length === 0) {
    throw new Error('Empty --target value.');
  }
  if (trimmed === 'all') {
    return allAdapters();
  }
  const tokens = trimmed
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  const adapters: ToolAdapter[] = [];
  for (const token of tokens) {
    if (!isMirrorTool(token)) {
      throw new Error(
        `Unknown --target value: ${token}. Valid: ${MIRROR_TOOLS.join(', ')}, all.`
      );
    }
    adapters.push(ADAPTERS[token]);
  }
  return adapters;
}

export { claudeCodeAdapter, cursorAdapter, windsurfAdapter, copilotAdapter };
