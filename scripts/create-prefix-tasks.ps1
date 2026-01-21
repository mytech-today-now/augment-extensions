# Create Beads tasks for prefix standardization
# This script creates all tasks from openspec/changes/beads-prefix-standardization/tasks.md

$timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
$issuesFile = ".beads/issues.jsonl"

# Function to generate hash-based ID
function New-BeadsId {
    param([string]$seed)
    $hash = [System.Security.Cryptography.MD5]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($seed))
    $hashHex = [System.BitConverter]::ToString($hash).Replace('-','').ToLower().Substring(0,4)
    return "bd-$hashHex"
}

# Parent task
$parentId = "bd-prefix1"
$parent = @{
    id = $parentId
    title = "Beads Prefix Standardization"
    description = "Parent task: Formalize and validate 'bd-' prefix standard for all Beads issue IDs. See openspec/changes/beads-prefix-standardization/ for full spec."
    status = "open"
    priority = 1
    issue_type = "epic"
    created_at = $timestamp
    updated_at = $timestamp
    labels = @("documentation", "validation", "beads", "openspec")
    spec = "beads-prefix-standardization"
    rules = @("coordination-system.md", "no-unnecessary-docs.md")
} | ConvertTo-Json -Compress

# Phase 1: Specification
$tasks = @(
    @{
        id = "bd-prefix1-1"
        title = "Create naming convention spec"
        description = "Create openspec/specs/beads/naming-convention.md with formal specification. Deliverables: Spec file created, Format rules documented, Examples provided, Validation rules defined."
        status = "open"
        priority = 1
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("documentation", "specification", "phase-1")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId)
    },
    @{
        id = "bd-prefix1-2"
        title = "Update project context"
        description = "Update openspec/project-context.md to reference naming convention. Deliverables: Project context updated, Reference to naming convention added."
        status = "open"
        priority = 1
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("documentation", "phase-1")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix1-1")
    },
    # Phase 2: Documentation
    @{
        id = "bd-prefix2-1"
        title = "Update coordination system rules"
        description = "Add task ID validation to .augment/rules/coordination-system.md. Deliverables: Validation rule added, Examples provided, Pattern documented."
        status = "open"
        priority = 1
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("documentation", "coordination", "phase-2")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix1-1")
    },
    @{
        id = "bd-prefix2-2"
        title = "Update Beads workflow documentation"
        description = "Add naming convention section to augment-extensions/workflows/beads/rules/workflow.md. Deliverables: Naming convention section added, Rationale explained, Examples provided."
        status = "open"
        priority = 1
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("documentation", "beads", "phase-2")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix1-1")
    },
    @{
        id = "bd-prefix2-3"
        title = "Update AGENTS.md"
        description = "Ensure AGENTS.md clearly states 'bd-' prefix convention. Deliverables: AGENTS.md updated, Convention clearly stated."
        status = "open"
        priority = 2
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("documentation", "phase-2")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix1-1")
    },
    @{
        id = "bd-prefix2-4"
        title = "Audit all documentation"
        description = "Search all .md files for references to issue IDs and ensure they use 'bd-' prefix. Deliverables: All documentation audited, Any incorrect references fixed."
        status = "open"
        priority = 2
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("documentation", "audit", "phase-2")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix2-1", "bd-prefix2-2", "bd-prefix2-3")
    }
)

# Write parent task
Add-Content -Path $issuesFile -Value $parent

# Write all tasks
foreach ($task in $tasks) {
    $json = $task | ConvertTo-Json -Compress
    Add-Content -Path $issuesFile -Value $json
}

Write-Host "✅ Created parent task: $parentId"
Write-Host "✅ Created $($tasks.Count) tasks (Phase 1-2)"
Write-Host ""
Write-Host "Next: Run part 2 to create Phase 3-5 tasks"

