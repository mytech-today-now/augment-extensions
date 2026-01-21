# Secure Coding Practices

General secure coding practices for building secure applications.

## Principle of Least Privilege

Grant minimum necessary permissions.

```typescript
// Bad - Overly permissive
const user = {
  id: '123',
  role: 'admin',  // ❌ Everyone is admin
  permissions: ['*']  // ❌ All permissions
};

// Good - Specific permissions
const user = {
  id: '123',
  role: 'editor',
  permissions: ['read:posts', 'write:posts', 'read:users']
};

// Good - Check specific permission
const hasPermission = (user: User, permission: string): boolean => {
  return user.permissions.includes(permission);
};

if (!hasPermission(req.user, 'delete:posts')) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

## Defense in Depth

Implement multiple layers of security.

```typescript
// Layer 1: Input validation
const schema = z.object({
  email: z.string().email(),
  content: z.string().max(1000)
});
const data = schema.parse(req.body);

// Layer 2: Authentication
if (!req.user) {
  return res.status(401).json({ error: 'Unauthorized' });
}

// Layer 3: Authorization
if (req.user.id !== post.authorId && req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Forbidden' });
}

// Layer 4: Rate limiting
// Layer 5: Sanitization
const sanitized = DOMPurify.sanitize(data.content);

// Layer 6: Logging
logger.info('Post updated', { userId: req.user.id, postId: post.id });
```

## Secure Defaults

Use secure configurations by default.

```typescript
// Good - Secure defaults
const config = {
  https: true,
  httpOnly: true,
  sameSite: 'strict',
  secure: true,
  maxAge: 3600000,
  ...userConfig  // Allow override if needed
};

// Bad - Insecure defaults
const config = {
  https: false,  // ❌
  httpOnly: false,  // ❌
  ...userConfig
};
```

## Fail Securely

Handle errors without exposing sensitive information.

```typescript
// Bad - Exposing internal details
try {
  const user = await db.users.findOne(userId);
} catch (error) {
  res.status(500).json({
    error: error.message,  // ❌ May expose DB details
    stack: error.stack  // ❌ Exposes code structure
  });
}

// Good - Generic error message
try {
  const user = await db.users.findOne(userId);
} catch (error) {
  logger.error('Database error', { error, userId });  // Log internally
  res.status(500).json({ error: 'Internal server error' });  // Generic message
}
```

## Don't Trust Client Data

Always validate on server side.

```typescript
// Bad - Trusting client
app.post('/purchase', async (req, res) => {
  const { productId, price } = req.body;  // ❌ Client sends price
  await processPayment(price);
});

// Good - Verify on server
app.post('/purchase', async (req, res) => {
  const { productId } = req.body;
  const product = await db.products.findOne(productId);
  await processPayment(product.price);  // ✅ Use server price
});
```

## Avoid Security by Obscurity

Don't rely on secrecy of implementation.

```typescript
// Bad - Security by obscurity
const isAdmin = (user) => {
  return user.secretAdminFlag === 'xK9mP2qL';  // ❌ Weak
};

// Good - Proper authorization
const isAdmin = (user) => {
  return user.role === 'admin' && user.verified === true;
};
```

## Secure Error Messages

Don't leak information through error messages.

```typescript
// Bad - Information leakage
app.post('/login', async (req, res) => {
  const user = await db.users.findOne({ email: req.body.email });
  
  if (!user) {
    return res.status(401).json({ error: 'Email not found' });  // ❌ Reveals email exists
  }
  
  if (!await bcrypt.compare(req.body.password, user.password)) {
    return res.status(401).json({ error: 'Incorrect password' });  // ❌ Reveals email exists
  }
});

// Good - Generic error message
app.post('/login', async (req, res) => {
  const user = await db.users.findOne({ email: req.body.email });
  
  if (!user || !await bcrypt.compare(req.body.password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });  // ✅ Generic
  }
});
```

## Secure Logging

Log security events without exposing sensitive data.

```typescript
// Bad - Logging sensitive data
logger.info('User login', {
  email: user.email,
  password: req.body.password,  // ❌ Never log passwords
  creditCard: user.creditCard  // ❌ Never log PII
});

// Good - Log relevant info only
logger.info('User login', {
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  success: true
});

// Good - Mask sensitive data
const maskEmail = (email: string) => {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
};

logger.info('Password reset requested', {
  email: maskEmail(user.email),
  ip: req.ip
});
```

## Dependency Security

Keep dependencies updated and secure.

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Use lock files
npm ci  # In CI/CD

# Monitor dependencies
# Use Dependabot, Snyk, or similar
```

## Environment Variables

Store secrets in environment variables.

```typescript
// Bad - Hardcoded secrets
const dbPassword = 'mypassword123';  // ❌
const apiKey = 'sk_live_abc123';  // ❌

// Good - Environment variables
const dbPassword = process.env.DB_PASSWORD;
const apiKey = process.env.API_KEY;

// Good - Validate required env vars
const requiredEnvVars = ['DB_PASSWORD', 'API_KEY', 'JWT_SECRET'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// .env (never commit)
DB_PASSWORD=strong_password
API_KEY=sk_live_abc123
JWT_SECRET=random_secret

// .gitignore
.env
.env.local
.env.*.local
```

## Code Review

Implement security-focused code reviews.

```markdown
# Security Review Checklist

- [ ] Input validation on all user input
- [ ] Authentication required for protected endpoints
- [ ] Authorization checks for resource access
- [ ] Parameterized queries (no SQL injection)
- [ ] No hardcoded secrets
- [ ] Sensitive data encrypted
- [ ] Error messages don't leak information
- [ ] Rate limiting on sensitive endpoints
- [ ] HTTPS enforced
- [ ] Security headers set
- [ ] Dependencies up to date
- [ ] Logging doesn't expose sensitive data
```

## Best Practices

1. **Least privilege** - Minimum necessary permissions
2. **Defense in depth** - Multiple security layers
3. **Secure defaults** - Secure by default
4. **Fail securely** - Don't expose internals
5. **Validate server-side** - Never trust client
6. **Generic errors** - Don't leak information
7. **Secure logging** - Mask sensitive data
8. **Update dependencies** - Patch vulnerabilities
9. **Use env vars** - No hardcoded secrets
10. **Code review** - Security-focused reviews

