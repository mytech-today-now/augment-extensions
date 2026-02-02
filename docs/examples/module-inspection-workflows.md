# Module Inspection Workflow Examples

## Overview

This document provides practical examples of using module inspection commands in real-world workflows, including AI integration and OpenSpec/Beads integration.

## Example 1: AI Agent Module Discovery

### Scenario
An AI agent needs to discover and load relevant coding standards for a TypeScript project.

### Workflow

```bash
# Step 1: List all available modules
augx list

# Step 2: Search for TypeScript-related modules
augx search typescript

# Step 3: Inspect TypeScript standards module
augx show module typescript-standards

# Step 4: View specific rule file
augx show module typescript-standards rules/naming-conventions.md

# Step 5: Load all rules as JSON for AI context
augx show module typescript-standards --content --json > typescript-context.json
```

### AI Integration

```javascript
// AI agent code
const { execSync } = require('child_process');

// Load module content for AI context
const moduleContent = execSync('augx show module typescript-standards --content --json', {
  encoding: 'utf-8'
});

const context = JSON.parse(moduleContent);

// Use context in AI prompt
const prompt = `
Given these TypeScript coding standards:
${context.content}

Review the following code:
${userCode}
`;
```

## Example 2: OpenSpec Integration

### Scenario
Creating an OpenSpec specification that references module rules.

### Workflow

```bash
# Step 1: Inspect module to understand available rules
augx show module php-standards

# Step 2: View specific rules needed for spec
augx show module php-standards rules/psr-standards.md
augx show module php-standards rules/security.md

# Step 3: Export rules to reference in OpenSpec
augx show module php-standards --filter "rules/psr-standards.md" --format markdown > openspec/references/psr-standards.md
```

### OpenSpec File

```markdown
<!-- openspec/specs/api/php-api-standards.md -->
---
id: api/php-api-standards
relatedModules: [coding-standards/php-standards]
relatedRules: [psr-standards.md, security.md]
---

# PHP API Standards

## Requirements

### PSR Compliance
Follow PSR-12 coding standards as defined in:
- Module: `coding-standards/php-standards`
- Rule: `rules/psr-standards.md`

### Security
Implement security best practices from:
- Module: `coding-standards/php-standards`
- Rule: `rules/security.md`

## Implementation

```bash
# Load module rules for implementation
augx show module php-standards rules/psr-standards.md
augx show module php-standards rules/security.md
```
```

## Example 3: Beads Task Integration

### Scenario
Creating Beads tasks that reference module rules for implementation guidance.

### Workflow

```bash
# Step 1: Create task with module reference
bd create "Implement PSR-12 compliant API endpoint" -p 1

# Step 2: Add module reference to task
bd comment bd-xyz "Reference module: coding-standards/php-standards"
bd comment bd-xyz "Rules: psr-standards.md, api-development.md"

# Step 3: Load rules when working on task
augx show module php-standards rules/psr-standards.md
augx show module php-standards rules/api-development.md
```

### Beads Task JSON

```json
{
  "id": "bd-xyz",
  "title": "Implement PSR-12 compliant API endpoint",
  "description": "Create REST API endpoint following PSR-12 standards",
  "modules": ["coding-standards/php-standards"],
  "rules": ["psr-standards.md", "api-development.md"],
  "status": "open"
}
```

### Implementation Script

```bash
#!/bin/bash
# Load rules for current task

TASK_ID="bd-xyz"
TASK_JSON=$(bd show $TASK_ID --json)

# Extract module and rules from task
MODULE=$(echo $TASK_JSON | jq -r '.modules[0]')
RULES=$(echo $TASK_JSON | jq -r '.rules[]')

# Display rules for implementation
for RULE in $RULES; do
  echo "=== $RULE ==="
  augx show module $MODULE rules/$RULE
  echo ""
done
```

## Example 4: Code Review Workflow

### Scenario
Reviewing code against module standards.

### Workflow

```bash
# Step 1: Load relevant standards
augx show module typescript-standards --content --json > standards.json

# Step 2: Extract specific rules
augx show module typescript-standards rules/naming-conventions.md > naming-rules.txt
augx show module typescript-standards rules/type-safety.md > type-rules.txt

# Step 3: Review code against rules
# (Manual or automated with linter)

# Step 4: Generate review report
cat > review-report.md << EOF
# Code Review Report

## Standards Applied
- Module: typescript-standards
- Rules: naming-conventions.md, type-safety.md

## Findings
$(diff code.ts naming-rules.txt)

## Recommendations
$(augx show module typescript-standards rules/best-practices.md)
EOF
```

## Example 5: Documentation Generation

### Scenario
Generate project documentation from module standards.

### Workflow

```bash
#!/bin/bash
# Generate comprehensive project documentation

MODULES=("typescript-standards" "html-css-js" "react-patterns")

mkdir -p docs/standards

for MODULE in "${MODULES[@]}"; do
  echo "Generating docs for $MODULE..."
  
  # Export module overview
  augx show module $MODULE --format markdown > "docs/standards/${MODULE}-overview.md"
  
  # Export all rules
  augx show module $MODULE --content --filter "rules/*.md" --format markdown > "docs/standards/${MODULE}-rules.md"
  
  # Export all examples
  augx show module $MODULE --content --filter "examples/*" --format markdown > "docs/standards/${MODULE}-examples.md"
done

echo "Documentation generated in docs/standards/"
```

## Example 6: CI/CD Validation

### Scenario
Validate code against module standards in CI/CD pipeline.

### Workflow

```yaml
# .github/workflows/validate.yml
name: Validate Code Standards

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install Augment CLI
        run: npm install -g @augment/cli
      
      - name: Load TypeScript Standards
        run: |
          augx show module typescript-standards --content --json > standards.json
      
      - name: Validate Naming Conventions
        run: |
          # Extract naming rules
          augx show module typescript-standards rules/naming-conventions.md > naming-rules.txt
          
          # Run custom validation script
          node scripts/validate-naming.js naming-rules.txt src/**/*.ts
      
      - name: Validate Type Safety
        run: |
          augx show module typescript-standards rules/type-safety.md > type-rules.txt
          node scripts/validate-types.js type-rules.txt src/**/*.ts
      
      - name: Generate Compliance Report
        run: |
          echo "# Compliance Report" > compliance-report.md
          echo "" >> compliance-report.md
          echo "## Standards Applied" >> compliance-report.md
          augx show module typescript-standards --format markdown >> compliance-report.md
      
      - name: Upload Report
        uses: actions/upload-artifact@v2
        with:
          name: compliance-report
          path: compliance-report.md
```

## Example 7: Multi-Module Comparison

### Scenario
Compare standards across multiple modules.

### Workflow

```bash
#!/bin/bash
# Compare naming conventions across languages

MODULES=("php-standards" "typescript-standards" "python-standards")

echo "# Naming Convention Comparison" > comparison.md
echo "" >> comparison.md

for MODULE in "${MODULES[@]}"; do
  echo "## $MODULE" >> comparison.md
  echo "" >> comparison.md
  augx show module $MODULE rules/naming-conventions.md --format markdown >> comparison.md
  echo "" >> comparison.md
  echo "---" >> comparison.md
  echo "" >> comparison.md
done

echo "Comparison generated: comparison.md"
```

## Example 8: Interactive Module Explorer

### Scenario
Build an interactive CLI tool to explore modules.

### Implementation

```javascript
#!/usr/bin/env node
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function listModules() {
  const output = execSync('augx list --json', { encoding: 'utf-8' });
  return JSON.parse(output);
}

function showModule(moduleName) {
  const output = execSync(`augx show module ${moduleName}`, { encoding: 'utf-8' });
  console.log(output);
}

function searchModules(term) {
  const output = execSync(`augx search ${term} --json`, { encoding: 'utf-8' });
  return JSON.parse(output);
}

async function main() {
  console.log('=== Augment Module Explorer ===\n');
  
  const modules = listModules();
  console.log(`Found ${modules.length} modules\n`);
  
  rl.question('Enter module name or search term: ', (input) => {
    if (modules.some(m => m.name === input)) {
      showModule(input);
    } else {
      const results = searchModules(input);
      console.log(`\nFound ${results.length} matching modules:`);
      results.forEach(r => console.log(`  - ${r.name}`));
    }
    rl.close();
  });
}

main();
```

## See Also

- [Module Inspection Commands](../commands/module-inspection.md)
- [OpenSpec Integration](../../openspec/README.md)
- [Beads Integration](../../.beads/README.md)

