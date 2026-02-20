# Validate Character Count
$MODULE_ROOT = Split-Path -Parent $PSScriptRoot
$totalChars = 0
Get-ChildItem -Path $MODULE_ROOT -Recurse -Include *.md,*.go,*.json -File | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) { $totalChars += $content.Length }
}
Write-Host "Total Characters: $totalChars"
if ($totalChars -ge 20000 -and $totalChars -le 30000) {
    Write-Host "PASS: Within target range (20,000-30,000)" -ForegroundColor Green
} else {
    Write-Host "WARNING: Outside target range" -ForegroundColor Yellow
}
