# Fix test imports to use new TestEnvironment class
$testFiles = Get-ChildItem -Path "tests" -Recurse -Filter "*.test.ts"

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Replace import statement
    if ($content -match "import.*createTestEnvironment.*TestEnvironment.*from.*test-env") {
        $content = $content -replace "import \{ createTestEnvironment, TestEnvironment \} from '(\.\.\/)*helpers\/test-env';", "import { TestEnvironment } from '`$1helpers/factories';"
        $modified = $true
    }
    elseif ($content -match "import.*TestEnvironment.*from.*test-env") {
        $content = $content -replace "import \{ TestEnvironment \} from '(\.\.\/)*helpers\/test-env';", "import { TestEnvironment } from '`$1helpers/factories';"
        $modified = $true
    }
    elseif ($content -match "import.*createTestEnvironment.*from.*test-env") {
        $content = $content -replace "import \{ createTestEnvironment \} from '(\.\.\/)*helpers\/test-env';", "import { TestEnvironment } from '`$1helpers/factories';"
        $modified = $true
    }
    
    # Replace createTestEnvironment() calls with new TestEnvironment()
    if ($content -match "testEnv = await createTestEnvironment\(\)") {
        $content = $content -replace "testEnv = await createTestEnvironment\(\);", "testEnv = new TestEnvironment();`n    await testEnv.setup();"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
    }
}

Write-Host "`nDone! Fixed test imports." -ForegroundColor Cyan

