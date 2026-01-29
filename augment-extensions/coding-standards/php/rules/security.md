# Security Best Practices

## Overview

Security is paramount in PHP development. This document defines security standards following OWASP PHP Security Cheat Sheet guidelines.

---

## Input Validation and Sanitization

### Validate All Input

**Rules:**
- ALL user input MUST be validated
- Validate on the server side (never trust client-side validation)
- Use whitelist validation (allow known good) over blacklist (block known bad)
- Validate data type, length, format, and range

**Examples:**
```php
// ✅ Good
function validateEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validateAge(mixed $age): bool
{
    return filter_var($age, FILTER_VALIDATE_INT, [
        'options' => ['min_range' => 0, 'max_range' => 150]
    ]) !== false;
}

function processUserInput(array $data): array
{
    $validated = [];
    
    if (!isset($data['email']) || !validateEmail($data['email'])) {
        throw new ValidationException('Invalid email');
    }
    $validated['email'] = $data['email'];
    
    if (!isset($data['age']) || !validateAge($data['age'])) {
        throw new ValidationException('Invalid age');
    }
    $validated['age'] = (int)$data['age'];
    
    return $validated;
}

// ❌ Bad
function processUserInput(array $data): array
{
    return $data;  // No validation!
}
```

### Sanitize Input

**Rules:**
- Sanitize input after validation
- Use appropriate sanitization for context
- Use `filter_var()` with sanitization filters

**Examples:**
```php
// ✅ Good
$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$url = filter_var($_POST['url'], FILTER_SANITIZE_URL);
$string = filter_var($_POST['name'], FILTER_SANITIZE_SPECIAL_CHARS);
```

---

## SQL Injection Prevention

### Use Prepared Statements

**Rules:**
- ALWAYS use prepared statements with parameter binding
- NEVER concatenate user input into SQL queries
- Use ORM query builders when available

**Examples:**
```php
// ✅ Good - PDO prepared statement
$stmt = $pdo->prepare('SELECT * FROM users WHERE email = :email');
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();

// ✅ Good - ORM query builder
$user = User::where('email', $email)->first();

// ✅ Good - Eloquent with bindings
$users = DB::select('SELECT * FROM users WHERE status = ?', [$status]);

// ❌ CRITICAL VULNERABILITY - SQL Injection
$query = "SELECT * FROM users WHERE email = '$email'";
$result = mysqli_query($conn, $query);
```

### Escape Output in SQL Context

**Rules:**
- When dynamic SQL is unavoidable, escape properly
- Use database-specific escaping functions
- Prefer parameterized queries over escaping

**Examples:**
```php
// ✅ Acceptable (but prepared statements are better)
$email = $pdo->quote($email);
$query = "SELECT * FROM users WHERE email = $email";

// ❌ Bad
$email = addslashes($email);  // Not sufficient!
```

---

## Cross-Site Scripting (XSS) Prevention

### Escape Output

**Rules:**
- Escape ALL output to HTML
- Use context-appropriate escaping
- Use template engines with auto-escaping

**Escaping Functions:**
- `htmlspecialchars()` - HTML context
- `htmlentities()` - HTML entities
- `json_encode()` - JavaScript context
- `urlencode()` - URL context

**Examples:**
```php
// ✅ Good - HTML context
echo htmlspecialchars($userInput, ENT_QUOTES, 'UTF-8');

// ✅ Good - JavaScript context
echo '<script>var name = ' . json_encode($userName) . ';</script>';

// ✅ Good - URL context
echo '<a href="?search=' . urlencode($searchTerm) . '">Search</a>';

// ✅ Good - Template engine (Blade)
{{ $userInput }}  // Auto-escaped

// ❌ CRITICAL VULNERABILITY - XSS
echo $userInput;  // Not escaped!
echo "<div>$userInput</div>";  // Not escaped!
```

### Content Security Policy

**Rules:**
- Implement Content Security Policy (CSP) headers
- Restrict script sources
- Disable inline scripts when possible

**Examples:**
```php
// ✅ Good
header("Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted-cdn.com");
```

---

## Cross-Site Request Forgery (CSRF) Prevention

### CSRF Tokens

**Rules:**
- Use CSRF tokens for all state-changing requests
- Validate tokens on the server side
- Regenerate tokens after authentication

**Examples:**
```php
// ✅ Good - Generate token
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// ✅ Good - Validate token
function validateCsrfToken(string $token): bool
{
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!validateCsrfToken($_POST['csrf_token'] ?? '')) {
        throw new SecurityException('Invalid CSRF token');
    }
    // Process form
}

// HTML form
echo '<input type="hidden" name="csrf_token" value="' . htmlspecialchars($_SESSION['csrf_token']) . '">';
```

---

## Session Security

### Secure Session Configuration

**Rules:**
- Regenerate session ID after authentication
- Set secure and httponly flags on cookies
- Implement session timeout
- Validate session data on each request

**Examples:**
```php
// ✅ Good - Secure session configuration
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);  // HTTPS only
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.use_strict_mode', 1);

session_start();

// ✅ Good - Regenerate after login
function loginUser(User $user): void
{
    session_regenerate_id(true);
    $_SESSION['user_id'] = $user->id;
    $_SESSION['login_time'] = time();
}

// ✅ Good - Session timeout
function validateSession(): bool
{
    $timeout = 3600; // 1 hour
    
    if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > $timeout) {
        session_destroy();
        return false;
    }
    
    $_SESSION['login_time'] = time(); // Refresh
    return true;
}
```

---

## Password Security

### Password Hashing

**Rules:**
- Use `password_hash()` with bcrypt or argon2
- NEVER store passwords in plain text
- Use `password_verify()` for verification
- Rehash passwords when algorithm changes

**Examples:**
```php
// ✅ Good - Hash password
$hashedPassword = password_hash($password, PASSWORD_ARGON2ID);

// ✅ Good - Verify password
if (password_verify($inputPassword, $user->password)) {
    // Password correct
    
    // Rehash if needed
    if (password_needs_rehash($user->password, PASSWORD_ARGON2ID)) {
        $user->password = password_hash($inputPassword, PASSWORD_ARGON2ID);
        $user->save();
    }
}

// ❌ CRITICAL VULNERABILITY
$password = md5($password);  // Weak hashing!
$password = sha1($password);  // Still weak!
```

---

## File Upload Security

### Validate Uploads

**Rules:**
- Validate file type (MIME type and extension)
- Limit file size
- Store uploads outside web root
- Generate random filenames
- Scan for malware when possible

**Examples:**
```php
// ✅ Good
function handleFileUpload(array $file): string
{
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    $maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!in_array($file['type'], $allowedTypes)) {
        throw new ValidationException('Invalid file type');
    }
    
    if ($file['size'] > $maxSize) {
        throw new ValidationException('File too large');
    }
    
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = bin2hex(random_bytes(16)) . '.' . $extension;
    $uploadPath = '/var/uploads/' . $filename;  // Outside web root
    
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new RuntimeException('Upload failed');
    }
    
    return $filename;
}
```

---

## Authentication and Authorization

### Secure Authentication

**Rules:**
- Implement rate limiting for login attempts
- Use multi-factor authentication when possible
- Lock accounts after failed attempts
- Log authentication events

**Examples:**
```php
// ✅ Good
function attemptLogin(string $email, string $password): bool
{
    if ($this->isRateLimited($email)) {
        throw new TooManyAttemptsException('Too many login attempts');
    }
    
    $user = User::where('email', $email)->first();
    
    if (!$user || !password_verify($password, $user->password)) {
        $this->incrementFailedAttempts($email);
        $this->logger->warning('Failed login attempt', ['email' => $email]);
        return false;
    }
    
    $this->clearFailedAttempts($email);
    $this->logger->info('Successful login', ['user_id' => $user->id]);
    loginUser($user);
    return true;
}
```

