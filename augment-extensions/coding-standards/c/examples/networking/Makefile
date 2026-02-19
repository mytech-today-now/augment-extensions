# Makefile for Networking Examples

CC = gcc
CFLAGS = -Wall -Wextra -Werror -std=c11 -pedantic -O2
LDFLAGS =
TARGETS = tcp-server udp-multicast protocol-parser

.PHONY: all clean test

all: $(TARGETS)

tcp-server: tcp-server.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS)

udp-multicast: udp-multicast.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS)

protocol-parser: protocol-parser.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS)

clean:
	rm -f $(TARGETS) *.o

test: all
	@echo "Testing protocol parser..."
	./protocol-parser
	@echo ""
	@echo "To test TCP server:"
	@echo "  Terminal 1: ./tcp-server 8080"
	@echo "  Terminal 2: telnet localhost 8080"
	@echo ""
	@echo "To test UDP multicast:"
	@echo "  Terminal 1: ./udp-multicast recv 239.0.0.1 5000"
	@echo "  Terminal 2: ./udp-multicast send 239.0.0.1 5000"

