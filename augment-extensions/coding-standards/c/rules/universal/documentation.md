# Rule: Documentation

## Metadata
- **ID**: universal-documentation
- **Category**: universal
- **Severity**: WARNING
- **Standard**: Doxygen
- **Version**: 1.0.0

## Description
Use Doxygen-style comments for all public APIs, including function documentation, parameter descriptions, return values, file headers, and inline comments for complex logic.

## Rationale
Good documentation improves code maintainability, helps onboarding new developers, and serves as a contract for API usage. Doxygen-compatible comments enable automatic documentation generation.

## Applies To
- C Standards: c89, c99, c11, c17, c23
- Categories: all

## Rule Details

### 1. Function Documentation
- Use `@brief` for short description
- Use `@param` for each parameter
- Use `@return` for return value description
- Use `@note` for important notes
- Use `@warning` for warnings

### 2. File Headers
- Include file description
- Include author and date
- Include copyright/license if applicable

### 3. Inline Comments
- Explain complex algorithms
- Document non-obvious behavior
- Clarify intent, not just what code does

### 4. Struct/Enum Documentation
- Document each struct/enum
- Document important fields
- Explain usage patterns

## Examples

### ✅ Good Example 1: Function Documentation

```c
/**
 * @brief Calculates the factorial of a number
 * 
 * This function computes n! (n factorial) using iterative approach.
 * For large values of n, the result may overflow.
 * 
 * @param n The number to calculate factorial for (must be >= 0)
 * @return The factorial of n, or 0 if n is negative
 * 
 * @note Maximum safe value depends on integer size
 * @warning This function does not check for overflow
 * 
 * @code
 * unsigned long result = factorial(5); // Returns 120
 * @endcode
 */
unsigned long factorial(int n) {
    if (n < 0) {
        return 0;
    }
    
    unsigned long result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}
```

### ✅ Good Example 2: File Header

```c
/**
 * @file network_utils.c
 * @brief Network utility functions for socket operations
 * 
 * This module provides helper functions for common network operations
 * including socket creation, connection management, and data transfer.
 * 
 * @author John Doe
 * @date 2024-01-15
 * @version 1.0.0
 * 
 * @copyright Copyright (c) 2024 Company Name
 * Licensed under MIT License
 */

#include "network_utils.h"
```

### ✅ Good Example 3: Struct Documentation

```c
/**
 * @brief Represents a user in the system
 * 
 * This structure holds all user-related information including
 * credentials, profile data, and access permissions.
 */
typedef struct {
    /** @brief Unique user identifier */
    int user_id;
    
    /** @brief Username (null-terminated, max 32 chars) */
    char username[32];
    
    /** @brief User's email address */
    char email[64];
    
    /** @brief Account creation timestamp (Unix epoch) */
    time_t created_at;
    
    /** @brief User permission level (0=guest, 1=user, 2=admin) */
    int permission_level;
} User;
```

### ✅ Good Example 4: Enum Documentation

```c
/**
 * @brief Connection status codes
 * 
 * Represents the current state of a network connection.
 */
typedef enum {
    /** @brief Connection not yet established */
    CONN_STATUS_DISCONNECTED = 0,
    
    /** @brief Connection in progress */
    CONN_STATUS_CONNECTING = 1,
    
    /** @brief Connection established and active */
    CONN_STATUS_CONNECTED = 2,
    
    /** @brief Connection failed or error occurred */
    CONN_STATUS_ERROR = 3
} ConnectionStatus;
```

### ✅ Good Example 5: Complex Logic with Inline Comments

```c
int process_packet(const uint8_t* data, size_t len) {
    // Validate minimum packet size (header + checksum)
    if (len < MIN_PACKET_SIZE) {
        return -1;
    }
    
    // Extract header fields (network byte order)
    uint16_t packet_type = ntohs(*(uint16_t*)data);
    uint16_t payload_len = ntohs(*(uint16_t*)(data + 2));
    
    // Verify payload length matches packet size
    // Formula: header(4) + payload + checksum(2)
    if (len != 4 + payload_len + 2) {
        return -1;
    }
    
    // Calculate and verify checksum (last 2 bytes)
    uint16_t expected_checksum = calculate_checksum(data, len - 2);
    uint16_t actual_checksum = ntohs(*(uint16_t*)(data + len - 2));
    
    if (expected_checksum != actual_checksum) {
        return -1; // Checksum mismatch
    }
    
    return 0;
}
```

### ❌ Bad Example 1: No Documentation

```c
int calc(int a, int b) {
    return a * b + (a / b);
}
```

### ❌ Bad Example 2: Useless Comments

```c
// Increment i
i++;

// Set x to 5
x = 5;

// Loop through array
for (int i = 0; i < n; i++) {
    // Process element
    process(arr[i]);
}
```

### ❌ Bad Example 3: Incomplete Documentation

```c
/**
 * Does something with data
 */
int process_data(void* data, size_t len, int flags);
// Missing: what it does, param descriptions, return value
```

## Documentation Best Practices

### DO:
- Document the "why", not just the "what"
- Keep documentation up-to-date with code changes
- Use examples for complex functions
- Document edge cases and limitations
- Explain non-obvious design decisions

### DON'T:
- State the obvious (e.g., "// increment i" for `i++`)
- Leave outdated comments
- Document every single line
- Use comments to explain bad code (refactor instead)

## Doxygen Tags Reference

| Tag | Purpose | Example |
|-----|---------|---------|
| `@brief` | Short description | `@brief Opens a file` |
| `@param` | Parameter description | `@param[in] fd File descriptor` |
| `@return` | Return value | `@return 0 on success, -1 on error` |
| `@note` | Important note | `@note Thread-safe` |
| `@warning` | Warning | `@warning Not reentrant` |
| `@see` | Cross-reference | `@see close_file()` |
| `@code/@endcode` | Code example | See examples above |

## References

- [Doxygen Manual](https://www.doxygen.nl/manual/)
- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/doc-guide/kernel-doc.html)
- [GNU Coding Standards - Comments](https://www.gnu.org/prep/standards/standards.html#Comments)

## Related Rules

- `universal-naming` - Clear names reduce need for comments
- `universal-error-handling` - Document error conditions

