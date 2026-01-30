# VS Code Compatibility

## Overview

Augment Extensions is fully compatible with VS Code and provides seamless integration for AI-assisted development workflows.

## ✅ Verified Compatibility

### CLI Integration

The `augx` CLI works seamlessly in VS Code's integrated terminal:

```bash
# All commands work in VS Code terminal
augx list
augx show <module>
augx skill search <query>
augx skill inject <skill-id>
```

### Terminal Support

- ✅ **PowerShell** - Full support (Windows)
- ✅ **Bash** - Full support (Linux/macOS)
- ✅ **Command Prompt** - Full support (Windows)
- ✅ **Git Bash** - Full support (Windows)

### Skills System

The skills system is designed for VS Code integration:

1. **Dynamic Loading** - Skills load on-demand, reducing context overhead
2. **CLI Execution** - Skills with CLI commands execute in VS Code terminal
3. **JSON Output** - `--json` flag for programmatic consumption
4. **Search & Discovery** - Find skills quickly with `augx skill search`

### Module System

Modules integrate with VS Code workflows:

1. **Module Discovery** - `augx list` shows all available modules
2. **Module Viewing** - `augx show <module>` displays module content
3. **Selective Loading** - Link only needed modules to reduce context
4. **Version Control** - Git integration for module updates

## 🔧 Recommended VS Code Setup

### Extensions

Install these extensions for optimal experience:

```json
{
  "recommendations": [
    "augmentcode.augment-vscode",
    "ms-vscode.powershell",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Tasks Configuration

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Augment: List Modules",
      "type": "shell",
      "command": "augx list",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "Augment: List Skills",
      "type": "shell",
      "command": "augx skill list",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

### Keyboard Shortcuts

Add to `.vscode/keybindings.json`:

```json
[
  {
    "key": "ctrl+alt+a l",
    "command": "workbench.action.tasks.runTask",
    "args": "Augment: List Modules"
  },
  {
    "key": "ctrl+alt+a s",
    "command": "workbench.action.tasks.runTask",
    "args": "Augment: List Skills"
  }
]
```

## 📝 Usage in VS Code

### 1. Open Integrated Terminal

Press `` Ctrl+` `` or `View > Terminal`

### 2. Run Augment Commands

```bash
# List all modules
augx list

# Show specific module
augx show typescript-standards

# Search for skills
augx skill search "context retrieval"

# Inject skill into AI context
augx skill inject context-retrieval
```

### 3. Use with AI Assistant

The Augment VS Code extension automatically detects linked modules and skills, providing context-aware assistance.

## ✅ Compatibility Checklist

- [x] CLI commands work in VS Code terminal
- [x] Skills system integrates with VS Code workflows
- [x] Module system supports VS Code tasks
- [x] JSON output for programmatic consumption
- [x] Cross-platform terminal support (PowerShell, Bash, CMD)
- [x] Git integration for version control
- [x] No special configuration required
- [x] Works with Augment VS Code extension

## 🚀 Next Steps

1. Install Augment VS Code extension
2. Link relevant modules: `augx link <module>`
3. Discover skills: `augx skill list`
4. Start coding with AI assistance

## 📚 Related Documentation

- [Skills System](./SKILL_DEVELOPMENT.md)
- [Module Development](../.augment/rules/module-development.md)
- [CLI Reference](../README.md#cli-commands)

