/**
 * Claude Code adapter.
 *
 * Aggregator output: `CLAUDE.md` at the project root.
 * Mirror destination: `.claude/rules/<module>/` (directory; the runner
 * preserves the module's source directory layout file-for-file).
 *
 * See: openspec/specs/cross-platform/export-command.md
 * See: openspec/specs/cross-platform/mirror-hook.md
 */

import * as path from 'path';
import type {
  ExportMeta,
  ExportPaths,
  ResolvedModule,
  ToolAdapter,
} from './types';
import {
  renderHeaderRegion,
  renderModuleBody,
  renderStandardFooter,
} from './banner';

/**
 * Convert a canonical module id to a single path segment safe for filesystem
 * and content use. Slashes become dashes so nested ids like
 * `coding-standards/typescript` collapse to `coding-standards-typescript`.
 */
function moduleIdToSegment(moduleId: string): string {
  return moduleId.replace(/\//g, '-');
}

export const claudeCodeAdapter: ToolAdapter = {
  id: 'claude-code',

  exportPaths(projectRoot: string): ExportPaths {
    return {
      single: path.join(projectRoot, 'CLAUDE.md'),
    };
  },

  mirrorPath(projectRoot: string, moduleId: string): string {
    // Directory destination; the runner walks `module.rulesFiles` to
    // materialize individual files beneath this path.
    return path.join(projectRoot, '.claude', 'rules', moduleIdToSegment(moduleId));
  },

  renderModule(module: ResolvedModule): string {
    return renderModuleBody(module);
  },

  renderHeader(meta: ExportMeta): string {
    return renderHeaderRegion(meta);
  },

  renderFooter(_meta: ExportMeta): string {
    return renderStandardFooter();
  },
};
