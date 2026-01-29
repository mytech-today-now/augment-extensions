# PHP Legacy Code Migration Best Practices

## Overview

This guide provides strategies for refactoring legacy PHP code to modern standards, including introducing namespaces, adding type hints, implementing dependency injection, and applying design patterns.

## Refactoring Strategies

### Strangler Fig Pattern

**Gradually replace legacy code** without a complete rewrite.

```php
<?php

// Step 1: Create new implementation alongside legacy code
namespace App\Services;

class ModernUserService
{
    public function createUser(string $name, string $email): User
    {
        // New implementation with type hints, validation, etc.
        $user = new User();
        $user->name = $name;
        $user->email = $email;
        $user->save();
        
        return $user;
    }
}

// Step 2: Create adapter/facade to route to new or old implementation
class UserServiceFacade
{
    private $modernService;
    private $useModern;
    
    public function __construct(ModernUserService $modernService, bool $useModern = false)
    {
        $this->modernService = $modernService;
        $this->useModern = $useModern;
    }
    
    public function createUser($name, $email)
    {
        if ($this->useModern) {
            return $this->modernService->createUser($name, $email);
        } else {
            // Call legacy function
            return legacy_create_user($name, $email);
        }
    }
}

// Step 3: Gradually migrate callers to use facade
// Step 4: Enable modern implementation via feature flag
// Step 5: Remove legacy code once fully migrated
```

### Characterization Tests

**Write tests for legacy code before refactoring:**

```php
<?php

use PHPUnit\Framework\TestCase;

class LegacyUserFunctionsTest extends TestCase
{
    /**
     * Characterization test - documents current behavior
     */
    public function test_legacy_create_user_returns_user_id()
    {
        $userId = legacy_create_user('John Doe', 'john@example.com');
        
        $this->assertIsInt($userId);
        $this->assertGreaterThan(0, $userId);
    }
    
    /**
     * Test edge cases
     */
    public function test_legacy_create_user_with_duplicate_email()
    {
        legacy_create_user('User 1', 'test@example.com');
        
        $this->expectException(\Exception::class);
        legacy_create_user('User 2', 'test@example.com');
    }
}
```

## Introducing Namespaces (PSR-4)

### Before: No Namespaces

```php
<?php

// includes/User.php
class User
{
    public $id;
    public $name;
    
    public function save()
    {
        // Save to database
    }
}

// includes/UserRepository.php
class UserRepository
{
    public function find($id)
    {
        // Find user
    }
}
```

### After: With Namespaces

```php
<?php

// src/Models/User.php
namespace App\Models;

class User
{
    private int $id;
    private string $name;
    
    public function save(): void
    {
        // Save to database
    }
}

// src/Repositories/UserRepository.php
namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    public function find(int $id): ?User
    {
        // Find user
    }
}

// composer.json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

### Migration Steps

```php
<?php

// Step 1: Add namespace to class
namespace App\Models;

class User
{
    // Existing code
}

// Step 2: Update all references
// Before:
$user = new User();

// After:
use App\Models\User;
$user = new User();

// Or:
$user = new \App\Models\User();

// Step 3: Set up autoloading
require 'vendor/autoload.php';

// Step 4: Remove old require/include statements
// Before:
require_once 'includes/User.php';

// After: (not needed with autoloading)
```

## Adding Type Hints Incrementally

### Level 1: Add Return Types

```php
<?php

// Before
function getUser($id)
{
    return User::find($id);
}

// After
function getUser($id): ?User
{
    return User::find($id);
}
```

### Level 2: Add Parameter Types

```php
<?php

// Before
function createUser($name, $email)
{
    // ...
}

// After
function createUser(string $name, string $email): User
{
    // ...
}
```

### Level 3: Add Property Types (PHP 7.4+)

```php
<?php

// Before
class User
{
    public $id;
    public $name;
    public $email;
    public $createdAt;
}

// After
class User
{
    public int $id;
    public string $name;
    public string $email;
    public ?\DateTime $createdAt = null;
}
```

### Level 4: Add Strict Types

```php
<?php

declare(strict_types=1);

namespace App\Models;

class User
{
    public function __construct(
        private int $id,
        private string $name,
        private string $email
    ) {}
}
```

## Dependency Injection

### Before: Global Dependencies

```php
<?php

// Legacy code with global database connection
function getUser($id)
{
    global $db;
    
    $stmt = $db->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch();
}

// Usage
$user = getUser(123);
```

### After: Constructor Injection

```php
<?php

namespace App\Repositories;

use PDO;

class UserRepository
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch() ?: null;
    }
}

// Usage with DI container
$container = new Container();
$container->bind(PDO::class, function() {
    return new PDO('mysql:host=localhost;dbname=mydb', 'user', 'pass');
});

$userRepo = $container->make(UserRepository::class);
$user = $userRepo->find(123);
```

### Service Container

```php
<?php

namespace App\Container;

class Container
{
    private array $bindings = [];
    private array $instances = [];

    public function bind(string $abstract, callable $concrete): void
    {
        $this->bindings[$abstract] = $concrete;
    }

    public function singleton(string $abstract, callable $concrete): void
    {
        $this->bind($abstract, function() use ($abstract, $concrete) {
            if (!isset($this->instances[$abstract])) {
                $this->instances[$abstract] = $concrete();
            }
            return $this->instances[$abstract];
        });
    }

    public function make(string $abstract): object
    {
        if (isset($this->bindings[$abstract])) {
            return $this->bindings[$abstract]();
        }

        return $this->resolve($abstract);
    }

    private function resolve(string $class): object
    {
        $reflector = new \ReflectionClass($class);
        $constructor = $reflector->getConstructor();

        if (!$constructor) {
            return new $class();
        }

        $dependencies = [];
        foreach ($constructor->getParameters() as $param) {
            $type = $param->getType();
            if ($type && !$type->isBuiltin()) {
                $dependencies[] = $this->make($type->getName());
            }
        }

        return $reflector->newInstanceArgs($dependencies);
    }
}
```

## Refactoring Procedural to OOP

### Before: Procedural Code

```php
<?php

// functions.php
function calculate_order_total($items, $tax_rate, $shipping_cost)
{
    $subtotal = 0;
    foreach ($items as $item) {
        $subtotal += $item['price'] * $item['quantity'];
    }

    $tax = $subtotal * $tax_rate;
    $total = $subtotal + $tax + $shipping_cost;

    return [
        'subtotal' => $subtotal,
        'tax' => $tax,
        'shipping' => $shipping_cost,
        'total' => $total
    ];
}

function apply_discount($total, $discount_code)
{
    global $db;

    $discount = $db->query("SELECT * FROM discounts WHERE code = '$discount_code'")->fetch();

    if ($discount) {
        return $total - ($total * $discount['percentage'] / 100);
    }

    return $total;
}
```

### After: Object-Oriented Code

```php
<?php

namespace App\Services;

use App\Models\Order;
use App\Repositories\DiscountRepository;

class OrderCalculator
{
    private float $taxRate;

    public function __construct(
        private DiscountRepository $discountRepo,
        float $taxRate = 0.08
    ) {
        $this->taxRate = $taxRate;
    }

    public function calculateTotal(Order $order): OrderTotal
    {
        $subtotal = $this->calculateSubtotal($order->items);
        $tax = $subtotal * $this->taxRate;
        $shipping = $this->calculateShipping($order);
        $total = $subtotal + $tax + $shipping;

        return new OrderTotal(
            subtotal: $subtotal,
            tax: $tax,
            shipping: $shipping,
            total: $total
        );
    }

    public function applyDiscount(float $total, string $discountCode): float
    {
        $discount = $this->discountRepo->findByCode($discountCode);

        if (!$discount || !$discount->isValid()) {
            return $total;
        }

        return $total - ($total * $discount->percentage / 100);
    }

    private function calculateSubtotal(array $items): float
    {
        return array_reduce($items, function($sum, $item) {
            return $sum + ($item->price * $item->quantity);
        }, 0.0);
    }

    private function calculateShipping(Order $order): float
    {
        // Shipping calculation logic
        return 10.00;
    }
}

class OrderTotal
{
    public function __construct(
        public readonly float $subtotal,
        public readonly float $tax,
        public readonly float $shipping,
        public readonly float $total
    ) {}
}
```

## Extracting Classes from Large Files

### Before: God Class

```php
<?php

class User
{
    public function save() { /* ... */ }
    public function delete() { /* ... */ }
    public function sendEmail($subject, $body) { /* ... */ }
    public function hashPassword($password) { /* ... */ }
    public function validateEmail($email) { /* ... */ }
    public function generateToken() { /* ... */ }
    public function logActivity($action) { /* ... */ }
    // 50+ more methods...
}
```

### After: Single Responsibility

```php
<?php

namespace App\Models;

class User
{
    public function save(): void { /* ... */ }
    public function delete(): void { /* ... */ }
}

namespace App\Services;

class UserMailer
{
    public function sendWelcomeEmail(User $user): void { /* ... */ }
    public function sendPasswordReset(User $user): void { /* ... */ }
}

class PasswordHasher
{
    public function hash(string $password): string { /* ... */ }
    public function verify(string $password, string $hash): bool { /* ... */ }
}

class EmailValidator
{
    public function validate(string $email): bool { /* ... */ }
}

class TokenGenerator
{
    public function generate(): string { /* ... */ }
}

class ActivityLogger
{
    public function log(User $user, string $action): void { /* ... */ }
}
```

## Database Query Migration

### Before: Direct Queries

```php
<?php

function getActiveUsers()
{
    global $db;

    $result = mysql_query("SELECT * FROM users WHERE active = 1");
    $users = [];

    while ($row = mysql_fetch_assoc($result)) {
        $users[] = $row;
    }

    return $users;
}
```

### After: Query Builder/ORM

```php
<?php

namespace App\Repositories;

use Illuminate\Database\Capsule\Manager as DB;
use App\Models\User;

class UserRepository
{
    public function getActiveUsers(): array
    {
        return User::where('active', true)->get()->toArray();
    }

    // Or with query builder
    public function getActiveUsersQueryBuilder(): array
    {
        return DB::table('users')
            ->where('active', true)
            ->get()
            ->toArray();
    }
}
```

## Best Practices

### ✅ DO

- Write characterization tests before refactoring
- Use strangler fig pattern for gradual migration
- Introduce namespaces incrementally
- Add type hints progressively (return types first)
- Implement dependency injection
- Extract classes with single responsibility
- Use modern PHP features (7.4+, 8.0+)
- Migrate to PSR-4 autoloading
- Replace global variables with dependency injection
- Use ORM/query builder instead of raw SQL
- Document migration decisions
- Keep legacy code working during migration

### ❌ DON'T

- Attempt complete rewrite without tests
- Break existing functionality
- Mix old and new patterns in same class
- Skip testing during migration
- Remove legacy code before migration complete
- Ignore backward compatibility
- Rush the migration process
- Forget to update documentation
- Leave dead code in codebase
- Use deprecated PHP features in new code

## Migration Checklist

- [ ] Write characterization tests for legacy code
- [ ] Set up PSR-4 autoloading
- [ ] Introduce namespaces incrementally
- [ ] Add return type hints
- [ ] Add parameter type hints
- [ ] Add property type hints
- [ ] Implement dependency injection
- [ ] Extract single-responsibility classes
- [ ] Migrate to ORM/query builder
- [ ] Remove global variables
- [ ] Update to modern PHP version (8.0+)
- [ ] Enable strict types
- [ ] Remove deprecated function calls
- [ ] Update documentation
- [ ] Remove dead code

## Tools

- **PHPStan** - Static analysis to find bugs
- **Rector** - Automated refactoring tool
- **PHP-CS-Fixer** - Code style fixer
- **PHPUnit** - Testing framework
- **Composer** - Dependency management and autoloading

