# Close executed tasks
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffffffK")

# Task 1: bd-prefix1-1
$task1 = @"
{"id":"bd-prefix1-1","title":"Create naming convention spec","description":"Create openspec/specs/beads/naming-convention.md with formal specification. Deliverables: Spec file created, Format rules documented, Examples provided, Validation rules defined.","status":"closed","priority":1,"issue_type":"task","created_at":"2026-01-21T10:57:16.131Z","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Spec file already exists at openspec/specs/beads/naming-convention.md with complete formal specification including format rules, examples, validation rules, and rationale.","labels":["documentation","phase-1","specification"]}
"@

# Task 2: bd-prefix1-2
$task2 = @"
{"id":"bd-prefix1-2","title":"Update project context","description":"Update openspec/project-context.md to reference naming convention. Deliverables: Project context updated, Reference to naming convention added.","status":"closed","priority":1,"issue_type":"task","created_at":"2026-01-21T10:57:16.131Z","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Project context already updated with naming convention section (lines 126-137) including format examples and reference to openspec/specs/beads/naming-convention.md.","labels":["documentation","phase-1"]}
"@

# Task 3: bd-prefix2-1
$task3 = @"
{"id":"bd-prefix2-1","title":"Update coordination system rules","description":"Add task ID validation to .augment/rules/coordination-system.md. Deliverables: Validation rule added, Examples provided, Pattern documented.","status":"closed","priority":1,"issue_type":"task","created_at":"2026-01-21T10:57:16.131Z","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Created .augment/rules/coordination-system.md with task ID validation section including validation pattern (^bd-[a-z0-9]+([.-][a-z0-9]+)*$), valid/invalid examples, enforcement rules, and reference to naming convention spec.","labels":["coordination","documentation","phase-2"]}
"@

# Task 4: bd-prefix2-2
$task4 = @"
{"id":"bd-prefix2-2","title":"Update Beads workflow documentation","description":"Add naming convention section to augment-extensions/workflows/beads/rules/workflow.md. Deliverables: Naming convention section added, Rationale explained, Examples provided.","status":"closed","priority":1,"issue_type":"task","created_at":"2026-01-21T10:57:16.131Z","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Beads workflow documentation already has naming convention section (lines 7-26) with bd- prefix standard, format examples, rationale, and reference to complete specification.","labels":["beads","documentation","phase-2"]}
"@

# Append to issues.jsonl
Add-Content -Path ".beads/issues.jsonl" -Value $task1
Add-Content -Path ".beads/issues.jsonl" -Value $task2
Add-Content -Path ".beads/issues.jsonl" -Value $task3
Add-Content -Path ".beads/issues.jsonl" -Value $task4

# Also append to completed.jsonl
Add-Content -Path "completed.jsonl" -Value $task1
Add-Content -Path "completed.jsonl" -Value $task2
Add-Content -Path "completed.jsonl" -Value $task3
Add-Content -Path "completed.jsonl" -Value $task4

Write-Host "✅ Closed 4 tasks successfully"
Write-Host "  - bd-prefix1-1: Create naming convention spec"
Write-Host "  - bd-prefix1-2: Update project context"
Write-Host "  - bd-prefix2-1: Update coordination system rules"
Write-Host "  - bd-prefix2-2: Update Beads workflow documentation"

