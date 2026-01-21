/**
 * OpenSpec ↔ Coordination Sync Utility
 * 
 * Syncs OpenSpec specs with the coordination manifest.
 * Handles spec status changes, creation, and archival.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface SpecFrontmatter {
  id?: string;
  relatedTasks?: string[];
  relatedRules?: string[];
  status?: string;
  affectedFiles?: string[];
  dependencies?: string[];
}

interface CoordinationManifest {
  version: string;
  lastUpdated: string;
  specs: Record<string, any>;
  tasks: Record<string, any>;
  rules: Record<string, any>;
  files: Record<string, any>;
}

/**
 * Extract YAML frontmatter from markdown file
 */
export function extractFrontmatter(filePath: string): SpecFrontmatter | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return null;
  }
  
  try {
    return yaml.load(match[1]) as SpecFrontmatter;
  } catch (error) {
    console.error(`Failed to parse frontmatter in ${filePath}:`, error);
    return null;
  }
}

/**
 * Find all OpenSpec spec files
 */
export function findSpecFiles(baseDir: string = 'openspec'): string[] {
  const specFiles: string[] = [];
  
  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) {
      return;
    }
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        specFiles.push(fullPath);
      }
    }
  }
  
  // Check specs directory
  const specsDir = path.join(baseDir, 'specs');
  if (fs.existsSync(specsDir)) {
    walkDir(specsDir);
  }
  
  // Check changes directory
  const changesDir = path.join(baseDir, 'changes');
  if (fs.existsSync(changesDir)) {
    walkDir(changesDir);
  }
  
  return specFiles;
}

/**
 * Read coordination manifest
 */
export function readCoordinationManifest(manifestPath: string = '.augment/coordination.json'): CoordinationManifest {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Coordination manifest not found at ${manifestPath}`);
  }
  
  return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
}

/**
 * Write coordination manifest
 */
export function writeCoordinationManifest(manifest: CoordinationManifest, manifestPath: string = '.augment/coordination.json'): void {
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

/**
 * Sync OpenSpec specs to coordination manifest
 */
export function syncOpenSpecToCoordination(
  openspecDir: string = 'openspec',
  manifestPath: string = '.augment/coordination.json'
): { added: number; updated: number; removed: number } {
  const specFiles = findSpecFiles(openspecDir);
  const manifest = readCoordinationManifest(manifestPath);
  
  let added = 0;
  let updated = 0;
  let removed = 0;
  
  // Track which spec IDs exist in OpenSpec
  const openspecIds = new Set<string>();
  
  // Update or add specs from OpenSpec
  for (const specFile of specFiles) {
    const frontmatter = extractFrontmatter(specFile);
    
    if (!frontmatter || !frontmatter.id) {
      continue; // Skip files without frontmatter or ID
    }
    
    const specId = frontmatter.id;
    openspecIds.add(specId);
    
    const existingSpec = manifest.specs[specId];
    
    if (!existingSpec) {
      // Add new spec
      manifest.specs[specId] = {
        path: specFile,
        status: frontmatter.status || 'active',
        relatedTasks: frontmatter.relatedTasks || [],
        relatedRules: frontmatter.relatedRules || [],
        affectedFiles: frontmatter.affectedFiles || [],
        dependencies: frontmatter.dependencies || []
      };
      added++;
    } else {
      // Update existing spec
      let hasChanges = false;
      
      if (existingSpec.status !== (frontmatter.status || 'active')) {
        existingSpec.status = frontmatter.status || 'active';
        hasChanges = true;
      }
      
      if (hasChanges) {
        updated++;
      }
    }
  }
  
  // Update lastUpdated timestamp
  manifest.lastUpdated = new Date().toISOString();
  
  writeCoordinationManifest(manifest, manifestPath);
  
  return { added, updated, removed };
}

