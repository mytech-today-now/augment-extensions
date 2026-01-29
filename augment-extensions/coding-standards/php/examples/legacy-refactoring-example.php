<?php

/**
 * Legacy Code Refactoring Example
 * 
 * This example demonstrates refactoring procedural PHP code to modern OOP with:
 * - Namespaces (PSR-4)
 * - Type hints (PHP 8+)
 * - Dependency injection
 * - Single responsibility principle
 * - Proper error handling
 */

// ============================================================================
// BEFORE: Legacy Procedural Code
// ============================================================================

/**
 * Legacy user management functions (BAD EXAMPLE - DO NOT USE)
 */

// Global database connection
$db = mysqli_connect('localhost', 'user', 'pass', 'database');

// Create user function with global dependency
function create_user($name, $email, $password)
{
    global $db;
    
    // No validation
    $hashed_password = md5($password); // Weak hashing!
    
    // SQL injection vulnerability!
    $query = "INSERT INTO users (name, email, password) 
              VALUES ('$name', '$email', '$hashed_password')";
    
    $result = mysqli_query($db, $query);
    
    if ($result) {
        $user_id = mysqli_insert_id($db);
        
        // Send email (tightly coupled)
        mail($email, 'Welcome', 'Welcome to our site!');
        
        return $user_id;
    }
    
    return false;
}

// Get user function
function get_user($id)
{
    global $db;
    
    // SQL injection vulnerability!
    $query = "SELECT * FROM users WHERE id = $id";
    $result = mysqli_query($db, $query);
    
    return mysqli_fetch_assoc($result);
}

// Update user function
function update_user($id, $name, $email)
{
    global $db;
    
    // SQL injection vulnerability!
    $query = "UPDATE users SET name = '$name', email = '$email' WHERE id = $id";
    
    return mysqli_query($db, $query);
}

// Delete user function
function delete_user($id)
{
    global $db;
    
    // SQL injection vulnerability!
    $query = "DELETE FROM users WHERE id = $id";
    
    return mysqli_query($db, $query);
}

// Usage (legacy)
$user_id = create_user('John Doe', 'john@example.com', 'password123');
$user = get_user($user_id);
update_user($user_id, 'Jane Doe', 'jane@example.com');
delete_user($user_id);

// ============================================================================
// AFTER: Modern OOP Code with Best Practices
// ============================================================================

declare(strict_types=1);

namespace App\Models;

/**
 * User Model
 */
class User
{
    public function __construct(
        private ?int $id = null,
        private string $name = '',
        private string $email = '',
        private string $passwordHash = '',
        private ?\DateTimeImmutable $createdAt = null,
        private ?\DateTimeImmutable $updatedAt = null
    ) {}
    
    // Getters
    public function getId(): ?int
    {
        return $this->id;
    }
    
    public function getName(): string
    {
        return $this->name;
    }
    
    public function getEmail(): string
    {
        return $this->email;
    }
    
    public function getPasswordHash(): string
    {
        return $this->passwordHash;
    }
    
    // Setters with validation
    public function setName(string $name): self
    {
        if (empty($name)) {
            throw new \InvalidArgumentException('Name cannot be empty');
        }
        
        $this->name = $name;
        return $this;
    }
    
    public function setEmail(string $email): self
    {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email address');
        }
        
        $this->email = $email;
        return $this;
    }
    
    public function setPassword(string $password): self
    {
        if (strlen($password) < 8) {
            throw new \InvalidArgumentException('Password must be at least 8 characters');
        }
        
        // Use secure password hashing
        $this->passwordHash = password_hash($password, PASSWORD_ARGON2ID);
        return $this;
    }
    
    public function verifyPassword(string $password): bool
    {
        return password_verify($password, $this->passwordHash);
    }
}

// ============================================================================

namespace App\Repositories;

use App\Models\User;
use PDO;

/**
 * User Repository - Database operations
 */
class UserRepository
{
    public function __construct(
        private PDO $db
    ) {}
    
    public function create(User $user): User
    {
        $stmt = $this->db->prepare(
            "INSERT INTO users (name, email, password_hash, created_at, updated_at) 
             VALUES (:name, :email, :password_hash, NOW(), NOW())"
        );
        
        $stmt->execute([
            'name' => $user->getName(),
            'email' => $user->getEmail(),
            'password_hash' => $user->getPasswordHash()
        ]);
        
        $id = (int) $this->db->lastInsertId();
        
        return $this->findById($id);
    }
    
    public function findById(int $id): ?User
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$data) {
            return null;
        }
        
        return $this->hydrate($data);
    }
    
    public function findByEmail(string $email): ?User
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email");
        $stmt->execute(['email' => $email]);
        
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$data) {
            return null;
        }
        
        return $this->hydrate($data);
    }
}

