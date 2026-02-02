---
type: "always_apply"
---

# Augment Extensions Workflow

## Purpose

This repository provides extension modules for Augment Code AI that exceed the standard `.augment/` character limit.

**Problem**: Augment Code AI's `.augment/` folder is limited to ~49,400 characters
**Solution**: Store unlimited content in extension modules outside `.augment/` folder

---

## Repository Structure

```
augment-extensions/
├── .augment/                    # Core rules (this folder, ~49,400 char limit)
│   └── rules/
│       ├── character-count-management.md
│       ├── no-unnecessary-docs.md
│       ├── module-development.md
│       └── augment-extensions-workflow.md
├── augment-extensions/          # Extension modules (no limit)
│   ├── coding-standards/
│   │   └── typescript/
│   ├── workflows/
│   │   ├── openspec/
│   │   └── beads/
│   └── domain-rules/
├── cli/                         # CLI tool (augx)
│   └── src/
├── docs/                        # Documentation
├── AGENTS.md                    # AI agent integration
├── README.md                    # Project overview
└── MODULES.md                   # Module catalog
```

---

## Core Workflows

### 1. Creating a New Module

**Steps:**

1. **Choose category**: coding-standards, domain-rules, workflows, or examples
2. **Create directory structure**:
   ```bash
   mkdir -p augment-extensions/[category]/[module-name]/rules
   mkdir -p augment-extensions/[category]/[module-name]/examples
   ```
3. **Create module.json** with metadata
4. **Create README.md** with overview
5. **Create rule files** in `rules/` directory
6. **Create examples** in `examples/` directory (optional)
7. **Calculate character count**:
   ```powershell
   Get-ChildItem -Path "augment-extensions/[category]/[module-name]" -Recurse -File | Get-Content -Raw | Measure-Object -Character | Select-Object -ExpandProperty Characters
   ```
8. **Update module.json** with character count
9. **Update MODULES.md** catalog
10. **Commit changes**

### 2. Updating an Existing Module

**Steps:**

1. **Make changes** to module files
2. **Recalculate character count**
3. **Update module.json**:
   - Increment version (MAJOR.MINOR.PATCH)
   - Update character count
4. **Update MODULES.md** if needed
5. **Commit changes** with version in message

### 3. Using Modules in Projects

**With CLI (future)**:
```bash
augx link [category]/[module-name]
augx show [module-name]
```

**Without CLI (current)**:
- Copy module contents to project's `.augment/` folder
- Reference module files from this repository
- Include module rules in project's AGENTS.md

---

## File Naming Conventions

### Module Names

- Use kebab-case: `typescript-standards`, `openspec-workflow`
- Be descriptive and specific
- Avoid abbreviations unless widely known

### Rule Files

- Use kebab-case: `naming-conventions.md`, `best-practices.md`
- Common names:
  - `workflow.md` - Main workflow guide
  - `best-practices.md` - Tips and patterns
  - `manual-setup.md` - Setup without CLI
  - `file-format.md` - File format specifications
  - `commands.md` - Command reference

### Example Files

- Use descriptive names: `complete-change-example.md`, `authentication-workflow.md`
- Include "example" in filename when appropriate

---

## Content Guidelines

### Writing Style

- **Clear and concise**: Use simple language
- **Actionable**: Provide specific steps
- **Comprehensive**: Cover all scenarios
- **Examples**: Include code examples
- **Formatting**: Use markdown formatting consistently

### Code Examples

- Use proper syntax highlighting
- Include comments
- Show both "with CLI" and "without CLI" approaches (for workflows)
- Provide complete, working examples

### Documentation Structure

**Every rule file should have:**
1. Overview/Purpose
2. Step-by-step instructions
3. Examples
4. Best practices
5. Common pitfalls

---

## Integration with AI Agents

### AGENTS.md Convention

This repository follows the `AGENTS.md` convention used by OpenSpec and Beads.

**Purpose**: Provide AI agents with project-specific instructions

**Location**: Root of repository (`AGENTS.md`)

**Contents**:
- How to discover modules (`augx list`)
- How to view module content (`augx show`)
- How to apply module rules
- Module structure explanation

### AI Agent Workflow

1. **Human initializes**: `augx init` (future)
2. **Human links modules**: `augx link coding-standards/typescript`
3. **AI agent queries**: `augx show typescript-standards`
4. **AI agent applies**: Follow rules from module content

---

## Character Limit Management

### .augment/ Folder

**Target**: 48,599 - 49,299 characters

**Current files**:
- `character-count-management.md`
- `no-unnecessary-docs.md`
- `module-development.md`
- `augment-extensions-workflow.md`

**Verification**:
```powershell
Get-ChildItem -Path ".augment" -Recurse -File | Get-Content -Raw | Measure-Object -Character | Select-Object -ExpandProperty Characters
```

### Extension Modules

**No limit** - Store unlimited content in `augment-extensions/` directory

**Guidelines**:
- Small: < 10,000 characters
- Medium: 10,000 - 25,000 characters
- Large: 25,000 - 50,000 characters
- Split if > 50,000 characters

---

## Quality Standards

### Before Committing

- [ ] Character counts updated
- [ ] Versions incremented (if applicable)
- [ ] MODULES.md catalog updated
- [ ] No typos or formatting errors
- [ ] Examples tested and working
- [ ] Links verified
- [ ] Consistent formatting

### Code Review Checklist

- [ ] Module structure correct
- [ ] Metadata complete and accurate
- [ ] Content clear and actionable
- [ ] Examples comprehensive
- [ ] No project-specific content
- [ ] Follows naming conventions
- [ ] Character counts within guidelines

---

## Common Tasks

### Add a new coding standard module

```bash
mkdir -p augment-extensions/coding-standards/python/rules
# Create module.json, README.md, rule files
# Calculate character count
# Update MODULES.md
```

### Add a new workflow module

```bash
mkdir -p augment-extensions/workflows/new-workflow/rules
mkdir -p augment-extensions/workflows/new-workflow/examples
# Create module.json, README.md, rule files, examples
# Calculate character count
# Update MODULES.md
```

### Update existing module

```bash
# Edit module files
# Recalculate character count
# Update module.json (version + characterCount)
# Update MODULES.md if needed
# Commit with version in message
```

