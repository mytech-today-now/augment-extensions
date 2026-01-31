# JIRA Ticket: AUG-9013 - Develop PowerShell Coding Standards Augment Extension

### Summary
Create a new Augment extension (based on the Augment framework at https://github.com/mytech-today-now/augment) focused on PowerShell coding standards. This extension will guide the Augmentcode AI in applying best practices and maintaining a high level of professionalism across various PowerShell project types, including automation scripts, modules and functions, Desired State Configuration (DSC), cloud orchestration (e.g., Azure/AWS), administrative tools (e.g., Active Directory), cross-platform scripts, and legacy migrations. The extension should allow users to select specific PowerShell coding categories for tailored guidance, with universal rules applied where appropriate, recognizing that most projects utilize a single primary category while supporting extensibility for multiple categories if needed.

### Description

#### Background
The Augment framework enables the creation of extensions that enhance AI-driven code generation and development processes within VS Code, integrated with repositories. This ticket involves developing an extension specifically for PowerShell-related tasks, leveraging Augmentcode AI to ensure outputs adhere to industry best practices, efficiency standards, security considerations, performance optimization, and professional coding conventions.

The extension must draw from established standards such as:
- PowerShell Best Practices and Style Guide from Microsoft (e.g., Verb-Noun cmdlet naming, pipeline-friendly design).
- PSScriptAnalyzer rules for static analysis, covering areas like readability, security, and performance.
- Security guidelines, including script signing, execution policy management, secure credential handling (e.g., using PSCredential objects), and avoidance of plain-text secrets.
- Performance best practices like efficient pipelining, Where-Object optimization, ForEach-Object usage over loops, and memory management in large datasets.
- Testing integration with Pester framework, emphasizing unit tests, integration tests, and mocking for external dependencies.
- Modern PowerShell features (PowerShell 7+ cross-platform capabilities, classes, enums, parallel processing with ForEach-Object -Parallel) alongside strategies for compatibility with legacy Windows PowerShell 5.1.
Universal guidelines should include consistent naming conventions (Verb-Noun for functions, PascalCase for parameters), indentation (4 spaces or tabs consistently), error handling (Try-Catch-Finally with custom error objects), logging (Write-Verbose/Write-Debug/Write-Information), documentation (comment-based help with .SYNOPSIS, .DESCRIPTION, .PARAMETER), module manifests (.psd1 files), and compliance with DevOps practices (e.g., integration with Azure DevOps or GitHub Actions).

#### Key Requirements
- **Modular Structure**: Design the extension to be modular, allowing users to select and activate rulesets for specific PowerShell project categories via configuration in VS Code or repo settings.
- **User Selection Mechanism**: Implement a user-friendly interface or configuration file (e.g., JSON or YAML) where developers can specify the PowerShell category(ies) for the project. Default to universal rules, with category-specific overrides and conflict detection/resolution.
- **Comprehensive Coverage**:
  - Automation Scripts: Guidelines for task automation, scheduled tasks, error trapping, and output formatting (e.g., using Out-GridView or Export-Csv).
  - Modules and Functions: Rules for advanced functions (CmdletBinding, parameter sets), module exports, versioning, and dependency management via Requires statements.
  - DSC Configurations: Best practices for declarative scripting, resource modules (e.g., xActiveDirectory), configuration data separation, and LCM (Local Configuration Manager) setup.
  - Cloud Orchestration: Techniques for Azure/AWS cmdlets, ARM/Bicep templates integration, authentication (e.g., Connect-AzAccount), and idempotent operations.
  - Administrative Tools: Focus on Active Directory, Exchange, or SQL management scripts, with emphasis on filtering (e.g., Get-ADUser -Filter), bulk operations, and auditing.
  - Cross-Platform Scripts: Strategies for OS-agnostic code (Test-Path cross-platform), handling file paths (Join-Path), and conditional logic for Windows/Linux/macOS.
  - Legacy Migrations: Approaches for updating Windows PowerShell scripts to PowerShell Core, removing deprecated features, adding compatibility modules, and testing across versions.
  - Universal Rules: Cross-cutting concerns like script linting (PSScriptAnalyzer), static analysis, module best practices (.psm1 structure), namespace avoidance of conflicts, and automated formatting.
- **Integration with Augmentcode AI**: Ensure the extension provides rich prompts, code templates, architectural patterns, linting rules, and validation checks that instruct the AI to generate compliant code, designs, or documentation. Include before-and-after examples in the extension's README and inline comments.
- **Extensibility**: Allow developers to add custom PowerShell categories, rules, or override defaults without conflicts; support plugin-style rule contributions.
- **Best Practices and Professionalism**:
  - Emphasize clean, modular, well-documented code with parameter validation attributes (ValidateScript, ValidateSet), strict mode (Set-StrictMode), and comprehensive help blocks.
  - Promote efficiency-first design (optimize pipelines, avoid unnecessary WMI/COM calls, use splatting for readability).
  - Encourage profiling (Measure-Command, Trace-Command) and iterative optimization.
  - Align with open-source standards for reusability, maintainability, and community contribution.
- **Testing and Validation**: Include unit/integration tests for the extension logic, configuration validation, rule application, and example repo integrations to prove AI guidance quality.

This extension will be developed using the Augment framework, with subsequent conversion of this ticket into an OpenSpec specification for structured planning, followed by decomposition into Beads tasks for execution by Augmentcode AI.

### Acceptance Criteria
- The extension is installable and configurable in VS Code via the Augment system.
- Users can select one or more PowerShell categories, with rules applied correctly (and conflicts detected) in AI-generated outputs.
- Documentation includes detailed guidelines, realistic examples for each PowerShell category, universal rules, and configuration samples.
- AI prompts generated by the extension consistently enforce best practices, demonstrated through sample projects and before/after diffs.
- No redundant or conflicting rules; universal rules applied efficiently with clear override semantics.
- Extension passes linting, type checking, unit/integration testing, and professional code review standards.
- Integration with repo workflows is seamless, with negligible performance degradation.

### Estimated Effort
- Design and Planning: 8 hours
- Implementation: 25 hours
- Testing and Documentation: 15 hours
- Total: 48 hours

### Attachments
- Links to referenced repositories: https://github.com/mytech-today-now/augment, https://github.com/Fission-AI/OpenSpec/, https://github.com/steveyegge/beads
- Sample PowerShell coding examples (concrete patterns to guide implementation and serve as reference during OpenSpec & Beads phases):
  - Automation Scripts – File backup script
    Configuration: powershell_category: "automation"
    Strategy: Parameterized paths, progress reporting
    Key rule: "Use Try-Catch for error handling; validate paths with Test-Path; output results as objects for pipelining."
  - Modules and Functions – Custom cmdlet for user management
    Configuration: powershell_category: "modules"
    Features: CmdletBinding, SupportsShouldProcess
    Key rule: "Implement comment-based help; use ValidateNotNullOrEmpty on parameters; export only approved members."
  - DSC Configurations – Server setup configuration
    Configuration: powershell_category: "dsc"
    Resources: File, WindowsFeature
    Key rule: "Separate configuration data (.psd1); ensure idempotency; test with Test-DscConfiguration."
  - Cloud Orchestration – Azure VM deployment script
    Configuration: powershell_category: "cloud"
    Cmdlets: New-AzVM, Az modules
    Key rule: "Handle authentication securely; use splatting for complex commands; check for existing resources before creation."
  - Administrative Tools – Active Directory user query
    Configuration: powershell_category: "admin"
    Modules: ActiveDirectory
    Key rule: "Use efficient filters; handle large result sets with paging; log operations for auditing."
  - Cross-Platform Scripts – System info gatherer
    Configuration: powershell_category: "cross-platform"
    Compatibility: PowerShell 7+
    Key rule: "Avoid platform-specific cmdlets; use $PSVersionTable for version checks; normalize outputs across OS."
  - Legacy Migrations – Update V5 script to V7
    Configuration: powershell_category: "legacy"
    Approach: Remove Out-Default, add null checks
    Key rule: "Test in compatibility mode; deprecate old syntax with warnings; ensure backward compatibility."
