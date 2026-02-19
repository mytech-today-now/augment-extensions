# Makefile for Linux Kernel Modules
# Kbuild system for building kernel modules

# Module names
obj-m += simple-module.o
obj-m += char-device.o
obj-m += proc-file.o

# Kernel build directory
KDIR ?= /lib/modules/$(shell uname -r)/build

# Current directory
PWD := $(shell pwd)

# Default target
all:
	$(MAKE) -C $(KDIR) M=$(PWD) modules

# Clean target
clean:
	$(MAKE) -C $(KDIR) M=$(PWD) clean

# Install modules (requires root)
install:
	$(MAKE) -C $(KDIR) M=$(PWD) modules_install

# Help target
help:
	@echo "Kernel Module Makefile"
	@echo "======================"
	@echo "Targets:"
	@echo "  all      - Build all kernel modules (default)"
	@echo "  clean    - Remove build artifacts"
	@echo "  install  - Install modules (requires root)"
	@echo "  load     - Load all modules (requires root)"
	@echo "  unload   - Unload all modules (requires root)"
	@echo ""
	@echo "Individual module targets:"
	@echo "  load-simple    - Load simple-module"
	@echo "  load-chardev   - Load char-device"
	@echo "  load-proc      - Load proc-file"

# Load modules
load: all
	sudo insmod simple-module.ko
	sudo insmod char-device.ko
	sudo insmod proc-file.ko
	@echo "Modules loaded. Check with: lsmod | grep -E 'simple|char|proc'"

# Unload modules
unload:
	-sudo rmmod proc-file
	-sudo rmmod char-device
	-sudo rmmod simple-module
	@echo "Modules unloaded"

# Individual module load targets
load-simple: simple-module.ko
	sudo insmod simple-module.ko
	@echo "simple-module loaded"

load-chardev: char-device.ko
	sudo insmod char-device.ko
	@echo "char-device loaded. Device: /dev/chardev0"

load-proc: proc-file.ko
	sudo insmod proc-file.ko
	@echo "proc-file loaded. Interface: /proc/example_proc"

# Test targets
test-chardev:
	@echo "Testing character device..."
	@echo "test data" | sudo tee /dev/chardev0
	@sudo cat /dev/chardev0

test-proc:
	@echo "Testing proc file..."
	@echo "test value" | sudo tee /proc/example_proc
	@cat /proc/example_proc

.PHONY: all clean install help load unload load-simple load-chardev load-proc test-chardev test-proc

