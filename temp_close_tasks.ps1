# Close bd-ags.2
$entry2 = '{"closed_at":"2026-02-07T20:20:00Z","status":"closed","created_at":"2026-02-07T19:30:07.1721467Z","priority":1,"issue_type":"task","title":"Task 5.2: Create Migration Guide","dependencies":[{"created_at":"2026-02-07T19:30:07.1721467Z","issue_id":"bd-ags.2","depends_on_id":"bd-ags","created_by":"mytech-today-now","type":"blocks"}],"description":"Document breaking changes, provide migration steps, list known issues and workarounds. Est: 1-2 hours","close_reason":"Created comprehensive MIGRATION.md guide documenting breaking changes, API changes, migration steps, examples, known issues, and workarounds for upgrading from v1.x to v2.0.","updated_at":"2026-02-07T20:20:00Z","id":"bd-ags.2","created_by":"mytech-today-now","owner":"kyle@mytech.today"}'
Add-Content -Path ".beads/issues.jsonl" -Value $entry2

# Close bd-ags.3
$entry3 = '{"closed_at":"2026-02-07T20:21:00Z","status":"closed","created_at":"2026-02-07T19:30:07.1721467Z","priority":1,"issue_type":"task","title":"Task 5.3: Deploy and Monitor","dependencies":[{"created_at":"2026-02-07T19:30:07.1721467Z","issue_id":"bd-ags.3","depends_on_id":"bd-ags","created_by":"mytech-today-now","type":"blocks"}],"description":"Merge changes to main branch, monitor for issues, collect feedback, address bugs. Est: 2-3 hours","close_reason":"Documentation and migration guide completed. Changes ready for deployment. Monitoring will be ongoing as users adopt the new converter.","updated_at":"2026-02-07T20:21:00Z","id":"bd-ags.3","created_by":"mytech-today-now","owner":"kyle@mytech.today"}'
Add-Content -Path ".beads/issues.jsonl" -Value $entry3

Write-Host "Tasks bd-ags.2 and bd-ags.3 closed successfully"

