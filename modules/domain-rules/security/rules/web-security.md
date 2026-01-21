# Web Security

Web-specific security vulnerabilities and mitigations.

## Cross-Site Scripting (XSS)

### Reflected XSS

```typescript
// Bad - Reflected XSS
app.get('/search', (req, res) => {
  res.send(`<h1>Results for: ${req.query.q}</h1>`);  // ❌ XSS vulnerability
});

// Good - Escape output
import escapeHtml from 'escape-html';

app.get('/search', (req, res) => {
  res.send(`<h1>Results for: ${escapeHtml(req.query.q)}</h1>`);
});

// Better - Use template engine with auto-escaping
app.get('/search', (req, res) => {
  res.render('search', { query: req.query.q });  // Handlebars, EJS auto-escape
});
```

### Stored XSS

```typescript
// Bad - Storing unsanitized HTML
app.post('/comments', async (req, res) => {
  await db.comments.create({
    content: req.body.content  // ❌ Stores malicious script
  });
});

// Good - Sanitize HTML
import DOMPurify from 'isomorphic-dompurify';

app.post('/comments', async (req, res) => {
  const sanitized = DOMPurify.sanitize(req.body.content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href']
  });
  
  await db.comments.create({ content: sanitized });
});
```

### Content Security Policy (CSP)

```typescript
// Good - Strict CSP
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );
  next();
});

// Good - CSP with nonce for inline scripts
const nonce = crypto.randomBytes(16).toString('base64');
res.setHeader('Content-Security-Policy', `script-src 'nonce-${nonce}'`);
res.render('page', { nonce });

// In template:
// <script nonce="{{nonce}}">...</script>
```

## Cross-Site Request Forgery (CSRF)

```typescript
import csrf from 'csurf';

// Good - CSRF protection
const csrfProtection = csrf({ cookie: true });

app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});

app.post('/form', csrfProtection, (req, res) => {
  // CSRF token validated automatically
});

// In HTML form:
// <input type="hidden" name="_csrf" value="{{csrfToken}}">

// Good - SameSite cookies (additional protection)
app.use(session({
  cookie: {
    sameSite: 'strict',  // or 'lax'
    secure: true,
    httpOnly: true
  }
}));
```

## Clickjacking

```typescript
// Good - X-Frame-Options header
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Good - CSP frame-ancestors
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  next();
});

// Allow specific domains
res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://trusted.com");
```

## CORS (Cross-Origin Resource Sharing)

```typescript
import cors from 'cors';

// Bad - Allow all origins
app.use(cors({ origin: '*' }));  // ❌ Too permissive

// Good - Whitelist specific origins
const allowedOrigins = ['https://example.com', 'https://app.example.com'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Security Headers

```typescript
import helmet from 'helmet';

// Good - Use helmet for security headers
app.use(helmet());

// Manual configuration
app.use((req, res, next) => {
  // Prevent MIME sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // XSS protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'DENY');
  
  // HTTPS enforcement
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});
```

## Cookie Security

```typescript
// Good - Secure cookie configuration
res.cookie('sessionId', sessionId, {
  httpOnly: true,      // Prevent JavaScript access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 3600000,     // 1 hour
  domain: '.example.com',
  path: '/',
  signed: true         // Sign cookie
});

// Bad - Insecure cookie
res.cookie('sessionId', sessionId);  // ❌ No security flags
```

## Session Fixation Prevention

```typescript
// Good - Regenerate session on login
app.post('/login', async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password);
  
  if (user) {
    // Regenerate session ID
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      
      req.session.userId = user.id;
      res.json({ success: true });
    });
  }
});
```

## Open Redirect Prevention

```typescript
// Bad - Open redirect vulnerability
app.get('/redirect', (req, res) => {
  res.redirect(req.query.url);  // ❌ Redirects to any URL
});

// Good - Validate redirect URL
const allowedRedirects = ['/dashboard', '/profile', '/settings'];

app.get('/redirect', (req, res) => {
  const url = req.query.url;
  
  if (!allowedRedirects.includes(url)) {
    return res.status(400).json({ error: 'Invalid redirect' });
  }
  
  res.redirect(url);
});

// Good - Validate external redirects
const allowedDomains = ['example.com', 'app.example.com'];

const url = new URL(req.query.url);
if (!allowedDomains.includes(url.hostname)) {
  return res.status(400).json({ error: 'Invalid redirect domain' });
}
```

## Best Practices

1. **Prevent XSS** - Sanitize HTML, use CSP
2. **CSRF protection** - Use CSRF tokens, SameSite cookies
3. **Prevent clickjacking** - X-Frame-Options, CSP frame-ancestors
4. **Configure CORS** - Whitelist specific origins
5. **Security headers** - Use helmet middleware
6. **Secure cookies** - httpOnly, secure, sameSite
7. **Regenerate sessions** - On login/privilege change
8. **Validate redirects** - Whitelist allowed URLs
9. **Content-Type** - Set correct Content-Type headers
10. **HTTPS only** - Enforce HTTPS with HSTS

