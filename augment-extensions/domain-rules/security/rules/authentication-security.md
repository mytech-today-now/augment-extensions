# Authentication Security

Best practices for secure authentication implementation.

## Password Security

### Password Hashing

Always hash passwords with strong algorithms.

```typescript
import bcrypt from 'bcrypt';
import argon2 from 'argon2';

// Good - bcrypt (recommended)
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Good - Argon2 (more secure, slower)
const hashedPassword = await argon2.hash(password);

// Verify password
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
const isValid = await argon2.verify(hashedPassword, inputPassword);

// Bad - Weak hashing
const hashedPassword = crypto.createHash('md5').update(password).digest('hex');  // ❌
const hashedPassword = crypto.createHash('sha1').update(password).digest('hex'); // ❌
```

### Password Requirements

Enforce strong password policies.

```typescript
// Good - Strong password validation
const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain number');
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain special character');
  }
  
  // Check against common passwords
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common');
  }
  
  return { valid: errors.length === 0, errors };
};
```

### Password Reset

Implement secure password reset flow.

```typescript
// Good - Secure password reset
import crypto from 'crypto';

// Generate reset token
const resetToken = crypto.randomBytes(32).toString('hex');
const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

await db.users.update(userId, {
  resetToken: resetTokenHash,
  resetTokenExpiry: Date.now() + 3600000 // 1 hour
});

// Send email with reset link
await sendEmail({
  to: user.email,
  subject: 'Password Reset',
  body: `Reset your password: https://example.com/reset?token=${resetToken}`
});

// Verify reset token
const tokenHash = crypto.createHash('sha256').update(req.query.token).digest('hex');
const user = await db.users.findOne({
  resetToken: tokenHash,
  resetTokenExpiry: { $gt: Date.now() }
});

if (!user) {
  return res.status(400).json({ error: 'Invalid or expired token' });
}
```

## Multi-Factor Authentication (MFA)

### TOTP (Time-based One-Time Password)

```typescript
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

// Generate MFA secret
const secret = speakeasy.generateSecret({
  name: `MyApp (${user.email})`
});

await db.users.update(userId, {
  mfaSecret: secret.base32,
  mfaEnabled: false  // User must verify first
});

// Generate QR code for user to scan
const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

// Verify MFA code
const verified = speakeasy.totp.verify({
  secret: user.mfaSecret,
  encoding: 'base32',
  token: req.body.mfaCode,
  window: 2  // Allow 2 time steps before/after
});

if (verified) {
  await db.users.update(userId, { mfaEnabled: true });
}
```

### Backup Codes

Provide backup codes for MFA recovery.

```typescript
// Generate backup codes
const generateBackupCodes = (): string[] => {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    codes.push(crypto.randomBytes(4).toString('hex'));
  }
  return codes;
};

const backupCodes = generateBackupCodes();
const hashedCodes = await Promise.all(
  backupCodes.map(code => bcrypt.hash(code, 10))
);

await db.users.update(userId, {
  backupCodes: hashedCodes
});

// Verify backup code
const isValidBackupCode = async (inputCode: string, user: User): Promise<boolean> => {
  for (let i = 0; i < user.backupCodes.length; i++) {
    const isValid = await bcrypt.compare(inputCode, user.backupCodes[i]);
    if (isValid) {
      // Remove used backup code
      user.backupCodes.splice(i, 1);
      await db.users.update(user.id, { backupCodes: user.backupCodes });
      return true;
    }
  }
  return false;
};
```

## Session Management

### Secure Session Configuration

```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';

// Good - Secure session configuration
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,  // Strong random secret
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',  // Don't use default name
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // Prevent XSS
    sameSite: 'strict',  // Prevent CSRF
    maxAge: 3600000,     // 1 hour
    domain: '.example.com'
  }
}));
```

### Session Invalidation

```typescript
// Logout - destroy session
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('sessionId');
    res.json({ message: 'Logged out successfully' });
  });
});

// Invalidate all sessions on password change
await db.sessions.deleteMany({ userId: user.id });
```

## JWT Security

### Secure JWT Implementation

```typescript
import jwt from 'jsonwebtoken';

// Generate JWT
const accessToken = jwt.sign(
  {
    sub: user.id,
    email: user.email,
    role: user.role
  },
  process.env.JWT_SECRET,
  {
    expiresIn: '15m',
    issuer: 'myapp.com',
    audience: 'myapp.com'
  }
);

// Verify JWT
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET, {
    issuer: 'myapp.com',
    audience: 'myapp.com'
  });
} catch (error) {
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  return res.status(401).json({ error: 'Invalid token' });
}
```

### Refresh Token Pattern

```typescript
// Generate tokens
const accessToken = generateAccessToken(user);  // 15 minutes
const refreshToken = generateRefreshToken(user); // 7 days

// Store refresh token (hashed)
const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
await db.refreshTokens.create({
  userId: user.id,
  token: refreshTokenHash,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});

// Refresh access token
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const storedToken = await db.refreshTokens.findOne({
    token: tokenHash,
    expiresAt: { $gt: new Date() }
  });
  
  if (!storedToken) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
  
  const user = await db.users.findOne(storedToken.userId);
  const newAccessToken = generateAccessToken(user);
  
  res.json({ accessToken: newAccessToken });
});
```

## Brute Force Protection

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// Login rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: true,
  message: 'Too many login attempts'
});

app.post('/login', loginLimiter, async (req, res) => {
  // Login logic
});
```

### Account Lockout

```typescript
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Check if account is locked
if (user.lockoutUntil && user.lockoutUntil > Date.now()) {
  return res.status(429).json({
    error: 'Account locked',
    retryAfter: Math.ceil((user.lockoutUntil - Date.now()) / 1000)
  });
}

// Failed login
if (!isValidPassword) {
  const attempts = user.loginAttempts + 1;
  
  if (attempts >= MAX_ATTEMPTS) {
    await db.users.update(user.id, {
      loginAttempts: attempts,
      lockoutUntil: Date.now() + LOCKOUT_DURATION
    });
    return res.status(429).json({ error: 'Account locked' });
  }
  
  await db.users.update(user.id, { loginAttempts: attempts });
  return res.status(401).json({ error: 'Invalid credentials' });
}

// Successful login - reset attempts
await db.users.update(user.id, {
  loginAttempts: 0,
  lockoutUntil: null
});
```

## Best Practices

1. **Hash passwords** - Use bcrypt or Argon2
2. **Strong passwords** - Enforce complexity requirements
3. **Secure reset flow** - Time-limited tokens
4. **Implement MFA** - TOTP or SMS
5. **Secure sessions** - httpOnly, secure, sameSite cookies
6. **Short-lived tokens** - 15-minute access tokens
7. **Refresh tokens** - For obtaining new access tokens
8. **Rate limiting** - Prevent brute force
9. **Account lockout** - After failed attempts
10. **Log auth events** - Monitor suspicious activity

