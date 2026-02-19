# Rule: Naming Conventions

## Metadata
- **ID**: universal-naming
- **Category**: universal
- **Severity**: WARNING
- **Standard**: Linux Kernel Style, GNU Coding Standards
- **Version**: 1.0.0

## Description
Use consistent naming conventions: snake_case for functions and variables, UPPER_CASE for macros and constants, PascalCase for types.

## Rationale
Consistent naming improves code readability and maintainability. It helps distinguish between different types of identifiers at a glance, reducing cognitive load and preventing errors.

## Applies To
- C Standards: c89, c99, c11, c17, c23
- Categories: all

## Rule Details

### Functions and Variables
Use `snake_case` for function names and variable names:
- All lowercase letters
- Words separated by underscores
- Descriptive names that convey purpose

### Macros and Constants
Use `UPPER_CASE` for preprocessor macros and constants:
- All uppercase letters
- Words separated by underscores
- Prefix with module name to avoid collisions

### Types
Use `PascalCase` or `snake_case_t` suffix for type definitions:
- Struct/union/enum names: PascalCase or snake_case
- Typedef names: snake_case with `_t` suffix
- Enum constants: UPPER_CASE

## Examples

### ✅ Good Examples

```c
// Functions - snake_case
int calculate_total_price(int quantity, double unit_price);
void initialize_network_connection(void);
char* get_user_name(int user_id);

// Variables - snake_case
int user_count = 0;
double average_temperature = 0.0;
char* file_path = NULL;

// Macros - UPPER_CASE
#define MAX_BUFFER_SIZE 1024
#define MIN(a, b) ((a) < (b) ? (a) : (b))
#define DEBUG_PRINT(fmt, ...) fprintf(stderr, fmt, ##__VA_ARGS__)

// Constants - UPPER_CASE
const int MAX_CONNECTIONS = 100;
const double PI = 3.14159265359;

// Types - PascalCase or snake_case_t
typedef struct {
    int id;
    char name[64];
} User;

typedef struct connection_info {
    int socket_fd;
    char ip_address[16];
} connection_info_t;

// Enums
typedef enum {
    STATUS_SUCCESS,
    STATUS_ERROR,
    STATUS_PENDING
} Status;
```

### ❌ Bad Examples

```c
// Inconsistent function naming
int CalculateTotalPrice(int qty, double price);  // PascalCase - wrong
void InitNetConn(void);                          // Abbreviated - unclear
char* GetUserName(int ID);                       // Mixed case - wrong

// Inconsistent variable naming
int UserCount = 0;                               // PascalCase - wrong
double avgTemp = 0.0;                            // camelCase - wrong
char* FilePath = NULL;                           // PascalCase - wrong

// Lowercase macros
#define max_buffer_size 1024                     // lowercase - wrong
#define min(a, b) ((a) < (b) ? (a) : (b))       // lowercase - wrong

// Inconsistent type naming
typedef struct {
    int id;
    char name[64];
} user;                                          // lowercase - unclear

typedef struct ConnectionInfo {
    int socketFd;                                // camelCase - wrong
    char IPAddress[16];                          // Mixed case - wrong
} ConnectionInfo;
```

### 🔧 Refactoring Example

**Before:**
```c
#define maxSize 100
int GetUserAge(int UserID);
typedef struct { int x; int y; } point;
```

**After:**
```c
#define MAX_SIZE 100
int get_user_age(int user_id);
typedef struct { int x; int y; } Point;
// or
typedef struct { int x; int y; } point_t;
```

## Exceptions

1. **Platform-specific code**: May follow platform conventions (e.g., Windows API uses PascalCase)
2. **Third-party integration**: May match external library naming for consistency
3. **Legacy code**: Gradual migration preferred over immediate breaking changes

## References

- [Linux Kernel Coding Style](https://www.kernel.org/doc/html/latest/process/coding-style.html)
- [GNU Coding Standards](https://www.gnu.org/prep/standards/standards.html)
- [CERT C Coding Standard - DCL04-C](https://wiki.sei.cmu.edu/confluence/display/c/DCL04-C.+Do+not+declare+more+than+one+variable+per+declaration)

## Related Rules

- `universal-documentation` - Naming should align with documentation
- `universal-const-correctness` - Constant naming conventions

