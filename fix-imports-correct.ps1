# Fix test imports to use correct path for TestEnvironment
$testFiles = Get-ChildItem -Path "tests" -Recurse -Filter "*.test.ts" | Select-Object -ExpandProperty FullName

foreach ($filePath in $testFiles) {
    $content = Get-Content $filePath -Raw
    $modified = $false

    # Fix import from '../helpers/factories' to '../../helpers/test-env'
    if ($content -match "from ['`"]\.\.\/helpers\/factories['`"]") {
        $content = $content -replace "from ['`"]\.\.\/helpers\/factories['`"]", "from '../../helpers/test-env'"
        $modified = $true
    }

    # Fix import from '../../helpers/factories' to '../../helpers/test-env'
    if ($content -match "from ['`"]\.\.\/\.\.\/helpers\/factories['`"]") {
        $content = $content -replace "from ['`"]\.\.\/\.\.\/helpers\/factories['`"]", "from '../../helpers/test-env'"
        $modified = $true
    }

    # Fix import from '../../../helpers/factories' to '../../../helpers/test-env'
    if ($content -match "from ['`"]\.\.\/\.\.\/\.\.\/helpers\/factories['`"]") {
        $content = $content -replace "from ['`"]\.\.\/\.\.\/\.\.\/helpers\/factories['`"]", "from '../../../helpers/test-env'"
        $modified = $true
    }

    if ($modified) {
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "Fixed: $filePath" -ForegroundColor Green
    }
}

Write-Host "`nDone! Fixed test imports." -ForegroundColor Cyan

