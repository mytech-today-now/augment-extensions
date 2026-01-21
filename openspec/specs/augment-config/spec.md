---
id: augment-config/standardized-structure
status: active
relatedTasks: []
relatedRules: [character-count-management.md, module-development.md]
priority: high
labels: [augmentcode, configuration, documentation, best-practices, automation]
---

# Augment Configuration Specification

## Overview

This specification defines the standardized `.augment` directory structure and configuration management for Augment Code AI-enabled repositories. The goal is to ensure consistent behavior, quality standards, and workflow guidelines across all projects using Augment Code AI.

## Problem Statement

As Augment Code AI adoption grows across teams and repositories, there is a need for a consistent, enforceable set of rules and guidelines that govern AI-assisted code generation, refactoring, and extension workflows. Currently, individual repositories may lack these guidelines or implement them inconsistently, leading to:

- Variable code quality
- Differing extension behaviors
- Confusion for contributors
- Lack of standardized workflows

## Requirements

### Requirement: Standardized Directory Structure
The system SHALL provide a standardized `.augment/` directory at the repository root.

#### Scenario: Repository initialization
- GIVEN a repository wants to use Augment Code AI
- WHEN the repository is initialized
- THEN a `.augment/` directory MUST exist at the root level
- AND the directory MUST contain core guideline documents
- AND the directory MUST be version-controlled

### Requirement: Core Guideline Files
The `.augment/` directory SHALL contain a minimum set of required guideline files.

#### Scenario: Core files present
- GIVEN a `.augment/` directory exists
- WHEN validating the configuration
- THEN the following files MUST be present:
  - `README.md` – Overview of the `.augment` directory purpose and structure
  - `rules/augment-extensions-workflow.md` – Guidelines for using the augment-extensions module
  - `rules/character-count-management.md` – Rules for managing character/token limits
  - `rules/module-development.md` – Guidelines for developing modules
  - `rules/no-unnecessary-docs.md` – Documentation standards
  - `coordination.json` – Coordination manifest linking specs, tasks, and rules

#### Scenario: Module-specific guidelines
- GIVEN the `augment-extensions` module is installed/enabled
- WHEN validating the configuration
- THEN `rules/augment-extensions-workflow.md` MUST be present
- AND `rules/character-count-management.md` MUST be present
- AND if missing, the system SHOULD auto-generate stubs OR fail validation with clear error

### Requirement: Validation Mechanism
The system SHALL provide a mechanism to validate required guideline files.

#### Scenario: Pre-commit validation
- GIVEN changes are being committed
- WHEN the pre-commit hook runs
- THEN the system MUST verify all required guideline files are present
- AND if module-specific files are missing, the commit SHOULD fail with clear error message
- AND the error message MUST direct the user to create missing files

#### Scenario: Module detection
- GIVEN a repository has modules installed
- WHEN the validation runs
- THEN the system MUST detect which modules are enabled
- AND the system MUST verify module-specific guideline files are present
- AND the system MUST use declarative configuration (JSON/YAML manifest) to map modules to required files

### Requirement: Consistent Formatting
All guideline markdown files SHALL follow consistent formatting standards.

#### Scenario: Markdown formatting
- GIVEN a guideline file is created or updated
- WHEN validating the file
- THEN it MUST use clear headings, bullet points, code blocks, and examples
- AND it SHOULD include front-matter (YAML) indicating version and metadata
- AND it MUST be written in professional, precise, and actionable language

### Requirement: Documentation
The `.augment/README.md` SHALL explain the purpose and usage of the configuration structure.

#### Scenario: README content
- GIVEN a developer reads `.augment/README.md`
- WHEN reviewing the documentation
- THEN it MUST explain the purpose of each file
- AND it MUST explain how module-specific guidelines are linked to module installation
- AND it MUST explain the process for proposing changes or additions to guidelines

### Requirement: Non-Redundancy
The system SHALL avoid duplication of shared concepts across guideline files.

#### Scenario: Shared concepts
- GIVEN multiple guideline files reference the same concept
- WHEN organizing the guidelines
- THEN shared concepts MUST be placed in a single shared file
- AND other files MUST reference the shared file
- AND duplication MUST be avoided

### Requirement: Character Count Management
The `.augment/` directory SHALL remain within the 48,599 - 49,299 character target range.

#### Scenario: Character count validation
- GIVEN changes are made to `.augment/` files
- WHEN committing changes
- THEN the total character count MUST be verified
- AND if over limit, content MUST be moved to extension modules
- AND if under minimum, core rules MAY be expanded

## Implementation Notes

### Declarative Configuration
- Use JSON/YAML manifests to list required files per module
- Example: `augment-extensions` module requires `rules/augment-extensions-workflow.md`

### Validation Integration
- Integrate with Augment Code's extension detection logic
- Trigger guideline validation on module installation/detection
- Provide clear error messages for missing files

### Auto-Generation
- Consider auto-generating stub files with TODO sections
- Stubs should include clear instructions for completion
- Stubs should follow the consistent formatting standards

### Extensibility
- Support future modules introducing their own required guidelines
- Use modular approach for adding new guideline files
- Maintain backward compatibility with existing configurations

## Breaking Changes

None - this is a new specification.

## Migration Path

For existing repositories:
1. Create `.augment/` directory if not present
2. Add core guideline files
3. Run validation to verify all required files are present
4. Update any existing guideline files to follow consistent formatting

## Related Specifications

- [Augment Extensions](../augment-extensions/spec.md) - Module system for extending beyond character limits
- [Testing](../testing/functional-tests.md) - Testing requirements for validation

