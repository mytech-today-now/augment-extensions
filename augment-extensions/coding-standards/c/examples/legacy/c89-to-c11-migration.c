/**
 * @file c89-to-c11-migration.c
 * @brief Example demonstrating C89 to C11 migration patterns
 * 
 * This file shows before/after examples of migrating legacy C89 code
 * to modern C11 standards while maintaining compatibility.
 * 
 * Compile C89: gcc -std=c89 -DUSE_C89 -o legacy c89-to-c11-migration.c
 * Compile C11: gcc -std=c11 -o modern c89-to-c11-migration.c
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef USE_C89
/* C89 version */

#include <stddef.h>

/* C89: No inline keyword */
#define INLINE

/* C89: No bool type */
typedef int bool;
#define true 1
#define false 0

/* C89: No restrict keyword */
#define restrict

/* C89: No stdint.h */
typedef unsigned char uint8_t;
typedef unsigned short uint16_t;
typedef unsigned int uint32_t;

#else
/* C11 version */

#include <stdint.h>
#include <stdbool.h>

#define INLINE inline

#endif

/**
 * EXAMPLE 1: Variable Declarations
 */

void example_variable_declarations(void) {
#ifdef USE_C89
    /* C89: All declarations at start of block */
    int i;
    int sum = 0;
    int array[10];
    
    /* Initialize array */
    for (i = 0; i < 10; i++) {
        array[i] = i;
    }
    
    /* Calculate sum */
    for (i = 0; i < 10; i++) {
        sum += array[i];
    }
#else
    /* C11: Declarations anywhere, loop variable in for() */
    int sum = 0;
    int array[10];
    
    /* Initialize array */
    for (int i = 0; i < 10; i++) {
        array[i] = i;
    }
    
    /* Calculate sum - can reuse 'i' */
    for (int i = 0; i < 10; i++) {
        sum += array[i];
    }
#endif
    
    printf("Sum: %d\n", sum);
}

/**
 * EXAMPLE 2: Designated Initializers
 */

typedef struct {
    int x;
    int y;
    int z;
} Point3D;

void example_designated_initializers(void) {
#ifdef USE_C89
    /* C89: Positional initialization only */
    Point3D p1;
    p1.x = 10;
    p1.y = 20;
    p1.z = 30;
    
    /* Or with initializer list (must be in order) */
    Point3D p2 = {10, 20, 30};
#else
    /* C11: Designated initializers (any order) */
    Point3D p1 = {.x = 10, .y = 20, .z = 30};
    Point3D p2 = {.z = 30, .x = 10, .y = 20};  /* Order doesn't matter */
    Point3D p3 = {.x = 10};  /* Others default to 0 */
#endif
    
    printf("Point: (%d, %d, %d)\n", p1.x, p1.y, p1.z);
}

/**
 * EXAMPLE 3: Static Assertions
 */

void example_static_assertions(void) {
#ifdef USE_C89
    /* C89: Runtime assertion only */
    if (sizeof(int) != 4) {
        fprintf(stderr, "Error: int is not 4 bytes\n");
        exit(1);
    }
#else
    /* C11: Compile-time assertion */
    _Static_assert(sizeof(int) == 4, "int must be 4 bytes");
#endif
    
    printf("Size checks passed\n");
}

/**
 * EXAMPLE 4: Flexible Array Members
 */

#ifdef USE_C89
/* C89: Use array of size 1 (hack) */
typedef struct {
    size_t length;
    char data[1];  /* Actually variable length */
} Buffer_C89;

Buffer_C89* create_buffer_c89(size_t size) {
    Buffer_C89 *buf = malloc(sizeof(Buffer_C89) + size - 1);
    if (buf) {
        buf->length = size;
    }
    return buf;
}
#else
/* C11: Flexible array member */
typedef struct {
    size_t length;
    char data[];  /* Flexible array member */
} Buffer_C11;

Buffer_C11* create_buffer_c11(size_t size) {
    Buffer_C11 *buf = malloc(sizeof(Buffer_C11) + size);
    if (buf) {
        buf->length = size;
    }
    return buf;
}
#endif

/**
 * EXAMPLE 5: Inline Functions
 */

/* C89: Use macro (no type safety) */
#ifdef USE_C89
#define MAX(a, b) ((a) > (b) ? (a) : (b))
#else
/* C11: Inline function (type safe) */
static inline int max_int(int a, int b) {
    return a > b ? a : b;
}
#endif

void example_inline_functions(void) {
#ifdef USE_C89
    int result = MAX(10, 20);
#else
    int result = max_int(10, 20);
#endif
    printf("Max: %d\n", result);
}

/**
 * EXAMPLE 6: Anonymous Unions/Structs
 */

#ifdef USE_C89
/* C89: Named union required */
typedef struct {
    int type;
    union {
        int i;
        float f;
    } value;  /* Must be named */
} Variant_C89;

void use_variant_c89(void) {
    Variant_C89 v;
    v.type = 1;
    v.value.i = 42;  /* Must use union name */
    printf("Value: %d\n", v.value.i);
}
#else
/* C11: Anonymous union */
typedef struct {
    int type;
    union {
        int i;
        float f;
    };  /* Anonymous */
} Variant_C11;

void use_variant_c11(void) {
    Variant_C11 v;
    v.type = 1;
    v.i = 42;  /* Direct access */
    printf("Value: %d\n", v.i);
}
#endif

/**
 * Main function
 */
int main(void) {
    printf("=== C89 to C11 Migration Examples ===\n\n");
    
#ifdef USE_C89
    printf("Compiled with C89 standard\n\n");
#else
    printf("Compiled with C11 standard\n\n");
#endif
    
    printf("Example 1: Variable Declarations\n");
    example_variable_declarations();
    printf("\n");
    
    printf("Example 2: Designated Initializers\n");
    example_designated_initializers();
    printf("\n");
    
    printf("Example 3: Static Assertions\n");
    example_static_assertions();
    printf("\n");
    
    printf("Example 5: Inline Functions\n");
    example_inline_functions();
    printf("\n");
    
#ifdef USE_C89
    printf("Example 6: Anonymous Unions (C89)\n");
    use_variant_c89();
#else
    printf("Example 6: Anonymous Unions (C11)\n");
    use_variant_c11();
#endif
    
    return 0;
}

