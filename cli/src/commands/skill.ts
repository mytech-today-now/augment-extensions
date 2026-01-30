/**
 * Skill Commands
 * 
 * Commands for managing and using skills.
 */

import chalk from 'chalk';
import {
  discoverSkills,
  findSkill,
  validateSkillMetadata,
  Skill
} from '../utils/skill-system';

/**
 * List all available skills
 */
export async function skillListCommand(options: { category?: string; json?: boolean } = {}): Promise<void> {
  try {
    const skills = discoverSkills();
    
    if (skills.length === 0) {
      console.log(chalk.yellow('No skills found'));
      return;
    }
    
    // Filter by category if specified
    const filteredSkills = options.category
      ? skills.filter(s => s.metadata.category === options.category)
      : skills;
    
    if (options.json) {
      console.log(JSON.stringify(filteredSkills.map(s => s.metadata), null, 2));
      return;
    }
    
    // Group by category
    const byCategory = filteredSkills.reduce((acc, skill) => {
      const cat = skill.metadata.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);
    
    console.log(chalk.blue('\n📦 Available Skills\n'));
    
    for (const [category, categorySkills] of Object.entries(byCategory)) {
      console.log(chalk.cyan(`\n${category.toUpperCase()}`));
      console.log(chalk.gray('─'.repeat(50)));
      
      for (const skill of categorySkills) {
        const { id, name, version, tokenBudget, tags } = skill.metadata;
        console.log(`  ${chalk.green(id)} (v${version})`);
        console.log(`    ${name}`);
        console.log(`    Tokens: ${tokenBudget} | Tags: ${tags?.join(', ') || 'none'}`);
      }
    }
    
    console.log(chalk.gray('\n' + '─'.repeat(50)));
    console.log(chalk.blue(`Total: ${filteredSkills.length} skills\n`));
  } catch (error) {
    console.error(chalk.red(`Error listing skills: ${error}`));
    process.exit(1);
  }
}

/**
 * Show details of a specific skill
 */
export async function skillShowCommand(skillId: string, options: { json?: boolean } = {}): Promise<void> {
  try {
    const skill = findSkill(skillId);
    
    if (!skill) {
      console.error(chalk.red(`Skill not found: ${skillId}`));
      process.exit(1);
    }
    
    if (options.json) {
      console.log(JSON.stringify({ metadata: skill.metadata, content: skill.content }, null, 2));
      return;
    }
    
    const { metadata, content } = skill;
    
    console.log(chalk.blue(`\n📄 ${metadata.name} (${metadata.id})\n`));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`Version:      ${metadata.version}`);
    console.log(`Category:     ${metadata.category}`);
    console.log(`Token Budget: ${metadata.tokenBudget}`);
    console.log(`Priority:     ${metadata.priority || 'medium'}`);
    
    if (metadata.tags && metadata.tags.length > 0) {
      console.log(`Tags:         ${metadata.tags.join(', ')}`);
    }
    
    if (metadata.dependencies && metadata.dependencies.length > 0) {
      console.log(`Dependencies: ${metadata.dependencies.join(', ')}`);
    }
    
    if (metadata.cliCommand) {
      console.log(`CLI Command:  ${metadata.cliCommand}`);
    }
    
    if (metadata.mcpServer) {
      console.log(`MCP Server:   ${metadata.mcpServer}`);
    }
    
    console.log(chalk.gray('\n' + '─'.repeat(50)));
    console.log(chalk.cyan('\nContent:\n'));
    console.log(content);
  } catch (error) {
    console.error(chalk.red(`Error showing skill: ${error}`));
    process.exit(1);
  }
}

/**
 * Validate a skill file
 */
export async function skillValidateCommand(skillId: string): Promise<void> {
  try {
    const skill = findSkill(skillId);
    
    if (!skill) {
      console.error(chalk.red(`Skill not found: ${skillId}`));
      process.exit(1);
    }
    
    const validation = validateSkillMetadata(skill.metadata);
    
    if (validation.valid) {
      console.log(chalk.green(`✓ Skill ${skillId} is valid`));
    } else {
      console.log(chalk.red(`✗ Skill ${skillId} has validation errors:`));
      for (const error of validation.errors) {
        console.log(chalk.red(`  - ${error}`));
      }
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red(`Error validating skill: ${error}`));
    process.exit(1);
  }
}

/**
 * Search for skills by tags or keywords
 */
export async function skillSearchCommand(query: string, options: { json?: boolean } = {}): Promise<void> {
  try {
    const skills = discoverSkills();
    const lowerQuery = query.toLowerCase();

    // Search in id, name, tags
    const results = skills.filter(skill => {
      const { id, name, tags } = skill.metadata;
      return (
        id.toLowerCase().includes(lowerQuery) ||
        name.toLowerCase().includes(lowerQuery) ||
        tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    });

    if (results.length === 0) {
      console.log(chalk.yellow(`No skills found matching: ${query}`));
      return;
    }

    if (options.json) {
      console.log(JSON.stringify(results.map(s => s.metadata), null, 2));
      return;
    }

    console.log(chalk.blue(`\n🔍 Search Results for "${query}"\n`));
    console.log(chalk.gray('─'.repeat(50)));

    for (const skill of results) {
      const { id, name, category, tokenBudget } = skill.metadata;
      console.log(`  ${chalk.green(id)} (${category})`);
      console.log(`    ${name}`);
      console.log(`    Tokens: ${tokenBudget}`);
      console.log('');
    }

    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.blue(`Found: ${results.length} skills\n`));
  } catch (error) {
    console.error(chalk.red(`Error searching skills: ${error}`));
    process.exit(1);
  }
}

/**
 * Execute a skill's CLI command
 */
export async function skillExecCommand(skillId: string, args: string[] = []): Promise<void> {
  try {
    const skill = findSkill(skillId);

    if (!skill) {
      console.error(chalk.red(`Skill not found: ${skillId}`));
      process.exit(1);
    }

    if (!skill.metadata.cliCommand) {
      console.error(chalk.red(`Skill ${skillId} does not have a CLI command defined`));
      process.exit(1);
    }

    console.log(chalk.blue(`Executing skill: ${skill.metadata.name}`));
    console.log(chalk.gray(`Command: ${skill.metadata.cliCommand} ${args.join(' ')}\n`));

    // Execute the CLI command
    const { spawn } = await import('child_process');
    const [command, ...baseArgs] = skill.metadata.cliCommand.split(' ');
    const allArgs = [...baseArgs, ...args];

    const child = spawn(command, allArgs, {
      stdio: 'inherit',
      shell: true
    });

    child.on('error', (error) => {
      console.error(chalk.red(`Failed to execute command: ${error.message}`));
      process.exit(1);
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        console.error(chalk.red(`Command exited with code ${code}`));
        process.exit(code || 1);
      }
    });
  } catch (error) {
    console.error(chalk.red(`Error executing skill: ${error}`));
    process.exit(1);
  }
}

/**
 * Inject a skill's content into the AI context
 */
export async function skillInjectCommand(skillId: string, options: { json?: boolean } = {}): Promise<void> {
  try {
    const skill = findSkill(skillId);

    if (!skill) {
      console.error(chalk.red(`Skill not found: ${skillId}`));
      process.exit(1);
    }

    if (options.json) {
      console.log(JSON.stringify({
        id: skill.metadata.id,
        name: skill.metadata.name,
        content: skill.content,
        tokenBudget: skill.metadata.tokenBudget
      }, null, 2));
      return;
    }

    // Output skill content for AI context injection
    console.log(chalk.blue(`\n# Skill: ${skill.metadata.name}\n`));
    console.log(chalk.gray(`ID: ${skill.metadata.id}`));
    console.log(chalk.gray(`Category: ${skill.metadata.category}`));
    console.log(chalk.gray(`Token Budget: ${skill.metadata.tokenBudget}\n`));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(skill.content);
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.green(`\n✓ Skill content ready for AI context injection`));
  } catch (error) {
    console.error(chalk.red(`Error injecting skill: ${error}`));
    process.exit(1);
  }
}

