# Screenplay File Organization

## Purpose

This document defines the file organization structure for screenplay projects generated using the `writing-standards/screenplay` module in Augment Extensions.

---

## Directory Structure

### Root Directory: `screenplays/`

All screenplay projects are organized under a top-level `screenplays/` directory in the repository root.

```
repository-root/
├── screenplays/              # Top-level screenplay directory
│   ├── project-name-1/       # Individual screenplay project
│   │   ├── screenplay.fountain
│   │   ├── outline.md
│   │   ├── characters/
│   │   └── notes/
│   ├── project-name-2/
│   └── ...
├── .beads/
├── openspec/
└── ...
```

---

## Project Naming Convention

Project directories are named using the following priority:

1. **OpenSpec Spec Name** (highest priority)
   - If an active OpenSpec change exists, use the change directory name
   - Example: `openspec/changes/heist-movie/` → `screenplays/heist-movie/`

2. **Beads Epic ID** (second priority)
   - If a Beads epic with `screenplay` or `writing-standards` labels exists, use the epic ID
   - Example: Epic `bd-scr-org` → `screenplays/bd-scr-org/`

3. **Timestamp Fallback** (lowest priority)
   - If neither OpenSpec nor Beads context is available, use a timestamped name
   - Format: `screenplay-YYYY-MM-DD`
   - Example: `screenplays/screenplay-2026-02-03/`

---

## Conflict Resolution

If a project directory already exists, the system handles conflicts using one of these strategies:

### Append Number (Default)
```
screenplays/heist-movie/      # Original
screenplays/heist-movie-1/    # First conflict
screenplays/heist-movie-2/    # Second conflict
```

### Append Timestamp
```
screenplays/heist-movie/                    # Original
screenplays/heist-movie-2026-02-03T14-30/  # Conflict with timestamp
```

### Error on Conflict
Throw an error and require manual resolution.

---

## File Placement

All screenplay-related files MUST be placed within the project directory:

### Primary Files
- `screenplay.fountain` - Main screenplay in Fountain format
- `screenplay.pdf` - Exported PDF (if generated)
- `outline.md` - Story outline

### Supporting Directories
- `characters/` - Character profiles and development
- `notes/` - Research, brainstorming, and notes
- `drafts/` - Previous versions and drafts
- `assets/` - Images, references, and other media

### Example Structure
```
screenplays/heist-movie/
├── screenplay.fountain          # Main screenplay
├── outline.md                   # Story outline
├── beat-sheet.yaml              # Save the Cat beat sheet
├── characters/
│   ├── protagonist.yaml
│   ├── antagonist.yaml
│   └── supporting-cast.yaml
├── notes/
│   ├── research.md
│   ├── brainstorming.md
│   └── feedback.md
├── drafts/
│   ├── draft-1.fountain
│   └── draft-2.fountain
└── assets/
    ├── location-photos/
    └── character-sketches/
```

---

## Persistence During Cleanup

The `screenplays/` directory and all its contents MUST be preserved during cleanup operations.

### Protected Paths
- `screenplays/` (entire directory)
- All subdirectories and files within `screenplays/`

### Cleanup Exemptions
When running `augment-extensions self-remove` or similar cleanup commands:
- ✅ Remove temporary augment-extensions files
- ✅ Remove cached module data
- ❌ **DO NOT** remove `screenplays/` directory
- ❌ **DO NOT** remove any screenplay project directories
- ❌ **DO NOT** remove any user-generated creative content

---

## Integration with Workflows

### OpenSpec Integration
When creating a screenplay from an OpenSpec spec:
1. Read the spec name from `openspec/changes/[spec-name]/`
2. Create `screenplays/[spec-name]/`
3. Place all generated files in the project directory
4. Reference the spec in project metadata

### Beads Integration
When creating a screenplay from a Beads epic:
1. Read the epic ID from `.beads/issues.jsonl`
2. Create `screenplays/[epic-id]/`
3. Track file creation in Beads comments
4. Link screenplay files to epic tasks

---

## Best Practices

### DO
✅ Always create `screenplays/` directory before generating files  
✅ Use OpenSpec or Beads names when available  
✅ Group all related files in the same project directory  
✅ Use descriptive subdirectory names (`characters/`, `notes/`, etc.)  
✅ Preserve the directory during cleanup operations  

### DON'T
❌ Create screenplay files in the repository root  
❌ Mix multiple screenplay projects in one directory  
❌ Use special characters in directory names  
❌ Delete `screenplays/` during cleanup  
❌ Hardcode project names without checking OpenSpec/Beads  

---

## Error Handling

### Missing Permissions
If the system cannot create directories due to permissions:
- Log an informative error message
- Suggest running with appropriate permissions
- Provide fallback location (e.g., user's home directory)

### Name Conflicts
If a project directory already exists:
- Apply the configured conflict resolution strategy
- Log the resolution action
- Continue with the new directory name

### Missing Context
If neither OpenSpec nor Beads context is available:
- Use timestamp-based naming
- Log a warning suggesting manual renaming
- Continue with generation

---

## Configuration

Project-specific configuration can be set in `.augment/screenplay-config.json`:

```json
{
  "fileOrganization": {
    "rootDir": "screenplays",
    "conflictResolution": "append-number",
    "autoCreateDirectories": true,
    "preserveOnCleanup": true
  }
}
```

---

## Summary

The screenplay file organization system ensures:
- **Logical structure** - All screenplay files grouped by project
- **Context awareness** - Names derived from OpenSpec/Beads
- **Conflict resolution** - Automatic handling of duplicate names
- **Persistence** - Creative content preserved during cleanup
- **Integration** - Seamless workflow with OpenSpec and Beads

