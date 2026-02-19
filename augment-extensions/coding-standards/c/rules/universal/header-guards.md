# Rule: Header Guards

## Metadata
- **ID**: universal-header-guards
- **Category**: universal
- **Severity**: ERROR
- **Standard**: C Standards, C++ Standards
- **Version**: 1.0.0

## Description
Protect header files from multiple inclusion using `#ifndef/#define/#endif` pattern or `#pragma once` directive.

## Rationale
Header guards prevent multiple inclusion of the same header file, which can cause:
- Redefinition errors
- Increased compilation time
- Potential ODR (One Definition Rule) violations
- Unexpected behavior from duplicate definitions

## Applies To
- C Standards: c89, c99, c11, c17, c23
- Categories: all

## Rule Details

### 1. Traditional Header Guards (#ifndef/#define/#endif)
- Use unique guard names based on file path
- Format: `PROJECT_PATH_FILENAME_H`
- Place at the very beginning and end of header
- Include all content between guards

### 2. Pragma Once (Alternative)
- Modern compilers support `#pragma once`
- Simpler syntax, less error-prone
- Not part of C standard but widely supported
- Faster compilation in some cases

### 3. Guard Naming Convention
- Use uppercase letters
- Include project/module name to ensure uniqueness
- Replace path separators and dots with underscores
- Add trailing `_H` or `_INCLUDED`

## Examples

### ✅ Good Example 1: Traditional Header Guard

```c
/**
 * @file network_utils.h
 * @brief Network utility functions
 */

#ifndef MYPROJECT_NETWORK_UTILS_H
#define MYPROJECT_NETWORK_UTILS_H

#include <stdint.h>
#include <stddef.h>

// Function declarations
int connect_to_server(const char* host, uint16_t port);
void disconnect_from_server(int socket_fd);
ssize_t send_data(int socket_fd, const void* data, size_t len);

#endif /* MYPROJECT_NETWORK_UTILS_H */
```

### ✅ Good Example 2: Pragma Once

```c
/**
 * @file config.h
 * @brief Configuration constants
 */

#pragma once

#define MAX_CONNECTIONS 100
#define DEFAULT_PORT 8080
#define BUFFER_SIZE 4096
```

### ✅ Good Example 3: Nested Path Header Guard

```c
/**
 * @file src/core/memory/allocator.h
 * @brief Custom memory allocator
 */

#ifndef MYPROJECT_SRC_CORE_MEMORY_ALLOCATOR_H
#define MYPROJECT_SRC_CORE_MEMORY_ALLOCATOR_H

typedef struct allocator Allocator;

Allocator* allocator_create(size_t pool_size);
void allocator_destroy(Allocator* alloc);
void* allocator_alloc(Allocator* alloc, size_t size);
void allocator_free(Allocator* alloc, void* ptr);

#endif /* MYPROJECT_SRC_CORE_MEMORY_ALLOCATOR_H */
```

### ✅ Good Example 4: Header with External C Linkage

```c
/**
 * @file api.h
 * @brief Public API for C++ compatibility
 */

#ifndef MYPROJECT_API_H
#define MYPROJECT_API_H

#ifdef __cplusplus
extern "C" {
#endif

// API functions
int initialize_library(void);
void shutdown_library(void);

#ifdef __cplusplus
}
#endif

#endif /* MYPROJECT_API_H */
```

### ❌ Bad Example 1: Missing Header Guard

```c
/**
 * @file utils.h
 */

// No header guard!

void utility_function(void);
int helper_function(int x);
```

### ❌ Bad Example 2: Incomplete Header Guard

```c
/**
 * @file data.h
 */

#ifndef DATA_H
#define DATA_H

struct Data {
    int value;
};

// Missing #endif - will cause errors!
```

### ❌ Bad Example 3: Non-Unique Guard Name

```c
/**
 * @file src/module_a/config.h
 */

#ifndef CONFIG_H  // Too generic, may conflict!
#define CONFIG_H

#define MAX_SIZE 100

#endif
```

### ❌ Bad Example 4: Guard Doesn't Cover All Content

```c
#include <stdio.h>  // Outside guard - will be included multiple times!

#ifndef UTILS_H
#define UTILS_H

void print_message(const char* msg);

#endif
```

## Guard Naming Examples

| File Path | Guard Name |
|-----------|------------|
| `utils.h` | `MYPROJECT_UTILS_H` |
| `src/core/memory.h` | `MYPROJECT_SRC_CORE_MEMORY_H` |
| `include/api/v2/client.h` | `MYPROJECT_INCLUDE_API_V2_CLIENT_H` |
| `lib/network/tcp.h` | `MYPROJECT_LIB_NETWORK_TCP_H` |

## Choosing Between #ifndef and #pragma once

### Use #ifndef/#define/#endif when:
- Maximum portability is required
- Working with very old compilers
- Project coding standards mandate it
- Building for embedded systems with limited toolchains

### Use #pragma once when:
- Working with modern compilers (GCC, Clang, MSVC)
- Simplicity and readability are priorities
- Faster compilation is desired
- Team/project standards allow it

## Common Mistakes

1. **Forgetting the closing #endif**
   - Causes compilation errors
   - Use editor features to match directives

2. **Using non-unique guard names**
   - Can cause silent bugs
   - Always include project/module prefix

3. **Placing includes before guard**
   - Defeats the purpose of guards
   - Guard should be first non-comment line

4. **Typos in guard names**
   - #ifndef and #define must match exactly
   - Use copy-paste to avoid errors

## Automation

### Generate guard name from filename (bash):
```bash
#!/bin/bash
filename="$1"
guard=$(echo "$filename" | tr '[:lower:]' '[:upper:]' | tr './' '__')
echo "#ifndef ${guard}"
echo "#define ${guard}"
echo ""
echo "// Content here"
echo ""
echo "#endif /* ${guard} */"
```

## References

- [C Standard - 6.10 Preprocessing directives](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf)
- [GCC Documentation - Once-Only Headers](https://gcc.gnu.org/onlinedocs/cpp/Once-Only-Headers.html)
- [Google C++ Style Guide - Header Guards](https://google.github.io/styleguide/cppguide.html#The__define_Guard)

## Related Rules

- `universal-naming` - Guard naming conventions
- `universal-documentation` - File header documentation

