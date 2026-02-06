# ADR Support Module

**Version:** 1.0.0  
**Type:** Workflow  
**Category:** Architecture Documentation & Decision Management

## Overview

The ADR Support module enables Augment AI agents to **automatically** manage Architecture Decision Records (ADRs) throughout the software development lifecycle. This module transforms ADR management from a manual documentation task into an automated knowledge management system embedded in the development workflow.

## Purpose

This module enables AI agents to:

- ✅ **Detect** when architectural decisions are being made
- ✅ **Create** ADRs using appropriate templates
- ✅ **Track** ADR lifecycle and status transitions
- ✅ **Update** ADRs with new information while maintaining immutability
- ✅ **Supersede** outdated decisions with new ones
- ✅ **Validate** ADR completeness and compliance
- ✅ **Integrate** ADRs with OpenSpec specifications and Beads tasks
- ✅ **Review** decisions and compare planned vs actual outcomes
- ✅ **Detect** conflicts between decisions

## Supported Domains

This module applies to all project types:

- **Website** - Web presence and marketing sites
- **Web-app** - Web applications and SaaS platforms
- **OS Application** - Desktop applications
- **Linux** - Linux-specific applications
- **Windows** - Windows-specific applications
- **.NET** - .NET framework applications
- **Mobile** - Mobile applications (iOS, Android)
- **AI Prompt Helper** - AI/ML systems and prompt engineering
- **Motion Picture** - Video production and media workflows
- **Print Campaigns** - Print media and marketing materials

## Installation

### 1. Link the Module

```bash
augx link workflows/adr-support
```

### 2. Create ADR Directory

```bash
mkdir -p adr/templates
```

### 3. Copy Templates

```bash
cp augment-extensions/workflows/adr-support/templates/*.md adr/templates/
```

### 4. Create Configuration

Create `.adr-config.json` in your project root:

```json
{
  "adrDirectory": "adr",
  "defaultTemplate": "nygard",
  "numberFormat": "0000",
  "statusTypes": ["draft", "proposed", "approved", "implemented", "maintained", "superseded", "sunset"],
  "reviewPeriodDays": 30,
  "integration": {
    "openspec": { "enabled": true, "specsDirectory": "openspec/specs" },
    "beads": { "enabled": true, "issuesFile": ".beads/issues.jsonl" },
    "git": { "enabled": true, "commitMessagePrefix": "ADR" }
  },
  "validation": {
    "requireContext": true,
    "requireDecision": true,
    "requireConsequences": true,
    "enforceStatusTransitions": true
  }
}
```

## Directory Structure

```
repository-root/
├── adr/                          # ADR directory
│   ├── README.md                 # ADL overview and index
│   ├── 0001-use-markdown.md      # ADR files
│   ├── 0002-choose-database.md
│   ├── templates/                # Template directory
│   │   ├── nygard.md
│   │   ├── madr-simple.md
│   │   ├── madr-elaborate.md
│   │   └── business-case.md
│   └── .adr-config.json          # Configuration
├── openspec/                     # OpenSpec integration
│   └── specs/
│       └── [specs linked to ADRs]
└── .beads/                       # Beads integration
    └── issues.jsonl              # Tasks linked to ADRs
```

## Features

### 1. Automatic Decision Detection

The AI agent monitors:
- Code changes (dependencies, schemas, APIs, infrastructure)
- Conversation triggers ("we should use...", "let's switch to...")
- OpenSpec spec creation/modification
- Significance criteria (affects multiple components, impacts NFRs, etc.)

### 2. ADR Creation & Templates

Four templates available:
- **Michael Nygard** (default) - Standard ADR format
- **MADR Simple** - Straightforward decisions
- **MADR Elaborate** - Complex decisions with multiple options
- **Business Case** - Cost/ROI analysis decisions

### 3. Lifecycle Management

```
draft → proposed → approved → implemented → maintained
                                              ↓
                                         superseded/sunset
```

### 4. OpenSpec Integration

- Link ADRs to specifications
- Cross-reference in both directions
- Update coordination manifest
- Suggest spec updates when ADRs superseded

### 5. Beads Integration

- Create tasks for ADR implementation
- Link tasks to ADRs
- Update ADR status when tasks complete
- Track implementation progress

### 6. Validation & Quality

- Required sections check
- Status transition validation
- Reference validation
- Completeness criteria

### 7. Review & Outcomes

- Schedule reviews after implementation
- Compare planned vs actual outcomes
- Generate review templates
- Suggest superseding if needed

## Contents

### Rules (8 files)
- `decision-detection.md` - How AI agents detect architectural decisions
- `adr-creation.md` - ADR creation process and automation
- `lifecycle-management.md` - ADR lifecycle and status transitions
- `template-selection.md` - Template selection logic
- `validation.md` - Validation and completeness checks
- `openspec-integration.md` - OpenSpec integration patterns
- `beads-integration.md` - Beads integration patterns
- `conflict-detection.md` - Conflict detection and resolution

### Templates (4 files)
- `nygard.md` - Michael Nygard template
- `madr-simple.md` - MADR Simple template
- `madr-elaborate.md` - MADR Elaborate template
- `business-case.md` - Business Case template

### Examples (3 files)
- `complete-lifecycle-example.md` - Full lifecycle demonstration
- `superseding-example.md` - Superseding workflow
- `integration-example.md` - OpenSpec + Beads integration

### Schemas (2 files)
- `adr-config.json` - Configuration schema
- `adr-metadata.json` - Metadata schema

## Usage

The AI agent operates automatically. When it detects an architectural decision:

```
User: "I think we should use Redis for caching instead of Memcached"

AI: "I've detected an architectural decision about caching technology.
     This affects:
     - Performance (caching strategy)
     - Infrastructure (new dependency)
     - Multiple components (user service, product service)

     Should I create an ADR? [Yes/No]"

User: "Yes"

AI: "Creating ADR 0044: Choose Redis for caching layer
     Template: MADR Elaborate
     Status: draft
     Tags: caching, infrastructure, performance

     I've pre-filled the context and options sections.
     Please review and add details."
```

## Dependencies

- `workflows/openspec` >= 1.0.0
- `workflows/beads` >= 1.0.0

## References

- **ADR Framework:** https://github.com/joelparkerhenderson/architecture-decision-record
- **OpenSpec:** https://github.com/Fission-AI/OpenSpec.git
- **Beads:** https://github.com/steveyegge/beads.git

## License

Part of Augment Extensions - see repository root for license information.

