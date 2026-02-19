# Rule: Device Drivers

## Metadata
- **ID**: category-drivers
- **Category**: drivers
- **Severity**: ERROR
- **Standard**: Linux Device Driver Model
- **Version**: 1.0.0

## Description
Device driver development rules for character devices, block devices, network devices, platform drivers, and device tree integration.

## Rationale
Device drivers are the interface between hardware and the kernel. They must handle hardware quirks, manage resources properly, and provide a stable API to user space. Poor driver code can cause system instability, data corruption, or security vulnerabilities.

## Applies To
- C Standards: c89, c99, c11
- Categories: drivers
- Platforms: Linux kernel, embedded systems

## Rule Details

### 1. Driver Registration
- Use proper registration/unregistration functions
- Handle registration failures gracefully
- Clean up resources in reverse order
- Use platform_driver_register() for platform devices

### 2. Resource Management
- Request resources (I/O ports, memory, IRQs) properly
- Use devm_* functions for automatic cleanup
- Release resources in error paths
- Avoid resource leaks

### 3. Interrupt Handling
- Register IRQ handlers with request_irq()
- Use threaded IRQs for complex processing
- Return IRQ_HANDLED or IRQ_NONE appropriately
- Free IRQs in cleanup

### 4. DMA Operations
- Use DMA API (dma_alloc_coherent, dma_map_single)
- Handle DMA mapping errors
- Sync DMA buffers properly
- Free DMA resources

### 5. Device Tree Integration
- Parse device tree properties
- Use of_* functions for device tree access
- Handle missing properties gracefully
- Support both DT and non-DT platforms

## Examples

### ✅ Example 1: Platform Driver Structure

```c
#include <linux/platform_device.h>
#include <linux/module.h>
#include <linux/of.h>

struct my_device_data {
    void __iomem *base;
    int irq;
    struct device *dev;
};

static int my_driver_probe(struct platform_device *pdev) {
    struct my_device_data *drvdata;
    struct resource *res;
    int ret;
    
    dev_info(&pdev->dev, "Probing device\n");
    
    // Allocate driver data
    drvdata = devm_kzalloc(&pdev->dev, sizeof(*drvdata), GFP_KERNEL);
    if (!drvdata)
        return -ENOMEM;
    
    drvdata->dev = &pdev->dev;
    
    // Get memory resource
    res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
    drvdata->base = devm_ioremap_resource(&pdev->dev, res);
    if (IS_ERR(drvdata->base))
        return PTR_ERR(drvdata->base);
    
    // Get IRQ
    drvdata->irq = platform_get_irq(pdev, 0);
    if (drvdata->irq < 0)
        return drvdata->irq;
    
    // Request IRQ
    ret = devm_request_irq(&pdev->dev, drvdata->irq, my_irq_handler,
                           0, dev_name(&pdev->dev), drvdata);
    if (ret) {
        dev_err(&pdev->dev, "Failed to request IRQ\n");
        return ret;
    }
    
    platform_set_drvdata(pdev, drvdata);
    
    return 0;
}

static int my_driver_remove(struct platform_device *pdev) {
    dev_info(&pdev->dev, "Removing device\n");
    // devm_* resources are automatically freed
    return 0;
}

static const struct of_device_id my_driver_of_match[] = {
    { .compatible = "vendor,my-device" },
    { }
};
MODULE_DEVICE_TABLE(of, my_driver_of_match);

static struct platform_driver my_driver = {
    .probe = my_driver_probe,
    .remove = my_driver_remove,
    .driver = {
        .name = "my-driver",
        .of_match_table = my_driver_of_match,
    },
};

module_platform_driver(my_driver);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("Example platform driver");
```

### ❌ Example 1: Poor Driver Structure

```c
// WRONG: No error handling, resource leaks
static int bad_probe(struct platform_device *pdev) {
    void __iomem *base = ioremap(0x40000000, 0x1000);  // No error check!
    int irq = platform_get_irq(pdev, 0);
    request_irq(irq, handler, 0, "bad", NULL);  // No error check!
    // Missing: resource cleanup on error
    return 0;
}
```

### ✅ Example 2: Interrupt Handler

```c
#include <linux/interrupt.h>

static irqreturn_t my_irq_handler(int irq, void *dev_id) {
    struct my_device_data *drvdata = dev_id;
    u32 status;
    
    // Read interrupt status
    status = readl(drvdata->base + STATUS_REG);
    
    // Check if this device generated the interrupt
    if (!(status & IRQ_PENDING))
        return IRQ_NONE;
    
    // Clear interrupt
    writel(status, drvdata->base + STATUS_REG);
    
    // Handle interrupt (keep it short!)
    if (status & RX_READY) {
        // Schedule bottom half for complex processing
        schedule_work(&drvdata->rx_work);
    }
    
    return IRQ_HANDLED;
}

// Bottom half (work queue)
static void rx_work_handler(struct work_struct *work) {
    struct my_device_data *drvdata = 
        container_of(work, struct my_device_data, rx_work);
    
    // Complex processing here (can sleep)
    process_received_data(drvdata);
}
```

### ✅ Example 3: Character Device Driver

```c
#include <linux/cdev.h>
#include <linux/fs.h>
#include <linux/uaccess.h>

static int device_open(struct inode *inode, struct file *file) {
    struct my_device_data *drvdata;
    
    drvdata = container_of(inode->i_cdev, struct my_device_data, cdev);
    file->private_data = drvdata;
    
    return 0;
}

static ssize_t device_read(struct file *file, char __user *buf,
                           size_t count, loff_t *ppos) {
    struct my_device_data *drvdata = file->private_data;
    char kbuf[256];
    size_t len;
    
    // Read from hardware
    len = read_from_hardware(drvdata, kbuf, sizeof(kbuf));
    
    if (len > count)
        len = count;
    
    if (copy_to_user(buf, kbuf, len))
        return -EFAULT;
    
    return len;
}

static ssize_t device_write(struct file *file, const char __user *buf,
                            size_t count, loff_t *ppos) {
    struct my_device_data *drvdata = file->private_data;
    char kbuf[256];
    
    if (count > sizeof(kbuf))
        count = sizeof(kbuf);
    
    if (copy_from_user(kbuf, buf, count))
        return -EFAULT;
    
    // Write to hardware
    write_to_hardware(drvdata, kbuf, count);
    
    return count;
}

static const struct file_operations device_fops = {
    .owner = THIS_MODULE,
    .open = device_open,
    .read = device_read,
    .write = device_write,
    .release = device_release,
};
```

### ✅ Example 4: DMA Operations

```c
#include <linux/dma-mapping.h>

int setup_dma_transfer(struct my_device_data *drvdata, void *buffer, size_t size) {
    dma_addr_t dma_handle;
    void *dma_buffer;
    int ret;

    // Allocate DMA-coherent memory
    dma_buffer = dma_alloc_coherent(drvdata->dev, size, &dma_handle, GFP_KERNEL);
    if (!dma_buffer) {
        dev_err(drvdata->dev, "Failed to allocate DMA buffer\n");
        return -ENOMEM;
    }

    // Copy data to DMA buffer
    memcpy(dma_buffer, buffer, size);

    // Program DMA controller
    writel(dma_handle, drvdata->base + DMA_SRC_ADDR);
    writel(size, drvdata->base + DMA_SIZE);
    writel(DMA_START, drvdata->base + DMA_CTRL);

    // Wait for DMA completion (or use interrupt)
    ret = wait_for_dma_completion(drvdata);

    // Free DMA buffer
    dma_free_coherent(drvdata->dev, size, dma_buffer, dma_handle);

    return ret;
}

// Alternative: DMA mapping for existing buffer
int map_dma_buffer(struct my_device_data *drvdata, void *buffer, size_t size) {
    dma_addr_t dma_handle;

    dma_handle = dma_map_single(drvdata->dev, buffer, size, DMA_TO_DEVICE);
    if (dma_mapping_error(drvdata->dev, dma_handle)) {
        dev_err(drvdata->dev, "DMA mapping failed\n");
        return -ENOMEM;
    }

    // Use dma_handle for DMA transfer
    writel(dma_handle, drvdata->base + DMA_SRC_ADDR);

    // After transfer, unmap
    dma_unmap_single(drvdata->dev, dma_handle, size, DMA_TO_DEVICE);

    return 0;
}
```

### ✅ Example 5: Device Tree Parsing

```c
#include <linux/of.h>
#include <linux/of_device.h>

int parse_device_tree(struct platform_device *pdev, struct my_device_data *drvdata) {
    struct device_node *np = pdev->dev.of_node;
    u32 value;
    const char *str;
    int ret;

    if (!np) {
        dev_err(&pdev->dev, "No device tree node\n");
        return -ENODEV;
    }

    // Read integer property
    ret = of_property_read_u32(np, "clock-frequency", &value);
    if (ret) {
        dev_warn(&pdev->dev, "Missing clock-frequency, using default\n");
        value = 1000000;  // Default 1MHz
    }
    drvdata->clock_freq = value;

    // Read string property
    ret = of_property_read_string(np, "device-name", &str);
    if (ret == 0) {
        strncpy(drvdata->name, str, sizeof(drvdata->name) - 1);
    }

    // Check boolean property
    drvdata->enable_feature = of_property_read_bool(np, "enable-feature");

    // Read array property
    u32 values[4];
    ret = of_property_read_u32_array(np, "reg-offsets", values, 4);
    if (ret == 0) {
        memcpy(drvdata->reg_offsets, values, sizeof(values));
    }

    return 0;
}
```

### ✅ Example 6: I/O Memory Access

```c
#include <linux/io.h>

// Safe register access with proper barriers
static inline u32 device_read_reg(struct my_device_data *drvdata, u32 offset) {
    return readl(drvdata->base + offset);
}

static inline void device_write_reg(struct my_device_data *drvdata,
                                    u32 offset, u32 value) {
    writel(value, drvdata->base + offset);
}

// Read-modify-write operation
void device_set_bits(struct my_device_data *drvdata, u32 offset, u32 bits) {
    u32 val = device_read_reg(drvdata, offset);
    val |= bits;
    device_write_reg(drvdata, offset, val);
}

void device_clear_bits(struct my_device_data *drvdata, u32 offset, u32 bits) {
    u32 val = device_read_reg(drvdata, offset);
    val &= ~bits;
    device_write_reg(drvdata, offset, val);
}
```

### ✅ Example 7: Power Management

```c
#include <linux/pm.h>

static int my_driver_suspend(struct device *dev) {
    struct my_device_data *drvdata = dev_get_drvdata(dev);

    dev_info(dev, "Suspending device\n");

    // Save device state
    drvdata->saved_state = device_read_reg(drvdata, CTRL_REG);

    // Disable device
    device_write_reg(drvdata, CTRL_REG, 0);

    // Disable clocks, power, etc.
    clk_disable_unprepare(drvdata->clk);

    return 0;
}

static int my_driver_resume(struct device *dev) {
    struct my_device_data *drvdata = dev_get_drvdata(dev);

    dev_info(dev, "Resuming device\n");

    // Enable clocks, power, etc.
    clk_prepare_enable(drvdata->clk);

    // Restore device state
    device_write_reg(drvdata, CTRL_REG, drvdata->saved_state);

    return 0;
}

static const struct dev_pm_ops my_driver_pm_ops = {
    .suspend = my_driver_suspend,
    .resume = my_driver_resume,
};

// Add to platform_driver:
// .driver = {
//     .pm = &my_driver_pm_ops,
// }
```

### ✅ Example 8: Sysfs Attributes

```c
#include <linux/sysfs.h>

static ssize_t status_show(struct device *dev,
                           struct device_attribute *attr, char *buf) {
    struct my_device_data *drvdata = dev_get_drvdata(dev);
    u32 status = device_read_reg(drvdata, STATUS_REG);

    return sprintf(buf, "0x%08x\n", status);
}

static ssize_t enable_store(struct device *dev,
                            struct device_attribute *attr,
                            const char *buf, size_t count) {
    struct my_device_data *drvdata = dev_get_drvdata(dev);
    bool enable;
    int ret;

    ret = kstrtobool(buf, &enable);
    if (ret)
        return ret;

    if (enable)
        device_set_bits(drvdata, CTRL_REG, ENABLE_BIT);
    else
        device_clear_bits(drvdata, CTRL_REG, ENABLE_BIT);

    return count;
}

static DEVICE_ATTR_RO(status);
static DEVICE_ATTR_WO(enable);

static struct attribute *my_driver_attrs[] = {
    &dev_attr_status.attr,
    &dev_attr_enable.attr,
    NULL,
};

static const struct attribute_group my_driver_attr_group = {
    .attrs = my_driver_attrs,
};

// In probe function:
// ret = sysfs_create_group(&pdev->dev.kobj, &my_driver_attr_group);
// In remove function:
// sysfs_remove_group(&pdev->dev.kobj, &my_driver_attr_group);
```

### ✅ Example 9: Clock Management

```c
#include <linux/clk.h>

int setup_clocks(struct platform_device *pdev, struct my_device_data *drvdata) {
    int ret;

    // Get clock from device tree
    drvdata->clk = devm_clk_get(&pdev->dev, "device-clk");
    if (IS_ERR(drvdata->clk)) {
        dev_err(&pdev->dev, "Failed to get clock\n");
        return PTR_ERR(drvdata->clk);
    }

    // Set clock rate
    ret = clk_set_rate(drvdata->clk, 48000000);  // 48MHz
    if (ret) {
        dev_err(&pdev->dev, "Failed to set clock rate\n");
        return ret;
    }

    // Prepare and enable clock
    ret = clk_prepare_enable(drvdata->clk);
    if (ret) {
        dev_err(&pdev->dev, "Failed to enable clock\n");
        return ret;
    }

    return 0;
}

// In remove function:
// clk_disable_unprepare(drvdata->clk);
```

### ✅ Example 10: GPIO Control

```c
#include <linux/gpio/consumer.h>

int setup_gpios(struct platform_device *pdev, struct my_device_data *drvdata) {
    // Get GPIO from device tree
    drvdata->reset_gpio = devm_gpiod_get(&pdev->dev, "reset", GPIOD_OUT_HIGH);
    if (IS_ERR(drvdata->reset_gpio)) {
        dev_err(&pdev->dev, "Failed to get reset GPIO\n");
        return PTR_ERR(drvdata->reset_gpio);
    }

    // Reset device
    gpiod_set_value(drvdata->reset_gpio, 1);
    msleep(10);
    gpiod_set_value(drvdata->reset_gpio, 0);

    return 0;
}
```

### ✅ Example 11: Regulator Control

```c
#include <linux/regulator/consumer.h>

int setup_regulators(struct platform_device *pdev, struct my_device_data *drvdata) {
    int ret;

    // Get regulator from device tree
    drvdata->vdd = devm_regulator_get(&pdev->dev, "vdd");
    if (IS_ERR(drvdata->vdd)) {
        dev_err(&pdev->dev, "Failed to get VDD regulator\n");
        return PTR_ERR(drvdata->vdd);
    }

    // Set voltage
    ret = regulator_set_voltage(drvdata->vdd, 3300000, 3300000);  // 3.3V
    if (ret) {
        dev_err(&pdev->dev, "Failed to set voltage\n");
        return ret;
    }

    // Enable regulator
    ret = regulator_enable(drvdata->vdd);
    if (ret) {
        dev_err(&pdev->dev, "Failed to enable regulator\n");
        return ret;
    }

    return 0;
}

// In remove function:
// regulator_disable(drvdata->vdd);
```

### ✅ Example 12: Threaded IRQ Handler

```c
#include <linux/interrupt.h>

// Top half (hard IRQ context)
static irqreturn_t my_irq_handler(int irq, void *dev_id) {
    struct my_device_data *drvdata = dev_id;
    u32 status;

    status = device_read_reg(drvdata, STATUS_REG);

    if (!(status & IRQ_PENDING))
        return IRQ_NONE;

    // Clear interrupt
    device_write_reg(drvdata, STATUS_REG, status);

    // Wake up threaded handler
    return IRQ_WAKE_THREAD;
}

// Bottom half (threaded context - can sleep)
static irqreturn_t my_irq_thread(int irq, void *dev_id) {
    struct my_device_data *drvdata = dev_id;

    // Complex processing here (can sleep, use mutexes, etc.)
    mutex_lock(&drvdata->lock);
    process_interrupt_data(drvdata);
    mutex_unlock(&drvdata->lock);

    return IRQ_HANDLED;
}

// In probe function:
// ret = devm_request_threaded_irq(&pdev->dev, drvdata->irq,
//                                 my_irq_handler, my_irq_thread,
//                                 IRQF_ONESHOT, dev_name(&pdev->dev), drvdata);
```

## References

- Linux Device Drivers, 3rd Edition (LDD3)
- Linux Driver Development for Embedded Processors
- Linux kernel documentation (Documentation/driver-api/)
- Device Tree Specification
- https://www.kernel.org/doc/html/latest/driver-api/

## Related Rules

- category-kernel
- universal-error-handling
- universal-memory-safety

## Configuration

Enable in `.augment/c-standards.json`:

```json
{
  "categories": ["drivers"],
  "category_overrides": {
    "drivers": {
      "require_devm_functions": true,
      "check_resource_cleanup": true,
      "enforce_dt_support": true
    }
  }
}
```

