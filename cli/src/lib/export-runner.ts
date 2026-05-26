/**
 * Export runner: aggregator + drift detection + writer for `augx export`.
 *
 * This module orchestrates the impure parts of the pipeline. Adapters and
 * `source-hash` remain pure; this file owns all filesystem I/O, timestamp
 * generation, and exit-code semantics.
 *
 * See: openspec/specs/cross-platform/export-command.md
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ToolAdapter, ExportMeta, ResolvedModule } from '../adapters/types';
import {
  LF,
  SECTION_SEPARATOR,
  renderModuleHeading,
} from '../adapters/banner';
import {
  computeSourceHash,
  extractEmbeddedHash,
  SOURCE_HASH_HEX_LENGTH,
} from './source-hash';
import { computeContentDigest } from './module-resolver';
import { DEFAULT_EXPORT_IGNORE } from '../types/coordination-export';

/** Exit-code constants matching the export-command spec. */
export const EXIT = {
  OK: 0,
  USAGE: 1,
  RESOLUTION: 2,
  DRIFT: 3,
  IO: 4,
} as const;

/**
 * Per-target write outcome reported by the runner to the CLI command.
 * Used both for human-readable logging and for the dry-run summary line.
 */
export interface WriteOutcome {
  tool: ToolAdapter['id'];
  targetPath: string;
  bytes: number;
  moduleCount: number;
  status: 'written' | 'noop' | 'dry-run' | 'drift-refused';
  detail?: string;
}

/**
 * Inputs used to assemble a single target's content. Caller resolves
 * modules once and reuses across targets; the runner derives target-
 * specific meta from this base shape.
 */
export interface AggregateInputs {
  modules: ResolvedModule[];
  ignorePatterns: string[];
  augxVersion: string;
  mcpSnippet?: string;
  now: () => string;
}

/**
 * Build the `ExportMeta` shared by every target in a single export run.
 * The source-hash is identical across targets because adapter output is
 * not part of the hash inputs.
 */
export function buildExportMeta(inputs: AggregateInputs): ExportMeta {
  const moduleEntries = inputs.modules
    .map((m) => ({
      id: m.id,
      version: m.version,
      contentDigest: computeContentDigest(m.rulesFiles),
    }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const sourceHash = computeSourceHash({
    modules: moduleEntries,
    ignorePatterns: [...inputs.ignorePatterns],
  });

  return {
    augxVersion: inputs.augxVersion,
    generatedAt: inputs.now(),
    sourceHash,
    modules: moduleEntries.map((m) => ({ id: m.id, version: m.version })),
    mcpSnippet: inputs.mcpSnippet,
  };
}

/**
 * Render the complete file body for a given adapter using the provided
 * meta. Pure: depends only on its arguments.
 */
export function aggregate(
  adapter: ToolAdapter,
  meta: ExportMeta,
  modules: ResolvedModule[]
): string {
  let out = adapter.renderHeader(meta);
  out += LF + SECTION_SEPARATOR;
  for (const module of modules) {
    out +=
      LF +
      renderModuleHeading(module) +
      LF +
      adapter.renderModule(module) +
      LF +
      SECTION_SEPARATOR;
  }
  out += LF + adapter.renderFooter(meta);
  return out;
}

/**
 * Replace the value of the `generated-at` banner comment in `content`
 * with `replacement`. If no banner is present, returns `content` unchanged.
 */
export function substituteGeneratedAt(
  content: string,
  replacement: string
): string {
  return content.replace(
    /(<!--\s*generated-at:\s*)([^>]+?)(\s*-->)/i,
    (_full, head: string, _ts: string, tail: string) => `${head}${replacement}${tail}`
  );
}

/**
 * Drift assessment for a single target file.
 *
 * - `equivalent`: existing matches the freshly rendered content modulo
 *   the timestamp; no write needed.
 * - `regenerate`: source hash changed; safe to overwrite.
 * - `drift`: the existing file's embedded hash matches the new hash but
 *   the body differs, OR the existing file has no recognizable banner.
 *   Refuse unless `--force`.
 */
export type DriftStatus = 'equivalent' | 'regenerate' | 'drift';

export interface DriftAssessment {
  status: DriftStatus;
  newContent: string;
  reason?: string;
}

export function assessDrift(
  existing: string | null,
  freshContent: string,
  newSourceHash: string
): DriftAssessment {
  if (existing === null) {
    return { status: 'regenerate', newContent: freshContent };
  }
  const embeddedHash = extractEmbeddedHash(existing);
  if (!embeddedHash) {
    return {
      status: 'drift',
      newContent: freshContent,
      reason: 'existing file has no augx source-hash banner',
    };
  }
  const truncatedNew = newSourceHash
    .slice(0, SOURCE_HASH_HEX_LENGTH)
    .toLowerCase();
  if (embeddedHash !== truncatedNew) {
    return { status: 'regenerate', newContent: freshContent };
  }
  // Hash matches; only difference allowed is the generated-at timestamp.
  const existingTimestamp = existing.match(
    /<!--\s*generated-at:\s*([^>]+?)\s*-->/i
  )?.[1];
  const reconstructed = existingTimestamp
    ? substituteGeneratedAt(freshContent, existingTimestamp)
    : freshContent;
  if (reconstructed === existing) {
    return { status: 'equivalent', newContent: reconstructed };
  }
  return {
    status: 'drift',
    newContent: freshContent,
    reason: 'existing file body differs from regenerated content',
  };
}
