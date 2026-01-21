/**
 * File Association Tracking
 * 
 * Tracks which files are created/modified by which tasks.
 * Auto-updates coordination manifest on file changes.
 */

import * as fs from 'fs';
import { minimatch } from 'minimatch';

interface CoordinationManifest {
  version: string;
  lastUpdated: string;
  specs: Record<string, any>;
  tasks: Record<string, any>;
  rules: Record<string, any>;
  files: Record<string, FileEntry>;
}

interface FileEntry {
  createdBy: string | null;
  modifiedBy: string[];
  governedBy: string[];
  rulesApplied: string[];
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
 * Track file creation or modification
 */
export function trackFileChange(
  filePath: string,
  taskId: string,
  isNew: boolean = false,
  manifestPath: string = '.augment/coordination.json'
): void {
  const manifest = readCoordinationManifest(manifestPath);
  
  // Initialize file entry if it doesn't exist
  if (!manifest.files[filePath]) {
    manifest.files[filePath] = {
      createdBy: null,
      modifiedBy: [],
      governedBy: [],
      rulesApplied: []
    };
  }
  
  const fileEntry = manifest.files[filePath];
  
  // Track creation
  if (isNew) {
    fileEntry.createdBy = taskId;
  } else {
    // Track modification
    if (!fileEntry.modifiedBy.includes(taskId)) {
      fileEntry.modifiedBy.push(taskId);
    }
  }
  
  // Add to task's output files
  if (manifest.tasks[taskId]) {
    if (!manifest.tasks[taskId].outputFiles.includes(filePath)) {
      manifest.tasks[taskId].outputFiles.push(filePath);
    }
  }
  
  // Find governing specs
  const governingSpecs = Object.entries(manifest.specs)
    .filter(([id, spec]) => 
      spec.affectedFiles.some((pattern: string) => minimatch(filePath, pattern))
    )
    .map(([id]) => id);
  
  fileEntry.governedBy = governingSpecs;
  
  // Find applicable rules
  const applicableRules = Object.entries(manifest.rules)
    .filter(([name, rule]) =>
      rule.appliesTo.filePatterns.some((pattern: string) => minimatch(filePath, pattern))
    )
    .map(([name]) => name);
  
  fileEntry.rulesApplied = applicableRules;
  
  // Update timestamp
  manifest.lastUpdated = new Date().toISOString();
  
  writeCoordinationManifest(manifest, manifestPath);
}

/**
 * Track multiple file changes (batch operation)
 */
export function trackFileChanges(
  changes: Array<{ filePath: string; taskId: string; isNew: boolean }>,
  manifestPath: string = '.augment/coordination.json'
): void {
  const manifest = readCoordinationManifest(manifestPath);
  
  for (const change of changes) {
    const { filePath, taskId, isNew } = change;
    
    // Initialize file entry if it doesn't exist
    if (!manifest.files[filePath]) {
      manifest.files[filePath] = {
        createdBy: null,
        modifiedBy: [],
        governedBy: [],
        rulesApplied: []
      };
    }
    
    const fileEntry = manifest.files[filePath];
    
    // Track creation or modification
    if (isNew) {
      fileEntry.createdBy = taskId;
    } else {
      if (!fileEntry.modifiedBy.includes(taskId)) {
        fileEntry.modifiedBy.push(taskId);
      }
    }
    
    // Add to task's output files
    if (manifest.tasks[taskId]) {
      if (!manifest.tasks[taskId].outputFiles.includes(filePath)) {
        manifest.tasks[taskId].outputFiles.push(filePath);
      }
    }
    
    // Find governing specs
    const governingSpecs = Object.entries(manifest.specs)
      .filter(([id, spec]) => 
        spec.affectedFiles.some((pattern: string) => minimatch(filePath, pattern))
      )
      .map(([id]) => id);
    
    fileEntry.governedBy = governingSpecs;
    
    // Find applicable rules
    const applicableRules = Object.entries(manifest.rules)
      .filter(([name, rule]) =>
        rule.appliesTo.filePatterns.some((pattern: string) => minimatch(filePath, pattern))
      )
      .map(([name]) => name);
    
    fileEntry.rulesApplied = applicableRules;
  }
  
  // Update timestamp
  manifest.lastUpdated = new Date().toISOString();
  
  writeCoordinationManifest(manifest, manifestPath);
}

