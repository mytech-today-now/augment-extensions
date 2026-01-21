# Encryption and Data Protection

Best practices for encrypting and protecting sensitive data.

## Data at Rest Encryption

### Symmetric Encryption (AES-256-GCM)

```typescript
import crypto from 'crypto';

// Encrypt data
const encrypt = (data: string, key: Buffer): { encrypted: string; iv: string; authTag: string } => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: cipher.getAuthTag().toString('hex')
  };
};

// Decrypt data
const decrypt = (encrypted: string, key: Buffer, iv: string, authTag: string): string => {
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Generate encryption key
const key = crypto.randomBytes(32); // 256 bits
// Store key securely (e.g., AWS KMS, Azure Key Vault, environment variable)
```

### Database Encryption

```typescript
// Good - Encrypt sensitive fields
const encryptedData = encrypt(user.ssn, encryptionKey);

await db.users.create({
  email: user.email,
  ssn: encryptedData.encrypted,
  ssnIv: encryptedData.iv,
  ssnAuthTag: encryptedData.authTag
});

// Decrypt when needed
const user = await db.users.findOne(userId);
const ssn = decrypt(user.ssn, encryptionKey, user.ssnIv, user.ssnAuthTag);
```

## Data in Transit Encryption

### HTTPS/TLS

```typescript
// Good - Force HTTPS
app.use((req, res, next) => {
  if (!req.secure && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Good - HSTS header
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

// Good - TLS configuration
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
  minVersion: 'TLSv1.2',  // Minimum TLS 1.2
  ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384'
};

https.createServer(options, app).listen(443);
```

## Key Management

### Environment Variables

```bash
# .env (never commit to git)
ENCRYPTION_KEY=hex_encoded_32_byte_key
JWT_SECRET=strong_random_secret
DATABASE_PASSWORD=strong_password

# .gitignore
.env
.env.local
```

### Key Rotation

```typescript
// Support multiple encryption keys for rotation
const ENCRYPTION_KEYS = {
  current: process.env.ENCRYPTION_KEY_V2,
  previous: process.env.ENCRYPTION_KEY_V1
};

// Encrypt with current key
const encrypted = encrypt(data, Buffer.from(ENCRYPTION_KEYS.current, 'hex'));

// Decrypt with appropriate key version
const decrypt = (encrypted: string, keyVersion: string, iv: string, authTag: string): string => {
  const key = ENCRYPTION_KEYS[keyVersion];
  // ... decrypt logic
};

// Re-encrypt old data with new key
const migrateEncryption = async () => {
  const users = await db.users.findMany({ keyVersion: 'previous' });
  
  for (const user of users) {
    const decrypted = decrypt(user.ssn, 'previous', user.ssnIv, user.ssnAuthTag);
    const reencrypted = encrypt(decrypted, Buffer.from(ENCRYPTION_KEYS.current, 'hex'));
    
    await db.users.update(user.id, {
      ssn: reencrypted.encrypted,
      ssnIv: reencrypted.iv,
      ssnAuthTag: reencrypted.authTag,
      keyVersion: 'current'
    });
  }
};
```

## Hashing

### One-Way Hashing

```typescript
import crypto from 'crypto';

// Good - SHA-256 for non-password data
const hash = crypto.createHash('sha256').update(data).digest('hex');

// Good - HMAC for message authentication
const hmac = crypto.createHmac('sha256', secret).update(data).digest('hex');

// Verify HMAC
const isValid = crypto.timingSafeEqual(
  Buffer.from(receivedHmac, 'hex'),
  Buffer.from(expectedHmac, 'hex')
);
```

## Secure Random Generation

```typescript
// Good - Cryptographically secure random
const token = crypto.randomBytes(32).toString('hex');
const uuid = crypto.randomUUID();

// Bad - Not cryptographically secure
const token = Math.random().toString(36);  // ❌ Don't use for security
```

## Data Masking

```typescript
// Mask sensitive data in logs
const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
};

const maskCreditCard = (card: string): string => {
  return `****-****-****-${card.slice(-4)}`;
};

// Log with masked data
logger.info('User registered', {
  email: maskEmail(user.email),
  ip: req.ip
});
```

## Best Practices

1. **Use AES-256-GCM** - For symmetric encryption
2. **Always use HTTPS** - Encrypt data in transit
3. **Secure key storage** - Use key management services
4. **Rotate keys** - Periodically change encryption keys
5. **Hash passwords** - Use bcrypt/Argon2, not encryption
6. **Use crypto.randomBytes** - For secure random generation
7. **Encrypt at rest** - Sensitive database fields
8. **Mask in logs** - Don't log sensitive data
9. **Use HSTS** - Force HTTPS
10. **TLS 1.2+** - Minimum TLS version

