# Device Drivers Examples

This directory contains Linux device driver examples demonstrating advanced driver development.

## Examples

### 1. platform-driver.c
Platform device driver with device tree support:
- Platform driver registration
- Device tree binding and parsing
- Resource management with devm_* functions
- Probe and remove functions
- Memory-mapped I/O

**Key Concepts:**
- Use `devm_*` functions for automatic cleanup
- Parse device tree properties
- Handle resources (memory, IRQ)
- Proper error handling in probe

### 2. dma-example.c
DMA (Direct Memory Access) usage:
- Coherent DMA allocation
- Streaming DMA mapping
- DMA direction handling
- DMA mask configuration
- Proper cleanup

**Key Concepts:**
- Choose coherent vs streaming DMA appropriately
- Always check `dma_mapping_error()`
- Unmap before freeing buffers
- Set appropriate DMA mask

### 3. example.dts
Device tree source file:
- Device node definitions
- Register address mapping
- Interrupt configuration
- DMA bindings
- Custom properties

## Building

```bash
# Build all drivers
make

# Build device tree blob
make dtb

# Clean
make clean
```

## Device Tree

### Compiling Device Tree

```bash
# Compile DTS to DTB
dtc -I dts -O dtb -o example.dtb example.dts

# Decompile DTB to DTS
dtc -I dtb -O dts -o example.dts example.dtb
```

### Device Tree Properties

```dts
example_device@40000000 {
    compatible = "example,platform-device";  /* Driver matching */
    reg = <0x40000000 0x1000>;              /* Base addr, size */
    interrupts = <0 32 4>;                   /* IRQ configuration */
    status = "okay";                         /* Enable device */
};
```

## Loading and Testing

```bash
# Load drivers
sudo insmod platform-driver.ko
sudo insmod dma-example.ko

# Check kernel logs
dmesg | tail -30

# List loaded modules
lsmod | grep -E 'platform|dma'

# Unload drivers
sudo rmmod dma-example
sudo rmmod platform-driver
```

## DMA Usage Guidelines

### Coherent DMA
Use for buffers accessed simultaneously by CPU and device:
```c
void *buf = dma_alloc_coherent(dev, size, &dma_handle, GFP_KERNEL);
/* Use buffer */
dma_free_coherent(dev, size, buf, dma_handle);
```

### Streaming DMA
Use for one-directional transfers:
```c
void *buf = kmalloc(size, GFP_KERNEL);
dma_addr_t dma_handle = dma_map_single(dev, buf, size, DMA_TO_DEVICE);
if (dma_mapping_error(dev, dma_handle)) { /* error */ }
/* Transfer data */
dma_unmap_single(dev, dma_handle, size, DMA_TO_DEVICE);
kfree(buf);
```

### DMA Directions
- `DMA_TO_DEVICE`: CPU writes, device reads
- `DMA_FROM_DEVICE`: Device writes, CPU reads
- `DMA_BIDIRECTIONAL`: Both directions

## Best Practices

1. **Resource Management**
   - Use `devm_*` functions when possible
   - Clean up in reverse order of allocation
   - Handle all error paths

2. **DMA Safety**
   - Always check `dma_mapping_error()`
   - Set appropriate DMA mask
   - Unmap before freeing
   - Use correct DMA direction

3. **Device Tree**
   - Use standard property names
   - Document custom properties
   - Validate in driver code

4. **Error Handling**
   - Return appropriate error codes
   - Log errors with `dev_err()`
   - Clean up on failure

## Common Pitfalls

1. **Missing DMA Unmap**
   ```c
   // WRONG
   dma_addr = dma_map_single(dev, buf, size, DMA_TO_DEVICE);
   kfree(buf);  // Forgot to unmap!
   
   // CORRECT
   dma_addr = dma_map_single(dev, buf, size, DMA_TO_DEVICE);
   dma_unmap_single(dev, dma_addr, size, DMA_TO_DEVICE);
   kfree(buf);
   ```

2. **Wrong DMA Direction**
   ```c
   // WRONG - Device writes to buffer
   dma_map_single(dev, buf, size, DMA_TO_DEVICE);
   
   // CORRECT
   dma_map_single(dev, buf, size, DMA_FROM_DEVICE);
   ```

3. **Incomplete Cleanup**
   ```c
   // WRONG
   static int probe(struct platform_device *pdev) {
       base = devm_ioremap_resource(&pdev->dev, res);
       data = kmalloc(size, GFP_KERNEL);  // Not devm!
       return 0;  // Memory leak on driver removal
   }
   
   // CORRECT
   static int probe(struct platform_device *pdev) {
       base = devm_ioremap_resource(&pdev->dev, res);
       data = devm_kmalloc(&pdev->dev, size, GFP_KERNEL);
       return 0;  // Auto-freed on removal
   }
   ```

## References

- Linux Device Drivers (LDD3)
- Linux Kernel DMA API: Documentation/core-api/dma-api.rst
- Device Tree Specification: https://www.devicetree.org/
- Platform Devices: Documentation/driver-api/driver-model/platform.rst

