# OWASP Top 10 Vulnerabilities

Mitigations for the OWASP Top 10 web application security risks.

## A01:2021 - Broken Access Control

Unauthorized access to resources or functions.

```typescript
// Bad - No authorization check
app.get('/api/users/:id', async (req, res) => {
  const user = await db.users.findOne(req.params.id);
  res.json(user);
});

// Good - Check authorization
app.get('/api/users/:id', authenticate, async (req, res) => {
  const user = await db.users.findOne(req.params.id);
  
  // Users can only access their own data (unless admin)
  if (user.id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  res.json(user);
});

// Good - Use middleware for authorization
const authorize = (permission: string) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

app.delete('/api/users/:id', authenticate, authorize('delete:users'), async (req, res) => {
  await db.users.delete(req.params.id);
  res.status(204).send();
});
```

## A02:2021 - Cryptographic Failures

Sensitive data exposure due to weak cryptography.

```typescript
// Bad - Storing passwords in plain text
await db.users.create({
  email: 'user@example.com',
  password: 'secret123'  // ❌ Never store plain text passwords
});

// Good - Hash passwords with bcrypt
import bcrypt from 'bcrypt';

const hashedPassword = await bcrypt.hash(password, 10);
await db.users.create({
  email: 'user@example.com',
  password: hashedPassword
});

// Good - Verify password
const isValid = await bcrypt.compare(inputPassword, user.password);

// Bad - Weak encryption
const encrypted = Buffer.from(data).toString('base64');  // ❌ Not encryption

// Good - Use proper encryption
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const cipher = crypto.createCipheriv(algorithm, key, iv);
let encrypted = cipher.update(data, 'utf8', 'hex');
encrypted += cipher.final('hex');
const authTag = cipher.getAuthTag();
```

## A03:2021 - Injection

SQL, NoSQL, OS command injection attacks.

```typescript
// Bad - SQL injection vulnerability
app.get('/users', async (req, res) => {
  const query = `SELECT * FROM users WHERE name = '${req.query.name}'`;
  const users = await db.query(query);  // ❌ Vulnerable to SQL injection
});

// Good - Use parameterized queries
app.get('/users', async (req, res) => {
  const users = await db.query(
    'SELECT * FROM users WHERE name = $1',
    [req.query.name]
  );
});

// Good - Use ORM
const users = await db.users.findMany({
  where: { name: req.query.name }
});

// Bad - Command injection
const { exec } = require('child_process');
exec(`ping ${req.query.host}`);  // ❌ Vulnerable to command injection

// Good - Validate and sanitize input
const host = req.query.host;
if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
  return res.status(400).json({ error: 'Invalid host' });
}
exec(`ping ${host}`);

// Better - Use safe alternatives
import { ping } from 'ping';
const result = await ping.promise.probe(req.query.host);
```

## A04:2021 - Insecure Design

Flaws in design and architecture.

```typescript
// Bad - No rate limiting
app.post('/api/login', async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  // ❌ Allows brute force attacks
});

// Good - Implement rate limiting
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

app.post('/api/login', loginLimiter, async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
});

// Good - Implement account lockout
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

if (user.loginAttempts >= MAX_ATTEMPTS) {
  const timeSinceLastAttempt = Date.now() - user.lastLoginAttempt;
  if (timeSinceLastAttempt < LOCKOUT_TIME) {
    return res.status(429).json({ error: 'Account locked' });
  }
}
```

## A05:2021 - Security Misconfiguration

Insecure default configurations.

```typescript
// Bad - Exposing error details in production
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack  // ❌ Exposes internal details
  });
});

// Good - Hide details in production
app.use((err, req, res, next) => {
  console.error(err);  // Log server-side
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// Bad - Default credentials
const dbConfig = {
  user: 'admin',
  password: 'admin'  // ❌ Default credentials
};

// Good - Use environment variables
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

// Good - Security headers
import helmet from 'helmet';
app.use(helmet());
```

## A06:2021 - Vulnerable and Outdated Components

Using components with known vulnerabilities.

```bash
# Good - Regularly update dependencies
npm audit
npm audit fix

# Good - Use automated tools
npm install -g npm-check-updates
ncu -u
npm install

# Good - Monitor for vulnerabilities
# Use Dependabot, Snyk, or similar tools
```

## A07:2021 - Identification and Authentication Failures

Weak authentication mechanisms.

```typescript
// Bad - Weak password requirements
if (password.length < 6) {  // ❌ Too weak
  return res.status(400).json({ error: 'Password too short' });
}

// Good - Strong password requirements
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
if (!passwordRegex.test(password)) {
  return res.status(400).json({
    error: 'Password must be at least 12 characters with uppercase, lowercase, number, and special character'
  });
}

// Good - Implement MFA
const mfaToken = speakeasy.totp({
  secret: user.mfaSecret,
  encoding: 'base32'
});

if (req.body.mfaCode !== mfaToken) {
  return res.status(401).json({ error: 'Invalid MFA code' });
}
```

## A08:2021 - Software and Data Integrity Failures

Insecure CI/CD, updates, or deserialization.

```typescript
// Bad - Unsafe deserialization
const userData = eval(req.body.data);  // ❌ Never use eval

// Good - Safe JSON parsing
try {
  const userData = JSON.parse(req.body.data);
} catch (error) {
  return res.status(400).json({ error: 'Invalid JSON' });
}

// Good - Verify package integrity
# package-lock.json ensures integrity
npm ci  # Use in CI/CD instead of npm install
```

## A09:2021 - Security Logging and Monitoring Failures

Insufficient logging and monitoring.

```typescript
// Good - Log security events
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' })
  ]
});

// Log authentication attempts
logger.info('Login attempt', {
  email: req.body.email,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  success: true
});

// Log authorization failures
logger.warn('Authorization failed', {
  userId: req.user.id,
  resource: req.path,
  action: req.method,
  ip: req.ip
});
```

## A10:2021 - Server-Side Request Forgery (SSRF)

Fetching remote resources without validation.

```typescript
// Bad - SSRF vulnerability
app.get('/fetch', async (req, res) => {
  const response = await fetch(req.query.url);  // ❌ Allows SSRF
  res.send(await response.text());
});

// Good - Validate URL
const allowedDomains = ['api.example.com', 'cdn.example.com'];

const url = new URL(req.query.url);
if (!allowedDomains.includes(url.hostname)) {
  return res.status(400).json({ error: 'Invalid domain' });
}

// Good - Block private IPs
import isPrivateIp from 'private-ip';

if (isPrivateIp(url.hostname)) {
  return res.status(400).json({ error: 'Private IPs not allowed' });
}
```

## Best Practices

1. **Implement proper access control** - Check authorization
2. **Use strong encryption** - Protect sensitive data
3. **Prevent injection** - Use parameterized queries
4. **Design securely** - Security by design
5. **Configure securely** - No default credentials
6. **Update dependencies** - Patch vulnerabilities
7. **Strong authentication** - MFA, strong passwords
8. **Verify integrity** - Check package integrity
9. **Log security events** - Monitor for attacks
10. **Prevent SSRF** - Validate URLs and IPs

