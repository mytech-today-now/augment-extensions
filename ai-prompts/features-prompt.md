# JIRA Ticket: AUG-9012 - Modularize HTML/CSS/JS Augment Extension and Introduce GUI-Based Module Management

## Summary
Enhance the Augment extensions framework (based on https://github.com/mytech-today-now/augment) by refactoring the existing 'html/css/js' extension into three distinct, independent extensions for HTML, CSS, and JS. These can be loaded individually or collectively as a group. Introduce a new 'augx --gui' command that launches a ConsoleGUI for multi-selecting modules or predefined module-collections (groups of commonly used modules). Additionally, add functionality to unlink or uninstall individual modules or collections, and implement a self-removal mechanism for the 'augx' command to safely uninstall all Augment extensions from a project repository without causing any damage or disruptions to the underlying codebase.

## Description
### Background
The Augment framework provides a modular system for extending AI-driven code generation and development workflows in VS Code, integrated with Git repositories. Currently, the 'html/css/js' extension bundles support for HTML, CSS, and JavaScript into a single unit, limiting flexibility for developers who may only need subsets of these technologies. This ticket addresses this by modularizing the extension to promote reusability, reduce overhead, and align with best practices in software design such as separation of concerns and composability.

Furthermore, the existing 'augx' command-line interface for linking extensions requires manual, one-by-one selection, which can be inefficient for complex projects. Introducing a ConsoleGUI via 'augx --gui' will streamline module management by enabling multi-selection of modules or collections (e.g., a 'frontend' collection bundling HTML, CSS, and JS). To ensure robust lifecycle management, features for unlinking/uninstalling modules or collections must be added, along with a safe self-removal option for 'augx' to completely detach Augment extensions from the repo while preserving all original files, configurations, and history.

This development leverages established tools and methodologies: OpenSpec[](https://github.com/Fission-AI/OpenSpec/) for specification-driven planning, Beads[](https://github.com/steveyegge/beads) for task decomposition, and Augmentcode AI for automated execution. The refactor emphasizes clean architecture, error handling, user-friendly interfaces, and compatibility with existing Augment workflows, ensuring high professionalism through comprehensive documentation, testing, and adherence to open-source standards.

### Key Requirements
1. **Modular Refactoring of 'html/css/js' Extension**:
   - Split the monolithic extension into three separate extensions: 'html' (handling markup structure, semantics, and accessibility), 'css' (styling, layouts, responsiveness, and preprocessors like Sass), and 'js' (scripting, DOM manipulation, event handling, and frameworks like React/Vue).
   - Ensure each extension can be installed, loaded, and operated independently without dependencies on the others.
   - Introduce a 'html-css-js' collection that bundles all three for easy group loading, maintaining backward compatibility with the original extension.
   - Update extension manifests, dependencies, and loading logic to support modular imports while avoiding code duplication.

2. **ConsoleGUI for Module Selection ('augx --gui')**:
   - Implement a text-based GUI (using libraries like blessed or inquirer for Node.js) that displays available modules and predefined collections.
   - Support multi-selection via checkboxes or lists, with search/filtering for large module sets.
   - Allow dynamic creation of custom collections during selection, persisted in a repo-specific config file (e.g., .augment/config.json).
   - Integrate seamlessly with the existing 'augx link' command, translating GUI selections into automated linking operations.

3. **Unlink/Uninstall Functionality**:
   - Add 'augx unlink <module|collection>' command to remove specific modules or collections, cleaning up associated files, configs, and VS Code settings without affecting unrelated parts.
   - Handle dependencies gracefully: warn or prevent unlinking if it would break other active modules.
   - Ensure uninstallation is reversible where possible, with logging of changes for auditability.

4. **Self-Removal Mechanism for Augment Extensions**:
   - Introduce 'augx self-remove' command that uninstalls all Augment extensions, removes the 'augx' tool itself, and cleans up any Augment-related artifacts (e.g., .augment directory, VS Code extensions.json entries).
   - Implement safeguards: require confirmation, perform dry-run previews, and verify no damage to repo integrity (e.g., no deletions of non-Augment files, preserved Git history).
   - Post-removal, provide guidance on re-installation if needed.

5. **Integration and Compatibility**:
   - Ensure all features work within VS Code's extension ecosystem, with proper handling of repo contexts and cross-platform compatibility (Windows, macOS, Linux).
   - Update Augment's core CLI and API to support these enhancements, including help documentation and error messaging.
   - Maintain performance: GUI should be lightweight, with operations completing in under 5 seconds for typical repos.

6. **Best Practices and Professionalism**:
   - Follow modular design principles (e.g., SOLID), with clear separation of UI, logic, and persistence layers.
   - Include extensive inline documentation, type definitions (TypeScript preferred), and adherence to coding standards (e.g., ESLint, Prettier).
   - Prioritize user experience: intuitive interfaces, accessibility in GUI (keyboard navigation), and comprehensive logging/telemetry (opt-in).
   - Align with security best practices: no execution of untrusted code during uninstall, secure config handling.

7. **Testing and Validation**:
   - Develop unit tests for modular loading/unloading, integration tests for GUI interactions and CLI commands, and end-to-end tests in sample repos.
   - Validate against edge cases: large repos, conflicting modules, interrupted operations, and post-removal repo stability.

This extension will be developed using the Augment framework, with this ticket converted into an OpenSpec specification for architectural detailing, followed by breakdown into Beads tasks for Augmentcode AI execution.

## Acceptance Criteria
- The 'html', 'css', and 'js' extensions install and function independently or as a 'html-css-js' collection in VS Code.
- 'augx --gui' launches a functional ConsoleGUI for multi-selecting and linking modules/collections, with selections persisted and applied correctly.
- 'augx unlink' removes specified modules/collections without side effects, handling dependencies appropriately.
- 'augx self-remove' fully uninstalls Augment extensions safely, leaving the repo unchanged except for Augment artifacts.
- All features are documented in README.md, with usage examples, command help, and configuration samples.
- Code passes linting, type checking, and comprehensive testing suites with 90%+ coverage.
- No performance regressions; operations remain efficient and user-friendly.
- Backward compatibility preserved: existing 'html/css/js' users can migrate seamlessly.

## Estimated Effort
- Design and Planning: 8 hours
- Implementation: 25 hours
- Testing and Documentation: 15 hours
- Total: 48 hours

## Attachments
- Links to referenced repositories: https://github.com/mytech-today-now/augment, https://github.com/Fission-AI/OpenSpec/, https://github.com/steveyegge/beads
- Sample feature examples (to guide OpenSpec and Beads phases):
  1. **Modular Extensions** – Frontend project setup
     Command: augx link html,css,js (or via GUI selection)
     Outcome: Individual extensions loaded; collection auto-detects and bundles if all selected.
  2. **GUI Multi-Selection** – Managing multiple modules
     Invocation: augx --gui
     Interface: List of modules (e.g., html, css, js, backend) and collections (e.g., frontend: [html,css,js]); select/deselect with space/enter.
  3. **Unlink Operation** – Removing a module
     Command: augx unlink css
     Outcome: CSS extension files/configs removed; warnings if JS depends on CSS styles.
  4. **Self-Remove** – Full uninstall
     Command: augx self-remove --confirm
     Outcome: All Augment traces gone; repo integrity verified via pre/post checksums.

## Next Steps
1. Convert this JIRA ticket into an OpenSpec specification for detailed architectural outlining.
2. Decompose the OpenSpec into a prioritized series of Beads tasks for phased execution by Augmentcode AI.
3. Assign tasks to development team or AI pipeline for implementation.