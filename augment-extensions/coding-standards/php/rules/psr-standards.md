# PSR Standards

## Overview

PHP Standards Recommendations (PSR) are coding standards established by the PHP Framework Interop Group (PHP-FIG). This document covers the essential PSR standards that all PHP code should follow.

---

## PSR-1: Basic Coding Standard

### File Requirements

**PHP Tags:**
- Files MUST use only `<?php` and `<?=` tags
- Short tags (`<?`) MUST NOT be used
- ASP-style tags (`<%`) MUST NOT be used

**File Encoding:**
- Files MUST use UTF-8 without BOM for PHP code
- No byte order mark (BOM) should be present

**File Purpose:**
- Files SHOULD either declare symbols (classes, functions, constants) OR cause side-effects (generate output, modify settings)
- Files SHOULD NOT do both

### Naming Conventions

**Namespaces and Classes:**
- Namespaces and classes MUST follow PSR-4 autoloading standard
- Class names MUST be declared in PascalCase (e.g., `UserController`)
- Namespace names MUST match directory structure

**Constants:**
- Class constants MUST be declared in UPPER_SNAKE_CASE
- Example: `const MAX_RETRY_COUNT = 3;`

**Methods:**
- Method names MUST be declared in camelCase
- Example: `public function getUserById(int $id): ?User`

---

## PSR-12: Extended Coding Style

### Indentation and Spacing

**Indentation:**
- Code MUST use 4 spaces for indentation
- Tabs MUST NOT be used

**Line Length:**
- There MUST be no hard limit on line length
- Soft limit is 120 characters
- Lines SHOULD NOT exceed 80 characters when practical

**Blank Lines:**
- There MUST be one blank line after namespace declaration
- There MUST be one blank line after use declarations block
- There MUST NOT be more than one statement per line

### Braces and Control Structures

**Class and Method Braces:**
- Opening braces for classes MUST be on the next line
- Opening braces for methods MUST be on the next line
- Closing braces MUST be on their own line

**Control Structure Braces:**
- Opening braces for control structures MUST be on the same line
- Closing braces MUST be on the next line after the body
- Control structure keywords MUST have one space after them
- Opening parentheses MUST NOT have a space after them
- Closing parentheses MUST NOT have a space before them

**Example:**
```php
<?php

namespace App\Controllers;

use App\Models\User;
use App\Services\UserService;

class UserController
{
    public function show(int $id): ?User
    {
        if ($id <= 0) {
            return null;
        }
        
        return User::find($id);
    }
}
```

### Visibility and Type Declarations

**Visibility:**
- Visibility MUST be declared on all properties and methods
- `abstract` and `final` MUST be declared before visibility
- `static` MUST be declared after visibility

**Type Declarations:**
- Type hints SHOULD be used for all parameters
- Return types SHOULD be declared for all methods
- There MUST NOT be a space before the colon in return type declarations
- There MUST be one space after the colon in return type declarations

---

## PSR-4: Autoloading

### Namespace Structure

**Directory Mapping:**
- Namespace structure MUST match directory structure
- Each namespace separator corresponds to a directory separator
- Class names MUST match file names exactly (case-sensitive)

**Example:**
```
Namespace: App\Services\Payment
File path: src/Services/Payment/PaymentService.php
Class name: PaymentService
```

### Autoloader Configuration

**Composer autoload:**
```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

---

## PSR-7: HTTP Messages

### Request and Response Objects

**Immutability:**
- HTTP message objects MUST be immutable
- Methods that modify state MUST return new instances

**Interfaces:**
- Use `Psr\Http\Message\RequestInterface` for requests
- Use `Psr\Http\Message\ResponseInterface` for responses
- Use `Psr\Http\Message\StreamInterface` for message bodies

**Example:**
```php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

function handleRequest(ServerRequestInterface $request): ResponseInterface
{
    $response = new Response();
    return $response
        ->withStatus(200)
        ->withHeader('Content-Type', 'application/json')
        ->withBody($stream);
}
```

---

## PSR-11: Container Interface

### Dependency Injection Container

**Container Interface:**
- Implement `Psr\Container\ContainerInterface`
- `get($id)` method retrieves entries
- `has($id)` method checks if entry exists

**Exception Handling:**
- Throw `Psr\Container\NotFoundExceptionInterface` when entry not found
- Throw `Psr\Container\ContainerExceptionInterface` for other errors


