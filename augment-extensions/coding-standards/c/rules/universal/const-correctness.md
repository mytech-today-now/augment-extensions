# Rule: Const Correctness

## Metadata
- **ID**: universal-const-correctness
- **Category**: universal
- **Severity**: WARNING
- **Standard**: C Standards, Best Practices
- **Version**: 1.0.0

## Description
Use `const` qualifier for read-only data, const pointers, and const function parameters to prevent unintended modifications and enable compiler optimizations.

## Rationale
Const correctness:
- Prevents accidental modifications of data
- Documents intent and contracts in code
- Enables compiler optimizations
- Catches bugs at compile time
- Improves code safety and maintainability

## Applies To
- C Standards: c89, c99, c11, c17, c23
- Categories: all

## Rule Details

### 1. Const Function Parameters
- Use `const` for parameters that won't be modified
- Especially important for pointer parameters
- Helps prevent accidental modifications

### 2. Const Pointers
- `const int*` - pointer to const int (can't modify data)
- `int* const` - const pointer to int (can't modify pointer)
- `const int* const` - const pointer to const int (can't modify either)

### 3. Const Return Values
- Return `const` pointers for read-only data
- Prevents caller from modifying internal state

### 4. Const Global/Static Data
- Use `const` for constants and lookup tables
- May be placed in read-only memory (ROM)

## Examples

### ✅ Good Example 1: Const Function Parameters

```c
#include <string.h>

/**
 * @brief Calculates the length of a string
 * @param str String to measure (not modified)
 * @return Length of the string
 */
size_t string_length(const char* str) {
    if (str == NULL) {
        return 0;
    }
    
    size_t len = 0;
    while (str[len] != '\0') {
        len++;
    }
    return len;
}

/**
 * @brief Copies a string to a buffer
 * @param dest Destination buffer (modified)
 * @param src Source string (not modified)
 * @param size Size of destination buffer
 */
void safe_string_copy(char* dest, const char* src, size_t size) {
    if (dest == NULL || src == NULL || size == 0) {
        return;
    }
    
    strncpy(dest, src, size - 1);
    dest[size - 1] = '\0';
}
```

### ✅ Good Example 2: Const Pointers

```c
/**
 * @brief Finds the maximum value in an array
 * @param arr Array to search (not modified)
 * @param len Length of array
 * @return Pointer to maximum element
 */
const int* find_max(const int* arr, size_t len) {
    if (arr == NULL || len == 0) {
        return NULL;
    }
    
    const int* max = &arr[0];
    for (size_t i = 1; i < len; i++) {
        if (arr[i] > *max) {
            max = &arr[i];
        }
    }
    return max;
}

/**
 * @brief Processes data with a fixed configuration
 * @param config Configuration pointer (cannot be changed)
 * @param data Data to process
 */
void process_with_config(const Config* const config, Data* data) {
    // config pointer cannot be changed
    // config contents cannot be modified
    // data can be modified
    
    if (config->enable_feature_x) {
        data->value *= config->multiplier;
    }
}
```

### ✅ Good Example 3: Const Global Data

```c
// Lookup table in read-only memory
const int FIBONACCI_TABLE[] = {
    0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144
};

const size_t FIBONACCI_TABLE_SIZE = sizeof(FIBONACCI_TABLE) / sizeof(FIBONACCI_TABLE[0]);

// Configuration constants
const char* const DEFAULT_CONFIG_PATH = "/etc/myapp/config.conf";
const int DEFAULT_PORT = 8080;
const double PI = 3.14159265359;
```

### ✅ Good Example 4: Const in Structs

```c
typedef struct {
    const char* name;        // Pointer to const string
    int id;                  // Mutable field
    const int max_size;      // Immutable field
} Config;

/**
 * @brief Initializes a configuration
 * @param cfg Configuration to initialize
 * @param name Configuration name (must remain valid)
 * @param id Configuration ID
 */
void init_config(Config* cfg, const char* name, int id) {
    // Cast away const for initialization (use carefully!)
    *(int*)&cfg->max_size = 1024;
    cfg->name = name;
    cfg->id = id;
}
```

### ✅ Good Example 5: Const with Arrays

```c
/**
 * @brief Prints an array of integers
 * @param arr Array to print (not modified)
 * @param len Length of array
 */
void print_array(const int arr[], size_t len) {
    printf("[");
    for (size_t i = 0; i < len; i++) {
        printf("%d", arr[i]);
        if (i < len - 1) {
            printf(", ");
        }
    }
    printf("]\n");
}
```

### ❌ Bad Example 1: Missing Const on Read-Only Parameters

```c
// Should be const char*
int string_compare(char* s1, char* s2) {
    // Function doesn't modify s1 or s2, but const is missing
    return strcmp(s1, s2);
}
```

### ❌ Bad Example 2: Modifying Const Data

```c
void bad_function(const int* data) {
    // Compiler error: assignment of read-only location
    *data = 42;
}
```

### ❌ Bad Example 3: Casting Away Const Unsafely

```c
void dangerous_function(const char* str) {
    // Dangerous: casting away const
    char* mutable_str = (char*)str;
    mutable_str[0] = 'X'; // Undefined behavior if str is in read-only memory!
}
```

### ❌ Bad Example 4: Non-Const Global Mutable Data

```c
// Should be const
char* error_messages[] = {
    "Success",
    "Error",
    "Warning"
};
```

## Const Pointer Cheat Sheet

```c
int value = 42;

// Pointer to const int - can't modify value through pointer
const int* ptr1 = &value;
int const* ptr2 = &value;  // Same as above
// *ptr1 = 10;  // Error!
// ptr1 = &other;  // OK

// Const pointer to int - can't modify pointer
int* const ptr3 = &value;
// *ptr3 = 10;  // OK
// ptr3 = &other;  // Error!

// Const pointer to const int - can't modify either
const int* const ptr4 = &value;
// *ptr4 = 10;  // Error!
// ptr4 = &other;  // Error!
```

## Reading Const Declarations

**Rule**: Read from right to left

```c
const int* ptr;           // ptr is a pointer to a const int
int const* ptr;           // ptr is a pointer to a const int (same)
int* const ptr;           // ptr is a const pointer to an int
const int* const ptr;     // ptr is a const pointer to a const int
```

## Benefits

1. **Compiler Optimization**: Const data can be placed in ROM or optimized
2. **Thread Safety**: Const data is inherently thread-safe for reading
3. **API Contracts**: Documents that function won't modify data
4. **Bug Prevention**: Catches accidental modifications at compile time
5. **Self-Documenting**: Makes code intent clear

## References

- [C Standard - 6.7.3 Type qualifiers](https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf)
- [CERT C - DCL00-C](https://wiki.sei.cmu.edu/confluence/display/c/DCL00-C.+Const-qualify+immutable+objects)
- [Const Correctness - C FAQ](https://c-faq.com/ansi/constmismatch.html)

## Related Rules

- `universal-naming` - Const naming conventions (UPPER_CASE for const globals)
- `universal-memory-safety` - Const helps prevent buffer modifications
- `category-embedded` - Const data in ROM for embedded systems

