# Rule: Kernel Development

## Metadata
- **ID**: category-kernel
- **Category**: kernel
- **Severity**: ERROR
- **Standard**: Linux Kernel Coding Style
- **Version**: 1.0.0

## Description
Kernel development rules for Linux kernel modules, kernel APIs, locking mechanisms, and kernel subsystem integration.

## Rationale
Kernel code runs in privileged mode with direct hardware access. Bugs can crash the entire system, corrupt data, or create security vulnerabilities. Strict adherence to kernel coding standards ensures stability, security, and maintainability.

## Applies To
- C Standards: c89, c99, c11
- Categories: kernel
- Platforms: Linux kernel (2.6+, 3.x, 4.x, 5.x, 6.x)

## Rule Details

### 1. Module Initialization and Cleanup
- Use module_init() and module_exit() macros
- Always provide MODULE_LICENSE()
- Clean up all resources in exit function
- Handle initialization failures properly

### 2. Kernel Memory Allocation
- Use kmalloc/kfree for small allocations
- Use vmalloc/vfree for large allocations
- Always check allocation return values
- Use appropriate GFP flags (GFP_KERNEL, GFP_ATOMIC)

### 3. Kernel Logging
- Use pr_* macros (pr_info, pr_err, pr_debug)
- Use dev_* macros for device-specific messages
- Avoid printk() directly
- Use appropriate log levels

### 4. Locking Mechanisms
- Use spinlocks for short critical sections
- Use mutexes for longer critical sections
- Never sleep while holding a spinlock
- Avoid deadlocks with proper lock ordering

### 5. User-Kernel Space Interaction
- Use copy_to_user/copy_from_user for data transfer
- Validate all user-space pointers
- Never trust user-space data
- Use access_ok() to verify addresses

## Examples

### ✅ Example 1: Proper Module Structure

```c
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/init.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("Example kernel module");
MODULE_VERSION("1.0");

static int __init example_init(void) {
    pr_info("Example module loaded\n");
    
    // Initialize resources
    int ret = initialize_resources();
    if (ret < 0) {
        pr_err("Failed to initialize resources: %d\n", ret);
        return ret;
    }
    
    return 0;
}

static void __exit example_exit(void) {
    // Clean up all resources
    cleanup_resources();
    pr_info("Example module unloaded\n");
}

module_init(example_init);
module_exit(example_exit);
```

### ❌ Example 1: Missing Module Metadata

```c
// WRONG: Missing MODULE_LICENSE and proper init/exit
#include <linux/module.h>

void init_module(void) {  // Old style, deprecated
    printk("Module loaded\n");  // Should use pr_info
}

void cleanup_module(void) {
    // Missing cleanup code
}
```

### ✅ Example 2: Kernel Memory Allocation

```c
#include <linux/slab.h>
#include <linux/gfp.h>

struct my_data {
    int value;
    char name[64];
};

int allocate_data(void) {
    struct my_data *data;
    
    // Use GFP_KERNEL in process context (can sleep)
    data = kmalloc(sizeof(*data), GFP_KERNEL);
    if (!data) {
        pr_err("Failed to allocate memory\n");
        return -ENOMEM;
    }
    
    // Initialize data
    data->value = 0;
    memset(data->name, 0, sizeof(data->name));
    
    // Use the data...
    
    // Free when done
    kfree(data);
    return 0;
}

// In interrupt context, use GFP_ATOMIC
void interrupt_handler(void) {
    void *buffer = kmalloc(256, GFP_ATOMIC);  // Cannot sleep
    if (!buffer) {
        pr_err("Allocation failed in interrupt\n");
        return;
    }
    
    // Use buffer...
    kfree(buffer);
}
```

### ❌ Example 2: Improper Memory Allocation

```c
// WRONG: Not checking return value, wrong GFP flags
void bad_allocation(void) {
    struct my_data *data = kmalloc(sizeof(*data), GFP_KERNEL);
    data->value = 42;  // Crash if allocation failed!
}

// WRONG: Using GFP_KERNEL in interrupt context
void bad_interrupt_handler(void) {
    void *buf = kmalloc(256, GFP_KERNEL);  // Can sleep - BUG!
}
```

### ✅ Example 3: Spinlock Usage

```c
#include <linux/spinlock.h>

static DEFINE_SPINLOCK(my_lock);
static int shared_counter = 0;

void increment_counter(void) {
    unsigned long flags;
    
    spin_lock_irqsave(&my_lock, flags);
    shared_counter++;
    spin_unlock_irqrestore(&my_lock, flags);
}

int get_counter(void) {
    unsigned long flags;
    int value;
    
    spin_lock_irqsave(&my_lock, flags);
    value = shared_counter;
    spin_unlock_irqrestore(&my_lock, flags);
    
    return value;
}
```

### ❌ Example 3: Improper Spinlock Usage

```c
// WRONG: Sleeping while holding spinlock
void bad_spinlock_usage(void) {
    spin_lock(&my_lock);
    msleep(100);  // BUG: Cannot sleep with spinlock!
    spin_unlock(&my_lock);
}
```

### ✅ Example 4: Mutex Usage

```c
#include <linux/mutex.h>

static DEFINE_MUTEX(my_mutex);
static struct list_head device_list;

int add_device(struct device *dev) {
    mutex_lock(&my_mutex);

    // Can sleep here - mutex allows it
    if (need_to_allocate()) {
        void *buf = kmalloc(1024, GFP_KERNEL);  // OK with mutex
        if (!buf) {
            mutex_unlock(&my_mutex);
            return -ENOMEM;
        }
        // Use buffer...
        kfree(buf);
    }

    list_add(&dev->list, &device_list);
    mutex_unlock(&my_mutex);

    return 0;
}
```

### ✅ Example 5: User-Kernel Data Transfer

```c
#include <linux/uaccess.h>

struct user_data {
    int value;
    char name[64];
};

long device_ioctl(struct file *file, unsigned int cmd, unsigned long arg) {
    struct user_data kdata;
    struct user_data __user *udata = (struct user_data __user *)arg;

    switch (cmd) {
        case IOCTL_GET_DATA:
            // Copy from kernel to user space
            if (copy_to_user(udata, &kdata, sizeof(kdata))) {
                return -EFAULT;
            }
            break;

        case IOCTL_SET_DATA:
            // Copy from user to kernel space
            if (copy_from_user(&kdata, udata, sizeof(kdata))) {
                return -EFAULT;
            }

            // Validate user data
            if (kdata.value < 0 || kdata.value > 100) {
                return -EINVAL;
            }

            // Ensure string is null-terminated
            kdata.name[sizeof(kdata.name) - 1] = '\0';
            break;

        default:
            return -ENOTTY;
    }

    return 0;
}
```

### ❌ Example 5: Unsafe User-Kernel Transfer

```c
// WRONG: Direct pointer dereference, no validation
long bad_ioctl(struct file *file, unsigned int cmd, unsigned long arg) {
    struct user_data *udata = (struct user_data *)arg;

    // WRONG: Directly accessing user-space pointer!
    int value = udata->value;  // Can crash or security hole!

    return 0;
}
```

### ✅ Example 6: Character Device Registration

```c
#include <linux/fs.h>
#include <linux/cdev.h>

static dev_t dev_num;
static struct cdev my_cdev;
static struct class *my_class;

static struct file_operations fops = {
    .owner = THIS_MODULE,
    .open = device_open,
    .release = device_release,
    .read = device_read,
    .write = device_write,
    .unlocked_ioctl = device_ioctl,
};

static int __init chardev_init(void) {
    int ret;

    // Allocate device number
    ret = alloc_chrdev_region(&dev_num, 0, 1, "mydevice");
    if (ret < 0) {
        pr_err("Failed to allocate device number\n");
        return ret;
    }

    // Initialize cdev
    cdev_init(&my_cdev, &fops);
    my_cdev.owner = THIS_MODULE;

    // Add cdev to system
    ret = cdev_add(&my_cdev, dev_num, 1);
    if (ret < 0) {
        pr_err("Failed to add cdev\n");
        unregister_chrdev_region(dev_num, 1);
        return ret;
    }

    // Create device class
    my_class = class_create(THIS_MODULE, "mydevice");
    if (IS_ERR(my_class)) {
        pr_err("Failed to create class\n");
        cdev_del(&my_cdev);
        unregister_chrdev_region(dev_num, 1);
        return PTR_ERR(my_class);
    }

    // Create device node
    device_create(my_class, NULL, dev_num, NULL, "mydevice");

    pr_info("Character device registered\n");
    return 0;
}

static void __exit chardev_exit(void) {
    device_destroy(my_class, dev_num);
    class_destroy(my_class);
    cdev_del(&my_cdev);
    unregister_chrdev_region(dev_num, 1);
    pr_info("Character device unregistered\n");
}
```

### ✅ Example 7: Kernel Linked Lists

```c
#include <linux/list.h>
#include <linux/slab.h>

struct my_device {
    int id;
    char name[32];
    struct list_head list;
};

static LIST_HEAD(device_list);

int add_device(int id, const char *name) {
    struct my_device *dev;

    dev = kmalloc(sizeof(*dev), GFP_KERNEL);
    if (!dev)
        return -ENOMEM;

    dev->id = id;
    strncpy(dev->name, name, sizeof(dev->name) - 1);
    dev->name[sizeof(dev->name) - 1] = '\0';

    list_add_tail(&dev->list, &device_list);
    return 0;
}

void remove_all_devices(void) {
    struct my_device *dev, *tmp;

    list_for_each_entry_safe(dev, tmp, &device_list, list) {
        list_del(&dev->list);
        kfree(dev);
    }
}

struct my_device *find_device(int id) {
    struct my_device *dev;

    list_for_each_entry(dev, &device_list, list) {
        if (dev->id == id)
            return dev;
    }

    return NULL;
}
```

### ✅ Example 8: Kernel Timers

```c
#include <linux/timer.h>
#include <linux/jiffies.h>

static struct timer_list my_timer;

void timer_callback(struct timer_list *t) {
    pr_info("Timer expired\n");

    // Reschedule timer for 1 second from now
    mod_timer(&my_timer, jiffies + HZ);
}

int setup_timer(void) {
    timer_setup(&my_timer, timer_callback, 0);

    // Start timer (expires in 1 second)
    mod_timer(&my_timer, jiffies + HZ);

    return 0;
}

void cleanup_timer(void) {
    del_timer_sync(&my_timer);
}
```

### ✅ Example 9: Work Queues

```c
#include <linux/workqueue.h>

static struct workqueue_struct *my_wq;

struct work_data {
    struct work_struct work;
    int value;
};

void work_handler(struct work_struct *work) {
    struct work_data *data = container_of(work, struct work_data, work);

    pr_info("Processing work with value: %d\n", data->value);

    // Do work (can sleep here)
    msleep(100);

    kfree(data);
}

int queue_work_item(int value) {
    struct work_data *data;

    data = kmalloc(sizeof(*data), GFP_KERNEL);
    if (!data)
        return -ENOMEM;

    INIT_WORK(&data->work, work_handler);
    data->value = value;

    queue_work(my_wq, &data->work);
    return 0;
}

int init_workqueue(void) {
    my_wq = create_singlethread_workqueue("my_wq");
    if (!my_wq)
        return -ENOMEM;
    return 0;
}

void cleanup_workqueue(void) {
    flush_workqueue(my_wq);
    destroy_workqueue(my_wq);
}
```

### ✅ Example 10: Kernel Threads

```c
#include <linux/kthread.h>
#include <linux/delay.h>

static struct task_struct *my_thread;
static bool thread_should_stop = false;

int thread_function(void *data) {
    while (!kthread_should_stop() && !thread_should_stop) {
        pr_info("Thread running\n");

        // Do work
        msleep(1000);

        if (signal_pending(current))
            break;
    }

    pr_info("Thread exiting\n");
    return 0;
}

int start_kernel_thread(void) {
    my_thread = kthread_run(thread_function, NULL, "my_thread");
    if (IS_ERR(my_thread)) {
        pr_err("Failed to create thread\n");
        return PTR_ERR(my_thread);
    }

    return 0;
}

void stop_kernel_thread(void) {
    if (my_thread) {
        thread_should_stop = true;
        kthread_stop(my_thread);
    }
}
```

### ✅ Example 11: Proc Filesystem Entry

```c
#include <linux/proc_fs.h>
#include <linux/seq_file.h>

static int my_proc_show(struct seq_file *m, void *v) {
    seq_printf(m, "Hello from proc!\n");
    seq_printf(m, "Counter: %d\n", shared_counter);
    return 0;
}

static int my_proc_open(struct inode *inode, struct file *file) {
    return single_open(file, my_proc_show, NULL);
}

static const struct proc_ops my_proc_ops = {
    .proc_open = my_proc_open,
    .proc_read = seq_read,
    .proc_lseek = seq_lseek,
    .proc_release = single_release,
};

static struct proc_dir_entry *proc_entry;

int create_proc_entry(void) {
    proc_entry = proc_create("mydevice", 0444, NULL, &my_proc_ops);
    if (!proc_entry) {
        pr_err("Failed to create proc entry\n");
        return -ENOMEM;
    }
    return 0;
}

void remove_proc_entry(void) {
    proc_remove(proc_entry);
}
```

### ✅ Example 12: RCU (Read-Copy-Update)

```c
#include <linux/rcupdate.h>

struct my_data {
    int value;
    struct rcu_head rcu;
};

static struct my_data __rcu *global_data;

// Read side (lock-free)
int read_data(void) {
    struct my_data *data;
    int value;

    rcu_read_lock();
    data = rcu_dereference(global_data);
    if (data)
        value = data->value;
    else
        value = -1;
    rcu_read_unlock();

    return value;
}

// Free callback
static void free_data_rcu(struct rcu_head *rcu) {
    struct my_data *data = container_of(rcu, struct my_data, rcu);
    kfree(data);
}

// Update side
int update_data(int new_value) {
    struct my_data *new_data, *old_data;

    new_data = kmalloc(sizeof(*new_data), GFP_KERNEL);
    if (!new_data)
        return -ENOMEM;

    new_data->value = new_value;

    old_data = rcu_dereference_protected(global_data,
                                         lockdep_is_held(&update_lock));
    rcu_assign_pointer(global_data, new_data);

    if (old_data)
        call_rcu(&old_data->rcu, free_data_rcu);

    return 0;
}
```

## References

- Linux Kernel Coding Style (Documentation/process/coding-style.rst)
- Linux Device Drivers, 3rd Edition (LDD3)
- Linux Kernel Development (Robert Love)
- Kernel documentation (Documentation/)
- https://www.kernel.org/doc/html/latest/

## Related Rules

- universal-error-handling
- universal-memory-safety
- category-drivers

## Configuration

Enable in `.augment/c-standards.json`:

```json
{
  "categories": ["kernel"],
  "category_overrides": {
    "kernel": {
      "require_module_license": true,
      "check_gfp_flags": true,
      "enforce_locking_rules": true
    }
  }
}
```

