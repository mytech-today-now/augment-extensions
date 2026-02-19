/**
 * @file dma-example.c
 * @brief Example DMA (Direct Memory Access) usage in Linux kernel
 * 
 * This example demonstrates:
 * - DMA buffer allocation
 * - DMA mapping and unmapping
 * - Coherent vs streaming DMA
 * - DMA direction handling
 * - Proper cleanup
 * 
 * Build: make
 * Load: sudo insmod dma-example.ko
 */

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/platform_device.h>
#include <linux/dma-mapping.h>
#include <linux/slab.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Example Author");
MODULE_DESCRIPTION("Example DMA usage driver");
MODULE_VERSION("1.0");

#define DMA_BUFFER_SIZE 4096

/**
 * @brief Device private data
 */
struct dma_device {
    struct device *dev;
    
    /* Coherent DMA buffer */
    void *coherent_buffer;
    dma_addr_t coherent_dma_handle;
    
    /* Streaming DMA buffer */
    void *streaming_buffer;
    dma_addr_t streaming_dma_handle;
};

/**
 * @brief Example: Allocate and use coherent DMA buffer
 * 
 * Coherent DMA is used for buffers shared between CPU and device
 * that need to be accessed simultaneously.
 */
static int coherent_dma_example(struct dma_device *dma_dev)
{
    dev_info(dma_dev->dev, "Allocating coherent DMA buffer\n");

    /* Allocate coherent DMA buffer */
    dma_dev->coherent_buffer = dma_alloc_coherent(dma_dev->dev,
                                                   DMA_BUFFER_SIZE,
                                                   &dma_dev->coherent_dma_handle,
                                                   GFP_KERNEL);
    if (!dma_dev->coherent_buffer) {
        dev_err(dma_dev->dev, "Failed to allocate coherent DMA buffer\n");
        return -ENOMEM;
    }

    dev_info(dma_dev->dev, "Coherent DMA buffer allocated\n");
    dev_info(dma_dev->dev, "Virtual address: %p\n", dma_dev->coherent_buffer);
    dev_info(dma_dev->dev, "DMA address: 0x%llx\n", 
             (unsigned long long)dma_dev->coherent_dma_handle);

    /* Use the buffer - CPU can write directly */
    memset(dma_dev->coherent_buffer, 0xAA, DMA_BUFFER_SIZE);

    /* Program device with DMA address */
    /* Example: writel(dma_dev->coherent_dma_handle, device_dma_addr_reg); */

    return 0;
}

/**
 * @brief Example: Allocate and use streaming DMA buffer
 * 
 * Streaming DMA is used for one-directional transfers where
 * CPU and device don't access the buffer simultaneously.
 */
static int streaming_dma_example(struct dma_device *dma_dev)
{
    dev_info(dma_dev->dev, "Setting up streaming DMA\n");

    /* Allocate regular kernel memory */
    dma_dev->streaming_buffer = kmalloc(DMA_BUFFER_SIZE, GFP_KERNEL);
    if (!dma_dev->streaming_buffer) {
        dev_err(dma_dev->dev, "Failed to allocate streaming buffer\n");
        return -ENOMEM;
    }

    /* Fill buffer with data */
    memset(dma_dev->streaming_buffer, 0x55, DMA_BUFFER_SIZE);

    /* Map buffer for DMA (device will read from it) */
    dma_dev->streaming_dma_handle = dma_map_single(dma_dev->dev,
                                                    dma_dev->streaming_buffer,
                                                    DMA_BUFFER_SIZE,
                                                    DMA_TO_DEVICE);
    
    if (dma_mapping_error(dma_dev->dev, dma_dev->streaming_dma_handle)) {
        dev_err(dma_dev->dev, "Failed to map streaming DMA buffer\n");
        kfree(dma_dev->streaming_buffer);
        dma_dev->streaming_buffer = NULL;
        return -ENOMEM;
    }

    dev_info(dma_dev->dev, "Streaming DMA buffer mapped\n");
    dev_info(dma_dev->dev, "DMA address: 0x%llx\n",
             (unsigned long long)dma_dev->streaming_dma_handle);

    /* Program device with DMA address */
    /* Example: writel(dma_dev->streaming_dma_handle, device_dma_addr_reg); */

    /* Start DMA transfer */
    /* Example: writel(DMA_START, device_control_reg); */

    return 0;
}

/**
 * @brief Cleanup coherent DMA resources
 */
static void cleanup_coherent_dma(struct dma_device *dma_dev)
{
    if (dma_dev->coherent_buffer) {
        dma_free_coherent(dma_dev->dev,
                         DMA_BUFFER_SIZE,
                         dma_dev->coherent_buffer,
                         dma_dev->coherent_dma_handle);
        dma_dev->coherent_buffer = NULL;
        dev_info(dma_dev->dev, "Coherent DMA buffer freed\n");
    }
}

/**
 * @brief Cleanup streaming DMA resources
 */
static void cleanup_streaming_dma(struct dma_device *dma_dev)
{
    if (dma_dev->streaming_buffer) {
        /* Unmap DMA buffer */
        dma_unmap_single(dma_dev->dev,
                        dma_dev->streaming_dma_handle,
                        DMA_BUFFER_SIZE,
                        DMA_TO_DEVICE);
        
        /* Free kernel memory */
        kfree(dma_dev->streaming_buffer);
        dma_dev->streaming_buffer = NULL;
        dev_info(dma_dev->dev, "Streaming DMA buffer freed\n");
    }
}

/**
 * @brief Platform driver probe function
 */
static int dma_probe(struct platform_device *pdev)
{
    struct dma_device *dma_dev;
    int ret;

    dev_info(&pdev->dev, "Probing DMA example device\n");

    /* Allocate private data */
    dma_dev = devm_kzalloc(&pdev->dev, sizeof(*dma_dev), GFP_KERNEL);
    if (!dma_dev)
        return -ENOMEM;

    dma_dev->dev = &pdev->dev;
    platform_set_drvdata(pdev, dma_dev);

    /* Set DMA mask (32-bit addressing) */
    ret = dma_set_mask_and_coherent(&pdev->dev, DMA_BIT_MASK(32));
    if (ret) {
        dev_err(&pdev->dev, "Failed to set DMA mask\n");
        return ret;
    }

    /* Example 1: Coherent DMA */
    ret = coherent_dma_example(dma_dev);
    if (ret)
        return ret;

    /* Example 2: Streaming DMA */
    ret = streaming_dma_example(dma_dev);
    if (ret) {
        cleanup_coherent_dma(dma_dev);
        return ret;
    }

    dev_info(&pdev->dev, "DMA example device probed successfully\n");
    return 0;
}

/**
 * @brief Platform driver remove function
 */
static int dma_remove(struct platform_device *pdev)
{
    struct dma_device *dma_dev = platform_get_drvdata(pdev);

    dev_info(&pdev->dev, "Removing DMA example device\n");

    cleanup_streaming_dma(dma_dev);
    cleanup_coherent_dma(dma_dev);

    dev_info(&pdev->dev, "DMA example device removed\n");
    return 0;
}

static struct platform_driver dma_driver = {
    .probe = dma_probe,
    .remove = dma_remove,
    .driver = {
        .name = "dma-example",
    },
};

module_platform_driver(dma_driver);

