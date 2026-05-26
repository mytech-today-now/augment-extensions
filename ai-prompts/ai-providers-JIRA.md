# JIRA Ticket: TBD - Add Configurable AI Providers to Augment Extensions Module Generator

### Summary
Add a TypeScript-based module generator to the `augx` CLI that uses user-supplied external AI APIs to scaffold and generate augment-extensions modules. The new `augx generate` command uses a selectable AI provider instead of relying solely on Augment Code AI within VS Code. Add CLI and GUI support for configuring providers, initially supporting Anthropic, OpenAI, and Google AI, while also allowing users to add their own custom providers, store multiple named profiles per provider, switch the active provider, and route generation requests through the currently selected AI backend. Provider credentials are stored in the `.env` file at the repo root.

> **Note — When to use external AI vs Augment Code AI**:
> Augment Code AI remains the primary tool for *developing, reviewing, and maintaining* code in this repository. The external-AI module generator addresses a different use case: **batch or automated generation of new augment-extensions modules** where the user wants to leverage a specific model, compare outputs across providers, or run generation outside of VS Code. Use external AI when:
> - Generating boilerplate module scaffolds in bulk (e.g., many coding-standards modules at once).
> - Comparing outputs from different models (Anthropic vs OpenAI vs Google) for quality selection.
> - Running headless or CI-driven module generation where VS Code is not available.
> - The user explicitly requests a specific external model for content generation.
>
> Continue using Augment Code AI when:
> - Iterating on existing module content interactively within VS Code.
> - Performing code review, refactoring, or debugging of the CLI itself.
> - Working within a normal development session where Augment's context engine adds value.

### Description

#### Background
The augment-extensions repository provides a CLI (`augx`) and a library of extension modules (coding standards, domain rules, workflows, etc.). Currently, creating new modules is a manual or Augment-Code-AI-assisted process inside VS Code. This is ideal for interactive development but does not cover batch generation, headless CI pipelines, or scenarios where a user wants to compare outputs from different AI providers before committing a module.

This work should introduce:
1. A **provider abstraction layer** (TypeScript) that separates module-generation logic from any single AI backend.
2. An `augx generate` command that scaffolds and populates new augment-extensions modules by calling the currently active external AI provider.
3. Configuration support so users can manage multiple providers and profiles, switch between them, and persist credentials in `.env`.

#### Key Requirements
- **Provider Abstraction**: Create a TypeScript provider interface (`AiProvider`) in `cli/src/utils/ai-provider.ts` so all generation commands resolve the active backend through a shared abstraction rather than hard-coding a single API.
- **Selectable Provider Execution**: Ensure `augx generate <module-type> <module-name>` resolves and uses the currently active provider/profile automatically.
- **`.env`-Based Credential Storage**: Read and write all provider API keys and active-profile state using `dotenv`; never overwrite unrelated variables in `.env`.
- **Multiple Provider Support**:
  - Initially support configuration for Anthropic, OpenAI, and Google AI.
  - Allow the architecture to expand cleanly to additional providers in future releases.
- **User-Added Provider Support**:
  - Allow users to register and configure their own AI providers in addition to the built-in providers.
  - Support extension points or a plugin-style registration mechanism for custom/community providers.
  - Ensure the design can accommodate open-source or self-hosted providers and adapters such as Ollama (`https://github.com/ollama/ollama`), LocalAI (`https://github.com/mudler/LocalAI`), vLLM (`https://github.com/vllm-project/vllm`), and text-generation-webui (`https://github.com/oobabooga/text-generation-webui`).
- **Multiple Named Profiles**:
  - Allow users to save multiple named configurations for the same provider.
  - Support use cases such as personal, work, client, and testing profiles.
- **CLI Provider Management**:
  - Add CLI subcommands to create, edit, list, validate, delete, and switch AI provider configurations via `augx provider <action>`.
  - Make provider/profile selection explicit, persistent, and easy to inspect.
- **CLI Help and Version Support**:
  - Ensure new and refactored CLI subcommands support `-h` and `--help` for usage guidance.
  - Ensure new and refactored CLI subcommands support `-v` and `--version` where appropriate so users can inspect the active CLI version consistently.
  - Keep help output clear, discoverable, and aligned with existing `commander`-based CLI conventions in this repo.
- **Persistent Configuration Storage**:
  - Store provider settings in the `.env` file using `dotenv`.
  - Persist the active provider/profile selection across runs via `AI_ACTIVE_PROVIDER` and `AI_ACTIVE_PROFILE` keys.
  - Handle API keys and related secrets securely; mask secrets in all output.
- **GUI Configuration Workflow**:
  - Implement `augx provider configure` to open a guided `inquirer` flow for selecting a provider and entering required settings.
  - Allow users to create, edit, validate, save, and activate provider profiles from the interactive prompt.
- **Unified GUI Management Experience**:
  - Extend `augx gui` so users can manage AI provider settings alongside module management and other platform workflows.
  - Ensure the GUI reflects the current active provider/profile consistently.
- **Module Generation Output**:
  - `augx generate` must produce valid augment-extensions module structure:
    - **Required**: `module.json`, `README.md`, `rules/` (with at least one `.md` file)
    - **Recommended**: `examples/`
    - **Optional**: `config/` (schema and defaults), `templates/`, `tests/`, `docs/`, `src/`, `CHANGELOG.md`
  - Generated content must conform to the module schema validated by `augx validate`.
  - Support `--dry-run` to preview generated content without writing files.
- **Validation and Error Handling**:
  - Validate provider settings before activation or runtime use.
  - Surface clear errors for missing credentials, invalid models, unsupported providers, or failed connectivity.
  - Provide actionable recovery guidance in both CLI and GUI experiences.
- **Security and Professionalism**:
  - Never expose secrets in normal output; mask them as `sk-***...***` in status displays.
  - Keep command flows intuitive and appropriate for developers and module authors.
  - Preserve a seamless workflow where users configure once and then use `augx generate` normally.
- **Testing and Documentation**:
  - Add tests for provider selection, profile persistence, command routing, validation behavior, and failure paths.
  - Document provider setup, switching workflows, GUI behavior, and security expectations.

This ticket should be suitable for follow-on conversion into an OpenSpec change and subsequent decomposition into Beads tasks.

### Acceptance Criteria
- `augx generate <module-type> <module-name>` and other supported generation commands use the currently active configured provider/profile read from `.env`.
- Initial provider configuration support includes Anthropic, OpenAI, and Google AI.
- Users can register and use custom AI providers in addition to the built-in providers.
- Users can add, store, list, edit, validate, delete, and switch multiple provider configurations via `augx provider <action>`.
- Users can maintain multiple named profiles for the same provider.
- New and refactored CLI subcommands support `-h` / `--help` and `-v` / `--version` consistently with the existing `commander`-based CLI.
- `augx provider configure` provides a guided provider setup and activation flow.
- `augx gui` includes AI provider management alongside existing module and platform workflows.
- Provider/profile selection persists across restarts via `.env` and stays consistent between CLI and GUI.
- Sensitive credentials are stored in `.env`, masked in all output, and never logged.
- Adding a new provider requires minimal changes because the implementation uses a reusable provider abstraction importable as `import { resolveActiveProvider } from './utils/ai-provider'`.
- The provider model supports community, open-source, or self-hosted integrations through documented extension points.
- Generated modules pass `augx validate` and conform to the standard module structure: required (`module.json`, `README.md`, `rules/` with at least one `.md`), recommended (`examples/`), optional (`config/`, `templates/`, `tests/`, `docs/`, `src/`, `CHANGELOG.md`).
- Documentation and automated tests cover the core configuration, switching, validation, generation, and command-routing behaviors.

### Estimated Effort
- Design and Planning: 8 hours
- Provider Abstraction and CLI Commands (TypeScript): 16 hours
- Module Generator Implementation: 12 hours
- GUI Configuration and Management Flows: 14 hours
- Testing and Documentation: 10 hours
- Total: 60 hours

### Attachments
- Source prompt: `ai-prompts/ai-provider-selection-prompt.md`
- Main CLI entry point: `cli/src/cli.ts` (commander-based)
- Credential storage: `.env` (repo root) — managed via `dotenv`
- Proposed new files:
  - `cli/src/utils/ai-provider.ts` — Provider abstraction interface and resolver
  - `cli/src/commands/generate.ts` — Module generation command
  - `cli/src/commands/provider.ts` — Provider management subcommands
- Example implementation themes to guide OpenSpec and Beads breakdown:
  - Provider abstraction layer
    Goal: route all module-generation commands through a shared TypeScript provider interface
    Key rule: "Command handlers must resolve the active backend through the provider abstraction rather than direct integration-specific logic."
  - Provider configuration model
    Goal: support multiple providers and multiple named profiles per provider, with initial support for Anthropic, OpenAI, and Google AI; persist state in `.env`
    Key rule: "Separate provider metadata, credentials, and active-profile state so runtime resolution is deterministic."
  - Custom provider extensibility
    Goal: allow users to add their own providers, including community or open-source adapters
    Key rule: "Built-in providers should use the same extension model exposed to user-defined providers wherever practical."
  - CLI management workflow
    Goal: create, inspect, update, validate, delete, and switch provider profiles from the command line via `augx provider <action>`
    Key rule: "Provider management subcommands must be explicit, discoverable, and consistent with the existing `commander`-based CLI conventions."
  - CLI help and version behavior
    Goal: make command discovery easy for all users
    Key rule: "All new and refactored subcommands must expose `-h`/`--help` and `-v`/`--version` behavior consistently."
  - Secure credential handling
    Goal: protect API keys stored in `.env`; mask secrets in all terminal output
    Key rule: "Never print secrets in normal output; validate required credentials before activation or runtime use."
  - GUI provider setup
    Goal: guide users through provider selection, configuration, validation, and activation via `inquirer` interactive prompts
    Key rule: "The configuration flow should be clear enough for non-technical users while still supporting advanced provider settings."
  - Unified GUI management
    Goal: manage providers and module workflows in one place via `augx gui`
    Key rule: "The main GUI should reflect the active provider/profile and keep provider-management actions easy to find."
  - Module generation pipeline
    Goal: produce valid augment-extensions modules from AI-generated content
    Key rule: "Generated output must conform to the existing module schema and pass `augx validate` before being written to disk."
  - Open-source provider compatibility
    Goal: support user-added integrations for alternative backends and community projects such as Ollama
    Key rule: "Provider registration and configuration should not assume a closed list of vendor-owned backends."