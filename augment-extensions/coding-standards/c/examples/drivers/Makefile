# Makefile for Device Driver Examples

obj-m += platform-driver.o
obj-m += dma-example.o

KDIR ?= /lib/modules/$(shell uname -r)/build
PWD := $(shell pwd)

all:
	$(MAKE) -C $(KDIR) M=$(PWD) modules

clean:
	$(MAKE) -C $(KDIR) M=$(PWD) clean
	rm -f *.dtb

# Device tree compilation
dtb: example.dts
	dtc -I dts -O dtb -o example.dtb example.dts
	@echo "Device tree blob created: example.dtb"

# Load modules
load: all
	sudo insmod platform-driver.ko
	sudo insmod dma-example.ko
	@echo "Drivers loaded"

unload:
	-sudo rmmod dma-example
	-sudo rmmod platform-driver
	@echo "Drivers unloaded"

.PHONY: all clean dtb load unload

