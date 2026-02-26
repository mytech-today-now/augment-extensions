# Fix moduleFactory.createValidModule() calls to use static ModuleFactory.createValidModule()

$testFiles = Get-ChildItem -Path "tests" -Recurse -Filter "*.test.ts"
$updatedCount = 0

foreach ($file in $testFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content

    # Replace moduleFactory.createValidModule() with ModuleFactory.createValidModule()
    $content = $content -replace 'moduleFactory\.createValidModule\(\)', 'ModuleFactory.createValidModule()'

    # Remove unused moduleFactory variable declarations (with or without type annotation)
    $content = $content -replace '(?m)^\s*let moduleFactory(:\s*ModuleFactory)?;\s*[\r\n]+', ''

    # Fix imports: change ModuleFactory from test-env to factories
    $content = $content -replace "import \{ ModuleFactory \} from '../../helpers/test-env';", "import { ModuleFactory } from '../../helpers/factories';"

    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)" -ForegroundColor Green
        $updatedCount++
    }
}

Write-Host "`nDone! Fixed $updatedCount file(s)." -ForegroundColor Cyan

