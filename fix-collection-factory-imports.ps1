# Fix CollectionFactory imports from test-env to factories

$testFiles = Get-ChildItem -Path "tests" -Recurse -Filter "*.test.ts"
$updatedCount = 0

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix imports: change CollectionFactory from test-env to factories
    $content = $content -replace "import \{ CollectionFactory \} from '../../helpers/test-env';", "import { CollectionFactory } from '../../helpers/factories';"
    
    # Also handle cases where both TestEnvironment and CollectionFactory are imported
    $content = $content -replace "import \{ TestEnvironment, CollectionFactory \} from '../../helpers/test-env';", "import { TestEnvironment } from '../../helpers/test-env';`nimport { CollectionFactory } from '../../helpers/factories';"
    $content = $content -replace "import \{ CollectionFactory, TestEnvironment \} from '../../helpers/test-env';", "import { TestEnvironment } from '../../helpers/test-env';`nimport { CollectionFactory } from '../../helpers/factories';"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)" -ForegroundColor Green
        $updatedCount++
    }
}

Write-Host "`nDone! Fixed $updatedCount file(s)." -ForegroundColor Cyan

