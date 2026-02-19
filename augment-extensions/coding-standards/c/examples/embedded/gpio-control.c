/**
 * @file gpio-control.c
 * @brief Example demonstrating GPIO control for embedded systems
 * 
 * This example shows:
 * - Memory-mapped I/O for hardware registers
 * - Volatile keyword usage for hardware access
 * - Bit manipulation for GPIO control
 * - Hardware abstraction layer pattern
 * - Safe register access
 * 
 * Target: Generic ARM Cortex-M microcontroller
 * Note: This is a demonstration. Actual addresses depend on your hardware.
 */

#include <stdint.h>
#include <stdbool.h>

// Example GPIO register addresses (adjust for your hardware)
#define GPIO_BASE_ADDR      0x40020000UL
#define GPIOA_MODER         (*(volatile uint32_t *)(GPIO_BASE_ADDR + 0x00))
#define GPIOA_ODR           (*(volatile uint32_t *)(GPIO_BASE_ADDR + 0x14))
#define GPIOA_IDR           (*(volatile uint32_t *)(GPIO_BASE_ADDR + 0x10))
#define GPIOA_BSRR          (*(volatile uint32_t *)(GPIO_BASE_ADDR + 0x18))

// GPIO pin definitions
#define LED_PIN             5
#define BUTTON_PIN          13

// GPIO modes
typedef enum {
    GPIO_MODE_INPUT  = 0x00,
    GPIO_MODE_OUTPUT = 0x01,
    GPIO_MODE_AF     = 0x02,
    GPIO_MODE_ANALOG = 0x03
} gpio_mode_t;

// GPIO states
typedef enum {
    GPIO_LOW  = 0,
    GPIO_HIGH = 1
} gpio_state_t;

/**
 * @brief Initialize a GPIO pin
 * @param pin Pin number (0-15)
 * @param mode GPIO mode
 */
void gpio_init(uint8_t pin, gpio_mode_t mode) {
    if (pin > 15) {
        return;  // Invalid pin
    }

    // Clear mode bits for this pin
    uint32_t temp = GPIOA_MODER;
    temp &= ~(0x3UL << (pin * 2));
    
    // Set new mode
    temp |= ((uint32_t)mode << (pin * 2));
    GPIOA_MODER = temp;
}

/**
 * @brief Set GPIO pin state
 * @param pin Pin number (0-15)
 * @param state Desired state (HIGH/LOW)
 */
void gpio_write(uint8_t pin, gpio_state_t state) {
    if (pin > 15) {
        return;  // Invalid pin
    }

    // Use BSRR for atomic bit set/reset
    if (state == GPIO_HIGH) {
        GPIOA_BSRR = (1UL << pin);  // Set bit
    } else {
        GPIOA_BSRR = (1UL << (pin + 16));  // Reset bit
    }
}

/**
 * @brief Read GPIO pin state
 * @param pin Pin number (0-15)
 * @return Current pin state
 */
gpio_state_t gpio_read(uint8_t pin) {
    if (pin > 15) {
        return GPIO_LOW;  // Invalid pin
    }

    return (GPIOA_IDR & (1UL << pin)) ? GPIO_HIGH : GPIO_LOW;
}

/**
 * @brief Toggle GPIO pin state
 * @param pin Pin number (0-15)
 */
void gpio_toggle(uint8_t pin) {
    if (pin > 15) {
        return;  // Invalid pin
    }

    // Read current state and toggle
    uint32_t current = GPIOA_ODR;
    GPIOA_ODR = current ^ (1UL << pin);
}

/**
 * @brief Simple delay function (busy-wait)
 * @param count Delay count (hardware-dependent)
 * 
 * Note: In production, use hardware timers instead
 */
void delay(volatile uint32_t count) {
    while (count--) {
        __asm__ volatile ("nop");  // Prevent optimization
    }
}

/**
 * @brief LED blink example
 */
void led_blink_example(void) {
    // Initialize LED pin as output
    gpio_init(LED_PIN, GPIO_MODE_OUTPUT);

    // Blink LED 10 times
    for (int i = 0; i < 10; i++) {
        gpio_write(LED_PIN, GPIO_HIGH);
        delay(500000);
        gpio_write(LED_PIN, GPIO_LOW);
        delay(500000);
    }
}

/**
 * @brief Button-controlled LED example
 */
void button_led_example(void) {
    // Initialize button pin as input
    gpio_init(BUTTON_PIN, GPIO_MODE_INPUT);
    
    // Initialize LED pin as output
    gpio_init(LED_PIN, GPIO_MODE_OUTPUT);

    // Read button and control LED
    for (int i = 0; i < 100; i++) {
        gpio_state_t button_state = gpio_read(BUTTON_PIN);
        gpio_write(LED_PIN, button_state);
        delay(10000);
    }
}

/**
 * @brief Main function
 */
int main(void) {
    // Example 1: LED blink
    led_blink_example();

    // Example 2: Button-controlled LED
    button_led_example();

    // Infinite loop (typical for embedded systems)
    while (1) {
        gpio_toggle(LED_PIN);
        delay(1000000);
    }

    return 0;  // Never reached
}

