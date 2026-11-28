import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  formatHostHookOutput,
  refreshContextForHost,
  type ContextHookInput,
} from '../cli/src/lib/context-refresh';
import {
  contextHostStatus,
  disableContextHost,
  setupContextHost,
} from '../cli/src/lib/context-hosts';
import type { Module } from '../cli/src/utils/module-system';

const temporaryRoots: string[] = [];

function temporaryRoot(name: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), `augx-${name}-`));
  temporaryRoots.push(root);
  return root;
}

function cleanup(): void {
  while (temporaryRoots.length > 0) {
    const root = temporaryRoots.pop()!;
    fs.rmSync(root, { recursive: true, force: true });
  }
}

afterEach(cleanup);

interface ModuleFixture {
  module: Module;
  sourceRoot: string;
}

function makeModule(root: string, id: string, version: string, files: Record<string, string>, terms: string[] = []): ModuleFixture {
  const sourceRoot = path.join(root, 'modules', ...id.split('/'));
  fs.mkdirSync(sourceRoot, { recursive: true });
  for (const [relativePath, content] of Object.entries(files)) {
    const destination = path.join(sourceRoot, relativePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, content, 'utf8');
  }
  const segments = id.split('/');
  const shortName = segments[segments.length - 1];
  const module: Module = {
    fullName: id,
    path: sourceRoot,
    rules: Object.keys(files).filter((file) => file.startsWith('rules/') && file.endsWith('.md')).map((file) => path.basename(file)),
    examples: [],
    metadata: {
      name: shortName,
      version,
      displayName: shortName.replace(/-/g, ' '),
      description: `${terms.join(' ')} rules for application work`,
      type: 'coding-standards',
      language: terms[0],
      tags: terms,
      keywords: terms,
    },
  };
  return { module, sourceRoot };
}

function manifest(root: string, entries: Array<{ name: string; version: string }>): void {
  const directory = path.join(root, '.augment');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'extensions.json'), JSON.stringify({ version: '0.1.0', modules: entries }), 'utf8');
}

function optionsFor(
  root: string,
  modules: Module[],
  extra: Record<string, unknown> = {}
) {
  const moduleMap = new Map(modules.map((item) => [item.fullName, item]));
  return {
    stateDirectory: path.join(root, 'private-state'),
    resolveModule: (id: string) => moduleMap.get(id) ?? null,
    discoverModules: () => modules,
    now: () => new Date('2026-11-27T18:00:00.000Z'),
    ...extra,
  };
}

function hookInput(root: string, sessionId: string, event: string, prompt?: string, source?: string): ContextHookInput {
  return {
    session_id: sessionId,
    cwd: root,
    hook_event_name: event,
    ...(prompt === undefined ? {} : { prompt }),
    ...(source === undefined ? {} : { source }),
  };
}

describe('automatic linked module rule refresh', () => {
  it('injects a canonical linked module through an ordinary host prompt hook', () => {
    const root = temporaryRoot('canonical');
    const moduleRoot = path.resolve(__dirname, '../augment-extensions/coding-standards/typescript');
    const metadata = JSON.parse(fs.readFileSync(path.join(moduleRoot, 'module.json'), 'utf8'));
    manifest(root, [{ name: 'coding-standards/typescript', version: metadata.version }]);

    const result = formatHostHookOutput('codex', hookInput(
      root,
      'ordinary-chat-1',
      'UserPromptSubmit',
      'Use coding-standards/typescript rules/type-patterns.md while updating the TypeScript API.',
    ));

    const output = result.hookSpecificOutput as Record<string, unknown>;
    expect(output.hookEventName).toBe('UserPromptSubmit');
    expect(String(output.additionalContext)).toContain('coding-standards/typescript v2.0.0 | rules/type-patterns.md');
    expect(String(output.additionalContext)).toContain('SHA-256:');
    expect(String(output.additionalContext)).toContain(fs.readFileSync(path.join(moduleRoot, 'rules/type-patterns.md'), 'utf8'));
  });

  it('selects task and file relevant linked modules while excluding unrelated links', () => {
    const root = temporaryRoot('selection');
    const typescript = makeModule(root, 'coding-standards/typescript', '2.0.0', {
      'rules/types.md': '# Type Safety\nTYPESCRIPT_TYPE_RULE',
      'rules/testing.md': '# Testing\nTYPESCRIPT_TEST_RULE',
    }, ['typescript', 'typing']);
    const python = makeModule(root, 'coding-standards/python', '1.0.0', {
      'rules/types.md': '# Type Hints\nPYTHON_TYPE_RULE',
    }, ['python', 'type-hints']);
    manifest(root, [
      { name: typescript.module.fullName, version: '2.0.0' },
      { name: python.module.fullName, version: '1.0.0' },
    ]);

    const result = refreshContextForHost('claude-code', hookInput(
      root,
      'task-chat',
      'UserPromptSubmit',
      'Update src/client.ts and improve test coverage for the TypeScript client.',
    ), optionsFor(root, [typescript.module, python.module]));

    expect(result.modules.map((item) => item.id)).toEqual([typescript.module.fullName]);
    expect(result.additionalContext).toContain('TYPESCRIPT_TEST_RULE');
    expect(result.additionalContext).not.toContain('TYPESCRIPT_TYPE_RULE');
    expect(result.additionalContext).not.toContain('PYTHON_TYPE_RULE');
  });

  it('loads all module rules when the prompt names its canonical module ID', () => {
    const root = temporaryRoot('explicit-module');
    const fixture = makeModule(root, 'workflows/database', '1.0.0', {
      'rules/queries.md': '# Queries\nCANONICAL_QUERY_RULE',
      'rules/migrations.md': '# Migrations\nCANONICAL_MIGRATION_RULE',
    });
    manifest(root, [{ name: fixture.module.fullName, version: '1.0.0' }]);

    const result = refreshContextForHost('codex', hookInput(
      root,
      'explicit-module-session',
      'UserPromptSubmit',
      'Use workflows/database for this task.',
    ), optionsFor(root, [fixture.module]));

    expect(result.additionalContext).toContain('CANONICAL_QUERY_RULE');
    expect(result.additionalContext).toContain('CANONICAL_MIGRATION_RULE');
    expect(result.modules[0].files.map((file) => file.path)).toEqual([
      'rules/migrations.md',
      'rules/queries.md',
    ]);
  });

  it('injects only an exact current rule file and rejects traversal or escaping paths', () => {
    const root = temporaryRoot('exact-file');
    const fixture = makeModule(root, 'workflows/example', '1.0.0', {
      'rules/current.md': '# Current\nCURRENT_RULE_BYTES',
      'README.md': 'OUTSIDE_RULE_SECRET',
    }, ['workflow']);
    manifest(root, [{ name: fixture.module.fullName, version: '1.0.0' }]);
    const options = optionsFor(root, [fixture.module]);

    const selected = refreshContextForHost('codex', hookInput(
      root,
      'exact-file-session',
      'UserPromptSubmit',
      'Apply workflows/example rules/current.md.',
    ), options);
    expect(selected.additionalContext).toContain('CURRENT_RULE_BYTES');
    expect(selected.additionalContext).not.toContain('OUTSIDE_RULE_SECRET');
    expect(selected.modules[0].files.map((file) => file.path)).toEqual(['rules/current.md']);

    const traversal = refreshContextForHost('codex', hookInput(
      root,
      'traversal-session',
      'UserPromptSubmit',
      'Apply workflows/example rules/../README.md.',
    ), options);
    expect(traversal.additionalContext).not.toContain('OUTSIDE_RULE_SECRET');
    expect(traversal.diagnostics.some((item) => item.code === 'RULE_FILE_NOT_FOUND' || item.code === 'RULE_PATH_OUTSIDE_MODULE')).toBe(true);

    const external = path.join(root, 'external.md');
    fs.writeFileSync(external, 'SYMLINK_SECRET', 'utf8');
    fs.symlinkSync(external, path.join(fixture.sourceRoot, 'rules/escape.md'));
    const escaping = refreshContextForHost('claude-code', hookInput(
      root,
      'escape-session',
      'UserPromptSubmit',
      'Apply workflows/example rules/escape.md.',
    ), options);
    expect(escaping.additionalContext).not.toContain('SYMLINK_SECRET');
    expect(escaping.diagnostics.some((item) => item.code === 'RULE_FILE_NOT_FOUND')).toBe(true);
  });

  it('restores saved module IDs before continuation after compaction without storing prompt text or rules', () => {
    const root = temporaryRoot('compact');
    const fixture = makeModule(root, 'domain-rules/security', '1.2.0', {
      'rules/web-security.md': '# Web Security\nCURRENT_SECURITY_POLICY',
    }, ['security', 'web']);
    manifest(root, [{ name: fixture.module.fullName, version: '1.2.0' }]);
    const options = optionsFor(root, [fixture.module]);
    const firstPrompt = 'Please apply domain-rules/security to the login endpoint, prompt-private-phrase.';
    const initial = refreshContextForHost('codex', hookInput(root, 'compact-session', 'UserPromptSubmit', firstPrompt), options);
    expect(initial.additionalContext).toContain('CURRENT_SECURITY_POLICY');

    const stateFiles: string[] = [];
    const visit = (directory: string) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) visit(absolute);
        else stateFiles.push(absolute);
      }
    };
    visit(options.stateDirectory);
    expect(stateFiles).toHaveLength(1);
    const savedState = fs.readFileSync(stateFiles[0], 'utf8');
    expect(savedState).toContain('domain-rules/security');
    expect(savedState).not.toContain('prompt-private-phrase');
    expect(savedState).not.toContain('CURRENT_SECURITY_POLICY');

    const compacted = refreshContextForHost('codex', hookInput(root, 'compact-session', 'SessionStart', undefined, 'compact'), options);
    expect(compacted.additionalContext).toContain('CURRENT_SECURITY_POLICY');
    expect(compacted.modules.map((item) => item.id)).toEqual([fixture.module.fullName]);
  });

  it.each(['codex', 'claude-code'] as const)('restores exact rule paths after compaction with either separator for %s', (host) => {
    const root = temporaryRoot('compact-exact-path');
    const fixture = makeModule(root, 'workflows/example', '1.0.0', {
      'rules/current.md': '# Current\nORIGINAL_RULE_CONTENT',
      'rules/other.md': '# Other\nUNSELECTED_RULE_CONTENT',
      'README.md': 'OUTSIDE_RULE_SECRET',
    });
    manifest(root, [{ name: fixture.module.fullName, version: '1.0.0' }]);
    const options = optionsFor(root, [fixture.module]);
    const initial = refreshContextForHost(host, hookInput(
      root, 'exact-path-session', 'UserPromptSubmit', 'Use workflows/example rules/current.md.',
    ), options);
    expect(initial.additionalContext).toContain('ORIGINAL_RULE_CONTENT');

    const projectStateDirectory = path.join(options.stateDirectory, fs.readdirSync(options.stateDirectory)[0]);
    const stateFile = path.join(projectStateDirectory, fs.readdirSync(projectStateDirectory)[0]);
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    expect(state.modules).toEqual([{ id: fixture.module.fullName, mode: 'files', files: ['rules/current.md'] }]);
    fs.writeFileSync(path.join(fixture.sourceRoot, 'rules/current.md'), '# Current\nUPDATED_RULE_CONTENT', 'utf8');

    for (const savedPath of ['rules/current.md', 'rules\\current.md']) {
      state.modules[0].files = [savedPath];
      fs.writeFileSync(stateFile, JSON.stringify(state), 'utf8');
      const compacted = refreshContextForHost(host, hookInput(
        root, 'exact-path-session', 'SessionStart', undefined, 'compact',
      ), options);
      expect(compacted.diagnostics).toEqual([]);
      expect(compacted.additionalContext).toContain('UPDATED_RULE_CONTENT');
      expect(compacted.additionalContext).not.toContain('ORIGINAL_RULE_CONTENT');
      expect(compacted.additionalContext).not.toContain('UNSELECTED_RULE_CONTENT');
    }

    state.modules[0].files = ['rules\\..\\README.md'];
    fs.writeFileSync(stateFile, JSON.stringify(state), 'utf8');
    const invalid = refreshContextForHost(host, hookInput(
      root, 'exact-path-session', 'SessionStart', undefined, 'compact',
    ), options);
    expect(invalid.diagnostics.some((item) => item.code === 'INVALID_SESSION_STATE')).toBe(true);
    expect(invalid.modules).toEqual([]);
    expect(invalid.additionalContext).not.toContain('OUTSIDE_RULE_SECRET');
  });

  it('rereads changed rules and applies a changed linked version after an earlier injection', () => {
    const root = temporaryRoot('freshness');
    const fixture = makeModule(root, 'coding-standards/typescript', '1.0.0', {
      'rules/types.md': '# Type Safety\nOLD_VERSION_CONTENT',
    }, ['typescript']);
    manifest(root, [{ name: fixture.module.fullName, version: '1.0.0' }]);
    const modules = [fixture.module];
    const options = optionsFor(root, modules);
    const first = refreshContextForHost('claude-code', hookInput(root, 'fresh-session', 'UserPromptSubmit', 'Use coding-standards/typescript.'), options);
    expect(first.additionalContext).toContain('OLD_VERSION_CONTENT');

    fs.writeFileSync(path.join(fixture.sourceRoot, 'rules/types.md'), '# Type Safety\nCURRENT_VERSION_CONTENT', 'utf8');
    fixture.module.metadata.version = '1.1.0';
    manifest(root, [{ name: fixture.module.fullName, version: '^1.0.0' }]);
    const next = refreshContextForHost('claude-code', hookInput(root, 'fresh-session', 'UserPromptSubmit', 'Continue with the types.'), options);
    expect(next.additionalContext).toContain('v1.1.0');
    expect(next.additionalContext).toContain('CURRENT_VERSION_CONTENT');
    expect(next.additionalContext).not.toContain('OLD_VERSION_CONTENT');

    manifest(root, [{ name: fixture.module.fullName, version: '2.0.0' }]);
    const unavailable = refreshContextForHost('claude-code', hookInput(root, 'fresh-session', 'SessionStart', undefined, 'compact'), options);
    expect(unavailable.additionalContext).not.toContain('CURRENT_VERSION_CONTENT');
    expect(unavailable.diagnostics.some((item) => item.code === 'LINKED_VERSION_UNAVAILABLE')).toBe(true);
  });

  it('isolates saved selections across session IDs and project roots', () => {
    const sharedState = path.join(temporaryRoot('isolation-state'), 'state');
    const projectA = temporaryRoot('project-a');
    const projectB = temporaryRoot('project-b');
    const alpha = makeModule(projectA, 'domain-rules/security', '1.0.0', { 'rules/a.md': '# Security\nALPHA_ONLY' }, ['security']);
    const beta = makeModule(projectB, 'workflows/database', '1.0.0', { 'rules/b.md': '# Database\nBETA_ONLY' }, ['database']);
    manifest(projectA, [{ name: alpha.module.fullName, version: '1.0.0' }]);
    manifest(projectB, [{ name: beta.module.fullName, version: '1.0.0' }]);
    const optionsA = optionsFor(projectA, [alpha.module], { stateDirectory: sharedState });
    const optionsB = optionsFor(projectB, [beta.module], { stateDirectory: sharedState });
    refreshContextForHost('codex', hookInput(projectA, 'same-session-id', 'UserPromptSubmit', 'Use domain-rules/security.'), optionsA);
    refreshContextForHost('codex', hookInput(projectB, 'same-session-id', 'UserPromptSubmit', 'Use workflows/database.'), optionsB);

    const restoredA = refreshContextForHost('codex', hookInput(projectA, 'same-session-id', 'SessionStart', undefined, 'compact'), optionsA);
    const restoredB = refreshContextForHost('codex', hookInput(projectB, 'same-session-id', 'SessionStart', undefined, 'compact'), optionsB);
    expect(restoredA.additionalContext).toContain('ALPHA_ONLY');
    expect(restoredA.additionalContext).not.toContain('BETA_ONLY');
    expect(restoredB.additionalContext).toContain('BETA_ONLY');
    expect(restoredB.additionalContext).not.toContain('ALPHA_ONLY');
  });

  it('reports missing, malformed, unlinked, unreadable, and oversized sources without stale content', () => {
    const root = temporaryRoot('failures');
    const fixture = makeModule(root, 'workflows/example', '1.0.0', {
      'rules/current.md': '# Example\nVALID_CURRENT_CONTENT',
    }, ['example']);
    manifest(root, [{ name: fixture.module.fullName, version: '1.0.0' }]);
    const readFailure = optionsFor(root, [fixture.module], {
      readRuleFile: () => { throw new Error('EACCES fixture'); },
    });
    const unreadable = refreshContextForHost('codex', hookInput(root, 'unreadable', 'UserPromptSubmit', 'Use workflows/example.'), readFailure);
    expect(unreadable.additionalContext).not.toContain('VALID_CURRENT_CONTENT');
    expect(unreadable.diagnostics.some((item) => item.code === 'RULE_FILE_UNREADABLE')).toBe(true);

    manifest(root, [{ name: fixture.module.fullName, version: '1.0.0' }, { name: 'workflows/missing', version: '1.0.0' }]);
    const missing = refreshContextForHost('codex', hookInput(root, 'missing', 'UserPromptSubmit', 'Use workflows/example.'), optionsFor(root, [fixture.module]));
    expect(missing.diagnostics.some((item) => item.code === 'LINKED_MODULE_UNAVAILABLE')).toBe(true);

    manifest(root, [{ name: fixture.module.fullName, version: '1.0.0' }]);
    fs.writeFileSync(path.join(root, '.augment/extensions.json'), '{bad json', 'utf8');
    const malformed = refreshContextForHost('codex', hookInput(root, 'malformed', 'UserPromptSubmit', 'Use workflows/example.'), optionsFor(root, [fixture.module]));
    expect(malformed.modules).toEqual([]);
    expect(malformed.diagnostics.some((item) => item.code === 'INVALID_LINK_MANIFEST')).toBe(true);

    manifest(root, [{ name: fixture.module.fullName, version: '1.0.0' }]);
    fs.writeFileSync(path.join(fixture.sourceRoot, 'rules/current.md'), `# Example\n${'OVERSIZED_RULE_'.repeat(500)}`, 'utf8');
    const oversized = refreshContextForHost('claude-code', hookInput(root, 'oversized', 'UserPromptSubmit', 'Use workflows/example.'), optionsFor(root, [fixture.module], { maxChars: 1800 }));
    expect(oversized.additionalContext).not.toContain('OVERSIZED_RULE_');
    expect(oversized.diagnostics.some((item) => item.code === 'CONTEXT_BUDGET_EXCEEDED')).toBe(true);
    expect(oversized.additionalContext.length).toBeLessThanOrEqual(1800);

    manifest(root, []);
    const unlinked = refreshContextForHost('codex', hookInput(root, 'unlinked', 'UserPromptSubmit', 'Use workflows/example.'), optionsFor(root, [fixture.module]));
    expect(unlinked.additionalContext).not.toContain('OVERSIZED_RULE_');
    expect(unlinked.diagnostics.some((item) => item.code === 'MODULE_NOT_LINKED')).toBe(true);
  });
});

describe('automatic context host setup', () => {
  it('installs one Codex hook pair idempotently and removes only unchanged Augx handlers', () => {
    const root = temporaryRoot('codex-setup');
    const settingsPath = path.join(root, '.codex/hooks.json');
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify({
      description: 'User hook settings',
      hooks: { PreToolUse: [{ matcher: 'Bash', hooks: [{ type: 'command', command: 'echo keep-me' }] }] },
    }), 'utf8');

    expect(setupContextHost(root, 'codex').registrationIntact).toBe(true);
    expect(setupContextHost(root, 'codex').registrationIntact).toBe(true);
    let settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    expect(settings.description).toBe('User hook settings');
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toBe('echo keep-me');
    expect(settings.hooks.UserPromptSubmit.flatMap((group: any) => group.hooks)).toHaveLength(1);
    expect(settings.hooks.SessionStart[0].matcher).toBe('compact|resume');

    const augxHook = settings.hooks.UserPromptSubmit[0].hooks[0];
    augxHook.statusMessage = 'User edited this hook';
    fs.writeFileSync(settingsPath, JSON.stringify(settings), 'utf8');
    const removed = disableContextHost(root, 'codex');
    expect(removed.configured).toBe(true);
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    expect(settings.hooks.PreToolUse[0].hooks[0].command).toBe('echo keep-me');
    expect(settings.hooks.UserPromptSubmit[0].hooks[0].statusMessage).toBe('User edited this hook');
  });

  it('registers Claude Code hook arguments, preserves user settings, and removes unchanged hooks', () => {
    const root = temporaryRoot('claude-setup');
    const settingsPath = path.join(root, '.claude/settings.json');
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
    fs.writeFileSync(settingsPath, JSON.stringify({ enabledPlugins: ['user-plugin'] }), 'utf8');

    expect(setupContextHost(root, 'claude-code').registrationIntact).toBe(true);
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    expect(settings.enabledPlugins).toEqual(['user-plugin']);
    expect(settings.hooks.UserPromptSubmit[0].hooks[0].args.slice(-4)).toEqual(['context', 'refresh', '--host', 'claude-code']);
    expect(contextHostStatus(root, 'claude-code').configured).toBe(true);

    const removed = disableContextHost(root, 'claude-code');
    expect(removed.configured).toBe(false);
    const after = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    expect(after).toEqual({ enabledPlugins: ['user-plugin'] });
  });

  it('reports unsupported static-only hosts without claiming automatic injection', () => {
    const root = temporaryRoot('unsupported');
    const status = contextHostStatus(root, 'cursor');
    expect(status.supported).toBe(false);
    expect(status.message).toContain('static export or mirror only');
    expect(() => setupContextHost(root, 'windsurf' as 'codex')).toThrow('supports only codex and claude-code');
  });
});
