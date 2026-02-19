/**
 * @file tcp-server.c
 * @brief Example TCP server with proper error handling
 * 
 * This example demonstrates:
 * - TCP socket creation and binding
 * - Connection handling
 * - Non-blocking I/O
 * - Error handling
 * - Resource cleanup
 * 
 * Compile: gcc -Wall -Wextra -std=c11 -o tcp-server tcp-server.c
 * Run: ./tcp-server 8080
 * Test: telnet localhost 8080
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <fcntl.h>

#define BUFFER_SIZE 1024
#define MAX_PENDING 5

/**
 * @brief Set socket to non-blocking mode
 */
static int set_nonblocking(int sockfd) {
    int flags = fcntl(sockfd, F_GETFL, 0);
    if (flags < 0) {
        perror("fcntl(F_GETFL)");
        return -1;
    }
    
    if (fcntl(sockfd, F_SETFL, flags | O_NONBLOCK) < 0) {
        perror("fcntl(F_SETFL)");
        return -1;
    }
    
    return 0;
}

/**
 * @brief Create and configure TCP server socket
 */
static int create_server_socket(uint16_t port) {
    int sockfd;
    struct sockaddr_in server_addr;
    int reuse = 1;
    
    /* Create socket */
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return -1;
    }
    
    /* Set SO_REUSEADDR to reuse port immediately */
    if (setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(reuse)) < 0) {
        perror("setsockopt(SO_REUSEADDR)");
        close(sockfd);
        return -1;
    }
    
    /* Bind to address */
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(port);
    
    if (bind(sockfd, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("bind");
        close(sockfd);
        return -1;
    }
    
    /* Listen for connections */
    if (listen(sockfd, MAX_PENDING) < 0) {
        perror("listen");
        close(sockfd);
        return -1;
    }
    
    printf("TCP server listening on port %u\n", port);
    return sockfd;
}

/**
 * @brief Handle client connection
 */
static void handle_client(int client_fd, struct sockaddr_in *client_addr) {
    char buffer[BUFFER_SIZE];
    ssize_t bytes_read;
    
    printf("New connection from %s:%u\n",
           inet_ntoa(client_addr->sin_addr),
           ntohs(client_addr->sin_port));
    
    /* Send welcome message */
    const char *welcome = "Welcome to TCP server!\r\n";
    if (send(client_fd, welcome, strlen(welcome), 0) < 0) {
        perror("send");
        return;
    }
    
    /* Echo loop */
    while (1) {
        bytes_read = recv(client_fd, buffer, sizeof(buffer) - 1, 0);
        
        if (bytes_read < 0) {
            if (errno == EAGAIN || errno == EWOULDBLOCK) {
                /* No data available, continue */
                usleep(10000);  /* 10ms */
                continue;
            }
            perror("recv");
            break;
        } else if (bytes_read == 0) {
            /* Connection closed by client */
            printf("Client disconnected\n");
            break;
        }
        
        buffer[bytes_read] = '\0';
        printf("Received: %s", buffer);
        
        /* Echo back to client */
        if (send(client_fd, buffer, bytes_read, 0) < 0) {
            perror("send");
            break;
        }
        
        /* Check for quit command */
        if (strncmp(buffer, "quit", 4) == 0) {
            printf("Client requested disconnect\n");
            break;
        }
    }
}

/**
 * @brief Main server loop
 */
int main(int argc, char *argv[]) {
    int server_fd, client_fd;
    struct sockaddr_in client_addr;
    socklen_t client_len;
    uint16_t port;
    
    /* Parse command line arguments */
    if (argc != 2) {
        fprintf(stderr, "Usage: %s <port>\n", argv[0]);
        return EXIT_FAILURE;
    }
    
    port = (uint16_t)atoi(argv[1]);
    if (port == 0) {
        fprintf(stderr, "Invalid port number\n");
        return EXIT_FAILURE;
    }
    
    /* Create server socket */
    server_fd = create_server_socket(port);
    if (server_fd < 0) {
        return EXIT_FAILURE;
    }
    
    printf("Server started. Press Ctrl+C to stop.\n");
    
    /* Accept connections */
    while (1) {
        client_len = sizeof(client_addr);
        client_fd = accept(server_fd, (struct sockaddr *)&client_addr, &client_len);
        
        if (client_fd < 0) {
            perror("accept");
            continue;
        }
        
        /* Handle client (single-threaded for simplicity) */
        handle_client(client_fd, &client_addr);
        
        /* Close client connection */
        close(client_fd);
    }
    
    /* Cleanup */
    close(server_fd);
    return EXIT_SUCCESS;
}

