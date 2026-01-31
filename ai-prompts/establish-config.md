```markdown
# JIRA Ticket: AUG-123 - Establish Standardized .augment Configuration and Documentation Structure

## Summary
Create a standardized `.augment` directory structure with core rules, guidelines, and documentation files in the repository root to ensure consistent behavior across all projects using Augmentcode AI. Specifically, ensure that critical guideline files are automatically created or validated when the `augment-extensions` module is installed.

## Description
As Augmentcode AI adoption grows across teams and repositories, there is a need for a consistent, enforceable set of rules and guidelines that govern AI-assisted code generation, refactoring, and extension workflows. Currently, individual repositories may lack these guidelines or implement them inconsistently, leading to variable code quality, differing extension behaviors, and confusion for contributors.

The goal of this ticket is to define and implement a standardized `.augment` directory in the repository that serves as the single source of truth for Augmentcode configuration and best-practice documentation. This structure must be version-controlled, well-documented, and automatically enforceable where possible.

Key requirements:
- All Augmentcode-enabled repositories should contain a `.augment/` directory at the root level.
- The directory must contain a core set of markdown-based guideline documents that define expected AI behavior, workflows, and quality standards.
- Certain guideline files must be treated as mandatory when specific Augmentcode modules (e.g., `augment-extensions`) are enabled or installed.
- The structure should support future extensibility (additional modules may introduce their own required guidelines).
- Implementation should follow Augmentcode best practices for configuration management and avoid redundancy.

## Acceptance Criteria
1. A `.augment/` directory exists at the repository root.
2. The directory contains at minimum the following files:
   - `README.md` – Overview of the `.augment` directory purpose, structure, and how to extend it.
   - `augment-extensions-workflow.md` – Detailed guidelines for using the `augment-extensions` module, including expected workflows, approval processes, and extension patterns.
   - `character-count-management.md` – Rules and strategies for managing token/character limits during AI interactions, including truncation policies, context prioritization, and summary techniques.
   - Additional core guideline files as deemed necessary (e.g., code-style-conventions.md, security-considerations.md).
3. A mechanism (script, pre-commit hook, or Augmentcode built-in validation) ensures that when the `augment-extensions` module is detected as installed/enabled in the repository, the files `augment-extensions-workflow.md` and `character-count-management.md` are present. If missing, the system should either:
   - Auto-generate stubs with clear TODO sections, or
   - Fail validation with a clear error message directing the user to create them.
4. All markdown files follow consistent formatting:
   - Use clear headings, bullet points, code blocks, and examples.
   - Include a front-matter section (if supported) indicating version and ownership.
   - Written in professional, precise, and actionable language.
5. Documentation in `.augment/README.md` explains:
   - The purpose of each file.
   - How module-specific guidelines are linked to module installation.
   - Process for proposing changes or additions to the standardized guidelines.
6. The implementation is non-redundant: shared concepts (e.g., general prompt engineering) are placed in a single shared file rather than duplicated across module-specific docs.

## Technical Notes
- This ticket will first be converted into a formal OpenSpec specification.
- The resulting OpenSpec will then be broken down into granular bead tasks for execution by Augmentcode AI in VS Code.
- Prefer declarative configuration where possible (e.g., JSON/YAML manifests listing required files per module).
- Consider integration with Augmentcode's extension detection logic to trigger guideline validation.

## Priority
High – Impacts consistency and quality of AI-generated code across all repositories.

## Labels
augmentcode, configuration, documentation, best-practices, automation
```
This JIRA ticket is now ready to be converted into a detailed OpenSpec specification in the next step, followed by bead-level task decomposition for Augmentcode AI execution.