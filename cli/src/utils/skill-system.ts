/**
 * Skill System Utilities
 * 
 * Manages skill file structure, storage, and validation.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

export interface SkillMetadata {
  id: string;
  name: string;
  version: string;
  category: 'retrieval' | 'transformation' | 'analysis' | 'generation' | 'integration' | 'utility';
  tags?: string[];
  tokenBudget: number;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  dependencies?: string[];
  cliCommand?: string;
  mcpServer?: string;
  autoLoad?: boolean;
  replaces?: string[];
}

export interface Skill {
  metadata: SkillMetadata;
  content: string;
  filePath: string;
}

export const SKILL_CATEGORIES = [
  'retrieval',
  'transformation',
  'analysis',
  'generation',
  'integration',
  'utility'
] as const;

/**
 * Get the skills directory path
 */
export function getSkillsDir(repoRoot?: string): string {
  const root = repoRoot || process.cwd();
  return path.join(root, 'skills');
}

/**
 * Get the path for a skill file
 */
export function getSkillPath(skillId: string, category: string, repoRoot?: string): string {
  const skillsDir = getSkillsDir(repoRoot);
  return path.join(skillsDir, category, `${skillId}.md`);
}

/**
 * Parse skill frontmatter and content
 */
export function parseSkill(filePath: string): Skill {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    throw new Error(`Invalid skill file: ${filePath} - Missing frontmatter`);
  }
  
  const frontmatter = frontmatterMatch[1];
  const body = frontmatterMatch[2];
  
  // Parse YAML frontmatter
  const metadata = yaml.load(frontmatter) as SkillMetadata;
  
  return {
    metadata,
    content: body,
    filePath
  };
}

/**
 * Validate skill metadata
 */
export function validateSkillMetadata(metadata: SkillMetadata): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!metadata.id) errors.push('Missing required field: id');
  if (!metadata.name) errors.push('Missing required field: name');
  if (!metadata.version) errors.push('Missing required field: version');
  if (!metadata.category) errors.push('Missing required field: category');
  if (!metadata.tokenBudget) errors.push('Missing required field: tokenBudget');
  
  // Validate category
  if (metadata.category && !SKILL_CATEGORIES.includes(metadata.category)) {
    errors.push(`Invalid category: ${metadata.category}. Must be one of: ${SKILL_CATEGORIES.join(', ')}`);
  }
  
  // Validate version format (semantic versioning)
  if (metadata.version && !/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/.test(metadata.version)) {
    errors.push(`Invalid version format: ${metadata.version}. Must follow semantic versioning (MAJOR.MINOR.PATCH)`);
  }
  
  // Validate token budget
  if (metadata.tokenBudget) {
    if (metadata.tokenBudget < 500) {
      errors.push('Token budget too low: minimum 500 tokens');
    }
    if (metadata.tokenBudget > 10000) {
      errors.push('Token budget too high: maximum 10000 tokens');
    }
  }
  
  // Validate priority
  if (metadata.priority && !['critical', 'high', 'medium', 'low'].includes(metadata.priority)) {
    errors.push(`Invalid priority: ${metadata.priority}. Must be one of: critical, high, medium, low`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Discover all skills in the skills directory
 */
export function discoverSkills(repoRoot?: string): Skill[] {
  const skillsDir = getSkillsDir(repoRoot);
  const skills: Skill[] = [];
  
  if (!fs.existsSync(skillsDir)) {
    return skills;
  }
  
  // Iterate through category directories
  for (const category of SKILL_CATEGORIES) {
    const categoryDir = path.join(skillsDir, category);
    
    if (!fs.existsSync(categoryDir)) {
      continue;
    }
    
    // Find all .md files in category
    const files = fs.readdirSync(categoryDir)
      .filter(f => f.endsWith('.md') && f !== 'README.md');
    
    for (const file of files) {
      const filePath = path.join(categoryDir, file);
      try {
        const skill = parseSkill(filePath);
        skills.push(skill);
      } catch (error) {
        console.warn(`Warning: Failed to parse skill ${filePath}: ${error}`);
      }
    }
  }
  
  return skills;
}

/**
 * Find a skill by ID
 */
export function findSkill(skillId: string, repoRoot?: string): Skill | null {
  const skills = discoverSkills(repoRoot);
  return skills.find(s => s.metadata.id === skillId) || null;
}

/**
 * Register skill in coordination manifest
 */
export function registerSkillInCoordination(skill: Skill, taskId?: string): void {
  const coordPath = path.join(process.cwd(), '.augment', 'coordination.json');

  if (!fs.existsSync(coordPath)) {
    console.warn('Coordination manifest not found. Skipping skill registration.');
    return;
  }

  const coordination = JSON.parse(fs.readFileSync(coordPath, 'utf-8'));

  // Add skill to files section
  if (!coordination.files) {
    coordination.files = {};
  }

  const relativePath = path.relative(process.cwd(), skill.filePath).replace(/\\/g, '/');

  coordination.files[relativePath] = {
    createdBy: taskId || 'skill-system',
    modifiedBy: [],
    governedBy: ['augment-extensions/spec'],
    rulesApplied: ['module-development.md']
  };

  // Update lastUpdated
  coordination.lastUpdated = new Date().toISOString();

  // Write back to file
  fs.writeFileSync(coordPath, JSON.stringify(coordination, null, 2));
}

