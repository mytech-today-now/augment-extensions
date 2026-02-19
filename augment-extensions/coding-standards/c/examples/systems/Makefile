# Makefile for Systems Programming Examples
# Demonstrates POSIX-compliant build process

CC = gcc
CFLAGS = -Wall -Wextra -Werror -std=c11 -pedantic -O2
LDFLAGS =
TARGETS = process-management ipc-pipes signal-handling

.PHONY: all clean test

all: $(TARGETS)

process-management: process-management.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS)

ipc-pipes: ipc-pipes.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS)

signal-handling: signal-handling.c
	$(CC) $(CFLAGS) -o $@ $< $(LDFLAGS)

clean:
	rm -f $(TARGETS) *.o

test: all
	@echo "Running process-management..."
	./process-management
	@echo ""
	@echo "Running ipc-pipes..."
	./ipc-pipes
	@echo ""
	@echo "Note: signal-handling requires manual testing (Ctrl+C, kill signals)"
	@echo "Run: ./signal-handling"

