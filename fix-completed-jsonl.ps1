#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fix malformed JSON lines in completed.jsonl

.DESCRIPTION
    This script fixes 14 malformed JSON lines in completed.jsonl:
    - Removes blank lines (6 lines)
    - Removes invalid text lines (1 line: "-NoNewline")
    - Splits concatenated JSON objects (7 lines)

.EXAMPLE
    .\fix-completed-jsonl.ps1
    .\fix-completed-jsonl.ps1 -DryRun
#>

param(
    [switch]$DryRun,
    [switch]$AutoReplace
)

$ErrorActionPreference = 'Stop'

$inputFile = "completed.jsonl"
$backupFile = "completed.jsonl.backup"
$outputFile = "completed.jsonl.fixed"

if (-not (Test-Path $inputFile)) {
    Write-Error "File not found: $inputFile"
    exit 1
}

Write-Host "Fixing malformed JSON lines in $inputFile..." -ForegroundColor Cyan

# Create backup
Copy-Item $inputFile $backupFile -Force
Write-Host "Created backup: $backupFile" -ForegroundColor Green

$lineNum = 0
$fixedLines = 0
$removedLines = 0
$splitLines = 0
$validLines = 0
$mergedLines = 0

$outputLines = @()
$allLines = Get-Content $inputFile

$i = 0
while ($i -lt $allLines.Count) {
    $lineNum = $i + 1
    $line = $allLines[$i].Trim()

    # Skip blank lines
    if ([string]::IsNullOrWhiteSpace($line)) {
        $removedLines++
        Write-Host "Line $lineNum : Removed blank line" -ForegroundColor Yellow
        $i++
        continue
    }

    # Skip "-NoNewline" line
    if ($line -eq "-NoNewline") {
        $removedLines++
        Write-Host "Line $lineNum : Removed invalid text: $line" -ForegroundColor Yellow
        $i++
        continue
    }

    # Try to parse as JSON
    try {
        $null = $line | ConvertFrom-Json
        $outputLines += $line
        $validLines++
        $i++
    } catch {
        # Line is not valid JSON - try to split it first
        Write-Host "Line $lineNum : Malformed JSON, attempting to fix..." -ForegroundColor Yellow

        # Check if line contains multiple JSON objects ("}{"  pattern)
        if ($line -match '\}\{') {
            # Find all occurrences of "}{"
            $parts = @()
            $currentPos = 0

            while ($true) {
                $nextPos = $line.IndexOf('}{', $currentPos)
                if ($nextPos -eq -1) {
                    # No more splits, add the rest
                    $parts += $line.Substring($currentPos)
                    break
                }

                # Add the part up to and including the "}"
                $parts += $line.Substring($currentPos, $nextPos - $currentPos + 1)
                $currentPos = $nextPos + 1
            }

            # Validate and add each part
            $partsAdded = 0
            foreach ($part in $parts) {
                $part = $part.Trim()
                if ([string]::IsNullOrWhiteSpace($part)) {
                    continue
                }

                try {
                    $null = $part | ConvertFrom-Json
                    $outputLines += $part
                    $partsAdded++
                } catch {
                    Write-Host "  Failed to parse part: $($part.Substring(0, [Math]::Min(50, $part.Length)))..." -ForegroundColor Red
                }
            }

            if ($partsAdded -gt 1) {
                $splitLines++
                $fixedLines++
                Write-Host "  Split into $partsAdded valid JSON objects" -ForegroundColor Green
            } elseif ($partsAdded -eq 1) {
                $fixedLines++
                Write-Host "  Fixed malformed JSON" -ForegroundColor Green
            } else {
                Write-Host "  Could not fix line" -ForegroundColor Red
            }
            $i++
        } else {
            # Try to merge with next line (incomplete JSON)
            $merged = $line
            $linesConsumed = 1
            $foundValid = $false

            # Try merging up to 5 lines
            for ($j = 1; $j -le 5 -and ($i + $j) -lt $allLines.Count; $j++) {
                $nextLine = $allLines[$i + $j].Trim()

                # Skip blank lines and "-NoNewline"
                if ([string]::IsNullOrWhiteSpace($nextLine) -or $nextLine -eq "-NoNewline") {
                    continue
                }

                $merged += " " + $nextLine
                $linesConsumed++

                try {
                    $null = $merged | ConvertFrom-Json
                    $outputLines += $merged
                    $mergedLines++
                    $fixedLines++
                    $foundValid = $true
                    Write-Host "  Merged $linesConsumed lines into valid JSON" -ForegroundColor Green
                    break
                } catch {
                    # Continue trying
                }
            }

            if (-not $foundValid) {
                Write-Host "  Could not fix line (tried merging $linesConsumed lines)" -ForegroundColor Red
            }

            $i += $linesConsumed
        }
    }
}

Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "  Total lines read: $($allLines.Count)" -ForegroundColor White
Write-Host "  Valid lines: $validLines" -ForegroundColor Green
Write-Host "  Fixed lines: $fixedLines" -ForegroundColor Green
Write-Host "  Split lines: $splitLines" -ForegroundColor Green
Write-Host "  Merged lines: $mergedLines" -ForegroundColor Green
Write-Host "  Removed lines: $removedLines" -ForegroundColor Yellow
Write-Host "  Output lines: $($outputLines.Count)" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "`nDry run - no changes made" -ForegroundColor Yellow
    Remove-Item $backupFile -Force
} else {
    # Write output
    $outputLines | Set-Content $outputFile -Encoding UTF8
    Write-Host "`nWrote fixed data to: $outputFile" -ForegroundColor Green
    
    # Validate output
    Write-Host "`nValidating output..." -ForegroundColor Cyan
    $validCount = 0
    $invalidCount = 0
    Get-Content $outputFile | ForEach-Object {
        try {
            $null = $_ | ConvertFrom-Json
            $validCount++
        } catch {
            $invalidCount++
        }
    }
    
    Write-Host "  Valid JSON lines: $validCount" -ForegroundColor Green
    Write-Host "  Invalid JSON lines: $invalidCount" -ForegroundColor $(if ($invalidCount -eq 0) { "Green" } else { "Red" })
    
    if ($invalidCount -eq 0) {
        Write-Host "`n✅ All lines are valid JSON!" -ForegroundColor Green
        if ($AutoReplace) {
            Move-Item $outputFile $inputFile -Force
            Write-Host "✅ Replaced $inputFile with fixed version" -ForegroundColor Green
            Write-Host "Backup saved as: $backupFile" -ForegroundColor Cyan
        } else {
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
        }
    } else {
        Write-Host "`n❌ Output still contains invalid JSON lines" -ForegroundColor Red
        Write-Host "Fixed file saved as: $outputFile" -ForegroundColor Cyan
        Write-Host "Backup saved as: $backupFile" -ForegroundColor Cyan
    }
}

