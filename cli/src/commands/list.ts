import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { discoverModules, Module as ModuleType } from '../utils/module-system';

interface ListOptions {
  linked?: boolean;
  json?: boolean;
}

interface Module {
  name: string;
  version: string;
  description: string;
  type: string;
  linked?: boolean;
}

export async function listCommand(options: ListOptions): Promise<void> {
  try {
    const modules = await getModules(options.linked);

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
      console.log(`  ${chalk.cyan(`Type: ${module.type}`)}\n`);
    });

    console.log(chalk.gray(`Total: ${modules.length} module(s)\n`));
  } catch (error) {
    console.error(chalk.red('Error listing modules:'), error);
    process.exit(1);
  }
}

async function getModules(linkedOnly: boolean = false): Promise<Module[]> {
  const modules: Module[] = [];

  // Check for linked modules in current project
  const linkedModules = getLinkedModules();

  if (linkedOnly) {
    return linkedModules;
  }

  // Get all available modules using the module system
  const discoveredModules = discoverModules();

  for (const module of discoveredModules) {
    modules.push({
      name: module.fullName,
      version: module.metadata.version,
      description: module.metadata.description,
      type: module.metadata.type,
      linked: linkedModules.some(m => m.name === module.fullName)
    });
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

