#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Manually fix the 4 problematic lines in completed.jsonl

.DESCRIPTION
    Lines 72, 75, 93, 97 have JSON split across lines with other complete JSON in between.
    This script manually reconstructs the correct JSON objects.
#>

$ErrorActionPreference = 'Stop'

$inputFile = "completed.jsonl"
$backupFile = "completed.jsonl.backup"
$outputFile = "completed.jsonl.fixed"

if (-not (Test-Path $inputFile)) {
    Write-Error "File not found: $inputFile"
    exit 1
}

Write-Host "Manually fixing problematic lines in $inputFile..." -ForegroundColor Cyan

# Create backup
Copy-Item $inputFile $backupFile -Force
Write-Host "Created backup: $backupFile" -ForegroundColor Green

$allLines = Get-Content $inputFile

# Manually fix line 72 and 75
# Line 72 starts: {"id":"bd-shakes-5.2"... ends with "appearance vs."
# Line 75 ends with: " reality, order and disorder..."
$line72Start = $allLines[71]
$line75End = $allLines[74]

# Extract the ending from line 75 (starts with " reality")
$line75EndPart = $line75End.Substring($line75End.IndexOf(' reality'))

# Reconstruct complete line 72
$line72Complete = $line72Start + $line75EndPart

# Extract just the complete JSON from line 75 (remove the ending part)
$line75Complete = $line75End.Substring(0, $line75End.IndexOf(' reality'))

Write-Host "Line 72: Reconstructed complete JSON for bd-shakes-5.2" -ForegroundColor Green
Write-Host "Line 75: Extracted complete JSON for bd-shot-list-4" -ForegroundColor Green

# Similarly for lines 93 and 97
# Line 93 starts: {"id":"GOL.3"... ends with incomplete text
# Line 97 ends with: "ve tests for deleting..."
$line93Start = $allLines[92]
$line97End = $allLines[96]

# Extract the ending from line 97
$line97EndPart = $line97End.Substring($line97End.IndexOf('ve tests'))

# Reconstruct complete line 93
$line93Complete = $line93Start + $line97EndPart

# Extract just the complete JSON from line 97
$line97Complete = $line97End.Substring(0, $line97End.IndexOf('ve tests'))

Write-Host "Line 93: Reconstructed complete JSON for GOL.3" -ForegroundColor Green
Write-Host "Line 97: Extracted complete JSON for bd-gol-1-3" -ForegroundColor Green

# Build output
$outputLines = @()
for ($i = 0; $i -lt $allLines.Count; $i++) {
    $lineNum = $i + 1
    
    if ($lineNum -eq 72) {
        $outputLines += $line72Complete
    } elseif ($lineNum -eq 75) {
        $outputLines += $line75Complete
    } elseif ($lineNum -eq 93) {
        $outputLines += $line93Complete
    } elseif ($lineNum -eq 97) {
        $outputLines += $line97Complete
    } elseif ($lineNum -in @(135, 333, 342, 365, 380, 393, 394)) {
        # Skip these lines (blank or invalid)
        Write-Host "Line $lineNum : Skipped (blank or invalid)" -ForegroundColor Yellow
    } elseif ($lineNum -in @(336, 352, 404)) {
        # These lines have multiple JSON objects - split them
        $line = $allLines[$i]
        $parts = $line -split '\}\{'
        for ($j = 0; $j -lt $parts.Count; $j++) {
            if ($j -eq 0) {
                $outputLines += $parts[$j] + '}'
            } elseif ($j -eq $parts.Count - 1) {
                $outputLines += '{' + $parts[$j]
            } else {
                $outputLines += '{' + $parts[$j] + '}'
            }
        }
        Write-Host "Line $lineNum : Split into $($parts.Count) JSON objects" -ForegroundColor Green
    } else {
        $outputLines += $allLines[$i]
    }
}

Write-Host "`nWriting output..." -ForegroundColor Cyan
$outputLines | Set-Content $outputFile -Encoding UTF8

# Validate
Write-Host "`nValidating output..." -ForegroundColor Cyan
$validCount = 0
$invalidCount = 0
$lineNum = 0
Get-Content $outputFile | ForEach-Object {
    $lineNum++
    try {
        $null = $_ | ConvertFrom-Json
        $validCount++
    } catch {
        $invalidCount++
        Write-Host "  Line $lineNum : Invalid JSON" -ForegroundColor Red
    }
}

Write-Host "  Valid JSON lines: $validCount" -ForegroundColor Green
Write-Host "  Invalid JSON lines: $invalidCount" -ForegroundColor $(if ($invalidCount -eq 0) { "Green" } else { "Red" })

if ($invalidCount -eq 0) {
    Write-Host "`n✅ All lines are valid JSON!" -ForegroundColor Green
    Write-Host "`nReplace original file? (Y/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -eq 'Y' -or $response -eq 'y') {
        Move-Item $outputFile $inputFile -Force
        Write-Host "✅ Replaced $inputFile with fixed version" -ForegroundColor Green
        Write-Host "Backup saved as: $backupFile" -ForegroundColor Cyan
    } else {
        Write-Host "Fixed file saved as: $outputFile" -ForegroundColor Cyan
        Write-Host "Backup saved as: $backupFile" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n❌ Output still contains invalid JSON lines" -ForegroundColor Red
    Write-Host "Fixed file saved as: $outputFile" -ForegroundColor Cyan
    Write-Host "Backup saved as: $backupFile" -ForegroundColor Cyan
}

