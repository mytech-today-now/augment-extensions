# Token Reduction Benchmark Suite

## Overview

This benchmark suite measures token reduction achieved by the skill-based system compared to the current module-based system.

## Directory Structure

```
benchmarks/
├── README.md                    # This file
├── run-benchmarks.py            # Benchmark runner script
├── scenarios/                   # Benchmark scenario definitions
│   ├── scenario-1-sdk-query.json
│   ├── scenario-2-context-retrieval.json
│   ├── scenario-3-multiple-skills.json
│   ├── scenario-4-workflow.json
│   └── scenario-5-coding-standards.json
├── baseline/                    # Baseline module content
│   ├── mcp-module.txt
│   ├── beads-module.txt
│   └── typescript-module.txt
├── skills/                      # Skill content
│   ├── sdk-query.txt
│   ├── context-retrieval.txt
│   ├── beads-task-create.txt
│   ├── typescript-naming.txt
│   └── typescript-types.txt
└── results.json                 # Benchmark results (generated)
```

## Setup

### Prerequisites

1. Python 3.8+
2. tiktoken library

### Installation

```bash
pip install tiktoken
```

### Prepare Baseline Files

Copy module content to baseline files:

```bash
# MCP module
cat augment-extensions/domain-rules/mcp/README.md \
    augment-extensions/domain-rules/mcp/rules/*.md \
    > benchmarks/baseline/mcp-module.txt

# Beads module
cat augment-extensions/workflows/beads/README.md \
    augment-extensions/workflows/beads/rules/*.md \
    > benchmarks/baseline/beads-module.txt

# TypeScript module (if exists)
cat augment-extensions/coding-standards/typescript/README.md \
    augment-extensions/coding-standards/typescript/rules/*.md \
    > benchmarks/baseline/typescript-module.txt
```

### Prepare Skill Files

Copy skill content to skill files:

```bash
# SDK query skill
cp openspec/changes/skill-based-refactor/examples/sdk-query-skill.md \
   benchmarks/skills/sdk-query.txt

# Context retrieval skill
cp openspec/changes/skill-based-refactor/examples/context-retrieval-skill.md \
   benchmarks/skills/context-retrieval.txt

# Create placeholder skills for other scenarios
# (These will be created during implementation phase)
```

## Running Benchmarks

### Run All Scenarios

```bash
python benchmarks/run-benchmarks.py
```

### Expected Output

```
Found 5 benchmark scenarios

====================================================================================================
TOKEN REDUCTION BENCHMARK RESULTS
====================================================================================================

Scenario 1: SDK Query Task
  Description: Find authentication functions in an SDK
  Baseline:    55,000 tokens
  Skills:      1,800 tokens
  Reduction:   96.7%
  Expected:    96.7%
  Status:      ✓ PASS

...

====================================================================================================
SUMMARY
====================================================================================================
  Total Scenarios:    5
  Passed:             5/5
  Average Reduction:  90.1%
  Overall Status:     ✓ ALL PASS
====================================================================================================

Results exported to: benchmarks/results.json
```

## Benchmark Scenarios

### Scenario 1: SDK Query Task
- **Task**: Find authentication functions in an SDK
- **Baseline**: Full MCP module (~55,000 tokens)
- **Skills**: sdk-query skill (~1,800 tokens)
- **Expected Reduction**: 96.7%

### Scenario 2: Context Retrieval Task
- **Task**: Retrieve code context for authentication
- **Baseline**: Full MCP module (~55,000 tokens)
- **Skills**: context-retrieval skill (~2,200 tokens)
- **Expected Reduction**: 96.0%

### Scenario 3: Multiple Skills Task
- **Task**: Query SDK and retrieve context
- **Baseline**: Full MCP module (~55,000 tokens)
- **Skills**: sdk-query + context-retrieval (~4,000 tokens)
- **Expected Reduction**: 92.7%

### Scenario 4: Workflow Task
- **Task**: Use Beads workflow for task tracking
- **Baseline**: Full Beads module (~10,000 tokens)
- **Skills**: beads-task-create skill (~1,500 tokens)
- **Expected Reduction**: 85.0%

### Scenario 5: Coding Standards Task
- **Task**: Apply TypeScript coding standards
- **Baseline**: Full TypeScript module (~15,000 tokens)
- **Skills**: typescript-naming + typescript-types (~3,000 tokens)
- **Expected Reduction**: 80.0%

## Success Criteria

- ✅ Minimum 70% token reduction across all scenarios
- ✅ Average 85%+ token reduction across all scenarios
- ✅ No functionality loss compared to module-based system
- ✅ Accurate token counting using tiktoken
- ✅ Reproducible results across multiple runs

## Results Interpretation

### Token Reduction Percentage

```
reduction = ((baseline_tokens - skill_tokens) / baseline_tokens) * 100
```

- **90%+**: Excellent reduction
- **80-90%**: Good reduction
- **70-80%**: Acceptable reduction
- **<70%**: Needs improvement

### Pass/Fail Criteria

A scenario passes if:
- Actual reduction >= Expected reduction
- No errors during execution
- Results are reproducible

## Troubleshooting

### Error: tiktoken not installed

```bash
pip install tiktoken
```

### Error: Scenarios directory not found

Ensure you're running from the repository root:

```bash
cd /path/to/augment
python benchmarks/run-benchmarks.py
```

### Error: Baseline files not found

Prepare baseline files as described in Setup section.

## Next Steps

After running benchmarks:

1. Review results in `benchmarks/results.json`
2. Identify scenarios that don't meet expectations
3. Optimize skills to improve token reduction
4. Re-run benchmarks to validate improvements
5. Document final results in OpenSpec proposal

