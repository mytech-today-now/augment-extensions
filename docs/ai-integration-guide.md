# AI Integration Guide for Module Inspection

## Overview

This guide covers integrating Augment Extensions module inspection with AI assistants for enhanced code generation, review, and refactoring workflows.

## Features

### 1. AI Prompt Generation

Generate AI-ready prompts from module standards:

```bash
# Generate code review prompt
augx show module typescript-standards --ai-prompt code-review

# Generate module summary for AI context
augx show module php-standards --ai-prompt module-summary

# Generate optimization suggestions prompt
augx show module python-standards --ai-prompt optimization

# Generate refactoring recommendations prompt
augx show module go-standards --ai-prompt refactoring
```

### 2. AI Summary Generation

Create concise summaries for AI context:

```bash
# Generate detailed summary
augx show module typescript-standards --ai-summary

# Generate compact summary
augx show module typescript-standards --ai-summary --compact

# Generate JSON summary for programmatic use
augx show module typescript-standards --ai-summary --json
```

### 3. AI Context Injection

Inject module standards into AI context:

```bash
# Generate AI context string
augx show module typescript-standards --ai-context

# Pipe to clipboard (Windows)
augx show module typescript-standards --ai-context | clip

# Pipe to clipboard (macOS)
augx show module typescript-standards --ai-context | pbcopy

# Pipe to clipboard (Linux)
augx show module typescript-standards --ai-context | xclip -selection clipboard
```

## Prompt Templates

### Code Review Template

```bash
augx show module typescript-standards --ai-prompt code-review > review-prompt.txt
```

**Generated Prompt**:
```
# Code Review Request

## Standards Module
**Module**: coding-standards/typescript
**Version**: 1.0.0
**Type**: coding-standards

## Standards to Apply
TypeScript coding standards with type safety and best practices

## Rules
1. naming-conventions.md
2. type-safety.md
3. error-handling.md
...

## Task
Please review the following code against these standards:

[Paste your code here]

## Expected Output
1. Compliance assessment
2. Violations found (if any)
3. Specific recommendations
4. Code examples for fixes
```

### Module Summary Template

```bash
augx show module php-standards --ai-prompt module-summary
```

**Use Case**: Provide AI with module context before code generation

### Optimization Template

```bash
augx show module python-standards --ai-prompt optimization
```

**Use Case**: Get AI suggestions for code optimization based on standards

### Refactoring Template

```bash
augx show module go-standards --ai-prompt refactoring
```

**Use Case**: Get AI guidance for refactoring code to meet standards

## Workflows

### Workflow 1: AI-Assisted Code Review

1. **Inspect module standards**:
   ```bash
   augx show module typescript-standards --ai-prompt code-review > prompt.txt
   ```

2. **Add your code to the prompt**:
   Edit `prompt.txt` and paste your code

3. **Send to AI assistant**:
   Copy prompt and paste into AI chat

4. **Apply recommendations**:
   Implement suggested fixes

### Workflow 2: Context-Aware Code Generation

1. **Generate AI context**:
   ```bash
   augx show module php-standards --ai-context | clip
   ```

2. **Paste into AI assistant**:
   Provide context before asking for code

3. **Request code generation**:
   "Generate a PHP class following these standards"

4. **Verify compliance**:
   Review generated code against standards

### Workflow 3: Automated Optimization

1. **Generate optimization prompt**:
   ```bash
   augx show module python-standards --ai-prompt optimization > optimize.txt
   ```

2. **Add target file**:
   Append your code to the prompt

3. **Get AI suggestions**:
   Send to AI assistant

4. **Implement optimizations**:
   Apply high-impact suggestions first

### Workflow 4: Refactoring Guidance

1. **Generate refactoring prompt**:
   ```bash
   augx show module go-standards --ai-prompt refactoring
   ```

2. **Provide code context**:
   Include current code structure

3. **Get step-by-step guidance**:
   AI provides migration plan

4. **Execute refactoring**:
   Follow AI recommendations

## Integration with AI Tools

### Augment Code AI

```bash
# Generate context for Augment AI
augx show module typescript-standards --ai-context

# Use in .augment/ folder
augx show module typescript-standards --ai-summary > .augment/typescript-context.md
```

### GitHub Copilot

```bash
# Generate inline comments with standards
augx show module php-standards --ai-summary --compact
# Copy output to code comments for Copilot context
```

### ChatGPT / Claude

```bash
# Generate comprehensive prompt
augx show module python-standards --ai-prompt code-review

# Include in conversation for context-aware responses
```

## Advanced Usage

### Batch Processing

```bash
# Generate prompts for all linked modules
for module in $(augx list --linked --json | jq -r '.[].name'); do
  augx show module "$module" --ai-prompt module-summary > "ai-context/${module}.txt"
done
```

### Custom Prompt Templates

Create custom templates by combining outputs:

```bash
# Combine module summary with optimization prompt
{
  augx show module typescript-standards --ai-summary
  echo ""
  augx show module typescript-standards --ai-prompt optimization
} > custom-prompt.txt
```

### CI/CD Integration

```yaml
# .github/workflows/ai-review.yml
- name: Generate AI Review Prompt
  run: |
    augx show module typescript-standards --ai-prompt code-review > review-prompt.txt
    # Send to AI service for automated review
```

## Best Practices

1. **Always provide context**: Use `--ai-context` before code generation
2. **Use specific prompts**: Choose the right template for your task
3. **Verify AI output**: Always review AI-generated code against standards
4. **Iterate**: Refine prompts based on AI responses
5. **Cache summaries**: Generate summaries once, reuse multiple times

## Tips

- **Compact summaries** are better for inline context
- **Detailed summaries** are better for comprehensive reviews
- **JSON output** is ideal for programmatic processing
- **Prompt templates** can be customized for specific needs
- **AI context** should be injected before each code generation request

## See Also

- [Module Inspection Commands](./commands/module-inspection.md)
- [VS Code Integration Guide](./vscode-integration-guide.md)
- [Module Inspection Workflows](./examples/module-inspection-workflows.md)

