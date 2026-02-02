---
type: "always_apply"
---

# No Unnecessary Documentation Rule

## Core Principle

**DO NOT create per-task summary files, DOCUMENTS.md, or similar redundant documentation files.**

Documentation should be focused, purposeful, and maintained in specific locations only.

---

## ❌ PROHIBITED Documentation Practices

### Never Create These Files

- ❌ `DOCUMENTS.md` (or any variant)
- ❌ `TASK-[id]-SUMMARY.md` (per-task summaries)
- ❌ `TASK-[id]-DOCS.md` (per-task documentation)
- ❌ `[FEATURE]-SUMMARY.md` (feature summaries)
- ❌ `[FEATURE]-FINAL-SUMMARY.md` (final summaries)
- ❌ `[FEATURE]-QUICK-REFERENCE.md` (quick references)
- ❌ Any file that merely logs what the AI has done
- ❌ Redundant descriptive files that clutter the repository

### Why These Are Prohibited

Repository clutter, minimal long-term value, redundancy with Beads/OpenSpec, token bloat, maintenance burden.

---

## ✅ REQUIRED Documentation Practices

### 1. Beads Issues/Tasks (Primary)

**Use the `bd` CLI for all task tracking:**

```bash
bd create "Task description" -p 1
bd update <id> --status in-progress
bd dep add <child> <parent>
bd close <id>
bd comment <id> "Progress update"
```

**What to track in Beads:**
- Task progress and status
- Dependencies between tasks
- Implementation notes

### 2. OpenSpec Files (Architecture)

**Update OpenSpec files for architectural decisions:**

**Files to update:**
- `openspec/proposal.md` - Change proposals
- `openspec/tasks.md` - Task breakdowns
- `openspec/spec-delta.md` - Specification changes

**What to document in OpenSpec:**
- Architectural decisions
- Requirements and scenarios
- Breaking changes

### 3. README.md Files (Human-Readable)

**The ONLY Markdown files to create/update (beyond Beads/OpenSpec):**

**Allowed README.md locations:**
- `README.md` (root level)
- `[subdirectory]/README.md` (relevant subdirectories)

**When to update README.md:**
- ✅ Significant project overview changes
- ✅ New setup/installation instructions
- ✅ Major usage pattern changes
- ✅ High-level architectural shifts
- ✅ Breaking changes affecting users

**When NOT to update README.md:**
- ❌ Every task completion
- ❌ Minor bug fixes
- ❌ Internal refactoring
- ❌ Code style changes
- ❌ Routine updates

**README.md Constraints:**
- **Maximum length:** 49,940 characters (strict limit)
- **Content quality:** Concise yet comprehensive
- **Focus:** Essential, actionable content only
- **No redundancy:** Remove outdated sections
- **No verbosity:** Consolidate overlapping information

---

## 🔧 Implementation Guidelines

### For AI Agent

**Before creating ANY .md file, ask:**
1. Is this a README.md file? (If NO → STOP, use Beads/OpenSpec instead)
2. Is this update significant enough for README.md? (If NO → STOP, use Beads/OpenSpec instead)
3. Will README.md exceed 49,940 characters? (If YES → Condense or use Beads/OpenSpec instead)

**When closing tasks:**
1. Use `bd close <id>` to close task
2. Use `bd comment <id> "Summary"` to add implementation notes
3. **DO NOT** create summary files

**When documenting architecture:**
1. Update `openspec/proposal.md` for change proposals
2. Update `openspec/spec-delta.md` for specification changes
3. **DO NOT** create separate architecture docs

**When documenting features:**
1. Update README.md if user-facing and significant
2. Update Beads comments for implementation details
3. **DO NOT** create feature summary files

---

## 🚫 Enforcement

### AI Agent Must

1. **NEVER** create per-task summary files
2. **NEVER** create DOCUMENTS.md or similar files
3. **ALWAYS** use Beads for task tracking
4. **ALWAYS** use OpenSpec for architecture
5. **RARELY** update README.md (only when significant)
6. **ALWAYS** check README.md length before updating (49,940 char limit)

### Violations

If AI agent creates prohibited documentation:
1. Immediately delete the file
2. Move information to appropriate location (Beads/OpenSpec/README)
3. Update this rule file if needed to prevent future violations

---

## 📝 Summary

**Documentation Hierarchy:**
1. **Beads** (task tracking, progress, notes) - PRIMARY
2. **OpenSpec** (architecture, specs, proposals) - SECONDARY
3. **README.md** (user-facing, significant changes only) - TERTIARY

**Golden Rule:**
> If it's not a README.md update for a significant user-facing change, use Beads or OpenSpec instead.

**Character Limit:**
> README.md files must not exceed 49,940 characters.

**Result:**
> Cleaner repository, better documentation, improved AI context efficiency.

