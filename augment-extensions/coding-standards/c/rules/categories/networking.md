# Rule: Networking

## Metadata
- **ID**: category-networking
- **Category**: networking
- **Severity**: ERROR
- **Standard**: POSIX Sockets, RFC Standards
- **Version**: 1.0.0

## Description
Networking programming rules for socket programming, protocol implementation, packet handling, byte order conversion, and non-blocking I/O.

## Rationale
Network programming requires careful handling of byte order, partial reads/writes, connection states, and error conditions. Improper network code can lead to data corruption, security vulnerabilities, and resource leaks.

## Applies To
- C Standards: c99, c11, c17, c23
- Categories: networking
- Platforms: POSIX-compliant systems, embedded networking stacks

## Rule Details

### 1. Socket Programming
- Always check socket() return value
- Use appropriate socket types (SOCK_STREAM, SOCK_DGRAM)
- Set socket options correctly
- Close sockets properly
- Handle connection failures

### 2. Byte Order Conversion
- Use htons/htonl for host-to-network
- Use ntohs/ntohl for network-to-host
- Convert all multi-byte values
- Document byte order assumptions

### 3. Partial Reads/Writes
- Handle partial send/recv
- Loop until all data transferred
- Check for EINTR and retry
- Use MSG_WAITALL when appropriate

### 4. Non-Blocking I/O
- Use select/poll/epoll for multiplexing
- Handle EAGAIN/EWOULDBLOCK
- Set O_NONBLOCK flag correctly
- Implement proper timeout handling

### 5. Protocol Implementation
- Follow RFC specifications
- Validate all input data
- Implement proper state machines
- Handle protocol errors gracefully

## Examples

### ✅ Example 1: TCP Server Socket Setup

```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <string.h>
#include <errno.h>
#include <stdio.h>

int create_tcp_server(uint16_t port) {
    int sockfd;
    struct sockaddr_in server_addr;
    int opt = 1;
    
    // Create socket
    sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return -1;
    }
    
    // Set socket options (reuse address)
    if (setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        perror("setsockopt");
        close(sockfd);
        return -1;
    }
    
    // Bind to address
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(port);  // Host to network byte order
    
    if (bind(sockfd, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("bind");
        close(sockfd);
        return -1;
    }
    
    // Listen for connections
    if (listen(sockfd, 5) < 0) {
        perror("listen");
        close(sockfd);
        return -1;
    }
    
    return sockfd;
}
```

### ❌ Example 1: Poor Socket Setup

```c
// WRONG: No error checking, missing byte order conversion
int bad_server(uint16_t port) {
    int sockfd = socket(AF_INET, SOCK_STREAM, 0);
    struct sockaddr_in addr;
    addr.sin_port = port;  // WRONG: Missing htons()!
    bind(sockfd, (struct sockaddr*)&addr, sizeof(addr));
    listen(sockfd, 5);
    return sockfd;  // No error checking!
}
```

### ✅ Example 2: Handling Partial Reads/Writes

```c
#include <sys/socket.h>
#include <errno.h>

// Send all data, handling partial writes
ssize_t send_all(int sockfd, const void *buf, size_t len) {
    size_t total_sent = 0;
    ssize_t n;
    
    while (total_sent < len) {
        n = send(sockfd, (char*)buf + total_sent, len - total_sent, 0);
        
        if (n < 0) {
            if (errno == EINTR) {
                continue;  // Interrupted, retry
            }
            return -1;  // Error
        }
        
        if (n == 0) {
            break;  // Connection closed
        }
        
        total_sent += n;
    }
    
    return total_sent;
}

// Receive all data, handling partial reads
ssize_t recv_all(int sockfd, void *buf, size_t len) {
    size_t total_received = 0;
    ssize_t n;
    
    while (total_received < len) {
        n = recv(sockfd, (char*)buf + total_received, len - total_received, 0);
        
        if (n < 0) {
            if (errno == EINTR) {
                continue;  // Interrupted, retry
            }
            return -1;  // Error
        }
        
        if (n == 0) {
            break;  // Connection closed
        }
        
        total_received += n;
    }
    
    return total_received;
}
```

### ❌ Example 2: Ignoring Partial Transfers

```c
// WRONG: Assumes send/recv transfer all data
void bad_transfer(int sockfd, char *buf, size_t len) {
    send(sockfd, buf, len, 0);  // May send less than len!
    recv(sockfd, buf, len, 0);  // May receive less than len!
}
```

### ✅ Example 3: Byte Order Conversion

```c
#include <stdint.h>
#include <arpa/inet.h>

// Network protocol header
typedef struct {
    uint16_t message_type;
    uint16_t message_length;
    uint32_t sequence_number;
    uint32_t timestamp;
} __attribute__((packed)) MessageHeader;

// Serialize header to network byte order
void serialize_header(MessageHeader *hdr) {
    hdr->message_type = htons(hdr->message_type);
    hdr->message_length = htons(hdr->message_length);
    hdr->sequence_number = htonl(hdr->sequence_number);
    hdr->timestamp = htonl(hdr->timestamp);
}

// Deserialize header from network byte order
void deserialize_header(MessageHeader *hdr) {
    hdr->message_type = ntohs(hdr->message_type);
    hdr->message_length = ntohs(hdr->message_length);
    hdr->sequence_number = ntohl(hdr->sequence_number);
    hdr->timestamp = ntohl(hdr->timestamp);
}
```

### ✅ Example 4: Non-Blocking I/O with select()

```c
#include <sys/select.h>
#include <sys/time.h>
#include <fcntl.h>

int set_nonblocking(int sockfd) {
    int flags = fcntl(sockfd, F_GETFL, 0);
    if (flags < 0) {
        return -1;
    }
    return fcntl(sockfd, F_SETFL, flags | O_NONBLOCK);
}

int handle_multiple_connections(int *sockfds, int count, int timeout_sec) {
    fd_set readfds;
    struct timeval timeout;
    int max_fd = 0;
    int ret;

    // Set up file descriptor set
    FD_ZERO(&readfds);
    for (int i = 0; i < count; i++) {
        FD_SET(sockfds[i], &readfds);
        if (sockfds[i] > max_fd) {
            max_fd = sockfds[i];
        }
    }

    // Set timeout
    timeout.tv_sec = timeout_sec;
    timeout.tv_usec = 0;

    // Wait for activity
    ret = select(max_fd + 1, &readfds, NULL, NULL, &timeout);

    if (ret < 0) {
        if (errno == EINTR) {
            return 0;  // Interrupted, try again
        }
        perror("select");
        return -1;
    }

    if (ret == 0) {
        return 0;  // Timeout
    }

    // Check which sockets have data
    for (int i = 0; i < count; i++) {
        if (FD_ISSET(sockfds[i], &readfds)) {
            handle_socket_data(sockfds[i]);
        }
    }

    return ret;
}
```

### ✅ Example 5: UDP Socket Communication

```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

int create_udp_socket(uint16_t port) {
    int sockfd;
    struct sockaddr_in addr;

    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return -1;
    }

    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(port);

    if (bind(sockfd, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
        perror("bind");
        close(sockfd);
        return -1;
    }

    return sockfd;
}

ssize_t udp_send(int sockfd, const void *buf, size_t len,
                 const char *dest_ip, uint16_t dest_port) {
    struct sockaddr_in dest_addr;

    memset(&dest_addr, 0, sizeof(dest_addr));
    dest_addr.sin_family = AF_INET;
    dest_addr.sin_port = htons(dest_port);

    if (inet_pton(AF_INET, dest_ip, &dest_addr.sin_addr) <= 0) {
        return -1;
    }

    return sendto(sockfd, buf, len, 0,
                  (struct sockaddr*)&dest_addr, sizeof(dest_addr));
}

ssize_t udp_recv(int sockfd, void *buf, size_t len,
                 char *src_ip, size_t ip_len, uint16_t *src_port) {
    struct sockaddr_in src_addr;
    socklen_t addr_len = sizeof(src_addr);
    ssize_t n;

    n = recvfrom(sockfd, buf, len, 0,
                 (struct sockaddr*)&src_addr, &addr_len);

    if (n > 0 && src_ip != NULL) {
        inet_ntop(AF_INET, &src_addr.sin_addr, src_ip, ip_len);
        if (src_port != NULL) {
            *src_port = ntohs(src_addr.sin_port);
        }
    }

    return n;
}
```

### ✅ Example 6: TCP Client Connection

```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <netdb.h>

int connect_to_server(const char *hostname, uint16_t port, int timeout_sec) {
    int sockfd;
    struct addrinfo hints, *result, *rp;
    char port_str[6];
    int ret;

    // Convert port to string
    snprintf(port_str, sizeof(port_str), "%u", port);

    // Set up hints
    memset(&hints, 0, sizeof(hints));
    hints.ai_family = AF_UNSPEC;     // IPv4 or IPv6
    hints.ai_socktype = SOCK_STREAM;

    // Resolve hostname
    ret = getaddrinfo(hostname, port_str, &hints, &result);
    if (ret != 0) {
        fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(ret));
        return -1;
    }

    // Try each address until we successfully connect
    for (rp = result; rp != NULL; rp = rp->ai_next) {
        sockfd = socket(rp->ai_family, rp->ai_socktype, rp->ai_protocol);
        if (sockfd < 0) {
            continue;
        }

        // Set timeout
        struct timeval tv;
        tv.tv_sec = timeout_sec;
        tv.tv_usec = 0;
        setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
        setsockopt(sockfd, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));

        // Try to connect
        if (connect(sockfd, rp->ai_addr, rp->ai_addrlen) == 0) {
            break;  // Success
        }

        close(sockfd);
    }

    freeaddrinfo(result);

    if (rp == NULL) {
        fprintf(stderr, "Could not connect to %s:%u\n", hostname, port);
        return -1;
    }

    return sockfd;
}
```

### ✅ Example 7: epoll for High-Performance I/O

```c
#include <sys/epoll.h>

#define MAX_EVENTS 10

int setup_epoll(int listen_sockfd) {
    int epollfd;
    struct epoll_event ev;

    epollfd = epoll_create1(0);
    if (epollfd < 0) {
        perror("epoll_create1");
        return -1;
    }

    // Add listen socket to epoll
    ev.events = EPOLLIN;
    ev.data.fd = listen_sockfd;

    if (epoll_ctl(epollfd, EPOLL_CTL_ADD, listen_sockfd, &ev) < 0) {
        perror("epoll_ctl");
        close(epollfd);
        return -1;
    }

    return epollfd;
}

void epoll_event_loop(int epollfd, int listen_sockfd) {
    struct epoll_event events[MAX_EVENTS];
    int nfds, n;

    while (1) {
        nfds = epoll_wait(epollfd, events, MAX_EVENTS, -1);
        if (nfds < 0) {
            if (errno == EINTR) {
                continue;
            }
            perror("epoll_wait");
            break;
        }

        for (n = 0; n < nfds; n++) {
            if (events[n].data.fd == listen_sockfd) {
                // New connection
                handle_new_connection(epollfd, listen_sockfd);
            } else {
                // Data on existing connection
                handle_client_data(events[n].data.fd);
            }
        }
    }
}
```

### ✅ Example 8: Protocol State Machine

```c
typedef enum {
    STATE_INIT,
    STATE_CONNECTED,
    STATE_AUTHENTICATED,
    STATE_READY,
    STATE_ERROR,
    STATE_CLOSED
} ConnectionState;

typedef struct {
    int sockfd;
    ConnectionState state;
    uint32_t sequence_number;
    char username[64];
} Connection;

int handle_protocol_message(Connection *conn, const void *data, size_t len) {
    MessageHeader *hdr = (MessageHeader*)data;

    // Validate message
    if (len < sizeof(MessageHeader)) {
        conn->state = STATE_ERROR;
        return -1;
    }

    deserialize_header(hdr);

    // State machine
    switch (conn->state) {
        case STATE_CONNECTED:
            if (hdr->message_type == MSG_AUTH_REQUEST) {
                if (authenticate_user(conn, data, len)) {
                    conn->state = STATE_AUTHENTICATED;
                    send_auth_response(conn, true);
                } else {
                    conn->state = STATE_ERROR;
                    send_auth_response(conn, false);
                }
            } else {
                conn->state = STATE_ERROR;
                return -1;
            }
            break;

        case STATE_AUTHENTICATED:
            if (hdr->message_type == MSG_READY) {
                conn->state = STATE_READY;
            }
            break;

        case STATE_READY:
            // Handle normal messages
            process_message(conn, hdr, data, len);
            break;

        default:
            conn->state = STATE_ERROR;
            return -1;
    }

    return 0;
}
```

### ✅ Example 9: Socket Options Configuration

```c
int configure_socket_options(int sockfd) {
    int opt;
    struct linger linger_opt;
    struct timeval timeout;

    // Enable address reuse
    opt = 1;
    if (setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        perror("SO_REUSEADDR");
        return -1;
    }

    // Enable keepalive
    opt = 1;
    if (setsockopt(sockfd, SOL_SOCKET, SO_KEEPALIVE, &opt, sizeof(opt)) < 0) {
        perror("SO_KEEPALIVE");
        return -1;
    }

    // Set send/receive timeouts
    timeout.tv_sec = 30;
    timeout.tv_usec = 0;
    setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));
    setsockopt(sockfd, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof(timeout));

    // Configure linger (wait for data to be sent on close)
    linger_opt.l_onoff = 1;
    linger_opt.l_linger = 5;  // 5 seconds
    if (setsockopt(sockfd, SOL_SOCKET, SO_LINGER, &linger_opt, sizeof(linger_opt)) < 0) {
        perror("SO_LINGER");
        return -1;
    }

    // Disable Nagle's algorithm for low-latency
    opt = 1;
    if (setsockopt(sockfd, IPPROTO_TCP, TCP_NODELAY, &opt, sizeof(opt)) < 0) {
        perror("TCP_NODELAY");
        return -1;
    }

    return 0;
}
```

### ✅ Example 10: Packet Validation

```c
#include <stdint.h>
#include <stdbool.h>

#define MAX_PACKET_SIZE 65535
#define MIN_PACKET_SIZE sizeof(MessageHeader)

bool validate_packet(const void *data, size_t len) {
    const MessageHeader *hdr;

    // Check minimum size
    if (len < MIN_PACKET_SIZE) {
        return false;
    }

    // Check maximum size
    if (len > MAX_PACKET_SIZE) {
        return false;
    }

    hdr = (const MessageHeader*)data;

    // Validate header fields (after byte order conversion)
    MessageHeader temp_hdr = *hdr;
    deserialize_header(&temp_hdr);

    // Check message length matches actual length
    if (temp_hdr.message_length != len) {
        return false;
    }

    // Validate message type
    if (temp_hdr.message_type >= MSG_TYPE_MAX) {
        return false;
    }

    // Check sequence number (should be monotonically increasing)
    // ... additional validation ...

    return true;
}
```

### ✅ Example 11: Graceful Connection Shutdown

```c
int graceful_shutdown(int sockfd) {
    char buf[256];
    ssize_t n;
    int ret;

    // Shutdown write side (send FIN)
    ret = shutdown(sockfd, SHUT_WR);
    if (ret < 0) {
        perror("shutdown");
        close(sockfd);
        return -1;
    }

    // Read remaining data until peer closes
    while (1) {
        n = recv(sockfd, buf, sizeof(buf), 0);
        if (n <= 0) {
            break;  // Connection closed or error
        }
        // Discard data
    }

    // Close socket
    close(sockfd);
    return 0;
}
```

### ✅ Example 12: IPv6 Support

```c
int create_dual_stack_server(uint16_t port) {
    int sockfd;
    struct sockaddr_in6 addr;
    int opt = 1;

    // Create IPv6 socket
    sockfd = socket(AF_INET6, SOCK_STREAM, 0);
    if (sockfd < 0) {
        perror("socket");
        return -1;
    }

    // Enable address reuse
    setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

    // Disable IPv6-only mode (allow IPv4 connections)
    opt = 0;
    if (setsockopt(sockfd, IPPROTO_IPV6, IPV6_V6ONLY, &opt, sizeof(opt)) < 0) {
        perror("IPV6_V6ONLY");
        close(sockfd);
        return -1;
    }

    // Bind to all interfaces
    memset(&addr, 0, sizeof(addr));
    addr.sin6_family = AF_INET6;
    addr.sin6_addr = in6addr_any;
    addr.sin6_port = htons(port);

    if (bind(sockfd, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
        perror("bind");
        close(sockfd);
        return -1;
    }

    if (listen(sockfd, 5) < 0) {
        perror("listen");
        close(sockfd);
        return -1;
    }

    return sockfd;
}
```

## References

- POSIX.1-2017 Sockets API
- Stevens, W. Richard. "Unix Network Programming"
- RFC 793 (TCP), RFC 768 (UDP), RFC 791 (IP)
- Beej's Guide to Network Programming
- Linux Socket Programming by Example

## Related Rules

- category-systems
- universal-error-handling
- universal-memory-safety

## Configuration

Enable in `.augment/c-standards.json`:

```json
{
  "categories": ["networking"],
  "category_overrides": {
    "networking": {
      "require_byte_order_conversion": true,
      "check_partial_transfers": true,
      "enforce_timeout_handling": true
    }
  }
}
```

