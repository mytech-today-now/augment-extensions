---
id: sdk-query
name: SDK Query
version: 1.0.0
category: retrieval
tags: [mcp, sdk, query, search]
tokenBudget: 1800
priority: high
dependencies: []
cliCommand: augx-sdk-query
mcpServer: "@modelcontextprotocol/server-sdk"
replaces: ["domain-rules/mcp"]
---

# SDK Query

## Purpose

Query SDK documentation and code examples to find functions, classes, and usage patterns.

## Usage

1. **Specify query**: Describe what you're looking for
2. **Execute**: Run via CLI or direct invocation
3. **Review results**: Get relevant SDK snippets and docs

**Query Types**:
- Function search: "find authentication functions"
- Class search: "find User class"
- Pattern search: "how to handle errors"
- Example search: "show login example"

## Examples

### Example 1: Find Authentication Functions

```bash
augx-sdk-query --query "authentication functions" --sdk "auth-sdk"
```

**Result**:
```typescript
// auth-sdk/src/auth.ts
export function authenticate(credentials: Credentials): Promise<Token> {
  // Validates credentials and returns JWT token
}

export function validateToken(token: string): boolean {
  // Validates JWT token signature and expiration
}
```

### Example 2: Find Usage Pattern

```bash
augx-sdk-query --query "how to handle API errors" --sdk "api-client"
```

**Result**:
```typescript
// api-client/examples/error-handling.ts
try {
  const result = await apiClient.request('/endpoint');
} catch (error) {
  if (error instanceof ApiError) {
    console.error(`API Error: ${error.code} - ${error.message}`);
  }
}
```

### Example 3: Find Class Definition

```bash
augx-sdk-query --query "User class" --sdk "user-management"
```

**Result**:
```typescript
// user-management/src/models/User.ts
export class User {
  id: string;
  email: string;
  name: string;
  
  constructor(data: UserData) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
  }
  
  async save(): Promise<void> {
    // Persist user to database
  }
}
```

## CLI

### Command Syntax

```bash
augx-sdk-query [options]
```

### Options

- `--query <string>` - Search query (required)
- `--sdk <name>` - SDK name to search (optional, searches all if omitted)
- `--type <type>` - Filter by type: function, class, interface, type
- `--limit <number>` - Max results to return (default: 10)
- `--format <format>` - Output format: text, json, markdown (default: text)

### Examples

```bash
# Search all SDKs
augx-sdk-query --query "authentication"

# Search specific SDK
augx-sdk-query --query "User class" --sdk "user-management"

# Filter by type
augx-sdk-query --query "auth" --type function

# JSON output
augx-sdk-query --query "login" --format json
```

## Notes

- **Token Efficient**: Returns only relevant snippets, not full files
- **Context-Aware**: Understands semantic queries
- **Fast**: Pre-indexed for quick retrieval
- **Accurate**: Uses vector similarity for relevance

**Limitations**:
- Requires SDK to be indexed first
- May miss very new or undocumented features
- Best for well-documented SDKs

**Performance**:
- Average query time: 200-500ms
- Token usage: 500-2000 tokens per query
- Cache hit rate: ~70% for common queries

