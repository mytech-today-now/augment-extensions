import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { InteractivePrompt } from './interactive-prompt';
import {
  detectDecisionHostAvailability,
  runDecisionOperation,
  runDecisionOperationResult,
  type DecisionHostAvailability,
  type DecisionOptions
} from './decision-runner';

type JevChoice = 'skip' | 'offline' | 'automatic' | 'live' | 'automatic-live';
type JsonRecord = Record<string, any>;

const DEFAULT_POLICY = { model: 'jev-1.14.0', requestLimit: 12 };
const LIVE_PROBE = {
  capability: 'classify',
  dataClass: 'public',
  state: {
    goal: 'Classify this synthetic application report',
    revision: 0,
    evidence: ['A synthetic demo application exits during startup.'],
    completed: [],
    issues: [],
    constraints: [],
    capabilities: []
  },
  candidates: [
    { id: 'bug', description: 'Unexpected application failure' },
    { id: 'feature', description: 'Request for new functionality' }
  ]
};

export interface JevGateSummary {
  offlineRuntime: string;
  credential: string;
  hostCli: string;
  registration: string;
  mcp: string;
  live: string;
  ordinaryChat: string;
}

function asRecord(value: unknown): JsonRecord | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : undefined;
}

function labelFor(host: string): string {
  return host === 'codex' ? 'Codex' : 'Claude Code';
}

export function parseJevRequestCeiling(value: unknown, limit: number, alreadyUsed = 0): { value?: number; error?: string } {
  if (typeof value !== 'string' || !/^[0-9]+$/.test(value.trim())) return { error: 'Enter a whole number using digits only.' };
  const count = Number(value.trim());
  if (!Number.isSafeInteger(count) || count < 1) return { error: 'The request ceiling must be a positive integer.' };
  if (count > limit) return { error: `The request ceiling cannot exceed this project policy limit of ${limit}.` };
  if (alreadyUsed > 0 && count <= alreadyUsed) return { error: `The cumulative ceiling must exceed the ${alreadyUsed} request reservations already used. Existing usage is retained.` };
  return { value: count };
}

function requestLimit(doctor?: JsonRecord): number {
  const value = doctor?.requestLimit;
  return Number.isSafeInteger(value) && value > 0 && value <= 100 ? value : DEFAULT_POLICY.requestLimit;
}

function requestsUsed(doctor?: JsonRecord): number {
  const value = doctor?.automatic?.requestsUsed;
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

async function promptCeiling(
  promptApi: InteractivePrompt,
  message: string,
  limit: number,
  alreadyUsed = 0
): Promise<number | null> {
  for (;;) {
    const answer = await promptApi.prompt<{ requests?: unknown }>([{ type: 'input', name: 'requests', message: `${message} (positive integer, maximum ${limit}; blank is invalid):` }]);
    const parsed = parseJevRequestCeiling(answer.requests, limit, alreadyUsed);
    if (parsed.value !== undefined) return parsed.value;
    console.log(`Invalid request ceiling. ${parsed.error}`);
    const { action } = await promptApi.prompt<{ action?: string }>([{ type: 'list', name: 'action', message: 'What would you like to do?', choices: [
      { name: 'Enter the ceiling again', value: 'retry' },
      { name: 'Cancel Jev setup', value: 'cancel' }
    ] }]);
    if (action !== 'retry') return null;
  }
}

function initialSummary(credentialAvailable: boolean): JevGateSummary {
  return {
    offlineRuntime: 'NOT VERIFIED',
    credential: credentialAvailable ? 'AVAILABLE' : 'MISSING',
    hostCli: 'NOT SELECTED',
    registration: 'NOT VERIFIED',
    mcp: 'NOT VERIFIED',
    live: 'NOT VERIFIED',
    ordinaryChat: 'NOT VERIFIED'
  };
}

function printSummary(summary: JevGateSummary, nextSteps: string[] = []): void {
  console.log('\nJev / TypeSafe gate summary');
  console.log(`- Offline runtime setup: ${summary.offlineRuntime}`);
  console.log(`- TYPESAFE_API_KEY availability: ${summary.credential}`);
  console.log(`- Selected host CLI availability: ${summary.hostCli}`);
  console.log(`- Project registration integrity: ${summary.registration}`);
  console.log(`- Host MCP server health (local): ${summary.mcp}`);
  console.log(`- Live provider response: ${summary.live}`);
  console.log(`- Ordinary-chat model selection: ${summary.ordinaryChat}`);
  for (const step of nextSteps) console.log(`Next step: ${step}`);
}

function describeHosts(hosts: DecisionHostAvailability[]): void {
  console.log('\nSupported host CLI status');
  for (const host of hosts) {
    console.log(`- ${labelFor(host.host)}: ${host.state}. ${host.diagnostic}`);
    if (host.nextStep) console.log(`  ${host.nextStep}`);
  }
}

function hostFor(hosts: DecisionHostAvailability[], host: string): DecisionHostAvailability | undefined {
  return hosts.find(item => item.host === host);
}

function doctorSummary(doctor: JsonRecord | undefined, summary: JevGateSummary): void {
  if (!doctor) return;
  if (typeof doctor.softwareInstalled === 'boolean') summary.offlineRuntime = doctor.softwareInstalled ? 'VERIFIED' : 'NOT VERIFIED';
  const automatic = asRecord(doctor.automatic);
  if (automatic?.enabled === true) {
    summary.registration = automatic.registrationIntact === true ? 'VERIFIED' : 'NOT VERIFIED';
    const health = asRecord(doctor.mcpHealth);
    summary.mcp = typeof health?.state === 'string' ? health.state : 'NOT VERIFIED';
  } else if (automatic?.enabled === false) {
    summary.registration = 'NOT CONFIGURED';
    summary.mcp = 'NOT CONFIGURED';
  }
}

function addEnvironmentNextStep(summary: JevGateSummary, nextSteps: string[]): void {
  if (summary.credential === 'MISSING') {
    nextSteps.push('Configure TYPESAFE_API_KEY in the shell or secret manager that launches Augx, then rerun init for provider features. Never paste the key into a prompt or chat.');
  }
  if (summary.registration === 'VERIFIED' || summary.mcp === 'HEALTHY') {
    nextSteps.push('Trust this project and restart the selected host. Approve its project MCP server if requested. These checks do not verify ordinary-chat tool selection.');
  }
  if (summary.live !== 'VERIFIED') nextSteps.push('A live TypeSafe response remains NOT VERIFIED until a confirmed synthetic probe completes.');
}

function manualRepairSteps(hosts: DecisionHostAvailability[]): string[] {
  return hosts.filter(host => host.state !== 'AVAILABLE').map(host => `${labelFor(host.host)}: ${host.diagnostic} ${host.nextStep || 'Repair it manually, then rerun augx init.'}`);
}

async function confirm(promptApi: InteractivePrompt, message: string): Promise<boolean> {
  const { confirmed } = await promptApi.prompt<{ confirmed?: boolean }>([{ type: 'confirm', name: 'confirmed', message, default: false }]);
  if (confirmed !== true) console.log('Jev setup cancelled. Base Augx initialization will continue.');
  return confirmed === true;
}

async function installSetup(
  promptApi: InteractivePrompt,
  project: string,
  host: 'codex' | 'claude-code' | 'none',
  automatic: boolean,
  requests?: number,
  dataClasses?: string
): Promise<{ code: number; result?: JsonRecord }> {
  const options: DecisionOptions = { project, host, automatic, ...(requests === undefined ? {} : { requests: String(requests) }), ...(dataClasses ? { dataClasses } : {}) };
  const planned = await runDecisionOperationResult('setup', { ...options, dryRun: true });
  if (planned.code !== 0) return { code: planned.code };
  const proceed = await confirm(promptApi, automatic
    ? `Install the planned project-scoped runtime and enable ${dataClasses} provider data for ${labelFor(host)} automatic chat? No provider request will run during setup.`
    : 'Install the planned offline decision runtime in this project? No provider request or host registration will run.');
  if (!proceed) return { code: 130 };
  const installed = await runDecisionOperationResult('setup', options);
  return { code: installed.code, result: asRecord(installed.result) };
}

/** Run optional Jev setup after base init. Every provider and host gate is independent of base initialization. */
export async function runJevInitOnboarding(promptApi: InteractivePrompt | null, project = process.cwd()): Promise<void> {
  const summary = initialSummary(Boolean(process.env.TYPESAFE_API_KEY?.trim()));
  const nextSteps: string[] = [];
  if (!promptApi) {
    nextSteps.push('Rerun augx init in an interactive terminal to review the optional Jev setup choices.');
    addEnvironmentNextStep(summary, nextSteps);
    printSummary(summary, nextSteps);
    return;
  }

  try {
    console.log('\nOptional Jev / TypeSafe setup');
    console.log('Automatic chat and a one-time live probe have separate consent and request ceilings. Secrets and restricted data are prohibited.');
    const { choice } = await promptApi.prompt<{ choice?: JevChoice }>([{ type: 'list', name: 'choice', message: 'Choose an optional Jev setup path:', choices: [
      { name: 'Leave Jev unconfigured', value: 'skip' },
      { name: 'Install offline capability only', value: 'offline' },
      { name: 'Configure automatic chat judgments', value: 'automatic' },
      { name: 'Run a one-time live provider verification', value: 'live' },
      { name: 'Configure automatic chat and request one live verification', value: 'automatic-live' }
    ] }]);

    if (!choice || choice === 'skip') {
      nextSteps.push('Jev onboarding was skipped. Rerun augx init when you want to configure it.');
      addEnvironmentNextStep(summary, nextSteps);
      printSummary(summary, nextSteps);
      return;
    }

    let selectedChoice: JevChoice = choice;
    let selectedHost: 'codex' | 'claude-code' | 'none' = 'none';
    let selectedHostState: DecisionHostAvailability | undefined;
    let hosts: DecisionHostAvailability[] = [];
    if (choice === 'automatic' || choice === 'automatic-live') {
      hosts = detectDecisionHostAvailability();
      describeHosts(hosts);
      const available = hosts.filter(host => host.state === 'AVAILABLE');
      if (available.length === 0) {
        console.log('No supported host CLI is available for automatic registration. Project-global host software will not be installed or changed.');
        const choices = [
          ...(choice === 'automatic-live' ? [{ name: 'Continue with the one-time probe only, without automatic chat', value: 'live' }] : []),
          { name: 'Continue with offline capability only', value: 'offline' },
          { name: 'Show manual repair steps and stop Jev setup', value: 'repair' },
          { name: 'Cancel Jev setup', value: 'cancel' }
        ];
        const { recovery } = await promptApi.prompt<{ recovery?: string }>([{ type: 'list', name: 'recovery', message: 'Choose how to handle the unavailable host CLIs:', choices }]);
        if (recovery === 'repair') {
          nextSteps.push(...manualRepairSteps(hosts));
          addEnvironmentNextStep(summary, nextSteps);
          printSummary(summary, nextSteps);
          return;
        }
        if (recovery === 'cancel' || !recovery) {
          nextSteps.push('Jev setup was cancelled. Rerun augx init after repairing a host or choose offline capability.');
          addEnvironmentNextStep(summary, nextSteps);
          printSummary(summary, nextSteps);
          return;
        }
        selectedChoice = recovery as JevChoice;
      } else {
        const { host } = await promptApi.prompt<{ host?: string }>([{ type: 'list', name: 'host', message: 'Select an available project host for automatic chat registration:', choices: [
          ...available.map(item => ({ name: `${labelFor(item.host)}: ${item.diagnostic}`, value: item.host })),
          ...(choice === 'automatic-live' ? [{ name: 'Continue with the one-time probe only, without automatic chat', value: 'live' }] : []),
          { name: 'Continue with offline capability only', value: 'offline' },
          { name: 'Show manual repair steps and stop Jev setup', value: 'repair' },
          { name: 'Cancel Jev setup', value: 'cancel' }
        ] }]);
        if (host === 'repair') {
          nextSteps.push(...manualRepairSteps(hosts));
          addEnvironmentNextStep(summary, nextSteps);
          printSummary(summary, nextSteps);
          return;
        }
        if (host === 'cancel' || !host) {
          nextSteps.push('Jev setup was cancelled. Base Augx initialization will continue.');
          addEnvironmentNextStep(summary, nextSteps);
          printSummary(summary, nextSteps);
          return;
        }
        if (host === 'offline' || host === 'live') selectedChoice = host;
        else {
          selectedHost = host as 'codex' | 'claude-code';
          selectedHostState = hostFor(available, selectedHost);
        }
      }
    }

    const needsProvider = selectedChoice === 'automatic' || selectedChoice === 'live' || selectedChoice === 'automatic-live';
    if (needsProvider && summary.credential === 'MISSING') {
      console.log('TYPESAFE_API_KEY is not available in this process environment. No provider request will be attempted.');
      const { recovery } = await promptApi.prompt<{ recovery?: string }>([{ type: 'list', name: 'recovery', message: 'Choose how to continue:', choices: [
        { name: 'Continue with offline capability only', value: 'offline' },
        { name: 'Configure the key in a shell or secret manager, then rerun init', value: 'configure' },
        { name: 'Cancel Jev setup', value: 'cancel' }
      ] }]);
      if (recovery === 'offline') {
        selectedChoice = 'offline';
        selectedHost = 'none';
        selectedHostState = undefined;
      }
      else {
        nextSteps.push('Set TYPESAFE_API_KEY in the shell or secret manager that launches Augx, then rerun init. Never paste the key into a prompt or chat.');
        printSummary(summary, nextSteps);
        return;
      }
    }

    const preflight = await runDecisionOperationResult('doctor', { project });
    const doctor = preflight.code === 0 ? asRecord(preflight.result) : undefined;
    const limit = requestLimit(doctor);
    const automatic = selectedChoice === 'automatic' || selectedChoice === 'automatic-live';
    const live = selectedChoice === 'live' || selectedChoice === 'automatic-live';
    let automaticCeiling: number | undefined;
    let dataClasses: string | undefined;
    let probeCeiling: number | undefined;

    if (automatic) {
      automaticCeiling = await promptCeiling(promptApi, `Total cumulative automatic-chat request ceiling; ${requestsUsed(doctor)} reservations are already used`, limit, requestsUsed(doctor)) || undefined;
      if (automaticCeiling === undefined) {
        nextSteps.push('Automatic chat was not enabled because no valid cumulative ceiling was approved.');
        doctorSummary(doctor, summary);
        addEnvironmentNextStep(summary, nextSteps);
        printSummary(summary, nextSteps);
        return;
      }
      const { scope } = await promptApi.prompt<{ scope?: string }>([{ type: 'list', name: 'scope', message: 'Select the data classes automatic chat may send to TypeSafe:', choices: [
        { name: 'De-identified public context only', value: 'public' },
        { name: 'De-identified public and internal context, with separate explicit internal consent', value: 'public,internal' }
      ] }]);
      if (!scope || !['public', 'public,internal'].includes(scope)) {
        nextSteps.push('Automatic chat was not enabled because no supported data scope was selected.');
        doctorSummary(doctor, summary);
        printSummary(summary, nextSteps);
        return;
      }
      dataClasses = scope;
      console.log(`Automatic data scope: ${scope}. Eligible classification and retrieval-ranking context only. Secrets and restricted data remain prohibited. Existing request reservations and host settings are retained.`);
      if (!await confirm(promptApi, `Consent to send ${scope} context to TypeSafe for eligible ${labelFor(selectedHost)} ordinary-chat judgments, within a cumulative ceiling of ${automaticCeiling} requests?`)) {
        doctorSummary(doctor, summary);
        printSummary(summary, nextSteps);
        return;
      }
    }

    if (live) {
      probeCeiling = await promptCeiling(promptApi, 'Separate one-time synthetic probe request ceiling', limit) || undefined;
      if (probeCeiling === undefined) {
        nextSteps.push('No live probe was attempted because no valid probe ceiling was approved.');
        doctorSummary(doctor, summary);
        printSummary(summary, nextSteps);
        return;
      }
    }

    const setup = await installSetup(promptApi, project, selectedHost, automatic, automaticCeiling, dataClasses);
    if (setup.code !== 0 || setup.result?.softwareInstalled !== true) {
      summary.offlineRuntime = 'NOT VERIFIED';
      summary.hostCli = selectedHostState ? `${selectedHostState.state}: ${selectedHostState.diagnostic}` : 'NOT SELECTED';
      nextSteps.push('Decision-layer setup did not complete. Inspect its safe diagnostic and rerun augx init after resolving the project-local issue.');
      addEnvironmentNextStep(summary, nextSteps);
      printSummary(summary, nextSteps);
      return;
    }

    summary.offlineRuntime = setup.result.softwareInstalled === true && setup.result.configurationValid === true ? 'VERIFIED' : 'NOT VERIFIED';
    summary.credential = setup.result.credentialsAvailable === true ? 'AVAILABLE' : 'MISSING';
    if (selectedHostState) {
      const after = detectDecisionHostAvailability();
      selectedHostState = hostFor(after, selectedHost) || selectedHostState;
      summary.hostCli = `${selectedHostState.state}: ${selectedHostState.diagnostic}`;
    }
    const afterInstall = await runDecisionOperationResult('doctor', { project });
    const afterDoctor = afterInstall.code === 0 ? asRecord(afterInstall.result) : undefined;
    doctorSummary(afterDoctor, summary);
    if (automatic && summary.registration !== 'VERIFIED') {
      nextSteps.push('Automatic chat registration integrity is NOT VERIFIED. Do not treat the selected host as activated; inspect the project doctor output and rerun setup after resolving it.');
    }

    if (live && probeCeiling !== undefined) {
      console.log(`\nOne-time TypeSafe live probe`);
      console.log(`Model: ${afterDoctor?.model || doctor?.model || DEFAULT_POLICY.model}`);
      console.log(`Maximum provider requests: ${probeCeiling}. SDK retries are disabled. Any reserved failed attempt remains consumed.`);
      console.log('Destination: TypeSafe. This synthetic de-identified sample is the only project data in the provider input. No project files, chat history, credential values, or hidden reasoning are included. The SDK uses the environment key for authentication only.');
      console.log(JSON.stringify(LIVE_PROBE, null, 2));
      if (afterDoctor?.softwareInstalled !== true || afterDoctor.configurationValid !== true) {
        summary.live = 'NOT VERIFIED';
        nextSteps.push('The decision runtime or project policy failed its post-setup doctor check. No provider request was made.');
      } else if (summary.credential !== 'AVAILABLE' || !process.env.TYPESAFE_API_KEY?.trim()) {
        summary.credential = 'MISSING';
        nextSteps.push('The credential became unavailable before the live probe. Configure it locally and rerun init; no provider request was made.');
      } else if (await confirm(promptApi, `Send this synthetic sample to TypeSafe using the selected model, with a maximum of ${probeCeiling} provider requests?`)) {
        const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'augx-init-jev-'));
        const inputPath = path.join(directory, 'synthetic-probe.json');
        const id = `init-probe-${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}`;
        try {
          fs.writeFileSync(inputPath, JSON.stringify(LIVE_PROBE, null, 2), { mode: 0o600, flag: 'wx' });
          const liveCode = await runDecisionOperation('decide', {
            project, input: inputPath, live: true, requests: String(probeCeiling), id, providerDataConsent: true
          });
          summary.live = liveCode === 0 ? 'VERIFIED' : 'NOT VERIFIED';
          if (liveCode !== 0) nextSteps.push('The live provider response was NOT VERIFIED. Provider failures consume their reserved request; inspect the redacted decision diagnostic.');
        } finally {
          fs.rmSync(directory, { recursive: true, force: true });
        }
      } else {
        nextSteps.push('The final live-probe confirmation was declined. No provider request was made.');
      }
    }

    addEnvironmentNextStep(summary, nextSteps);
    printSummary(summary, nextSteps);
  } catch (error) {
    console.error(`Jev onboarding stopped safely: ${error instanceof Error ? error.message : 'unexpected setup error'}`);
    nextSteps.push('Jev gates remain NOT VERIFIED. Base Augx initialization will continue; rerun init after inspecting the diagnostic.');
    addEnvironmentNextStep(summary, nextSteps);
    printSummary(summary, nextSteps);
  }
}
