/**
 * Module resolver for the cross-platform export pipeline.
 *
 * Reads the project's linked-module list from `.augment/extensions.json`,
 * walks each module's `rules/` directory, loads file contents, applies the
 * configured ignore globs, and produces `ResolvedModule[]` ready to feed
 * into a `ToolAdapter`.
 *
 * The resolver is the I/O boundary. All output is plain in-memory data so
 * downstream code (adapters, hash, drift) stays pure.
 *
 * See: openspec/specs/cross-platform/export-command.md (Ignore Patterns)
 */

import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import { minimatch } from 'minimatch';
import { findModule, getModulesDir } from '../utils/module-system';
import type { ResolvedModule, ResolvedRuleFile } from '../adapters/types';

/**
 * Project-relative path to the linked-module manifest.
 */
const EXTENSIONS_FILE = path.join('.augment', 'extensions.json');

interface LinkedModuleEntry {
  name: string;
  version?: string;
}

/**
 * Read the list of linked module names from `.augment/extensions.json`.
 * Returns `null` if the file is absent (caller distinguishes that from an
 * empty list).
 */
export function readLinkedModuleNames(projectRoot: string): string[] | null {
  const filePath = path.join(projectRoot, EXTENSIONS_FILE);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '');
  const parsed = JSON.parse(raw) as { modules?: LinkedModuleEntry[] };
  const modules = Array.isArray(parsed.modules) ? parsed.modules : [];
  return modules
    .map((m) => (typeof m?.name === 'string' ? m.name : null))
    .filter((n): n is string => Boolean(n));
}

/**
 * Recursively enumerate every file under `dir`, returning forward-slash
 * paths relative to `dir` in alphabetical order. Symlinks are NOT followed
 * to respect the safety rule against escaping `augment-extensions/`.
 */
function walkRelative(dir: string): string[] {
  const out: string[] = [];
  const stack: Array<{ abs: string; rel: string }> = [{ abs: dir, rel: '' }];
  while (stack.length > 0) {
    const { abs, rel } = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(abs, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) {
        continue;
      }
      const childAbs = path.join(abs, entry.name);
      const childRel = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        stack.push({ abs: childAbs, rel: childRel });
      } else if (entry.isFile()) {
        out.push(childRel);
      }
    }
  }
  return out.sort();
}

/**
 * Apply ignore globs (POSIX-style, evaluated against forward-slash paths
 * relative to the module root). A path matches if any pattern matches.
 */
function isIgnored(relativePath: string, ignore: readonly string[]): boolean {
  return ignore.some((pat) => minimatch(relativePath, pat, { dot: true }));
}

/**
 * Compute the per-module content digest used as input to `source-hash`.
 * Hashes the concatenation of `relativePath\0content\0` over the rule
 * files in alphabetical order with SHA-256. Returns full 64-hex.
 */
export function computeContentDigest(files: ResolvedRuleFile[]): string {
  const h = createHash('sha256');
  for (const f of files) {
    h.update(f.relativePath, 'utf8');
    h.update('\0');
    h.update(f.content, 'utf8');
    h.update('\0');
  }
  return h.digest('hex');
}

/**
 * Load one module's rule files from disk into `ResolvedRuleFile[]`.
 * `subdir` selects `rules/` or `examples/`. Returns alphabetical order.
 */
function loadFiles(
  moduleRoot: string,
  subdir: 'rules' | 'examples',
  ignore: readonly string[]
): ResolvedRuleFile[] {
  const root = path.join(moduleRoot, subdir);
  if (!fs.existsSync(root)) {
    return [];
  }
  const relPaths = walkRelative(root);
  const result: ResolvedRuleFile[] = [];
  for (const rel of relPaths) {
    const moduleScoped = `${subdir}/${rel}`;
    if (isIgnored(moduleScoped, ignore)) {
      continue;
    }
    const abs = path.join(root, rel);
    const raw = fs.readFileSync(abs, 'utf-8').replace(/\r\n?/g, '\n');
    result.push({ relativePath: moduleScoped, content: raw });
  }
  return result;
}

/**
 * Resolve every linked module into a `ResolvedModule`. Throws when a name
 * in `extensions.json` cannot be located on disk; callers map this to
 * resolution exit code 2.
 */
export function resolveLinkedModules(
  projectRoot: string,
  ignore: readonly string[]
): ResolvedModule[] {
  const names = readLinkedModuleNames(projectRoot) ?? [];
  const resolved: ResolvedModule[] = [];
  for (const name of names) {
    const m = findModule(name);
    if (!m) {
      throw new Error(`Linked module not found on disk: ${name}`);
    }
    const rulesFiles = loadFiles(m.path, 'rules', ignore);
    const examplesFiles = loadFiles(m.path, 'examples', ignore);
    const readmeAbs = path.join(m.path, 'README.md');
    resolved.push({
      id: m.fullName,
      version: m.metadata.version,
      rootPath: m.path,
      rulesFiles,
      examplesFiles,
      readmePath: fs.existsSync(readmeAbs) ? readmeAbs : undefined,
    });
  }
  resolved.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return resolved;
}

/**
 * Resolve a single module by name (canonical id or alias) into the same
 * `ResolvedModule` shape produced by `resolveLinkedModules`. Used by
 * `augx link --mirror` which operates on one module at a time. Returns
 * `null` when the module cannot be found.
 */
export function resolveSingleModule(
  moduleName: string,
  ignore: readonly string[]
): ResolvedModule | null {
  const m = findModule(moduleName);
  if (!m) {
    return null;
  }
  const rulesFiles = loadFiles(m.path, 'rules', ignore);
  const examplesFiles = loadFiles(m.path, 'examples', ignore);
  const readmeAbs = path.join(m.path, 'README.md');
  return {
    id: m.fullName,
    version: m.metadata.version,
    rootPath: m.path,
    rulesFiles,
    examplesFiles,
    readmePath: fs.existsSync(readmeAbs) ? readmeAbs : undefined,
  };
}

/** Exported for tests. */
export const _internal = { walkRelative, isIgnored, loadFiles };
/** Re-exported for callers that only need the modules dir. */
export { getModulesDir };
