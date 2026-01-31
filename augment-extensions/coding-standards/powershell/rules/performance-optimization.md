# PowerShell Performance Optimization

Comprehensive performance optimization techniques for efficient PowerShell code.

## Pipeline Efficiency

### Use Pipeline Correctly

**PREFER** pipeline over loops when possible:

```powershell
# ✅ GOOD: Pipeline (faster)
Get-ChildItem -Path C:\Logs -Filter *.log | Where-Object { $_.Length -gt 1MB } | Remove-Item

# ❌ BAD: ForEach loop (slower)
$files = Get-ChildItem -Path C:\Logs -Filter *.log
foreach ($file in $files) {
    if ($file.Length -gt 1MB) {
        Remove-Item $file
    }
}
```

### Filter Left, Format Right

**ALWAYS** filter as early as possible:

```powershell
# ✅ GOOD: Filter at source
Get-ChildItem -Path C:\Logs -Filter *.log | Where-Object { $_.Length -gt 1MB }

# ❌ BAD: Get everything then filter
Get-ChildItem -Path C:\Logs | Where-Object { $_.Name -like '*.log' -and $_.Length -gt 1MB }
```

### Avoid Unnecessary Pipeline Operations

```powershell
# ✅ GOOD: Direct assignment
$processes = Get-Process

# ❌ BAD: Unnecessary ForEach-Object
$processes = Get-Process | ForEach-Object { $_ }
```

## Loop Performance

### foreach vs ForEach-Object

**USE** `foreach` statement for better performance:

```powershell
# ✅ GOOD: foreach statement (fastest)
$items = 1..10000
foreach ($item in $items) {
    $result = $item * 2
}

# ❌ SLOWER: ForEach-Object cmdlet
$items = 1..10000
$items | ForEach-Object {
    $result = $_ * 2
}
```

**WHEN** to use ForEach-Object:
- Processing pipeline input
- Need to stream large datasets
- Want lazy evaluation

### Avoid Nested Loops

```powershell
# ✅ GOOD: Use hashtable for lookups
$userLookup = @{}
foreach ($user in $users) {
    $userLookup[$user.Id] = $user
}

foreach ($order in $orders) {
    $user = $userLookup[$order.UserId]  # O(1) lookup
}

# ❌ BAD: Nested loops
foreach ($order in $orders) {
    foreach ($user in $users) {  # O(n²) complexity
        if ($user.Id -eq $order.UserId) {
            # Process
        }
    }
}
```

## Memory Management

### Use [System.Collections.Generic.List] for Dynamic Arrays

```powershell
# ✅ GOOD: Generic List (efficient)
$list = [System.Collections.Generic.List[string]]::new()
foreach ($item in 1..10000) {
    $list.Add("Item $item")
}

# ❌ BAD: Array concatenation (slow)
$array = @()
foreach ($item in 1..10000) {
    $array += "Item $item"  # Creates new array each time
}
```

### Dispose of Large Objects

```powershell
# ✅ GOOD: Explicit disposal
$stream = [System.IO.StreamReader]::new('large-file.txt')
try {
    $content = $stream.ReadToEnd()
}
finally {
    $stream.Dispose()
}

# ✅ BETTER: Using statement (PowerShell 7+)
using ($stream = [System.IO.StreamReader]::new('large-file.txt')) {
    $content = $stream.ReadToEnd()
}
```

### Clear Variables When Done

```powershell
# Clear large variables
$largeData = Get-LargeDataset
# Process data
$largeData = $null
[System.GC]::Collect()  # Force garbage collection (use sparingly)
```

## String Operations

### Use StringBuilder for Concatenation

```powershell
# ✅ GOOD: StringBuilder
$sb = [System.Text.StringBuilder]::new()
foreach ($item in 1..1000) {
    [void]$sb.AppendLine("Line $item")
}
$result = $sb.ToString()

# ❌ BAD: String concatenation
$result = ''
foreach ($item in 1..1000) {
    $result += "Line $item`n"  # Creates new string each time
}
```

### Use -join for Arrays

```powershell
# ✅ GOOD: -join operator
$items = 1..1000
$result = $items -join ', '

# ❌ BAD: String concatenation in loop
$result = ''
foreach ($item in $items) {
    $result += "$item, "
}
```

## Cmdlet-Specific Optimizations

### Use -Filter Instead of Where-Object

```powershell
# ✅ GOOD: Server-side filtering
Get-ChildItem -Path C:\Logs -Filter *.log

# ❌ BAD: Client-side filtering
Get-ChildItem -Path C:\Logs | Where-Object { $_.Extension -eq '.log' }
```

### Use -ReadCount for Large Files

```powershell
# ✅ GOOD: Process in batches
Get-Content -Path large-file.txt -ReadCount 1000 | ForEach-Object {
    # Process batch of 1000 lines
}

# ❌ BAD: Load entire file
$content = Get-Content -Path large-file.txt
```

## Best Practices Summary

1. **Filter early** - Use -Filter parameter when available
2. **Use foreach statement** - Faster than ForEach-Object for arrays
3. **Avoid array concatenation** - Use Generic.List for dynamic arrays
4. **Use StringBuilder** - For string concatenation in loops
5. **Dispose resources** - Clean up streams, connections, large objects
6. **Measure performance** - Use Measure-Command to profile
7. **Avoid nested loops** - Use hashtables for lookups
8. **Stream large files** - Use -ReadCount or StreamReader
9. **Cache results** - Don't repeat expensive operations
10. **Use .NET types** - When PowerShell cmdlets are too slow

