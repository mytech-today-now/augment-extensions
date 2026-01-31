# PowerShell Modules and Advanced Functions

Best practices for PowerShell module development and advanced function patterns.

## Advanced Functions

### CmdletBinding Attribute

**ALWAYS** use `[CmdletBinding()]` for advanced functions:

```powershell
function Get-UserData
{
    [CmdletBinding()]
    param(
        [Parameter(Mandatory, ValueFromPipeline)]
        [string]$UserName
    )
    
    begin
    {
        Write-Verbose "Starting Get-UserData"
    }
    
    process
    {
        Write-Verbose "Processing user: $UserName"
        # Function logic
    }
    
    end
    {
        Write-Verbose "Completed Get-UserData"
    }
}
```

### Parameter Attributes

```powershell
function Set-Configuration
{
    [CmdletBinding()]
    param(
        # Mandatory parameter
        [Parameter(Mandatory)]
        [string]$ConfigPath,
        
        # Pipeline input by value
        [Parameter(ValueFromPipeline)]
        [string]$Value,
        
        # Pipeline input by property name
        [Parameter(ValueFromPipelineByPropertyName)]
        [string]$Name,
        
        # Parameter validation
        [Parameter()]
        [ValidateSet('Development', 'Staging', 'Production')]
        [string]$Environment = 'Development',
        
        # Range validation
        [Parameter()]
        [ValidateRange(1, 100)]
        [int]$RetryCount = 3,
        
        # Script validation
        [Parameter()]
        [ValidateScript({ Test-Path $_ })]
        [string]$LogPath
    )
}
```

## Parameter Sets

### Multiple Parameter Sets

```powershell
function Get-Data
{
    [CmdletBinding(DefaultParameterSetName = 'ByName')]
    param(
        [Parameter(Mandatory, ParameterSetName = 'ByName')]
        [string]$Name,
        
        [Parameter(Mandatory, ParameterSetName = 'ById')]
        [int]$Id,
        
        [Parameter(ParameterSetName = 'ByName')]
        [Parameter(ParameterSetName = 'ById')]
        [switch]$IncludeDetails
    )
    
    switch ($PSCmdlet.ParameterSetName)
    {
        'ByName' { Write-Output "Getting data by name: $Name" }
        'ById'   { Write-Output "Getting data by ID: $Id" }
    }
}

# Usage
Get-Data -Name 'User1'
Get-Data -Id 123
```

## SupportsShouldProcess

### WhatIf and Confirm Support

```powershell
function Remove-UserData
{
    [CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'High')]
    param(
        [Parameter(Mandatory)]
        [string]$UserName
    )
    
    if ($PSCmdlet.ShouldProcess($UserName, 'Remove user data'))
    {
        # Perform deletion
        Write-Output "Removing data for $UserName"
    }
}

# Usage
Remove-UserData -UserName 'TestUser' -WhatIf
Remove-UserData -UserName 'TestUser' -Confirm:$false
```

## Module Structure

### Module Directory Layout

```
MyModule/
├── MyModule.psd1           # Module manifest
├── MyModule.psm1           # Module script
├── Public/                 # Exported functions
│   ├── Get-Something.ps1
│   └── Set-Something.ps1
├── Private/                # Internal functions
│   └── Helper.ps1
├── Classes/                # PowerShell classes
│   └── MyClass.ps1
├── Data/                   # Data files
│   └── config.json
└── Tests/                  # Pester tests
    └── MyModule.Tests.ps1
```

### Module Manifest (.psd1)

```powershell
@{
    RootModule = 'MyModule.psm1'
    ModuleVersion = '1.0.0'
    GUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    Author = 'Your Name'
    CompanyName = 'Your Company'
    Copyright = '(c) 2024. All rights reserved.'
    Description = 'Module description'
    
    PowerShellVersion = '7.4'
    
    FunctionsToExport = @('Get-Something', 'Set-Something')
    CmdletsToExport = @()
    VariablesToExport = @()
    AliasesToExport = @()
    
    PrivateData = @{
        PSData = @{
            Tags = @('Tag1', 'Tag2')
            LicenseUri = 'https://github.com/user/repo/blob/main/LICENSE'
            ProjectUri = 'https://github.com/user/repo'
        }
    }
}
```

### Module Script (.psm1)

```powershell
#Requires -Version 7.4

# Import public functions
$publicFunctions = @(Get-ChildItem -Path $PSScriptRoot\Public\*.ps1 -ErrorAction SilentlyContinue)

# Import private functions
$privateFunctions = @(Get-ChildItem -Path $PSScriptRoot\Private\*.ps1 -ErrorAction SilentlyContinue)

# Dot source the files
foreach ($import in @($publicFunctions + $privateFunctions))
{
    try
    {
        . $import.FullName
    }
    catch
    {
        Write-Error "Failed to import function $($import.FullName): $_"
    }
}

# Export public functions
Export-ModuleMember -Function $publicFunctions.BaseName
```

## Output Types

### Specify Output Type

```powershell
function Get-UserInfo
{
    [CmdletBinding()]
    [OutputType([PSCustomObject])]
    param(
        [Parameter(Mandatory)]
        [string]$UserName
    )
    
    [PSCustomObject]@{
        UserName = $UserName
        Email = "$UserName@example.com"
        Created = Get-Date
    }
}
```

## Best Practices

1. **Use CmdletBinding** - Enable advanced function features
2. **Validate parameters** - Use validation attributes
3. **Support pipeline** - Use ValueFromPipeline
4. **Use parameter sets** - For mutually exclusive parameters
5. **Implement ShouldProcess** - For destructive operations
6. **Specify output types** - Use [OutputType()] attribute
7. **Export selectively** - Only export public functions
8. **Use begin/process/end** - For pipeline processing
9. **Write verbose output** - Use Write-Verbose
10. **Follow naming conventions** - Verb-Noun format

