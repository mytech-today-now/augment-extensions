# Documentation Standards

## Overview

Proper documentation improves code maintainability and helps developers understand code intent. This document defines PHPDoc standards and documentation best practices.

---

## PHPDoc Blocks

### Function and Method Documentation

**Rules:**
- All public methods MUST have PHPDoc blocks
- Include description, parameters, return type, and exceptions
- Use proper PHPDoc tags

**Required Tags:**
- `@param` - Document all parameters with types and descriptions
- `@return` - Document return type and description
- `@throws` - Document all thrown exceptions

**Examples:**
```php
// ✅ Good - Complete documentation
/**
 * Retrieves a user by their unique identifier.
 *
 * @param int $id The user's unique identifier
 * @return User|null The user object if found, null otherwise
 * @throws DatabaseException If database connection fails
 * @throws InvalidArgumentException If ID is negative
 */
public function getUserById(int $id): ?User
{
    if ($id < 0) {
        throw new InvalidArgumentException('User ID must be positive');
    }
    
    return $this->repository->find($id);
}

// ✅ Good - With examples for complex functions
/**
 * Calculates the total price including tax and discounts.
 *
 * Example:
 * ```php
 * $calculator = new PriceCalculator();
 * $total = $calculator->calculate(100.00, 0.2, 10.00);
 * // Returns: 110.00 (100 + 20% tax - 10 discount)
 * ```
 *
 * @param float $basePrice The base price before tax and discounts
 * @param float $taxRate The tax rate as a decimal (e.g., 0.2 for 20%)
 * @param float $discount The discount amount to subtract
 * @return float The final calculated price
 */
public function calculate(float $basePrice, float $taxRate, float $discount): float
{
    return ($basePrice * (1 + $taxRate)) - $discount;
}

// ❌ Bad - Missing documentation
public function getUserById(int $id): ?User
{
    return $this->repository->find($id);
}

// ❌ Bad - Incomplete documentation
/**
 * Gets user
 */
public function getUserById(int $id): ?User
{
    return $this->repository->find($id);
}
```

### Class Documentation

**Rules:**
- All classes MUST have PHPDoc blocks
- Describe the class purpose and responsibility
- Include package/namespace information when relevant

**Optional Tags:**
- `@package` - Indicate namespace/package
- `@author` - Author information (optional)
- `@property` - Document magic properties
- `@method` - Document magic methods

**Examples:**
```php
// ✅ Good - Class documentation
/**
 * Manages user authentication and authorization.
 *
 * This service handles user login, logout, password verification,
 * and permission checking. It integrates with the session manager
 * and user repository.
 *
 * @package App\Services\Auth
 */
class AuthenticationService
{
    // ...
}

// ✅ Good - With magic properties
/**
 * Represents a user in the system.
 *
 * @property-read int $id The user's unique identifier
 * @property string $name The user's full name
 * @property string $email The user's email address
 */
class User
{
    // ...
}

// ✅ Good - With magic methods
/**
 * Base repository with dynamic query methods.
 *
 * @method User|null findByEmail(string $email)
 * @method User[] findByStatus(string $status)
 */
class UserRepository
{
    public function __call(string $method, array $args)
    {
        // Magic method implementation
    }
}
```

### Property Documentation

**Rules:**
- Document complex or non-obvious properties
- Use `@var` tag for type information
- Include description when type alone isn't clear

**Examples:**
```php
// ✅ Good - Property documentation
class OrderProcessor
{
    /**
     * Maximum number of retry attempts for failed orders.
     *
     * @var int
     */
    private const MAX_RETRIES = 3;
    
    /**
     * The payment gateway instance for processing payments.
     *
     * @var PaymentGatewayInterface
     */
    private PaymentGatewayInterface $gateway;
    
    /**
     * Cache of processed order IDs to prevent duplicate processing.
     *
     * @var array<int, bool>
     */
    private array $processedOrders = [];
}
```

---

## Type Annotations

### Array Type Annotations

**Rules:**
- Use array shape notation for structured arrays
- Use generic array notation for simple arrays
- Be specific about array contents

**Examples:**
```php
// ✅ Good - Array shape notation
/**
 * @param array{id: int, name: string, email: string} $userData
 * @return array{success: bool, message: string}
 */
public function processUser(array $userData): array
{
    // ...
}

// ✅ Good - Generic array notation
/**
 * @param array<int, string> $items Array of strings indexed by integers
 * @return array<string, mixed> Associative array with string keys
 */
public function processItems(array $items): array
{
    // ...
}

// ✅ Good - Array of objects
/**
 * @param User[] $users Array of User objects
 * @return int[] Array of user IDs
 */
public function extractUserIds(array $users): array
{
    return array_map(fn($user) => $user->id, $users);
}
```

### Nullable and Union Types

**Rules:**
- Document nullable types clearly
- Use union type notation for multiple possible types

**Examples:**
```php
// ✅ Good - Nullable type
/**
 * @param int|null $userId The user ID, or null for guest users
 * @return User|null The user object, or null if not found
 */
public function findUser(?int $userId): ?User
{
    // ...
}

// ✅ Good - Union types
/**
 * @param int|string $identifier User ID or email address
 * @return User|false The user object, or false if not found
 */
public function findByIdentifier(int|string $identifier): User|false
{
    // ...
}
```

---

## Inline Comments

### When to Use Inline Comments

**Rules:**
- Explain WHY, not WHAT
- Comment complex algorithms or business logic
- Avoid obvious comments
- Keep comments up-to-date with code

**Examples:**
```php
// ✅ Good - Explains WHY
// We need to clear the cache here because the user's permissions
// may have changed, affecting their access to cached resources
Cache::flush();

// ✅ Good - Explains complex logic
// Calculate discount using tiered pricing:
// 0-10 items: no discount
// 11-50 items: 10% discount
// 51+ items: 20% discount
$discount = match (true) {
    $quantity <= 10 => 0,
    $quantity <= 50 => 0.10,
    default => 0.20,
};

// ❌ Bad - Obvious comment
// Increment counter
$counter++;

// ❌ Bad - Outdated comment
// Set status to pending
$order->status = 'completed';  // Comment doesn't match code!
```

### TODO Comments

**Rules:**
- Use TODO comments for future improvements
- Include ticket/issue number when available
- Include date and author

**Examples:**
```php
// ✅ Good - TODO with context
// TODO(john, 2024-01-15): Refactor to use new payment gateway API
// See ticket #1234
public function processPayment(Order $order): bool
{
    // Legacy implementation
}

// ❌ Bad - Vague TODO
// TODO: fix this
public function processPayment(Order $order): bool
{
    // ...
}
```

---

## README and Documentation Files

### README.md Structure

**Sections:**
1. Project title and description
2. Installation instructions
3. Configuration
4. Usage examples
5. API documentation (if applicable)
6. Contributing guidelines
7. License

**Example:**
```markdown
# User Management Service

A comprehensive user management service for handling authentication,
authorization, and user profile management.

## Installation

```bash
composer require myapp/user-service
```

## Configuration

```php
// config/user-service.php
return [
    'session_timeout' => 3600,
    'password_min_length' => 8,
];
```

## Usage

```php
use App\Services\UserService;

$service = new UserService();
$user = $service->createUser([
    'name' => 'John Doe',
    'email' => 'john@example.com',
]);
```
```

---

## API Documentation

### Generate API Documentation

**Tools:**
- phpDocumentor
- ApiGen
- Sami

**Example:**
```bash
# Generate API documentation
phpdoc -d src/ -t docs/api/
```

---

## Best Practices

### Keep Documentation Current

**Rules:**
- Update documentation when code changes
- Review documentation during code reviews
- Remove outdated comments

### Be Concise

**Rules:**
- Use clear, concise language
- Avoid redundant information
- Focus on important details

### Use Examples

**Rules:**
- Provide code examples for complex functionality
- Show common use cases
- Include expected output when relevant

**Examples:**
```php
/**
 * Formats a date according to the specified format.
 *
 * Example:
 * ```php
 * $formatter = new DateFormatter();
 * echo $formatter->format(new DateTime(), 'Y-m-d');
 * // Output: 2024-01-15
 * ```
 *
 * @param DateTime $date The date to format
 * @param string $format The desired format (PHP date format)
 * @return string The formatted date string
 */
public function format(DateTime $date, string $format): string
{
    return $date->format($format);
}
```

