# Rule: Memory Safety

## Metadata
- **ID**: universal-memory-safety
- **Category**: universal
- **Severity**: ERROR
- **Standard**: CERT C, MISRA C
- **Version**: 1.0.0

## Description
Ensure proper memory management through correct allocation/deallocation pairing, bounds checking, null pointer validation, and use-after-free prevention.

## Rationale
Memory safety violations are the leading cause of security vulnerabilities and crashes in C programs. Proper memory management prevents buffer overflows, memory leaks, use-after-free bugs, and null pointer dereferences.

## Applies To
- C Standards: c89, c99, c11, c17, c23
- Categories: all

## Rule Details

### 1. Allocation and Deallocation Pairing
- Every `malloc()`, `calloc()`, `realloc()` must have a corresponding `free()`
- Set pointers to NULL after freeing
- Use RAII-like patterns with cleanup functions

### 2. Bounds Checking
- Always validate array indices before access
- Use `sizeof()` for buffer size calculations
- Prefer safe string functions (`strncpy`, `snprintf`)

### 3. Null Pointer Validation
- Check return values from allocation functions
- Validate pointers before dereferencing
- Handle allocation failures gracefully

### 4. Use-After-Free Prevention
- Set pointers to NULL after freeing
- Avoid dangling pointers
- Use ownership patterns to clarify lifetime

## Examples

### ✅ Good Example 1: Proper Allocation and Deallocation

```c
#include <stdlib.h>
#include <string.h>

char* create_user_name(const char* first, const char* last) {
    if (first == NULL || last == NULL) {
        return NULL;
    }
    
    size_t len = strlen(first) + strlen(last) + 2; // +1 for space, +1 for null
    char* full_name = malloc(len);
    
    if (full_name == NULL) {
        return NULL; // Allocation failed
    }
    
    snprintf(full_name, len, "%s %s", first, last);
    return full_name;
}

void process_user(void) {
    char* name = create_user_name("John", "Doe");
    
    if (name != NULL) {
        printf("User: %s\n", name);
        free(name);
        name = NULL; // Prevent use-after-free
    }
}
```

### ✅ Good Example 2: Bounds Checking

```c
#include <string.h>

#define MAX_BUFFER 256

int safe_copy(char* dest, const char* src, size_t dest_size) {
    if (dest == NULL || src == NULL || dest_size == 0) {
        return -1;
    }
    
    size_t src_len = strlen(src);
    if (src_len >= dest_size) {
        return -1; // Source too large
    }
    
    strncpy(dest, src, dest_size - 1);
    dest[dest_size - 1] = '\0'; // Ensure null termination
    
    return 0;
}
```

### ✅ Good Example 3: Array Bounds Validation

```c
#define ARRAY_SIZE 100

int get_element(const int* array, size_t array_len, size_t index, int* out) {
    if (array == NULL || out == NULL) {
        return -1;
    }
    
    if (index >= array_len) {
        return -1; // Out of bounds
    }
    
    *out = array[index];
    return 0;
}
```

### ✅ Good Example 4: Cleanup Pattern

```c
typedef struct {
    char* name;
    int* data;
    size_t data_len;
} Resource;

Resource* resource_create(const char* name, size_t data_len) {
    Resource* res = calloc(1, sizeof(Resource));
    if (res == NULL) {
        return NULL;
    }
    
    res->name = strdup(name);
    if (res->name == NULL) {
        free(res);
        return NULL;
    }
    
    res->data = calloc(data_len, sizeof(int));
    if (res->data == NULL) {
        free(res->name);
        free(res);
        return NULL;
    }
    
    res->data_len = data_len;
    return res;
}

void resource_destroy(Resource** res) {
    if (res == NULL || *res == NULL) {
        return;
    }
    
    free((*res)->name);
    free((*res)->data);
    free(*res);
    *res = NULL; // Prevent use-after-free
}
```

### ❌ Bad Example 1: Memory Leak

```c
void process_data(void) {
    char* buffer = malloc(1024);
    // ... use buffer ...
    // Missing free() - memory leak!
}
```

### ❌ Bad Example 2: Use-After-Free

```c
void dangerous_code(void) {
    int* data = malloc(sizeof(int) * 10);
    free(data);
    data[0] = 42; // Use-after-free!
}
```

### ❌ Bad Example 3: Buffer Overflow

```c
void unsafe_copy(char* dest) {
    char* src = "This is a very long string that will overflow";
    strcpy(dest, src); // No bounds checking!
}
```

### ❌ Bad Example 4: Null Pointer Dereference

```c
void crash_prone(void) {
    int* ptr = malloc(sizeof(int));
    // No null check!
    *ptr = 42; // Crash if malloc failed
}
```

## Static Analysis Tools

### Valgrind
```bash
valgrind --leak-check=full --show-leak-kinds=all ./program
```

### AddressSanitizer (ASan)
```bash
gcc -fsanitize=address -g program.c -o program
./program
```

### Clang Static Analyzer
```bash
clang --analyze program.c
```

## References

- [CERT C - MEM30-C](https://wiki.sei.cmu.edu/confluence/display/c/MEM30-C.+Do+not+access+freed+memory)
- [CERT C - MEM31-C](https://wiki.sei.cmu.edu/confluence/display/c/MEM31-C.+Free+dynamically+allocated+memory+when+no+longer+needed)
- [MISRA C:2012 Rule 22.1](https://www.misra.org.uk/)
- [CWE-119: Buffer Overflow](https://cwe.mitre.org/data/definitions/119.html)
- [CWE-416: Use After Free](https://cwe.mitre.org/data/definitions/416.html)

## Related Rules

- `universal-error-handling` - Check allocation return values
- `category-embedded` - No dynamic allocation in embedded systems

