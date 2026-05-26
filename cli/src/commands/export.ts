/**
 * `augx export` command.
 *
 * Aggregates linked Augx modules into the native single-file rule format
 * of each target tool (Claude Code, Cursor, Windsurf, Copilot). Wires the
 * pure pieces (`adapters/`, `lib/source-hash`, `lib/export-runner`) to the
 * filesystem and emits the exit codes defined in
 * openspec/specs/cross-platform/export-command.md.
 */

import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import {
  ADAPTERS,
  resolveTargets,
  allAdapters,
} from '../adapters';
import type { ToolAdapter } from '../adapters/types';
import { resolveLinkedModules } from '../lib/module-resolver';
import {
  hasBeadsMcpServer,
  loadBeadsMcpSnippet,
} from '../lib/mcp-detection';
import {
  EXIT,
  WriteOutcome,
  aggregate,
  assessDrift,
  buildExportMeta,
} from '../lib/export-runner';
import {
  DEFAULT_EXPORT_IGNORE,
  MIRROR_TOOLS,
} from '../types/coordination-export';
import type { MirrorTool, ExportBlock } from '../types/coordination-export';

const COORDINATION_PATH = path.join('.augment', 'coordination.json');

export interface ExportOptions {
  target?: string;
  output?: string;
  dryRun?: boolean;
  force?: boolean;
  verbose?: boolean;
}

/**
 * Determine the augx CLI version from the package.json shipped with the
 * binary. The path mirrors the resolution used in `cli/src/cli.ts`.
 */
function readAugxVersion(): string {
  const pkgPath = path.join(__dirname, '..', '..', '..', 'package.json');
  const raw = fs.readFileSync(pkgPath, 'utf-8').replace(/^\uFEFF/, '');
  return JSON.parse(raw).version as string;
}

/**
 * Load the optional `export` block from `.augment/coordination.json`.
 * Missing file or missing block both produce `undefined`.
 */
function readExportBlock(projectRoot: string): ExportBlock | undefined {
  const fp = path.join(projectRoot, COORDINATION_PATH);
  if (!fs.existsSync(fp)) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(fp, 'utf-8').replace(/^\uFEFF/, ''));
    const block = (parsed as { export?: unknown }).export;
    return (block && typeof block === 'object') ? (block as ExportBlock) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Resolve adapters from `--target` or fall back to `export.targets`.
 * Returns `null` when no valid target list can be determined; caller maps
 * that to a usage error.
 */
function pickAdapters(
  opts: ExportOptions,
  block: ExportBlock | undefined
): ToolAdapter[] | null {
  if (opts.target) {
    return resolveTargets(opts.target);
  }
  if (block?.targets && block.targets.length > 0) {
    const tools = block.targets.filter((t): t is MirrorTool =>
      (MIRROR_TOOLS as readonly string[]).includes(t as string)
    );
    if (tools.length === 0) {
      return null;
    }
    return tools.map((t) => ADAPTERS[t]);
  }
  return null;
}

/**
 * Provide the timestamp factory. Honors `AUGX_FAKE_NOW` for deterministic
 * tests; otherwise returns the live UTC ISO-8601 timestamp.
 */
function timestampFactory(): () => string {
  const fake = process.env.AUGX_FAKE_NOW;
  if (fake) {
    return () => fake;
  }
  return () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Read the current contents of a target file, or `null` if absent.
 * Normalizes CRLF to LF so byte-comparison against generated content is
 * stable across host operating systems.
 */
function readExistingTarget(targetPath: string): string | null {
  if (!fs.existsSync(targetPath)) {
    return null;
  }
  return fs.readFileSync(targetPath, 'utf-8').replace(/\r\n?/g, '\n');
}

/**
 * Write `content` to `targetPath` using LF line endings, creating any
 * intermediate directories. Returns the number of bytes written.
 */
function writeFileLF(targetPath: string, content: string): number {
  const dir = path.dirname(targetPath);
  fs.mkdirSync(dir, { recursive: true });
  // Force LF on output regardless of host OS.
  const lf = content.replace(/\r\n?/g, '\n');
  fs.writeFileSync(targetPath, lf, { encoding: 'utf-8' });
  return Buffer.byteLength(lf, 'utf-8');
}

/**
 * Format the dry-run line per the spec ("Per dry-run behavior" section).
 */
function dryRunLine(
  tool: string,
  destPath: string,
  bytes: number,
  moduleCount: number
): string {
  const formattedBytes = bytes.toLocaleString('en-US').replace(/,/g, '_');
  return `[dry-run] ${tool.padEnd(11)} -> ${destPath} (${formattedBytes} bytes, ${moduleCount} modules)`;
}

/**
 * Resolve the destination path for a target. Honors `--output` only when
 * exactly one adapter is selected (per the spec). Returns `null` when
 * `--output` is supplied with multiple targets, signaling a usage error.
 */
function resolveOutputPath(
  adapter: ToolAdapter,
  projectRoot: string,
  output: string | undefined,
  singleTarget: boolean
): string | null {
  if (output) {
    if (!singleTarget) {
      return null;
    }
    return path.isAbsolute(output) ? output : path.join(projectRoot, output);
  }
  return adapter.exportPaths(projectRoot).single;
}

/**
 * Main entry point for `augx export`.
 *
 * Exit code is returned via `process.exit(code)`. Caller may also rely on
 * the resolved Promise for testability; the promise resolves to the same
 * numeric exit code.
 */
export async function exportCommand(options: ExportOptions): Promise<number> {
  const projectRoot = process.cwd();
  const exportBlock = readExportBlock(projectRoot);

  let adapters: ToolAdapter[] | null;
  try {
    adapters = pickAdapters(options, exportBlock);
  } catch (err) {
    console.error(chalk.red(`Usage error: ${(err as Error).message}`));
    return finish(EXIT.USAGE);
  }
  if (!adapters || adapters.length === 0) {
    console.error(
      chalk.red(
        'Usage error: --target is required, or set "export.targets" in .augment/coordination.json.'
      )
    );
    return finish(EXIT.USAGE);
  }

  if (options.output && adapters.length > 1) {
    console.error(
      chalk.red('Usage error: --output may only be combined with a single --target value.')
    );
    return finish(EXIT.USAGE);
  }

  const ignore =
    exportBlock?.ignore && exportBlock.ignore.length > 0
      ? [...exportBlock.ignore]
      : [...DEFAULT_EXPORT_IGNORE];

  let modules;
  try {
    modules = resolveLinkedModules(projectRoot, ignore);
  } catch (err) {
    console.error(chalk.red(`Resolution error: ${(err as Error).message}`));
    return finish(EXIT.RESOLUTION);
  }

  const mcpSnippet = hasBeadsMcpServer(projectRoot)
    ? loadBeadsMcpSnippet(projectRoot)
    : undefined;

  const meta = buildExportMeta({
    modules,
    ignorePatterns: ignore,
    augxVersion: readAugxVersion(),
    mcpSnippet,
    now: timestampFactory(),
  });

  const outcomes: WriteOutcome[] = [];
  let driftRefused = false;
  let ioError = false;

  for (const adapter of adapters) {
    const dest = resolveOutputPath(
      adapter,
      projectRoot,
      options.output,
      adapters.length === 1
    );
    if (dest === null) {
      console.error(chalk.red('Usage error: --output requires exactly one --target.'));
      return finish(EXIT.USAGE);
    }

    const fresh = aggregate(adapter, meta, modules);

    let existing: string | null;
    try {
      existing = readExistingTarget(dest);
    } catch (err) {
      console.error(chalk.red(`I/O error reading ${dest}: ${(err as Error).message}`));
      ioError = true;
      outcomes.push({
        tool: adapter.id,
        targetPath: dest,
        bytes: 0,
        moduleCount: meta.modules.length,
        status: 'drift-refused',
        detail: 'read failed',
      });
      continue;
    }

    const drift = assessDrift(existing, fresh, meta.sourceHash);

    if (options.dryRun) {
      const projected = drift.status === 'equivalent' ? existing!.length : fresh.length;
      console.log(dryRunLine(adapter.id, dest, projected, meta.modules.length));
      outcomes.push({
        tool: adapter.id,
        targetPath: dest,
        bytes: projected,
        moduleCount: meta.modules.length,
        status: 'dry-run',
      });
      continue;
    }

    if (drift.status === 'equivalent') {
      if (options.verbose) {
        console.log(chalk.gray(`[noop] ${adapter.id} -> ${dest} (unchanged)`));
      }
      outcomes.push({
        tool: adapter.id,
        targetPath: dest,
        bytes: Buffer.byteLength(existing!, 'utf-8'),
        moduleCount: meta.modules.length,
        status: 'noop',
      });
      continue;
    }

    if (drift.status === 'drift' && !options.force) {
      console.error(
        chalk.yellow(
          `[drift] ${adapter.id} -> ${dest}: ${drift.reason ?? 'hand-edited file detected'}. Re-run with --force to overwrite.`
        )
      );
      driftRefused = true;
      outcomes.push({
        tool: adapter.id,
        targetPath: dest,
        bytes: existing ? Buffer.byteLength(existing, 'utf-8') : 0,
        moduleCount: meta.modules.length,
        status: 'drift-refused',
        detail: drift.reason,
      });
      continue;
    }

    try {
      const bytes = writeFileLF(dest, drift.newContent);
      if (options.verbose) {
        console.log(chalk.green(`[write] ${adapter.id} -> ${dest} (${bytes} bytes)`));
      }
      outcomes.push({
        tool: adapter.id,
        targetPath: dest,
        bytes,
        moduleCount: meta.modules.length,
        status: 'written',
      });
    } catch (err) {
      console.error(chalk.red(`I/O error writing ${dest}: ${(err as Error).message}`));
      ioError = true;
      outcomes.push({
        tool: adapter.id,
        targetPath: dest,
        bytes: 0,
        moduleCount: meta.modules.length,
        status: 'drift-refused',
        detail: 'write failed',
      });
    }
  }

  if (!options.dryRun) {
    printSummary(outcomes);
  }
  if (ioError) {
    return finish(EXIT.IO);
  }
  if (driftRefused) {
    return finish(EXIT.DRIFT);
  }
  return finish(EXIT.OK);
}

function printSummary(outcomes: WriteOutcome[]): void {
  const written = outcomes.filter((o) => o.status === 'written').length;
  const noop = outcomes.filter((o) => o.status === 'noop').length;
  const drift = outcomes.filter((o) => o.status === 'drift-refused').length;
  if (written + noop + drift === 0) {
    return;
  }
  console.log(
    chalk.gray(
      `\nExport summary: ${written} written, ${noop} unchanged, ${drift} refused.`
    )
  );
}

function finish(code: number): number {
  process.exitCode = code;
  return code;
}

/** Exported for tests that bypass the CLI entry point. */
export const _exportInternals = {
  pickAdapters,
  readExportBlock,
  readAugxVersion,
  timestampFactory,
  readExistingTarget,
  writeFileLF,
  dryRunLine,
  resolveOutputPath,
};
