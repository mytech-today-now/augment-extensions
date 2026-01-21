# Create Beads tasks for prefix standardization - Part 2 (Phases 3-5)

$timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
$issuesFile = ".beads/issues.jsonl"
$parentId = "bd-prefix1"

# Phase 3-5 tasks
$tasks = @(
    # Phase 3: Validation
    @{
        id = "bd-prefix3-1"
        title = "Create validation script"
        description = "Create scripts/validate-beads-prefix.ps1 to validate all issue IDs. Deliverables: Validation script created, Tests all issues in .beads/issues.jsonl, Returns exit code 0 on success, 1 on failure."
        status = "open"
        priority = 1
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("validation", "scripting", "phase-3")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix1-1")
    },
    @{
        id = "bd-prefix3-2"
        title = "Add coordination manifest validation"
        description = "Update coordination manifest to validate task ID prefixes. Deliverables: Validation logic added to coordination system, Rejects invalid task IDs, Clear error messages."
        status = "open"
        priority = 2
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("validation", "coordination", "phase-3")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix2-1")
    },
    @{
        id = "bd-prefix3-3"
        title = "Update git hooks"
        description = "Add prefix validation to pre-commit hook. Deliverables: Pre-commit hook updated, Validates issue IDs before commit, Clear error messages."
        status = "open"
        priority = 2
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("validation", "git", "phase-3")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix3-1")
    },
    @{
        id = "bd-prefix3-4"
        title = "Test validation"
        description = "Test all validation mechanisms with valid and invalid IDs. Deliverables: All validation tested, Edge cases covered, Documentation updated."
        status = "open"
        priority = 1
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("testing", "validation", "phase-3")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix3-1", "bd-prefix3-2", "bd-prefix3-3")
    },
    # Phase 4: Investigation
    @{
        id = "bd-prefix4-1"
        title = "Investigate bd doctor warning"
        description = "Investigate why bd doctor shows prefix mismatch warning. Deliverables: Root cause identified, Solution proposed."
        status = "open"
        priority = 2
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("investigation", "beads", "phase-4")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId)
    },
    @{
        id = "bd-prefix4-2"
        title = "Fix or document false positive"
        description = "Either fix the false positive or document it as known issue. Deliverables: False positive fixed OR Known issue documented with workaround."
        status = "open"
        priority = 2
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("bug-fix", "documentation", "phase-4")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix4-1")
    },
    # Phase 5: Finalization
    @{
        id = "bd-prefix5-1"
        title = "Update coordination manifest"
        description = "Update .augment/coordination.json with this change. Deliverables: Coordination manifest updated, All tasks linked, All specs linked."
        status = "open"
        priority = 1
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("coordination", "finalization", "phase-5")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix2-4", "bd-prefix3-4")
    },
    @{
        id = "bd-prefix5-2"
        title = "Run all tests"
        description = "Run all validation scripts and tests. Deliverables: All tests pass, No regressions."
        status = "open"
        priority = 1
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("testing", "finalization", "phase-5")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix3-4", "bd-prefix5-1")
    },
    @{
        id = "bd-prefix5-3"
        title = "Commit and archive"
        description = "Commit all changes and archive the OpenSpec change. Deliverables: All changes committed, OpenSpec change archived, Documentation complete."
        status = "open"
        priority = 1
        issue_type = "task"
        created_at = $timestamp
        updated_at = $timestamp
        labels = @("finalization", "git", "phase-5")
        spec = "beads-prefix-standardization"
        blocks = @()
        blocked_by = @($parentId, "bd-prefix5-2", "bd-prefix4-2")
    }
)

# Write all tasks
foreach ($task in $tasks) {
    $json = $task | ConvertTo-Json -Compress
    Add-Content -Path $issuesFile -Value $json
}

Write-Host "✅ Created $($tasks.Count) tasks (Phase 3-5)"
Write-Host ""
Write-Host "Total tasks created: 15 (1 parent + 14 subtasks)"
Write-Host ""
Write-Host "Run 'bd list --status open' to see all tasks"

