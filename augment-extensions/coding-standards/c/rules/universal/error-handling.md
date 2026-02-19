# Rule: Error Handling

## Metadata
- **ID**: universal-error-handling
- **Category**: universal
- **Severity**: ERROR
- **Standard**: POSIX, CERT C
- **Version**: 1.0.0

## Description
Always check return values from functions, use errno appropriately, implement proper error propagation patterns, and ensure cleanup on error paths.

## Rationale
Unchecked errors lead to undefined behavior, security vulnerabilities, and difficult-to-debug issues. Proper error handling makes code robust, maintainable, and secure.

## Applies To
- C Standards: c89, c99, c11, c17, c23
- Categories: all

## Rule Details

### 1. Return Value Checking
- Check return values from all functions that can fail
- Never ignore return values (use `(void)` cast if intentional)
- System calls, library functions, and custom functions

### 2. errno Usage
- Check `errno` after functions that set it
- Save and restore `errno` in signal handlers
- Clear `errno` before operations that may set it

### 3. Error Propagation
- Propagate errors up the call stack
- Use consistent error codes or return values
- Provide context with error messages

### 4. Cleanup on Error Paths
- Free allocated resources on all error paths
- Use goto for centralized cleanup
- Ensure consistent state on error

## Examples

### ✅ Good Example 1: System Call Error Checking

```c
#include <stdio.h>
#include <errno.h>
#include <string.h>

int read_file(const char* filename, char* buffer, size_t size) {
    FILE* file = fopen(filename, "r");
    if (file == NULL) {
        fprintf(stderr, "Failed to open %s: %s\n", filename, strerror(errno));
        return -1;
    }
    
    size_t bytes_read = fread(buffer, 1, size - 1, file);
    if (ferror(file)) {
        fprintf(stderr, "Error reading %s: %s\n", filename, strerror(errno));
        fclose(file);
        return -1;
    }
    
    buffer[bytes_read] = '\0';
    fclose(file);
    return 0;
}
```

### ✅ Good Example 2: Error Propagation with Cleanup

```c
#include <stdlib.h>
#include <string.h>

typedef struct {
    char* name;
    int* data;
} Resource;

int initialize_resource(Resource* res, const char* name, size_t data_size) {
    int result = 0;
    
    if (res == NULL || name == NULL) {
        return -1;
    }
    
    res->name = strdup(name);
    if (res->name == NULL) {
        result = -1;
        goto cleanup;
    }
    
    res->data = malloc(data_size * sizeof(int));
    if (res->data == NULL) {
        result = -1;
        goto cleanup;
    }
    
    memset(res->data, 0, data_size * sizeof(int));
    return 0;

cleanup:
    if (res->name != NULL) {
        free(res->name);
        res->name = NULL;
    }
    if (res->data != NULL) {
        free(res->data);
        res->data = NULL;
    }
    return result;
}
```

### ✅ Good Example 3: errno Handling

```c
#include <errno.h>
#include <unistd.h>
#include <stdio.h>

ssize_t safe_write(int fd, const void* buf, size_t count) {
    ssize_t written = 0;
    ssize_t result;
    
    while (written < count) {
        errno = 0; // Clear before operation
        result = write(fd, (char*)buf + written, count - written);
        
        if (result < 0) {
            if (errno == EINTR) {
                continue; // Interrupted, retry
            }
            perror("write failed");
            return -1;
        }
        
        written += result;
    }
    
    return written;
}
```

### ✅ Good Example 4: Multiple Error Paths

```c
int process_data(const char* input_file, const char* output_file) {
    FILE* in = NULL;
    FILE* out = NULL;
    char* buffer = NULL;
    int result = -1;
    
    in = fopen(input_file, "r");
    if (in == NULL) {
        fprintf(stderr, "Cannot open input: %s\n", strerror(errno));
        goto cleanup;
    }
    
    out = fopen(output_file, "w");
    if (out == NULL) {
        fprintf(stderr, "Cannot open output: %s\n", strerror(errno));
        goto cleanup;
    }
    
    buffer = malloc(4096);
    if (buffer == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        goto cleanup;
    }
    
    // Process data...
    result = 0; // Success
    
cleanup:
    if (buffer != NULL) free(buffer);
    if (out != NULL) fclose(out);
    if (in != NULL) fclose(in);
    return result;
}
```

### ❌ Bad Example 1: Ignoring Return Values

```c
void bad_file_handling(const char* filename) {
    FILE* file = fopen(filename, "r");
    // No null check!
    
    char buffer[100];
    fread(buffer, 1, 100, file); // Ignoring return value
    // No error checking!
    
    fclose(file);
}
```

### ❌ Bad Example 2: No Error Propagation

```c
int bad_allocation(void) {
    char* data = malloc(1024);
    // No null check, no error return
    strcpy(data, "test"); // Crash if malloc failed
    return 0; // Always returns success!
}
```

### ❌ Bad Example 3: Missing Cleanup

```c
int bad_cleanup(const char* file) {
    char* buffer = malloc(1024);
    FILE* f = fopen(file, "r");
    
    if (f == NULL) {
        return -1; // Memory leak! buffer not freed
    }
    
    // ... use buffer and file ...
    
    fclose(f);
    free(buffer);
    return 0;
}
```

## Error Code Conventions

```c
// Use negative values for errors, 0 for success
#define SUCCESS 0
#define ERR_INVALID_PARAM -1
#define ERR_NO_MEMORY -2
#define ERR_IO_ERROR -3
```

## References

- [CERT C - ERR33-C](https://wiki.sei.cmu.edu/confluence/display/c/ERR33-C.+Detect+and+handle+standard+library+errors)
- [POSIX Error Handling](https://pubs.opengroup.org/onlinepubs/9699919799/)
- [Linux errno man page](https://man7.org/linux/man-pages/man3/errno.3.html)

## Related Rules

- `universal-memory-safety` - Error handling for allocations
- `category-systems` - POSIX error handling patterns

