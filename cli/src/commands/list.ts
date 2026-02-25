import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { discoverModules, Module as ModuleType } from '../utils/module-system';
import { ModuleLoader } from '../core/module-loader';

interface ListOptions {
  linked?: boolean;
  json?: boolean;
  versions?: boolean;
}

interface Module {
  name: string;
  version: string;
  description: string;
  type: string;
  linked?: boolean;
  availableVersions?: string[];
}

export async function listCommand(options: ListOptions): Promise<void> {
  try {
    const modules = await getModules(options.linked, options.versions || false);

    if (options.json) {
      console.log(JSON.stringify(modules, null, 2));
      return;
    }

    if (modules.length === 0) {
      console.log(chalk.yellow(options.linked ? 'No linked modules found.' : 'No modules available.'));
      return;
    }

    console.log(chalk.bold.blue(`\n${options.linked ? 'Linked' : 'Available'} Modules:\n`));

    modules.forEach((module) => {
      const status = module.linked ? chalk.green('✓') : chalk.gray('○');
      console.log(`${status} ${chalk.bold(module.name)} ${chalk.gray(`(v${module.version})`)}`);
      console.log(`  ${chalk.gray(module.description)}`);
      console.log(`  ${chalk.cyan(`Type: ${module.type}`)}`);

      // Show available versions if --versions flag is set
      if (options.versions && module.availableVersions && module.availableVersions.length > 0) {
        console.log(`  ${chalk.gray('Available versions:')} ${chalk.yellow(module.availableVersions.join(', '))}`);
      }

      console.log('');
    });

    console.log(chalk.gray(`Total: ${modules.length} module(s)\n`));
  } catch (error) {
    console.error(chalk.red('Error listing modules:'), error);
    process.exit(1);
  }
}

async function getModules(linkedOnly: boolean = false, showVersions: boolean = false): Promise<Module[]> {
  const modules: Module[] = [];

  // Check for linked modules in current project
  const linkedModules = getLinkedModules();

  if (linkedOnly) {
    return linkedModules;
  }

  // Get all available modules using the module system
  const discoveredModules = discoverModules();

  // Initialize module loader for version information
  const loader = showVersions ? new ModuleLoader() : null;

  for (const module of discoveredModules) {
    const moduleData: Module = {
      name: module.fullName,
      version: module.metadata.version,
      description: module.metadata.description,
      type: module.metadata.type,
      linked: linkedModules.some(m => m.name === module.fullName)
    };

    // Get available versions if requested
    if (showVersions && loader) {
      const availableVersions = loader.getAvailableVersions(module.path);
      if (availableVersions.length > 0) {
        moduleData.availableVersions = availableVersions;
      }
    }

    modules.push(moduleData);
  }

  return modules;
}

function getLinkedModules(): Module[] {
  const configPath = path.join(process.cwd(), '.augment', 'extensions.json');
  
  if (!fs.existsSync(configPath)) {
    return [];
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    return (config.modules || []).map((m: any) => ({
      ...m,
      linked: true
    }));
  } catch (error) {
    return [];
  }
}

