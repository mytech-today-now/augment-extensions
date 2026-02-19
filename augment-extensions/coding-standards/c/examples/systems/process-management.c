/**
 * @file process-management.c
 * @brief Example demonstrating POSIX process management with fork/exec/wait
 * 
 * This example shows:
 * - Proper fork() usage with error checking
 * - Process creation and management
 * - Parent-child process coordination
 * - Exit status handling
 * - Resource cleanup
 * 
 * Compile: gcc -Wall -Wextra -std=c11 -o process-management process-management.c
 * Run: ./process-management
 */

#include <sys/types.h>
#include <sys/wait.h>
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

/**
 * @brief Spawn a child process to execute a command
 * @param command Command to execute
 * @param args Arguments for the command (NULL-terminated)
 * @return 0 on success, -1 on error
 */
int spawn_process(const char *command, char *const args[]) {
    if (command == NULL || args == NULL) {
        fprintf(stderr, "Error: NULL command or args\n");
        return -1;
    }

    pid_t pid = fork();
    
    if (pid < 0) {
        // Fork failed
        perror("fork");
        return -1;
    } else if (pid == 0) {
        // Child process
        execvp(command, args);
        // If execvp returns, it failed
        perror("execvp");
        exit(EXIT_FAILURE);
    } else {
        // Parent process
        int status;
        pid_t result = waitpid(pid, &status, 0);
        
        if (result < 0) {
            perror("waitpid");
            return -1;
        }
        
        if (WIFEXITED(status)) {
            int exit_code = WEXITSTATUS(status);
            printf("Child process %d exited with status %d\n", pid, exit_code);
            return exit_code == 0 ? 0 : -1;
        } else if (WIFSIGNALED(status)) {
            int signal = WTERMSIG(status);
            fprintf(stderr, "Child process %d terminated by signal %d\n", pid, signal);
            return -1;
        }
    }
    
    return 0;
}

/**
 * @brief Create multiple child processes and wait for all
 * @param count Number of child processes to create
 * @return 0 on success, -1 on error
 */
int spawn_multiple_processes(int count) {
    if (count <= 0 || count > 100) {
        fprintf(stderr, "Error: Invalid process count %d\n", count);
        return -1;
    }

    pid_t *children = malloc(count * sizeof(pid_t));
    if (children == NULL) {
        perror("malloc");
        return -1;
    }

    // Create child processes
    for (int i = 0; i < count; i++) {
        pid_t pid = fork();
        
        if (pid < 0) {
            perror("fork");
            // Clean up already created processes
            for (int j = 0; j < i; j++) {
                kill(children[j], SIGTERM);
            }
            free(children);
            return -1;
        } else if (pid == 0) {
            // Child process
            printf("Child %d (PID %d) running\n", i, getpid());
            sleep(1);  // Simulate work
            exit(EXIT_SUCCESS);
        } else {
            // Parent process
            children[i] = pid;
        }
    }

    // Wait for all children
    int failed = 0;
    for (int i = 0; i < count; i++) {
        int status;
        pid_t result = waitpid(children[i], &status, 0);
        
        if (result < 0) {
            perror("waitpid");
            failed++;
        } else if (!WIFEXITED(status) || WEXITSTATUS(status) != 0) {
            fprintf(stderr, "Child %d failed\n", children[i]);
            failed++;
        }
    }

    free(children);
    return failed == 0 ? 0 : -1;
}

int main(void) {
    printf("=== Process Management Example ===\n\n");

    // Example 1: Simple process execution
    printf("Example 1: Execute 'ls -l' command\n");
    char *args[] = {"ls", "-l", NULL};
    if (spawn_process("ls", args) < 0) {
        fprintf(stderr, "Failed to execute ls command\n");
    }
    printf("\n");

    // Example 2: Multiple child processes
    printf("Example 2: Create 3 child processes\n");
    if (spawn_multiple_processes(3) < 0) {
        fprintf(stderr, "Failed to create multiple processes\n");
        return EXIT_FAILURE;
    }
    printf("\n");

    printf("All examples completed successfully\n");
    return EXIT_SUCCESS;
}

