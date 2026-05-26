/**
 * Coordination manifest helpers for `mirrors[<moduleId>]` persistence.
 *
 * Reads `.augment/coordination.json`, updates the per-module mirror
 * tracking list, and writes the file back while preserving every other
 * top-level key (specs, tasks, rules, files, export, ...). The writer
 * sorts object keys at each level and uses LF line endings per
 * `coordination-export-block.md`.
 *
 * See: openspec/specs/cross-platform/coordination-export-block.md
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  MirrorEntry,
  MirrorsBlock,
} from '../types/coordination-export';

/** Conventional location of the coordination manifest. */
export const COORDINATION_FILE = path.join('.augment', 'coordination.json');

/**
 * Generic manifest shape exposed by the helpers. The mirror code only
 * inspects the `mirrors` block; every other top-level key is round-tripped
 * verbatim so we never clobber other writers (sync, openspec, beads).
 */
export interface MirrorManifest {
  mirrors?: MirrorsBlock;
  [unknownKey: string]: unknown;
}

/**
 * Read the coordination manifest, returning `null` when the file is absent.
 * Unlike `utils/file-tracking.ts`, this helper does not throw on absence,
 * because `augx link --mirror` may run before the manifest is bootstrapped.
 */
export function readMirrorManifest(
  projectRoot: string
): { manifest: MirrorManifest; existed: boolean } {
  const fp = path.join(projectRoot, COORDINATION_FILE);
  if (!fs.existsSync(fp)) {
    return { manifest: {}, existed: false };
  }
  const raw = fs.readFileSync(fp, 'utf-8').replace(/^\uFEFF/, '');
  if (raw.trim().length === 0) {
    return { manifest: {}, existed: true };
  }
  const parsed = JSON.parse(raw) as MirrorManifest;
  return { manifest: parsed, existed: true };
}

/**
 * Recursively reorder object keys alphabetically so the on-disk manifest
 * has a stable diff regardless of insertion order. Arrays are preserved
 * in-place because semantic ordering belongs to their callers.
 */
function sortKeysDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => sortKeysDeep(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      sorted[key] = sortKeysDeep(record[key]);
    }
    return sorted as unknown as T;
  }
  return value;
}

/**
 * Write the manifest back with 2-space indent, LF line endings, sorted
 * keys, and a trailing newline. Creates `.augment/` when missing so the
 * first `--mirror` invocation in a fresh project bootstraps cleanly.
 */
export function writeMirrorManifest(
  projectRoot: string,
  manifest: MirrorManifest
): void {
  const fp = path.join(projectRoot, COORDINATION_FILE);
  fs.mkdirSync(path.dirname(fp), { recursive: true });
  const sorted = sortKeysDeep(manifest);
  const payload = JSON.stringify(sorted, null, 2).replace(/\r\n?/g, '\n') + '\n';
  fs.writeFileSync(fp, payload, { encoding: 'utf-8' });
}

/**
 * Replace the `mirrors[<moduleId>]` list with `entries`. Removes the key
 * when `entries` is empty, and removes the entire `mirrors` block when no
 * modules remain. Returns the updated manifest for the writer.
 */
export function setMirrorEntries(
  manifest: MirrorManifest,
  moduleId: string,
  entries: readonly MirrorEntry[]
): MirrorManifest {
  const next: MirrorManifest = { ...manifest };
  const mirrors: MirrorsBlock = { ...(next.mirrors ?? {}) };
  if (entries.length === 0) {
    delete mirrors[moduleId];
  } else {
    mirrors[moduleId] = [...entries];
  }
  if (Object.keys(mirrors).length === 0) {
    delete next.mirrors;
  } else {
    next.mirrors = mirrors;
  }
  return next;
}

/**
 * Look up previously-recorded entries for a module and return them keyed
 * by `targetPath`. Used by the mirror runner to honor a recorded `mode`
 * across re-runs (`symlink` once succeeded, `copy` once fell back).
 */
export function recordedEntriesByTarget(
  manifest: MirrorManifest,
  moduleId: string
): Map<string, MirrorEntry> {
  const map = new Map<string, MirrorEntry>();
  const list = manifest.mirrors?.[moduleId] ?? [];
  for (const entry of list) {
    map.set(entry.targetPath, entry);
  }
  return map;
}

/**
 * Convenience: read manifest, apply `entries` to `moduleId`, and write
 * back. Returns the resulting manifest (post-sort) for tests that want to
 * assert on serialized output.
 */
export function persistMirrorEntries(
  projectRoot: string,
  moduleId: string,
  entries: readonly MirrorEntry[]
): MirrorManifest {
  const { manifest } = readMirrorManifest(projectRoot);
  const next = setMirrorEntries(manifest, moduleId, entries);
  writeMirrorManifest(projectRoot, next);
  return next;
}
