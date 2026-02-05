# Coordination System

## Purpose

This repository uses a **coordination manifest** (`.augment/coordination.json`) to harmonize three workflow systems:

1. **OpenSpec** (`openspec/`) - Specifications and change management
2. **Beads** (`.beads/`) - Task tracking and dependencies  
3. **`.augment/`** - AI agent rules and guidelines

The coordination system creates bidirectional awareness and automatic linking between all three systems.

---

## Core Concepts

### Coordination Manifest

**Location**: `.augment/coordination.json`

**Purpose**: Central registry tracking relationships between:
- **Specs** - OpenSpec specifications
- **Tasks** - Beads tasks
- **Rules** - `.augment/` rule files
- **Files** - Source files and their associations

### Relationships

```
Spec ←→ Tasks ←→ Files
  ↓       ↓       ↓
Rules   Rules   Rules
```

**Example Flow**:
1. OpenSpec spec defines a feature
2. Beads tasks implement the spec
3. Tasks reference applicable `.augment/` rules
4. Files created/modified are tracked with task IDs
5. Coordination manifest maintains all relationships

---

## For AI Agents

### Querying the Coordination System

#### Get Active Specs

```javascript
// Read coordination.json
const coord = JSON.parse(fs.readFileSync('.augment/coordination.json'));

// Filter active specs
const activeSpecs = Object.entries(coord.specs)
  .filter(([id, spec]) => spec.status === 'active')
  .map(([id, spec]) => ({ id, ...spec }));
```

#### Get Tasks for a Spec

```javascript
function getTasksForSpec(specId) {
  const coord = JSON.parse(fs.readFileSync('.augment/coordination.json'));
  const spec = coord.specs[specId];
  
  if (!spec) return [];
  
  return spec.relatedTasks.map(taskId => ({
    id: taskId,
    ...coord.tasks[taskId]
  }));
}
```

#### Get Rules for a Task

```javascript
function getRulesForTask(taskId) {
  const coord = JSON.parse(fs.readFileSync('.augment/coordination.json'));
  const task = coord.tasks[taskId];
  
  if (!task) return [];
  
  return task.relatedRules.map(ruleName => ({
    name: ruleName,
    ...coord.rules[ruleName]
  }));
}
```

#### Get Spec for a File

```javascript
function getSpecForFile(filePath) {
  const coord = JSON.parse(fs.readFileSync('.augment/coordination.json'));
  
  return Object.entries(coord.specs)
    .filter(([id, spec]) => {
      return spec.affectedFiles.some(pattern => 
        minimatch(filePath, pattern)
      );
    })
    .map(([id, spec]) => ({ id, ...spec }));
}
```

### Updating the Coordination System

#### Task ID Validation

All task IDs in the coordination manifest MUST use the "bd-" prefix.

**Validation Pattern**: `^bd-[a-z0-9]+([.-][a-z0-9]+)*$`

**Valid Examples**:
- `bd-a1b2` ✅ (standard hash-based ID)
- `bd-init` ✅ (named ID)
- `bd-rename1` ✅ (named ID with number)
- `bd-a1b2.1` ✅ (hierarchical ID with dot)
- `bd-prefix1-1` ✅ (hierarchical ID with hyphen)

**Invalid Examples**:
- `augment-a1b2` ❌ (wrong prefix)
- `task-a1b2` ❌ (wrong prefix)
- `a1b2` ❌ (no prefix)
- `bd_a1b2` ❌ (underscore instead of hyphen)

**Enforcement**:
- Coordination manifest MUST reject task IDs that don't match the pattern
- Clear error messages MUST be shown for invalid IDs
- See `openspec/specs/beads/naming-convention.md` for complete specification

#### When Creating a Task

```javascript
// 1. Create Beads task with spec reference
const task = {
  id: "bd-xyz",  // MUST use "bd-" prefix
  title: "Implement feature",
  spec: "features/new-feature",  // Reference to spec
  rules: ["module-development.md"],  // Applicable rules
  status: "open",
  created: new Date().toISOString()
};

// 2. Validate task ID format
if (!/^bd-[a-z0-9]+([.-][a-z0-9]+)*$/.test(task.id)) {
  throw new Error(`Invalid task ID: ${task.id}. Must use "bd-" prefix.`);
}

// 3. Append to .beads/issues.jsonl
fs.appendFileSync('.beads/issues.jsonl', JSON.stringify(task) + '\n');

// 4. Update coordination manifest
const coord = JSON.parse(fs.readFileSync('.augment/coordination.json'));
coord.tasks[task.id] = {
  title: task.title,
  status: task.status,
  relatedSpecs: [task.spec],
  relatedRules: task.rules,
  outputFiles: []
};
coord.specs[task.spec].relatedTasks.push(task.id);
coord.lastUpdated = new Date().toISOString();
fs.writeFileSync('.augment/coordination.json', JSON.stringify(coord, null, 2));
```

#### When Creating/Modifying a File

```javascript
function trackFileChange(filePath, taskId, isNew = false) {
  const coord = JSON.parse(fs.readFileSync('.augment/coordination.json'));

  if (!coord.files[filePath]) {
    coord.files[filePath] = {
      createdBy: isNew ? taskId : null,
      modifiedBy: [],
      governedBy: [],
      rulesApplied: []
    };
  }

  if (isNew) {
    coord.files[filePath].createdBy = taskId;
  } else {
    if (!coord.files[filePath].modifiedBy.includes(taskId)) {
      coord.files[filePath].modifiedBy.push(taskId);
    }
  }

  // Add to task's output files
  if (coord.tasks[taskId]) {
    if (!coord.tasks[taskId].outputFiles.includes(filePath)) {
      coord.tasks[taskId].outputFiles.push(filePath);
    }
  }

  // Find governing specs
  const governingSpecs = Object.entries(coord.specs)
    .filter(([id, spec]) =>
      spec.affectedFiles.some(pattern => minimatch(filePath, pattern))
    )
    .map(([id]) => id);

  coord.files[filePath].governedBy = governingSpecs;

  // Find applicable rules
  const applicableRules = Object.entries(coord.rules)
    .filter(([name, rule]) =>
      rule.appliesTo.filePatterns.some(pattern => minimatch(filePath, pattern))
    )
    .map(([name]) => name);

  coord.files[filePath].rulesApplied = applicableRules;

  coord.lastUpdated = new Date().toISOString();
  fs.writeFileSync('.augment/coordination.json', JSON.stringify(coord, null, 2));
}
```

---

## Workflow Integration

### OpenSpec Workflow

When creating a new OpenSpec spec:

1. **Add frontmatter** to spec file:
   ```markdown
   ---
   id: features/new-feature
   relatedTasks: []
   relatedRules: [module-development.md]
   status: active
   ---
   ```

2. **Update coordination manifest**:
   - Add spec to `specs` section
   - Link to applicable rules
   - Define affected file patterns

### Beads Workflow

When creating a new Beads task:

1. **Include spec and rules** in task:
   ```json
   {
     "id": "bd-xyz",
     "title": "Task title",
     "spec": "features/new-feature",
     "rules": ["module-development.md"],
     "status": "open"
   }
   ```

2. **Update coordination manifest**:
   - Add task to `tasks` section
   - Link to spec
   - Link to rules

### .augment/ Rules

When creating a new rule:

1. **Update coordination manifest**:
   - Add rule to `rules` section
   - Define `appliesTo` patterns
   - Set priority

---

## Best Practices

### DO

✅ Update coordination manifest when creating specs/tasks
✅ Reference specs in Beads tasks using `spec` field
✅ Track file changes with task IDs
✅ Query coordination manifest before starting work
✅ Keep manifest in sync with actual files

### DON'T

❌ Manually edit coordination manifest without validation
❌ Create tasks without linking to specs
❌ Modify files without tracking in coordination manifest
❌ Ignore coordination manifest when querying context

---

## Validation

The coordination manifest should be validated regularly:

```bash
# Check manifest is valid JSON
cat .augment/coordination.json | jq .

# Verify all referenced files exist
# Verify all task IDs in manifest exist in .beads/issues.jsonl
# Verify all spec IDs in manifest have corresponding spec files
```

---

## Future Enhancements

- Automatic sync utilities
- CLI commands for querying (`augx coord ...`)
- Git hooks for auto-updating manifest
- Conflict detection and resolution
- Visual dependency graphs

