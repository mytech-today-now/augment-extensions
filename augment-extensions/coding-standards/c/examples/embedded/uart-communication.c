/**
 * @file uart-communication.c
 * @brief Example demonstrating UART communication for embedded systems
 * 
 * This example shows:
 * - UART initialization and configuration
 * - Interrupt-driven UART transmission
 * - Circular buffer for received data
 * - Hardware abstraction layer
 * - Error handling
 * 
 * Target: Generic ARM Cortex-M microcontroller
 * Note: This is a demonstration. Actual addresses depend on your hardware.
 */

#include <stdint.h>
#include <stdbool.h>
#include <string.h>

// UART register addresses (example for STM32-like MCU)
#define USART1_BASE         0x40013800UL
#define USART1_SR           (*(volatile uint32_t *)(USART1_BASE + 0x00))
#define USART1_DR           (*(volatile uint32_t *)(USART1_BASE + 0x04))
#define USART1_BRR          (*(volatile uint32_t *)(USART1_BASE + 0x08))
#define USART1_CR1          (*(volatile uint32_t *)(USART1_BASE + 0x0C))

// UART status register bits
#define USART_SR_TXE        (1UL << 7)   // Transmit data register empty
#define USART_SR_RXNE       (1UL << 5)   // Read data register not empty
#define USART_SR_ORE        (1UL << 3)   // Overrun error
#define USART_SR_FE         (1UL << 1)   // Framing error

// UART control register bits
#define USART_CR1_UE        (1UL << 13)  // USART enable
#define USART_CR1_TE        (1UL << 3)   // Transmitter enable
#define USART_CR1_RE        (1UL << 2)   // Receiver enable
#define USART_CR1_RXNEIE    (1UL << 5)   // RXNE interrupt enable

// Circular buffer for received data
#define RX_BUFFER_SIZE      256

typedef struct {
    uint8_t buffer[RX_BUFFER_SIZE];
    volatile uint16_t head;
    volatile uint16_t tail;
} circular_buffer_t;

static circular_buffer_t rx_buffer = {0};

/**
 * @brief Initialize circular buffer
 * @param cb Pointer to circular buffer
 */
void buffer_init(circular_buffer_t *cb) {
    cb->head = 0;
    cb->tail = 0;
}

/**
 * @brief Write byte to circular buffer
 * @param cb Pointer to circular buffer
 * @param data Byte to write
 * @return true if successful, false if buffer full
 */
bool buffer_write(circular_buffer_t *cb, uint8_t data) {
    uint16_t next_head = (cb->head + 1) % RX_BUFFER_SIZE;
    
    if (next_head == cb->tail) {
        return false;  // Buffer full
    }
    
    cb->buffer[cb->head] = data;
    cb->head = next_head;
    return true;
}

/**
 * @brief Read byte from circular buffer
 * @param cb Pointer to circular buffer
 * @param data Pointer to store read byte
 * @return true if successful, false if buffer empty
 */
bool buffer_read(circular_buffer_t *cb, uint8_t *data) {
    if (cb->head == cb->tail) {
        return false;  // Buffer empty
    }
    
    *data = cb->buffer[cb->tail];
    cb->tail = (cb->tail + 1) % RX_BUFFER_SIZE;
    return true;
}

/**
 * @brief Get number of bytes available in buffer
 * @param cb Pointer to circular buffer
 * @return Number of bytes available
 */
uint16_t buffer_available(const circular_buffer_t *cb) {
    return (cb->head - cb->tail + RX_BUFFER_SIZE) % RX_BUFFER_SIZE;
}

/**
 * @brief Initialize UART
 * @param baudrate Desired baud rate
 * @param sysclk System clock frequency in Hz
 */
void uart_init(uint32_t baudrate, uint32_t sysclk) {
    // Disable UART during configuration
    USART1_CR1 &= ~USART_CR1_UE;

    // Configure baud rate
    // BRR = sysclk / baudrate
    USART1_BRR = sysclk / baudrate;

    // Enable UART, transmitter, receiver, and RX interrupt
    USART1_CR1 = USART_CR1_UE | USART_CR1_TE | USART_CR1_RE | USART_CR1_RXNEIE;

    // Initialize RX buffer
    buffer_init(&rx_buffer);
}

/**
 * @brief UART interrupt service routine
 */
void USART1_IRQHandler(void) {
    // Check for receive interrupt
    if (USART1_SR & USART_SR_RXNE) {
        uint8_t data = (uint8_t)(USART1_DR & 0xFF);
        
        // Store in circular buffer
        if (!buffer_write(&rx_buffer, data)) {
            // Buffer overflow - data lost
        }
    }

    // Check for errors
    if (USART1_SR & (USART_SR_ORE | USART_SR_FE)) {
        // Clear error by reading DR
        (void)USART1_DR;
    }
}

/**
 * @brief Send single byte via UART
 * @param data Byte to send
 */
void uart_send_byte(uint8_t data) {
    // Wait for transmit register to be empty
    while (!(USART1_SR & USART_SR_TXE)) {
        // Wait
    }
    
    USART1_DR = data;
}

/**
 * @brief Send string via UART
 * @param str Null-terminated string to send
 */
void uart_send_string(const char *str) {
    while (*str) {
        uart_send_byte((uint8_t)*str++);
    }
}

/**
 * @brief Receive byte from UART (non-blocking)
 * @param data Pointer to store received byte
 * @return true if byte received, false if no data available
 */
bool uart_receive_byte(uint8_t *data) {
    return buffer_read(&rx_buffer, data);
}

/**
 * @brief Check if data is available
 * @return Number of bytes available
 */
uint16_t uart_available(void) {
    return buffer_available(&rx_buffer);
}

/**
 * @brief Example: Echo received characters
 */
void uart_echo_example(void) {
    uint8_t data;
    
    while (1) {
        if (uart_receive_byte(&data)) {
            // Echo back received character
            uart_send_byte(data);
        }
    }
}

/**
 * @brief Main function
 */
int main(void) {
    // Initialize UART (115200 baud, 72MHz system clock)
    uart_init(115200, 72000000);

    // Send startup message
    uart_send_string("UART Example Started\r\n");

    // Run echo example
    uart_echo_example();

    return 0;  // Never reached
}

