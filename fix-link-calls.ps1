# Fix manual linking code to use testEnv.linkModule helper
$testFiles = @(
    "tests\unit\modules\link.test.ts",
    "tests\unit\modules\list.test.ts",
    "tests\unit\modules\unlink.test.ts",
    "tests\integration\workflows\module-lifecycle.test.ts",
    "tests\integration\workflows\unlink-self-remove.test.ts"
)

foreach ($filePath in $testFiles) {
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $modified = $false
        
        # Pattern 1: Manual linking with writeFile
        $pattern1 = '(?s)// Link module\s+const linkedModules = \[\.\.\.configBefore\.modules, \{\s+name: module\.fullName,\s+version: module\.metadata\.version,\s+type: module\.metadata\.type,\s+description: module\.metadata\.description\s+\}\];[\s\S]*?await writeFile\(project\.configPath, JSON\.stringify\(\{[\s\S]*?\}, null, 2\)\);'
        
        if ($content -match $pattern1) {
            $content = $content -replace $pattern1, "// Link module using helper`n      await testEnv.linkModule(project.path, module.fullName, module.metadata);"
            $modified = $true
        }
        
        if ($modified) {
            Set-Content -Path $filePath -Value $content -NoNewline
            Write-Host "Fixed linking in: $filePath" -ForegroundColor Green
        }
    }
}

Write-Host "`nDone! Fixed link calls." -ForegroundColor Cyan

