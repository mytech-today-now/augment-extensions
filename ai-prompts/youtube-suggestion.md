# JIRA Ticket: AUG-EXT-001 - Refactor Augment-Extensions for Token-Efficient Tool Integration Using Skills and CLI

## Summary
Enhance the Augment-Extensions framework (from https://github.com/mytech-today-now/augment) by refactoring its tool integration mechanism to minimize token consumption during code generation and execution. Implement a skills-based architecture combined with CLI tools, replacing or augmenting traditional MCP (Multi-Cloud Provider) server bundles. This will reduce context window usage by injecting minimal prompts only when relevant skills are retrieved, enabling scalable extension to hundreds of integrations while maintaining performance. The refactoring will leverage best practices from open-source tools like MCP Porter for CLI-based MCP execution, ensuring compatibility with Augmentcode AI generation workflows. Target a token reduction of at least 70% based on experimental benchmarks, without compromising functionality.

## Description
The current Augment-Extensions implementation loads tool bundles (e.g., JSON schemas and descriptions) into the agent's context window indiscriminately, leading to unnecessary token consumption even for irrelevant tasks. This limits scalability as adding more tools exponentially increases context overhead.

To address this, refactor the system to adopt a "skills + CLI" paradigm:
- **Skills**: Define skills as lightweight Markdown files (.md) containing concise prompts that are injected into the agent's context only when the skill is explicitly retrieved. Each skill includes:
  - A brief description for when to use it.
  - Instructions on utilizing associated resources or CLI commands.
  - Minimal token footprint (aim for 10-50 tokens per skill).
- **CLI Tools**: Migrate tool executions to command-line interfaces (CLI) that the agent can invoke dynamically. This allows:
  - Running MCP functions via CLI without loading full schemas upfront.
  - Piping commands, handling errors, waiting on processes, and chaining actions.
  - Integration with open-source tools like MCP Porter (https://github.com/some-repo/mcp-porter or equivalent) to wrap MCP servers in CLI commands.
- **Integration with Existing Frameworks**:
  - Align with OpenSpec (https://github.com/Fission-AI/OpenSpec/) for generating specifications from this ticket.
  - Use Beads (https://github.com/steveyegge/beads) for breaking down the implementation into granular, executable tasks.
  - Ensure seamless operation within VS Code against a repository, using Augmentcode AI for code generation.
- **Efficiency Goals**:
  - Reduce token usage by avoiding constant loading of tool descriptions; load only on-demand via skills.
  - Enable addition of thousands of skills without context blow-up.
  - Support advanced actions like browser testing, design reviews, or external integrations (e.g., similar to Agent Browser or Super Design CLI) through CLI without heavy MCP overhead.
- **Scope**:
  - Refactor core extension features for code crafting to use this new mechanism.
  - Provide examples for converting existing MCPs (e.g., context retrieval, SDK queries) to skills + CLI.
  - Include a "add new MCP skill" meta-skill to automate onboarding new integrations.
  - Maintain compatibility with Augmentcode AI, ensuring generated code adheres to the refactored architecture.

This refactoring will make Augment-Extensions more performant for large-scale AI-driven coding tasks, aligning with industry trends toward token-efficient agent extensions.

## Acceptance Criteria
- **Token Reduction**: Demonstrate at least 70% reduction in context window tokens for a benchmark task (e.g., querying an SDK doc via context tool) compared to the current implementation. Use logging or metrics to validate.
- **Scalability**: Successfully add and execute 100+ simulated skills without exceeding 1,000 additional tokens in baseline context.
- **Functionality Preservation**: All existing Augment-Extensions features (e.g., code crafting, tool invocations) must work equivalently or better under the new system.
- **CLI Integration**: Implement CLI wrappers for at least 3 sample MCPs using MCP Porter; agent can invoke them via commands like `mpx mcp-porter call <function> --params`.
- **Skill Format**: Skills are stored as .md files with sections for "Description", "Instructions", and "Resources/CLI Commands". Loading a skill injects only its content dynamically.
- **Automation**: The "add new MCP skill" skill automates: installing/testing MCP, generating skill.md, and updating config.
- **Compatibility**: Runs flawlessly in VS Code repo environment; integrates with OpenSpec for spec generation and Beads for task decomposition.
- **Documentation**: Update README.md with setup instructions, examples, and migration guide from old MCP-based setup.
- **Testing**: Unit tests for skill loading/injection, CLI execution, and end-to-end workflows. Include error handling for CLI failures.
- **Professional Standards**: Code follows best practices (e.g., modular, readable, PEP-8 compliant if Python); no redundancies in prompts or implementations.

## Tasks
1. **Research and Planning**:
   - Review current Augment-Extensions codebase for tool loading mechanisms.
   - Study MCP Porter and similar OSS tools for CLI wrapping.
   - Define skill.md schema and injection logic.

2. **Core Refactoring**:
   - Implement dynamic skill loader that retrieves and injects .md content on-demand.
   - Build CLI interface layer for tool executions, integrating MCP Porter.

3. **Migrate Existing Features**:
   - Convert 3-5 key MCPs to skills + CLI (e.g., context resolution, SDK queries).
   - Develop the "add new MCP skill" meta-skill.

4. **Integration and Testing**:
   - Ensure VS Code extension compatibility.
   - Write tests and benchmarks for token usage.
   - Generate OpenSpec spec from this ticket for validation.

5. **Documentation and Release**:
   - Update docs and examples.
   - Prepare for Beads task decomposition.

## Priority
High

## Assignee
TBD (Augmentcode AI Team)

## Labels
refactor, performance, ai-efficiency, extensions

## Estimated Effort
20 story points (2-3 weeks for a mid-level developer, including testing).

## Dependencies
- Access to repositories: https://github.com/mytech-today-now/augment, https://github.com/Fission-AI/OpenSpec/, https://github.com/steveyegge/beads.
- Augmentcode AI setup for code generation.

## Risks
- Potential breaking changes to existing workflows; mitigate with backward compatibility flags.
- CLI dependencies on external tools; ensure fallbacks or mocks for testing.