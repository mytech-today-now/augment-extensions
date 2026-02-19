/**
 * @file compatibility-layer.c
 * @brief Example compatibility layer for cross-platform and cross-standard code
 * 
 * This example demonstrates:
 * - Platform abstraction
 * - C standard compatibility
 * - Compiler-specific workarounds
 * - Feature detection
 * - Graceful degradation
 * 
 * Compile: gcc -Wall -Wextra -std=c11 -o compat compatibility-layer.c
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/**
 * SECTION 1: Compiler Detection
 */

#if defined(__GNUC__)
    #define COMPILER_GCC 1
    #define COMPILER_NAME "GCC"
#elif defined(_MSC_VER)
    #define COMPILER_MSVC 1
    #define COMPILER_NAME "MSVC"
#elif defined(__clang__)
    #define COMPILER_CLANG 1
    #define COMPILER_NAME "Clang"
#else
    #define COMPILER_UNKNOWN 1
    #define COMPILER_NAME "Unknown"
#endif

/**
 * SECTION 2: Platform Detection
 */

#if defined(_WIN32) || defined(_WIN64)
    #define PLATFORM_WINDOWS 1
    #define PLATFORM_NAME "Windows"
#elif defined(__linux__)
    #define PLATFORM_LINUX 1
    #define PLATFORM_NAME "Linux"
#elif defined(__APPLE__)
    #define PLATFORM_MACOS 1
    #define PLATFORM_NAME "macOS"
#else
    #define PLATFORM_UNKNOWN 1
    #define PLATFORM_NAME "Unknown"
#endif

/**
 * SECTION 3: C Standard Detection
 */

#if __STDC_VERSION__ >= 201112L
    #define C_STANDARD_C11 1
    #define C_STANDARD_NAME "C11"
#elif __STDC_VERSION__ >= 199901L
    #define C_STANDARD_C99 1
    #define C_STANDARD_NAME "C99"
#else
    #define C_STANDARD_C89 1
    #define C_STANDARD_NAME "C89"
#endif

/**
 * SECTION 4: Feature Compatibility Macros
 */

/* Inline keyword */
#if defined(C_STANDARD_C99) || defined(C_STANDARD_C11)
    #define COMPAT_INLINE inline
#elif defined(COMPILER_GCC) || defined(COMPILER_CLANG)
    #define COMPAT_INLINE __inline__
#elif defined(COMPILER_MSVC)
    #define COMPAT_INLINE __inline
#else
    #define COMPAT_INLINE
#endif

/* Restrict keyword */
#if defined(C_STANDARD_C99) || defined(C_STANDARD_C11)
    #define COMPAT_RESTRICT restrict
#elif defined(COMPILER_GCC) || defined(COMPILER_CLANG)
    #define COMPAT_RESTRICT __restrict__
#elif defined(COMPILER_MSVC)
    #define COMPAT_RESTRICT __restrict
#else
    #define COMPAT_RESTRICT
#endif

/* Function attributes */
#if defined(COMPILER_GCC) || defined(COMPILER_CLANG)
    #define COMPAT_NORETURN __attribute__((noreturn))
    #define COMPAT_UNUSED __attribute__((unused))
    #define COMPAT_PRINTF_FORMAT(fmt, args) __attribute__((format(printf, fmt, args)))
#elif defined(COMPILER_MSVC)
    #define COMPAT_NORETURN __declspec(noreturn)
    #define COMPAT_UNUSED
    #define COMPAT_PRINTF_FORMAT(fmt, args)
#else
    #define COMPAT_NORETURN
    #define COMPAT_UNUSED
    #define COMPAT_PRINTF_FORMAT(fmt, args)
#endif

/* Static assertion */
#if defined(C_STANDARD_C11)
    #define COMPAT_STATIC_ASSERT(cond, msg) _Static_assert(cond, msg)
#elif defined(COMPILER_GCC) && __GNUC__ >= 4
    #define COMPAT_STATIC_ASSERT(cond, msg) \
        typedef char static_assertion_##__LINE__[(cond) ? 1 : -1]
#else
    #define COMPAT_STATIC_ASSERT(cond, msg)
#endif

/**
 * SECTION 5: Type Compatibility
 */

#if defined(C_STANDARD_C99) || defined(C_STANDARD_C11)
    #include <stdint.h>
    #include <stdbool.h>
#else
    /* Provide stdint types for C89 */
    typedef unsigned char uint8_t;
    typedef unsigned short uint16_t;
    typedef unsigned int uint32_t;
    typedef signed char int8_t;
    typedef short int16_t;
    typedef int int32_t;
    
    /* Provide bool for C89 */
    typedef int bool;
    #define true 1
    #define false 0
#endif

/**
 * SECTION 6: Platform-Specific Functions
 */

#ifdef PLATFORM_WINDOWS
    #include <windows.h>
    
    static COMPAT_INLINE void compat_sleep_ms(unsigned int ms) {
        Sleep(ms);
    }
#else
    #include <unistd.h>
    
    static COMPAT_INLINE void compat_sleep_ms(unsigned int ms) {
        usleep(ms * 1000);
    }
#endif

/**
 * SECTION 7: Safe String Functions
 */

/* Safe string copy (compatible with all platforms) */
static COMPAT_INLINE size_t compat_strlcpy(char *dst, const char *src, size_t size) {
    size_t src_len = strlen(src);
    
    if (size > 0) {
        size_t copy_len = (src_len >= size) ? size - 1 : src_len;
        memcpy(dst, src, copy_len);
        dst[copy_len] = '\0';
    }
    
    return src_len;
}

/**
 * SECTION 8: Example Usage
 */

/* Example function with compatibility features */
static COMPAT_INLINE int compat_add(int a, int b) {
    return a + b;
}

/* Example function with printf format checking */
static void COMPAT_PRINTF_FORMAT(1, 2) compat_log(const char *format, ...) {
    va_list args;
    va_start(args, format);
    vprintf(format, args);
    va_end(args);
}

/* Example noreturn function */
static COMPAT_NORETURN void compat_fatal_error(const char *msg) {
    fprintf(stderr, "FATAL ERROR: %s\n", msg);
    exit(EXIT_FAILURE);
}

/**
 * SECTION 9: Compile-Time Checks
 */

/* Verify type sizes */
COMPAT_STATIC_ASSERT(sizeof(uint8_t) == 1, "uint8_t must be 1 byte");
COMPAT_STATIC_ASSERT(sizeof(uint16_t) == 2, "uint16_t must be 2 bytes");
COMPAT_STATIC_ASSERT(sizeof(uint32_t) == 4, "uint32_t must be 4 bytes");

/**
 * Main function
 */
int main(void) {
    printf("=== Compatibility Layer Example ===\n\n");
    
    printf("Compiler: %s\n", COMPILER_NAME);
    printf("Platform: %s\n", PLATFORM_NAME);
    printf("C Standard: %s\n", C_STANDARD_NAME);
    printf("\n");
    
    /* Test compatibility functions */
    printf("Testing compat_add: %d\n", compat_add(10, 20));
    
    /* Test safe string copy */
    char buffer[10];
    compat_strlcpy(buffer, "Hello, World!", sizeof(buffer));
    printf("Truncated string: %s\n", buffer);
    
    /* Test platform sleep */
    printf("Sleeping for 100ms...\n");
    compat_sleep_ms(100);
    printf("Done!\n");
    
    /* Test logging */
    compat_log("Log message: %d + %d = %d\n", 5, 3, 5 + 3);
    
    return EXIT_SUCCESS;
}

