# Systems Programming Examples

This directory contains compilable C examples demonstrating POSIX systems programming best practices.

## Examples

### 1. process-management.c
Demonstrates process creation and management:
- `fork()` and `exec()` family functions
- Parent-child process coordination
- Process exit status handling
- Multiple child process management
- Resource cleanup

**Key Concepts:**
- Always check `fork()` return value
- Use `waitpid()` to collect child status
- Handle both normal exit and signal termination
- Clean up resources on error paths

### 2. ipc-pipes.c
Demonstrates inter-process communication using pipes:
- Creating pipes with `pipe()`
- Unidirectional communication
- Bidirectional communication with two pipes
- Proper file descriptor management
- Error handling

**Key Concepts:**
- Close unused pipe ends
- Handle partial reads/writes
- Check all system call return values
- Clean up file descriptors

### 3. signal-handling.c
Demonstrates POSIX signal handling:
- Installing signal handlers with `sigaction()`
- Handling SIGINT, SIGTERM, SIGUSR1
- Async-signal-safe operations
- Signal masking with `sigprocmask()`
- Graceful shutdown

**Key Concepts:**
- Use `sigaction()` instead of `signal()`
- Only use async-signal-safe functions in handlers
- Use `volatile sig_atomic_t` for shared flags
- Implement graceful shutdown

## Building

```bash
# Build all examples
make

# Build specific example
make process-management

# Clean build artifacts
make clean

# Run automated tests
make test
```

## Running

```bash
# Process management
./process-management

# IPC pipes
./ipc-pipes

# Signal handling (interactive)
./signal-handling
# In another terminal:
kill -USR1 <pid>
kill -TERM <pid>
```

## Requirements

- POSIX-compliant system (Linux, Unix, macOS, BSD)
- GCC or compatible C compiler
- C11 standard support

## Standards Compliance

All examples follow:
- POSIX.1-2017 (IEEE Std 1003.1-2017)
- C11 standard (ISO/IEC 9899:2011)
- Linux/GNU coding standards

## Best Practices Demonstrated

1. **Error Handling**
   - Check all system call return values
   - Use `perror()` for error messages
   - Clean up resources on error paths

2. **Resource Management**
   - Close file descriptors when done
   - Free allocated memory
   - Wait for child processes

3. **Signal Safety**
   - Use async-signal-safe functions only
   - Minimize work in signal handlers
   - Use `volatile sig_atomic_t` for flags

4. **Code Quality**
   - Compile with `-Wall -Wextra -Werror`
   - Use meaningful variable names
   - Add comprehensive comments
   - Follow consistent style

## References

- POSIX.1-2017: https://pubs.opengroup.org/onlinepubs/9699919799/
- Advanced Programming in the UNIX Environment (APUE)
- The Linux Programming Interface (TLPI)
- GNU C Library Manual: https://www.gnu.org/software/libc/manual/

