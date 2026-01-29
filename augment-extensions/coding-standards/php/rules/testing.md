# Testing Standards

## Overview

Comprehensive testing is essential for maintaining code quality and preventing regressions. This document defines standards for unit testing, integration testing, and test organization using PHPUnit.

---

## Unit Testing

### PHPUnit Setup

**Rules:**
- Use PHPUnit for all PHP testing
- Organize tests to mirror source code structure
- Aim for at least 80% code coverage

**Directory Structure:**
```
project/
├── src/
│   └── Services/
│       └── UserService.php
└── tests/
    └── Unit/
        └── Services/
            └── UserServiceTest.php
```

### Test Class Structure

**Rules:**
- Test classes MUST extend `PHPUnit\Framework\TestCase`
- Test class names MUST end with `Test`
- Test method names MUST start with `test` or use `@test` annotation
- Use descriptive test method names

**Examples:**
```php
// ✅ Good
use PHPUnit\Framework\TestCase;

class UserServiceTest extends TestCase
{
    public function testCreateUserWithValidData(): void
    {
        // Test implementation
    }
    
    public function testCreateUserThrowsExceptionForInvalidEmail(): void
    {
        // Test implementation
    }
    
    /** @test */
    public function it_updates_user_successfully(): void
    {
        // Test implementation
    }
}

// ❌ Bad
class UserService extends TestCase  // Missing 'Test' suffix
{
    public function create_user(): void  // Doesn't start with 'test'
    {
        // Test implementation
    }
}
```

### AAA Pattern (Arrange-Act-Assert)

**Rules:**
- Structure tests using Arrange-Act-Assert pattern
- Keep tests focused on single behavior
- Use blank lines to separate AAA sections

**Examples:**
```php
// ✅ Good
public function testCalculateTotalPrice(): void
{
    // Arrange
    $items = [
        ['price' => 10.00, 'quantity' => 2],
        ['price' => 5.00, 'quantity' => 3],
    ];
    $calculator = new PriceCalculator();
    
    // Act
    $total = $calculator->calculateTotal($items);
    
    // Assert
    $this->assertEquals(35.00, $total);
}

// ❌ Bad - Mixed concerns
public function testMultipleThings(): void
{
    $calc = new PriceCalculator();
    $this->assertEquals(35.00, $calc->calculateTotal($items1));
    $this->assertEquals(50.00, $calc->calculateTotal($items2));
    $this->assertTrue($calc->isValid());
}
```

### Assertions

**Rules:**
- Use specific assertions over generic ones
- Include meaningful assertion messages
- Use type-specific assertions

**Common Assertions:**
```php
// ✅ Good - Specific assertions
$this->assertTrue($result);
$this->assertFalse($result);
$this->assertEquals($expected, $actual);
$this->assertSame($expected, $actual);  // Strict comparison
$this->assertNull($value);
$this->assertNotNull($value);
$this->assertEmpty($array);
$this->assertCount(3, $array);
$this->assertInstanceOf(User::class, $user);
$this->assertStringContainsString('error', $message);
$this->assertArrayHasKey('email', $data);

// ✅ Good - With messages
$this->assertEquals(100, $total, 'Total price should be 100');

// ❌ Bad - Generic assertion
$this->assertTrue($user instanceof User);  // Use assertInstanceOf instead
```

### Test Doubles (Mocks and Stubs)

**Rules:**
- Use mocks to verify behavior
- Use stubs to provide test data
- Mock external dependencies
- Don't mock the system under test

**Examples:**
```php
// ✅ Good - Mock external dependency
public function testSendEmailNotification(): void
{
    // Arrange
    $mailer = $this->createMock(MailerInterface::class);
    $mailer->expects($this->once())
        ->method('send')
        ->with($this->equalTo('user@example.com'));
    
    $notifier = new EmailNotifier($mailer);
    
    // Act
    $notifier->notify('user@example.com', 'Test message');
    
    // Assert - Verification happens via expects()
}

// ✅ Good - Stub for test data
public function testProcessUserData(): void
{
    // Arrange
    $repository = $this->createStub(UserRepositoryInterface::class);
    $repository->method('findById')
        ->willReturn(new User(1, 'John Doe'));
    
    $service = new UserService($repository);
    
    // Act
    $result = $service->processUser(1);
    
    // Assert
    $this->assertEquals('John Doe', $result->name);
}
```

### Data Providers

**Rules:**
- Use data providers for testing multiple scenarios
- Keep data providers focused and readable
- Name data sets descriptively

**Examples:**
```php
// ✅ Good
/**
 * @dataProvider emailValidationProvider
 */
public function testEmailValidation(string $email, bool $expected): void
{
    $validator = new EmailValidator();
    $result = $validator->isValid($email);
    $this->assertEquals($expected, $result);
}

public function emailValidationProvider(): array
{
    return [
        'valid email' => ['user@example.com', true],
        'invalid - no @' => ['userexample.com', false],
        'invalid - no domain' => ['user@', false],
        'invalid - empty' => ['', false],
    ];
}
```

---

## Integration Testing

### Database Testing

**Rules:**
- Use transactions for test isolation
- Reset database state between tests
- Use test fixtures for consistent data

**Examples:**
```php
// ✅ Good - Transaction-based test
use Illuminate\Foundation\Testing\RefreshDatabase;

class UserRepositoryTest extends TestCase
{
    use RefreshDatabase;
    
    public function testFindUserById(): void
    {
        // Arrange
        $user = User::factory()->create([
            'email' => 'test@example.com'
        ]);
        
        $repository = new UserRepository();
        
        // Act
        $found = $repository->findById($user->id);
        
        // Assert
        $this->assertNotNull($found);
        $this->assertEquals('test@example.com', $found->email);
    }
}
```

### API Testing

**Rules:**
- Test request/response contracts
- Verify HTTP status codes
- Validate response structure
- Test authentication and authorization

**Examples:**
```php
// ✅ Good - API endpoint test
public function testGetUserEndpoint(): void
{
    // Arrange
    $user = User::factory()->create();
    
    // Act
    $response = $this->getJson("/api/users/{$user->id}");
    
    // Assert
    $response->assertStatus(200)
        ->assertJson([
            'id' => $user->id,
            'email' => $user->email,
        ])
        ->assertJsonStructure([
            'id',
            'email',
            'created_at',
            'updated_at',
        ]);
}

public function testUnauthorizedAccess(): void
{
    $response = $this->getJson('/api/admin/users');
    $response->assertStatus(401);
}
```

---

## Test Organization

### Test Naming

**Rules:**
- Use descriptive test names that explain what is being tested
- Include the expected outcome in the name
- Use snake_case or camelCase consistently

**Examples:**
```php
// ✅ Good - Descriptive names
public function testCreateUserWithValidDataReturnsUser(): void
public function testCreateUserWithInvalidEmailThrowsException(): void
public function testDeleteUserRemovesFromDatabase(): void

// ❌ Bad - Vague names
public function testUser(): void
public function testCreate(): void
```

### Test Coverage

**Rules:**
- Aim for at least 80% code coverage
- Focus on critical business logic
- Don't chase 100% coverage at the expense of test quality

**Generate Coverage Report:**
```bash
# ✅ Good
./vendor/bin/phpunit --coverage-html coverage/
```

### Setup and Teardown

**Rules:**
- Use `setUp()` for common test initialization
- Use `tearDown()` for cleanup
- Keep setup minimal and focused

**Examples:**
```php
// ✅ Good
class UserServiceTest extends TestCase
{
    private UserService $service;
    private UserRepositoryInterface $repository;
    
    protected function setUp(): void
    {
        parent::setUp();
        
        $this->repository = $this->createMock(UserRepositoryInterface::class);
        $this->service = new UserService($this->repository);
    }
    
    protected function tearDown(): void
    {
        parent::tearDown();
        // Cleanup if needed
    }
    
    public function testSomething(): void
    {
        // Test uses $this->service
    }
}
```

---

## Best Practices

### Test Independence

**Rules:**
- Tests MUST be independent of each other
- Tests MUST NOT rely on execution order
- Each test MUST set up its own state

### Fast Tests

**Rules:**
- Keep unit tests fast (< 100ms each)
- Mock external services
- Use in-memory databases for integration tests when possible

### Readable Tests

**Rules:**
- Tests should be easy to understand
- Use helper methods to reduce duplication
- Avoid complex logic in tests

**Examples:**
```php
// ✅ Good - Helper method
private function createTestUser(array $attributes = []): User
{
    return User::factory()->create($attributes);
}

public function testUserCreation(): void
{
    $user = $this->createTestUser(['email' => 'test@example.com']);
    $this->assertEquals('test@example.com', $user->email);
}
```

