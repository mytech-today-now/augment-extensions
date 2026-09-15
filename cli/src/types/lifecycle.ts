export type LifecycleStatus =
  | 'not-installed'
  | 'installation-detected'
  | 'installation-in-progress'
  | 'installation-completed'
  | 'installation-partially-completed'
  | 'installation-failed'
  | 'upgrade-available'
  | 'upgrade-in-progress'
  | 'rollback-available'
  | 'rollback-in-progress'
  | 'uninstallation-pending-confirmation'
  | 'uninstallation-in-progress'
  | 'uninstallation-partially-completed'
  | 'uninstallation-completed'
  | 'diagnostic-analysis-in-progress'
  | 'repair-available'
  | 'repair-in-progress'
  | 'recovery-required';

export type LifecycleSeverity = 'critical' | 'high' | 'medium' | 'low' | 'warning' | 'info';

export type LifecycleOperationName =
  | 'init'
  | 'update'
  | 'upgrade'
  | 'migrate'
  | 'self-remove'
  | 'repair'
  | 'rollback'
  | 'diagnose'
  | 'report';

export type LifecycleOperationStatus = 'running' | 'succeeded' | 'failed';

export type LifecycleFixId =
  | 'recreate-config'
  | 'restore-backup'
  | 'reinstall-core-rules'
  | 'rebuild-command-help'
  | 'restore-ai-prompts-directory'
  | 'rebuild-ai-prompts-archive'
  | 'refresh-artifact';

export interface LifecycleOperation {
  name: LifecycleOperationName;
  status: LifecycleOperationStatus;
  startedAt: string;
  finishedAt?: string;
  error?: string;
}

export interface LifecycleIssue {
  id: string;
  severity: LifecycleSeverity;
  title: string;
  message: string;
  evidence: string[];
  path?: string;
  blocksLifecycle: boolean;
  recommendedSolution: string;
  riskLevel: 'low' | 'medium' | 'high';
  reversible: boolean;
  requiredPermissions: string[];
  confirmationRequired: boolean;
  expectedResult: string;
  safeFix?: LifecycleFixId;
}

export interface LifecycleBackupFile {
  path: string;
  checksum: string;
  size: number;
}

export interface LifecycleBackup {
  id: string;
  createdAt: string;
  reason: string;
  path: string;
  files: LifecycleBackupFile[];
}

export interface LifecycleArchive {
  id: string;
  createdAt: string;
  path: string;
  checksum: string;
  source: string;
}

export interface LifecycleArtifact {
  schemaVersion: 1;
  application: {
    name: string;
    version: string;
  };
  projectRoot: string;
  status: LifecycleStatus;
  createdAt: string;
  updatedAt: string;
  lastOperation: LifecycleOperation;
  extensionsConfig: {
    version?: string;
    modules: Array<Record<string, unknown>>;
    settings?: Record<string, unknown>;
    [key: string]: unknown;
  };
  backups: LifecycleBackup[];
  archives: LifecycleArchive[];
  issues: LifecycleIssue[];
  notes?: string[];
}

export interface LifecycleSnapshot {
  status: LifecycleStatus;
  issues: LifecycleIssue[];
  repairableIssues: LifecycleIssue[];
  upgradeAvailable: boolean;
  rollbackAvailable: boolean;
  backupCount: number;
  archiveCount: number;
  installedModuleCount: number;
  artifact: LifecycleArtifact;
}
