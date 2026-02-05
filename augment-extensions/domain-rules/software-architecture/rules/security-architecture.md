# Security Architecture

## Overview

This document covers security architecture principles, patterns, and practices for building secure systems. Security must be designed into the architecture from the beginning, not added as an afterthought.

**References**: OWASP (Open Web Application Security Project), NIST Cybersecurity Framework, Zero Trust Architecture

---

## Knowledge

### Security Principles

#### Defense in Depth

**Definition**
- Multiple layers of security controls
- If one layer fails, others provide protection
- No single point of failure
- Comprehensive security strategy

**Layers**
1. **Physical Security**: Data center access, hardware security
2. **Network Security**: Firewalls, VPNs, network segmentation
3. **Host Security**: OS hardening, antivirus, host firewalls
4. **Application Security**: Input validation, authentication, authorization
5. **Data Security**: Encryption, access controls, data masking

**Benefits**
- Reduces risk of complete compromise
- Provides multiple opportunities to detect attacks
- Limits blast radius of security incidents
- Supports compliance requirements

#### Least Privilege

**Definition**
- Grant minimum permissions necessary to perform a task
- Users and services should have only required access
- Reduces attack surface and blast radius
- Principle of minimal authority

**Application**
- User permissions (RBAC, ABAC)
- Service accounts (minimal IAM roles)
- Database access (read-only where possible)
- API access (scoped tokens)
- File system permissions

**Benefits**
- Limits damage from compromised accounts
- Reduces insider threat risk
- Simplifies access auditing
- Supports compliance (SOC 2, ISO 27001)

#### Fail Securely

**Definition**
- System should fail in a secure state
- Errors should not expose sensitive information
- Default to deny access on failure
- Graceful degradation without security compromise

**Practices**
- Default deny (whitelist, not blacklist)
- Generic error messages (no sensitive details)
- Secure defaults (opt-in for risky features)
- Fail closed (deny access on auth failure)

#### Zero Trust Architecture

**Definition**
- Never trust, always verify
- No implicit trust based on network location
- Verify every request, every time
- Assume breach mentality

**Principles**
1. **Verify explicitly**: Always authenticate and authorize
2. **Use least privilege access**: Just-in-time and just-enough-access
3. **Assume breach**: Minimize blast radius, segment access

**Components**
- Identity and access management (IAM)
- Multi-factor authentication (MFA)
- Micro-segmentation
- Continuous monitoring and validation
- Encryption everywhere

### Threat Modeling

**Definition**
- Systematic approach to identifying security threats
- Analyze system to find vulnerabilities
- Prioritize threats by risk
- Design mitigations

**STRIDE Model**

- **S**poofing: Impersonating user or system
- **T**ampering: Modifying data or code
- **R**epudiation: Denying actions
- **I**nformation Disclosure: Exposing sensitive data
- **D**enial of Service: Making system unavailable
- **E**levation of Privilege: Gaining unauthorized access

**Threat Modeling Process**

1. **Identify Assets**: What needs protection?
2. **Create Architecture Overview**: Data flow diagrams
3. **Identify Threats**: Use STRIDE or other framework
4. **Mitigate Threats**: Design security controls
5. **Validate**: Review and test mitigations

**Tools**
- Microsoft Threat Modeling Tool
- OWASP Threat Dragon
- IriusRisk
- ThreatModeler

### Authentication

**Definition**
- Verifying identity of user or system
- "Who are you?"
- Foundation of access control
- Multiple factors increase security

**Authentication Factors**

1. **Something You Know**: Password, PIN, security question
2. **Something You Have**: Phone, hardware token, smart card
3. **Something You Are**: Biometrics (fingerprint, face, iris)

**Multi-Factor Authentication (MFA)**
- Combines two or more factors
- Significantly increases security
- Protects against password compromise
- Industry best practice

**Authentication Protocols**

- **OAuth 2.0**: Authorization framework for delegated access
- **OpenID Connect**: Identity layer on top of OAuth 2.0
- **SAML**: XML-based authentication and authorization
- **JWT**: JSON Web Tokens for stateless authentication

**Best Practices**
- Enforce strong password policies
- Implement MFA for sensitive operations
- Use secure password storage (bcrypt, Argon2)
- Implement account lockout after failed attempts
- Use HTTPS for credential transmission
- Implement session timeout

### Authorization

**Definition**
- Determining what authenticated user can do
- "What are you allowed to do?"
- Access control and permissions
- Enforces security policies

**Authorization Models**

#### Role-Based Access Control (RBAC)

**Definition**
- Permissions assigned to roles
- Users assigned to roles
- Simplifies permission management
- Common in enterprise systems

**Example**
```
Roles: Admin, Manager, User
Admin: All permissions
Manager: Read, Write, Delete (own resources)
User: Read, Write (own resources)
```

**Benefits**
- Easy to understand and manage
- Scales well for large organizations
- Supports separation of duties
- Simplifies auditing

#### Attribute-Based Access Control (ABAC)

**Definition**
- Permissions based on attributes
- User attributes, resource attributes, environment attributes
- Fine-grained, dynamic access control
- Flexible and expressive

**Example**
```
Allow if:
  user.department == resource.department AND
  user.clearance >= resource.classification AND
  time.hour >= 9 AND time.hour <= 17
```

**Benefits**
- Fine-grained control
- Dynamic policies
- Context-aware decisions
- Reduces role explosion

#### Policy-Based Access Control

**Definition**
- Centralized policy engine
- Policies written in declarative language
- Separates policy from code
- Examples: OPA (Open Policy Agent), AWS IAM Policies

**Benefits**
- Centralized policy management
- Auditable policies
- Testable policies
- Reusable across services

### Encryption

**Definition**
- Converting data to unreadable format
- Protects confidentiality
- Two main types: symmetric and asymmetric
- Essential for data protection

**Encryption at Rest**
- Protects stored data
- Database encryption (TDE)
- File system encryption
- Disk encryption
- Key management critical

**Encryption in Transit**
- Protects data during transmission
- TLS/SSL for HTTPS
- VPNs for network traffic
- Encrypted messaging protocols
- Certificate management

**Key Management**
- Secure key generation
- Key rotation policies
- Key storage (HSM, KMS)
- Key access controls
- Key backup and recovery

**Best Practices**
- Use strong algorithms (AES-256, RSA-2048+)
- Never roll your own crypto
- Use TLS 1.2 or higher
- Implement perfect forward secrecy
- Rotate keys regularly
- Use hardware security modules (HSM) for key storage

### Secure Communication

**TLS/SSL**
- Transport Layer Security
- Encrypts data in transit
- Provides authentication and integrity
- Essential for web applications

**Certificate Management**
- Use trusted Certificate Authorities (CA)
- Implement certificate pinning for mobile apps
- Monitor certificate expiration
- Use automated certificate renewal (Let's Encrypt)

**API Security**
- API keys for identification
- OAuth 2.0 for authorization
- Rate limiting and throttling
- Input validation and sanitization
- CORS policies

### Input Validation and Sanitization

**Definition**
- Validate all input from untrusted sources
- Sanitize data before use
- Prevent injection attacks
- Defense against OWASP Top 10 vulnerabilities

**Validation Strategies**
- Whitelist (allow known good)
- Blacklist (deny known bad) - less secure
- Type checking and constraints
- Length and format validation
- Business logic validation

**Common Injection Attacks**

**SQL Injection**
- Malicious SQL in user input
- Can read, modify, or delete data
- Prevention: Parameterized queries, ORMs

**Cross-Site Scripting (XSS)**
- Malicious scripts in web pages
- Can steal cookies, session tokens
- Prevention: Output encoding, CSP headers

**Command Injection**
- Malicious commands in system calls
- Can execute arbitrary code
- Prevention: Avoid system calls, input validation

**LDAP Injection**
- Malicious LDAP queries
- Can bypass authentication
- Prevention: Input validation, parameterized queries

### Audit Logging

**Definition**
- Record security-relevant events
- Support forensics and compliance
- Detect and investigate incidents
- Non-repudiation

**What to Log**
- Authentication events (success, failure)
- Authorization failures
- Data access (especially sensitive data)
- Configuration changes
- Administrative actions
- Security events (attacks, anomalies)

**Log Content**
- Timestamp (UTC)
- User/service identity
- Action performed
- Resource accessed
- Result (success/failure)
- Source IP address
- Session ID

**Best Practices**
- Log to centralized system (SIEM)
- Protect logs from tampering
- Retain logs per compliance requirements
- Monitor logs for anomalies
- Never log sensitive data (passwords, credit cards)
- Use structured logging (JSON)

---

## Skills

### Implementing Authentication

**JWT-Based Authentication**

**Token Structure**
- Header: Algorithm and token type
- Payload: Claims (user ID, roles, expiration)
- Signature: Verify token integrity

**Best Practices**
- Use short expiration times (15 minutes)
- Implement refresh tokens
- Store tokens securely (httpOnly cookies)
- Validate signature on every request
- Include audience and issuer claims
- Use strong signing algorithms (RS256, ES256)

**Session Management**
- Generate cryptographically random session IDs
- Set secure and httpOnly flags on cookies
- Implement session timeout
- Invalidate sessions on logout
- Regenerate session ID after authentication

### Implementing Authorization

**RBAC Implementation**

**Database Schema**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  resource VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES users(id),
  role_id UUID REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);

CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id),
  permission_id UUID REFERENCES permissions(id),
  PRIMARY KEY (role_id, permission_id)
);
```

**Authorization Check**
```typescript
async function checkPermission(
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  const result = await db.query(`
    SELECT COUNT(*) as count
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = $1
      AND p.resource = $2
      AND p.action = $3
  `, [userId, resource, action]);

  return result.rows[0].count > 0;
}
```

### Implementing Secure Password Storage

**Password Hashing**
```typescript
import bcrypt from 'bcrypt';

// Hash password during registration
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // Cost factor
  return bcrypt.hash(password, saltRounds);
}

// Verify password during login
async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Example usage
class AuthService {
  async register(email: string, password: string): Promise<User> {
    // Validate password strength
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const passwordHash = await hashPassword(password);

    return this.userRepository.create({
      email,
      passwordHash
    });
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    return this.generateToken(user);
  }
}
```

### Implementing Rate Limiting

**Token Bucket Algorithm**
```typescript
interface RateLimitConfig {
  maxTokens: number;      // Bucket capacity
  refillRate: number;     // Tokens per second
  windowMs: number;       // Time window
}

class RateLimiter {
  private buckets = new Map<string, TokenBucket>();

  constructor(private config: RateLimitConfig) {}

  async checkLimit(key: string): Promise<boolean> {
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = new TokenBucket(
        this.config.maxTokens,
        this.config.refillRate
      );
      this.buckets.set(key, bucket);
    }

    return bucket.consume();
  }
}

class TokenBucket {
  private tokens: number;
  private lastRefill: number;

  constructor(
    private capacity: number,
    private refillRate: number
  ) {
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  consume(): boolean {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(
      this.capacity,
      this.tokens + tokensToAdd
    );
    this.lastRefill = now;
  }
}

// Express middleware
function rateLimitMiddleware(limiter: RateLimiter) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';

    const allowed = await limiter.checkLimit(key);

    if (!allowed) {
      res.status(429).json({
        error: 'Too many requests'
      });
      return;
    }

    next();
  };
}
```

---

## Examples

### Zero Trust Architecture Implementation

**Service-to-Service Authentication**
```typescript
// Service A calling Service B
class ServiceClient {
  constructor(
    private serviceUrl: string,
    private clientId: string,
    private clientSecret: string
  ) {}

  async callService(endpoint: string, data: any): Promise<any> {
    // Get access token
    const token = await this.getAccessToken();

    // Make authenticated request
    const response = await fetch(`${this.serviceUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Service call failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async getAccessToken(): Promise<string> {
    // OAuth 2.0 Client Credentials flow
    const response = await fetch('https://auth.example.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'service-b:read service-b:write'
      })
    });

    const data = await response.json();
    return data.access_token;
  }
}

// Service B validating requests
class AuthMiddleware {
  async validateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);

    try {
      // Validate token with auth service
      const tokenInfo = await this.validateWithAuthService(token);

      // Check required scopes
      if (!this.hasRequiredScopes(tokenInfo.scopes, req.path, req.method)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      // Attach token info to request
      (req as any).auth = tokenInfo;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  private async validateWithAuthService(token: string): Promise<TokenInfo> {
    const response = await fetch('https://auth.example.com/validate', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Token validation failed');
    }

    return response.json();
  }

  private hasRequiredScopes(
    scopes: string[],
    path: string,
    method: string
  ): boolean {
    // Check if token has required scopes for this endpoint
    const requiredScope = `service-b:${method.toLowerCase()}`;
    return scopes.includes(requiredScope);
  }
}
```

### OWASP Top 10 Mitigations

**1. Broken Access Control**
```typescript
// Bad: No authorization check
app.delete('/api/users/:id', async (req, res) => {
  await userRepository.delete(req.params.id);
  res.json({ success: true });
});

// Good: Check authorization
app.delete('/api/users/:id', authenticate, async (req, res) => {
  const currentUser = (req as any).user;
  const targetUserId = req.params.id;

  // Users can only delete their own account, or admin can delete any
  if (currentUser.id !== targetUserId && !currentUser.roles.includes('admin')) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  await userRepository.delete(targetUserId);
  res.json({ success: true });
});
```

**2. Cryptographic Failures**
```typescript
// Bad: Storing sensitive data in plain text
await db.query(
  'INSERT INTO users (email, password, ssn) VALUES ($1, $2, $3)',
  [email, password, ssn]
);

// Good: Hash passwords, encrypt sensitive data
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const passwordHash = await bcrypt.hash(password, 10);
const ssnEncrypted = encrypt(ssn, process.env.ENCRYPTION_KEY!);

await db.query(
  'INSERT INTO users (email, password_hash, ssn_encrypted) VALUES ($1, $2, $3)',
  [email, passwordHash, ssnEncrypted]
);

function encrypt(text: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}
```

**3. Injection**
```typescript
// Bad: SQL injection vulnerability
app.get('/api/users', async (req, res) => {
  const name = req.query.name;
  const users = await db.query(`SELECT * FROM users WHERE name = '${name}'`);
  res.json(users);
});

// Good: Parameterized query
app.get('/api/users', async (req, res) => {
  const name = req.query.name;
  const users = await db.query(
    'SELECT * FROM users WHERE name = $1',
    [name]
  );
  res.json(users);
});

// Better: Use ORM with built-in protection
app.get('/api/users', async (req, res) => {
  const name = req.query.name;
  const users = await User.findAll({
    where: { name }
  });
  res.json(users);
});
```

**4. Insecure Design**
```typescript
// Bad: Password reset without verification
app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await userRepository.findByEmail(email);
  if (user) {
    await userRepository.updatePassword(user.id, newPassword);
  }

  res.json({ success: true });
});

// Good: Secure password reset flow
app.post('/api/request-password-reset', async (req, res) => {
  const { email } = req.body;

  const user = await userRepository.findByEmail(email);
  if (user) {
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await passwordResetRepository.create({
      userId: user.id,
      token: await bcrypt.hash(token, 10),
      expires
    });

    // Send email with reset link
    await emailService.sendPasswordResetEmail(user.email, token);
  }

  // Always return success to prevent email enumeration
  res.json({ success: true });
});

app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  const resetRequest = await passwordResetRepository.findByToken(token);

  if (!resetRequest || resetRequest.expires < new Date()) {
    res.status(400).json({ error: 'Invalid or expired token' });
    return;
  }

  const isValid = await bcrypt.compare(token, resetRequest.token);
  if (!isValid) {
    res.status(400).json({ error: 'Invalid token' });
    return;
  }

  await userRepository.updatePassword(resetRequest.userId, newPassword);
  await passwordResetRepository.delete(resetRequest.id);

  res.json({ success: true });
});
```

**5. Security Misconfiguration**
```typescript
// Bad: Exposing stack traces in production
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack // Exposes internal details
  });
});

// Good: Generic error messages in production
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log full error for debugging
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Return generic message to client
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// Security headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## Understanding

### Security Architecture Patterns

**API Gateway Pattern**
- Single entry point for all API requests
- Centralized authentication and authorization
- Rate limiting and throttling
- Request/response transformation
- Logging and monitoring

**Backend for Frontend (BFF) Pattern**
- Separate backend for each client type
- Tailored security policies per client
- Reduces over-fetching and under-fetching
- Client-specific authentication flows

**Sidecar Pattern**
- Security proxy alongside each service
- Handles authentication, encryption, logging
- Decouples security from business logic
- Common in service mesh architectures

### Security Testing

**Static Application Security Testing (SAST)**
- Analyze source code for vulnerabilities
- Find issues early in development
- Tools: SonarQube, Checkmarx, Fortify

**Dynamic Application Security Testing (DAST)**
- Test running application
- Find runtime vulnerabilities
- Tools: OWASP ZAP, Burp Suite, Acunetix

**Interactive Application Security Testing (IAST)**
- Combines SAST and DAST
- Real-time vulnerability detection
- Tools: Contrast Security, Seeker

**Penetration Testing**
- Simulated attacks by security experts
- Find vulnerabilities before attackers do
- Regular testing (quarterly, annually)

**Dependency Scanning**
- Check for vulnerable dependencies
- Automated scanning in CI/CD
- Tools: Snyk, Dependabot, npm audit

### Compliance and Standards

**Common Standards**
- **PCI DSS**: Payment Card Industry Data Security Standard
- **HIPAA**: Health Insurance Portability and Accountability Act
- **GDPR**: General Data Protection Regulation
- **SOC 2**: Service Organization Control 2
- **ISO 27001**: Information Security Management

**Compliance Requirements**
- Data encryption (at rest and in transit)
- Access controls and audit logging
- Incident response procedures
- Regular security assessments
- Data retention and deletion policies

### Best Practices

1. **Security by Design**
   - Include security from the start
   - Threat modeling in design phase
   - Security requirements alongside functional requirements

2. **Principle of Least Privilege**
   - Grant minimum necessary permissions
   - Regular access reviews
   - Just-in-time access for sensitive operations

3. **Defense in Depth**
   - Multiple layers of security
   - No single point of failure
   - Assume each layer can be breached

4. **Secure Defaults**
   - Deny by default, allow by exception
   - Secure configuration out of the box
   - Opt-in for risky features

5. **Keep Security Simple**
   - Complex security is hard to maintain
   - Prefer standard solutions over custom
   - Document security decisions

6. **Continuous Monitoring**
   - Real-time security monitoring
   - Automated alerts for anomalies
   - Regular security audits

7. **Incident Response Plan**
   - Documented procedures
   - Regular drills and updates
   - Clear roles and responsibilities

### Common Pitfalls

1. **Security as an Afterthought**
   - Adding security late is expensive
   - Retrofitting is harder than building in
   - Security should be in initial requirements

2. **Trusting User Input**
   - All input is potentially malicious
   - Validate and sanitize everything
   - Never trust client-side validation alone

3. **Hardcoded Secrets**
   - Passwords, API keys in source code
   - Use environment variables or secret managers
   - Never commit secrets to version control

4. **Insufficient Logging**
   - Can't investigate what you don't log
   - Log security events comprehensively
   - Protect logs from tampering

5. **Ignoring Updates**
   - Unpatched vulnerabilities are common attack vector
   - Regular dependency updates
   - Automated vulnerability scanning

6. **Over-reliance on Obscurity**
   - Security through obscurity is not security
   - Assume attackers know your system
   - Use proven security mechanisms

---

## References

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **OWASP ASVS**: Application Security Verification Standard
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **Zero Trust Architecture**: NIST SP 800-207
- **CWE Top 25**: Common Weakness Enumeration
- **SANS Top 25**: Most Dangerous Software Errors
- **ISO/IEC 27001**: Information Security Management
- **PCI DSS**: Payment Card Industry Data Security Standard

