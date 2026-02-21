# VS Code Configuration Examples for Augment Extensions

This directory contains example VS Code configuration files for integrating Augment Extensions into your development workflow.

## Files

### tasks.json
Predefined tasks for common Augment Extensions operations:
- List modules
- Inspect modules
- Search modules
- Generate reports
- Generate AI prompts
- Link/unlink modules

**Installation**:
```bash
# Copy to your project
cp examples/vscode/tasks.json .vscode/tasks.json

# Or merge with existing tasks.json
```

**Usage**:
- Press `Ctrl+Shift+P` (Cmd+Shift+P on macOS)
- Type "Tasks: Run Task"
- Select an Augx task

### settings.json
Recommended VS Code settings for Augment Extensions:
- Terminal integration
- File associations
- Editor settings
- Markdown configuration

**Installation**:
```bash
# Copy to your project
cp examples/vscode/settings.json .vscode/settings.json

# Or merge with existing settings.json
```

### keybindings.json
Keyboard shortcuts for quick access to Augment Extensions tasks:
- `Ctrl+Alt+M` - Inspect Module
- `Ctrl+Alt+L` - List Linked Modules
- `Ctrl+Alt+S` - Search Modules
- `Ctrl+Alt+A` - Generate AI Context
- `Ctrl+Alt+R` - Generate AI Review Prompt
- `Ctrl+Alt+C` - Show Module Content

**Installation**:
```bash
# Copy to your user settings
# Windows: %APPDATA%\Code\User\keybindings.json
# macOS: ~/Library/Application Support/Code/User/keybindings.json
# Linux: ~/.config/Code/User/keybindings.json
```

## Quick Start

1. **Copy configuration files**:
   ```bash
   mkdir -p .vscode
   cp examples/vscode/tasks.json .vscode/
   cp examples/vscode/settings.json .vscode/
   ```

2. **Install recommended extensions**:
   - Augment Code AI
   - Markdown All in One
   - JSON Tools
   - GitLens

3. **Test integration**:
   - Press `Ctrl+Shift+P`
   - Run "Tasks: Run Task"
   - Select "Augx: List All Modules"

4. **Set up keyboard shortcuts** (optional):
   - Copy keybindings.json to your user settings
   - Customize shortcuts as needed

## Customization

### Adding Custom Tasks

Edit `.vscode/tasks.json` to add your own tasks:

```json
{
  "label": "My Custom Task",
  "type": "shell",
  "command": "augx show module my-module --custom-flag",
  "presentation": {
    "reveal": "always",
    "panel": "new"
  }
}
```

### Changing Keyboard Shortcuts

Edit keybindings.json to change shortcuts:

```json
{
  "key": "ctrl+alt+x",
  "command": "workbench.action.tasks.runTask",
  "args": "Your Task Name"
}
```

### Project-Specific Settings

Add project-specific settings to `.vscode/settings.json`:

```json
{
  "augment.extensions.defaultModule": "typescript-standards",
  "augment.extensions.autoLink": true
}
```

## Workflows

### Code Review Workflow

1. Press `Ctrl+Alt+R` to generate review prompt
2. Paste your code into the prompt
3. Send to AI assistant
4. Apply recommendations

### Module Discovery Workflow

1. Press `Ctrl+Alt+L` to list linked modules
2. Press `Ctrl+Alt+M` to inspect a module
3. Press `Ctrl+Alt+C` to view module content
4. Click file links to open in editor

### AI Integration Workflow

1. Press `Ctrl+Alt+A` to generate AI context
2. Context copied to clipboard
3. Paste into AI assistant
4. Get context-aware code suggestions

## Troubleshooting

**Tasks not appearing**:
- Reload window: `Ctrl+Shift+P` > "Reload Window"
- Check tasks.json syntax
- Ensure augx CLI is installed

**Keyboard shortcuts not working**:
- Check for conflicts: `Ctrl+K Ctrl+S`
- Verify keybindings.json syntax
- Restart VS Code

**File links not clickable**:
- Enable file links in settings
- Check terminal.integrated.enableFileLinks
- Ensure paths are properly formatted

## See Also

- [VS Code Integration Guide](../../docs/vscode-integration-guide.md)
- [AI Integration Guide](../../docs/ai-integration-guide.md)
- [Module Inspection Commands](../../docs/commands/module-inspection.md)

