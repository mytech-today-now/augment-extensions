/**
 * @file platform-driver.c
 * @brief Example Linux platform device driver
 * 
 * This example demonstrates:
 * - Platform driver registration
 * - Device tree binding
 * - Probe and remove functions
 * - Resource management (devm_* functions)
 * - Platform device matching
 * 
 * Device Tree Example:
 *   example_device {
 *       compatible = "example,platform-device";
 *       reg = <0x40000000 0x1000>;
 *   };
 * 
 * Build: make
 * Load: sudo insmod platform-driver.ko
 */

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/platform_device.h>
#include <linux/of.h>
#include <linux/io.h>
#include <linux/slab.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Example Author");
MODULE_DESCRIPTION("Example platform device driver");
MODULE_VERSION("1.0");

#define DRIVER_NAME "example-platform"

/**
 * @brief Private device data structure
 */
struct example_device {
    void __iomem *base;
    struct device *dev;
    int irq;
};

/**
 * @brief Platform driver probe function
 * @param pdev Platform device
 * @return 0 on success, negative error code on failure
 */
static int example_probe(struct platform_device *pdev)
{
    struct example_device *priv;
    struct resource *res;
    int ret;

    dev_info(&pdev->dev, "Probing device\n");

    /* Allocate private data using devm (auto-freed on remove) */
    priv = devm_kzalloc(&pdev->dev, sizeof(*priv), GFP_KERNEL);
    if (!priv)
        return -ENOMEM;

    priv->dev = &pdev->dev;

    /* Get memory resource from device tree or platform data */
    res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
    if (!res) {
        dev_err(&pdev->dev, "Failed to get memory resource\n");
        return -ENODEV;
    }

    /* Map device registers (auto-unmapped on remove) */
    priv->base = devm_ioremap_resource(&pdev->dev, res);
    if (IS_ERR(priv->base)) {
        dev_err(&pdev->dev, "Failed to map registers\n");
        return PTR_ERR(priv->base);
    }

    /* Get IRQ (optional) */
    priv->irq = platform_get_irq(pdev, 0);
    if (priv->irq < 0) {
        dev_warn(&pdev->dev, "No IRQ specified\n");
        priv->irq = -1;
    } else {
        dev_info(&pdev->dev, "IRQ: %d\n", priv->irq);
    }

    /* Store private data in platform device */
    platform_set_drvdata(pdev, priv);

    /* Initialize hardware */
    /* Example: Write to control register */
    /* iowrite32(0x1, priv->base + CTRL_REG_OFFSET); */

    dev_info(&pdev->dev, "Device probed successfully\n");
    dev_info(&pdev->dev, "Base address: %p\n", priv->base);

    return 0;
}

/**
 * @brief Platform driver remove function
 * @param pdev Platform device
 * @return 0 on success
 */
static int example_remove(struct platform_device *pdev)
{
    struct example_device *priv = platform_get_drvdata(pdev);

    dev_info(&pdev->dev, "Removing device\n");

    /* Shutdown hardware */
    /* Example: Disable device */
    /* iowrite32(0x0, priv->base + CTRL_REG_OFFSET); */

    /* Resources allocated with devm_* are automatically freed */

    dev_info(&pdev->dev, "Device removed\n");
    return 0;
}

/**
 * @brief Device tree match table
 */
static const struct of_device_id example_of_match[] = {
    { .compatible = "example,platform-device", },
    { /* sentinel */ }
};
MODULE_DEVICE_TABLE(of, example_of_match);

/**
 * @brief Platform driver structure
 */
static struct platform_driver example_driver = {
    .probe = example_probe,
    .remove = example_remove,
    .driver = {
        .name = DRIVER_NAME,
        .of_match_table = example_of_match,
    },
};

/**
 * @brief Module initialization
 */
static int __init example_init(void)
{
    int ret;

    pr_info("example_platform: Registering platform driver\n");

    ret = platform_driver_register(&example_driver);
    if (ret) {
        pr_err("example_platform: Failed to register driver\n");
        return ret;
    }

    pr_info("example_platform: Driver registered\n");
    return 0;
}

/**
 * @brief Module cleanup
 */
static void __exit example_exit(void)
{
    pr_info("example_platform: Unregistering platform driver\n");
    platform_driver_unregister(&example_driver);
    pr_info("example_platform: Driver unregistered\n");
}

module_init(example_init);
module_exit(example_exit);

