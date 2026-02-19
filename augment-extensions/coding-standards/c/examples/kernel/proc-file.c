/**
 * @file proc-file.c
 * @brief Example Linux kernel /proc filesystem interface
 * 
 * This example demonstrates:
 * - Creating /proc entries
 * - Read/write operations in /proc
 * - Kernel-user space data transfer
 * - Sequence file interface
 * 
 * Build: make
 * Load: sudo insmod proc-file.ko
 * Test: cat /proc/example_proc
 *       echo "value" > /proc/example_proc
 * Unload: sudo rmmod proc-file
 */

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/uaccess.h>
#include <linux/slab.h>

#define PROC_NAME "example_proc"
#define BUFFER_SIZE 256

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Example Author");
MODULE_DESCRIPTION("Example /proc file interface");
MODULE_VERSION("1.0");

static struct proc_dir_entry *proc_entry = NULL;
static char *proc_buffer = NULL;
static size_t proc_buffer_size = 0;

/**
 * @brief Show function for seq_file
 */
static int proc_show(struct seq_file *m, void *v) {
    if (proc_buffer_size > 0) {
        seq_printf(m, "Stored data: %s\n", proc_buffer);
        seq_printf(m, "Buffer size: %zu bytes\n", proc_buffer_size);
    } else {
        seq_printf(m, "No data stored\n");
    }
    
    seq_printf(m, "Module loaded at: %s %s\n", __DATE__, __TIME__);
    return 0;
}

/**
 * @brief Open function for proc file
 */
static int proc_open(struct inode *inode, struct file *file) {
    return single_open(file, proc_show, NULL);
}

/**
 * @brief Write function for proc file
 */
static ssize_t proc_write(struct file *file, const char __user *user_buffer,
                          size_t count, loff_t *offset) {
    size_t to_copy;
    
    if (count > BUFFER_SIZE - 1) {
        pr_warn("proc_file: Input too large, truncating\n");
        to_copy = BUFFER_SIZE - 1;
    } else {
        to_copy = count;
    }
    
    if (copy_from_user(proc_buffer, user_buffer, to_copy)) {
        return -EFAULT;
    }
    
    proc_buffer[to_copy] = '\0';  // Null-terminate
    proc_buffer_size = to_copy;
    
    pr_info("proc_file: Received %zu bytes\n", to_copy);
    return to_copy;
}

// File operations for proc file
static const struct proc_ops proc_fops = {
    .proc_open = proc_open,
    .proc_read = seq_read,
    .proc_write = proc_write,
    .proc_lseek = seq_lseek,
    .proc_release = single_release,
};

/**
 * @brief Module initialization
 */
static int __init proc_file_init(void) {
    pr_info("proc_file: Initializing module\n");
    
    // Allocate buffer
    proc_buffer = kmalloc(BUFFER_SIZE, GFP_KERNEL);
    if (!proc_buffer) {
        pr_err("proc_file: Failed to allocate buffer\n");
        return -ENOMEM;
    }
    
    memset(proc_buffer, 0, BUFFER_SIZE);
    
    // Create proc entry
    proc_entry = proc_create(PROC_NAME, 0666, NULL, &proc_fops);
    if (!proc_entry) {
        pr_err("proc_file: Failed to create /proc/%s\n", PROC_NAME);
        kfree(proc_buffer);
        return -ENOMEM;
    }
    
    pr_info("proc_file: Created /proc/%s\n", PROC_NAME);
    return 0;
}

/**
 * @brief Module cleanup
 */
static void __exit proc_file_exit(void) {
    proc_remove(proc_entry);
    kfree(proc_buffer);
    pr_info("proc_file: Module unloaded\n");
}

module_init(proc_file_init);
module_exit(proc_file_exit);

