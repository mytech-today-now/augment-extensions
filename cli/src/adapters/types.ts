/**
 * ToolAdapter contract for the cross-platform export layer.
 *
 * One adapter per target tool (Claude Code, Cursor, Windsurf, Copilot).
 * Adapters are PURE FUNCTIONS: given resolved modules and metadata, they
 * return strings. All filesystem I/O happens in the runner.
 *
 * See: openspec/changes/cross-platform/design.md (component 2)
 * See: openspec/specs/cross-platform/export-command.md
 */

import type { MirrorTool } from '../types/coordination-export';

/**
 * A loaded rule (or example) file. Adapters are pure functions, so the
 * runner reads file contents from disk and hands them to the adapter as
 * in-memory objects.
 */
export interface ResolvedRuleFile {
  /** Forward-slash path relative to the module's `rootPath`. */
  relativePath: string;
  /** UTF-8 file contents, newline-normalized to LF before being passed in. */
  content: string;
}

/**
 * A module after resolution from `.augment/coordination.json`. Adapters
 * consume this; the resolver produces it.
 */
export interface ResolvedModule {
  /** Canonical module id, e.g. `coding-standards/typescript`. */
  id: string;
  /** Semantic version string from the module's `module.json`. */
  version: string;
  /** Absolute path to the module root on disk. */
  rootPath: string;
  /** Loaded `rules/*.md` files, alphabetically ordered by `relativePath`. */
  rulesFiles: ResolvedRuleFile[];
  /** Loaded files under `examples/`, alphabetically ordered by `relativePath`. */
  examplesFiles: ResolvedRuleFile[];
  /** Absolute path to the module's `README.md`, or undefined if absent. */
  readmePath?: string;
}

/**
 * Module identity tuple embedded in the banner `modules:` comment.
 */
export interface ModuleIdentity {
  id: string;
  version: string;
}

/**
 * Metadata threaded into every header/footer the adapter renders.
 * Produced by the runner; never derived inside the adapter.
 */
export interface ExportMeta {
  /** Augx CLI version (matches `package.json#version`). */
  augxVersion: string;
  /** ISO-8601 timestamp. Pinnable via `AUGX_FAKE_NOW` for tests. */
  generatedAt: string;
  /** 16-hex truncated SHA-256 from `source-hash.ts`. */
  sourceHash: string;
  /** Alphabetically sorted module identities; mirrored in the banner. */
  modules: ModuleIdentity[];
  /** Inlined MCP wiring snippet body, or undefined to omit. */
  mcpSnippet?: string;
}

/**
 * Filesystem destinations a tool writes to.
 *
 * `single` is the aggregator output (single file per project). Adapters that
 * also want a per-module shape can return additional fields under a richer
 * type; this base shape covers all four Phase-1 adapters.
 */
export interface ExportPaths {
  /** Absolute or project-relative path to the aggregator file. */
  single: string;
}

/**
 * The contract every tool adapter implements.
 *
 * INVARIANT: every method is a pure function. No `fs`, no `process.cwd()`,
 * no clock reads, no random. All side effects live in the runner.
 */
export interface ToolAdapter {
  /** Discriminator matching the `--target` flag and `MirrorTool` union. */
  readonly id: MirrorTool;

  /**
   * Default output destinations for `augx export --target <id>`.
   * The runner may override `single` via `--output`.
   */
  exportPaths(projectRoot: string): ExportPaths;

  /**
   * Where a single mirrored module's content lands when `augx link --mirror`
   * materializes per-module copies/symlinks.
   *
   * @param projectRoot Absolute path to the consuming project's root.
   * @param moduleId    Canonical module id, e.g. `coding-standards/typescript`.
   */
  mirrorPath(projectRoot: string, moduleId: string): string;

  /**
   * Render the per-module section content for the aggregated output.
   * MUST NOT include the `## Module:` heading; the runner emits headings
   * to keep ordering deterministic across adapters.
   */
  renderModule(module: ResolvedModule): string;

  /**
   * Render the file header. For formats that require frontmatter (Cursor
   * `.mdc`), this method emits the frontmatter followed by the banner.
   */
  renderHeader(meta: ExportMeta): string;

  /**
   * Render the closing footer (attribution + canonical pointer).
   */
  renderFooter(meta: ExportMeta): string;
}
