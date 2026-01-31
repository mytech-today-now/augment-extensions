# Close screenplay tasks
$tasks = @(
    @{id="bd-screenplay.29"; reason="Beat sheet YAML example created in beat-sheet-example.yaml"},
    @{id="bd-screenplay.30"; reason="Plot outline YAML example created in plot-outline-example.yaml"},
    @{id="bd-screenplay.32"; reason="VS Code integration documented in vscode-integration.md"},
    @{id="bd-screenplay.33"; reason="Fountain format documented in fountain-format.md"},
    @{id="bd-screenplay.34"; reason="Export formats documented in vscode-integration.md"},
    @{id="bd-screenplay.35"; reason="Character count calculated and verified in module.json (163,500 characters)"},
    @{id="bd-screenplay.36"; reason="AI integration testing guide created in ai-integration-testing.md"},
    @{id="bd-screenplay.37"; reason="Formatting validation guide created in formatting-validation.md"},
    @{id="bd-screenplay.38"; reason="Quality review checklist created in quality-review-checklist.md"},
    @{id="bd-screenplay.39"; reason="Screenplay module added to MODULES.md catalog"},
    @{id="bd-screenplay.40"; reason="Examples documentation created in examples-guide.md"},
    @{id="bd-screenplay.41"; reason="Quick reference guide created in quick-reference.md"},
    @{id="bd-screenplay.43"; reason="Final documentation review completed - all files verified"}
)

foreach ($task in $tasks) {
    Write-Host "Closing $($task.id)..."
    bd close $task.id -m $task.reason
}

Write-Host "All tasks closed successfully!"

