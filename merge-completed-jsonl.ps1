# Merge .beads/completed.jsonl into root completed.jsonl
Write-Host "Merging .beads/completed.jsonl into completed.jsonl..." -ForegroundColor Green

# Append .beads/completed.jsonl to root completed.jsonl
Get-Content .beads/completed.jsonl | Add-Content completed.jsonl

Write-Host "✅ Merge complete!" -ForegroundColor Green
Write-Host "Total lines in completed.jsonl:" -ForegroundColor Cyan
(Get-Content completed.jsonl | Measure-Object -Line).Lines

