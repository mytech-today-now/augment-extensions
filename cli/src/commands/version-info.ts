import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { ModuleLoader } from '../core/module-loader';
import { VersionManager } from '../core/version-manager';
import { CompatibilityChecker } from '../core/compatibility-checker';
import { discoverModules } from '../utils/module-system';

export interface VersionInfoCommandOptions {
  json?: boolean;
  changelog?: boolean;
  compatibility?: boolean;
}

export async function versionInfoCommand(moduleName: string, options: VersionInfoCommandOptions = {}): Promise<void> {
  try {
    const { json = false, changelog = true, compatibility = true } = options;
    const modules = discoverModules();
    const module = modules.find((m) => m.fullName === moduleName || m.metadata.name === moduleName);

    if (!module) {
      if (json) {
        console.log(JSON.stringify({ error: `Module not found: ${moduleName}` }, null, 2));
      } else {
        console.error(chalk.red(`✗ Module not found: ${moduleName}`));
        console.log(chalk.gray('\nAvailable modules:'));
        modules.forEach((m) => console.log(chalk.gray(`  - ${m.fullName}`)));
      }
      process.exit(1);
    }

    const versionManager = new VersionManager();
    const metadata = versionManager.getVersion(module.path);
    if (!metadata) {
      if (json) {
        console.log(JSON.stringify({ error: 'Unable to determine version information' }, null, 2));
      } else {
        console.error(chalk.red('✗ Unable to determine version information'));
      }
      process.exit(1);
    }

    const loader = new ModuleLoader();
    const availableVersions = loader.getAvailableVersions(module.path);
    const compatResult = compatibility ? new CompatibilityChecker().checkCompatibility(module.path) : null;

    let changelogContent: string | null = null;
    if (changelog) {
      const changelogPath = path.join(module.path, 'CHANGELOG.md');
      if (fs.existsSync(changelogPath)) {
        changelogContent = fs.readFileSync(changelogPath, 'utf-8');
      }
    }

    if (json) {
      console.log(JSON.stringify({
        module: moduleName,
        version: metadata.version,
        metadata: {
          deprecated: metadata.deprecated,
          deprecationMessage: metadata.deprecationMessage,
          breaking: metadata.breaking,
          publishedAt: metadata.publishedAt,
          changelog: metadata.changelog
        },
        availableVersions,
        compatibility: compatResult,
        changelog: changelogContent
      }, null, 2));
      return;
    }

    console.log(chalk.bold.blue(`\n📦 ${moduleName} - Version Information\n`));
    console.log(chalk.bold('Version:'));
    console.log(`  ${chalk.green(metadata.version)}`);

    if (metadata.publishedAt) {
      console.log(`  ${chalk.gray('Released:')} ${new Date(metadata.publishedAt).toLocaleDateString()}`);
    }

    if (metadata.deprecated) {
      console.log(chalk.yellow('\n⚠ Status: DEPRECATED'));
      if (metadata.deprecationMessage) {
        console.log(chalk.yellow(`  ${metadata.deprecationMessage}`));
      }
    }

    if (metadata.breaking) {
      console.log(chalk.red('\n⚠ Contains Breaking Changes'));
    }

    if (availableVersions.length > 0) {
      console.log(chalk.bold('\nAvailable Versions:'));
      availableVersions.forEach((v) => {
        const isCurrent = v === metadata.version;
        console.log(`  ${isCurrent ? chalk.green('●') : chalk.gray('○')} ${v}${isCurrent ? chalk.gray(' (current)') : ''}`);
      });
    }

    if (compatResult) {
      console.log(chalk.bold('\nCompatibility:'));
      console.log(compatResult.compatible
        ? chalk.green('  ✓ Compatible with current environment')
        : chalk.red('  ✗ Compatibility issues detected'));

      if (compatResult.details.node) {
        const node = compatResult.details.node;
        console.log(`  ${chalk.gray('Node.js:')} ${node.current} ${node.compatible ? chalk.green('✓') : chalk.red('✗')} (requires ${node.required}+)`);
      }

      if (compatResult.details.typescript) {
        const ts = compatResult.details.typescript;
        console.log(`  ${chalk.gray('TypeScript:')} ${ts.current} ${ts.compatible ? chalk.green('✓') : chalk.red('✗')} (requires ${ts.required}+)`);
      }

      if (compatResult.warnings.length > 0) {
        console.log(chalk.yellow('\n  Warnings:'));
        compatResult.warnings.forEach((w) => console.log(chalk.yellow(`    - ${w}`)));
      }

      if (compatResult.errors.length > 0) {
        console.log(chalk.red('\n  Errors:'));
        compatResult.errors.forEach((e) => console.log(chalk.red(`    - ${e}`)));
      }
    }

    if (changelogContent) {
      console.log(chalk.bold('\nChangelog:'));
      const lines = changelogContent.split('\n').slice(0, 20);
      lines.forEach((line) => console.log(chalk.gray(`  ${line}`)));

      const totalLines = changelogContent.split('\n').length;
      if (totalLines > 20) {
        console.log(chalk.gray(`  ... (${totalLines - 20} more lines)`));
        console.log(chalk.gray(`  View full changelog: ${path.join(module.path, 'CHANGELOG.md')}`));
      }
    } else if (metadata.changelog) {
      console.log(chalk.bold('\nChangelog:'));
      console.log(chalk.gray(`  ${metadata.changelog}`));
    }
  } catch (error) {
    if (options.json) {
      console.log(JSON.stringify({ error: String(error) }, null, 2));
    } else {
      console.error(chalk.red('Error getting version information:'), error);
    }
    process.exit(1);
  }
}