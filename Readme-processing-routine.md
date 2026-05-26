# README Processing Routine

End-to-end workflow that converts a raw user prompt into a refined prompt, a JIRA ticket, an OpenSpec specification, a set of Beads tasks, and finally an executed batch run.

## Conventions

- **Action** steps are performed manually by the operator (file edits, command execution, copy-paste into an AI chat).
- **Prompt** steps contain text to send verbatim to the AI chat or agent. The contents of each fenced block are the literal prompt body.
- Placeholders use angle brackets and must be replaced before use:
  - `<USER_PROMPT>` - the operator's original request.
  - `<PROMPT_PATH>` - target path for the refined prompt, e.g. `path\to\prompt.md`.
  - `<JIRA_PATH>` - target path for the JIRA ticket, e.g. `path\to\prompt-JIRA.md`.
  - `<JIRA_TICKET_NAME>` - short identifier used as the OpenSpec change name and Beads tag.
  - `<BEAD_TASKS_PATH>` - target path for the human-readable task list, e.g. `path\to\file\bead-tasks.md`.

## Prerequisites

- Access to the AI chat/agent that will process each prompt.
- Local clone of this repository with `.\scripts\beads-helpers.ps1`, `.\scripts\beads-query.ps1`, and `.\scripts\proc-beads.ps1` present.
- Beads CLI (`bd`) installed and initialized in the repo.
- OpenSpec CLI (`OpenSpec`) installed and initialized in the repo.

## Steps

### Step 1 - Inject the raw prompt into the prompt-refiner template (Action)

Open the template at:

> https://github.com/mytech-today-now/prompt-refined/blob/main/highest-quality-most-effective-prompt-possible.md

Replace the literal token `[Insert the user's prompt here]` with `<USER_PROMPT>`. Copy the resulting full document to the clipboard.

### Step 2 - Run the refiner template through the AI (Action)

Paste the document from Step 1 into the AI chat/agent and submit it. Wait for the complete reply.

### Step 3 - Refine again and persist to disk (Action)

Submit the reply from Step 2 back into the AI chat/agent for a second pass. Save the final output to `<PROMPT_PATH>` (for example by redirecting the agent's file write, or by copy-pasting into the file).

The result on disk is the canonical refined prompt for the rest of the routine.

### Step 4 - Generate the JIRA ticket (Prompt)

```
generate a new JIRA ticket '<JIRA_PATH>' based on '<PROMPT_PATH>' so that the new file conforms to the current state of the repo. The new file should apply to this repo in its current state. be verbose and detailed, but not redundant. Provide many code correct, verbose examples.
```

Expected output: `<JIRA_PATH>` written to disk.

### Step 5 - Generate the OpenSpec specification (Prompt)

```
generate an OpenSpec Specification '<JIRA_TICKET_NAME>' based on '<JIRA_PATH>' with a proposal.md, deltas.md, specs/, examples/, tests/, tasks.md, design.md, a .json file, README.md. Generate only the files necessary to create a complete OpenSpec Specification.
```

Expected output: a new directory `openspec\changes\<JIRA_TICKET_NAME>\` populated with the listed files.

### Step 6 - Generate Beads tasks from the OpenSpec change (Prompt)

```
Use '.\scripts\beads-helpers.ps1' and '.\scripts\beads-query.ps1' to generate a series of bead tasks '<JIRA_TICKET_NAME>' based on 'path\to\openspec\changes\<JIRA_TICKET_NAME>' using proposal.md, deltas.md, specs/, examples/, tests/, tasks.md, design.md, a .json file, and README.md to fill in the descriptive details of the bead tasks.
```

Expected output: new `bd-` prefixed entries appended to `.beads/issues.jsonl`, tagged with `<JIRA_TICKET_NAME>`.

### Step 7 - Snapshot the open/in-progress task list (Prompt)

```
fill the existing file '<BEAD_TASKS_PATH>' with the open and in-progress bead tasks for '<JIRA_TICKET_NAME>' in order of highest priority to lowest, open to blocked, one task per line in the format: ID: <ID> | Name: <name> | Description: <short description>
```

Expected output: `<BEAD_TASKS_PATH>` overwritten with the prioritized task list, one task per line.

### Step 8 - Build the execution batches (Action)

Run the batch generator:

```powershell
.\scripts\proc-beads.ps1
```

Expected output: one or more batch instruction files produced by the script, derived from `<BEAD_TASKS_PATH>`.

### Step 9 - Execute the batches through the AI (Action)

For each batch produced in Step 8, submit it to the AI chat/agent in order. Do not start a new batch until the previous one has reported completion. After all batches finish, verify task closure with `bd list --status closed --tag <JIRA_TICKET_NAME>`.

## Pipeline summary

```
<USER_PROMPT>
   |
   v  Step 1-3 (refine x2, persist)
<PROMPT_PATH>
   |
   v  Step 4
<JIRA_PATH>
   |
   v  Step 5
openspec\changes\<JIRA_TICKET_NAME>\
   |
   v  Step 6
.beads\issues.jsonl  (new bd- entries)
   |
   v  Step 7
<BEAD_TASKS_PATH>
   |
   v  Step 8
batch instruction files
   |
   v  Step 9
executed tasks, status closed
```
