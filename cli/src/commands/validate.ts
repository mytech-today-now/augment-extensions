import chalk from 'chalk';
import * as path from 'path';
import {
  findModule,
  validateModuleStructure,
  validateModuleCategory,
  validateProjectAgnostic,
  calculateModuleCharacterCount,
  getModulesDir
} from '../utils/module-system';
import { getModuleSizeCategory, CHARACTER_LIMITS } from '../utils/character-count';
import { validateModuleDocumentation } from '../utils/documentation-validator';

interface ValidateOptions {
  verbose?: boolean;
}

export async function validateCommand(moduleName: string, options: ValidateOptions = {}): Promise<void> {
  try {
    console.log(chalk.blue(`\n🔍 Validating module: ${moduleName}\n`));

    // Find the module
    const module = findModule(moduleName);
    
    if (!module) {
      console.error(chalk.red(`✗ Module not found: ${moduleName}`));
      console.log(chalk.gray('\nUse "augx list" to see all available modules.'));
      process.exit(1);
    }

    let hasErrors = false;
    let hasWarnings = false;

    // 1. Validate module structure
    console.log(chalk.bold('1. Module Structure'));
    const structureValidation = validateModuleStructure(module.path);
    
    if (structureValidation.errors.length > 0) {
      hasErrors = true;
      structureValidation.errors.forEach(error => {
        console.log(chalk.red(`  ✗ ${error}`));
      });
    } else {
      console.log(chalk.green('  ✓ Module structure is valid'));
    }
    
    if (structureValidation.warnings.length > 0) {
      hasWarnings = true;
      structureValidation.warnings.forEach(warning => {
        console.log(chalk.yellow(`  ⚠ ${warning}`));
      });
    }
    console.log();

    // 2. Validate module category
    console.log(chalk.bold('2. Module Category'));
    const categoryValidation = validateModuleCategory(module);
    
    if (categoryValidation.errors.length > 0) {
      hasErrors = true;
      categoryValidation.errors.forEach(error => {
        console.log(chalk.red(`  ✗ ${error}`));
      });
    } else {
      console.log(chalk.green(`  ✓ Module type matches directory category (${module.metadata.type})`));
    }
    console.log();

    // 3. Validate project-agnostic content
    console.log(chalk.bold('3. Project-Agnostic Content'));
    const agnosticValidation = validateProjectAgnostic(module.path);
    
    if (agnosticValidation.errors.length > 0) {
      hasErrors = true;
      agnosticValidation.errors.forEach(error => {
        console.log(chalk.red(`  ✗ ${error}`));
      });
    } else if (agnosticValidation.warnings.length > 0) {
      hasWarnings = true;
      agnosticValidation.warnings.forEach(warning => {
        console.log(chalk.yellow(`  ⚠ ${warning}`));
      });
    } else {
      console.log(chalk.green('  ✓ No project-specific content detected'));
    }
    console.log();

    // 4. Validate documentation
    console.log(chalk.bold('4. Documentation'));
    const docValidation = validateModuleDocumentation(module);

    if (docValidation.errors.length > 0) {
      hasErrors = true;
      docValidation.errors.forEach(error => {
        console.log(chalk.red(`  ✗ ${error}`));
      });
    } else {
      console.log(chalk.green('  ✓ Documentation is complete'));
    }

    if (docValidation.warnings.length > 0) {
      hasWarnings = true;
      docValidation.warnings.forEach(warning => {
        console.log(chalk.yellow(`  ⚠ ${warning}`));
      });
    }
    console.log();

    // 5. Validate character count
    console.log(chalk.bold('4. Character Count'));
    const actualCount = calculateModuleCharacterCount(module.path);
    const declaredCount = module.metadata.augment?.characterCount;
    const sizeCategory = getModuleSizeCategory(actualCount);
    
    console.log(chalk.gray(`  Actual: ${actualCount.toLocaleString()} characters`));
    if (declaredCount !== undefined) {
      console.log(chalk.gray(`  Declared: ${declaredCount.toLocaleString()} characters`));
      
      const diff = Math.abs(actualCount - declaredCount);
      const diffPercent = (diff / actualCount) * 100;
      
      if (diffPercent > 5) {
        hasWarnings = true;
        console.log(chalk.yellow(`  ⚠ Character count mismatch: ${diff.toLocaleString()} characters (${diffPercent.toFixed(1)}% difference)`));
        console.log(chalk.yellow(`    Update module.json with: "characterCount": ${actualCount}`));
      } else {
        console.log(chalk.green('  ✓ Character count matches declaration'));
      }
    } else {
      hasWarnings = true;
      console.log(chalk.yellow('  ⚠ Character count not declared in module.json'));
      console.log(chalk.yellow(`    Add to module.json: "augment": { "characterCount": ${actualCount} }`));
    }
    
    console.log(chalk.gray(`  Size category: ${sizeCategory}`));
    
    if (sizeCategory === 'too-large') {
      hasWarnings = true;
      console.log(chalk.yellow(`  ⚠ Module exceeds recommended size (${CHARACTER_LIMITS.MODULE_LARGE.toLocaleString()} characters)`));
      console.log(chalk.yellow('    Consider splitting into multiple modules'));
    }
    console.log();

    // 6. Verbose output
    if (options.verbose) {
      console.log(chalk.bold('6. Module Details'));
      console.log(chalk.gray(`  Name: ${module.metadata.name}`));
      console.log(chalk.gray(`  Version: ${module.metadata.version}`));
      console.log(chalk.gray(`  Type: ${module.metadata.type}`));
      console.log(chalk.gray(`  Rules: ${module.rules.length} file(s)`));
      module.rules.forEach(rule => {
        console.log(chalk.gray(`    - ${rule}`));
      });
      console.log(chalk.gray(`  Examples: ${module.examples.length} file(s)`));
      module.examples.forEach(example => {
        console.log(chalk.gray(`    - ${example}`));
      });
      console.log();
    }

    // Summary
    console.log(chalk.bold('Summary'));
    if (hasErrors) {
      console.log(chalk.red('✗ Validation failed with errors'));
      process.exit(1);
    } else if (hasWarnings) {
      console.log(chalk.yellow('⚠ Validation passed with warnings'));
    } else {
      console.log(chalk.green('✓ All validations passed'));
    }
    console.log();

  } catch (error) {
    console.error(chalk.red('Error validating module:'), error);
    process.exit(1);
  }
}

