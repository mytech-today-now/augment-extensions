# Universal Database Best Practices

## Overview

This document covers universal best practices that apply to all database types: relational (SQL), NoSQL (document, key-value, graph), vector databases, and flat file databases.

---

## Data Security

### Encryption at Rest

**Encrypt sensitive data stored in databases:**

```sql
-- PostgreSQL: Enable transparent data encryption (TDE)
-- Use pgcrypto extension for column-level encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive columns
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ssn BYTEA,  -- Encrypted field
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert encrypted data
INSERT INTO users (email, ssn)
VALUES ('user@example.com', pgp_sym_encrypt('123-45-6789', 'encryption-key'));

-- Query encrypted data
SELECT email, pgp_sym_decrypt(ssn, 'encryption-key') AS ssn
FROM users;
```

**Best Practices:**
- ✅ Use database-native encryption features (TDE, column-level encryption)
- ✅ Encrypt entire database volumes using OS/cloud provider encryption
- ✅ Store encryption keys in secure key management systems (AWS KMS, Azure Key Vault, HashiCorp Vault)
- ✅ Rotate encryption keys regularly
- ❌ Never store encryption keys in application code or version control

### Encryption in Transit

**Always use encrypted connections:**

```javascript
// Node.js with PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.example.com',
  database: 'mydb',
  user: 'dbuser',
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-cert.pem').toString(),
  }
});
```

**Best Practices:**
- ✅ Require SSL/TLS for all database connections
- ✅ Use certificate-based authentication when possible
- ✅ Verify server certificates (reject unauthorized connections)
- ✅ Use TLS 1.2 or higher
- ❌ Never allow unencrypted connections in production

### Access Controls

**Implement least privilege access:**

```sql
-- PostgreSQL: Create role with minimal permissions
CREATE ROLE app_reader;
GRANT CONNECT ON DATABASE mydb TO app_reader;
GRANT USAGE ON SCHEMA public TO app_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_reader;

-- Create role for application writes
CREATE ROLE app_writer;
GRANT CONNECT ON DATABASE mydb TO app_writer;
GRANT USAGE ON SCHEMA public TO app_writer;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_writer;

-- Create user with specific role
CREATE USER app_user WITH PASSWORD 'secure-password';
GRANT app_writer TO app_user;
```

**Best Practices:**
- ✅ Use role-based access control (RBAC)
- ✅ Grant minimum necessary permissions
- ✅ Separate read-only and read-write access
- ✅ Use different credentials for different application components
- ✅ Regularly audit and review permissions
- ❌ Never use superuser/admin accounts for applications
- ❌ Never share database credentials between environments

---

## Authentication & Authorization

### Secure Authentication

**Best Practices:**
- ✅ Use strong, unique passwords (minimum 16 characters)
- ✅ Store passwords in secure secret management systems
- ✅ Use certificate-based authentication for service accounts
- ✅ Enable multi-factor authentication (MFA) for admin access
- ✅ Implement account lockout after failed login attempts
- ❌ Never hardcode credentials in application code
- ❌ Never commit credentials to version control

### Connection String Security

```javascript
// ❌ BAD: Hardcoded credentials
const connectionString = 'postgresql://admin:password123@db.example.com:5432/mydb';

// ✅ GOOD: Use environment variables
const connectionString = process.env.DATABASE_URL;

// ✅ BETTER: Use secret management
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getDatabaseCredentials() {
  const secret = await secretsManager.getSecretValue({
    SecretId: 'prod/database/credentials'
  }).promise();
  
  return JSON.parse(secret.SecretString);
}
```

---

## Data Privacy & Compliance

### GDPR Compliance

**Right to be forgotten:**

```sql
-- Implement soft delete for audit trail
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN deletion_reason TEXT;

-- Delete user data (GDPR request)
UPDATE users
SET 
    email = 'deleted@example.com',
    name = 'DELETED',
    deleted_at = CURRENT_TIMESTAMP,
    deletion_reason = 'GDPR request'
WHERE id = 12345;

-- Permanently delete after retention period
DELETE FROM users
WHERE deleted_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
```

### HIPAA Compliance

**Audit logging for protected health information (PHI):**

```sql
-- Create audit log table
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    record_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,  -- INSERT, UPDATE, DELETE, SELECT
    user_id BIGINT NOT NULL,
    user_ip INET,
    changed_fields JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, user_id, changed_fields)
    VALUES (
        TG_TABLE_NAME,
        NEW.id,
        TG_OP,
        current_setting('app.user_id')::BIGINT,
        to_jsonb(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to sensitive tables
CREATE TRIGGER audit_patients
AFTER INSERT OR UPDATE OR DELETE ON patients
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### CCPA Compliance

**Data portability and disclosure:**

```sql
-- Export user data (CCPA request)
SELECT
    u.id,
    u.email,
    u.name,
    u.created_at,
    json_agg(o.*) AS orders,
    json_agg(p.*) AS preferences
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
LEFT JOIN user_preferences p ON p.user_id = u.id
WHERE u.id = 12345
GROUP BY u.id;
```

**Best Practices:**
- ✅ Implement data export functionality
- ✅ Maintain audit logs for all data access
- ✅ Document data retention policies
- ✅ Implement data anonymization for analytics
- ✅ Provide clear consent mechanisms

---

## Backup & Disaster Recovery

### Backup Strategy

**3-2-1 Backup Rule:**
- **3** copies of data
- **2** different storage media
- **1** off-site backup

```bash
#!/bin/bash
# PostgreSQL backup script

# Full backup
pg_dump -h localhost -U postgres -F c -b -v -f "/backups/mydb_$(date +%Y%m%d_%H%M%S).backup" mydb

# Incremental backup using WAL archiving
# In postgresql.conf:
# wal_level = replica
# archive_mode = on
# archive_command = 'cp %p /archive/%f'

# Point-in-time recovery (PITR)
pg_basebackup -h localhost -D /backups/base -U replication -v -P --wal-method=stream
```

**Best Practices:**
- ✅ Automate backups (daily full, hourly incremental)
- ✅ Test restore procedures regularly (monthly)
- ✅ Store backups in multiple geographic locations
- ✅ Encrypt backups at rest and in transit
- ✅ Monitor backup success/failure
- ✅ Document recovery time objective (RTO) and recovery point objective (RPO)
- ❌ Never rely on a single backup location

### Disaster Recovery Plan

**Key Components:**
1. **Backup verification**: Regularly test backup integrity
2. **Failover procedures**: Document and test failover to standby
3. **Recovery procedures**: Step-by-step recovery instructions
4. **Communication plan**: Who to notify during incidents
5. **Post-incident review**: Learn from failures

---

## Monitoring & Observability

### Key Metrics to Monitor

**Performance Metrics:**
- Query execution time (p50, p95, p99)
- Connection pool utilization
- Cache hit ratio
- Disk I/O (IOPS, throughput)
- CPU and memory usage
- Replication lag (for replicas)

**Health Metrics:**
- Database uptime
- Failed connection attempts
- Deadlocks and lock waits
- Transaction rollback rate
- Error rate

### Monitoring Implementation

```javascript
// Node.js with Prometheus metrics
const client = require('prom-client');

// Query duration histogram
const queryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration in seconds',
  labelNames: ['query_type', 'table'],
  buckets: [0.001, 0.01, 0.1, 1, 5, 10]
});

// Connection pool gauge
const poolConnections = new client.Gauge({
  name: 'db_pool_connections',
  help: 'Number of database connections',
  labelNames: ['state']  // active, idle, waiting
});

// Instrument queries
async function executeQuery(query, params) {
  const end = queryDuration.startTimer({ query_type: 'SELECT', table: 'users' });
  try {
    const result = await pool.query(query, params);
    return result;
  } finally {
    end();
  }
}
```

**Best Practices:**
- ✅ Set up alerts for critical metrics (high CPU, slow queries, connection exhaustion)
- ✅ Use centralized logging (ELK stack, Splunk, CloudWatch)
- ✅ Monitor query performance trends over time
- ✅ Track slow query logs
- ✅ Implement health check endpoints

---

## Performance Profiling

### Query Analysis

```sql
-- PostgreSQL: Enable query logging
-- In postgresql.conf:
-- log_min_duration_statement = 1000  -- Log queries > 1 second
-- log_statement = 'all'

-- Analyze query execution plan
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name
ORDER BY order_count DESC
LIMIT 10;

-- Find slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

**Best Practices:**
- ✅ Use EXPLAIN ANALYZE to understand query execution
- ✅ Identify and optimize N+1 queries
- ✅ Monitor query execution time trends
- ✅ Set up slow query alerts
- ✅ Regularly review and optimize top queries

---

## Version Control for Schemas

### Migration-Based Schema Management

**Best Practices:**
- ✅ Use migration tools (Flyway, Liquibase, Alembic, Prisma Migrate)
- ✅ Version all schema changes
- ✅ Make migrations reversible (up/down migrations)
- ✅ Test migrations in staging before production
- ✅ Include migrations in version control
- ❌ Never manually modify production schemas

### Example Migration Structure

```
migrations/
├── 001_create_users_table.sql
├── 002_add_email_index.sql
├── 003_create_orders_table.sql
└── 004_add_user_preferences.sql
```

```sql
-- migrations/001_create_users_table.sql
-- Up migration
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Down migration (in separate file or section)
DROP TABLE users;
```

---

## CI/CD Integration

### Automated Testing

```yaml
# .github/workflows/database-tests.yml
name: Database Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Run migrations
        run: npm run migrate

      - name: Run tests
        run: npm test

      - name: Run integration tests
        run: npm run test:integration
```

**Best Practices:**
- ✅ Run migrations in CI/CD pipeline
- ✅ Test migrations on fresh database
- ✅ Test rollback procedures
- ✅ Run integration tests against real database
- ✅ Validate schema changes don't break existing queries

---

## Summary

**Key Takeaways:**

1. **Security First**: Encrypt data at rest and in transit, implement least privilege access
2. **Compliance**: Understand and implement GDPR, HIPAA, CCPA requirements
3. **Backup & Recovery**: Automate backups, test restores regularly, maintain disaster recovery plan
4. **Monitoring**: Track performance and health metrics, set up alerts
5. **Version Control**: Use migration-based schema management, never manual changes
6. **CI/CD**: Automate testing, validate migrations, run integration tests

**Common Pitfalls:**
- ❌ Storing credentials in code or version control
- ❌ Not testing backup restore procedures
- ❌ Ignoring slow query warnings
- ❌ Manual schema changes in production
- ❌ Not monitoring database health metrics
- ❌ Insufficient access controls

