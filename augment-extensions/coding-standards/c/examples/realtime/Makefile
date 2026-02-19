# Makefile for Real-Time Systems Examples
# Requires FreeRTOS or compatible RTOS

# FreeRTOS paths (adjust for your installation)
FREERTOS_DIR ?= /opt/FreeRTOS
FREERTOS_SRC = $(FREERTOS_DIR)/Source
FREERTOS_PORT = $(FREERTOS_SRC)/portable/GCC/ARM_CM3

CC = arm-none-eabi-gcc
CFLAGS = -Wall -Wextra -std=c11 -O2
CFLAGS += -mcpu=cortex-m3 -mthumb
CFLAGS += -DUSE_FREERTOS
CFLAGS += -I$(FREERTOS_SRC)/include
CFLAGS += -I$(FREERTOS_PORT)
CFLAGS += -I.

# Source files
SRCS = priority-scheduling.c deadline-monitoring.c

# For host compilation (testing structure only)
HOST_CC = gcc
HOST_CFLAGS = -Wall -Wextra -std=c11 -O2

.PHONY: all clean host-test

# Default target (requires RTOS)
all:
	@echo "This requires FreeRTOS or compatible RTOS"
	@echo "Set FREERTOS_DIR to your FreeRTOS installation"
	@echo "Or use 'make host-test' for syntax checking"

# Host compilation for syntax checking
host-test:
	$(HOST_CC) $(HOST_CFLAGS) -c priority-scheduling.c -o priority-scheduling.o
	$(HOST_CC) $(HOST_CFLAGS) -c deadline-monitoring.c -o deadline-monitoring.o
	@echo "Syntax check passed"

clean:
	rm -f *.o *.elf *.bin

help:
	@echo "Real-Time Systems Examples Makefile"
	@echo "===================================="
	@echo "Targets:"
	@echo "  all        - Build for target (requires RTOS)"
	@echo "  host-test  - Syntax check on host"
	@echo "  clean      - Remove build artifacts"
	@echo ""
	@echo "Requirements:"
	@echo "  - FreeRTOS or compatible RTOS"
	@echo "  - ARM GCC toolchain (for embedded)"
	@echo "  - GCC (for host testing)"

