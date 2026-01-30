# Migration Guide: MCP Modules to Skills + CLI

## Overview

This guide helps you migrate from the old **MCP-based module system** to the new **skills + CLI system**.

**Old System**: Large monolithic modules (e.g., `augment-extensions/domain-rules/mcp/` with 219k characters)  
**New System**: Lightweight focused skills (500-10k tokens each) with CLI wrappers

**Benefits of Migration**:
- **97.2% token reduction** (measured in benchmarks)
- **On-demand loading** (only load what you need)
- **Faster context injection** (smaller files, faster parsing)
- **Better organization** (focused, single-purpose skills)
- **CLI integration** (execute skills as commands)

---

## Migration Strategy

### Phase 1: Identify Focused Functionality

**Old MCP Module Structure**:
```
augment-extensions/domain-rules/mcp/
├── module.json (219k characters total)
├── README.md
├── rules/
│   ├── universal-rules.md
│   ├── token-based-mcp.md
│   ├── state-based-mcp.md
│   ├── vector-based-mcp.md
│   ├── hybrid-mcp.md
│   ├── graph-augmented-mcp.md
│   └── compressed-mcp.md
└── examples/
    └── ...
```

**New Skills Structure**:
```
skills/
├── retrieval/
│   ├── context-retrieval.md (2200 tokens)
│   └── sdk-query.md (1800 tokens)
├── analysis/
│   └── code-analysis.md (2000 tokens)
└── generation/
    └── add-mcp-skill.md (3500 tokens)
```

**Key Principle**: Extract focused functionality from large modules into separate skill files.

### Phase 2: Extract Skills from Modules

**Step-by-step process**:

1. **Identify discrete capabilities** within the module
2. **Determine skill category** (retrieval, transformation, analysis, generation, integration, utility)
3. **Extract content** into new skill file
4. **Set token budget** (500-10k tokens, aim for < 5k)
5. **Add CLI wrapper** (if skill needs execution)
6. **Validate skill** (`augx skill validate <skill-file>`)

### Phase 3: Create CLI Wrappers (Optional)

If the skill needs to execute commands (not just provide context):

**Create CLI command**:
```typescript
// cli/src/commands/custom.ts
export async function mySkillCommand(options: any): Promise<void> {
  // Implementation
}
```

**Register in CLI**:
```typescript
// cli/src/cli.ts
program
  .command('my-skill')
  .description('Execute my skill')
  .action(mySkillCommand);
```

### Phase 4: Update References

**Old way** (loading entire module):
```markdown
See: augment-extensions/domain-rules/mcp/rules/token-based-mcp.md
```

**New way** (loading specific skill):
```bash
augx skill inject context-retrieval
```

---

## Migration Examples

### Example 1: MCP Context Retrieval

**Before** (part of 219k character MCP module):
```
augment-extensions/domain-rules/mcp/rules/vector-based-mcp.md
- 50+ pages of content
- Covers all vector-based MCP patterns
- Token budget: ~60k tokens
```

**After** (focused skill):
```markdown
skills/retrieval/context-retrieval.md
---
id: context-retrieval
name: Context Retrieval
version: 1.0.0
category: retrieval
tokenBudget: 2200
tags: [mcp, retrieval, semantic-search]
cliCommand: augx-context-retrieve
---

# Context Retrieval

## Purpose
Retrieve relevant code context using semantic search.

## Search Types
- semantic: Semantic similarity search
- pattern: Pattern-based search
- symbol: Symbol-based search
- usage: Usage-based search

## CLI Command
\`\`\`bash
augx-context-retrieve --type semantic --query "authentication"
\`\`\`

## Examples
[Focused examples only]
```

**Token Reduction**: 60k → 2.2k tokens (96.3% reduction)

### Example 2: SDK Query

**Before** (part of MCP module):
```
Part of augment-extensions/domain-rules/mcp/
Mixed with other MCP patterns
No dedicated CLI
```

**After** (dedicated skill + CLI):
```markdown
skills/retrieval/sdk-query.md
---
id: sdk-query
name: SDK Query
version: 1.0.0
category: retrieval
tokenBudget: 1800
cliCommand: augx-sdk-query
---

# SDK Query

## Purpose
Query SDK documentation and find functions/classes.

## CLI Command
\`\`\`bash
augx-sdk-query --search "authentication functions"
\`\`\`
```

**Token Reduction**: Similar reduction from large module to focused skill

---

## Step-by-Step Migration Process

### Step 1: Analyze Current Module

**Questions to answer**:
- What discrete capabilities does this module provide?
- Can each capability be extracted into a separate skill?
- Which capabilities need CLI execution vs. just context injection?
- What is the token budget for each capability?

**Example Analysis** (MCP module):
- **Capability 1**: Context retrieval (semantic search) → `skills/retrieval/context-retrieval.md`
- **Capability 2**: SDK querying → `skills/retrieval/sdk-query.md`
- **Capability 3**: Code analysis → `skills/analysis/code-analysis.md`

### Step 2: Create Skill Files

**Use the meta-skill** for automation:
```bash
augx skill create-mcp \
  --name "context-retrieval" \
  --description "Retrieve relevant code context using semantic search" \
  --category "retrieval" \
  --token-budget 2200
```

**Or create manually**:
1. Create file: `skills/{category}/{skill-name}.md`
2. Add YAML frontmatter with metadata
3. Add focused content (purpose, usage, examples)
4. Keep token budget under 10k (aim for < 5k)

### Step 3: Validate Skills

```bash
# Validate skill file format
augx skill validate skills/retrieval/context-retrieval.md

# Check token budget
augx skill show context-retrieval --json | jq '.tokenBudget'

# Test injection
augx skill inject context-retrieval --json
```

### Step 4: Create CLI Wrappers (If Needed)

**When to create CLI wrapper**:
- Skill needs to execute external commands
- Skill needs to interact with APIs
- Skill needs to process files or data

**When NOT to create CLI wrapper**:
- Skill only provides context/guidelines
- Skill is purely informational
- Skill is loaded for reference only

**Example CLI wrapper**:
```typescript
// cli/src/commands/context-retrieve.ts
export async function contextRetrieveCommand(options: {
  type: string;
  query: string;
}): Promise<void> {
  const { type, query } = options;

  // Implementation
  const results = await retrieveContext(type, query);
  console.log(JSON.stringify(results, null, 2));
}
```

### Step 5: Update Documentation

**Update references**:
- Replace module references with skill references
- Update CLI command examples
- Add migration notes to README

**Example**:
```markdown
<!-- Before -->
See: augment-extensions/domain-rules/mcp/rules/vector-based-mcp.md

<!-- After -->
Use skill: `augx skill inject context-retrieval`
Or CLI: `augx-context-retrieve --type semantic --query "auth"`
```

### Step 6: Test Migration

**Testing checklist**:
- [ ] Skill file validates successfully
- [ ] Skill appears in `augx skill list`
- [ ] Skill can be searched with `augx skill search`
- [ ] Skill can be injected with `augx skill inject`
- [ ] CLI command works (if applicable)
- [ ] Token budget is within limits
- [ ] Content is focused and complete

---

## Migration Patterns

### Pattern 1: Large Module → Multiple Skills

**Scenario**: One large module with multiple capabilities

**Migration**:
1. Identify each discrete capability
2. Create separate skill for each
3. Set appropriate token budgets
4. Link skills with dependencies if needed

**Example**:
```
MCP Module (219k chars)
  ↓
├── context-retrieval.md (2.2k tokens)
├── sdk-query.md (1.8k tokens)
└── code-analysis.md (2.0k tokens)
```

### Pattern 2: Module with Examples → Skill with Focused Examples

**Scenario**: Module has extensive examples

**Migration**:
1. Extract most relevant examples only
2. Keep examples concise and focused
3. Link to full documentation if needed

**Before**: 20 examples (15k tokens)
**After**: 3-5 key examples (1k tokens)

### Pattern 3: Configuration-Heavy Module → Skill + Config File

**Scenario**: Module requires complex configuration

**Migration**:
1. Create skill with configuration schema
2. Store configuration in separate file
3. Reference config file from skill

**Example**:
```markdown
skills/integration/api-integration.md
---
configFile: .augment/api-config.json
---
```

---

## Rollback Strategy

If migration causes issues:

### Option 1: Keep Both Systems

Run old modules and new skills side-by-side:
- Old modules in `augment-extensions/`
- New skills in `skills/`
- Gradually transition references

### Option 2: Revert to Modules

1. Remove skill files
2. Restore module references
3. Document issues encountered

### Option 3: Hybrid Approach

- Keep large reference modules in `augment-extensions/`
- Use skills for frequently-used capabilities
- Load modules only when needed

---

## Best Practices

### DO ✅

- **Keep skills focused**: One skill, one purpose
- **Minimize token usage**: Be concise, avoid redundancy
- **Provide examples**: Show common use cases
- **Document dependencies**: List required skills
- **Test thoroughly**: Validate before committing
- **Version properly**: Follow semantic versioning
- **Use meta-skill**: Automate skill creation with `augx skill create-mcp`

### DON'T ❌

- **Don't duplicate content**: Extract common patterns to shared skills
- **Don't exceed token budgets**: Keep skills under 10k tokens
- **Don't create monolithic skills**: Split large skills into smaller ones
- **Don't forget CLI wrappers**: Add CLI if skill needs execution
- **Don't skip validation**: Always validate skills before use

---

## Troubleshooting

### Issue: Skill file too large

**Solution**: Split into multiple skills or reduce examples

```bash
# Check token count
augx skill show <skill-id> --json | jq '.tokenBudget'

# If > 10k, split into multiple skills
```

### Issue: Missing dependencies

**Solution**: Add dependencies to skill frontmatter

```yaml
dependencies: [other-skill-id]
```

### Issue: CLI command not found

**Solution**: Ensure CLI wrapper is registered

```typescript
// cli/src/cli.ts
program.command('my-command').action(myCommandHandler);
```

### Issue: Skill not appearing in list

**Solution**: Validate skill file format

```bash
augx skill validate skills/category/skill-name.md
```

---

## Success Metrics

Track these metrics to measure migration success:

- **Token reduction**: Target 70%+ reduction (achieved 97.2% in benchmarks)
- **Load time**: Skills should load < 100ms
- **Context size**: Average context size should decrease significantly
- **CLI usage**: Track CLI command usage
- **Skill adoption**: Monitor skill injection frequency

---

## Next Steps

After migration:

1. **Archive old modules**: Move to `augment-extensions/archive/` (optional)
2. **Update documentation**: Ensure all references point to skills
3. **Train team**: Share migration guide with team
4. **Monitor usage**: Track skill usage and performance
5. **Iterate**: Refine skills based on usage patterns

---

## Additional Resources

- **Skill Development Guide**: `docs/SKILL_DEVELOPMENT.md`
- **CLI Reference**: `docs/CLI_REFERENCE.md`
- **Benchmark Results**: `benchmarks/results.json`
- **Meta-Skill**: `skills/generation/add-mcp-skill.md`
- **Skills README**: `skills/README.md`

---

## Support

For migration assistance:
- Review existing skills in `skills/` directory
- Use `augx skill create-mcp` for automation
- Check benchmark results for expected token reductions
- Consult `docs/SKILL_DEVELOPMENT.md` for best practices

