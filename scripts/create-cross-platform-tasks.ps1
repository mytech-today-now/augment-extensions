# Create Beads tasks for the 'cross-platform' OpenSpec change.
# Reads the structure from openspec/changes/cross-platform/tasks.md
# and synthesizes descriptions from proposal.md, design.md, deltas.md,
# specs/*.md, tests/test-plan.md, README.md, and cross-platform.json.
#
# Pattern mirrors scripts/create-prefix-tasks.ps1.
# Run from the repo root:
#   . .\scripts\beads-helpers.ps1
#   .\scripts\create-cross-platform-tasks.ps1

$timestamp  = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
$issuesFile = ".beads/issues.jsonl"

# Common labels for the whole change set
$baseLabels = @("augx","cli","cross-platform","interoperability","non-breaking")

function New-XplatTask {
    param(
        [Parameter(Mandatory)][string]$Id,
        [Parameter(Mandatory)][string]$Title,
        [Parameter(Mandatory)][string]$Description,
        [int]$Priority = 1,
        [string]$Type = "task",
        [string[]]$Labels = @(),
        [string[]]$BlockedBy = @()
    )
    $deps = @()
    foreach ($b in $BlockedBy) {
        $deps += @{ type = "blocks"; depends_on_id = $b }
    }
    return [ordered]@{
        id           = $Id
        title        = $Title
        description  = $Description
        status       = "open"
        priority     = $Priority
        issue_type   = $Type
        created_at   = $timestamp
        updated_at   = $timestamp
        labels       = ($baseLabels + $Labels)
        spec         = "cross-platform"
        blocked_by   = $BlockedBy
        dependencies = $deps
        claimed_by   = ""
        close_reason = ""
    }
}

# ---------------------------------------------------------------------------
# Phase 1: Foundations (bd-xplat1)
# ---------------------------------------------------------------------------
$tasks = @(
    (New-XplatTask -Id "bd-xplat1" -Type "epic" -Priority 1 `
        -Title "Phase 1: Foundations" `
        -Labels @("phase-1","foundations") `
        -Description "Land the per-capability specs, the ToolAdapter contract, the source-hash utility, and the coordination schema additions that every later phase depends on. Deliverables per tasks.md Phase 1: four spec files under openspec/specs/cross-platform/, optional 'export' + 'mirrors' keys on .augment/coordination.json, cli/src/adapters/types.ts, cli/src/lib/source-hash.ts. See proposal.md sections 1-4 and design.md components 1-3."),

    (New-XplatTask -Id "bd-xplat1-1" -Priority 1 `
        -Title "Write per-capability specs" `
        -Labels @("phase-1","specs","documentation") `
        -BlockedBy @("bd-xplat1") `
        -Description "Promote the four draft specs in openspec/changes/cross-platform/specs/ to canonical specs under openspec/specs/cross-platform/: export-command.md, mirror-hook.md, coordination-export-block.md, mcp-template.md. Each spec defines the grammar, exit codes, output paths, and safety rules referenced by later phases. Est: 1h."),

    (New-XplatTask -Id "bd-xplat1-2" -Priority 1 `
        -Title "Update .augment/coordination.json schema" `
        -Labels @("phase-1","coordination","schema") `
        -BlockedBy @("bd-xplat1") `
        -Description "Add optional top-level 'export' and 'mirrors' keys to the coordination loader per specs/coordination-export-block.md. 'export' carries targets[], ignore[], mirror(bool). 'mirrors' is a per-module list of {tool, sourcePath, targetPath, mode} entries written by the CLI for unlink cleanup. Unknown keys remain allowed; absence preserves current behavior exactly. Est: 45m."),

    (New-XplatTask -Id "bd-xplat1-3" -Priority 1 `
        -Title "Define ToolAdapter interface" `
        -Labels @("phase-1","adapters","cli") `
        -BlockedBy @("bd-xplat1") `
        -Description "Create cli/src/adapters/types.ts with the ToolAdapter contract from design.md component 2: id ('claude-code'|'cursor'|'windsurf'|'copilot'), exportPaths(projectRoot), mirrorPath(projectRoot, moduleId), renderModule(module), renderHeader(meta), renderFooter(meta). Adapters MUST be pure functions; all filesystem I/O lives in the runner. Est: 30m."),

    (New-XplatTask -Id "bd-xplat1-4" -Priority 1 `
        -Title "Implement source-hash utility" `
        -Labels @("phase-1","hashing","determinism") `
        -BlockedBy @("bd-xplat1") `
        -Description "Create cli/src/lib/source-hash.ts that hashes the canonical JSON encoding of {sortedModuleIds, versions, contentDigests, ignorePatterns} with SHA-256 and truncates to 16 hex chars. The hash is embedded in every generated banner as 'source-hash: <hex>' and powers idempotency + drift detection. Unit tests must cover stability across module reorder and version bumps (see test-plan.md U1). Est: 1h."),

    # -----------------------------------------------------------------------
    # Phase 2: Aggregator Command (bd-xplat2)
    # -----------------------------------------------------------------------
    (New-XplatTask -Id "bd-xplat2" -Type "epic" -Priority 1 `
        -Title "Phase 2: Aggregator Command" `
        -Labels @("phase-2","export","aggregator") `
        -BlockedBy @("bd-xplat1") `
        -Description "Ship 'augx export --target <claude-code|cursor|windsurf|copilot|all>' with one adapter per target, flag parsing (--output, --dry-run, --force, --verbose), ignore-pattern handling, generated-file banner, and source-hash-based drift detection. See specs/export-command.md and design.md component 'Aggregator'."),

    (New-XplatTask -Id "bd-xplat2-1" -Priority 1 `
        -Title "Claude Code adapter" `
        -Labels @("phase-2","adapter","claude-code") `
        -BlockedBy @("bd-xplat2","bd-xplat1-3") `
        -Description "Implement cli/src/adapters/claude-code.ts. Output path: CLAUDE.md. Compose: banner (GENERATED + version + timestamp + source-hash + modules list) -> optional MCP snippet slot -> per-module sections '## Module: <id> (v<version>)' in alphabetical order -> footer pointing to augment-extensions/modules/. LF line endings, forward-slash paths. Est: 1h."),

    (New-XplatTask -Id "bd-xplat2-2" -Priority 1 `
        -Title "Cursor adapter" `
        -Labels @("phase-2","adapter","cursor") `
        -BlockedBy @("bd-xplat2","bd-xplat1-3") `
        -Description "Implement cli/src/adapters/cursor.ts. Output path: .cursor/rules/augx.mdc. YAML frontmatter (description: 'Augx aggregated rules', alwaysApply: true) precedes the banner; banner lines appear as HTML comments after frontmatter. Per-module sections follow the same alphabetical order as other adapters. Est: 1h."),

    (New-XplatTask -Id "bd-xplat2-3" -Priority 1 `
        -Title "Windsurf adapter" `
        -Labels @("phase-2","adapter","windsurf") `
        -BlockedBy @("bd-xplat2","bd-xplat1-3") `
        -Description "Implement cli/src/adapters/windsurf.ts. Output path: .windsurfrules (single Markdown file at project root). Banner + optional MCP snippet + per-module sections + footer. Est: 45m."),

    (New-XplatTask -Id "bd-xplat2-4" -Priority 1 `
        -Title "Copilot adapter" `
        -Labels @("phase-2","adapter","copilot") `
        -BlockedBy @("bd-xplat2","bd-xplat1-3") `
        -Description "Implement cli/src/adapters/copilot.ts. Output path: .github/copilot-instructions.md. Banner + optional MCP snippet + per-module sections in alphabetical order + footer. Est: 45m."),

    (New-XplatTask -Id "bd-xplat2-5" -Priority 1 `
        -Title "augx export command wiring" `
        -Labels @("phase-2","cli","commands") `
        -BlockedBy @("bd-xplat2","bd-xplat2-1","bd-xplat2-2","bd-xplat2-3","bd-xplat2-4","bd-xplat1-4") `
        -Description "Create cli/src/commands/export.ts. Parse --target, --output, --dry-run, --force, --verbose. When --target absent, fall back to .augment/coordination.json.export.targets; if both missing, exit 1 with usage error. Apply export.ignore globs (default ['**/examples/**']). Emit per-spec exit codes: 0 success/no-op, 1 usage, 2 resolution, 3 drift, 4 I/O. Est: 1h."),

    (New-XplatTask -Id "bd-xplat2-6" -Priority 1 `
        -Title "Drift detection" `
        -Labels @("phase-2","safety","drift") `
        -BlockedBy @("bd-xplat2-5","bd-xplat1-4") `
        -Description "Before writing each target, read existing file, extract 'source-hash' banner comment, recompute hash over the body, and compare against the new computed hash. If file was hand-edited (existing body hash != banner hash), refuse to overwrite with exit code 3 and print a diff hint. --force overrides. Est: 45m."),

    # -----------------------------------------------------------------------
    # Phase 3: Mirror Hook (bd-xplat3)
    # -----------------------------------------------------------------------
    (New-XplatTask -Id "bd-xplat3" -Type "epic" -Priority 1 `
        -Title "Phase 3: Mirror Hook" `
        -Labels @("phase-3","mirror","link") `
        -BlockedBy @("bd-xplat1") `
        -Description "Extend 'augx link <module>' with optional --mirror <tool>[,<tool>...] flag and symlink-preferred / copy-fallback materialization. Add idempotent re-link (create/update/prune) and 'augx unlink' cleanup that respects hand-edits. See specs/mirror-hook.md and design.md component 'Mirror Hook'."),

    (New-XplatTask -Id "bd-xplat3-1" -Priority 1 `
        -Title "--mirror flag on augx link" `
        -Labels @("phase-3","cli","flags") `
        -BlockedBy @("bd-xplat3") `
        -Description "Add --mirror to cli/src/commands/link.ts. Accept a comma-separated tool list against the closed enum {claude-code, cursor, windsurf, copilot}. When the flag is absent, honor .augment/coordination.json.export.mirror === true as the default. Reject unknown tool names with exit 1. Est: 45m."),

    (New-XplatTask -Id "bd-xplat3-2" -Priority 1 `
        -Title "Symlink-first / copy-fallback materializer" `
        -Labels @("phase-3","filesystem","cross-platform") `
        -BlockedBy @("bd-xplat3-1") `
        -Description "For each resolved rule file, try fs.symlinkSync(source, dest); on EPERM / EACCES / ENOSYS (notably Windows without Developer Mode) fall back to fs.copyFileSync. Record {moduleId, tool, sourcePath, targetPath, mode: 'symlink'|'copy'} in .augment/coordination.json.mirrors[<moduleId>]. Subsequent runs honor the recorded mode rather than retrying symlink. Est: 1h."),

    (New-XplatTask -Id "bd-xplat3-3" -Priority 1 `
        -Title "Idempotent re-link" `
        -Labels @("phase-3","idempotency") `
        -BlockedBy @("bd-xplat3-2") `
        -Description "On every 'augx link --mirror' invocation: compute desired (tool, targetPath) tuples from current module rules; diff against tracked mirrors[<moduleId>]; create missing, update changed (source path differs), prune stale (no longer desired). Re-running after rules/ files are renamed, added, or removed leaves the target tool in a clean current state. Est: 1h."),

    (New-XplatTask -Id "bd-xplat3-4" -Priority 1 `
        -Title "augx unlink cleanup" `
        -Labels @("phase-3","unlink","cleanup") `
        -BlockedBy @("bd-xplat3-2") `
        -Description "For each entry in mirrors[<moduleId>]: if target is a symlink to the recorded source OR a copy whose content hash still matches the source, delete it; if the file has been hand-edited (hash differs), leave it in place and warn. Strip the <!-- augx-include: .claude/rules/<module>/ --> stub from CLAUDE.md when present. Remove mirrors[<moduleId>] entry; delete the 'mirrors' key entirely when empty. Est: 45m."),

    # -----------------------------------------------------------------------
    # Phase 4: MCP Wiring Template (bd-xplat4)
    # -----------------------------------------------------------------------
    (New-XplatTask -Id "bd-xplat4" -Type "epic" -Priority 1 `
        -Title "Phase 4: MCP Wiring Template" `
        -Labels @("phase-4","mcp","beads") `
        -BlockedBy @("bd-xplat1") `
        -Description "Provide the canonical Beads MCP snippet that exported per-tool files inline conditionally, so any AI agent reading those files queries the Beads MCP server for live task state instead of expecting static task data. See specs/mcp-template.md."),

    (New-XplatTask -Id "bd-xplat4-1" -Priority 1 `
        -Title "Author MCP template" `
        -Labels @("phase-4","template","beads") `
        -BlockedBy @("bd-xplat4") `
        -Description "Create augment-extensions/workflows/mcp/templates/beads.md with the canonical content from specs/mcp-template.md: server id 'beads', four MCP operations (tasks/list, tasks/get, dependencies/list, status/get), pointer to augment-extensions/workflows/beads/. Template MUST contain no bd- issue IDs, no live status data, no secrets. Est: 30m."),

    (New-XplatTask -Id "bd-xplat4-2" -Priority 1 `
        -Title "Per-target inlining" `
        -Labels @("phase-4","adapters","mcp") `
        -BlockedBy @("bd-xplat4-1","bd-xplat2-1","bd-xplat2-2","bd-xplat2-3","bd-xplat2-4") `
        -Description "Each adapter inspects .vscode/mcp.json and .augment/mcp/servers.json; if either declares a server with id 'beads', inline the template content immediately after the banner and before the first '## Module:' section. When neither file declares 'beads', omit the snippet entirely. Per-target wrapping (e.g., Cursor callout) is allowed but MUST NOT alter substantive content. Est: 45m."),

    # -----------------------------------------------------------------------
    # Phase 5: Tests (bd-xplat5)
    # -----------------------------------------------------------------------
    (New-XplatTask -Id "bd-xplat5" -Type "epic" -Priority 1 `
        -Title "Phase 5: Tests" `
        -Labels @("phase-5","tests") `
        -BlockedBy @("bd-xplat2","bd-xplat3","bd-xplat4") `
        -Description "Unit and integration coverage of all acceptance criteria in proposal.md and the full U1-U9 / I1-I3 contract in tests/test-plan.md. Coverage targets: source-hash.ts 100%, adapters 95%, commands/export.ts 90%, commands/link.ts (mirror paths) 90%. All tests set AUGX_FAKE_NOW=2026-05-25T12:00:00Z for deterministic timestamp banners."),

    (New-XplatTask -Id "bd-xplat5-1" -Priority 2 `
        -Title "Unit: source-hash stability (U1)" `
        -Labels @("phase-5","unit-test","hashing") `
        -BlockedBy @("bd-xplat5","bd-xplat1-4") `
        -Description "tests/source-hash.test.ts: assert reorder invariance (same modules, different array order -> same hash), version-bump sensitivity, content-edit sensitivity, and a golden hex vector for cross-OS determinism. Est: 30m."),

    (New-XplatTask -Id "bd-xplat5-2" -Priority 2 `
        -Title "Unit: symlink fallback on Windows (U2)" `
        -Labels @("phase-5","unit-test","windows","mirror") `
        -BlockedBy @("bd-xplat5","bd-xplat3-2") `
        -Description "tests/mirror-symlink-fallback.test.ts: mock fs.symlinkSync to throw EPERM, assert copyFile is called with the same arguments, assert the tracked mirrors entry records mode='copy'. Re-run and assert the second invocation calls copyFile (not symlinkSync). Est: 45m."),

    (New-XplatTask -Id "bd-xplat5-3" -Priority 2 `
        -Title "Unit: idempotent re-link and stale prune (U3)" `
        -Labels @("phase-5","unit-test","idempotency") `
        -BlockedBy @("bd-xplat5","bd-xplat3-3") `
        -Description "tests/mirror-idempotent.test.ts: link a module with 3 rule files, assert 3 tracked entries; delete one source file and re-link, assert tracked == 2 and orphan target removed; add a new source file and re-link, assert tracked == 3 and new destination exists. Est: 45m."),

    (New-XplatTask -Id "bd-xplat5-4" -Priority 2 `
        -Title "Unit: drift detection refuses overwrite (U4)" `
        -Labels @("phase-5","unit-test","drift","safety") `
        -BlockedBy @("bd-xplat5","bd-xplat2-6") `
        -Description "tests/drift-detection.test.ts: run 'augx export --target claude-code' and capture banner hash; append a stray line to CLAUDE.md; re-run without --force, assert exit 3 and CLAUDE.md unchanged; re-run with --force, assert exit 0 and content regenerated (stray line gone). Est: 30m."),

    (New-XplatTask -Id "bd-xplat5-5" -Priority 2 `
        -Title "Unit: --dry-run writes nothing and reports byte counts (U5)" `
        -Labels @("phase-5","unit-test","dry-run") `
        -BlockedBy @("bd-xplat5","bd-xplat2-5") `
        -Description "tests/dry-run.test.ts: stub fs.writeFile and fs.writeFileSync to fail if called; run 'augx export --target all --dry-run'; assert stdout contains four '[dry-run]' lines with target path and byte count; assert exit 0 and no writes. Est: 30m."),

    (New-XplatTask -Id "bd-xplat5-6" -Priority 2 `
        -Title "Integration: end-to-end export against fixture project (I1)" `
        -Labels @("phase-5","integration-test","export") `
        -BlockedBy @("bd-xplat5","bd-xplat2-5","bd-xplat4-2") `
        -Description "tests/export-e2e.test.ts using cli/test/fixtures/cross-platform-e2e/ with two linked modules (typescript-standards, openspec-workflow). Run 'augx export --target all'; snapshot all four output files against committed goldens; re-run and assert byte-identical (no-op) output. Est: 1h."),

    (New-XplatTask -Id "bd-xplat5-7" -Priority 2 `
        -Title "Integration: Claude Code + Cursor parse generated files (I3)" `
        -Labels @("phase-5","integration-test","parsers") `
        -BlockedBy @("bd-xplat5-6") `
        -Description "tests/tool-parse.test.ts: after I1 runs, load CLAUDE.md and .cursor/rules/augx.mdc with each tool's official parser (or known-good schema). Assert no parse errors; assert YAML frontmatter on .mdc parses cleanly and contains the expected keys (description, alwaysApply). Est: 1h."),

    # -----------------------------------------------------------------------
    # Phase 6: Documentation (bd-xplat6)
    # -----------------------------------------------------------------------
    (New-XplatTask -Id "bd-xplat6" -Type "epic" -Priority 2 `
        -Title "Phase 6: Documentation" `
        -Labels @("phase-6","documentation") `
        -BlockedBy @("bd-xplat2","bd-xplat3","bd-xplat4") `
        -Description "Document the new surfaces (augx export, --mirror flag, export block, MCP-first contract) in AGENTS.md, openspec/project-context.md, and a new augment-extensions/workflows/cross-platform/ guide. Existing OpenSpec, JIRA, Beads, Coordination, and MCP sections remain unchanged."),

    (New-XplatTask -Id "bd-xplat6-1" -Priority 2 `
        -Title "Update AGENTS.md" `
        -Labels @("phase-6","documentation","agents") `
        -BlockedBy @("bd-xplat6") `
        -Description "Add a new '## Cross-Platform Distribution' section to AGENTS.md covering: augx export command and supported targets, --mirror flag on augx link, the export block in .augment/coordination.json, and the MCP-first task-context contract (no static task data in exported files). Leave existing Augx, OpenSpec, JIRA, Beads, Coordination, and MCP sections untouched. Est: 30m."),

    (New-XplatTask -Id "bd-xplat6-2" -Priority 2 `
        -Title "Update openspec/project-context.md" `
        -Labels @("phase-6","documentation","project-context") `
        -BlockedBy @("bd-xplat6") `
        -Description "Under 'Target Users', add a bullet noting that exported artifacts make the modules consumable by Claude Code, Cursor, Windsurf, and GitHub Copilot in addition to Augment Code. Under 'Future Roadmap', remove the cross-platform distribution item once this change archives. Est: 15m."),

    (New-XplatTask -Id "bd-xplat6-3" -Priority 2 `
        -Title "Author augment-extensions/workflows/cross-platform/ guide" `
        -Labels @("phase-6","documentation","workflow") `
        -BlockedBy @("bd-xplat6") `
        -Description "Create augment-extensions/workflows/cross-platform/ with a day-to-day guide for 'augx export' and '--mirror': per-tool target paths table, drift-resolution playbook, Windows symlink fallback behavior, MCP snippet inlining trigger, and example end-to-end session. Est: 1h."),

    # -----------------------------------------------------------------------
    # Phase 7: Finalization (bd-xplat7)
    # -----------------------------------------------------------------------
    (New-XplatTask -Id "bd-xplat7" -Type "epic" -Priority 1 `
        -Title "Phase 7: Finalization" `
        -Labels @("phase-7","finalization","archive") `
        -BlockedBy @("bd-xplat1","bd-xplat2","bd-xplat3","bd-xplat4","bd-xplat5","bd-xplat6") `
        -Description "Register the change in the coordination manifest, run the full validation suite (unit + integration + 'augx export --dry-run' on this repo), and archive the change directory to openspec/archive/cross-platform/."),

    (New-XplatTask -Id "bd-xplat7-1" -Priority 1 `
        -Title "Coordination manifest update" `
        -Labels @("phase-7","coordination") `
        -BlockedBy @("bd-xplat7") `
        -Description "Register the cross-platform change in .augment/coordination.json: add the spec entry, the bd-xplat* task IDs, the affected file patterns (cli/src/adapters/, cli/src/commands/export.ts, cli/src/lib/source-hash.ts, augment-extensions/workflows/mcp/templates/), and the related rules. Est: 30m."),

    (New-XplatTask -Id "bd-xplat7-2" -Priority 1 `
        -Title "Run full validation suite" `
        -Labels @("phase-7","validation","testing") `
        -BlockedBy @("bd-xplat7-1") `
        -Description "Execute all unit + integration tests under cli/test/ and verify 'augx export --dry-run --target all' on this repo succeeds with non-zero byte counts for each configured target. Manual smoke check against Claude Code and Cursor where available. Est: 30m."),

    (New-XplatTask -Id "bd-xplat7-3" -Priority 1 `
        -Title "Archive change" `
        -Labels @("phase-7","archive") `
        -BlockedBy @("bd-xplat7-2") `
        -Description "Move openspec/changes/cross-platform/ to openspec/archive/cross-platform/. Update .augment/coordination.json references that point at the changes path. Confirm 'bd' reports all 34 bd-xplat* issues closed. Est: 15m.")
)

# ---------------------------------------------------------------------------
# Write all tasks to .beads/issues.jsonl (append-only, last-write-wins)
# ---------------------------------------------------------------------------
if (-not (Test-Path ".beads")) { New-Item -ItemType Directory -Path ".beads" | Out-Null }

$written = 0
foreach ($task in $tasks) {
    $json = $task | ConvertTo-Json -Compress -Depth 10
    Add-Content -Path $issuesFile -Value $json -Encoding UTF8
    $written++
}

Write-Host ""
Write-Host "Created $written cross-platform Beads tasks (7 phase epics + 27 subtasks)." -ForegroundColor Green
Write-Host "Root issue file: $issuesFile" -ForegroundColor Gray
Write-Host ""
Write-Host "Verify with:" -ForegroundColor Yellow
Write-Host "  . .\scripts\beads-helpers.ps1"
Write-Host "  bd list --json 2>$null | ConvertFrom-Json | Where-Object { $_.id -like 'bd-xplat*' } | Format-Table id, issue_type, priority, title -AutoSize"
Write-Host ""

