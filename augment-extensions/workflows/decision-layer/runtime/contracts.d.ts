export type Mode = 'offline' | 'live';
export type Question = { type: 'choice'; instructions: string; criteria: Record<string, string> } | { type: 'score'; instructions: string; criteria: readonly [string, string, ...string[]] } | { type: 'noul'; instructions: string };
export type Answer = { type: 'choice'; choice: string; confidence: number; probabilities: Record<string, number> } | { type: 'score'; score: number; confidence: number; probabilities: Record<string, number>; legend: Record<string, string> } | { type: 'noul'; noul: number };
export interface State { goal: string; revision: number; evidence: unknown[]; completed: unknown[]; issues: unknown[]; constraints: string[]; capabilities: string[] }
export interface WorkerRegistration { id: string; description: string; capabilities: string[]; available: boolean; modulePath: string; sha256: string; requestsPerAttempt?: number }
export interface WorkerContext { task: { id: string; goal: string; kind: string }; sources: { path: string; sha256: string; content: string }[]; worker: string }
export interface Task { id: string; goal: string; kind: 'research' | 'write' | 'review'; capabilities: string[]; sources: string[]; acceptance: { minBytes: number; contains: string[] } }
export interface Verification { passed: boolean; reason: string; sha256?: string; bytes?: number }
export interface AutomaticPolicy {
  enabled: boolean;
  host: 'codex' | 'claude-code';
  capabilities: ('classify' | 'rank-retrieval')[];
  dataClasses: ('public' | 'internal')[];
  requests: number;
  timeoutMs: number;
}
export type AutomaticResult = { status: 'fallback'; reason: string; next: string } | {
  status: 'judgment'; capability: 'classify' | 'rank-retrieval'; outcome: string;
  selected: string | string[]; answers: Record<string, Answer>; model: string;
  provenance: 'typesafe-sdk-0.7.0'; requestsUsed: number; next: string;
};
