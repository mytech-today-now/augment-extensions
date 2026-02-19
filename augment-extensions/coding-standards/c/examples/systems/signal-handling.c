/**
 * @file signal-handling.c
 * @brief Example demonstrating POSIX signal handling
 * 
 * This example shows:
 * - Registering signal handlers with sigaction()
 * - Handling common signals (SIGINT, SIGTERM, SIGUSR1)
 * - Async-signal-safe operations
 * - Graceful shutdown
 * - Signal masking
 * 
 * Compile: gcc -Wall -Wextra -std=c11 -o signal-handling signal-handling.c
 * Run: ./signal-handling (Press Ctrl+C to test SIGINT)
 */

#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>

// Global flag for graceful shutdown (volatile sig_atomic_t is async-signal-safe)
static volatile sig_atomic_t shutdown_requested = 0;
static volatile sig_atomic_t usr1_count = 0;

/**
 * @brief Signal handler for SIGINT and SIGTERM
 * @param signum Signal number
 */
void shutdown_handler(int signum) {
    // Only async-signal-safe operations allowed here
    shutdown_requested = 1;
    
    // write() is async-signal-safe, printf() is not
    const char *msg = (signum == SIGINT) ? 
        "Received SIGINT, shutting down...\n" :
        "Received SIGTERM, shutting down...\n";
    write(STDOUT_FILENO, msg, strlen(msg));
}

/**
 * @brief Signal handler for SIGUSR1
 * @param signum Signal number
 */
void usr1_handler(int signum) {
    (void)signum;  // Unused parameter
    usr1_count++;
    
    const char *msg = "Received SIGUSR1\n";
    write(STDOUT_FILENO, msg, strlen(msg));
}

/**
 * @brief Install signal handlers using sigaction()
 * @return 0 on success, -1 on error
 */
int install_signal_handlers(void) {
    struct sigaction sa_shutdown;
    struct sigaction sa_usr1;

    // Setup shutdown handler (SIGINT, SIGTERM)
    memset(&sa_shutdown, 0, sizeof(sa_shutdown));
    sa_shutdown.sa_handler = shutdown_handler;
    sigemptyset(&sa_shutdown.sa_mask);
    sa_shutdown.sa_flags = SA_RESTART;  // Restart interrupted system calls

    if (sigaction(SIGINT, &sa_shutdown, NULL) < 0) {
        perror("sigaction(SIGINT)");
        return -1;
    }

    if (sigaction(SIGTERM, &sa_shutdown, NULL) < 0) {
        perror("sigaction(SIGTERM)");
        return -1;
    }

    // Setup SIGUSR1 handler
    memset(&sa_usr1, 0, sizeof(sa_usr1));
    sa_usr1.sa_handler = usr1_handler;
    sigemptyset(&sa_usr1.sa_mask);
    sa_usr1.sa_flags = SA_RESTART;

    if (sigaction(SIGUSR1, &sa_usr1, NULL) < 0) {
        perror("sigaction(SIGUSR1)");
        return -1;
    }

    return 0;
}

/**
 * @brief Example of signal masking
 * @return 0 on success, -1 on error
 */
int signal_masking_example(void) {
    sigset_t mask, oldmask;

    printf("Blocking SIGUSR1 for 3 seconds...\n");

    // Block SIGUSR1
    sigemptyset(&mask);
    sigaddset(&mask, SIGUSR1);
    
    if (sigprocmask(SIG_BLOCK, &mask, &oldmask) < 0) {
        perror("sigprocmask(SIG_BLOCK)");
        return -1;
    }

    printf("SIGUSR1 is now blocked. Send signal with: kill -USR1 %d\n", getpid());
    sleep(3);

    // Unblock SIGUSR1
    printf("Unblocking SIGUSR1...\n");
    if (sigprocmask(SIG_SETMASK, &oldmask, NULL) < 0) {
        perror("sigprocmask(SIG_SETMASK)");
        return -1;
    }

    printf("SIGUSR1 is now unblocked\n");
    return 0;
}

/**
 * @brief Main application loop
 */
void run_application(void) {
    printf("Application running (PID: %d)\n", getpid());
    printf("Press Ctrl+C to trigger SIGINT\n");
    printf("Send SIGUSR1 with: kill -USR1 %d\n", getpid());
    printf("Send SIGTERM with: kill -TERM %d\n\n", getpid());

    // Demonstrate signal masking
    signal_masking_example();

    // Main loop
    int iteration = 0;
    while (!shutdown_requested) {
        printf("Working... (iteration %d, SIGUSR1 count: %d)\n", 
               iteration++, (int)usr1_count);
        sleep(2);
    }

    printf("\nShutdown complete. Total SIGUSR1 signals: %d\n", (int)usr1_count);
}

int main(void) {
    printf("=== Signal Handling Example ===\n\n");

    // Install signal handlers
    if (install_signal_handlers() < 0) {
        fprintf(stderr, "Failed to install signal handlers\n");
        return EXIT_FAILURE;
    }

    // Run application
    run_application();

    printf("Application terminated gracefully\n");
    return EXIT_SUCCESS;
}

