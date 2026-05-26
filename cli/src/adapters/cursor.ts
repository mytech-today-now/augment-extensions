/**
 * Cursor adapter.
 *
 * Aggregator output: `.cursor/rules/augx.mdc` at the project root.
 * Mirror destination: `.cursor/rules/augx-<module>.mdc` (one file per
 * module).
 *
 * Cursor `.mdc` files require YAML frontmatter; the banner is emitted as
 * HTML comments immediately after the closing `---` of the frontmatter.
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
  LF,
  renderBanner,
  renderModuleBody,
  renderStandardFooter,
  normalizeBody,
} from './banner';

/**
 * Canonical Cursor `.mdc` frontmatter for the aggregator output. The block
 * uses `---` delimiters and Cursor's `alwaysApply` flag to ensure the rules
 * load on every editor session.
 */
const CURSOR_FRONTMATTER =
  '---' + LF +
  "description: Augx aggregated rules" + LF +
  'alwaysApply: true' + LF +
  '---' + LF;

/**
 * Convert a canonical module id to a single path segment safe for filesystem
 * use within `.cursor/rules/augx-<segment>.mdc`.
 */
function moduleIdToSegment(moduleId: string): string {
  return moduleId.replace(/\//g, '-');
}

export const cursorAdapter: ToolAdapter = {
  id: 'cursor',

  exportPaths(projectRoot: string): ExportPaths {
    return {
      single: path.join(projectRoot, '.cursor', 'rules', 'augx.mdc'),
    };
  },

  mirrorPath(projectRoot: string, moduleId: string): string {
    const fileName = `augx-${moduleIdToSegment(moduleId)}.mdc`;
    return path.join(projectRoot, '.cursor', 'rules', fileName);
  },

  renderModule(module: ResolvedModule): string {
    return renderModuleBody(module);
  },

  /**
   * Cursor-specific header: YAML frontmatter precedes the standard banner.
   * MCP snippet (when present) follows the banner, separated by a blank
   * line, matching the layout used by the other adapters.
   */
  renderHeader(meta: ExportMeta): string {
    const banner = renderBanner(meta);
    const head = CURSOR_FRONTMATTER + banner;
    if (!meta.mcpSnippet) {
      return head;
    }
    return head + LF + normalizeBody(meta.mcpSnippet);
  },

  renderFooter(_meta: ExportMeta): string {
    return renderStandardFooter();
  },
};
