# Close completed Beads Prefix Standardization tasks

$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffffffK")

# Task bd-prefix1-1
$task1 = @"
{"id":"bd-prefix1-1","title":"Create naming convention spec","description":"Create openspec/specs/beads/naming-convention.md with formal specification. Deliverables: Spec file created, Format rules documented, Examples provided, Validation rules defined.","status":"closed","priority":1,"issue_type":"task","created_at":"2026-01-21T10:57:16.131Z","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Naming convention spec already exists at openspec/specs/beads/naming-convention.md with complete specification including format rules (bd-<hash>, bd-<name>, bd-<hash>.<number>), examples, validation rules, rationale, configuration, migration guide, and success criteria.","labels":["documentation","phase-1","specification"]}
"@

# Task bd-prefix1-2
$task2 = @"
{"id":"bd-prefix1-2","title":"Update project context","description":"Update openspec/project-context.md to reference naming convention. Deliverables: Project context updated, Reference to naming convention added.","status":"closed","priority":1,"issue_type":"task","created_at":"2026-01-21T10:57:16.131Z","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Project context already updated with naming convention references at lines 119 and 137, including complete section documenting bd- prefix requirement with format examples and link to specification.","labels":["documentation","phase-1"]}
"@

# Task bd-prefix2-1
$task3 = @"
{"id":"bd-prefix2-1","title":"Update coordination system rules","description":"Add task ID validation to .augment/rules/coordination-system.md. Deliverables: Validation rule added, Examples provided, Pattern documented.","status":"closed","priority":1,"issue_type":"task","created_at":"2026-01-21T10:57:16.131Z","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Coordination system rules already updated with task ID validation section (lines 110-133) including validation pattern ^bd-[a-z0-9]+([.-][a-z0-9]+)*$, valid/invalid examples, enforcement rules, and reference to naming convention spec.","labels":["coordination","documentation","phase-2"]}
"@

# Task bd-prefix2-2
$task4 = @"
{"id":"bd-prefix2-2","title":"Update Beads workflow documentation","description":"Add naming convention section to augment-extensions/workflows/beads/rules/workflow.md. Deliverables: Naming convention section added, Rationale explained, Examples provided.","status":"closed","priority":1,"issue_type":"task","created_at":"2026-01-21T10:57:16.131Z","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Beads workflow documentation already updated with naming convention section (lines 7-27) including standard formats, rationale (brevity, clarity, consistency, git-friendly), validation note, and reference to specification.","labels":["beads","documentation","phase-2"]}
"@

# Append to issues.jsonl
Add-Content -Path ".beads/issues.jsonl" -Value $task1
Add-Content -Path ".beads/issues.jsonl" -Value $task2
Add-Content -Path ".beads/issues.jsonl" -Value $task3
Add-Content -Path ".beads/issues.jsonl" -Value $task4

# Append to completed.jsonl
Add-Content -Path "completed.jsonl" -Value $task1
Add-Content -Path "completed.jsonl" -Value $task2
Add-Content -Path "completed.jsonl" -Value $task3
Add-Content -Path "completed.jsonl" -Value $task4

Write-Host "✅ Beads Prefix Standardization tasks closed successfully" -ForegroundColor Green
Write-Host ""
Write-Host "Closed tasks:" -ForegroundColor Cyan
Write-Host "  - bd-prefix1-1: Create naming convention spec" -ForegroundColor White
Write-Host "  - bd-prefix1-2: Update project context" -ForegroundColor White
Write-Host "  - bd-prefix2-1: Update coordination system rules" -ForegroundColor White
Write-Host "  - bd-prefix2-2: Update Beads workflow documentation" -ForegroundColor White
Write-Host ""
Write-Host "All tasks were already completed. Files verified:" -ForegroundColor Yellow
Write-Host "  ✓ openspec/specs/beads/naming-convention.md" -ForegroundColor Green
Write-Host "  ✓ openspec/project-context.md (lines 119, 137)" -ForegroundColor Green
Write-Host "  ✓ .augment-guidelines/system-integration/coordination-system.md (lines 110-133)" -ForegroundColor Green
Write-Host "  ✓ augment-extensions/workflows/beads/rules/workflow.md (lines 7-27)" -ForegroundColor Green

