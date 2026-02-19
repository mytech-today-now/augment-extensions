/**
 * @file char-device.c
 * @brief Example Linux kernel character device driver
 * 
 * This example demonstrates:
 * - Character device registration
 * - File operations (open, read, write, release)
 * - Device number allocation
 * - Module initialization and cleanup
 * - Kernel memory allocation
 * 
 * Build: make
 * Load: sudo insmod char-device.ko
 * Test: echo "test" > /dev/chardev0
 *       cat /dev/chardev0
 * Unload: sudo rmmod char-device
 */

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/fs.h>
#include <linux/cdev.h>
#include <linux/device.h>
#include <linux/slab.h>
#include <linux/uaccess.h>

#define DEVICE_NAME "chardev"
#define CLASS_NAME  "chardev_class"
#define BUFFER_SIZE 1024

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Example Author");
MODULE_DESCRIPTION("Simple character device driver");
MODULE_VERSION("1.0");

static int major_number;
static struct class *chardev_class = NULL;
static struct device *chardev_device = NULL;
static struct cdev chardev_cdev;

// Device buffer
static char *device_buffer = NULL;
static size_t buffer_size = 0;

/**
 * @brief Device open function
 */
static int chardev_open(struct inode *inode, struct file *file) {
    pr_info("chardev: Device opened\n");
    return 0;
}

/**
 * @brief Device release function
 */
static int chardev_release(struct inode *inode, struct file *file) {
    pr_info("chardev: Device closed\n");
    return 0;
}

/**
 * @brief Device read function
 */
static ssize_t chardev_read(struct file *file, char __user *user_buffer,
                            size_t count, loff_t *offset) {
    size_t to_read;
    
    if (*offset >= buffer_size) {
        return 0;  // EOF
    }
    
    to_read = min(count, buffer_size - (size_t)*offset);
    
    if (copy_to_user(user_buffer, device_buffer + *offset, to_read)) {
        return -EFAULT;
    }
    
    *offset += to_read;
    pr_info("chardev: Read %zu bytes\n", to_read);
    
    return to_read;
}

/**
 * @brief Device write function
 */
static ssize_t chardev_write(struct file *file, const char __user *user_buffer,
                             size_t count, loff_t *offset) {
    size_t to_write;
    
    if (count > BUFFER_SIZE) {
        return -EINVAL;
    }
    
    to_write = min(count, (size_t)BUFFER_SIZE);
    
    if (copy_from_user(device_buffer, user_buffer, to_write)) {
        return -EFAULT;
    }
    
    buffer_size = to_write;
    pr_info("chardev: Wrote %zu bytes\n", to_write);
    
    return to_write;
}

// File operations structure
static struct file_operations fops = {
    .owner = THIS_MODULE,
    .open = chardev_open,
    .release = chardev_release,
    .read = chardev_read,
    .write = chardev_write,
};

/**
 * @brief Module initialization
 */
static int __init chardev_init(void) {
    dev_t dev;
    int ret;
    
    pr_info("chardev: Initializing module\n");
    
    // Allocate device buffer
    device_buffer = kmalloc(BUFFER_SIZE, GFP_KERNEL);
    if (!device_buffer) {
        pr_err("chardev: Failed to allocate buffer\n");
        return -ENOMEM;
    }
    
    // Allocate device number
    ret = alloc_chrdev_region(&dev, 0, 1, DEVICE_NAME);
    if (ret < 0) {
        pr_err("chardev: Failed to allocate device number\n");
        goto fail_alloc;
    }
    major_number = MAJOR(dev);
    
    // Initialize cdev
    cdev_init(&chardev_cdev, &fops);
    chardev_cdev.owner = THIS_MODULE;
    
    // Add cdev
    ret = cdev_add(&chardev_cdev, dev, 1);
    if (ret < 0) {
        pr_err("chardev: Failed to add cdev\n");
        goto fail_cdev;
    }
    
    // Create device class
    chardev_class = class_create(THIS_MODULE, CLASS_NAME);
    if (IS_ERR(chardev_class)) {
        pr_err("chardev: Failed to create class\n");
        ret = PTR_ERR(chardev_class);
        goto fail_class;
    }
    
    // Create device
    chardev_device = device_create(chardev_class, NULL, dev, NULL, DEVICE_NAME "0");
    if (IS_ERR(chardev_device)) {
        pr_err("chardev: Failed to create device\n");
        ret = PTR_ERR(chardev_device);
        goto fail_device;
    }
    
    pr_info("chardev: Module loaded successfully\n");
    return 0;
    
fail_device:
    class_destroy(chardev_class);
fail_class:
    cdev_del(&chardev_cdev);
fail_cdev:
    unregister_chrdev_region(dev, 1);
fail_alloc:
    kfree(device_buffer);
    return ret;
}

/**
 * @brief Module cleanup
 */
static void __exit chardev_exit(void) {
    dev_t dev = MKDEV(major_number, 0);
    
    device_destroy(chardev_class, dev);
    class_destroy(chardev_class);
    cdev_del(&chardev_cdev);
    unregister_chrdev_region(dev, 1);
    kfree(device_buffer);
    
    pr_info("chardev: Module unloaded\n");
}

module_init(chardev_init);
module_exit(chardev_exit);

