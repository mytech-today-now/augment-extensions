/**
 * Deterministic source-hash for the cross-platform export pipeline.
 *
 * Hashes the canonical JSON encoding of:
 *   { sortedModuleIds, versions, contentDigests, ignorePatterns }
 * with SHA-256 and truncates to 16 hex chars.
 *
 * The hash is embedded in every generated banner as `source-hash: <hex>`
 * and powers idempotent re-export plus drift detection.
 *
 * See: openspec/specs/cross-platform/export-command.md (Drift Detection)
 * See: openspec/changes/cross-platform/design.md (component 3)
 */

import { createHash } from 'crypto';

/**
 * One entry in the hash input set. `contentDigest` is a hex SHA-256 over
 * the concatenated rule-file bytes for the module (computed by the runner;
 * this module never touches the filesystem).
 */
export interface SourceHashModule {
  id: string;
  version: string;
  contentDigest: string;
}

export interface SourceHashInput {
  modules: SourceHashModule[];
  ignorePatterns: string[];
}

/**
 * Length of the embedded source-hash, in hex characters.
 */
export const SOURCE_HASH_HEX_LENGTH = 16;

/**
 * Canonical JSON encoding for hashing. The encoder:
 *   - sorts module entries by id (case-sensitive, lexicographic),
 *   - sorts `ignorePatterns` lexicographically,
 *   - uses fixed key order for the top-level and per-module shapes,
 *   - emits no whitespace.
 *
 * Exported for tests; the production hash path uses `computeSourceHash`.
 */
export function canonicalEncode(input: SourceHashInput): string {
  const sortedModules = [...input.modules]
    .map((m) => ({
      id: String(m.id),
      version: String(m.version),
      contentDigest: String(m.contentDigest),
    }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const sortedIgnore = [...input.ignorePatterns]
    .map((p) => String(p))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  // Fixed-shape canonical form. Hand-rolled to guarantee key order
  // independent of `JSON.stringify` insertion-order quirks across engines.
  const moduleParts = sortedModules.map(
    (m) =>
      `{"id":${JSON.stringify(m.id)},` +
      `"version":${JSON.stringify(m.version)},` +
      `"contentDigest":${JSON.stringify(m.contentDigest)}}`
  );
  const ignoreParts = sortedIgnore.map((p) => JSON.stringify(p));

  return (
    `{"modules":[${moduleParts.join(',')}],` +
    `"ignorePatterns":[${ignoreParts.join(',')}]}`
  );
}

/**
 * Compute the truncated source-hash for the supplied input set.
 *
 * Output is `SOURCE_HASH_HEX_LENGTH` lowercase hex chars.
 */
export function computeSourceHash(input: SourceHashInput): string {
  const canonical = canonicalEncode(input);
  const full = createHash('sha256').update(canonical, 'utf8').digest('hex');
  return full.slice(0, SOURCE_HASH_HEX_LENGTH);
}

/**
 * Recognize a banner `source-hash:` value and extract it. Returns `null`
 * when the hash comment is absent or malformed.
 *
 * Tolerant of both `<!-- source-hash: abc -->` (markdown banners) and
 * `# source-hash: abc` style comments for forward compatibility.
 */
export function extractEmbeddedHash(fileBody: string): string | null {
  const htmlMatch = fileBody.match(
    /<!--\s*source-hash:\s*([0-9a-f]{6,64})\s*-->/i
  );
  if (htmlMatch) {
    return htmlMatch[1].toLowerCase();
  }
  const hashMatch = fileBody.match(/(?:^|\n)#\s*source-hash:\s*([0-9a-f]{6,64})/i);
  if (hashMatch) {
    return hashMatch[1].toLowerCase();
  }
  return null;
}

/**
 * Compare two hashes safely. Lower-cases inputs and accepts either truncated
 * (16-char) or full (64-char) variants; equal means the shorter is a prefix
 * of the longer.
 */
export function hashesEqual(a: string | null, b: string | null): boolean {
  if (!a || !b) {
    return false;
  }
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  if (la.length === lb.length) {
    return la === lb;
  }
  return la.length < lb.length ? lb.startsWith(la) : la.startsWith(lb);
}
