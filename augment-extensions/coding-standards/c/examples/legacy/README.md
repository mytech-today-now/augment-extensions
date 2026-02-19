# Legacy Code Maintenance Examples

This directory contains examples for maintaining and modernizing legacy C code.

## Examples

### 1. c89-to-c11-migration.c
Demonstrates migration from C89 to C11:
- Variable declaration improvements
- Designated initializers
- Static assertions
- Flexible array members
- Inline functions
- Anonymous unions/structs

**Key Concepts:**
- Compile with both standards to verify compatibility
- Use conditional compilation for gradual migration
- Leverage C11 features for cleaner code
- Maintain backward compatibility when needed

### 2. compatibility-layer.c
Cross-platform and cross-standard compatibility:
- Compiler detection
- Platform detection
- C standard detection
- Feature compatibility macros
- Safe string functions
- Platform-specific abstractions

**Key Concepts:**
- Abstract platform differences
- Provide fallbacks for missing features
- Use feature detection over version checks
- Create consistent API across platforms

## Building

```bash
# Build all examples
make

# Build specific versions
make migration-c89    # C89 version
make migration-c11    # C11 version
make compatibility    # Compatibility layer

# Clean
make clean

# Run tests
make test

# Compare C89 vs C11 output
make compare
```

## Migration Strategy

### Phase 1: Assessment
1. Identify C standard currently used
2. Check compiler compatibility
3. Review platform dependencies
4. List deprecated features

### Phase 2: Preparation
1. Add compatibility layer
2. Create test suite
3. Document platform-specific code
4. Set up build for multiple standards

### Phase 3: Gradual Migration
1. Start with isolated modules
2. Use conditional compilation
3. Test thoroughly at each step
4. Update documentation

### Phase 4: Modernization
1. Adopt C11 features
2. Remove workarounds
3. Improve type safety
4. Enhance error handling

## C89 to C11 Feature Comparison

### Variable Declarations

**C89:**
```c
void func(void) {
    int i;
    int sum = 0;
    
    for (i = 0; i < 10; i++) {
        sum += i;
    }
}
```

**C11:**
```c
void func(void) {
    int sum = 0;
    
    for (int i = 0; i < 10; i++) {
        sum += i;
    }
}
```

### Designated Initializers

**C89:**
```c
struct Point p = {10, 20, 30};  /* Must be in order */
```

**C11:**
```c
struct Point p = {.x = 10, .z = 30, .y = 20};  /* Any order */
```

### Static Assertions

**C89:**
```c
/* Runtime check only */
if (sizeof(int) != 4) {
    abort();
}
```

**C11:**
```c
/* Compile-time check */
_Static_assert(sizeof(int) == 4, "int must be 4 bytes");
```

### Inline Functions

**C89:**
```c
#define MAX(a, b) ((a) > (b) ? (a) : (b))  /* Macro */
```

**C11:**
```c
static inline int max(int a, int b) {  /* Type-safe */
    return a > b ? a : b;
}
```

## Compatibility Patterns

### 1. Feature Detection

```c
#if __STDC_VERSION__ >= 201112L
    /* C11 code */
#elif __STDC_VERSION__ >= 199901L
    /* C99 code */
#else
    /* C89 code */
#endif
```

### 2. Compiler-Specific Features

```c
#if defined(__GNUC__)
    #define INLINE __inline__
#elif defined(_MSC_VER)
    #define INLINE __inline
#else
    #define INLINE
#endif
```

### 3. Platform Abstraction

```c
#ifdef _WIN32
    #include <windows.h>
    #define sleep_ms(ms) Sleep(ms)
#else
    #include <unistd.h>
    #define sleep_ms(ms) usleep((ms) * 1000)
#endif
```

## Best Practices

1. **Maintain Compatibility**
   - Support multiple C standards
   - Test on all target platforms
   - Provide fallbacks for missing features
   - Document requirements

2. **Gradual Migration**
   - Migrate one module at a time
   - Keep old and new code working
   - Use feature flags
   - Extensive testing

3. **Documentation**
   - Document platform differences
   - Note compiler requirements
   - Explain workarounds
   - Provide migration guide

4. **Testing**
   - Test on all platforms
   - Test with different compilers
   - Test different C standards
   - Regression testing

## Common Pitfalls

1. **Assuming C99/C11 Features**
   ```c
   // WRONG - Not available in C89
   for (int i = 0; i < 10; i++) { }
   
   // CORRECT - Compatible with C89
   int i;
   for (i = 0; i < 10; i++) { }
   ```

2. **Platform-Specific Code**
   ```c
   // WRONG - Windows-only
   Sleep(1000);
   
   // CORRECT - Abstracted
   compat_sleep_ms(1000);
   ```

3. **Compiler Extensions**
   ```c
   // WRONG - GCC-specific
   int array[n];  /* VLA */
   
   // CORRECT - Standard C
   int *array = malloc(n * sizeof(int));
   ```

## References

- ISO/IEC 9899:1990 (C89/C90)
- ISO/IEC 9899:1999 (C99)
- ISO/IEC 9899:2011 (C11)
- "C Programming: A Modern Approach" by K. N. King
- GCC Compatibility: https://gcc.gnu.org/
- MSVC Compatibility: https://docs.microsoft.com/en-us/cpp/

