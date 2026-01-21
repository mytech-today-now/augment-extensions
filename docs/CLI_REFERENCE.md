# CLI Reference

Complete reference for the `augx` CLI tool.

## Global Options

```bash
augx --version    # Show version
augx --help       # Show help
```

## Commands

### `augx init`

Initialize Augment Extensions in the current project.

```bash
augx init [options]
```

**Options:**
- `--from-submodule` - Initialize from existing git submodule

**Examples:**
```bash
augx init
augx init --from-submodule
```

---

### `augx list`

List available or linked extension modules.

```bash
augx list [options]
```

**Options:**
- `--linked` - Show only linked modules
- `--json` - Output as JSON

**Examples:**
```bash
augx list                  # All available modules
augx list --linked         # Only linked modules
augx list --json           # JSON output
```

---

### `augx show <module>`

Display detailed information about a module.

```bash
augx show <module> [options]
```

**Arguments:**
- `<module>` - Module name (e.g., `coding-standards/typescript`)

**Options:**
- `--json` - Output as JSON

**Examples:**
```bash
augx show coding-standards/typescript
augx show domain-rules/api-design --json
```

---

### `augx link <module>`

Link an extension module to the current project.

```bash
augx link <module> [options]
```

**Arguments:**
- `<module>` - Module name to link

**Options:**
- `--version <version>` - Specific version to link

**Examples:**
```bash
augx link coding-standards/typescript
augx link coding-standards/python --version 2.1.0
```

---

### `augx unlink <module>`

Unlink an extension module from the current project.

```bash
augx unlink <module>
```

**Arguments:**
- `<module>` - Module name to unlink

**Examples:**
```bash
augx unlink coding-standards/typescript
```

---

### `augx update`

Update linked modules to latest versions.

```bash
augx update [options]
```

**Options:**
- `--module <name>` - Update specific module only

**Examples:**
```bash
augx update                                    # Update all
augx update --module coding-standards/typescript  # Update one
```

---

### `augx search <keyword>`

Search for extension modules.

```bash
augx search <keyword> [options]
```

**Arguments:**
- `<keyword>` - Search term

**Options:**
- `--type <type>` - Filter by module type

**Examples:**
```bash
augx search typescript
augx search api --type domain-rules
```

---

### `augx create <name>`

Create a new extension module.

```bash
augx create <name> [options]
```

**Arguments:**
- `<name>` - Module name

**Options:**
- `--type <type>` - Module type (coding-standards, domain-rules, examples)

**Examples:**
```bash
augx create my-standards --type coding-standards
```

---

### `augx validate <module>`

Validate module structure and metadata.

```bash
augx validate <module>
```

**Arguments:**
- `<module>` - Module name to validate

**Examples:**
```bash
augx validate coding-standards/typescript
```

---

### `augx pin <module> <version>`

Pin module to specific version.

```bash
augx pin <module> <version>
```

**Arguments:**
- `<module>` - Module name
- `<version>` - Version to pin

**Examples:**
```bash
augx pin coding-standards/typescript 1.2.0
```

---

### `augx check-updates`

Check for available module updates.

```bash
augx check-updates
```

**Examples:**
```bash
augx check-updates
```

---

### `augx diff <module>`

Show differences between current and latest version.

```bash
augx diff <module>
```

**Arguments:**
- `<module>` - Module name

**Examples:**
```bash
augx diff coding-standards/typescript
```

---

## JSON Output Format

When using `--json` flag, output follows this structure:

```json
{
  "modules": [
    {
      "name": "coding-standards/typescript",
      "version": "1.0.0",
      "description": "TypeScript coding standards",
      "type": "coding-standards",
      "linked": true
    }
  ]
}
```

## Exit Codes

- `0` - Success
- `1` - General error
- `2` - Invalid arguments
- `3` - Module not found
- `4` - Not initialized

## Environment Variables

- `AUGX_REPO` - Custom module repository URL
- `AUGX_NO_COLOR` - Disable colored output
- `AUGX_DEBUG` - Enable debug logging

