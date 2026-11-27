import chalk from 'chalk';
import * as fs from 'fs';
import {
  getExtensionsConfigPath,
  resolveExtensionsProjectRoot
} from '../utils/extensions-config';
import { findModule, discoverCollections } from '../utils/module-system';
import { unlinkModuleMirrors } from '../lib/mirror-runner';
import {
  persistMirrorEntries,
  readMirrorManifest,
} from '../lib/mirror-coordination';

interface UnlinkOptions {
  force?: boolean;
}

/**
 * Remove every mirror artifact recorded for `moduleId` and clear the
 * `mirrors[<moduleId>]` block from the coordination manifest. Emits a
 * per-target line in verbose mode and a single warning for any file that
 * was kept because it had been hand-edited.
 */
function cleanupModuleMirrors(projectRoot: string, moduleId: string): void {
  const { manifest } = readMirrorManifest(projectRoot);
  const entries = manifest.mirrors?.[moduleId] ?? [];
  if (entries.length === 0) {
    return;
  }
  const sourceByTarget = new Map(entries.map((entry) => [entry.targetPath, entry.sourcePath]));
  const result = unlinkModuleMirrors(projectRoot, moduleId, entries);
  const kept = result.outcomes.filter((o) => o.status === 'kept-hand-edited');
  const removed = result.outcomes.filter((o) => o.status === 'removed').length;
  if (removed > 0) {
    console.log(chalk.gray(`  Pruned ${removed} mirror target(s)`));
  }
  if (result.claudeStubRemoved) {
    console.log(chalk.gray('  Removed CLAUDE.md include stub'));
  }
  if (kept.length > 0) {
    console.log(
      chalk.yellow(
        `  Kept ${kept.length} hand-edited file(s) - delete manually if no longer wanted:`
      )
    );
    for (const k of kept) {
      const sourcePath = sourceByTarget.get(k.targetPath);
      console.log(
        chalk.yellow(
          `    - ${k.targetPath}${sourcePath ? ` (recreate from ${sourcePath})` : ''}`
        )
      );
    }
    console.log(
      chalk.yellow(
        '  Rollback: restore the tracked mirror entry in .augment/coordination.json or recreate the target from its recorded source path.'
      )
    );
  }
  persistMirrorEntries(projectRoot, moduleId, []);
}

export async function unlinkCommand(moduleName: string, options: UnlinkOptions = {}): Promise<void> {
  try {
    await unlinkModule(moduleName, options);
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

/** Shared lifecycle service preserving dependencies and mirror ownership checks. */
export async function unlinkModule(
  moduleName: string, options: UnlinkOptions = {}, projectRoot = resolveExtensionsProjectRoot()
): Promise<void> {
    console.log(chalk.blue(`Unlinking module: ${moduleName}`));

    // Load extensions config
    const configPath = getExtensionsConfigPath(projectRoot);
    
    if (!fs.existsSync(configPath)) {
      throw new Error('Augment Extensions not initialized. Run: augx init');
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (!Array.isArray(config.modules)) throw new Error('Invalid extensions config: expected modules array');

    // Check if it's a collection
    const collections = discoverCollections();
    const collection = collections.find(c => c.fullName === moduleName || c.metadata.name === moduleName);

    if (collection) {
      await unlinkCollection(collection, config, configPath, options, projectRoot);
      return;
    }

    const resolvedModuleName = findModule(moduleName)?.fullName || moduleName;

    // Check if module is linked
    const moduleIndex = config.modules.findIndex((m: any) => m.name === resolvedModuleName);
    
    if (moduleIndex === -1) {
      console.log(chalk.yellow(`Module not linked: ${moduleName}`));
      return;
    }

    // Check for dependencies
    const dependentModules = config.modules.filter((m: any) => 
      m.dependencies && m.dependencies.includes(resolvedModuleName)
    );

    if (dependentModules.length > 0 && !options.force) {
      console.error(chalk.red(`\nCannot unlink ${resolvedModuleName}. The following modules depend on it:\n`));
      dependentModules.forEach((m: any) => {
        console.error(chalk.red(`  - ${m.name}`));
      });
      console.error(chalk.yellow('\nUse --force to unlink anyway (may break dependent modules)'));
      throw new Error(`Cannot unlink ${resolvedModuleName}: dependent modules are still linked`);
    }

    // Remove from config
    config.modules.splice(moduleIndex, 1);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    cleanupModuleMirrors(projectRoot, resolvedModuleName);

    console.log(chalk.green(`✓ Successfully unlinked: ${resolvedModuleName}`));

    if (dependentModules.length > 0) {
      console.log(chalk.yellow('\n⚠ Warning: The following modules may be affected:'));
      dependentModules.forEach((m: any) => {
        console.log(chalk.yellow(`  - ${m.name}`));
      });
    }

}

async function unlinkCollection(
  collection: any,
  config: any,
  configPath: string,
  options: UnlinkOptions,
  projectRoot: string
): Promise<void> {
  console.log(chalk.blue(`\nUnlinking collection: ${collection.metadata.displayName}\n`));
  console.log(chalk.gray(`This will unlink ${collection.metadata.modules.length} module(s):\n`));

  for (const module of collection.metadata.modules) {
    console.log(chalk.gray(`  - ${module.id}`));
  }

  // Unlink all modules in the collection
  let unlinkedCount = 0;
  for (const module of collection.metadata.modules) {
    const moduleIndex = config.modules.findIndex((m: any) => m.name === module.id);
    
    if (moduleIndex >= 0) {
      config.modules.splice(moduleIndex, 1);
      unlinkedCount++;
      cleanupModuleMirrors(projectRoot, module.id);
      console.log(chalk.green(`  ✓ Unlinked: ${module.id}`));
    } else {
      console.log(chalk.gray(`  - Skipped (not linked): ${module.id}`));
    }
  }

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  console.log(chalk.green(`\n✓ Successfully unlinked collection (${unlinkedCount} modules removed)`));
}

