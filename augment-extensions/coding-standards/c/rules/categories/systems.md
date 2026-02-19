# Rule: Systems Programming

## Metadata
- **ID**: category-systems
- **Category**: systems
- **Severity**: ERROR
- **Standard**: POSIX.1-2017, SUSv4
- **Version**: 1.0.0

## Description
Systems programming rules for POSIX-compliant code including system calls, IPC, signal handling, and process management.

## Rationale
Systems programming requires strict adherence to POSIX standards, proper error handling of system calls, and careful management of system resources. Failure to follow these practices leads to resource leaks, race conditions, and undefined behavior.

## Applies To
- C Standards: c99, c11, c17, c23
- Categories: systems
- Platforms: POSIX-compliant systems (Linux, Unix, macOS, BSD)

## Rule Details

### 1. POSIX Compliance
- Use POSIX-defined feature test macros
- Follow POSIX API specifications
- Handle platform-specific differences
- Use standard POSIX types (pid_t, size_t, ssize_t)

### 2. System Call Error Checking
- **ALWAYS** check return values of system calls
- Use errno for error diagnosis
- Provide meaningful error messages with perror() or strerror()
- Handle EINTR (interrupted system calls) appropriately

### 3. Signal Handling
- Use sigaction() instead of signal()
- Make signal handlers async-signal-safe
- Use volatile sig_atomic_t for shared variables
- Block signals during critical sections

### 4. Inter-Process Communication (IPC)
- Choose appropriate IPC mechanism (pipes, FIFOs, message queues, shared memory, sockets)
- Properly synchronize access to shared resources
- Clean up IPC resources on exit
- Handle partial reads/writes

### 5. Process Management
- Check fork() return value for all three cases (parent, child, error)
- Use exec() family correctly
- Reap child processes to avoid zombies
- Handle process termination signals

## Examples

### ✅ Example 1: Proper System Call Error Checking

```c
#include <unistd.h>
#include <errno.h>
#include <string.h>
#include <stdio.h>

ssize_t safe_write(int fd, const void *buf, size_t count) {
    ssize_t written = 0;
    ssize_t result;
    
    while (written < count) {
        result = write(fd, (char*)buf + written, count - written);
        
        if (result < 0) {
            if (errno == EINTR) {
                continue;  // Interrupted, retry
            }
            perror("write");
            return -1;
        }
        
        written += result;
    }
    
    return written;
}
```

### ❌ Example 1: Missing Error Checking

```c
// WRONG: No error checking
void unsafe_write(int fd, const void *buf, size_t count) {
    write(fd, buf, count);  // Ignores return value and errors
}
```

### ✅ Example 2: Proper Signal Handling with sigaction()

```c
#include <signal.h>
#include <stdio.h>

volatile sig_atomic_t got_signal = 0;

void signal_handler(int signo) {
    // Async-signal-safe: only set flag
    got_signal = signo;
}

int setup_signal_handler(void) {
    struct sigaction sa;
    
    sa.sa_handler = signal_handler;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART;  // Restart interrupted system calls
    
    if (sigaction(SIGINT, &sa, NULL) < 0) {
        perror("sigaction");
        return -1;
    }
    
    return 0;
}
```

### ❌ Example 2: Unsafe Signal Handling

```c
// WRONG: Using deprecated signal(), non-async-signal-safe operations
void bad_handler(int signo) {
    printf("Got signal %d\n", signo);  // printf is NOT async-signal-safe!
    signal(SIGINT, bad_handler);       // Deprecated, race conditions
}
```

### ✅ Example 3: Proper fork() Usage

```c
#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>

int spawn_child_process(void) {
    pid_t pid = fork();
    
    if (pid < 0) {
        // Fork failed
        perror("fork");
        return -1;
    } else if (pid == 0) {
        // Child process
        execl("/bin/ls", "ls", "-l", NULL);
        perror("execl");  // Only reached if exec fails
        exit(EXIT_FAILURE);
    } else {
        // Parent process
        int status;
        if (waitpid(pid, &status, 0) < 0) {
            perror("waitpid");
            return -1;
        }
        
        if (WIFEXITED(status)) {
            printf("Child exited with status %d\n", WEXITSTATUS(status));
        }
    }
    
    return 0;
}
```

### ❌ Example 3: Improper fork() Usage

```c
// WRONG: Not checking all cases, creating zombie processes
void bad_fork(void) {
    if (fork() == 0) {
        execl("/bin/ls", "ls", NULL);
    }
    // Missing: error check, parent doesn't wait (zombie!)
}
```

### ✅ Example 4: Pipe Communication

```c
#include <unistd.h>
#include <string.h>
#include <stdio.h>

int pipe_communication_example(void) {
    int pipefd[2];
    pid_t pid;
    char buf[256];

    if (pipe(pipefd) < 0) {
        perror("pipe");
        return -1;
    }

    pid = fork();
    if (pid < 0) {
        perror("fork");
        close(pipefd[0]);
        close(pipefd[1]);
        return -1;
    }

    if (pid == 0) {
        // Child: write to pipe
        close(pipefd[0]);  // Close read end
        const char *msg = "Hello from child";
        write(pipefd[1], msg, strlen(msg) + 1);
        close(pipefd[1]);
        exit(0);
    } else {
        // Parent: read from pipe
        close(pipefd[1]);  // Close write end
        ssize_t n = read(pipefd[0], buf, sizeof(buf));
        if (n > 0) {
            printf("Parent received: %s\n", buf);
        }
        close(pipefd[0]);
        wait(NULL);
    }

    return 0;
}
```

### ✅ Example 5: File Descriptor Management

```c
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>

int safe_file_operations(const char *filename) {
    int fd = open(filename, O_RDONLY);
    if (fd < 0) {
        perror("open");
        return -1;
    }

    // Set close-on-exec flag to prevent fd leaks
    int flags = fcntl(fd, F_GETFD);
    if (flags < 0) {
        perror("fcntl F_GETFD");
        close(fd);
        return -1;
    }

    if (fcntl(fd, F_SETFD, flags | FD_CLOEXEC) < 0) {
        perror("fcntl F_SETFD");
        close(fd);
        return -1;
    }

    // Use the file descriptor...

    close(fd);
    return 0;
}
```

### ✅ Example 6: POSIX Feature Test Macros

```c
// At the top of the file, before any includes
#define _POSIX_C_SOURCE 200809L  // POSIX.1-2008

#include <unistd.h>
#include <time.h>

// Now we can use POSIX.1-2008 features
int use_posix_features(void) {
    struct timespec ts;

    if (clock_gettime(CLOCK_MONOTONIC, &ts) < 0) {
        return -1;
    }

    return 0;
}
```

### ✅ Example 7: Shared Memory IPC

```c
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>
#include <stdio.h>

#define SHM_NAME "/my_shm"
#define SHM_SIZE 4096

int create_shared_memory(void) {
    int fd = shm_open(SHM_NAME, O_CREAT | O_RDWR, 0666);
    if (fd < 0) {
        perror("shm_open");
        return -1;
    }

    if (ftruncate(fd, SHM_SIZE) < 0) {
        perror("ftruncate");
        close(fd);
        shm_unlink(SHM_NAME);
        return -1;
    }

    void *ptr = mmap(NULL, SHM_SIZE, PROT_READ | PROT_WRITE,
                     MAP_SHARED, fd, 0);
    if (ptr == MAP_FAILED) {
        perror("mmap");
        close(fd);
        shm_unlink(SHM_NAME);
        return -1;
    }

    // Use shared memory...
    strcpy(ptr, "Hello, shared memory!");

    // Cleanup
    munmap(ptr, SHM_SIZE);
    close(fd);
    shm_unlink(SHM_NAME);

    return 0;
}
```

### ✅ Example 8: Signal Blocking During Critical Section

```c
#include <signal.h>
#include <stdio.h>

int critical_section_with_signal_blocking(void) {
    sigset_t new_mask, old_mask;

    // Block SIGINT and SIGTERM during critical section
    sigemptyset(&new_mask);
    sigaddset(&new_mask, SIGINT);
    sigaddset(&new_mask, SIGTERM);

    if (sigprocmask(SIG_BLOCK, &new_mask, &old_mask) < 0) {
        perror("sigprocmask");
        return -1;
    }

    // Critical section - signals are blocked
    // ... perform critical operations ...

    // Restore original signal mask
    if (sigprocmask(SIG_SETMASK, &old_mask, NULL) < 0) {
        perror("sigprocmask");
        return -1;
    }

    return 0;
}
```

### ✅ Example 9: Proper errno Usage

```c
#include <errno.h>
#include <string.h>
#include <stdio.h>
#include <fcntl.h>

int open_file_with_error_handling(const char *path) {
    int fd;

    errno = 0;  // Clear errno before system call
    fd = open(path, O_RDONLY);

    if (fd < 0) {
        int saved_errno = errno;  // Save errno immediately

        fprintf(stderr, "Failed to open '%s': %s (errno=%d)\n",
                path, strerror(saved_errno), saved_errno);

        // Handle specific errors
        switch (saved_errno) {
            case ENOENT:
                fprintf(stderr, "File does not exist\n");
                break;
            case EACCES:
                fprintf(stderr, "Permission denied\n");
                break;
            case EMFILE:
                fprintf(stderr, "Too many open files\n");
                break;
            default:
                fprintf(stderr, "Unknown error\n");
        }

        return -1;
    }

    return fd;
}
```

### ✅ Example 10: POSIX Message Queues

```c
#include <mqueue.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <stdio.h>
#include <string.h>

#define QUEUE_NAME "/my_queue"
#define MAX_MSG_SIZE 256

int message_queue_example(void) {
    mqd_t mq;
    struct mq_attr attr;
    char buffer[MAX_MSG_SIZE];

    // Set queue attributes
    attr.mq_flags = 0;
    attr.mq_maxmsg = 10;
    attr.mq_msgsize = MAX_MSG_SIZE;
    attr.mq_curmsgs = 0;

    // Create message queue
    mq = mq_open(QUEUE_NAME, O_CREAT | O_RDWR, 0666, &attr);
    if (mq == (mqd_t)-1) {
        perror("mq_open");
        return -1;
    }

    // Send message
    const char *msg = "Test message";
    if (mq_send(mq, msg, strlen(msg) + 1, 0) < 0) {
        perror("mq_send");
        mq_close(mq);
        mq_unlink(QUEUE_NAME);
        return -1;
    }

    // Receive message
    ssize_t bytes_read = mq_receive(mq, buffer, MAX_MSG_SIZE, NULL);
    if (bytes_read < 0) {
        perror("mq_receive");
        mq_close(mq);
        mq_unlink(QUEUE_NAME);
        return -1;
    }

    printf("Received: %s\n", buffer);

    // Cleanup
    mq_close(mq);
    mq_unlink(QUEUE_NAME);

    return 0;
}
```

### ✅ Example 11: Process Resource Limits

```c
#include <sys/resource.h>
#include <stdio.h>

int set_resource_limits(void) {
    struct rlimit limit;

    // Get current file descriptor limit
    if (getrlimit(RLIMIT_NOFILE, &limit) < 0) {
        perror("getrlimit");
        return -1;
    }

    printf("Current limits: soft=%lu, hard=%lu\n",
           limit.rlim_cur, limit.rlim_max);

    // Increase soft limit (cannot exceed hard limit)
    limit.rlim_cur = limit.rlim_max;

    if (setrlimit(RLIMIT_NOFILE, &limit) < 0) {
        perror("setrlimit");
        return -1;
    }

    return 0;
}
```

### ✅ Example 12: Daemon Process Creation

```c
#include <unistd.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>

int daemonize(void) {
    pid_t pid;

    // Fork and exit parent
    pid = fork();
    if (pid < 0) {
        return -1;
    }
    if (pid > 0) {
        exit(EXIT_SUCCESS);  // Parent exits
    }

    // Create new session
    if (setsid() < 0) {
        return -1;
    }

    // Fork again to prevent acquiring controlling terminal
    pid = fork();
    if (pid < 0) {
        return -1;
    }
    if (pid > 0) {
        exit(EXIT_SUCCESS);
    }

    // Change working directory to root
    if (chdir("/") < 0) {
        return -1;
    }

    // Close all file descriptors
    for (int fd = sysconf(_SC_OPEN_MAX); fd >= 0; fd--) {
        close(fd);
    }

    // Redirect stdin, stdout, stderr to /dev/null
    int fd = open("/dev/null", O_RDWR);
    if (fd < 0) {
        return -1;
    }
    dup2(fd, STDIN_FILENO);
    dup2(fd, STDOUT_FILENO);
    dup2(fd, STDERR_FILENO);
    if (fd > STDERR_FILENO) {
        close(fd);
    }

    return 0;
}
```

## References

- POSIX.1-2017 (IEEE Std 1003.1-2017)
- The Single UNIX Specification, Version 4 (SUSv4)
- Advanced Programming in the UNIX Environment (Stevens & Rago)
- The Linux Programming Interface (Michael Kerrisk)
- POSIX System Calls and Subroutines using C

## Related Rules

- universal-error-handling
- universal-memory-safety
- universal-documentation

## Configuration

Enable in `.augment/c-standards.json`:

```json
{
  "categories": ["systems"],
  "category_overrides": {
    "systems": {
      "require_posix_compliance": true,
      "check_system_call_errors": true
    }
  }
}
```

