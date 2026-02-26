# Fix TestEnvironment imports - change from type import to class import
$testFiles = Get-ChildItem -Path "tests" -Recurse -Filter "*.test.ts" | Select-Object -ExpandProperty FullName

foreach ($filePath in $testFiles) {
    $content = Get-Content $filePath -Raw
    $modified = $false
    
    # Pattern 1: Fix "import { createTestEnvironment, type TestEnvironment } from" to just import TestEnvironment
    if ($content -match "import \{ createTestEnvironment, type TestEnvironment \}") {
        $content = $content -replace "import \{ createTestEnvironment, type TestEnvironment \} from ['`"]([^'`"]+)['`"];", "import { TestEnvironment } from '`$1';"
        $modified = $true
    }
    
    # Pattern 2: Fix "import { type TestEnvironment } from" to import TestEnvironment
    if ($content -match "import \{ type TestEnvironment \}") {
        $content = $content -replace "import \{ type TestEnvironment \} from ['`"]([^'`"]+)['`"];", "import { TestEnvironment } from '`$1';"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "Fixed: $filePath" -ForegroundColor Green
    }
}

Write-Host "`nDone! Fixed TestEnvironment imports." -ForegroundColor Cyan

