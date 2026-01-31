# JIRA Ticket: AUG-9013 - Develop Bash Coding Standards Augment Extension

### Summary
Create a new Augment extension (based on the Augment framework at https://github.com/mytech-today-now/augment) focused on Bash coding standards. This extension will guide the Augmentcode AI in applying best practices and maintaining a high level of professionalism across various Bash script types, including automation scripts, CI/CD pipelines, command-line tools, configuration files, data processing scripts, system administration tasks, and cross-platform adaptations. The extension should allow users to select specific Bash coding categories for tailored guidance, with universal rules applied where appropriate, recognizing that most projects utilize a single primary category while supporting extensibility for multiple categories if needed.

### Description

#### Background
The Augment framework enables the creation of extensions that enhance AI-driven code generation and development processes within VS Code, integrated with repositories. This ticket involves developing an extension specifically for Bash-related tasks, leveraging Augmentcode AI to ensure outputs adhere to industry best practices, efficiency standards, security considerations, performance optimization, and professional scripting conventions.

The extension must draw from established standards such as:
- Google Shell Style Guide for readability and consistency.
- Bash Pitfalls documentation for common error avoidance.
- POSIX compliance for portability, with Bash-specific extensions where beneficial.
- Security guidelines from OWASP Shell Injection Prevention, focusing on input sanitization, command injection mitigation, and secure handling of user data.
- Performance best practices like efficient looping, pipe usage optimization, and resource management (e.g., avoiding subshells where possible).
- Testing frameworks integration (Bats, shunit2) with emphasis on unit and integration testing coverage.
- Modern Bash features (Bash 4+ arrays, associative arrays, parameter expansion) alongside compatibility strategies for older shells or non-Bash environments.

Universal guidelines should include consistent naming conventions (lowercase with underscores for variables, uppercase for constants), indentation (2 or 4 spaces), error handling (set -euo pipefail), logging (echo with timestamps or syslog), documentation (inline comments and usage functions), dependency management (avoiding external tools unless necessary), and compliance with cross-platform execution (e.g., handling differences in macOS BSD tools vs. Linux GNU tools).

#### Key Requirements
- **Modular Structure**: Design the extension to be modular, allowing users to select and activate rulesets for specific Bash script categories via configuration in VS Code or repo settings.
- **User Selection Mechanism**: Implement a user-friendly interface or configuration file (e.g., JSON or YAML) where developers can specify the Bash category(ies) for the project. Default to universal rules, with category-specific overrides and conflict detection/resolution.
- **Comprehensive Coverage**:
  - **Automation Scripts**: Guidelines for task scheduling, error trapping, and idempotency in scripts for build/deploy processes.
  - **CI/CD Pipelines**: Rules for integration with tools like GitHub Actions or Jenkins, including environment variable handling, secret management, and parallel execution.
  - **Command-Line Tools**: Best practices for argument parsing (getopts or argparse-bash), help/usage output, and exit status management.
  - **Configuration Files**: Focus on sourcing mechanisms (.bashrc, .profile), alias/function definitions, and environment setup without side effects.
  - **Data Processing Scripts**: Techniques for text manipulation (awk, sed, grep), file I/O efficiency, and handling large datasets with minimal memory usage.
  - **System Administration Tasks**: Strategies for user/group management, service control, logging rotation, and privilege escalation (sudo) with least-privilege principles.
  - **Cross-Platform Adaptations**: Approaches for detecting OS (uname), using portable commands, and providing fallbacks for platform-specific behaviors (e.g., macOS vs. Linux).
  - **Universal Rules**: Cross-cutting concerns like shellcheck linting integration, static analysis, shebang selection (#!/bin/bash vs. #!/usr/bin/env bash), function modularization, and automated formatting.
- **Integration with Augmentcode AI**: Ensure the extension provides rich prompts, code templates, patterns, linting rules, and validation checks that instruct the AI to generate compliant scripts, designs, or documentation. Include before-and-after examples in the extension's README and inline comments.
- **Extensibility**: Allow developers to add custom Bash categories, rules, or override defaults without conflicts; support plugin-style rule contributions.
- **Best Practices and Professionalism**:
  - Emphasize clean, modular, well-commented scripts with proper quoting, brace expansion avoidance in paths, and comprehensive error messages.
  - Promote efficiency-first design (optimize for speed with built-ins over externals, use readarrays for lists).
  - Encourage profiling (time command, debug mode) and iterative optimization.
  - Align with open-source standards for reusability, maintainability, and community contribution.
- **Testing and Validation**: Include unit/integration tests for the extension logic, configuration validation, rule application, and example repo integrations to prove AI guidance quality.

This extension will be developed using the Augment framework, with subsequent conversion of this ticket into an OpenSpec specification for structured planning, followed by decomposition into Beads tasks for execution by Augmentcode AI.

### Acceptance Criteria
- The extension is installable and configurable in VS Code via the Augment system.
- Users can select one or more Bash categories, with rules applied correctly (and conflicts detected) in AI-generated outputs.
- Documentation includes detailed guidelines, realistic examples for each Bash category, universal rules, and configuration samples.
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
- Sample Bash coding examples (concrete patterns to guide implementation and serve as reference during OpenSpec & Beads phases):
  - **Automation Scripts** – Backup script
    Configuration: bash_category: "automation"
    Strategy: Use rsync for efficiency, handle interruptions with traps
    Key rule: "Implement dry-run mode; log actions to file; ensure atomic operations with temp directories."
  - **CI/CD Pipelines** – Deployment step
    Configuration: bash_category: "cicd"
    Integration: GitHub Actions environment
    Key rule: "Check for required env vars; use set -x for debugging in verbose mode; handle rollback on failure."
  - **Command-Line Tools** – File renamer utility
    Configuration: bash_category: "cli"
    Parsing: getopts for options
    Key rule: "Provide --help output; quote all file paths; exit with appropriate status codes."
  - **Configuration Files** – .bashrc enhancer
    Configuration: bash_category: "config"
    Sourcing: Conditional loading
    Key rule: "Avoid global modifications; use functions for aliases; check for existing definitions."
  - **Data Processing Scripts** – Log parser
    Configuration: bash_category: "data"
    Tools: awk and grep
    Key rule: "Process in streams to handle large files; escape special characters; output in CSV format."
  - **System Administration Tasks** – User creation script
    Configuration: bash_category: "sysadmin"
    Security: Use adduser with options
    Key rule: "Run with sudo checks; log actions; validate input parameters."
  - **Cross-Platform Adaptations** – Path handler
    Configuration: bash_category: "crossplatform"
    Detection: uname -s
    Key rule: "Use case statements for OS-specific commands; provide fallbacks; test on multiple environments."

### Next Steps
- Convert this JIRA ticket into an OpenSpec specification for detailed architectural outlining.
- Decompose the OpenSpec into a prioritized series of Beads tasks for phased execution by Augmentcode AI.
- Assign tasks to development team or AI pipeline for implementation.
