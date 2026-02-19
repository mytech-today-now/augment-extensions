# Rule: Legacy Code Maintenance

## Metadata
- **ID**: category-legacy
- **Category**: legacy
- **Severity**: WARNING
- **Standard**: Best Practices for Legacy Code
- **Version**: 1.0.0

## Description
Legacy code maintenance rules covering backward compatibility, safe refactoring techniques, deprecation patterns, version compatibility, and migration paths.

## Rationale
Legacy code often cannot be rewritten from scratch. These rules ensure safe, incremental improvements while maintaining compatibility with existing systems and minimizing risk of regressions.

## Applies To
- C Standards: c89, c99, c11, c17, c23
- Categories: legacy
- Platforms: All platforms with existing codebases

## Rule Details

### 1. Backward Compatibility
- Maintain existing API signatures
- Use versioned APIs for breaking changes
- Provide compatibility shims
- Document compatibility requirements
- Test with old and new code

### 2. Safe Refactoring
- Make small, incremental changes
- Add tests before refactoring
- Preserve existing behavior
- Use compiler warnings to find issues
- Refactor with feature flags

### 3. Deprecation Patterns
- Mark deprecated functions clearly
- Provide migration path
- Give adequate deprecation period
- Log deprecation warnings
- Document replacement APIs

### 4. Version Compatibility
- Support multiple C standards
- Handle platform differences
- Use feature detection, not version checks
- Provide fallback implementations
- Test on target platforms

### 5. Migration Strategies
- Create parallel implementations
- Use adapter patterns
- Implement gradual migration
- Maintain dual support during transition
- Provide migration tools/scripts

## Examples

### ✅ Example 1: Deprecation with Compiler Warnings

```c
#include <stdio.h>

// Old function - deprecated
#ifdef __GNUC__
__attribute__((deprecated("Use new_process_data() instead")))
#elif defined(_MSC_VER)
__declspec(deprecated("Use new_process_data() instead"))
#endif
int process_data(const char *data) {
    // Old implementation
    fprintf(stderr, "Warning: process_data() is deprecated, use new_process_data()\n");
    return new_process_data(data, strlen(data));
}

// New function with improved API
int new_process_data(const char *data, size_t len) {
    // New, safer implementation
    if (data == NULL || len == 0) {
        return -1;
    }
    
    // Process data...
    return 0;
}
```

### ❌ Example 1: Abrupt API Change

```c
// WRONG: Breaking change without deprecation period
// Old code using process_data(data) will break immediately!
int process_data(const char *data, size_t len) {  // Changed signature!
    // ...
}
```

### ✅ Example 2: Versioned API

```c
#include <stdint.h>

// Version 1 API (legacy)
typedef struct {
    int id;
    char name[32];
} DeviceInfo_v1;

// Version 2 API (current)
typedef struct {
    int id;
    char name[64];
    uint32_t capabilities;
    uint32_t flags;
} DeviceInfo_v2;

// Legacy function - still supported
int get_device_info(int device_id, DeviceInfo_v1 *info) {
    DeviceInfo_v2 info_v2;
    int ret;
    
    ret = get_device_info_v2(device_id, &info_v2);
    if (ret < 0) {
        return ret;
    }
    
    // Convert v2 to v1
    info->id = info_v2.id;
    strncpy(info->name, info_v2.name, sizeof(info->name) - 1);
    info->name[sizeof(info->name) - 1] = '\0';
    
    return 0;
}

// New function with extended capabilities
int get_device_info_v2(int device_id, DeviceInfo_v2 *info) {
    // Full implementation
    return 0;
}
```

### ✅ Example 3: Compatibility Shim

```c
#include <string.h>

// Modern systems have strlcpy, older ones don't
#ifndef HAVE_STRLCPY

// Provide our own implementation for compatibility
size_t strlcpy(char *dst, const char *src, size_t size) {
    size_t src_len = strlen(src);
    
    if (size == 0) {
        return src_len;
    }
    
    size_t copy_len = (src_len >= size) ? size - 1 : src_len;
    memcpy(dst, src, copy_len);
    dst[copy_len] = '\0';
    
    return src_len;
}

#endif  // HAVE_STRLCPY
```

### ✅ Example 4: Feature Detection

```c
#include <stddef.h>

// Detect C11 features
#if defined(__STDC_VERSION__) && __STDC_VERSION__ >= 201112L
    #define HAVE_C11_FEATURES 1
    #include <stdatomic.h>
    #include <threads.h>
#else
    #define HAVE_C11_FEATURES 0
#endif

// Use C11 atomics if available, fallback otherwise
#if HAVE_C11_FEATURES
    typedef atomic_int counter_t;
    #define counter_init(c, val) atomic_init(c, val)
    #define counter_increment(c) atomic_fetch_add(c, 1)
    #define counter_get(c) atomic_load(c)
#else
    typedef volatile int counter_t;
    #define counter_init(c, val) (*(c) = (val))
    #define counter_increment(c) (++(*(c)))
    #define counter_get(c) (*(c))
#endif
```

### ✅ Example 5: Gradual Migration with Feature Flags

```c
#include <stdbool.h>

// Feature flag for new implementation
#ifndef USE_NEW_PARSER
    #define USE_NEW_PARSER 0
#endif

int parse_config(const char *filename) {
#if USE_NEW_PARSER
    // New, improved parser
    return parse_config_new(filename);
#else
    // Old parser (default for now)
    return parse_config_legacy(filename);
#endif
}

// Can be enabled with: -DUSE_NEW_PARSER=1
```

### ✅ Example 6: Adapter Pattern for API Migration

```c
// Old API that external code depends on
typedef struct {
    void (*callback)(int status);
    void *user_data;
} OldCallback;

// New API with better design
typedef struct {
    void (*callback)(int status, const char *message, void *user_data);
    void *user_data;
} NewCallback;

// Adapter to bridge old and new APIs
static void callback_adapter(int status, const char *message, void *user_data) {
    OldCallback *old_cb = (OldCallback*)user_data;
    
    // Call old callback (ignoring new message parameter)
    if (old_cb && old_cb->callback) {
        old_cb->callback(status);
    }
}

// Old function - wraps new implementation
void register_callback_old(OldCallback *cb) {
    NewCallback new_cb;
    
    new_cb.callback = callback_adapter;
    new_cb.user_data = cb;
    
    register_callback_new(&new_cb);
}

// New function
void register_callback_new(NewCallback *cb) {
    // New implementation
}
```

### ✅ Example 7: Safe Refactoring with Tests

```c
#include <assert.h>
#include <string.h>

// Original implementation (legacy)
int legacy_string_copy(char *dest, const char *src, int max_len) {
    int i;
    for (i = 0; i < max_len - 1 && src[i] != '\0'; i++) {
        dest[i] = src[i];
    }
    dest[i] = '\0';
    return i;
}

// Refactored implementation (safer, clearer)
int refactored_string_copy(char *dest, const char *src, int max_len) {
    if (dest == NULL || src == NULL || max_len <= 0) {
        return -1;
    }

    size_t src_len = strlen(src);
    size_t copy_len = (src_len >= (size_t)(max_len - 1)) ?
                      (size_t)(max_len - 1) : src_len;

    memcpy(dest, src, copy_len);
    dest[copy_len] = '\0';

    return (int)copy_len;
}

// Test to verify behavior is preserved
void test_string_copy_compatibility(void) {
    char buf1[32], buf2[32];
    const char *test = "Hello, World!";
    int len1, len2;

    len1 = legacy_string_copy(buf1, test, sizeof(buf1));
    len2 = refactored_string_copy(buf2, test, sizeof(buf2));

    assert(len1 == len2);
    assert(strcmp(buf1, buf2) == 0);
}
```

### ✅ Example 8: Platform Compatibility Macros

```c
// Handle platform differences
#ifdef _WIN32
    #include <windows.h>
    #define SLEEP_MS(ms) Sleep(ms)
    #define PATH_SEPARATOR '\\'
    typedef HANDLE thread_handle_t;
#else
    #include <unistd.h>
    #define SLEEP_MS(ms) usleep((ms) * 1000)
    #define PATH_SEPARATOR '/'
    typedef pthread_t thread_handle_t;
#endif

// Cross-platform sleep function
void portable_sleep(unsigned int milliseconds) {
    SLEEP_MS(milliseconds);
}

// Cross-platform path handling
void normalize_path(char *path) {
    char *p = path;
    while (*p) {
        if (*p == '/' || *p == '\\') {
            *p = PATH_SEPARATOR;
        }
        p++;
    }
}
```

### ✅ Example 9: Maintaining Multiple C Standard Support

```c
#include <stddef.h>

// C99 and later have inline keyword
#if defined(__STDC_VERSION__) && __STDC_VERSION__ >= 199901L
    #define INLINE inline
#elif defined(__GNUC__)
    #define INLINE __inline__
#elif defined(_MSC_VER)
    #define INLINE __inline
#else
    #define INLINE
#endif

// C99 and later have restrict keyword
#if defined(__STDC_VERSION__) && __STDC_VERSION__ >= 199901L
    #define RESTRICT restrict
#elif defined(__GNUC__)
    #define RESTRICT __restrict__
#elif defined(_MSC_VER)
    #define RESTRICT __restrict
#else
    #define RESTRICT
#endif

// Use the compatibility macros
INLINE void fast_copy(void *RESTRICT dest, const void *RESTRICT src, size_t n) {
    memcpy(dest, src, n);
}
```

### ✅ Example 10: Logging Deprecation Warnings

```c
#include <stdio.h>
#include <time.h>

static int deprecation_warning_shown = 0;

void log_deprecation_warning(const char *old_func, const char *new_func) {
    if (!deprecation_warning_shown) {
        time_t now = time(NULL);
        fprintf(stderr, "[%s] DEPRECATION WARNING: %s() is deprecated. "
                        "Use %s() instead.\n",
                ctime(&now), old_func, new_func);
        deprecation_warning_shown = 1;
    }
}

// Deprecated function with runtime warning
int old_api_function(int value) {
    log_deprecation_warning("old_api_function", "new_api_function");
    return new_api_function(value, 0);  // Call new API with default
}

int new_api_function(int value, int flags) {
    // New implementation
    return value * 2;
}
```

### ✅ Example 11: Incremental Refactoring Strategy

```c
// Step 1: Extract function (no behavior change)
static int validate_input(const char *input) {
    if (input == NULL || input[0] == '\0') {
        return 0;
    }
    return 1;
}

static int process_valid_input(const char *input) {
    // Original processing logic
    return strlen(input);
}

// Step 2: Refactor original function to use extracted functions
int legacy_process(const char *input) {
    // Before: all logic was inline
    // After: delegated to smaller functions
    if (!validate_input(input)) {
        return -1;
    }
    return process_valid_input(input);
}

// Step 3: Can now test validate_input and process_valid_input separately
// Step 4: Can replace implementations incrementally
```

### ✅ Example 12: Migration Documentation

```c
/**
 * @file legacy_api.h
 * @brief Legacy API - Maintained for backward compatibility
 *
 * MIGRATION GUIDE:
 *
 * Old API                    | New API                      | Notes
 * ---------------------------|------------------------------|------------------
 * init_system()              | system_init_v2()             | Added error codes
 * process_data(data)         | process_data_ex(data, len)   | Added length param
 * get_status()               | get_status_detailed()        | More information
 *
 * DEPRECATION TIMELINE:
 * - v2.0 (2024-01): Old API marked deprecated
 * - v2.5 (2024-06): Deprecation warnings added
 * - v3.0 (2025-01): Old API removed
 *
 * COMPATIBILITY:
 * - Supports C89, C99, C11, C17
 * - Tested on: Linux, Windows, macOS
 * - Minimum versions: GCC 4.8, Clang 3.5, MSVC 2015
 */

// Example of well-documented legacy function
/**
 * @deprecated Use system_init_v2() instead
 * @brief Initialize system (legacy version)
 * @return 0 on success, -1 on error
 *
 * This function is maintained for backward compatibility only.
 * New code should use system_init_v2() which provides better
 * error reporting and resource management.
 *
 * Will be removed in version 3.0 (January 2025).
 */
int init_system(void) {
    int result;
    log_deprecation_warning("init_system", "system_init_v2");

    result = system_init_v2();
    return (result == 0) ? 0 : -1;  // Convert new error codes to old format
}

/**
 * @brief Initialize system (current version)
 * @return 0 on success, negative error code on failure
 *
 * Error codes:
 * - 0: Success
 * - -1: Invalid configuration
 * - -2: Resource allocation failed
 * - -3: Hardware initialization failed
 */
int system_init_v2(void) {
    // New implementation with detailed error codes
    return 0;
}
```

## References

- "Working Effectively with Legacy Code" by Michael Feathers
- "Refactoring: Improving the Design of Existing Code" by Martin Fowler
- "Code Complete" by Steve McConnell
- C Portability Guide
- GNU Coding Standards

## Related Rules

- universal-documentation
- universal-error-handling
- category-systems

## Configuration

Enable in `.augment/c-standards.json`:

```json
{
  "categories": ["legacy"],
  "category_overrides": {
    "legacy": {
      "allow_deprecated_apis": true,
      "require_migration_docs": true,
      "enforce_compatibility_tests": true,
      "min_c_standard": "c89"
    }
  }
}
```

