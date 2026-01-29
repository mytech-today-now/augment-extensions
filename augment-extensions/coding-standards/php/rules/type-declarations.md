# Type Declarations

## Overview

Modern PHP (8.0+) provides robust type declaration features. This document defines standards for using type hints, return types, and strict typing to improve code safety and clarity.

---

## Strict Types

### Enable Strict Types

**Rule:**
- All PHP files SHOULD declare strict types at the top
- Place immediately after opening `<?php` tag

**Example:**
```php
<?php

declare(strict_types=1);

namespace App\Services;

class UserService
{
    // ...
}
```

**Benefits:**
- Prevents implicit type coercion
- Catches type errors early
- Improves code reliability

---

## Function and Method Type Hints

### Parameter Type Declarations

**Rules:**
- Parameters SHOULD have type declarations
- Use scalar types: `int`, `float`, `string`, `bool`
- Use class/interface names for objects
- Use `array` for arrays (or specific array shapes in PHPDoc)
- Use `callable` for callbacks
- Use `iterable` for arrays or Traversable objects

**Examples:**
```php
// ✅ Good
function processUser(int $id, string $name, bool $isActive): void
{
    // ...
}

function saveOrder(Order $order, PaymentGatewayInterface $gateway): bool
{
    // ...
}

function filterItems(array $items, callable $callback): array
{
    return array_filter($items, $callback);
}

// ❌ Bad
function processUser($id, $name, $isActive)  // No type hints
{
    // ...
}
```

### Return Type Declarations

**Rules:**
- Return types SHOULD be declared for all methods
- Use `void` for methods that don't return a value
- Use specific types instead of `mixed` when possible
- Use `never` for methods that always throw or exit (PHP 8.1+)

**Examples:**
```php
// ✅ Good
function getUserById(int $id): ?User
{
    return User::find($id);
}

function calculateTotal(array $items): float
{
    return array_sum(array_column($items, 'price'));
}

function logMessage(string $message): void
{
    error_log($message);
}

function throwError(): never
{
    throw new RuntimeException('Fatal error');
}

// ❌ Bad
function getUserById(int $id)  // No return type
{
    return User::find($id);
}
```

---

## Nullable Types

### Nullable Type Syntax

**Rules:**
- Use `?Type` syntax for nullable types
- Nullable types indicate the value can be `null`
- Place `?` before the type name

**Examples:**
```php
// ✅ Good
function findUser(int $id): ?User
{
    return User::find($id) ?: null;
}

function processData(?string $input): string
{
    return $input ?? 'default';
}

class User
{
    public function __construct(
        public string $name,
        public ?string $email = null,
        public ?DateTime $birthDate = null
    ) {}
}

// ❌ Bad
function findUser(int $id): User  // Should be nullable
{
    return User::find($id) ?: null;  // Can return null
}
```

---

## Union Types (PHP 8.0+)

### Union Type Syntax

**Rules:**
- Use `Type1|Type2` syntax for union types
- Union types allow multiple possible types
- Order types from most specific to least specific
- Use when a parameter or return can be multiple types

**Examples:**
```php
// ✅ Good
function formatValue(int|float $value): string
{
    return number_format($value, 2);
}

function processInput(string|array $data): array
{
    return is_array($data) ? $data : [$data];
}

function findRecord(int|string $identifier): ?User
{
    return is_int($identifier)
        ? User::find($identifier)
        : User::where('email', $identifier)->first();
}

// Union with null (alternative to nullable syntax)
function getValue(): int|string|null
{
    // ...
}

// ❌ Bad
function formatValue($value): string  // Should specify int|float
{
    return number_format($value, 2);
}
```

---

## Intersection Types (PHP 8.1+)

### Intersection Type Syntax

**Rules:**
- Use `Type1&Type2` syntax for intersection types
- Intersection types require all types to be satisfied
- Commonly used with interfaces

**Examples:**
```php
// ✅ Good
interface Loggable
{
    public function log(): void;
}

interface Cacheable
{
    public function cache(): void;
}

function processEntity(Loggable&Cacheable $entity): void
{
    $entity->log();
    $entity->cache();
}
```

---

## Property Type Declarations (PHP 7.4+)

### Typed Properties

**Rules:**
- Class properties SHOULD have type declarations
- Typed properties enforce type at assignment
- Uninitialized typed properties throw error if accessed

**Examples:**
```php
// ✅ Good
class User
{
    private int $id;
    private string $name;
    private ?string $email = null;
    private array $roles = [];
    private DateTime $createdAt;
    
    public function __construct(int $id, string $name)
    {
        $this->id = $id;
        $this->name = $name;
        $this->createdAt = new DateTime();
    }
}

// ❌ Bad
class User
{
    private $id;  // No type
    private $name;  // No type
    private $email;  // No type
}
```

### Readonly Properties (PHP 8.1+)

**Rules:**
- Use `readonly` for properties that should not change after initialization
- Readonly properties can only be initialized once
- Readonly properties must have a type declaration

**Examples:**
```php
// ✅ Good
class User
{
    public function __construct(
        public readonly int $id,
        public readonly string $name,
        public readonly DateTime $createdAt
    ) {}
}

// ❌ Bad - trying to modify readonly
$user = new User(1, 'John', new DateTime());
$user->name = 'Jane';  // Error: Cannot modify readonly property
```

---

## Constructor Property Promotion (PHP 8.0+)

**Rules:**
- Use promoted properties to reduce boilerplate
- Combine parameter declaration with property declaration
- Works with visibility modifiers and type declarations

**Examples:**
```php
// ✅ Good (PHP 8.0+)
class User
{
    public function __construct(
        private int $id,
        private string $name,
        private ?string $email = null,
        private array $roles = []
    ) {}
}

// ❌ Verbose (old style)
class User
{
    private int $id;
    private string $name;
    private ?string $email;
    private array $roles;
    
    public function __construct(int $id, string $name, ?string $email = null, array $roles = [])
    {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->roles = $roles;
    }
}
```

