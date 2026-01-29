# Error Handling

## Overview

Proper error handling is critical for building robust PHP applications. This document defines standards for exception handling, error logging, and error recovery patterns.

---

## Exception Handling

### Use Specific Exception Types

**Rules:**
- Catch specific exception types rather than generic `Exception`
- Create custom exceptions for domain-specific errors
- Extend appropriate base exception classes
- Include meaningful error messages and context

**Examples:**
```php
// ✅ Good
try {
    $user = $userRepository->findById($id);
} catch (UserNotFoundException $e) {
    return response()->json(['error' => 'User not found'], 404);
} catch (DatabaseException $e) {
    logger()->error('Database error', ['exception' => $e]);
    return response()->json(['error' => 'Server error'], 500);
}

// ❌ Bad
try {
    $user = $userRepository->findById($id);
} catch (Exception $e) {  // Too generic
    return response()->json(['error' => 'Error'], 500);
}
```

### Custom Exceptions

**Rules:**
- Create custom exception classes for specific error conditions
- Extend from appropriate base classes
- Include context in exception messages
- Add custom properties when needed

**Examples:**
```php
// ✅ Good
class UserNotFoundException extends RuntimeException
{
    public function __construct(int $userId)
    {
        parent::__construct("User with ID {$userId} not found");
    }
}

class InvalidPaymentException extends RuntimeException
{
    public function __construct(
        string $message,
        private readonly array $validationErrors = []
    ) {
        parent::__construct($message);
    }
    
    public function getValidationErrors(): array
    {
        return $this->validationErrors;
    }
}

// Usage
throw new UserNotFoundException($id);
throw new InvalidPaymentException('Payment validation failed', $errors);
```

### Try-Catch-Finally Blocks

**Rules:**
- Use `try-catch` for recoverable errors
- Use `finally` for cleanup operations
- Don't catch exceptions you can't handle
- Re-throw exceptions when appropriate

**Examples:**
```php
// ✅ Good
function processFile(string $path): array
{
    $handle = fopen($path, 'r');
    
    try {
        $data = [];
        while (($line = fgets($handle)) !== false) {
            $data[] = json_decode($line, true);
        }
        return $data;
    } catch (JsonException $e) {
        logger()->error('JSON parsing error', ['file' => $path, 'exception' => $e]);
        throw new FileProcessingException("Failed to process file: {$path}", 0, $e);
    } finally {
        fclose($handle);  // Always close the file
    }
}

// ✅ Good - Resource cleanup
function executeTransaction(callable $callback): mixed
{
    $this->db->beginTransaction();
    
    try {
        $result = $callback();
        $this->db->commit();
        return $result;
    } catch (Exception $e) {
        $this->db->rollBack();
        throw $e;
    }
}
```

---

## Error Logging

### PSR-3 Logger Usage

**Rules:**
- Use PSR-3 compliant logger (e.g., Monolog)
- Use appropriate log levels
- Include contextual data in log messages
- Never log sensitive data (passwords, tokens, credit cards)

**Log Levels:**
- `debug` - Detailed debug information
- `info` - Interesting events (user login, SQL logs)
- `notice` - Normal but significant events
- `warning` - Exceptional occurrences that are not errors
- `error` - Runtime errors that don't require immediate action
- `critical` - Critical conditions (application component unavailable)
- `alert` - Action must be taken immediately
- `emergency` - System is unusable

**Examples:**
```php
// ✅ Good
use Psr\Log\LoggerInterface;

class UserService
{
    public function __construct(
        private readonly LoggerInterface $logger
    ) {}
    
    public function createUser(array $data): User
    {
        $this->logger->info('Creating new user', [
            'email' => $data['email'],
            'ip' => request()->ip()
        ]);
        
        try {
            $user = User::create($data);
            $this->logger->info('User created successfully', ['user_id' => $user->id]);
            return $user;
        } catch (DatabaseException $e) {
            $this->logger->error('Failed to create user', [
                'email' => $data['email'],
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }
}

// ❌ Bad
function createUser(array $data): User
{
    error_log('Creating user');  // Not PSR-3, no context
    
    try {
        $user = User::create($data);
        error_log('User created: ' . $data['password']);  // Logging sensitive data!
        return $user;
    } catch (Exception $e) {
        error_log($e->getMessage());  // No context
        throw $e;
    }
}
```

### Contextual Logging

**Rules:**
- Include relevant context in log messages
- Use structured logging (arrays, not string concatenation)
- Add request ID for tracing
- Include user ID when available

**Examples:**
```php
// ✅ Good
$this->logger->error('Payment processing failed', [
    'order_id' => $order->id,
    'amount' => $order->total,
    'gateway' => $gateway->getName(),
    'error_code' => $e->getCode(),
    'request_id' => request()->id()
]);

// ❌ Bad
$this->logger->error('Payment failed for order ' . $order->id);  // No context
```

---

## Error Recovery Patterns

### Retry Logic

**Rules:**
- Implement retry logic for transient failures
- Use exponential backoff for retries
- Set maximum retry attempts
- Log retry attempts

**Examples:**
```php
// ✅ Good
function fetchDataWithRetry(string $url, int $maxRetries = 3): array
{
    $attempt = 0;
    $delay = 1; // seconds
    
    while ($attempt < $maxRetries) {
        try {
            return $this->httpClient->get($url);
        } catch (NetworkException $e) {
            $attempt++;
            
            if ($attempt >= $maxRetries) {
                $this->logger->error('Max retries exceeded', [
                    'url' => $url,
                    'attempts' => $attempt
                ]);
                throw $e;
            }
            
            $this->logger->warning('Request failed, retrying', [
                'url' => $url,
                'attempt' => $attempt,
                'delay' => $delay
            ]);
            
            sleep($delay);
            $delay *= 2; // Exponential backoff
        }
    }
}
```

### Fallback Values

**Rules:**
- Provide sensible defaults for non-critical failures
- Document fallback behavior
- Log when fallbacks are used

**Examples:**
```php
// ✅ Good
function getUserPreferences(int $userId): array
{
    try {
        return $this->cache->get("user_prefs:{$userId}");
    } catch (CacheException $e) {
        $this->logger->warning('Cache unavailable, using defaults', [
            'user_id' => $userId,
            'exception' => $e->getMessage()
        ]);
        return $this->getDefaultPreferences();
    }
}
```

### Circuit Breaker Pattern

**Rules:**
- Use circuit breaker for external service calls
- Open circuit after threshold failures
- Implement half-open state for recovery testing

**Examples:**
```php
// ✅ Good
class CircuitBreaker
{
    private int $failureCount = 0;
    private const FAILURE_THRESHOLD = 5;
    private const TIMEOUT = 60; // seconds
    
    public function call(callable $callback): mixed
    {
        if ($this->isOpen()) {
            throw new CircuitBreakerOpenException('Circuit breaker is open');
        }
        
        try {
            $result = $callback();
            $this->onSuccess();
            return $result;
        } catch (Exception $e) {
            $this->onFailure();
            throw $e;
        }
    }
    
    private function isOpen(): bool
    {
        return $this->failureCount >= self::FAILURE_THRESHOLD;
    }
    
    private function onSuccess(): void
    {
        $this->failureCount = 0;
    }
    
    private function onFailure(): void
    {
        $this->failureCount++;
    }
}
```

