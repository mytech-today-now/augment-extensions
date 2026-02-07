$timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffffffzzz")

# Entry for bd-adr-template-madr-elaborate
$entry1 = @{
    id = "bd-adr-template-madr-elaborate"
    title = "Create MADR Elaborate template"
    description = "Create the MADR Elaborate template (templates/madr-elaborate.md) with complete template structure for complex decisions with multiple options"
    status = "closed"
    priority = 2
    issue_type = "task"
    created_at = "2026-02-05T12:00:14-06:00"
    created_by = "ai-agent"
    updated_at = $timestamp
    closed_at = $timestamp
    close_reason = "Created templates/madr-elaborate.md with complete MADR Elaborate template structure for complex decisions with multiple options, including detailed option analysis, cost/effort estimation, risk assessment, implementation plan, and stakeholder feedback"
    labels = @("adr", "phase-3", "templates")
    dependencies = @(
        @{
            issue_id = "bd-adr-template-madr-elaborate"
            depends_on_id = "bd-adr"
            type = "parent-child"
            created_at = "2026-02-05T12:00:14-06:00"
            created_by = "ai-agent"
        },
        @{
            issue_id = "bd-adr-template-madr-elaborate"
            depends_on_id = "bd-adr-setup"
            type = "blocks"
            created_at = "2026-02-05T12:00:14-06:00"
            created_by = "ai-agent"
        }
    )
    comments = @(
        @{
            created_at = $timestamp
            body = "Task completed successfully. Created templates/madr-elaborate.md with complete MADR Elaborate template."
            author = "augment-ai"
        }
    )
} | ConvertTo-Json -Compress -Depth 10

# Entry for bd-adr-template-business
$entry2 = @{
    id = "bd-adr-template-business"
    title = "Create Business Case template"
    description = "Create the Business Case template (templates/business-case.md) with complete template structure for cost/ROI analysis decisions"
    status = "closed"
    priority = 2
    issue_type = "task"
    created_at = "2026-02-05T12:00:15-06:00"
    created_by = "ai-agent"
    updated_at = $timestamp
    closed_at = $timestamp
    close_reason = "Created templates/business-case.md with complete Business Case template structure for cost/ROI analysis decisions, including financial analysis, ROI calculation, risk assessment, stakeholder impact, and approval workflow"
    labels = @("adr", "phase-3", "templates")
    dependencies = @(
        @{
            issue_id = "bd-adr-template-business"
            depends_on_id = "bd-adr"
            type = "parent-child"
            created_at = "2026-02-05T12:00:15-06:00"
            created_by = "ai-agent"
        },
        @{
            issue_id = "bd-adr-template-business"
            depends_on_id = "bd-adr-setup"
            type = "blocks"
            created_at = "2026-02-05T12:00:15-06:00"
            created_by = "ai-agent"
        }
    )
    comments = @(
        @{
            created_at = $timestamp
            body = "Task completed successfully. Created templates/business-case.md with complete Business Case template."
            author = "augment-ai"
        }
    )
} | ConvertTo-Json -Compress -Depth 10

# Append to completed.jsonl
Add-Content -Path "completed.jsonl" -Value $entry1
Add-Content -Path "completed.jsonl" -Value $entry2

# Also append to issues.jsonl to close the tasks
Add-Content -Path ".beads/issues.jsonl" -Value $entry2

Write-Host "Successfully updated completed.jsonl and issues.jsonl"
Write-Host "Closed tasks:"
Write-Host "  - bd-adr-template-madr-elaborate"
Write-Host "  - bd-adr-template-business"

