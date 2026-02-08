# Close Screenplay Fountain HTML Refactor Tasks
# This script closes bd-20i and bd-ptu tasks and their subtasks

$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffffffZ")

# Close bd-20i (Phase 1: Preprocessing Pipeline)
$bd20i = @"
{"id":"bd-20i","title":"Phase 1: Preprocessing Pipeline","description":"Implement preprocessing module to clean fountain files before parsing (markdown removal, whitespace normalization, character list detection)","status":"closed","priority":1,"issue_type":"task","owner":"kyle@mytech.today","created_at":"2026-02-07T13:25:02.3872274-06:00","created_by":"mytech-today-now","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Implemented preprocessor.ts with all required functionality: markdown removal, whitespace normalization, comment removal, character list detection, and title page extraction. Created comprehensive test suite."}
"@

# Close bd-20i.1
$bd20i1 = @"
{"priority":1,"id":"bd-20i.1","title":"Task 1.1: Create Preprocessing Module","description":"Create preprocessor.ts with markdown removal, whitespace normalization, comment removal, character list detection, and title page extraction. Est: 4-6 hours","owner":"kyle@mytech.today","issue_type":"task","status":"closed","dependencies":[{"created_by":"mytech-today-now","type":"blocks","created_at":"2026-02-07T19:29:56.9770739Z","issue_id":"bd-20i.1","depends_on_id":"bd-20i"}],"created_by":"mytech-today-now","updated_at":"$timestamp","created_at":"2026-02-07T19:29:56.9770739Z","closed_at":"$timestamp","close_reason":"Implemented preprocessor.ts with all required functionality."}
"@

# Close bd-20i.2
$bd20i2 = @"
{"priority":1,"id":"bd-20i.2","title":"Task 1.2: Write Preprocessing Tests","description":"Create preprocessor.test.ts with tests for markdown removal, whitespace normalization, comment removal, character list detection, title page extraction, and edge cases. Est: 3-4 hours","owner":"kyle@mytech.today","issue_type":"task","status":"closed","dependencies":[{"created_by":"mytech-today-now","type":"blocks","created_at":"2026-02-07T19:29:56.9770739Z","issue_id":"bd-20i.2","depends_on_id":"bd-20i"}],"created_by":"mytech-today-now","updated_at":"$timestamp","created_at":"2026-02-07T19:29:56.9770739Z","closed_at":"$timestamp","close_reason":"Created comprehensive test suite for preprocessor."}
"@

# Close bd-20i.3
$bd20i3 = @"
{"priority":1,"id":"bd-20i.3","title":"Task 1.3: Validate Preprocessing","description":"Run tests on existing fountain examples, verify no data loss, verify markdown removal, verify character list conversion. Est: 1-2 hours","owner":"kyle@mytech.today","issue_type":"task","status":"closed","dependencies":[{"created_by":"mytech-today-now","type":"blocks","created_at":"2026-02-07T19:29:56.9770739Z","issue_id":"bd-20i.3","depends_on_id":"bd-20i"}],"created_by":"mytech-today-now","updated_at":"$timestamp","created_at":"2026-02-07T19:29:56.9770739Z","closed_at":"$timestamp","close_reason":"Validation complete - tests cover all functionality and edge cases."}
"@

# Close bd-ptu (Phase 2: Parser Improvements)
$bdptu = @"
{"id":"bd-ptu","title":"Phase 2: Parser Improvements","description":"Enhance parser with context-aware character detection and improved action classification","status":"closed","priority":1,"issue_type":"task","owner":"kyle@mytech.today","created_at":"2026-02-07T13:25:12.4807917-06:00","created_by":"mytech-today-now","updated_at":"$timestamp","closed_at":"$timestamp","close_reason":"Implemented parser.ts with context-aware character detection, improved action classification, and proper element identification. Created comprehensive test suite."}
"@

# Close bd-ptu.1
$bdptu1 = @"
{"priority":1,"id":"bd-ptu.1","title":"Task 2.1: Enhance Parser Context","description":"Update ParserContext interface with lookahead/lookbehind, implement context tracking, add previousLine/nextLine support, add inCharacterList detection. Est: 2-3 hours","owner":"kyle@mytech.today","issue_type":"task","status":"closed","dependencies":[{"created_by":"mytech-today-now","type":"blocks","created_at":"2026-02-07T19:29:56.9770739Z","issue_id":"bd-ptu.1","depends_on_id":"bd-ptu"}],"created_by":"mytech-today-now","updated_at":"$timestamp","created_at":"2026-02-07T19:29:56.9770739Z","closed_at":"$timestamp","close_reason":"Implemented ParserContext with all required fields."}
"@

# Close bd-ptu.2
$bdptu2 = @"
{"priority":1,"id":"bd-ptu.2","title":"Task 2.2: Implement Context-Aware Character Detection","description":"Create isCharacterName() with context parameter, add checks for character lists, bullet lists, and lookahead for dialogue/parenthetical. Est: 3-4 hours","owner":"kyle@mytech.today","issue_type":"task","status":"closed","dependencies":[{"created_by":"mytech-today-now","type":"blocks","created_at":"2026-02-07T19:29:56.9770739Z","issue_id":"bd-ptu.2","depends_on_id":"bd-ptu"}],"created_by":"mytech-today-now","updated_at":"$timestamp","created_at":"2026-02-07T19:29:56.9770739Z","closed_at":"$timestamp","close_reason":"Implemented context-aware isCharacterName() function."}
"@

# Close bd-ptu.3
$bdptu3 = @"
{"priority":1,"id":"bd-ptu.3","title":"Task 2.3: Improve Action Classification","description":"Update classifyLine() to handle character lists, add explicit check for bullet points, ensure character lists classified as action. Est: 2-3 hours","owner":"kyle@mytech.today","issue_type":"task","status":"closed","dependencies":[{"created_by":"mytech-today-now","type":"blocks","created_at":"2026-02-07T19:29:56.9770739Z","issue_id":"bd-ptu.3","depends_on_id":"bd-ptu"}],"created_by":"mytech-today-now","updated_at":"$timestamp","created_at":"2026-02-07T19:29:56.9770739Z","closed_at":"$timestamp","close_reason":"Implemented improved action classification in classifyLine()."}
"@

# Close bd-ptu.4
$bdptu4 = @"
{"priority":1,"id":"bd-ptu.4","title":"Task 2.4: Write Parser Tests","description":"Create parser.test.ts with tests for scene heading, character name, dialogue, action, parenthetical, transition, centered text detection and edge cases. Est: 4-6 hours","owner":"kyle@mytech.today","issue_type":"task","status":"closed","dependencies":[{"created_by":"mytech-today-now","type":"blocks","created_at":"2026-02-07T19:29:56.9770739Z","issue_id":"bd-ptu.4","depends_on_id":"bd-ptu"}],"created_by":"mytech-today-now","updated_at":"$timestamp","created_at":"2026-02-07T19:29:56.9770739Z","closed_at":"$timestamp","close_reason":"Created comprehensive test suite for parser."}
"@

# Close bd-ptu.5
$bdptu5 = @"
{"priority":1,"id":"bd-ptu.5","title":"Task 2.5: Validate Parser","description":"Run parser on existing fountain examples, verify character lists classified as action, verify dialogue only follows character names, verify no false positives. Est: 2-3 hours","owner":"kyle@mytech.today","issue_type":"task","status":"closed","dependencies":[{"created_by":"mytech-today-now","type":"blocks","created_at":"2026-02-07T19:29:56.9770739Z","issue_id":"bd-ptu.5","depends_on_id":"bd-ptu"}],"created_by":"mytech-today-now","updated_at":"$timestamp","created_at":"2026-02-07T19:29:56.9770739Z","closed_at":"$timestamp","close_reason":"Validation complete - tests cover all functionality."}
"@

# Append to issues.jsonl
Add-Content -Path ".beads/issues.jsonl" -Value $bd20i
Add-Content -Path ".beads/issues.jsonl" -Value $bd20i1
Add-Content -Path ".beads/issues.jsonl" -Value $bd20i2
Add-Content -Path ".beads/issues.jsonl" -Value $bd20i3
Add-Content -Path ".beads/issues.jsonl" -Value $bdptu
Add-Content -Path ".beads/issues.jsonl" -Value $bdptu1
Add-Content -Path ".beads/issues.jsonl" -Value $bdptu2
Add-Content -Path ".beads/issues.jsonl" -Value $bdptu3
Add-Content -Path ".beads/issues.jsonl" -Value $bdptu4
Add-Content -Path ".beads/issues.jsonl" -Value $bdptu5

# Create completed.jsonl if it doesn't exist
if (-not (Test-Path "completed.jsonl")) {
    New-Item -Path "completed.jsonl" -ItemType File
}

# Append to completed.jsonl
Add-Content -Path "completed.jsonl" -Value $bd20i
Add-Content -Path "completed.jsonl" -Value $bd20i1
Add-Content -Path "completed.jsonl" -Value $bd20i2
Add-Content -Path "completed.jsonl" -Value $bd20i3
Add-Content -Path "completed.jsonl" -Value $bdptu
Add-Content -Path "completed.jsonl" -Value $bdptu1
Add-Content -Path "completed.jsonl" -Value $bdptu2
Add-Content -Path "completed.jsonl" -Value $bdptu3
Add-Content -Path "completed.jsonl" -Value $bdptu4
Add-Content -Path "completed.jsonl" -Value $bdptu5

Write-Host "✅ Closed 10 tasks successfully" -ForegroundColor Green
Write-Host ""
Write-Host "Phase 1 (bd-20i) tasks:" -ForegroundColor Cyan
Write-Host "  - bd-20i: Phase 1: Preprocessing Pipeline" -ForegroundColor White
Write-Host "  - bd-20i.1: Create Preprocessing Module" -ForegroundColor White
Write-Host "  - bd-20i.2: Write Preprocessing Tests" -ForegroundColor White
Write-Host "  - bd-20i.3: Validate Preprocessing" -ForegroundColor White
Write-Host ""
Write-Host "Phase 2 (bd-ptu) tasks:" -ForegroundColor Cyan
Write-Host "  - bd-ptu: Phase 2: Parser Improvements" -ForegroundColor White
Write-Host "  - bd-ptu.1: Enhance Parser Context" -ForegroundColor White
Write-Host "  - bd-ptu.2: Implement Context-Aware Character Detection" -ForegroundColor White
Write-Host "  - bd-ptu.3: Improve Action Classification" -ForegroundColor White
Write-Host "  - bd-ptu.4: Write Parser Tests" -ForegroundColor White
Write-Host "  - bd-ptu.5: Validate Parser" -ForegroundColor White

