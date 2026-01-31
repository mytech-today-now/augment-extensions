# PowerShell Coding Standards

Comprehensive PowerShell coding standards for professional, maintainable, and secure PowerShell code.

## Overview

This module provides AI-driven guidance for writing PowerShell code across diverse project types including automation scripts, modules, DSC configurations, cloud orchestration, administrative tools, cross-platform scripts, and legacy migrations.

## Installation

### With CLI (Future)
```bash
augx link coding-standards/powershell
```

### Without CLI (Current)
Copy the contents of this module to your project's `.augment/` folder or reference it directly from this repository.

## Key Features

- **Universal Standards**: Naming conventions, error handling, security practices
- **Category-Specific Rules**: Tailored guidance for 7 PowerShell project types
- **Code Examples**: Working examples demonstrating best practices
- **Configuration System**: Project-specific category selection
- **PSScriptAnalyzer Integration**: Static analysis compliance
- **Pester Testing**: Comprehensive testing guidelines

## Directory Structure

```
augment-extensions/coding-standards/powershell/
├── module.json                          # Module metadata
├── README.md                            # This file
├── rules/
│   ├── universal-standards.md          # Cross-cutting standards
│   ├── naming-conventions.md           # Verb-Noun, PascalCase
│   ├── error-handling.md               # Try-Catch-Finally patterns
│   ├── security-practices.md           # Credential handling, signing
│   ├── performance-optimization.md     # Pipeline efficiency
│   ├── testing-guidelines.md           # Pester integration
│   ├── configuration-schema.md         # Configuration file schema
│   ├── automation-scripts.md           # Category: Automation
│   ├── modules-functions.md            # Category: Modules
│   ├── dsc-configurations.md           # Category: DSC
│   ├── cloud-orchestration.md          # Category: Cloud
│   ├── administrative-tools.md         # Category: Admin
│   ├── cross-platform-scripts.md       # Category: Cross-platform
│   └── legacy-migrations.md            # Category: Legacy
└── examples/
    ├── automation-example.ps1
    ├── module-example.psm1
    ├── dsc-example.ps1
    ├── cloud-example.ps1
    ├── admin-example.ps1
    ├── cross-platform-example.ps1
    └── legacy-migration-example.ps1
```

## Core Guidelines

### Naming Conventions
- **Functions**: Verb-Noun format (e.g., `Get-UserData`, `Set-Configuration`)
- **Parameters**: PascalCase (e.g., `$UserName`, `$FilePath`)
- **Variables**: camelCase or PascalCase (consistent within project)
- **Approved Verbs**: Use `Get-Verb` to see approved verbs

### Error Handling
```powershell
try {
    # Code that might fail
    Get-Item -Path $Path -ErrorAction Stop
}
catch [System.IO.FileNotFoundException] {
    Write-Error "File not found: $Path"
}
finally {
    # Cleanup code
}
```

### Security Practices
- Use `PSCredential` objects for credentials
- Never store plain-text passwords
- Sign scripts for production
- Validate and sanitize all input

### Performance
- Use pipeline efficiently
- Avoid unnecessary loops
- Use `-Filter` instead of `Where-Object` when possible
- Measure performance with `Measure-Command`

## Project Categories

### 1. Automation Scripts
Task automation, scheduled tasks, output formatting

### 2. Modules and Functions
CmdletBinding, parameter sets, SupportsShouldProcess

### 3. DSC Configurations
Declarative scripting, configuration data separation

### 4. Cloud Orchestration
Azure/AWS cmdlets, ARM/Bicep integration

### 5. Administrative Tools
Active Directory, Exchange, SQL management

### 6. Cross-Platform Scripts
OS-agnostic code, path handling

### 7. Legacy Migrations
Windows PowerShell → PowerShell Core

## Configuration

Create `.augment/powershell-config.json`:

```json
{
  "powershell_categories": ["automation", "modules"],
  "powershell_version": "7.4",
  "strict_mode": true,
  "static_analysis": {
    "tool": "PSScriptAnalyzer",
    "severity": "Warning"
  },
  "testing": {
    "framework": "Pester",
    "version": "5.x"
  }
}
```

## Character Count

**Total**: ~162,000 characters

## Contents

- **6 Universal Rule Files**: Standards applying to all PowerShell projects
- **1 Configuration Schema**: .augment/powershell-config.json schema documentation
- **7 Category-Specific Rule Files**: Detailed guidance for each project type
- **7 Code Examples**: Working examples for each category

## Usage

The AI agent will automatically apply these standards when working with PowerShell files (*.ps1, *.psm1, *.psd1). Configure your project categories in `.augment/powershell-config.json` to load only relevant rules.

## Version

**1.0.0** - Initial release

