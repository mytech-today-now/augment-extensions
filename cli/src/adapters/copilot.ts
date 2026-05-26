/**
 * GitHub Copilot adapter.
 *
 * Aggregator output: `.github/copilot-instructions.md` at the project root.
 * Mirror destination: `.github/instructions/augx-<module>.instructions.md`
 * (one file per module).
 *
 * Copilot reads `.github/copilot-instructions.md` directly; no frontmatter
 * is required, so the format mirrors Windsurf but with Copilot-specific
 * paths.
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
 * use within `.github/instructions/augx-<segment>.instructions.md`.
 */
function moduleIdToSegment(moduleId: string): string {
  return moduleId.replace(/\//g, '-');
}

export const copilotAdapter: ToolAdapter = {
  id: 'copilot',

  exportPaths(projectRoot: string): ExportPaths {
    return {
      single: path.join(projectRoot, '.github', 'copilot-instructions.md'),
    };
  },

  mirrorPath(projectRoot: string, moduleId: string): string {
    const fileName = `augx-${moduleIdToSegment(moduleId)}.instructions.md`;
    return path.join(projectRoot, '.github', 'instructions', fileName);
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
