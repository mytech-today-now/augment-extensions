# Fix ModuleFactory and CollectionFactory instantiation issues
$testFiles = Get-ChildItem -Path "tests" -Recurse -Filter "*.test.ts" | Select-Object -ExpandProperty FullName

foreach ($filePath in $testFiles) {
    $content = Get-Content $filePath -Raw
    $modified = $false
    
    # Pattern 1: Fix "new ModuleFactory()" to remove instantiation
    if ($content -match "moduleFactory\s*=\s*new\s+ModuleFactory\(\)") {
        $content = $content -replace "moduleFactory\s*=\s*new\s+ModuleFactory\(\);", "// ModuleFactory is a static class, use ModuleFactory.create() instead"
        $modified = $true
    }
    
    # Pattern 2: Fix "new CollectionFactory()" to remove instantiation
    if ($content -match "collectionFactory\s*=\s*new\s+CollectionFactory\(\)") {
        $content = $content -replace "collectionFactory\s*=\s*new\s+CollectionFactory\(\);", "// CollectionFactory is a static class, use CollectionFactory.create() instead"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "Fixed: $filePath" -ForegroundColor Green
    }
}

Write-Host "`nDone! Fixed factory instantiation issues." -ForegroundColor Cyan

