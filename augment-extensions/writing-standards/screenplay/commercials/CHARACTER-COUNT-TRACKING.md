# Commercial Writing Standards - Character Count Tracking

> **Version:** 2.0.0
> **Last Updated:** 2026-03-03
> **Target Range Per File:** 3,000 - 45,000 characters

## Table of Contents

- [Overview](#overview)
- [Target Allocation](#target-allocation)
- [Validation Script](#validation-script)
- [Current Status](#current-status)
- [File-by-File Breakdown](#file-by-file-breakdown)

---

## Overview

This document tracks character counts for the Commercial Writing Standards module to ensure **each individual content file** stays within the target range of **3,000 - 45,000 characters**.

### Why Per-File Character Count Matters

- **AI Context Window**: Each file can be loaded independently within AI context limits
- **Modularity**: Files are self-contained, comprehensive guides
- **Flexibility**: Users can load only the files they need
- **Quality**: Ensures each file has sufficient depth and examples
- **Consistency**: Maintains uniform quality across all rule files

### File Categories

**Content Files** (17 files): Each must be 3,000 - 45,000 characters
- Rule files (15 files)
- Example files (2 files)

**Infrastructure Files** (5 files): No character count requirement
- module.json, README.md, CONFIGURATION.md, REFERENCES.md, CHARACTER-COUNT-TRACKING.md

---

## Target Allocation

### Per-File Target: 3,000 - 45,000 characters

| Category | Files | Target Per File | Total Range |
|----------|-------|-----------------|-------------|
| **Foundational Rules** | 3 | 3,000 - 45,000 | 9,000 - 135,000 |
| **Technique Rules** | 5 | 3,000 - 45,000 | 15,000 - 225,000 |
| **Legal/Ethical Rules** | 2 | 3,000 - 45,000 | 6,000 - 90,000 |
| **Supporting Rules** | 5 | 3,000 - 45,000 | 15,000 - 225,000 |
| **Example Files** | 2 | 3,000 - 45,000 | 6,000 - 90,000 |
| **Infrastructure** | 5 | No requirement | Variable |
| **Total Content** | **17** | **3,000 - 45,000** | **51,000 - 765,000** |

### Per-File Targets

#### Foundational Rules (3 files)
- `commercials.md`: 3,000 - 45,000 chars (core principles)
- `commercial-formats.md`: 3,000 - 45,000 chars (duration-specific rules)
- `commercial-types.md`: 3,000 - 45,000 chars (type-specific best practices)

#### Technique Rules (5 files)
- `commercial-techniques.md`: 3,000 - 45,000 chars (techniques guide)
- `commercial-persuasion.md`: 3,000 - 45,000 chars (persuasion frameworks)
- `commercial-audience.md`: 3,000 - 45,000 chars (audience targeting)
- `commercial-scripts.md`: 3,000 - 45,000 chars (script structure)
- `commercial-tips.md`: 3,000 - 45,000 chars (best practices)

#### Legal/Ethical Rules (2 files)
- `commercial-laws.md`: 3,000 - 45,000 chars (legal compliance)
- `commercial-ethics.md`: 3,000 - 45,000 chars (ethical guidelines)

#### Supporting Rules (5 files)
- `commercial-counter-principles-examples.md`: 3,000 - 45,000 chars (rule-breaking)
- `commercial-templates.md`: 3,000 - 45,000 chars (ready-to-use templates)
- `commercial-mistakes.md`: 3,000 - 45,000 chars (common pitfalls)
- `commercial-history.md`: 3,000 - 45,000 chars (advertising evolution)
- `commercial-glossary.md`: 3,000 - 45,000 chars (industry terminology)

#### Example Files (2 files)
- `effective-commercials.md`: 3,000 - 45,000 chars (effective examples)
- `ineffective-commercials.md`: 3,000 - 45,000 chars (ineffective examples)

#### Infrastructure Files (no character requirement)
- `module.json`: ~1,200 chars
- `README.md`: ~2,000 chars
- `CONFIGURATION.md`: ~300 chars
- `REFERENCES.md`: ~500 chars
- `CHARACTER-COUNT-TRACKING.md`: ~500 chars

---

## Validation Script

### TypeScript Script

See `scripts/validate-character-count.ts` for the validation script.

**Validation Logic:**
- Checks each content file individually (not total)
- Content files must be 3,000 - 45,000 characters
- Infrastructure files are excluded from validation
- Reports pass/fail status for each file
- Exit code 0 if all files pass, 1 if any fail

### Usage

```bash
# Run validation (from repository root)
npm run validate:commercials

# Verbose output with file breakdown
npm run validate:commercials:verbose

# JSON output for CI/CD
npm run validate:commercials:json

# Direct execution with tsx
npx tsx augment-extensions/writing-standards/screenplay/commercials/scripts/validate-character-count.ts --verbose

# In CI/CD pipeline
npm run validate:commercials
# Exit code will be 0 for pass, 1 for fail
```

---

## Current Status

**Last Measured:** 2026-03-03
**Validation:** Run `npm run validate:commercials`
**Status:** 🟡 In Progress

### Progress Checklist

- [x] Infrastructure files created (module.json, README.md, CONFIGURATION.md, REFERENCES.md)
- [x] Character count tracking established (per-file validation)
- [ ] Foundational rules written (0/3)
- [ ] Technique rules written (0/5)
- [ ] Legal/ethical rules written (0/2)
- [ ] Supporting rules written (0/5)
- [ ] Examples created (0/2)
- [ ] All files within 3,000 - 45,000 character range
- [ ] Final validation passed

---

## File-by-File Breakdown

### Foundational Rules (3 files)
| File | Target Range | Actual | Status |
|------|--------------|--------|--------|
| commercials.md | 3,000 - 45,000 | - | ⚪ |
| commercial-formats.md | 3,000 - 45,000 | - | ⚪ |
| commercial-types.md | 3,000 - 45,000 | - | ⚪ |

### Technique Rules (5 files)
| File | Target Range | Actual | Status |
|------|--------------|--------|--------|
| commercial-techniques.md | 3,000 - 45,000 | - | ⚪ |
| commercial-persuasion.md | 3,000 - 45,000 | - | ⚪ |
| commercial-audience.md | 3,000 - 45,000 | - | ⚪ |
| commercial-scripts.md | 3,000 - 45,000 | - | ⚪ |
| commercial-tips.md | 3,000 - 45,000 | - | ⚪ |

### Legal/Ethical Rules (2 files)
| File | Target Range | Actual | Status |
|------|--------------|--------|--------|
| commercial-laws.md | 3,000 - 45,000 | - | ⚪ |
| commercial-ethics.md | 3,000 - 45,000 | - | ⚪ |

### Supporting Rules (5 files)
| File | Target Range | Actual | Status |
|------|--------------|--------|--------|
| commercial-counter-principles-examples.md | 3,000 - 45,000 | - | ⚪ |
| commercial-templates.md | 3,000 - 45,000 | - | ⚪ |
| commercial-mistakes.md | 3,000 - 45,000 | - | ⚪ |
| commercial-history.md | 3,000 - 45,000 | - | ⚪ |
| commercial-glossary.md | 3,000 - 45,000 | - | ⚪ |

### Example Files (2 files)
| File | Target Range | Actual | Status |
|------|--------------|--------|--------|
| effective-commercials.md | 3,000 - 45,000 | - | ⚪ |
| ineffective-commercials.md | 3,000 - 45,000 | - | ⚪ |

### Infrastructure Files (no requirement)
| File | Actual | Status |
|------|--------|--------|
| module.json | ~1,200 | ✅ |
| README.md | ~2,000 | ✅ |
| CONFIGURATION.md | ~300 | ✅ |
| REFERENCES.md | ~500 | ✅ |
| CHARACTER-COUNT-TRACKING.md | ~500 | ✅ |

**Legend:**
- ✅ Complete and within target (or N/A for infrastructure)
- 🟡 In progress
- ⚪ Not started
- ⚠️ Needs adjustment (outside 3,000 - 45,000 range)

---

## Maintenance

### When to Update

- After creating/editing any file
- Before committing changes
- During code review
- Before module release

### How to Update

1. Run validation script
2. Update "Current Status" section
3. Update "File-by-File Breakdown" table
4. Commit changes with character count in commit message

---

## References

- [Character Count Management](.augment/rules/character-count-management.md)
- [Module Validation](../../../docs/VALIDATION.md)
- [Go Module Character Count](../../../coding-standards/go/CHARACTER-COUNT-REPORT.md)

