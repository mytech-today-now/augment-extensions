# Input Validation and Sanitization

Best practices for validating and sanitizing user input.

## Validation Libraries

### Zod (TypeScript)

```typescript
import { z } from 'zod';

// Define schema
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12).max(100),
  age: z.number().int().min(18).max(120),
  role: z.enum(['admin', 'user', 'guest']),
  website: z.string().url().optional()
});

// Validate input
app.post('/users', async (req, res) => {
  try {
    const validatedData = userSchema.parse(req.body);
    // Use validatedData (type-safe)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
  }
});
```

### Joi (JavaScript)

```javascript
const Joi = require('joi');

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(12).max(100).required(),
  age: Joi.number().integer().min(18).max(120),
  tags: Joi.array().items(Joi.string()).max(10)
});

const { error, value } = schema.validate(req.body);
if (error) {
  return res.status(422).json({ error: error.details });
}
```

## SQL Injection Prevention

```typescript
// Bad - SQL injection vulnerability
const query = `SELECT * FROM users WHERE email = '${req.body.email}'`;  // ❌

// Good - Parameterized query
const query = 'SELECT * FROM users WHERE email = $1';
const result = await db.query(query, [req.body.email]);

// Good - ORM (Prisma)
const user = await prisma.user.findUnique({
  where: { email: req.body.email }
});

// Good - Query builder (Knex)
const users = await knex('users')
  .where('email', req.body.email)
  .select('*');
```

## NoSQL Injection Prevention

```typescript
// Bad - NoSQL injection
const user = await db.users.findOne({
  email: req.body.email,  // Could be: { $ne: null }
  password: req.body.password
});

// Good - Validate input type
if (typeof req.body.email !== 'string' || typeof req.body.password !== 'string') {
  return res.status(400).json({ error: 'Invalid input' });
}

const user = await db.users.findOne({
  email: req.body.email,
  password: req.body.password
});

// Good - Use schema validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const { email, password } = loginSchema.parse(req.body);
```

## XSS Prevention

```typescript
// Bad - Rendering user input directly
res.send(`<h1>Welcome ${req.query.name}</h1>`);  // ❌ XSS vulnerability

// Good - Use template engine with auto-escaping
res.render('welcome', { name: req.query.name });  // Handlebars, EJS, etc.

// Good - Sanitize HTML
import DOMPurify from 'isomorphic-dompurify';

const clean = DOMPurify.sanitize(req.body.html);

// Good - Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
  );
  next();
});
```

## Command Injection Prevention

```typescript
// Bad - Command injection
const { exec } = require('child_process');
exec(`ping ${req.query.host}`);  // ❌ Vulnerable

// Good - Validate input
const host = req.query.host;
if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
  return res.status(400).json({ error: 'Invalid host' });
}

// Better - Use safe library
import { ping } from 'ping';
const result = await ping.promise.probe(req.query.host);

// Good - Use execFile with array
import { execFile } from 'child_process';
execFile('ping', ['-c', '4', host], (error, stdout) => {
  // ...
});
```

## Path Traversal Prevention

```typescript
// Bad - Path traversal vulnerability
const filePath = path.join(__dirname, 'uploads', req.query.file);  // ❌
res.sendFile(filePath);

// Good - Validate filename
import path from 'path';

const filename = path.basename(req.query.file);  // Remove directory components
const filePath = path.join(__dirname, 'uploads', filename);

// Ensure file is within uploads directory
const realPath = fs.realpathSync(filePath);
const uploadsPath = fs.realpathSync(path.join(__dirname, 'uploads'));

if (!realPath.startsWith(uploadsPath)) {
  return res.status(400).json({ error: 'Invalid file path' });
}

res.sendFile(realPath);
```

## Email Validation

```typescript
// Good - Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Invalid email' });
}

// Better - Use validation library
import { z } from 'zod';
const email = z.string().email().parse(req.body.email);

// Best - Verify email ownership
const verificationToken = crypto.randomBytes(32).toString('hex');
await sendVerificationEmail(email, verificationToken);
```

## URL Validation

```typescript
// Good - URL validation
const validateUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Good - Whitelist domains
const allowedDomains = ['example.com', 'api.example.com'];

const url = new URL(req.body.url);
if (!allowedDomains.includes(url.hostname)) {
  return res.status(400).json({ error: 'Domain not allowed' });
}
```

## File Upload Validation

```typescript
import multer from 'multer';
import path from 'path';

// Good - Validate file type and size
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    
    cb(null, true);
  }
});

// Verify file content (not just extension)
import fileType from 'file-type';

const type = await fileType.fromFile(filePath);
if (!type || !['image/jpeg', 'image/png'].includes(type.mime)) {
  fs.unlinkSync(filePath);
  return res.status(400).json({ error: 'Invalid file type' });
}
```

## Integer Validation

```typescript
// Good - Validate integers
const validateInteger = (value: any, min?: number, max?: number): number => {
  const num = parseInt(value, 10);
  
  if (isNaN(num) || !Number.isInteger(num)) {
    throw new Error('Must be an integer');
  }
  
  if (min !== undefined && num < min) {
    throw new Error(`Must be at least ${min}`);
  }
  
  if (max !== undefined && num > max) {
    throw new Error(`Must be at most ${max}`);
  }
  
  return num;
};

// Usage
const age = validateInteger(req.body.age, 18, 120);
```

## Best Practices

1. **Validate all input** - Never trust user input
2. **Use validation libraries** - Zod, Joi, etc.
3. **Whitelist, don't blacklist** - Define what's allowed
4. **Parameterized queries** - Prevent SQL injection
5. **Type checking** - Prevent NoSQL injection
6. **Sanitize HTML** - Use DOMPurify
7. **Validate file uploads** - Type, size, content
8. **Validate URLs** - Check protocol and domain
9. **Prevent path traversal** - Use path.basename
10. **Fail securely** - Reject invalid input

