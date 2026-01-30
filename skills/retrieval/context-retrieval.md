---
id: context-retrieval
name: Context Retrieval
version: 1.0.0
category: retrieval
tags: [mcp, context, codebase, search]
tokenBudget: 2200
priority: high
dependencies: []
cliCommand: augx-context-retrieve
mcpServer: "@modelcontextprotocol/server-context"
replaces: ["domain-rules/mcp"]
---

# Context Retrieval

## Purpose

Retrieve relevant code context from the codebase using semantic search and pattern matching.

## Usage

1. **Describe need**: What code/context you're looking for
2. **Execute query**: Run via CLI or direct invocation
3. **Review context**: Get relevant code snippets with file paths

**Query Types**:
- Semantic: "code that handles user authentication"
- Pattern: "functions that use async/await"
- Symbol: "where is UserService defined"
- Usage: "how is validateEmail used"

## Examples

### Example 1: Semantic Search

```bash
augx-context-retrieve --query "code that handles user authentication"
```

**Result**:
```
src/auth/AuthService.ts (lines 45-78):
export class AuthService {
  async authenticate(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      throw new AuthenticationError('Invalid credentials');
    }
    return user;
  }
}

src/middleware/auth.ts (lines 12-25):
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  // ... token validation
}
```

### Example 2: Symbol Search

```bash
augx-context-retrieve --query "UserService definition" --type symbol
```

**Result**:
```
src/services/UserService.ts (lines 8-45):
export class UserService {
  constructor(private userRepo: UserRepository) {}
  
  async createUser(data: CreateUserDto): Promise<User> {
    // ... implementation
  }
  
  async findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id);
  }
}
```

### Example 3: Usage Search

```bash
augx-context-retrieve --query "validateEmail usage" --type usage
```

**Result**:
```
src/validators/email.ts (lines 5-10):
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

src/services/UserService.ts (line 23):
if (!validateEmail(data.email)) {
  throw new ValidationError('Invalid email format');
}

src/api/routes/auth.ts (line 45):
const isValid = validateEmail(req.body.email);
```

## CLI

### Command Syntax

```bash
augx-context-retrieve [options]
```

### Options

- `--query <string>` - Search query (required)
- `--type <type>` - Query type: semantic, pattern, symbol, usage (default: semantic)
- `--files <pattern>` - File pattern to search (e.g., "src/**/*.ts")
- `--limit <number>` - Max results (default: 5)
- `--context <lines>` - Context lines before/after (default: 5)
- `--format <format>` - Output format: text, json, markdown (default: text)

### Examples

```bash
# Semantic search
augx-context-retrieve --query "error handling code"

# Search specific files
augx-context-retrieve --query "API routes" --files "src/api/**/*.ts"

# Symbol search
augx-context-retrieve --query "DatabaseConnection" --type symbol

# More context
augx-context-retrieve --query "login function" --context 10

# JSON output
augx-context-retrieve --query "auth middleware" --format json
```

## Notes

**Features**:
- **Semantic Understanding**: Uses embeddings for relevance
- **Fast**: Pre-indexed codebase for quick retrieval
- **Context-Aware**: Returns surrounding code for clarity
- **File-Aware**: Shows file paths and line numbers

**Limitations**:
- Requires codebase to be indexed
- May miss very recent changes (index lag)
- Best for well-structured codebases

**Performance**:
- Average query time: 300-800ms
- Token usage: 1000-3000 tokens per query
- Index update: Every 5 minutes or on file save

**Token Efficiency**:
- Returns only relevant snippets (not full files)
- Configurable context window
- Smart truncation for large results

