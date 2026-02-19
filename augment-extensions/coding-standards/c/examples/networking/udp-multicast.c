/**
 * @file udp-multicast.c
 * @brief Example UDP multicast sender and receiver
 * 
 * This example demonstrates:
 * - UDP multicast group management
 * - Sending multicast packets
 * - Receiving multicast packets
 * - Socket options for multicast
 * - Error handling
 * 
 * Compile: gcc -Wall -Wextra -std=c11 -o udp-multicast udp-multicast.c
 * Run sender: ./udp-multicast send 239.0.0.1 5000
 * Run receiver: ./udp-multicast recv 239.0.0.1 5000
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
#include <time.h>

#define BUFFER_SIZE 1024
#define MULTICAST_TTL 32

/**
 * @brief Create multicast sender socket
 */
static int create_multicast_sender(const char *group_addr, uint16_t port,
                                   struct sockaddr_in *dest_addr) {
    int sockfd;
    unsigned char ttl = MULTICAST_TTL;
    
    /* Create UDP socket */
    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return -1;
    }
    
    /* Set multicast TTL */
    if (setsockopt(sockfd, IPPROTO_IP, IP_MULTICAST_TTL, &ttl, sizeof(ttl)) < 0) {
        perror("setsockopt(IP_MULTICAST_TTL)");
        close(sockfd);
        return -1;
    }
    
    /* Setup destination address */
    memset(dest_addr, 0, sizeof(*dest_addr));
    dest_addr->sin_family = AF_INET;
    dest_addr->sin_port = htons(port);
    if (inet_aton(group_addr, &dest_addr->sin_addr) == 0) {
        fprintf(stderr, "Invalid multicast address\n");
        close(sockfd);
        return -1;
    }
    
    printf("Multicast sender created for %s:%u\n", group_addr, port);
    return sockfd;
}

/**
 * @brief Create multicast receiver socket
 */
static int create_multicast_receiver(const char *group_addr, uint16_t port) {
    int sockfd;
    struct sockaddr_in local_addr;
    struct ip_mreq mreq;
    int reuse = 1;
    
    /* Create UDP socket */
    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return -1;
    }
    
    /* Allow multiple receivers on same port */
    if (setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(reuse)) < 0) {
        perror("setsockopt(SO_REUSEADDR)");
        close(sockfd);
        return -1;
    }
    
    /* Bind to multicast port */
    memset(&local_addr, 0, sizeof(local_addr));
    local_addr.sin_family = AF_INET;
    local_addr.sin_addr.s_addr = INADDR_ANY;
    local_addr.sin_port = htons(port);
    
    if (bind(sockfd, (struct sockaddr *)&local_addr, sizeof(local_addr)) < 0) {
        perror("bind");
        close(sockfd);
        return -1;
    }
    
    /* Join multicast group */
    memset(&mreq, 0, sizeof(mreq));
    if (inet_aton(group_addr, &mreq.imr_multiaddr) == 0) {
        fprintf(stderr, "Invalid multicast address\n");
        close(sockfd);
        return -1;
    }
    mreq.imr_interface.s_addr = INADDR_ANY;
    
    if (setsockopt(sockfd, IPPROTO_IP, IP_ADD_MEMBERSHIP, &mreq, sizeof(mreq)) < 0) {
        perror("setsockopt(IP_ADD_MEMBERSHIP)");
        close(sockfd);
        return -1;
    }
    
    printf("Multicast receiver joined group %s:%u\n", group_addr, port);
    return sockfd;
}

/**
 * @brief Run multicast sender
 */
static void run_sender(int sockfd, struct sockaddr_in *dest_addr) {
    char buffer[BUFFER_SIZE];
    int count = 0;
    
    printf("Sending multicast messages (Ctrl+C to stop)...\n");
    
    while (1) {
        /* Create message with timestamp */
        time_t now = time(NULL);
        snprintf(buffer, sizeof(buffer), 
                "Multicast message #%d at %s", count++, ctime(&now));
        
        /* Send multicast packet */
        ssize_t sent = sendto(sockfd, buffer, strlen(buffer), 0,
                             (struct sockaddr *)dest_addr, sizeof(*dest_addr));
        if (sent < 0) {
            perror("sendto");
            break;
        }
        
        printf("Sent: %s", buffer);
        sleep(2);  /* Send every 2 seconds */
    }
}

/**
 * @brief Run multicast receiver
 */
static void run_receiver(int sockfd) {
    char buffer[BUFFER_SIZE];
    struct sockaddr_in sender_addr;
    socklen_t sender_len;
    
    printf("Receiving multicast messages (Ctrl+C to stop)...\n");
    
    while (1) {
        sender_len = sizeof(sender_addr);
        ssize_t received = recvfrom(sockfd, buffer, sizeof(buffer) - 1, 0,
                                   (struct sockaddr *)&sender_addr, &sender_len);
        
        if (received < 0) {
            perror("recvfrom");
            break;
        }
        
        buffer[received] = '\0';
        printf("Received from %s:%u: %s",
               inet_ntoa(sender_addr.sin_addr),
               ntohs(sender_addr.sin_port),
               buffer);
    }
}

/**
 * @brief Main function
 */
int main(int argc, char *argv[]) {
    int sockfd;
    const char *mode, *group_addr;
    uint16_t port;
    
    /* Parse arguments */
    if (argc != 4) {
        fprintf(stderr, "Usage: %s <send|recv> <multicast_addr> <port>\n", argv[0]);
        fprintf(stderr, "Example: %s send 239.0.0.1 5000\n", argv[0]);
        fprintf(stderr, "         %s recv 239.0.0.1 5000\n", argv[0]);
        return EXIT_FAILURE;
    }
    
    mode = argv[1];
    group_addr = argv[2];
    port = (uint16_t)atoi(argv[3]);
    
    if (strcmp(mode, "send") == 0) {
        /* Sender mode */
        struct sockaddr_in dest_addr;
        sockfd = create_multicast_sender(group_addr, port, &dest_addr);
        if (sockfd < 0) {
            return EXIT_FAILURE;
        }
        run_sender(sockfd, &dest_addr);
    } else if (strcmp(mode, "recv") == 0) {
        /* Receiver mode */
        sockfd = create_multicast_receiver(group_addr, port);
        if (sockfd < 0) {
            return EXIT_FAILURE;
        }
        run_receiver(sockfd);
    } else {
        fprintf(stderr, "Invalid mode: %s (use 'send' or 'recv')\n", mode);
        return EXIT_FAILURE;
    }
    
    close(sockfd);
    return EXIT_SUCCESS;
}

