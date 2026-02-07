# Close Phase 1 tasks for Screenplay Writing Enhancements

$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffffffK")

# Task bd-spw-1.1
$task1 = @"
{"id":"bd-spw-1.1","title":"Project Structure Setup","description":"Create directory structure for genres/, themes/, styles/. Set up module.json files for each sub-feature. Create README.md templates. Initialize schemas/ directory. Estimated: 2 hours.","status":"closed","priority":0,"issue_type":"task","owner":"kyle@mytech.today","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Project structure already exists with genres/, themes/, styles/ directories, module.json files for each sub-feature, README templates in _templates/, and schemas/ directory. All requirements met.","labels":["screenplay","phase1","infrastructure"],"dependencies":[{"issue_id":"bd-spw-1.1","depends_on_id":"bd-spw-p1","type":"parent-child","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now"}]}
"@

# Task bd-spw-1.2
$task2 = @"
{"id":"bd-spw-1.2","title":"Configuration System","description":"Create feature-selection.json schema. Implement configuration loader. Add validation for feature selections. Create conflict detection logic. Estimated: 3 hours.","status":"closed","priority":0,"issue_type":"task","owner":"kyle@mytech.today","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Configuration system complete: feature-selection.json schema exists with comprehensive validation, configuration loader in utils/file-organization.ts, validation defined in schema, conflict detection logic implemented with merge/priority/manual resolution strategies.","labels":["screenplay","phase1","configuration"],"dependencies":[{"issue_id":"bd-spw-1.2","depends_on_id":"bd-spw-p1","type":"parent-child","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now"},{"issue_id":"bd-spw-1.2","depends_on_id":"bd-spw-1.1","type":"blocks","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now"}]}
"@

# Task bd-spw-1.3
$task3 = @"
{"id":"bd-spw-1.3","title":"Testing Framework","description":"Set up Jest/testing infrastructure. Create test utilities for feature loading. Add coverage reporting. Create sample test data. Estimated: 2 hours.","status":"closed","priority":0,"issue_type":"task","owner":"kyle@mytech.today","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Testing framework complete: Created jest.config.js with ts-jest preset and 80% coverage thresholds, test utilities in utils/__tests__/test-utils.ts with sample configs and helper functions, config-loader.test.ts with comprehensive validation tests, package.json with test scripts, and testing README documentation.","labels":["screenplay","phase1","testing"],"dependencies":[{"issue_id":"bd-spw-1.3","depends_on_id":"bd-spw-p1","type":"parent-child","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now"},{"issue_id":"bd-spw-1.3","depends_on_id":"bd-spw-1.1","type":"blocks","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now"}]}
"@

# Task bd-spw-1.4
$task4 = @"
{"id":"bd-spw-1.4","title":"Base Rule Format","description":"Define standard rule format (Markdown). Create rule template files. Document rule structure. Create example rule file. Estimated: 2 hours.","status":"closed","priority":0,"issue_type":"task","owner":"kyle@mytech.today","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Base rule format complete: Standard Markdown format defined, rule template files exist (_templates/genre-template.md, style-template.md, theme-template.md), comprehensive documentation in templates with structure guidelines, example sections, and best practices.","labels":["screenplay","phase1","rules"],"dependencies":[{"issue_id":"bd-spw-1.4","depends_on_id":"bd-spw-p1","type":"parent-child","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now"},{"issue_id":"bd-spw-1.4","depends_on_id":"bd-spw-1.1","type":"blocks","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now"}]}
"@

# Task bd-spw-1.5
$task5 = @"
{"id":"bd-spw-1.5","title":"Module Integration","description":"Update parent screenplay module.json. Add sub-feature references. Update parent README. Create integration documentation. Estimated: 1 hour.","status":"closed","priority":1,"issue_type":"task","owner":"kyle@mytech.today","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Module integration complete: Updated parent module.json with subFeatures object referencing genres, themes, and styles modules. Updated README.md with comprehensive sub-feature documentation including character counts, coverage, and configuration examples. Created INTEGRATION.md guide with architecture, loading mechanism, usage patterns, and troubleshooting.","labels":["screenplay","phase1","integration"],"dependencies":[{"issue_id":"bd-spw-1.5","depends_on_id":"bd-spw-p1","type":"parent-child","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now"},{"issue_id":"bd-spw-1.5","depends_on_id":"bd-spw-1.1","type":"blocks","created_at":"2026-02-07T00:00:00-06:00","created_by":"mytech-today-now"}]}
"@

# Append to issues.jsonl
Add-Content -Path ".beads/issues.jsonl" -Value $task1
Add-Content -Path ".beads/issues.jsonl" -Value $task2
Add-Content -Path ".beads/issues.jsonl" -Value $task3
Add-Content -Path ".beads/issues.jsonl" -Value $task4
Add-Content -Path ".beads/issues.jsonl" -Value $task5

Write-Host "✅ Phase 1 tasks closed successfully"
Write-Host ""
Write-Host "Closed tasks:"
Write-Host "  - bd-spw-1.1: Project Structure Setup"
Write-Host "  - bd-spw-1.2: Configuration System"
Write-Host "  - bd-spw-1.3: Testing Framework"
Write-Host "  - bd-spw-1.4: Base Rule Format"
Write-Host "  - bd-spw-1.5: Module Integration"

