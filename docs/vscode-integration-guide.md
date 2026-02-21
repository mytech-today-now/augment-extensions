# VS Code Integration Guide for Module Inspection

## Overview

This guide covers integrating Augment Extensions module inspection with Visual Studio Code for enhanced development workflows.

## Features

### 1. Direct File Opening

Open module files directly in VS Code from the CLI:

```bash
# Open file in VS Code editor
augx show module typescript-standards rules/naming.md --open

# Open file in preview pane
augx show module typescript-standards rules/naming.md --preview
```

### 2. Clickable Terminal Links

When running in VS Code terminal, file paths are automatically clickable:

```bash
augx show module php-standards
# Output includes clickable links to files
```

### 3. VS Code Tasks Integration

Create `.vscode/tasks.json` to integrate module inspection into your workflow:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Inspect Module",
      "type": "shell",
      "command": "augx show module ${input:moduleName}",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Search Modules",
      "type": "shell",
      "command": "augx search ${input:searchTerm}",
      "presentation": {
        "reveal": "always"
      }
    },
    {
      "label": "List Linked Modules",
      "type": "shell",
      "command": "augx list --linked",
      "presentation": {
        "reveal": "always"
      }
    },
    {
      "label": "Generate Module Report",
      "type": "shell",
      "command": "augx show module ${input:moduleName} --content --format markdown > docs/${input:moduleName}-report.md",
      "presentation": {
        "reveal": "always"
      }
    }
  ],
  "inputs": [
    {
      "id": "moduleName",
      "type": "promptString",
      "description": "Module name to inspect"
    },
    {
      "id": "searchTerm",
      "type": "promptString",
      "description": "Search term"
    }
  ]
}
```

### 4. Keyboard Shortcuts

Add to `.vscode/keybindings.json`:

```json
[
  {
    "key": "ctrl+alt+m",
    "command": "workbench.action.tasks.runTask",
    "args": "Inspect Module"
  },
  {
    "key": "ctrl+alt+s",
    "command": "workbench.action.tasks.runTask",
    "args": "Search Modules"
  }
]
```

### 5. Workspace Settings

Recommended `.vscode/settings.json`:

```json
{
  "terminal.integrated.enableFileLinks": true,
  "terminal.integrated.wordSeparators": " ()[]{}',\"`─''",
  "files.associations": {
    "*.augment.json": "jsonc",
    ".augment/extensions.json": "jsonc"
  }
}
```

## Workflows

### Workflow 1: Module Discovery

1. Open VS Code integrated terminal (`` Ctrl+` ``)
2. Run `augx list` to see available modules
3. Click on module names to explore
4. Use `augx show module <name>` for details

### Workflow 2: Code Review with Standards

1. Open file to review
2. Run task "Inspect Module" (Ctrl+Alt+M)
3. Enter module name (e.g., "typescript-standards")
4. Review standards in new terminal panel
5. Click links to open specific rules

### Workflow 3: Documentation Generation

1. Run task "Generate Module Report"
2. Enter module name
3. Report generated in `docs/` folder
4. Open generated markdown file
5. Preview with Ctrl+Shift+V

### Workflow 4: AI-Assisted Development

1. Inspect module: `augx show module <name> --ai-prompt`
2. Copy generated AI prompt
3. Paste into AI assistant
4. Get context-aware code suggestions

## Advanced Integration

### Custom Tasks for Specific Modules

```json
{
  "label": "Review TypeScript Standards",
  "type": "shell",
  "command": "augx show module typescript-standards --content --format markdown | code -",
  "presentation": {
    "reveal": "always",
    "panel": "dedicated"
  }
}
```

### Output Channel Integration

Create a dedicated output channel for module inspection:

```json
{
  "label": "Module Inspection Output",
  "type": "shell",
  "command": "augx show module ${input:moduleName} --format text",
  "presentation": {
    "reveal": "always",
    "panel": "dedicated",
    "showReuseMessage": false,
    "clear": true
  },
  "problemMatcher": []
}
```

## Tips

1. **Use Preview Mode**: `--preview` flag opens files in preview tab, keeping your workspace clean
2. **Clickable Links**: File paths in terminal output are automatically clickable in VS Code
3. **JSON Output**: Use `--json` flag for programmatic processing
4. **Workspace Detection**: CLI automatically detects VS Code workspace for relative paths
5. **Terminal Integration**: Run commands directly in VS Code terminal for best experience

## Troubleshooting

**Links not clickable:**
- Ensure `terminal.integrated.enableFileLinks` is true
- Check that paths are properly formatted

**Files not opening:**
- Verify `code` CLI is in PATH
- Run `code --version` to test

**Tasks not appearing:**
- Reload window (Ctrl+Shift+P > "Reload Window")
- Check tasks.json syntax

## See Also

- [Module Inspection Commands](./commands/module-inspection.md)
- [VS Code Compatibility](./VSCODE_COMPATIBILITY.md)
- [AI Integration Guide](./ai-integration-guide.md)

