#!/bin/bash
# Setup script for benchmark suite

set -e

echo "Setting up benchmark suite..."

# Create directories
mkdir -p benchmarks/baseline
mkdir -p benchmarks/skills
mkdir -p benchmarks/scenarios

# Prepare baseline files
echo "Preparing baseline files..."

# MCP module
if [ -d "augment-extensions/domain-rules/mcp" ]; then
    cat augment-extensions/domain-rules/mcp/README.md \
        augment-extensions/domain-rules/mcp/rules/*.md \
        > benchmarks/baseline/mcp-module.txt
    echo "  ✓ MCP module baseline created"
else
    echo "  ⚠ MCP module not found, skipping"
fi

# Beads module
if [ -d "augment-extensions/workflows/beads" ]; then
    cat augment-extensions/workflows/beads/README.md \
        augment-extensions/workflows/beads/rules/*.md \
        > benchmarks/baseline/beads-module.txt
    echo "  ✓ Beads module baseline created"
else
    echo "  ⚠ Beads module not found, skipping"
fi

# TypeScript module (if exists)
if [ -d "augment-extensions/coding-standards/typescript" ]; then
    cat augment-extensions/coding-standards/typescript/README.md \
        augment-extensions/coding-standards/typescript/rules/*.md \
        > benchmarks/baseline/typescript-module.txt
    echo "  ✓ TypeScript module baseline created"
else
    echo "  ⚠ TypeScript module not found, creating placeholder"
    echo "# TypeScript Module Placeholder" > benchmarks/baseline/typescript-module.txt
fi

# Prepare skill files
echo "Preparing skill files..."

# SDK query skill
if [ -f "openspec/changes/skill-based-refactor/examples/sdk-query-skill.md" ]; then
    cp openspec/changes/skill-based-refactor/examples/sdk-query-skill.md \
       benchmarks/skills/sdk-query.txt
    echo "  ✓ SDK query skill created"
else
    echo "  ⚠ SDK query skill not found, creating placeholder"
    echo "# SDK Query Skill Placeholder" > benchmarks/skills/sdk-query.txt
fi

# Context retrieval skill
if [ -f "openspec/changes/skill-based-refactor/examples/context-retrieval-skill.md" ]; then
    cp openspec/changes/skill-based-refactor/examples/context-retrieval-skill.md \
       benchmarks/skills/context-retrieval.txt
    echo "  ✓ Context retrieval skill created"
else
    echo "  ⚠ Context retrieval skill not found, creating placeholder"
    echo "# Context Retrieval Skill Placeholder" > benchmarks/skills/context-retrieval.txt
fi

# Create placeholder skills for other scenarios
echo "  Creating placeholder skills..."
echo "# Beads Task Create Skill Placeholder" > benchmarks/skills/beads-task-create.txt
echo "# TypeScript Naming Skill Placeholder" > benchmarks/skills/typescript-naming.txt
echo "# TypeScript Types Skill Placeholder" > benchmarks/skills/typescript-types.txt

echo ""
echo "✓ Benchmark suite setup complete!"
echo ""
echo "Next steps:"
echo "  1. Install tiktoken: pip install tiktoken"
echo "  2. Run benchmarks: python benchmarks/run-benchmarks.py"

