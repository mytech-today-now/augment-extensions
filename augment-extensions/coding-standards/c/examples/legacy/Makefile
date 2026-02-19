# Makefile for Legacy Maintenance Examples

CC = gcc
CFLAGS_C89 = -Wall -Wextra -std=c89 -pedantic -DUSE_C89
CFLAGS_C99 = -Wall -Wextra -std=c99 -pedantic
CFLAGS_C11 = -Wall -Wextra -std=c11 -pedantic

.PHONY: all clean test compare

all: migration-c89 migration-c11 compatibility

# C89 version of migration example
migration-c89: c89-to-c11-migration.c
	$(CC) $(CFLAGS_C89) -o $@ $<

# C11 version of migration example
migration-c11: c89-to-c11-migration.c
	$(CC) $(CFLAGS_C11) -o $@ $<

# Compatibility layer
compatibility: compatibility-layer.c
	$(CC) $(CFLAGS_C11) -o $@ $<

clean:
	rm -f migration-c89 migration-c11 compatibility *.o

test: all
	@echo "=== Testing C89 Version ==="
	./migration-c89
	@echo ""
	@echo "=== Testing C11 Version ==="
	./migration-c11
	@echo ""
	@echo "=== Testing Compatibility Layer ==="
	./compatibility

compare: all
	@echo "Comparing C89 vs C11 output:"
	@echo ""
	@echo "--- C89 Output ---"
	@./migration-c89 > /tmp/c89-output.txt 2>&1
	@cat /tmp/c89-output.txt
	@echo ""
	@echo "--- C11 Output ---"
	@./migration-c11 > /tmp/c11-output.txt 2>&1
	@cat /tmp/c11-output.txt
	@echo ""
	@echo "--- Differences ---"
	@diff -u /tmp/c89-output.txt /tmp/c11-output.txt || true

help:
	@echo "Legacy Maintenance Examples Makefile"
	@echo "====================================="
	@echo "Targets:"
	@echo "  all         - Build all examples"
	@echo "  migration-c89 - Build C89 version"
	@echo "  migration-c11 - Build C11 version"
	@echo "  compatibility - Build compatibility layer"
	@echo "  clean       - Remove build artifacts"
	@echo "  test        - Run all examples"
	@echo "  compare     - Compare C89 vs C11 output"

