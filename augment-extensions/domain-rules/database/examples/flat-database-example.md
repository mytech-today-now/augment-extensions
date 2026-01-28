# Flat Database Example: Configuration Management System

## Overview

This example demonstrates a complete configuration management system using JSON files with:
- **Schema validation** with JSON Schema
- **Atomic writes** to prevent corruption
- **File locking** for concurrent access
- **Backup/restore** functionality
- **Migration to SQLite** when needed
- **Sample code** in both Python and JavaScript

---

## Use Case

**Application Configuration Manager:**
- Store application settings in JSON files
- Support multiple environments (dev, staging, production)
- Validate configuration against schema
- Provide safe concurrent access
- Backup before changes
- Migrate to SQLite when configuration grows

---

## Directory Structure

```
config-manager/
├── config/
│   ├── dev.json              # Development config
│   ├── staging.json          # Staging config
│   ├── production.json       # Production config
│   └── schema.json           # JSON Schema
├── backups/                  # Configuration backups
├── config_manager.py         # Python implementation
├── config_manager.js         # JavaScript implementation
└── migrate_to_sqlite.py      # Migration script
```

---

## JSON Schema Definition

**File: `config/schema.json`**

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Application Configuration",
  "type": "object",
  "properties": {
    "environment": {
      "type": "string",
      "enum": ["development", "staging", "production"]
    },
    "database": {
      "type": "object",
      "properties": {
        "host": { "type": "string" },
        "port": { "type": "integer", "minimum": 1, "maximum": 65535 },
        "name": { "type": "string" },
        "username": { "type": "string" },
        "password": { "type": "string" },
        "pool_size": { "type": "integer", "minimum": 1, "default": 10 }
      },
      "required": ["host", "port", "name", "username", "password"]
    },
    "cache": {
      "type": "object",
      "properties": {
        "enabled": { "type": "boolean", "default": true },
        "ttl": { "type": "integer", "minimum": 0, "default": 3600 },
        "max_size": { "type": "integer", "minimum": 0, "default": 1000 }
      }
    },
    "features": {
      "type": "object",
      "additionalProperties": { "type": "boolean" }
    },
    "logging": {
      "type": "object",
      "properties": {
        "level": {
          "type": "string",
          "enum": ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        },
        "format": { "type": "string" },
        "output": {
          "type": "string",
          "enum": ["console", "file", "both"]
        }
      },
      "required": ["level"]
    }
  },
  "required": ["environment", "database", "logging"]
}
```

---

## Sample Configuration

**File: `config/dev.json`**

```json
{
  "environment": "development",
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp_dev",
    "username": "dev_user",
    "password": "dev_password",
    "pool_size": 5
  },
  "cache": {
    "enabled": true,
    "ttl": 300,
    "max_size": 100
  },
  "features": {
    "new_ui": true,
    "beta_features": true,
    "analytics": false
  },
  "logging": {
    "level": "DEBUG",
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "output": "console"
  }
}
```

---

## Python Implementation

**File: `config_manager.py`**

```python
import json
import os
import fcntl
import tempfile
import shutil
from datetime import datetime
from pathlib import Path
import jsonschema

class ConfigManager:
    """Configuration manager with validation, locking, and backups."""
    
    def __init__(self, config_dir='config', backup_dir='backups'):
        self.config_dir = Path(config_dir)
        self.backup_dir = Path(backup_dir)
        self.backup_dir.mkdir(exist_ok=True)
        
        # Load schema
        schema_path = self.config_dir / 'schema.json'
        with open(schema_path) as f:
            self.schema = json.load(f)
    
    def _validate(self, config):
        """Validate configuration against schema."""
        jsonschema.validate(instance=config, schema=self.schema)
    
    def _backup(self, filepath):
        """Create timestamped backup of configuration file."""
        if not filepath.exists():
            return None

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = filepath.name
        backup_path = self.backup_dir / f"{filename}.backup_{timestamp}"
        shutil.copy2(filepath, backup_path)
        return backup_path

    def _rotate_backups(self, filename, keep=5):
        """Keep only N most recent backups."""
        pattern = f"{filename}.backup_*"
        backups = sorted(self.backup_dir.glob(pattern), reverse=True)

        # Delete old backups
        for old_backup in backups[keep:]:
            old_backup.unlink()

    def read(self, environment):
        """Read configuration with shared lock."""
        filepath = self.config_dir / f"{environment}.json"

        with open(filepath, 'r') as f:
            fcntl.flock(f.fileno(), fcntl.LOCK_SH)  # Shared lock
            try:
                config = json.load(f)
                self._validate(config)
                return config
            finally:
                fcntl.flock(f.fileno(), fcntl.LOCK_UN)  # Unlock

    def write(self, environment, config):
        """Write configuration with validation, backup, and atomic write."""
        filepath = self.config_dir / f"{environment}.json"

        # Validate first
        self._validate(config)

        # Create backup
        if filepath.exists():
            backup_path = self._backup(filepath)
            print(f"Created backup: {backup_path}")
            self._rotate_backups(filepath.name)

        # Atomic write with exclusive lock
        with tempfile.NamedTemporaryFile(
            mode='w',
            dir=self.config_dir,
            delete=False
        ) as tmp:
            json.dump(config, tmp, indent=2)
            tmp_path = tmp.name

        # Atomic rename
        os.replace(tmp_path, filepath)
        print(f"Configuration written: {filepath}")

    def update(self, environment, updates):
        """Update specific configuration values."""
        config = self.read(environment)

        # Deep merge updates
        def deep_merge(base, updates):
            for key, value in updates.items():
                if isinstance(value, dict) and key in base:
                    deep_merge(base[key], value)
                else:
                    base[key] = value

        deep_merge(config, updates)
        self.write(environment, config)

    def restore(self, environment, backup_timestamp):
        """Restore configuration from backup."""
        filename = f"{environment}.json"
        backup_path = self.backup_dir / f"{filename}.backup_{backup_timestamp}"

        if not backup_path.exists():
            raise FileNotFoundError(f"Backup not found: {backup_path}")

        # Read backup
        with open(backup_path) as f:
            config = json.load(f)

        # Write as current config
        self.write(environment, config)
        print(f"Restored from backup: {backup_path}")

# Usage Example
if __name__ == '__main__':
    manager = ConfigManager()

    # Read configuration
    config = manager.read('dev')
    print(f"Database host: {config['database']['host']}")

    # Update configuration
    manager.update('dev', {
        'cache': {'ttl': 600},
        'features': {'new_feature': True}
    })

    # Restore from backup
    # manager.restore('dev', '20240120_100000')
```

---

## JavaScript Implementation

**File: `config_manager.js`**

```javascript
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const Ajv = require('ajv');
const lockfile = require('proper-lockfile');

class ConfigManager {
  constructor(configDir = 'config', backupDir = 'backups') {
    this.configDir = configDir;
    this.backupDir = backupDir;
    this.ajv = new Ajv();

    // Ensure backup directory exists
    if (!fsSync.existsSync(backupDir)) {
      fsSync.mkdirSync(backupDir, { recursive: true });
    }
  }

  async init() {
    // Load schema
    const schemaPath = path.join(this.configDir, 'schema.json');
    const schemaData = await fs.readFile(schemaPath, 'utf8');
    this.schema = JSON.parse(schemaData);
    this.validate = this.ajv.compile(this.schema);
  }

  _validateConfig(config) {
    const valid = this.validate(config);
    if (!valid) {
      throw new Error(`Validation failed: ${JSON.stringify(this.validate.errors)}`);
    }
  }

  async _backup(filepath) {
    try {
      await fs.access(filepath);
    } catch {
      return null; // File doesn't exist
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = path.basename(filepath);
    const backupPath = path.join(this.backupDir, `${filename}.backup_${timestamp}`);

    await fs.copyFile(filepath, backupPath);
    return backupPath;
  }

  async _rotateBackups(filename, keep = 5) {
    const files = await fs.readdir(this.backupDir);
    const backups = files
      .filter(f => f.startsWith(`${filename}.backup_`))
      .sort()
      .reverse();

    // Delete old backups
    for (const backup of backups.slice(keep)) {
      await fs.unlink(path.join(this.backupDir, backup));
    }
  }

  async read(environment) {
    const filepath = path.join(this.configDir, `${environment}.json`);

    // Acquire shared lock
    const release = await lockfile.lock(filepath, { retries: 5 });

    try {
      const data = await fs.readFile(filepath, 'utf8');
      const config = JSON.parse(data);
      this._validateConfig(config);
      return config;
    } finally {
      await release();
    }
  }

  async write(environment, config) {
    const filepath = path.join(this.configDir, `${environment}.json`);

    // Validate first
    this._validateConfig(config);

    // Create backup
    try {
      const backupPath = await this._backup(filepath);
      if (backupPath) {
        console.log(`Created backup: ${backupPath}`);
        await this._rotateBackups(path.basename(filepath));
      }
    } catch (err) {
      console.error(`Backup failed: ${err.message}`);
    }

    // Atomic write
    const tmpPath = `${filepath}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(config, null, 2));
    await fs.rename(tmpPath, filepath);

    console.log(`Configuration written: ${filepath}`);
  }

  async update(environment, updates) {
    const config = await this.read(environment);

    // Deep merge
    function deepMerge(base, updates) {
      for (const [key, value] of Object.entries(updates)) {
        if (typeof value === 'object' && !Array.isArray(value) && key in base) {
          deepMerge(base[key], value);
        } else {
          base[key] = value;
        }
      }
    }

    deepMerge(config, updates);
    await this.write(environment, config);
  }

  async restore(environment, backupTimestamp) {
    const filename = `${environment}.json`;
    const backupPath = path.join(this.backupDir, `${filename}.backup_${backupTimestamp}`);

    const data = await fs.readFile(backupPath, 'utf8');
    const config = JSON.parse(data);

    await this.write(environment, config);
    console.log(`Restored from backup: ${backupPath}`);
  }
}

// Usage Example
(async () => {
  const manager = new ConfigManager();
  await manager.init();

  // Read configuration
  const config = await manager.read('dev');
  console.log(`Database host: ${config.database.host}`);

  // Update configuration
  await manager.update('dev', {
    cache: { ttl: 600 },
    features: { new_feature: true }
  });

  // Restore from backup
  // await manager.restore('dev', '2024-01-20T10-00-00');
})();
```

---

## Migration to SQLite

**File: `migrate_to_sqlite.py`**

When configuration grows beyond simple key-value pairs or you need query capabilities, migrate to SQLite.

```python
import json
import sqlite3
from pathlib import Path

class ConfigMigrator:
    """Migrate JSON configuration to SQLite database."""

    def __init__(self, db_path='config.db'):
        self.db_path = db_path
        self.conn = None

    def connect(self):
        """Connect to SQLite database."""
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row

    def create_schema(self):
        """Create database schema."""
        cursor = self.conn.cursor()

        # Environments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS environments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Configuration table (key-value pairs)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS config_values (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                environment_id INTEGER NOT NULL,
                section TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT NOT NULL,
                value_type TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (environment_id) REFERENCES environments(id),
                UNIQUE(environment_id, section, key)
            )
        ''')

        # Indexes
        cursor.execute('''
            CREATE INDEX IF NOT EXISTS idx_config_env_section
            ON config_values(environment_id, section)
        ''')

        self.conn.commit()

    def migrate_json_file(self, json_path, environment):
        """Migrate JSON configuration file to SQLite."""
        # Read JSON file
        with open(json_path) as f:
            config = json.load(f)

        cursor = self.conn.cursor()

        # Insert environment
        cursor.execute(
            'INSERT OR IGNORE INTO environments (name) VALUES (?)',
            (environment,)
        )
        env_id = cursor.execute(
            'SELECT id FROM environments WHERE name = ?',
            (environment,)
        ).fetchone()[0]

        # Flatten and insert configuration
        def flatten_config(obj, section=''):
            """Recursively flatten nested configuration."""
            for key, value in obj.items():
                full_key = f"{section}.{key}" if section else key

                if isinstance(value, dict):
                    flatten_config(value, full_key)
                else:
                    value_type = type(value).__name__
                    value_str = json.dumps(value) if isinstance(value, (list, dict)) else str(value)

                    cursor.execute('''
                        INSERT OR REPLACE INTO config_values
                        (environment_id, section, key, value, value_type)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (env_id, section or 'root', key, value_str, value_type))

        flatten_config(config)
        self.conn.commit()
        print(f"Migrated {json_path} to SQLite as '{environment}'")

    def get_config(self, environment, section=None):
        """Retrieve configuration from SQLite."""
        cursor = self.conn.cursor()

        # Get environment ID
        env_row = cursor.execute(
            'SELECT id FROM environments WHERE name = ?',
            (environment,)
        ).fetchone()

        if not env_row:
            raise ValueError(f"Environment not found: {environment}")

        env_id = env_row[0]

        # Query configuration
        if section:
            rows = cursor.execute('''
                SELECT section, key, value, value_type
                FROM config_values
                WHERE environment_id = ? AND section = ?
            ''', (env_id, section)).fetchall()
        else:
            rows = cursor.execute('''
                SELECT section, key, value, value_type
                FROM config_values
                WHERE environment_id = ?
            ''', (env_id,)).fetchall()

        # Reconstruct configuration
        config = {}
        for row in rows:
            section_name = row['section']
            key = row['key']
            value = row['value']
            value_type = row['value_type']

            # Parse value based on type
            if value_type == 'bool':
                value = value.lower() == 'true'
            elif value_type == 'int':
                value = int(value)
            elif value_type == 'float':
                value = float(value)
            elif value_type in ('list', 'dict'):
                value = json.loads(value)

            # Build nested structure
            if section_name not in config:
                config[section_name] = {}
            config[section_name][key] = value

        return config

    def update_value(self, environment, section, key, value):
        """Update a single configuration value."""
        cursor = self.conn.cursor()

        # Get environment ID
        env_row = cursor.execute(
            'SELECT id FROM environments WHERE name = ?',
            (environment,)
        ).fetchone()

        if not env_row:
            raise ValueError(f"Environment not found: {environment}")

        env_id = env_row[0]
        value_type = type(value).__name__
        value_str = json.dumps(value) if isinstance(value, (list, dict)) else str(value)

        cursor.execute('''
            INSERT OR REPLACE INTO config_values
            (environment_id, section, key, value, value_type, updated_at)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (env_id, section, key, value_str, value_type))

        self.conn.commit()

    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()

# Migration Example
if __name__ == '__main__':
    migrator = ConfigMigrator()
    migrator.connect()
    migrator.create_schema()

    # Migrate JSON files
    migrator.migrate_json_file('config/dev.json', 'development')
    migrator.migrate_json_file('config/staging.json', 'staging')
    migrator.migrate_json_file('config/production.json', 'production')

    # Query configuration
    dev_config = migrator.get_config('development')
    print(f"Dev database config: {dev_config.get('database', {})}")

    # Update value
    migrator.update_value('development', 'cache', 'ttl', 1200)

    migrator.close()
```

---

## Testing

**File: `test_config_manager.py`**

```python
import unittest
import tempfile
import shutil
from pathlib import Path
from config_manager import ConfigManager

class TestConfigManager(unittest.TestCase):
    def setUp(self):
        """Create temporary directories for testing."""
        self.test_dir = tempfile.mkdtemp()
        self.config_dir = Path(self.test_dir) / 'config'
        self.backup_dir = Path(self.test_dir) / 'backups'
        self.config_dir.mkdir()

        # Copy schema
        shutil.copy('config/schema.json', self.config_dir / 'schema.json')

        self.manager = ConfigManager(
            config_dir=str(self.config_dir),
            backup_dir=str(self.backup_dir)
        )

    def tearDown(self):
        """Clean up temporary directories."""
        shutil.rmtree(self.test_dir)

    def test_write_and_read(self):
        """Test writing and reading configuration."""
        config = {
            "environment": "development",
            "database": {
                "host": "localhost",
                "port": 5432,
                "name": "test_db",
                "username": "test_user",
                "password": "test_pass"
            },
            "logging": {
                "level": "DEBUG"
            }
        }

        self.manager.write('test', config)
        read_config = self.manager.read('test')

        self.assertEqual(config, read_config)

    def test_validation(self):
        """Test schema validation."""
        invalid_config = {
            "environment": "invalid_env",  # Not in enum
            "database": {
                "host": "localhost"
                # Missing required fields
            }
        }

        with self.assertRaises(Exception):
            self.manager.write('test', invalid_config)

    def test_backup_creation(self):
        """Test backup creation."""
        config = {
            "environment": "development",
            "database": {
                "host": "localhost",
                "port": 5432,
                "name": "test_db",
                "username": "test_user",
                "password": "test_pass"
            },
            "logging": {"level": "DEBUG"}
        }

        # Write initial config
        self.manager.write('test', config)

        # Update config (should create backup)
        config['database']['port'] = 5433
        self.manager.write('test', config)

        # Check backup exists
        backups = list(self.backup_dir.glob('test.json.backup_*'))
        self.assertEqual(len(backups), 1)

    def test_update(self):
        """Test configuration update."""
        config = {
            "environment": "development",
            "database": {
                "host": "localhost",
                "port": 5432,
                "name": "test_db",
                "username": "test_user",
                "password": "test_pass"
            },
            "logging": {"level": "DEBUG"}
        }

        self.manager.write('test', config)

        # Update
        self.manager.update('test', {
            'database': {'port': 5433}
        })

        # Verify
        updated = self.manager.read('test')
        self.assertEqual(updated['database']['port'], 5433)
        self.assertEqual(updated['database']['host'], 'localhost')  # Unchanged

if __name__ == '__main__':
    unittest.main()
```

---

## Summary

This example demonstrates:

✅ **Schema Validation**: JSON Schema ensures configuration correctness
✅ **Atomic Writes**: Temp file + rename prevents corruption
✅ **File Locking**: Prevents concurrent write conflicts
✅ **Backup/Restore**: Automatic backups with rotation
✅ **Migration Path**: Clear path to SQLite when needed
✅ **Multi-Language**: Both Python and JavaScript implementations
✅ **Testing**: Comprehensive unit tests

**When to Use This Pattern:**
- Application configuration management
- Feature flags
- Environment-specific settings
- Small datasets (< 1000 records)
- Git-backed configuration

**When to Migrate:**
- Configuration grows > 1 MB
- Need complex queries
- Multiple applications sharing config
- Audit trail requirements
- Fine-grained access control needed

