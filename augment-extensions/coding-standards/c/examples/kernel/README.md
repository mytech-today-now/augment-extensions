# Linux Kernel Development Examples

This directory contains Linux kernel module examples demonstrating kernel programming best practices.

## Examples

### 1. simple-module.c
Basic kernel module structure:
- Module initialization and cleanup
- Module parameters
- Kernel logging with printk
- Module metadata
- Error handling

**Key Concepts:**
- Use `module_init()` and `module_exit()`
- Always check return values
- Clean up resources in exit function
- Use appropriate log levels

### 2. char-device.c
Character device driver:
- Device registration with cdev
- File operations (open, read, write, release)
- Device number allocation
- User-kernel space data transfer
- Device class creation

**Key Concepts:**
- Use `copy_to_user()` and `copy_from_user()`
- Proper error handling and cleanup
- Device file creation in /dev
- Resource management

### 3. proc-file.c
/proc filesystem interface:
- Creating /proc entries
- Sequence file interface
- Read/write operations
- Kernel-user communication

**Key Concepts:**
- Use seq_file for /proc entries
- Handle user input safely
- Proper buffer management

## Building

```bash
# Build all modules
make

# Build specific module
make simple-module.ko

# Clean build artifacts
make clean
```

## Loading and Testing

```bash
# Load modules
sudo insmod simple-module.ko
sudo insmod simple-module.ko debug_level=2  # With parameter
sudo insmod char-device.ko
sudo insmod proc-file.ko

# Check loaded modules
lsmod | grep -E 'simple|char|proc'

# View kernel logs
dmesg | tail -20

# Test character device
echo "test data" | sudo tee /dev/chardev0
sudo cat /dev/chardev0

# Test proc file
echo "test value" | sudo tee /proc/example_proc
cat /proc/example_proc

# Unload modules
sudo rmmod proc-file
sudo rmmod char-device
sudo rmmod simple-module
```

## Requirements

- Linux kernel headers: `sudo apt-get install linux-headers-$(uname -r)`
- GCC compiler
- Make
- Root privileges for loading/unloading modules

## Best Practices Demonstrated

1. **Error Handling**
   - Check all allocation results
   - Clean up on error paths
   - Return appropriate error codes

2. **Resource Management**
   - Free all allocated memory
   - Unregister devices
   - Remove proc entries

3. **Kernel Coding Style**
   - Follow Linux kernel coding style
   - Use kernel API functions
   - Proper indentation and naming

4. **Safety**
   - Validate user input
   - Use safe copy functions
   - Check buffer boundaries

## Common Pitfalls to Avoid

1. **Memory Leaks**
   ```c
   // WRONG - No cleanup on error
   data = kmalloc(size, GFP_KERNEL);
   if (register_device() < 0)
       return -EFAULT;  // Leaked memory!
   
   // CORRECT
   data = kmalloc(size, GFP_KERNEL);
   if (register_device() < 0) {
       kfree(data);
       return -EFAULT;
   }
   ```

2. **Direct User Memory Access**
   ```c
   // WRONG - Direct access
   strcpy(kernel_buf, user_buf);  // Unsafe!
   
   // CORRECT
   if (copy_from_user(kernel_buf, user_buf, size))
       return -EFAULT;
   ```

3. **Missing Cleanup**
   ```c
   // WRONG - Incomplete cleanup
   static void __exit module_exit(void) {
       device_destroy(dev);
       // Forgot to destroy class!
   }
   
   // CORRECT
   static void __exit module_exit(void) {
       device_destroy(chardev_class, dev);
       class_destroy(chardev_class);
       cdev_del(&chardev_cdev);
       unregister_chrdev_region(dev, 1);
   }
   ```

## References

- Linux Kernel Documentation: https://www.kernel.org/doc/html/latest/
- Linux Device Drivers (LDD3)
- Linux Kernel Development by Robert Love
- Kernel coding style: Documentation/process/coding-style.rst

