# Embedded Systems Examples

This directory contains C examples demonstrating embedded systems programming best practices for microcontrollers.

## Examples

### 1. gpio-control.c
Demonstrates GPIO (General Purpose Input/Output) control:
- Memory-mapped I/O for hardware registers
- Volatile keyword for hardware access
- Bit manipulation techniques
- Hardware abstraction layer pattern
- LED control and button reading

**Key Concepts:**
- Always use `volatile` for hardware registers
- Use bit manipulation for register access
- Implement hardware abstraction layers
- Atomic register operations with BSRR

### 2. timer-isr.c
Demonstrates timer interrupt service routines:
- Timer configuration for periodic interrupts
- ISR implementation best practices
- Volatile variables for ISR/main communication
- Minimal ISR execution time
- Timeout and delay functions

**Key Concepts:**
- Keep ISRs short and fast
- Use `volatile` for ISR-shared variables
- Clear interrupt flags in ISR
- No blocking operations in ISRs
- Defer processing to main loop

### 3. uart-communication.c
Demonstrates UART serial communication:
- UART initialization and configuration
- Interrupt-driven reception
- Circular buffer implementation
- Non-blocking I/O
- Error handling

**Key Concepts:**
- Use circular buffers for data buffering
- Interrupt-driven reception
- Polling for transmission
- Handle overrun and framing errors
- Non-blocking API design

## Building

These examples are designed for ARM Cortex-M microcontrollers. Adjust register addresses and build commands for your specific hardware.

### For ARM Cortex-M (e.g., STM32)

```bash
# Using arm-none-eabi-gcc
arm-none-eabi-gcc -mcpu=cortex-m3 -mthumb -O2 -Wall -Wextra \
    -o gpio-control.elf gpio-control.c

arm-none-eabi-gcc -mcpu=cortex-m3 -mthumb -O2 -Wall -Wextra \
    -o timer-isr.elf timer-isr.c

arm-none-eabi-gcc -mcpu=cortex-m3 -mthumb -O2 -Wall -Wextra \
    -o uart-communication.elf uart-communication.c
```

### For Simulation/Testing

```bash
# Compile for host (for structure/syntax checking only)
gcc -Wall -Wextra -std=c99 -c gpio-control.c
gcc -Wall -Wextra -std=c99 -c timer-isr.c
gcc -Wall -Wextra -std=c99 -c uart-communication.c
```

## Hardware Requirements

- ARM Cortex-M microcontroller (STM32, NXP, etc.)
- JTAG/SWD debugger
- LED and button for GPIO example
- UART-to-USB adapter for UART example

## Register Addresses

**IMPORTANT:** The register addresses in these examples are for demonstration purposes. You MUST adjust them for your specific microcontroller:

- **STM32F1**: Check STM32F1xx reference manual
- **STM32F4**: Check STM32F4xx reference manual
- **NXP LPC**: Check LPC user manual
- **Nordic nRF**: Check nRF product specification

## Best Practices Demonstrated

1. **Volatile Usage**
   - All hardware registers marked `volatile`
   - ISR-shared variables marked `volatile`
   - Prevents compiler optimization issues

2. **ISR Design**
   - Minimal execution time
   - No blocking operations
   - Clear interrupt flags
   - Use flags for main loop communication

3. **Memory Safety**
   - No dynamic allocation
   - Fixed-size buffers
   - Bounds checking
   - Circular buffer overflow protection

4. **Hardware Abstraction**
   - Clean API separation
   - Register access encapsulation
   - Portable code structure

5. **Error Handling**
   - Check buffer full/empty conditions
   - Handle UART errors
   - Validate pin numbers

## Common Pitfalls to Avoid

1. **Forgetting `volatile`**
   ```c
   // WRONG
   uint32_t *reg = (uint32_t *)0x40020000;
   
   // CORRECT
   volatile uint32_t *reg = (volatile uint32_t *)0x40020000;
   ```

2. **Long ISRs**
   ```c
   // WRONG - Too much work in ISR
   void TIM2_IRQHandler(void) {
       process_data();  // Long operation
       send_uart();     // Blocking
   }
   
   // CORRECT - Set flag and defer
   void TIM2_IRQHandler(void) {
       data_ready = true;  // Just set flag
   }
   ```

3. **Non-atomic Operations**
   ```c
   // WRONG - Not atomic on 8-bit MCU
   volatile uint32_t counter;
   counter++;  // May be interrupted mid-operation
   
   // CORRECT - Disable interrupts or use atomic operations
   __disable_irq();
   counter++;
   __enable_irq();
   ```

## References

- ARM Cortex-M Programming Guide
- MISRA C:2012 Guidelines for Embedded Systems
- Embedded C Coding Standard (Barr Group)
- Microcontroller vendor reference manuals
- "Making Embedded Systems" by Elecia White

