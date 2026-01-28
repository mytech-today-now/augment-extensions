# Flat Database Guidelines

## Overview

Flat databases store data in simple file formats like CSV, JSON, or JSONL (JSON Lines). They are suitable for small datasets, configuration files, logs, and prototypes. This guide covers when to use flat databases, best practices, and when to migrate to more robust solutions.

---

## When to Use Flat Databases

### ✅ Good Use Cases

**Configuration Management:**
- Application settings
- Feature flags
- User preferences
- Environment variables

**Small Datasets:**
- < 10,000 records
- Simple data structures
- Infrequent updates
- Single-user access

**Prototyping:**
- Proof of concept
- MVP development
- Testing and experimentation
- Temporary data storage

**Logs and Append-Only Data:**
- Application logs
- Audit trails
- Event streams
- Time-series data (small scale)

**Git-Backed Data:**
- Issue tracking (e.g., Beads)
- Documentation metadata
- Project configuration
- Version-controlled data

### ❌ When NOT to Use

**Large Datasets:**
- > 10,000 records
- Complex queries
- Multiple indexes needed
- High-performance requirements

**Concurrent Access:**
- Multiple writers
- High write frequency
- Complex transactions
- ACID requirements

**Complex Relationships:**
- Many-to-many relationships
- Complex joins
- Referential integrity
- Cascading updates/deletes

**Security Requirements:**
- Row-level security
- Fine-grained access control
- Encryption at rest
- Audit logging

---

## File Formats

### CSV (Comma-Separated Values)

**Strengths:**
- Universal compatibility
- Human-readable
- Excel/spreadsheet support
- Simple parsing

**Weaknesses:**
- No nested data
- Type ambiguity
- Escaping complexity
- No schema enforcement

**Example:**
```csv
id,name,email,created_at
1,John Doe,john@example.com,2024-01-20T10:00:00Z
2,Jane Smith,jane@example.com,2024-01-21T11:00:00Z
```

**Best Practices:**
- Always include header row
- Use consistent delimiters
- Escape special characters
- Quote fields with commas/newlines
- Use ISO 8601 for dates

### JSON (JavaScript Object Notation)

**Strengths:**
- Nested data structures
- Type preservation
- Wide language support
- Schema validation (JSON Schema)

**Weaknesses:**
- Entire file must be read/written
- No append-only support
- Larger file size
- Concurrent access issues

**Example:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2024-01-20T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "created_at": "2024-01-21T11:00:00Z"
    }
  ]
}
```

**Best Practices:**
- Use consistent formatting
- Validate with JSON Schema
- Implement atomic writes
- Use file locking
- Keep files < 1MB

### JSONL (JSON Lines)

**Strengths:**
- Append-only support
- Streaming processing
- Partial reads
- Git-friendly diffs
- Concurrent append (with care)

**Weaknesses:**
- Less human-readable
- No nested root structure
- Requires line-by-line parsing
- Duplicate handling needed

**Example:**
```jsonl
{"id":1,"name":"John Doe","email":"john@example.com","created_at":"2024-01-20T10:00:00Z"}
{"id":2,"name":"Jane Smith","email":"jane@example.com","created_at":"2024-01-21T11:00:00Z"}
```

**Best Practices:**
- One JSON object per line
- No newlines within objects
- Append for updates (event sourcing)
- Latest entry wins (for same ID)
- Use for logs and event streams

---

## Schema Validation

### JSON Schema

**Define schema for validation:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "integer" },
    "name": { "type": "string", "minLength": 1 },
    "email": { "type": "string", "format": "email" },
    "created_at": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "name", "email", "created_at"]
}
```

**Validate data (Python):**
```python
import json
import jsonschema

# Load schema
with open('schema.json') as f:
    schema = json.load(f)

# Validate data
data = {"id": 1, "name": "John", "email": "john@example.com", "created_at": "2024-01-20T10:00:00Z"}
jsonschema.validate(instance=data, schema=schema)
```

**Validate data (JavaScript):**
```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

const schema = { /* schema definition */ };
const validate = ajv.compile(schema);

const data = {id: 1, name: "John", email: "john@example.com", created_at: "2024-01-20T10:00:00Z"};
const valid = validate(data);
if (!valid) console.log(validate.errors);
```

---

## File Locking and Concurrency

### File Locking (Python)

**Use `fcntl` for exclusive locks:**
```python
import fcntl
import json

def read_json_safe(filepath):
    """Read JSON file with shared lock."""
    with open(filepath, 'r') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_SH)  # Shared lock
        try:
            data = json.load(f)
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)  # Unlock
    return data

def write_json_safe(filepath, data):
    """Write JSON file with exclusive lock."""
    with open(filepath, 'w') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)  # Exclusive lock
        try:
            json.dump(data, f, indent=2)
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)  # Unlock
```

### Atomic Writes

**Write to temp file, then rename:**
```python
import os
import json
import tempfile

def atomic_write_json(filepath, data):
    """Atomically write JSON file."""
    # Write to temp file in same directory
    dir_path = os.path.dirname(filepath)
    with tempfile.NamedTemporaryFile(mode='w', dir=dir_path, delete=False) as tmp:
        json.dump(data, tmp, indent=2)
        tmp_path = tmp.name

    # Atomic rename
    os.replace(tmp_path, filepath)
```

### Append-Only Pattern (JSONL)

**Safe concurrent appends:**
```python
import json
import fcntl

def append_jsonl(filepath, record):
    """Append record to JSONL file with lock."""
    with open(filepath, 'a') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)  # Exclusive lock
        try:
            f.write(json.dumps(record) + '\n')
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)  # Unlock

def read_jsonl(filepath):
    """Read all records from JSONL file."""
    records = []
    with open(filepath, 'r') as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_SH)  # Shared lock
        try:
            for line in f:
                if line.strip():
                    records.append(json.loads(line))
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)  # Unlock
    return records

def get_latest_state(filepath, id_field='id'):
    """Get latest state for each ID from JSONL."""
    records = read_jsonl(filepath)
    state = {}
    for record in records:
        record_id = record.get(id_field)
        if record_id:
            if record_id not in state:
                state[record_id] = {}
            state[record_id].update(record)  # Latest wins
    return list(state.values())
```

---

## Backup Strategies

### Simple File Backup

**Copy before modification:**
```python
import shutil
from datetime import datetime

def backup_file(filepath):
    """Create timestamped backup."""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_path = f"{filepath}.backup_{timestamp}"
    shutil.copy2(filepath, backup_path)
    return backup_path

def write_with_backup(filepath, data):
    """Write JSON with automatic backup."""
    if os.path.exists(filepath):
        backup_file(filepath)
    atomic_write_json(filepath, data)
```

### Rotation Strategy

**Keep N most recent backups:**
```python
import glob

def rotate_backups(filepath, keep=5):
    """Keep only N most recent backups."""
    pattern = f"{filepath}.backup_*"
    backups = sorted(glob.glob(pattern), reverse=True)

    # Delete old backups
    for old_backup in backups[keep:]:
        os.remove(old_backup)
```

---

## Performance Considerations

### File Size Limits

**Recommended limits:**
- **CSV**: < 10 MB (< 100,000 rows)
- **JSON**: < 1 MB (entire file in memory)
- **JSONL**: < 100 MB (streaming possible)

### Indexing

**For faster lookups, build in-memory index:**
```python
def build_index(records, key_field='id'):
    """Build in-memory index for fast lookups."""
    return {record[key_field]: record for record in records}

# Usage
records = read_jsonl('data.jsonl')
index = build_index(records)
user = index.get(123)  # O(1) lookup
```

### Caching

**Cache file contents in memory:**
```python
import time

class CachedJSONFile:
    def __init__(self, filepath, ttl=60):
        self.filepath = filepath
        self.ttl = ttl
        self.cache = None
        self.cache_time = 0

    def get(self):
        """Get data with caching."""
        now = time.time()
        if self.cache is None or (now - self.cache_time) > self.ttl:
            self.cache = read_json_safe(self.filepath)
            self.cache_time = now
        return self.cache
```

---

## Migration to Relational Database

### When to Migrate

**Migrate when you experience:**
- File size > 10 MB
- Query performance degradation
- Need for complex queries (joins, aggregations)
- Concurrent write conflicts
- Need for transactions
- Referential integrity requirements
- Security/access control needs

### Migration Strategy

**1. Choose Database:**
- **SQLite**: Embedded, serverless, single file
- **PostgreSQL**: Full-featured, ACID, scalable
- **MySQL**: Popular, well-supported, cloud-friendly

**2. Design Schema:**
```sql
-- Example: Migrate users.json to PostgreSQL
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

**3. Migration Script (Python):**
```python
import json
import psycopg2

# Read flat file
with open('users.json') as f:
    data = json.load(f)

# Connect to database
conn = psycopg2.connect("dbname=mydb user=myuser")
cur = conn.cursor()

# Insert data
for user in data['users']:
    cur.execute(
        "INSERT INTO users (id, name, email, created_at) VALUES (%s, %s, %s, %s)",
        (user['id'], user['name'], user['email'], user['created_at'])
    )

conn.commit()
cur.close()
conn.close()
```

**4. Dual-Write Period:**
- Write to both flat file and database
- Verify data consistency
- Monitor performance
- Gradually shift reads to database

**5. Cutover:**
- Stop writing to flat file
- Archive flat file as backup
- Remove flat file code

---

## Common Pitfalls

### ❌ DON'T

**Don't use flat files for:**
- Large datasets (> 10 MB)
- High-frequency writes
- Concurrent access without locking
- Complex queries
- Production systems with uptime requirements

**Don't forget:**
- File locking for concurrent access
- Atomic writes to prevent corruption
- Backups before modifications
- Schema validation
- Error handling for file I/O

**Don't:**
- Edit JSONL files manually (append only)
- Store sensitive data unencrypted
- Use CSV for nested data
- Ignore file size growth
- Skip migration planning

### ✅ DO

**Use flat files for:**
- Configuration management
- Small datasets (< 10,000 records)
- Prototyping and MVPs
- Append-only logs
- Git-backed data

**Always:**
- Implement file locking
- Use atomic writes
- Validate data against schema
- Create backups
- Monitor file size
- Plan migration path

**Best practices:**
- Use JSONL for append-only data
- Use JSON for configuration
- Use CSV for simple tabular data
- Implement caching for read-heavy workloads
- Use compression for large files

---

## Real-World Examples

### Beads Issue Tracker

**Uses JSONL for git-backed issue tracking:**
- Append-only log (`.beads/issues.jsonl`)
- Latest entry wins for each ID
- Git-friendly diffs
- No database required
- Works offline

**Example:**
```jsonl
{"id":"bd-a1b2","title":"Task 1","status":"open","created":"2024-01-20T10:00:00Z"}
{"id":"bd-a1b2","status":"in-progress","updated":"2024-01-20T11:00:00Z"}
{"id":"bd-a1b2","status":"closed","closed":"2024-01-20T12:00:00Z"}
```

### Configuration Management

**Uses JSON for application settings:**
```json
{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "mydb"
  },
  "cache": {
    "enabled": true,
    "ttl": 3600
  },
  "features": {
    "new_ui": true,
    "beta_features": false
  }
}
```

### Application Logs

**Uses JSONL for structured logging:**
```jsonl
{"timestamp":"2024-01-20T10:00:00Z","level":"INFO","message":"Server started","port":8080}
{"timestamp":"2024-01-20T10:01:00Z","level":"ERROR","message":"Database connection failed","error":"Connection timeout"}
{"timestamp":"2024-01-20T10:02:00Z","level":"INFO","message":"Request processed","path":"/api/users","duration_ms":45}
```

---

## Best Practices Summary

### DO

✅ **Use appropriate format**: CSV for simple tables, JSON for config, JSONL for logs
✅ **Implement file locking**: Prevent concurrent write conflicts
✅ **Use atomic writes**: Prevent file corruption
✅ **Validate data**: Use JSON Schema or similar
✅ **Create backups**: Before modifications
✅ **Monitor file size**: Plan migration when needed
✅ **Use compression**: For large files (gzip)
✅ **Implement caching**: For read-heavy workloads
✅ **Plan migration**: Know when to move to database

### DON'T

❌ **Don't use for large datasets**: > 10 MB
❌ **Don't skip locking**: Concurrent access requires locks
❌ **Don't edit JSONL manually**: Append only
❌ **Don't store sensitive data unencrypted**: Use encryption
❌ **Don't ignore errors**: Handle file I/O errors
❌ **Don't use for complex queries**: Migrate to database
❌ **Don't forget backups**: Always backup before modification
❌ **Don't use in production**: Without proper safeguards

---

## Tools and Libraries

### Python

- **json**: Built-in JSON parsing
- **csv**: Built-in CSV parsing
- **jsonschema**: JSON Schema validation
- **fcntl**: File locking (Unix)
- **tempfile**: Atomic writes

### JavaScript/Node.js

- **fs**: Built-in file system
- **csv-parser**: CSV parsing
- **ajv**: JSON Schema validation
- **proper-lockfile**: Cross-platform file locking
- **atomic-write**: Atomic file writes

### Command-Line Tools

- **jq**: JSON query and manipulation
- **csvkit**: CSV processing toolkit
- **sqlite3**: Migrate to SQLite
- **gzip**: File compression

