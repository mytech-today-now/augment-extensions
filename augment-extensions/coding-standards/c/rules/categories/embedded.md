# Rule: Embedded Systems Programming

## Metadata
- **ID**: category-embedded
- **Category**: embedded
- **Severity**: ERROR
- **Standard**: MISRA C:2012, CERT C
- **Version**: 1.0.0

## Description
Embedded systems programming rules covering volatile usage, interrupt service routines (ISRs), memory constraints, hardware register access, and deterministic behavior.

## Rationale
Embedded systems operate under strict constraints: limited memory, real-time requirements, direct hardware interaction, and often no operating system. These rules ensure reliable, predictable, and safe embedded code.

## Applies To
- C Standards: c99, c11, c17
- Categories: embedded
- Platforms: Microcontrollers, bare-metal systems, RTOS environments

## Rule Details

### 1. Volatile Keyword Usage
- Use `volatile` for hardware registers
- Use `volatile` for variables shared with ISRs
- Use `volatile` for memory-mapped I/O
- Never optimize away volatile accesses

### 2. Interrupt Service Routine (ISR) Constraints
- Keep ISRs short and fast
- Avoid blocking operations in ISRs
- Use only async-signal-safe operations
- Minimize stack usage in ISRs
- Use atomic operations for shared data

### 3. No Dynamic Memory Allocation
- Avoid malloc/free in embedded systems
- Use static allocation or stack allocation
- Pre-allocate all buffers at compile time
- Use memory pools if dynamic allocation needed

### 4. Fixed-Size Buffers
- Use fixed-size arrays, not variable-length
- Validate buffer sizes at compile time
- Prevent buffer overflows with bounds checking
- Use circular buffers for streaming data

### 5. Hardware Register Access
- Use volatile pointers for memory-mapped registers
- Use bit manipulation macros for register fields
- Document register addresses and bit fields
- Use read-modify-write for partial updates

## Examples

### ✅ Example 1: Proper Volatile Usage for Hardware Registers

```c
#include <stdint.h>

// Memory-mapped register addresses
#define GPIO_BASE_ADDR  0x40020000
#define GPIO_ODR_OFFSET 0x14

// Volatile pointer to hardware register
#define GPIO_ODR  (*(volatile uint32_t *)(GPIO_BASE_ADDR + GPIO_ODR_OFFSET))

void set_gpio_pin(uint8_t pin) {
    GPIO_ODR |= (1U << pin);  // Set bit
}

void clear_gpio_pin(uint8_t pin) {
    GPIO_ODR &= ~(1U << pin);  // Clear bit
}

uint8_t read_gpio_pin(uint8_t pin) {
    return (GPIO_ODR & (1U << pin)) ? 1 : 0;
}
```

### ❌ Example 1: Missing Volatile

```c
// WRONG: Missing volatile - compiler may optimize away reads
#define GPIO_ODR  (*(uint32_t *)(GPIO_BASE_ADDR + GPIO_ODR_OFFSET))

// This may be optimized to a single read!
while (GPIO_ODR & (1 << 5)) {
    // Wait for bit to clear
}
```

### ✅ Example 2: Interrupt Service Routine Best Practices

```c
#include <stdint.h>
#include <stdbool.h>

// Shared between ISR and main code - must be volatile
volatile bool data_ready = false;
volatile uint8_t received_byte = 0;

// ISR: Keep it short and simple
void UART_RX_IRQHandler(void) {
    // Read data register (clears interrupt flag)
    received_byte = UART_DR;
    data_ready = true;
    
    // That's it! No complex processing in ISR
}

// Main code processes the data
void main_loop(void) {
    while (1) {
        if (data_ready) {
            // Disable interrupts while accessing shared data
            __disable_irq();
            uint8_t byte = received_byte;
            data_ready = false;
            __enable_irq();
            
            // Process the byte (outside critical section)
            process_data(byte);
        }
    }
}
```

### ❌ Example 2: Bad ISR Practices

```c
// WRONG: Too much processing in ISR
void BAD_UART_RX_IRQHandler(void) {
    uint8_t byte = UART_DR;
    
    // WRONG: Complex processing in ISR
    parse_protocol(byte);
    update_state_machine(byte);
    send_response(byte);
    
    // WRONG: Blocking operation
    delay_ms(10);
}
```

### ✅ Example 3: Static Memory Allocation

```c
#include <stdint.h>

#define MAX_BUFFER_SIZE 256
#define MAX_MESSAGES 10

// Static allocation - no malloc/free
typedef struct {
    uint8_t data[MAX_BUFFER_SIZE];
    uint16_t length;
} Message;

// Pre-allocated message pool
static Message message_pool[MAX_MESSAGES];
static uint8_t pool_index = 0;

Message* allocate_message(void) {
    if (pool_index >= MAX_MESSAGES) {
        return NULL;  // Pool exhausted
    }
    return &message_pool[pool_index++];
}

void reset_message_pool(void) {
    pool_index = 0;
}
```

### ❌ Example 3: Dynamic Allocation (Avoid in Embedded)

```c
// WRONG: Using malloc in embedded system
Message* bad_allocate_message(void) {
    Message *msg = malloc(sizeof(Message));  // Fragmentation risk!
    if (msg == NULL) {
        // Out of memory - hard to recover
        return NULL;
    }
    return msg;
}
```

### ✅ Example 4: Circular Buffer for Streaming Data

```c
#include <stdint.h>
#include <stdbool.h>

#define BUFFER_SIZE 128

typedef struct {
    uint8_t buffer[BUFFER_SIZE];
    volatile uint16_t head;
    volatile uint16_t tail;
} CircularBuffer;

static CircularBuffer rx_buffer = {0};

bool buffer_put(CircularBuffer *cb, uint8_t data) {
    uint16_t next_head = (cb->head + 1) % BUFFER_SIZE;

    if (next_head == cb->tail) {
        return false;  // Buffer full
    }

    cb->buffer[cb->head] = data;
    cb->head = next_head;
    return true;
}

bool buffer_get(CircularBuffer *cb, uint8_t *data) {
    if (cb->head == cb->tail) {
        return false;  // Buffer empty
    }

    *data = cb->buffer[cb->tail];
    cb->tail = (cb->tail + 1) % BUFFER_SIZE;
    return true;
}

// Can be called from ISR
void UART_RX_ISR(void) {
    uint8_t byte = UART_DR;
    buffer_put(&rx_buffer, byte);
}
```

### ✅ Example 5: Bit Manipulation Macros for Registers

```c
#include <stdint.h>

// Bit manipulation macros
#define BIT(n)              (1U << (n))
#define SET_BIT(reg, bit)   ((reg) |= BIT(bit))
#define CLEAR_BIT(reg, bit) ((reg) &= ~BIT(bit))
#define TOGGLE_BIT(reg, bit) ((reg) ^= BIT(bit))
#define READ_BIT(reg, bit)  (((reg) >> (bit)) & 1U)

// Register field macros
#define FIELD_MASK(width, offset)  (((1U << (width)) - 1) << (offset))
#define FIELD_SET(reg, value, width, offset) \
    ((reg) = ((reg) & ~FIELD_MASK(width, offset)) | \
             (((value) << (offset)) & FIELD_MASK(width, offset)))
#define FIELD_GET(reg, width, offset) \
    (((reg) & FIELD_MASK(width, offset)) >> (offset))

// Example: Configure UART
#define UART_CR1 (*(volatile uint32_t *)0x40011000)
#define UART_CR1_UE_BIT   0  // UART Enable
#define UART_CR1_TE_BIT   3  // Transmitter Enable
#define UART_CR1_RE_BIT   2  // Receiver Enable

void uart_init(void) {
    SET_BIT(UART_CR1, UART_CR1_UE_BIT);  // Enable UART
    SET_BIT(UART_CR1, UART_CR1_TE_BIT);  // Enable TX
    SET_BIT(UART_CR1, UART_CR1_RE_BIT);  // Enable RX
}
```

### ✅ Example 6: Atomic Operations for Shared Data

```c
#include <stdint.h>
#include <stdbool.h>

volatile uint32_t shared_counter = 0;

// Atomic increment (disable interrupts)
void increment_counter(void) {
    __disable_irq();
    shared_counter++;
    __enable_irq();
}

// Better: Use atomic operations if available
#ifdef __ARM_ARCH_7M__
void atomic_increment_counter(void) {
    uint32_t old_val, new_val;
    do {
        old_val = __LDREXW(&shared_counter);
        new_val = old_val + 1;
    } while (__STREXW(new_val, &shared_counter));
}
#endif
```

### ✅ Example 7: Fixed-Size String Buffers

```c
#include <stdint.h>
#include <string.h>

#define MAX_NAME_LENGTH 32

typedef struct {
    char name[MAX_NAME_LENGTH];
    uint8_t id;
} Device;

// Safe string copy with bounds checking
void set_device_name(Device *dev, const char *name) {
    if (dev == NULL || name == NULL) {
        return;
    }

    // Copy at most MAX_NAME_LENGTH-1 characters
    strncpy(dev->name, name, MAX_NAME_LENGTH - 1);
    dev->name[MAX_NAME_LENGTH - 1] = '\0';  // Ensure null termination
}
```

### ✅ Example 8: Hardware Timer Configuration

```c
#include <stdint.h>

#define TIM2_BASE   0x40000000
#define TIM2_CR1    (*(volatile uint32_t *)(TIM2_BASE + 0x00))
#define TIM2_PSC    (*(volatile uint32_t *)(TIM2_BASE + 0x28))
#define TIM2_ARR    (*(volatile uint32_t *)(TIM2_BASE + 0x2C))

// Configure timer for 1ms tick (assuming 72MHz clock)
void timer_init_1ms(void) {
    // Prescaler: 72MHz / 72 = 1MHz
    TIM2_PSC = 72 - 1;

    // Auto-reload: 1MHz / 1000 = 1ms
    TIM2_ARR = 1000 - 1;

    // Enable timer
    TIM2_CR1 |= (1U << 0);  // CEN bit
}
```

### ✅ Example 9: Watchdog Timer Usage

```c
#include <stdint.h>

#define IWDG_KR  (*(volatile uint32_t *)0x40003000)
#define IWDG_PR  (*(volatile uint32_t *)0x40003004)
#define IWDG_RLR (*(volatile uint32_t *)0x40003008)

#define IWDG_KEY_ENABLE  0xCCCC
#define IWDG_KEY_RELOAD  0xAAAA
#define IWDG_KEY_ACCESS  0x5555

void watchdog_init(void) {
    // Enable write access to IWDG registers
    IWDG_KR = IWDG_KEY_ACCESS;

    // Set prescaler (divide by 32)
    IWDG_PR = 3;

    // Set reload value (1 second timeout)
    IWDG_RLR = 1000;

    // Start watchdog
    IWDG_KR = IWDG_KEY_ENABLE;
}

void watchdog_refresh(void) {
    IWDG_KR = IWDG_KEY_RELOAD;
}

// Call this regularly in main loop
void main_loop(void) {
    while (1) {
        // Do work...

        watchdog_refresh();  // Prevent reset
    }
}
```

### ✅ Example 10: Power Management

```c
#include <stdint.h>

#define SCB_SCR (*(volatile uint32_t *)0xE000ED10)

typedef enum {
    SLEEP_MODE_SLEEP,
    SLEEP_MODE_DEEP_SLEEP,
    SLEEP_MODE_STANDBY
} SleepMode;

void enter_sleep_mode(SleepMode mode) {
    switch (mode) {
        case SLEEP_MODE_SLEEP:
            // Clear SLEEPDEEP bit
            SCB_SCR &= ~(1U << 2);
            break;

        case SLEEP_MODE_DEEP_SLEEP:
            // Set SLEEPDEEP bit
            SCB_SCR |= (1U << 2);
            break;

        case SLEEP_MODE_STANDBY:
            // Configure standby mode
            // (platform-specific)
            break;
    }

    // Wait for interrupt
    __WFI();
}
```

### ✅ Example 11: DMA Configuration

```c
#include <stdint.h>

#define DMA1_BASE     0x40020000
#define DMA1_CH1_CCR  (*(volatile uint32_t *)(DMA1_BASE + 0x08))
#define DMA1_CH1_CNDTR (*(volatile uint32_t *)(DMA1_BASE + 0x0C))
#define DMA1_CH1_CPAR (*(volatile uint32_t *)(DMA1_BASE + 0x10))
#define DMA1_CH1_CMAR (*(volatile uint32_t *)(DMA1_BASE + 0x14))

static uint8_t dma_buffer[256];

void dma_init_uart_rx(void) {
    // Disable DMA channel
    DMA1_CH1_CCR &= ~(1U << 0);

    // Set peripheral address (UART data register)
    DMA1_CH1_CPAR = (uint32_t)&UART_DR;

    // Set memory address
    DMA1_CH1_CMAR = (uint32_t)dma_buffer;

    // Set number of data items
    DMA1_CH1_CNDTR = sizeof(dma_buffer);

    // Configure: Memory increment, circular mode, peripheral-to-memory
    DMA1_CH1_CCR = (1U << 7) |  // MINC: Memory increment
                   (1U << 5) |  // CIRC: Circular mode
                   (0U << 4);   // DIR: Peripheral-to-memory

    // Enable DMA channel
    DMA1_CH1_CCR |= (1U << 0);
}
```

### ✅ Example 12: Compile-Time Assertions for Buffer Sizes

```c
#include <stdint.h>

#define BUFFER_SIZE 256

// Compile-time assertion
#define STATIC_ASSERT(condition, message) \
    typedef char static_assertion_##message[(condition) ? 1 : -1]

// Ensure buffer size is power of 2 (for efficient modulo)
STATIC_ASSERT((BUFFER_SIZE & (BUFFER_SIZE - 1)) == 0,
              buffer_size_must_be_power_of_2);

// Ensure buffer fits in available RAM
#define AVAILABLE_RAM 8192
STATIC_ASSERT(BUFFER_SIZE <= AVAILABLE_RAM,
              buffer_exceeds_available_ram);

uint8_t buffer[BUFFER_SIZE];
```

## References

- MISRA C:2012 Guidelines for the use of the C language in critical systems
- CERT C Coding Standard
- Embedded C Coding Standard (Michael Barr)
- ARM Cortex-M Programming Guide
- Microcontroller vendor reference manuals

## Related Rules

- universal-memory-safety
- universal-const-correctness
- category-realtime

## Configuration

Enable in `.augment/c-standards.json`:

```json
{
  "categories": ["embedded"],
  "category_overrides": {
    "embedded": {
      "require_volatile_for_hardware": true,
      "prohibit_dynamic_allocation": true,
      "require_fixed_buffers": true,
      "max_isr_duration_us": 100
    }
  }
}
```

