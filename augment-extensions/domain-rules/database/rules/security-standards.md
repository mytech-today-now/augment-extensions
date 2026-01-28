# Database Security Standards

## Overview

This document covers comprehensive security standards for database development, including SQL injection prevention, input validation, encryption strategies, access control, and compliance requirements.

---

## SQL Injection Prevention

### Parameterized Queries (Prepared Statements)

**ALWAYS use parameterized queries to prevent SQL injection:**

```javascript
// ❌ BAD: String concatenation (SQL injection vulnerability)
const userId = req.query.id;
const query = `SELECT * FROM users WHERE id = ${userId}`;
const result = await db.query(query);

// ❌ BAD: Template literals (SQL injection vulnerability)
const email = req.body.email;
const query = `SELECT * FROM users WHERE email = '${email}'`;
const result = await db.query(query);

// ✅ GOOD: Parameterized query (PostgreSQL)
const userId = req.query.id;
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);

// ✅ GOOD: Named parameters (MySQL)
const email = req.body.email;
const query = 'SELECT * FROM users WHERE email = ?';
const result = await db.query(query, [email]);

// ✅ GOOD: ORM (Prisma)
const user = await prisma.user.findUnique({
  where: { id: parseInt(userId) }
});

// ✅ GOOD: Query builder (Knex)
const users = await knex('users')
  .where('email', email)
  .select('*');
```

### Dynamic Query Construction

**When building dynamic queries, use query builders or ORMs:**

```javascript
// ❌ BAD: Dynamic query with string concatenation
function searchUsers(filters) {
  let query = 'SELECT * FROM users WHERE 1=1';
  
  if (filters.name) {
    query += ` AND name = '${filters.name}'`;  // SQL injection!
  }
  
  if (filters.email) {
    query += ` AND email = '${filters.email}'`;  // SQL injection!
  }
  
  return db.query(query);
}

// ✅ GOOD: Query builder (Knex)
function searchUsers(filters) {
  let query = knex('users').select('*');
  
  if (filters.name) {
    query = query.where('name', filters.name);
  }
  
  if (filters.email) {
    query = query.where('email', filters.email);
  }
  
  return query;
}

// ✅ GOOD: ORM (Prisma)
function searchUsers(filters) {
  const where = {};
  
  if (filters.name) where.name = filters.name;
  if (filters.email) where.email = filters.email;
  
  return prisma.user.findMany({ where });
}
```

### Stored Procedures

**Use stored procedures for complex operations:**

```sql
-- Create stored procedure with parameterized inputs
CREATE OR REPLACE FUNCTION get_user_orders(
    p_user_id INTEGER,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    order_id INTEGER,
    order_date TIMESTAMP,
    total_amount DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT id, created_at, total
    FROM orders
    WHERE user_id = p_user_id
      AND created_at BETWEEN p_start_date AND p_end_date
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

```javascript
// Call stored procedure
const result = await db.query(
  'SELECT * FROM get_user_orders($1, $2, $3)',
  [userId, startDate, endDate]
);
```

---

## Input Validation & Sanitization

### Validation Before Database Operations

**Always validate input before database operations:**

```javascript
const { z } = require('zod');

// Define validation schema
const userSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(255),
  age: z.number().int().min(0).max(150),
  role: z.enum(['user', 'admin', 'moderator'])
});

// Validate input
async function createUser(input) {
  // Validate
  const validated = userSchema.parse(input);
  
  // Insert with validated data
  const result = await db.query(
    'INSERT INTO users (email, name, age, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [validated.email, validated.name, validated.age, validated.role]
  );
  
  return result.rows[0];
}
```

### Type Coercion

**Ensure proper type coercion:**

```javascript
// ❌ BAD: No type validation
const userId = req.query.id;  // Could be "1 OR 1=1"
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// ✅ GOOD: Type validation and coercion
const userId = parseInt(req.query.id, 10);
if (isNaN(userId)) {
  throw new Error('Invalid user ID');
}
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### Whitelist Validation

**Use whitelist validation for limited options:**

```javascript
// ❌ BAD: No validation on sort column
const sortBy = req.query.sort;  // Could be "id; DROP TABLE users--"
const query = `SELECT * FROM users ORDER BY ${sortBy}`;

// ✅ GOOD: Whitelist validation
const ALLOWED_SORT_COLUMNS = ['id', 'name', 'email', 'created_at'];
const sortBy = req.query.sort;

if (!ALLOWED_SORT_COLUMNS.includes(sortBy)) {
  throw new Error('Invalid sort column');
}

const query = `SELECT * FROM users ORDER BY ${sortBy}`;
```

---

## Output Encoding

### Prevent Data Leakage

**Sanitize output to prevent sensitive data exposure:**

```javascript
// ❌ BAD: Exposing sensitive fields
async function getUser(userId) {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];  // Includes password_hash, ssn, etc.
}

// ✅ GOOD: Select only necessary fields
async function getUser(userId) {
  const result = await db.query(
    'SELECT id, email, name, created_at FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0];
}

// ✅ BETTER: Use DTOs (Data Transfer Objects)
async function getUser(userId) {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = result.rows[0];
  
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.created_at
  };
}
```

---

## Least Privilege Access

### Role-Based Access Control (RBAC)

**Create roles with minimum necessary permissions:**

```sql
-- PostgreSQL: Create application roles

-- Read-only role
CREATE ROLE app_readonly;
GRANT CONNECT ON DATABASE mydb TO app_readonly;
GRANT USAGE ON SCHEMA public TO app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_readonly;

-- Read-write role (no DELETE)
CREATE ROLE app_readwrite;
GRANT CONNECT ON DATABASE mydb TO app_readwrite;
GRANT USAGE ON SCHEMA public TO app_readwrite;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO app_readwrite;

-- Admin role (full access)
CREATE ROLE app_admin;
GRANT ALL PRIVILEGES ON DATABASE mydb TO app_admin;

-- Create users with specific roles
CREATE USER app_reader WITH PASSWORD 'secure-password-1';
GRANT app_readonly TO app_reader;

CREATE USER app_writer WITH PASSWORD 'secure-password-2';
GRANT app_readwrite TO app_writer;
```

### Row-Level Security (RLS)

**Implement row-level security for multi-tenant applications:**

```sql
-- PostgreSQL: Enable row-level security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own documents
CREATE POLICY user_documents ON documents
    FOR SELECT
    USING (user_id = current_setting('app.user_id')::INTEGER);

-- Policy: Users can only update their own documents
CREATE POLICY user_documents_update ON documents
    FOR UPDATE
    USING (user_id = current_setting('app.user_id')::INTEGER);

-- Policy: Admins can see all documents
CREATE POLICY admin_documents ON documents
    FOR ALL
    USING (current_setting('app.user_role') = 'admin');
```

```javascript
// Set user context before queries
async function getUserDocuments(userId) {
  await db.query('SET app.user_id = $1', [userId]);
  await db.query('SET app.user_role = $1', ['user']);

  // RLS automatically filters results
  const result = await db.query('SELECT * FROM documents');
  return result.rows;
}
```

### Column-Level Security

**Restrict access to sensitive columns:**

```sql
-- PostgreSQL: Grant column-level permissions
GRANT SELECT (id, email, name) ON users TO app_readonly;
-- app_readonly cannot access password_hash, ssn, etc.

-- Grant specific columns for updates
GRANT UPDATE (name, email) ON users TO app_readwrite;
-- app_readwrite cannot update password_hash, role, etc.
```

---

## Encryption Strategies

### Encryption at Rest

**Database-level encryption:**

```sql
-- PostgreSQL: Use pgcrypto for column-level encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive data
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    ssn BYTEA,  -- Encrypted
    credit_card BYTEA,  -- Encrypted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert encrypted data
INSERT INTO users (email, ssn, credit_card)
VALUES (
    'user@example.com',
    pgp_sym_encrypt('123-45-6789', current_setting('app.encryption_key')),
    pgp_sym_encrypt('4111-1111-1111-1111', current_setting('app.encryption_key'))
);

-- Query encrypted data
SELECT
    id,
    email,
    pgp_sym_decrypt(ssn, current_setting('app.encryption_key')) AS ssn,
    pgp_sym_decrypt(credit_card, current_setting('app.encryption_key')) AS credit_card
FROM users
WHERE id = 1;
```

**Application-level encryption:**

```javascript
const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');  // 32 bytes

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decrypt(encrypted, iv, authTag) {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Usage
async function createUser(userData) {
  const encryptedSSN = encrypt(userData.ssn);

  await db.query(
    'INSERT INTO users (email, ssn, ssn_iv, ssn_auth_tag) VALUES ($1, $2, $3, $4)',
    [userData.email, encryptedSSN.encrypted, encryptedSSN.iv, encryptedSSN.authTag]
  );
}
```

### Encryption in Transit

**Always use SSL/TLS connections:**

```javascript
// PostgreSQL with SSL
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-cert.pem').toString(),
    key: fs.readFileSync('/path/to/client-key.pem').toString(),
    cert: fs.readFileSync('/path/to/client-cert.pem').toString()
  }
});
```

```python
# MySQL with SSL (Python)
import mysql.connector

connection = mysql.connector.connect(
    host='db.example.com',
    user='dbuser',
    password=os.environ['DB_PASSWORD'],
    database='mydb',
    ssl_ca='/path/to/ca-cert.pem',
    ssl_cert='/path/to/client-cert.pem',
    ssl_key='/path/to/client-key.pem',
    ssl_verify_cert=True
)
```

---

## Secure Connection Strings

### Environment Variables

**Store connection strings in environment variables:**

```javascript
// ❌ BAD: Hardcoded connection string
const pool = new Pool({
  connectionString: 'postgresql://admin:password123@db.example.com:5432/mydb'
});

// ✅ GOOD: Environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// ✅ BETTER: Individual environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});
```

### Secrets Management

**Use dedicated secrets management systems:**

```javascript
// AWS Secrets Manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

async function getDatabaseCredentials() {
  const secret = await secretsManager.getSecretValue({
    SecretId: 'prod/database/credentials'
  }).promise();

  return JSON.parse(secret.SecretString);
}

async function createDatabasePool() {
  const credentials = await getDatabaseCredentials();

  return new Pool({
    host: credentials.host,
    database: credentials.database,
    user: credentials.username,
    password: credentials.password,
    ssl: { rejectUnauthorized: true }
  });
}
```

```javascript
// HashiCorp Vault
const vault = require('node-vault')({
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN
});

async function getDatabaseCredentials() {
  const result = await vault.read('secret/data/database/prod');
  return result.data.data;
}
```

---

## Audit Logging

### Comprehensive Audit Trail

**Log all database operations for sensitive data:**

```sql
-- Create audit log table
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    record_id BIGINT NOT NULL,
    operation VARCHAR(10) NOT NULL,  -- INSERT, UPDATE, DELETE, SELECT
    user_id BIGINT,
    user_ip INET,
    user_agent TEXT,
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_table_record (table_name, record_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_timestamp (timestamp)
);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
    changed_fields TEXT[];
BEGIN
    IF (TG_OP = 'DELETE') THEN
        old_data = to_jsonb(OLD);
        new_data = NULL;
    ELSIF (TG_OP = 'UPDATE') THEN
        old_data = to_jsonb(OLD);
        new_data = to_jsonb(NEW);

        -- Identify changed fields
        SELECT array_agg(key)
        INTO changed_fields
        FROM jsonb_each(old_data)
        WHERE old_data->key IS DISTINCT FROM new_data->key;
    ELSIF (TG_OP = 'INSERT') THEN
        old_data = NULL;
        new_data = to_jsonb(NEW);
    END IF;

    INSERT INTO audit_log (
        table_name,
        record_id,
        operation,
        user_id,
        user_ip,
        old_values,
        new_values,
        changed_fields
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        current_setting('app.user_id', true)::BIGINT,
        current_setting('app.user_ip', true)::INET,
        old_data,
        new_data,
        changed_fields
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER audit_users
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_transactions
AFTER INSERT OR UPDATE OR DELETE ON transactions
FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

### Application-Level Audit Logging

```javascript
// Middleware for audit logging
async function auditLog(req, res, next) {
  const originalQuery = db.query.bind(db);

  db.query = async function(query, params) {
    const result = await originalQuery(query, params);

    // Log query execution
    await originalQuery(
      'INSERT INTO query_audit_log (user_id, query, params, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
      [
        req.user?.id,
        query,
        JSON.stringify(params),
        req.ip,
        req.get('user-agent')
      ]
    );

    return result;
  };

  next();
}
```

---

## Compliance Requirements

### GDPR (General Data Protection Regulation)

**Key Requirements:**
- ✅ Data minimization: Collect only necessary data
- ✅ Purpose limitation: Use data only for stated purposes
- ✅ Storage limitation: Delete data when no longer needed
- ✅ Right to access: Provide user data on request
- ✅ Right to erasure: Delete user data on request
- ✅ Data portability: Export user data in machine-readable format
- ✅ Consent management: Track and honor user consent

```sql
-- GDPR: Right to access
CREATE OR REPLACE FUNCTION export_user_data(p_user_id INTEGER)
RETURNS JSONB AS $$
DECLARE
    user_data JSONB;
BEGIN
    SELECT jsonb_build_object(
        'user', (SELECT row_to_json(u.*) FROM users u WHERE u.id = p_user_id),
        'orders', (SELECT jsonb_agg(o.*) FROM orders o WHERE o.user_id = p_user_id),
        'preferences', (SELECT row_to_json(p.*) FROM user_preferences p WHERE p.user_id = p_user_id),
        'audit_log', (SELECT jsonb_agg(a.*) FROM audit_log a WHERE a.user_id = p_user_id)
    ) INTO user_data;

    RETURN user_data;
END;
$$ LANGUAGE plpgsql;

-- GDPR: Right to erasure
CREATE OR REPLACE FUNCTION delete_user_data(p_user_id INTEGER)
RETURNS VOID AS $$
BEGIN
    -- Anonymize instead of delete (for audit trail)
    UPDATE users
    SET
        email = 'deleted_' || id || '@example.com',
        name = 'DELETED',
        phone = NULL,
        address = NULL,
        deleted_at = CURRENT_TIMESTAMP
    WHERE id = p_user_id;

    -- Delete related data
    DELETE FROM user_preferences WHERE user_id = p_user_id;
    DELETE FROM sessions WHERE user_id = p_user_id;

    -- Keep orders for legal/accounting purposes but anonymize
    UPDATE orders
    SET user_id = NULL
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;
```

### HIPAA (Health Insurance Portability and Accountability Act)

**Key Requirements:**
- ✅ Access controls: Limit access to PHI (Protected Health Information)
- ✅ Audit controls: Log all access to PHI
- ✅ Integrity controls: Ensure PHI is not altered or destroyed
- ✅ Transmission security: Encrypt PHI in transit
- ✅ Encryption: Encrypt PHI at rest

```sql
-- HIPAA: Audit all PHI access
CREATE TABLE phi_access_log (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    access_type VARCHAR(50) NOT NULL,  -- VIEW, EDIT, DELETE
    accessed_fields TEXT[],
    ip_address INET,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phi_patient (patient_id),
    INDEX idx_phi_user (user_id),
    INDEX idx_phi_timestamp (timestamp)
);

-- Trigger to log PHI access
CREATE OR REPLACE FUNCTION log_phi_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO phi_access_log (user_id, patient_id, access_type, accessed_fields)
    VALUES (
        current_setting('app.user_id')::BIGINT,
        NEW.id,
        TG_OP,
        ARRAY['medical_record_number', 'diagnosis', 'treatment']
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_patient_access
AFTER SELECT OR UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION log_phi_access();
```

### PCI DSS (Payment Card Industry Data Security Standard)

**Key Requirements:**
- ✅ Never store full magnetic stripe, CVV2, or PIN data
- ✅ Encrypt cardholder data at rest
- ✅ Encrypt cardholder data in transit
- ✅ Implement strong access controls
- ✅ Regularly test security systems

```sql
-- PCI DSS: Store only necessary card data
CREATE TABLE payment_methods (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    card_last_four CHAR(4) NOT NULL,  -- Only last 4 digits
    card_brand VARCHAR(20) NOT NULL,  -- Visa, Mastercard, etc.
    expiry_month SMALLINT NOT NULL,
    expiry_year SMALLINT NOT NULL,
    billing_zip VARCHAR(10),
    token VARCHAR(255) NOT NULL,  -- Payment gateway token
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- DO NOT store: full card number, CVV, magnetic stripe data
    INDEX idx_payment_user (user_id)
);
```

---

## Security Best Practices Summary

### Input Security

✅ **DO:**
- Use parameterized queries/prepared statements
- Validate all input (type, format, range)
- Use whitelist validation for limited options
- Use ORMs or query builders for dynamic queries
- Sanitize input before database operations

❌ **DON'T:**
- Concatenate user input into SQL queries
- Trust user input without validation
- Use dynamic SQL without parameterization
- Skip input validation

### Access Control

✅ **DO:**
- Implement least privilege access
- Use role-based access control (RBAC)
- Enable row-level security for multi-tenant apps
- Use column-level permissions for sensitive data
- Regularly audit and review permissions

❌ **DON'T:**
- Use superuser accounts for applications
- Share credentials between environments
- Grant excessive permissions
- Skip access control reviews

### Encryption

✅ **DO:**
- Encrypt sensitive data at rest
- Use SSL/TLS for all connections
- Store encryption keys in secure key management systems
- Rotate encryption keys regularly
- Use strong encryption algorithms (AES-256)

❌ **DON'T:**
- Store encryption keys in code or version control
- Use weak encryption algorithms
- Skip encryption for sensitive data
- Allow unencrypted connections

### Audit & Compliance

✅ **DO:**
- Log all access to sensitive data
- Implement comprehensive audit trails
- Understand compliance requirements (GDPR, HIPAA, PCI DSS)
- Regularly review audit logs
- Implement data retention policies

❌ **DON'T:**
- Skip audit logging for sensitive operations
- Ignore compliance requirements
- Store data longer than necessary
- Fail to implement user data export/deletion

### Secrets Management

✅ **DO:**
- Use environment variables for connection strings
- Use dedicated secrets management systems (AWS Secrets Manager, Vault)
- Rotate credentials regularly
- Use different credentials per environment
- Implement credential rotation

❌ **DON'T:**
- Hardcode credentials in code
- Commit credentials to version control
- Share credentials via email or chat
- Use same credentials across environments

---

## Common Security Vulnerabilities

### SQL Injection

**Vulnerability:**
```javascript
// ❌ VULNERABLE
const query = `SELECT * FROM users WHERE email = '${req.body.email}'`;
```

**Attack:**
```
email = "' OR '1'='1' --"
Result: SELECT * FROM users WHERE email = '' OR '1'='1' --'
```

**Fix:**
```javascript
// ✅ SECURE
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [req.body.email]);
```

### NoSQL Injection

**Vulnerability:**
```javascript
// ❌ VULNERABLE
const user = await db.users.findOne({
  email: req.body.email,
  password: req.body.password
});
```

**Attack:**
```json
{
  "email": "admin@example.com",
  "password": { "$ne": null }
}
```

**Fix:**
```javascript
// ✅ SECURE
const email = String(req.body.email);
const password = String(req.body.password);

const user = await db.users.findOne({ email, password });
```

### Insufficient Access Controls

**Vulnerability:**
```javascript
// ❌ VULNERABLE: No authorization check
async function deleteUser(userId) {
  await db.query('DELETE FROM users WHERE id = $1', [userId]);
}
```

**Fix:**
```javascript
// ✅ SECURE: Check authorization
async function deleteUser(userId, requestingUserId) {
  // Check if requesting user is admin or deleting their own account
  const requestingUser = await getUser(requestingUserId);

  if (requestingUser.role !== 'admin' && requestingUserId !== userId) {
    throw new Error('Unauthorized');
  }

  await db.query('DELETE FROM users WHERE id = $1', [userId]);
}
```

---

## Security Checklist

### Development

- [ ] Use parameterized queries for all database operations
- [ ] Validate and sanitize all input
- [ ] Implement least privilege access
- [ ] Encrypt sensitive data at rest
- [ ] Use SSL/TLS for all connections
- [ ] Store secrets in secure management systems
- [ ] Implement comprehensive audit logging
- [ ] Follow compliance requirements (GDPR, HIPAA, PCI DSS)

### Deployment

- [ ] Use different credentials per environment
- [ ] Enable database firewall rules
- [ ] Restrict database access to application servers only
- [ ] Enable SSL/TLS certificate verification
- [ ] Configure automatic security updates
- [ ] Set up intrusion detection
- [ ] Implement rate limiting
- [ ] Enable query logging for production

### Monitoring

- [ ] Monitor failed login attempts
- [ ] Alert on suspicious query patterns
- [ ] Review audit logs regularly
- [ ] Track access to sensitive data
- [ ] Monitor for SQL injection attempts
- [ ] Set up security incident response procedures

---

## Summary

**Key Security Principles:**

1. **Defense in Depth**: Multiple layers of security (input validation, parameterized queries, access controls, encryption)
2. **Least Privilege**: Grant minimum necessary permissions
3. **Encryption Everywhere**: Encrypt data at rest and in transit
4. **Audit Everything**: Log all access to sensitive data
5. **Compliance First**: Understand and implement regulatory requirements

**Critical Rules:**
- ❌ NEVER concatenate user input into SQL queries
- ❌ NEVER store credentials in code or version control
- ❌ NEVER use superuser accounts for applications
- ❌ NEVER skip input validation
- ❌ NEVER allow unencrypted connections to production databases


