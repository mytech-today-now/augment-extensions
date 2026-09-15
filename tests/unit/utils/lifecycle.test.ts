import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { TestEnvironment } from '../../helpers/test-env';
import {
  buildLifecycleSnapshot,
  createLifecycleBackup,
  exportLifecycleReport,
  loadLifecycleArtifact,
  restoreLifecycleBackup,
} from '@cli/utils/lifecycle';

function makeValidArtifact(projectRoot: string, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    application: {
      name: 'augment-extensions',
      version: '3.1.3',
    },
    projectRoot,
    status: 'installation-completed',
    createdAt: now,
    updatedAt: now,
    lastOperation: {
      name: 'diagnose',
      status: 'succeeded',
      startedAt: now,
      finishedAt: now,
    },
    extensionsConfig: {
      version: '0.1.0',
      modules: [],
      settings: {
        autoUpdate: false,
        checkUpdatesOnInit: true,
      },
    },
    backups: [],
    archives: [],
    issues: [],
    ...overrides,
  };
}

describe('lifecycle utilities', () => {
  let testEnv: TestEnvironment;
  let originalCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd();
    testEnv = new TestEnvironment();
    await testEnv.setup();
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    await testEnv.cleanup();
  });

  it('creates a snapshot for a fresh project and writes the lifecycle artifact', async () => {
    const project = await testEnv.createProject({ name: 'fresh-lifecycle-project' });

    const snapshot = buildLifecycleSnapshot(project.path);

    expect(snapshot.status).toBe('installation-partially-completed');
    expect(snapshot.issues.some((issue) => issue.safeFix === 'reinstall-core-rules' || issue.safeFix === 'rebuild-command-help')).toBe(true);
    expect(loadLifecycleArtifact(project.path)).not.toBeNull();
  });

  it('reports a corrupted lifecycle artifact without overwriting it', async () => {
    const project = await testEnv.createProject({ name: 'corrupted-lifecycle-project' });
    const artifactPath = join(project.path, '.augment', 'lifecycle.json');
    const originalContents = '{ this is not valid json';

    await writeFile(artifactPath, originalContents, 'utf-8');

    const snapshot = buildLifecycleSnapshot(project.path);
    const currentContents = await readFile(artifactPath, 'utf-8');

    expect(snapshot.status).toBe('recovery-required');
    expect(snapshot.issues.some((issue) => issue.id === 'lifecycle-artifact-corrupted')).toBe(true);
    expect(currentContents).toBe(originalContents);
  });

  it('reports an unsupported lifecycle artifact schema', async () => {
    const project = await testEnv.createProject({ name: 'schema-lifecycle-project' });
    const artifactPath = join(project.path, '.augment', 'lifecycle.json');

    await writeFile(
      artifactPath,
      JSON.stringify(
        makeValidArtifact(project.path, {
          schemaVersion: 99,
        }),
        null,
        2
      ),
      'utf-8'
    );

    const snapshot = buildLifecycleSnapshot(project.path);

    expect(snapshot.status).toBe('recovery-required');
    expect(snapshot.issues.some((issue) => issue.id === 'lifecycle-artifact-unsupported-schema')).toBe(true);
  });

  it('reports a wrong application identity in the lifecycle artifact', async () => {
    const project = await testEnv.createProject({ name: 'identity-lifecycle-project' });
    const artifactPath = join(project.path, '.augment', 'lifecycle.json');

    await writeFile(
      artifactPath,
      JSON.stringify(
        makeValidArtifact(project.path, {
          application: {
            name: 'different-app',
            version: '1.0.0',
          },
        }),
        null,
        2
      ),
      'utf-8'
    );

    const snapshot = buildLifecycleSnapshot(project.path);

    expect(snapshot.status).toBe('recovery-required');
    expect(snapshot.issues.some((issue) => issue.id === 'lifecycle-artifact-wrong-identity')).toBe(true);
  });

  it('restores the config and artifact from a lifecycle backup', async () => {
    const project = await testEnv.createProject({ name: 'backup-lifecycle-project' });
    const config = JSON.parse(await readFile(project.configPath, 'utf-8'));
    config.modules.push({
      name: 'coding-standards/typescript',
      version: '1.0.0',
      type: 'coding-standards',
      description: 'TypeScript standards',
    });
    await writeFile(project.configPath, JSON.stringify(config, null, 2), 'utf-8');

    const snapshot = buildLifecycleSnapshot(project.path);
    const backup = createLifecycleBackup(project.path, 'test backup');
    const artifactPath = join(project.path, '.augment', 'lifecycle.json');

    await writeFile(
      project.configPath,
      JSON.stringify({
        version: '1.0.0',
        modules: [],
      }, null, 2),
      'utf-8'
    );
    await writeFile(artifactPath, '{ invalid json', 'utf-8');

    await restoreLifecycleBackup(project.path, backup);

    const restoredConfig = JSON.parse(await readFile(project.configPath, 'utf-8'));
    const restoredArtifact = await readFile(artifactPath, 'utf-8');

    expect(restoredConfig.modules).toEqual(snapshot.artifact.extensionsConfig.modules);
    expect(restoredArtifact).toContain('"schemaVersion": 1');
    expect(loadLifecycleArtifact(project.path)).not.toBeNull();
  });

  it('redacts path-like evidence in lifecycle reports', async () => {
    const project = await testEnv.createProject({ name: 'redaction-lifecycle-project' });
    const snapshot = buildLifecycleSnapshot(project.path);

    expect(snapshot.issues.length).toBeGreaterThan(0);
    snapshot.issues[0].evidence = ['C:\\secret\\tokens\\api-key.txt'];

    const report = exportLifecycleReport(snapshot);
    const redactedEvidence = (report.issues as Array<{ evidence: string[] }>)[0].evidence[0];

    expect(redactedEvidence).toBe('<redacted-path>');
  });
});
