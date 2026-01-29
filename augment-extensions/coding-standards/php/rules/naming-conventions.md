# Naming Conventions

## Overview

Consistent naming conventions improve code readability and maintainability. This document defines naming standards for all PHP code elements.

---

## Variables and Functions

### Variables

**Format:** camelCase

**Rules:**
- Variable names MUST start with a lowercase letter
- Use descriptive names that convey meaning
- Avoid single-letter variables except in loops or closures
- Boolean variables SHOULD start with `is`, `has`, `can`, or `should`

**Examples:**
```php
// ✅ Good
$userName = 'John Doe';
$totalPrice = 99.99;
$isActive = true;
$hasPermission = false;
$canEdit = true;

// ❌ Bad
$un = 'John Doe';
$tp = 99.99;
$active = true;  // Ambiguous for boolean
$x = 'value';
```

### Functions

**Format:** camelCase

**Rules:**
- Function names MUST start with a lowercase letter
- Use verb-noun combinations for clarity
- Be descriptive and specific

**Examples:**
```php
// ✅ Good
function getUserById(int $id): ?User
function calculateTotalPrice(array $items): float
function validateEmail(string $email): bool

// ❌ Bad
function get(int $id): ?User
function calc(array $items): float
function check(string $email): bool
```

---

## Classes and Interfaces

### Classes

**Format:** PascalCase

**Rules:**
- Class names MUST start with an uppercase letter
- Use singular nouns for entity classes
- Use descriptive names that indicate purpose

**Examples:**
```php
// ✅ Good
class User {}
class OrderProcessor {}
class PaymentGateway {}
class EmailValidator {}

// ❌ Bad
class user {}
class process_order {}
class payment {}
```

### Abstract Classes

**Format:** PascalCase with "Abstract" prefix

**Rules:**
- Abstract classes SHOULD be prefixed with "Abstract"
- Clearly indicate the abstraction purpose

**Examples:**
```php
// ✅ Good
abstract class AbstractController {}
abstract class AbstractRepository {}
abstract class AbstractValidator {}

// ❌ Bad
abstract class Controller {}
abstract class BaseRepo {}
```

### Interfaces

**Format:** PascalCase with "Interface" suffix

**Rules:**
- Interface names SHOULD be suffixed with "Interface"
- Use adjectives or nouns that describe capability

**Examples:**
```php
// ✅ Good
interface LoggerInterface {}
interface CacheInterface {}
interface PaymentGatewayInterface {}
interface SerializableInterface {}

// ❌ Bad
interface Logger {}
interface ICache {}
interface Payment {}
```

### Traits

**Format:** PascalCase with "Trait" suffix

**Rules:**
- Trait names SHOULD be suffixed with "Trait"
- Use adjectives that describe the behavior

**Examples:**
```php
// ✅ Good
trait TimestampableTrait {}
trait SoftDeletableTrait {}
trait ValidatableTrait {}

// ❌ Bad
trait Timestamp {}
trait SoftDelete {}
```

### Exceptions

**Format:** PascalCase with "Exception" suffix

**Rules:**
- Exception names SHOULD be suffixed with "Exception"
- Be specific about the error condition

**Examples:**
```php
// ✅ Good
class InvalidArgumentException extends Exception {}
class UserNotFoundException extends Exception {}
class PaymentFailedException extends Exception {}

// ❌ Bad
class InvalidArgument extends Exception {}
class UserError extends Exception {}
```

---

## Constants

### Class Constants

**Format:** UPPER_SNAKE_CASE

**Rules:**
- Constants MUST be all uppercase
- Use underscores to separate words
- Be descriptive and specific

**Examples:**
```php
// ✅ Good
class OrderStatus
{
    public const PENDING = 'pending';
    public const PROCESSING = 'processing';
    public const COMPLETED = 'completed';
    public const CANCELLED = 'cancelled';
    public const MAX_RETRY_COUNT = 3;
}

// ❌ Bad
class OrderStatus
{
    public const pending = 'pending';
    public const Processing = 'processing';
    public const maxRetryCount = 3;
}
```

### Global Constants

**Format:** UPPER_SNAKE_CASE

**Rules:**
- Avoid global constants when possible
- Use class constants or configuration instead
- If necessary, prefix with application/package name

**Examples:**
```php
// ✅ Acceptable (but prefer class constants)
define('APP_VERSION', '1.0.0');
define('APP_MAX_UPLOAD_SIZE', 10485760);

// ✅ Better
class AppConfig
{
    public const VERSION = '1.0.0';
    public const MAX_UPLOAD_SIZE = 10485760;
}
```

---

## Properties

### Public Properties

**Format:** camelCase

**Examples:**
```php
class User
{
    public string $firstName;
    public string $lastName;
    public ?string $email = null;
}
```

### Protected/Private Properties

**Format:** camelCase

**Examples:**
```php
class User
{
    private int $id;
    protected string $password;
    private ?DateTime $lastLoginAt = null;
}
```

---

## Namespaces

**Format:** PascalCase

**Rules:**
- Namespace segments MUST use PascalCase
- Follow PSR-4 autoloading structure
- Match directory structure exactly

**Examples:**
```php
// ✅ Good
namespace App\Services\Payment;
namespace App\Http\Controllers\Api;
namespace App\Models\User;

// ❌ Bad
namespace app\services\payment;
namespace App\http\controllers\api;
```

