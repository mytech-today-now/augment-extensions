# Fix JSONL file by removing malformed lines and compacting multi-line JSON
$inputFile = ".beads\issues.jsonl"
$backupFile = ".beads\issues.jsonl.backup"

# Create backup
Copy-Item $inputFile $backupFile -Force
Write-Host "Created backup: $backupFile"

# Read all content
$content = Get-Content $inputFile -Raw

# Split into lines
$lines = $content -split "`n"

$output = New-Object System.Collections.ArrayList
$jsonBuffer = ""
$inMultiLine = $false

foreach ($line in $lines) {
    $trimmed = $line.Trim()
    
    # Skip malformed line (starts with {\ id\:)
    if ($trimmed -match '^\{\\') {
        Write-Host "Skipping malformed line"
        continue
    }
    
    # Skip empty lines
    if ($trimmed -eq "") {
        continue
    }
    
    # Check for start of multi-line JSON
    if ($trimmed -eq "{") {
        $inMultiLine = $true
        $jsonBuffer = "{"
        continue
    }
    
    # If in multi-line mode, accumulate
    if ($inMultiLine) {
        $jsonBuffer += $trimmed
        if ($trimmed -eq "}") {
            # End of multi-line JSON - compact and add
            $compacted = $jsonBuffer -replace '\s+', ' ' -replace '{ ', '{' -replace ' }', '}' -replace '\[ ', '[' -replace ' \]', ']' -replace ' :', ':' -replace ', ', ','
            [void]$output.Add($compacted)
            $inMultiLine = $false
            $jsonBuffer = ""
        }
        continue
    }
    
    # Regular single-line JSON
    [void]$output.Add($trimmed)
}

# Write output
$output | Out-File $inputFile -Encoding utf8
Write-Host "Fixed $($output.Count) lines"
Write-Host "Done! Original backed up to $backupFile"

