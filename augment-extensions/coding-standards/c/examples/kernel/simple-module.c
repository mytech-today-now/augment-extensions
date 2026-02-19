/**
 * @file simple-module.c
 * @brief Example Linux kernel module demonstrating basic module structure
 * 
 * This example demonstrates:
 * - Module initialization and cleanup
 * - Module parameters
 * - Kernel logging (printk)
 * - Module metadata
 * - Error handling in init
 * 
 * Build: make
 * Load: sudo insmod simple-module.ko
 * Load with param: sudo insmod simple-module.ko debug_level=2
 * Check logs: dmesg | tail
 * Unload: sudo rmmod simple-module
 */

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>
#include <linux/slab.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Example Author <author@example.com>");
MODULE_DESCRIPTION("Simple example kernel module");
MODULE_VERSION("1.0");

// Module parameters
static int debug_level = 0;
module_param(debug_level, int, 0644);
MODULE_PARM_DESC(debug_level, "Debug level (0=off, 1=info, 2=verbose)");

static char *message = "Hello";
module_param(message, charp, 0644);
MODULE_PARM_DESC(message, "Custom message to display");

// Module data
static void *module_data = NULL;

/**
 * @brief Helper function to demonstrate kernel logging
 */
static void log_message(int level, const char *msg) {
    switch (level) {
        case 0:
            pr_err("simple_module: ERROR: %s\n", msg);
            break;
        case 1:
            pr_info("simple_module: INFO: %s\n", msg);
            break;
        case 2:
            pr_debug("simple_module: DEBUG: %s\n", msg);
            break;
        default:
            pr_warn("simple_module: WARN: %s\n", msg);
    }
}

/**
 * @brief Module initialization function
 * @return 0 on success, negative error code on failure
 */
static int __init simple_module_init(void) {
    pr_info("simple_module: Initializing module\n");
    pr_info("simple_module: Debug level: %d\n", debug_level);
    pr_info("simple_module: Message: %s\n", message);
    
    // Allocate some memory (example)
    module_data = kmalloc(1024, GFP_KERNEL);
    if (!module_data) {
        pr_err("simple_module: Failed to allocate memory\n");
        return -ENOMEM;
    }
    
    if (debug_level >= 1) {
        log_message(1, "Module data allocated successfully");
    }
    
    // Simulate initialization work
    if (debug_level >= 2) {
        log_message(2, "Performing detailed initialization");
    }
    
    pr_info("simple_module: Module loaded successfully\n");
    return 0;
}

/**
 * @brief Module cleanup function
 */
static void __exit simple_module_exit(void) {
    pr_info("simple_module: Cleaning up module\n");
    
    // Free allocated memory
    if (module_data) {
        kfree(module_data);
        module_data = NULL;
        
        if (debug_level >= 1) {
            log_message(1, "Module data freed");
        }
    }
    
    pr_info("simple_module: Module unloaded\n");
}

// Register init and exit functions
module_init(simple_module_init);
module_exit(simple_module_exit);

