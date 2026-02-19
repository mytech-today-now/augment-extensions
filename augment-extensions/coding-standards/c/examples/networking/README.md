# Networking Examples

This directory contains network programming examples demonstrating socket programming and protocol handling.

## Examples

### 1. tcp-server.c
TCP server with connection handling:
- Socket creation and binding
- Connection acceptance
- Echo server implementation
- Error handling
- Resource cleanup

**Key Concepts:**
- Use `SO_REUSEADDR` for quick restart
- Check all socket operation return values
- Close sockets properly
- Handle partial reads/writes

### 2. udp-multicast.c
UDP multicast sender and receiver:
- Multicast group management
- Sending multicast packets
- Receiving multicast packets
- TTL configuration
- Multiple receivers

**Key Concepts:**
- Join multicast group with `IP_ADD_MEMBERSHIP`
- Set multicast TTL appropriately
- Use `SO_REUSEADDR` for multiple receivers
- Multicast addresses: 224.0.0.0 to 239.255.255.255

### 3. protocol-parser.c
Binary protocol parser:
- State machine parsing
- Endianness handling
- Checksum validation
- Error detection
- Input validation

**Key Concepts:**
- Parse byte-by-byte with state machine
- Validate all inputs
- Handle network byte order (big-endian)
- Implement error recovery

## Building

```bash
# Build all examples
make

# Build specific example
make tcp-server

# Clean
make clean

# Run tests
make test
```

## Running Examples

### TCP Server

```bash
# Terminal 1: Start server
./tcp-server 8080

# Terminal 2: Connect with telnet
telnet localhost 8080

# Or use netcat
nc localhost 8080
```

### UDP Multicast

```bash
# Terminal 1: Start receiver
./udp-multicast recv 239.0.0.1 5000

# Terminal 2: Start sender
./udp-multicast send 239.0.0.1 5000

# You can run multiple receivers
```

### Protocol Parser

```bash
# Run parser test
./protocol-parser
```

## Network Programming Best Practices

1. **Error Handling**
   - Check all socket operations
   - Handle `EINTR` for interrupted system calls
   - Handle `EAGAIN`/`EWOULDBLOCK` for non-blocking I/O
   - Close sockets on error

2. **Resource Management**
   - Always close sockets
   - Use `SO_REUSEADDR` for servers
   - Set appropriate timeouts
   - Limit buffer sizes

3. **Protocol Design**
   - Use network byte order (big-endian)
   - Include length fields
   - Add checksums for integrity
   - Version your protocol

4. **Security**
   - Validate all inputs
   - Limit buffer sizes
   - Use timeouts
   - Handle malformed data

## Common Pitfalls

1. **Forgetting Network Byte Order**
   ```c
   // WRONG
   uint16_t port = 8080;
   addr.sin_port = port;
   
   // CORRECT
   addr.sin_port = htons(8080);
   ```

2. **Not Handling Partial Reads/Writes**
   ```c
   // WRONG - Assumes all data sent
   send(sockfd, buffer, size, 0);
   
   // CORRECT - Handle partial sends
   size_t sent = 0;
   while (sent < size) {
       ssize_t n = send(sockfd, buffer + sent, size - sent, 0);
       if (n < 0) { /* error */ }
       sent += n;
   }
   ```

3. **Not Closing Sockets**
   ```c
   // WRONG - Socket leak
   int sockfd = socket(AF_INET, SOCK_STREAM, 0);
   if (bind(sockfd, ...) < 0) {
       return -1;  // Leaked socket!
   }
   
   // CORRECT
   int sockfd = socket(AF_INET, SOCK_STREAM, 0);
   if (bind(sockfd, ...) < 0) {
       close(sockfd);
       return -1;
   }
   ```

4. **Buffer Overflows**
   ```c
   // WRONG - No bounds checking
   char buffer[100];
   recv(sockfd, buffer, 1000, 0);  // Overflow!
   
   // CORRECT
   char buffer[100];
   ssize_t n = recv(sockfd, buffer, sizeof(buffer) - 1, 0);
   if (n > 0) {
       buffer[n] = '\0';
   }
   ```

## Protocol Format

The example protocol uses this format:

```
+--------+--------+--------+--------+--------+--------+
| MAGIC  | MAGIC  | TYPE   | LENGTH | LENGTH | CHKSUM |
| (MSB)  | (LSB)  |        | (MSB)  | (LSB)  |        |
+--------+--------+--------+--------+--------+--------+
| PAYLOAD (variable length)                          |
+----------------------------------------------------+
```

- **MAGIC**: 0xABCD (protocol identifier)
- **TYPE**: Message type (1 byte)
- **LENGTH**: Payload length in bytes (2 bytes, big-endian)
- **CHECKSUM**: XOR checksum of payload
- **PAYLOAD**: Message data

## References

- POSIX Socket API: https://pubs.opengroup.org/onlinepubs/9699919799/
- TCP/IP Illustrated by W. Richard Stevens
- Unix Network Programming by W. Richard Stevens
- RFC 1112: Host Extensions for IP Multicasting
- Beej's Guide to Network Programming

