/**
 * @file ipc-pipes.c
 * @brief Example demonstrating inter-process communication using pipes
 * 
 * This example shows:
 * - Creating pipes for IPC
 * - Bidirectional communication between parent and child
 * - Proper file descriptor management
 * - Error handling for pipe operations
 * - Resource cleanup
 * 
 * Compile: gcc -Wall -Wextra -std=c11 -o ipc-pipes ipc-pipes.c
 * Run: ./ipc-pipes
 */

#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <errno.h>

#define BUFFER_SIZE 256
#define MESSAGE_COUNT 5

/**
 * @brief Simple pipe communication example
 * @return 0 on success, -1 on error
 */
int simple_pipe_example(void) {
    int pipefd[2];
    pid_t pid;
    char buffer[BUFFER_SIZE];

    // Create pipe
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
        // Child process: write to pipe
        close(pipefd[0]);  // Close read end

        const char *message = "Hello from child process!";
        ssize_t written = write(pipefd[1], message, strlen(message) + 1);
        if (written < 0) {
            perror("write");
            close(pipefd[1]);
            exit(EXIT_FAILURE);
        }

        close(pipefd[1]);
        exit(EXIT_SUCCESS);
    } else {
        // Parent process: read from pipe
        close(pipefd[1]);  // Close write end

        ssize_t bytes_read = read(pipefd[0], buffer, sizeof(buffer) - 1);
        if (bytes_read < 0) {
            perror("read");
            close(pipefd[0]);
            return -1;
        }

        buffer[bytes_read] = '\0';
        printf("Parent received: %s\n", buffer);

        close(pipefd[0]);
        wait(NULL);  // Wait for child to finish
    }

    return 0;
}

/**
 * @brief Bidirectional pipe communication example
 * @return 0 on success, -1 on error
 */
int bidirectional_pipe_example(void) {
    int parent_to_child[2];  // Parent writes, child reads
    int child_to_parent[2];  // Child writes, parent reads
    pid_t pid;
    char buffer[BUFFER_SIZE];

    // Create both pipes
    if (pipe(parent_to_child) < 0) {
        perror("pipe (parent_to_child)");
        return -1;
    }

    if (pipe(child_to_parent) < 0) {
        perror("pipe (child_to_parent)");
        close(parent_to_child[0]);
        close(parent_to_child[1]);
        return -1;
    }

    pid = fork();
    if (pid < 0) {
        perror("fork");
        close(parent_to_child[0]);
        close(parent_to_child[1]);
        close(child_to_parent[0]);
        close(child_to_parent[1]);
        return -1;
    }

    if (pid == 0) {
        // Child process
        close(parent_to_child[1]);  // Close write end of parent->child
        close(child_to_parent[0]);  // Close read end of child->parent

        // Read from parent
        ssize_t bytes_read = read(parent_to_child[0], buffer, sizeof(buffer) - 1);
        if (bytes_read > 0) {
            buffer[bytes_read] = '\0';
            printf("Child received: %s\n", buffer);

            // Send response to parent
            const char *response = "ACK from child";
            write(child_to_parent[1], response, strlen(response) + 1);
        }

        close(parent_to_child[0]);
        close(child_to_parent[1]);
        exit(EXIT_SUCCESS);
    } else {
        // Parent process
        close(parent_to_child[0]);  // Close read end of parent->child
        close(child_to_parent[1]);  // Close write end of child->parent

        // Send message to child
        const char *message = "Hello from parent";
        write(parent_to_child[1], message, strlen(message) + 1);
        close(parent_to_child[1]);

        // Read response from child
        ssize_t bytes_read = read(child_to_parent[0], buffer, sizeof(buffer) - 1);
        if (bytes_read > 0) {
            buffer[bytes_read] = '\0';
            printf("Parent received: %s\n", buffer);
        }

        close(child_to_parent[0]);
        wait(NULL);
    }

    return 0;
}

int main(void) {
    printf("=== IPC Pipes Example ===\n\n");

    printf("Example 1: Simple one-way pipe\n");
    if (simple_pipe_example() < 0) {
        fprintf(stderr, "Simple pipe example failed\n");
        return EXIT_FAILURE;
    }
    printf("\n");

    printf("Example 2: Bidirectional pipe communication\n");
    if (bidirectional_pipe_example() < 0) {
        fprintf(stderr, "Bidirectional pipe example failed\n");
        return EXIT_FAILURE;
    }
    printf("\n");

    printf("All IPC examples completed successfully\n");
    return EXIT_SUCCESS;
}

