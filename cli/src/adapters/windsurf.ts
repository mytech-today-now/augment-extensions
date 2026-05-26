/**
 * Windsurf adapter.
 *
 * Aggregator output: `.windsurfrules` at the project root (single Markdown
 * file, no frontmatter; Windsurf reads the file verbatim).
 * Mirror destination: `.windsurf/rules/augx-<module>.md` (one file per
 * module).
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
 * use within `.windsurf/rules/augx-<segment>.md`.
 */
function moduleIdToSegment(moduleId: string): string {
  return moduleId.replace(/\//g, '-');
}

export const windsurfAdapter: ToolAdapter = {
  id: 'windsurf',

  exportPaths(projectRoot: string): ExportPaths {
    return {
      single: path.join(projectRoot, '.windsurfrules'),
    };
  },

  mirrorPath(projectRoot: string, moduleId: string): string {
    const fileName = `augx-${moduleIdToSegment(moduleId)}.md`;
    return path.join(projectRoot, '.windsurf', 'rules', fileName);
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
