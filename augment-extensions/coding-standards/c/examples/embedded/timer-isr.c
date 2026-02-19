/**
 * @file timer-isr.c
 * @brief Example demonstrating timer interrupt service routine (ISR)
 * 
 * This example shows:
 * - Timer configuration for periodic interrupts
 * - Interrupt service routine implementation
 * - Volatile variables for ISR communication
 * - Atomic operations
 * - Minimal ISR execution time
 * 
 * Target: Generic ARM Cortex-M microcontroller
 * Note: This is a demonstration. Actual addresses depend on your hardware.
 */

#include <stdint.h>
#include <stdbool.h>

// Timer register addresses (example for STM32-like MCU)
#define TIM2_BASE           0x40000000UL
#define TIM2_CR1            (*(volatile uint32_t *)(TIM2_BASE + 0x00))
#define TIM2_DIER           (*(volatile uint32_t *)(TIM2_BASE + 0x0C))
#define TIM2_SR             (*(volatile uint32_t *)(TIM2_BASE + 0x10))
#define TIM2_CNT            (*(volatile uint32_t *)(TIM2_BASE + 0x24))
#define TIM2_PSC            (*(volatile uint32_t *)(TIM2_BASE + 0x28))
#define TIM2_ARR            (*(volatile uint32_t *)(TIM2_BASE + 0x2C))

// Timer control bits
#define TIM_CR1_CEN         (1UL << 0)   // Counter enable
#define TIM_DIER_UIE        (1UL << 0)   // Update interrupt enable
#define TIM_SR_UIF          (1UL << 0)   // Update interrupt flag

// NVIC (Nested Vectored Interrupt Controller)
#define NVIC_ISER0          (*(volatile uint32_t *)0xE000E100UL)
#define TIM2_IRQn           28

// Shared variables between ISR and main (must be volatile)
static volatile uint32_t tick_count = 0;
static volatile bool timer_flag = false;

/**
 * @brief Initialize timer for 1ms periodic interrupts
 * @param sysclk System clock frequency in Hz
 */
void timer_init(uint32_t sysclk) {
    // Disable timer during configuration
    TIM2_CR1 &= ~TIM_CR1_CEN;

    // Configure prescaler for 1kHz (1ms) tick
    // PSC = (sysclk / desired_freq) - 1
    TIM2_PSC = (sysclk / 1000) - 1;

    // Auto-reload value for 1ms period
    TIM2_ARR = 1000 - 1;

    // Clear counter
    TIM2_CNT = 0;

    // Enable update interrupt
    TIM2_DIER |= TIM_DIER_UIE;

    // Enable TIM2 interrupt in NVIC
    NVIC_ISER0 |= (1UL << TIM2_IRQn);

    // Start timer
    TIM2_CR1 |= TIM_CR1_CEN;
}

/**
 * @brief Timer interrupt service routine
 * 
 * IMPORTANT ISR Rules:
 * - Keep execution time minimal
 * - No blocking operations
 * - No printf/malloc/etc
 * - Use volatile for shared variables
 * - Clear interrupt flag
 */
void TIM2_IRQHandler(void) {
    // Check if update interrupt occurred
    if (TIM2_SR & TIM_SR_UIF) {
        // Clear interrupt flag (MUST do this!)
        TIM2_SR &= ~TIM_SR_UIF;

        // Increment tick counter (atomic on 32-bit ARM)
        tick_count++;

        // Set flag for main loop
        timer_flag = true;

        // Minimal work in ISR - defer processing to main loop
    }
}

/**
 * @brief Get current tick count (thread-safe)
 * @return Current tick count
 */
uint32_t get_tick_count(void) {
    // Reading 32-bit value is atomic on ARM Cortex-M
    return tick_count;
}

/**
 * @brief Delay for specified milliseconds
 * @param ms Milliseconds to delay
 */
void delay_ms(uint32_t ms) {
    uint32_t start = get_tick_count();
    while ((get_tick_count() - start) < ms) {
        // Wait
    }
}

/**
 * @brief Check and clear timer flag
 * @return true if flag was set, false otherwise
 */
bool check_timer_flag(void) {
    if (timer_flag) {
        timer_flag = false;  // Clear flag
        return true;
    }
    return false;
}

/**
 * @brief Example: Periodic task execution
 */
void periodic_task_example(void) {
    uint32_t last_tick = 0;
    const uint32_t TASK_PERIOD_MS = 100;  // Run every 100ms

    while (1) {
        uint32_t current_tick = get_tick_count();

        if ((current_tick - last_tick) >= TASK_PERIOD_MS) {
            last_tick = current_tick;

            // Execute periodic task
            // (In real code, toggle LED, read sensor, etc.)
        }

        // Check for timer events
        if (check_timer_flag()) {
            // Handle 1ms timer event
        }
    }
}

/**
 * @brief Example: Timeout detection
 */
bool wait_with_timeout(uint32_t timeout_ms) {
    uint32_t start = get_tick_count();

    while (1) {
        // Check timeout
        if ((get_tick_count() - start) >= timeout_ms) {
            return false;  // Timeout occurred
        }

        // Check for event (example: button press)
        // if (event_occurred()) {
        //     return true;
        // }
    }
}

/**
 * @brief Main function
 */
int main(void) {
    // Initialize timer (assuming 72MHz system clock)
    timer_init(72000000);

    // Example 1: Simple delay
    delay_ms(1000);  // 1 second delay

    // Example 2: Periodic task execution
    // periodic_task_example();  // Uncomment to run

    // Example 3: Timeout detection
    bool success = wait_with_timeout(5000);  // 5 second timeout

    // Main loop
    while (1) {
        // Process timer events
        if (check_timer_flag()) {
            // Handle 1ms tick
        }

        // Other main loop tasks
    }

    return 0;  // Never reached
}

