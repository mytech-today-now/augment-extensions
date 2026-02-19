/**
 * @file protocol-parser.c
 * @brief Example binary protocol parser with error handling
 * 
 * This example demonstrates:
 * - Binary protocol parsing
 * - Endianness handling
 * - Input validation
 * - State machine for parsing
 * - Error detection and recovery
 * 
 * Protocol Format:
 *   Header: [MAGIC(2)] [TYPE(1)] [LENGTH(2)] [CHECKSUM(1)]
 *   Payload: [DATA(LENGTH)]
 * 
 * Compile: gcc -Wall -Wextra -std=c11 -o protocol-parser protocol-parser.c
 * Run: ./protocol-parser
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <stdbool.h>
#include <arpa/inet.h>  /* For ntohs/htons */

#define PROTOCOL_MAGIC      0xABCD
#define MAX_PAYLOAD_SIZE    1024
#define HEADER_SIZE         6

/* Message types */
typedef enum {
    MSG_TYPE_DATA    = 0x01,
    MSG_TYPE_ACK     = 0x02,
    MSG_TYPE_NACK    = 0x03,
    MSG_TYPE_PING    = 0x04,
    MSG_TYPE_PONG    = 0x05
} message_type_t;

/* Parser states */
typedef enum {
    STATE_WAIT_MAGIC,
    STATE_WAIT_TYPE,
    STATE_WAIT_LENGTH,
    STATE_WAIT_CHECKSUM,
    STATE_WAIT_PAYLOAD,
    STATE_COMPLETE,
    STATE_ERROR
} parser_state_t;

/* Protocol message structure */
typedef struct {
    uint16_t magic;
    uint8_t type;
    uint16_t length;
    uint8_t checksum;
    uint8_t payload[MAX_PAYLOAD_SIZE];
} protocol_message_t;

/* Parser context */
typedef struct {
    parser_state_t state;
    protocol_message_t message;
    size_t bytes_received;
    size_t payload_received;
} parser_context_t;

/**
 * @brief Calculate simple checksum
 */
static uint8_t calculate_checksum(const uint8_t *data, size_t length) {
    uint8_t checksum = 0;
    for (size_t i = 0; i < length; i++) {
        checksum ^= data[i];
    }
    return checksum;
}

/**
 * @brief Initialize parser context
 */
static void parser_init(parser_context_t *ctx) {
    memset(ctx, 0, sizeof(*ctx));
    ctx->state = STATE_WAIT_MAGIC;
}

/**
 * @brief Parse incoming byte
 * @return true if message complete, false otherwise
 */
static bool parser_process_byte(parser_context_t *ctx, uint8_t byte) {
    switch (ctx->state) {
        case STATE_WAIT_MAGIC:
            if (ctx->bytes_received == 0) {
                /* First byte of magic */
                ctx->message.magic = byte << 8;
                ctx->bytes_received = 1;
            } else {
                /* Second byte of magic */
                ctx->message.magic |= byte;
                if (ctx->message.magic == PROTOCOL_MAGIC) {
                    ctx->state = STATE_WAIT_TYPE;
                    ctx->bytes_received = 0;
                } else {
                    /* Invalid magic, reset */
                    printf("Error: Invalid magic 0x%04X\n", ctx->message.magic);
                    parser_init(ctx);
                }
            }
            break;
            
        case STATE_WAIT_TYPE:
            ctx->message.type = byte;
            ctx->state = STATE_WAIT_LENGTH;
            ctx->bytes_received = 0;
            break;
            
        case STATE_WAIT_LENGTH:
            if (ctx->bytes_received == 0) {
                /* First byte of length (MSB) */
                ctx->message.length = byte << 8;
                ctx->bytes_received = 1;
            } else {
                /* Second byte of length (LSB) */
                ctx->message.length |= byte;
                if (ctx->message.length > MAX_PAYLOAD_SIZE) {
                    printf("Error: Payload too large (%u bytes)\n", ctx->message.length);
                    ctx->state = STATE_ERROR;
                } else {
                    ctx->state = STATE_WAIT_CHECKSUM;
                    ctx->bytes_received = 0;
                }
            }
            break;
            
        case STATE_WAIT_CHECKSUM:
            ctx->message.checksum = byte;
            if (ctx->message.length > 0) {
                ctx->state = STATE_WAIT_PAYLOAD;
                ctx->payload_received = 0;
            } else {
                /* No payload, verify checksum */
                uint8_t expected = calculate_checksum(NULL, 0);
                if (ctx->message.checksum == expected) {
                    ctx->state = STATE_COMPLETE;
                    return true;
                } else {
                    printf("Error: Checksum mismatch\n");
                    ctx->state = STATE_ERROR;
                }
            }
            break;
            
        case STATE_WAIT_PAYLOAD:
            ctx->message.payload[ctx->payload_received++] = byte;
            if (ctx->payload_received >= ctx->message.length) {
                /* Verify checksum */
                uint8_t expected = calculate_checksum(ctx->message.payload,
                                                      ctx->message.length);
                if (ctx->message.checksum == expected) {
                    ctx->state = STATE_COMPLETE;
                    return true;
                } else {
                    printf("Error: Checksum mismatch (expected 0x%02X, got 0x%02X)\n",
                           expected, ctx->message.checksum);
                    ctx->state = STATE_ERROR;
                }
            }
            break;
            
        case STATE_COMPLETE:
        case STATE_ERROR:
            /* Reset parser */
            parser_init(ctx);
            break;
    }
    
    return false;
}

/**
 * @brief Create protocol message
 */
static size_t create_message(uint8_t *buffer, size_t buffer_size,
                             message_type_t type, const uint8_t *payload,
                             uint16_t payload_len) {
    if (buffer_size < HEADER_SIZE + payload_len) {
        return 0;  /* Buffer too small */
    }
    
    size_t offset = 0;
    
    /* Magic (big-endian) */
    uint16_t magic = htons(PROTOCOL_MAGIC);
    memcpy(buffer + offset, &magic, 2);
    offset += 2;
    
    /* Type */
    buffer[offset++] = type;
    
    /* Length (big-endian) */
    uint16_t length = htons(payload_len);
    memcpy(buffer + offset, &length, 2);
    offset += 2;
    
    /* Checksum */
    uint8_t checksum = calculate_checksum(payload, payload_len);
    buffer[offset++] = checksum;
    
    /* Payload */
    if (payload_len > 0) {
        memcpy(buffer + offset, payload, payload_len);
        offset += payload_len;
    }
    
    return offset;
}

/**
 * @brief Print parsed message
 */
static void print_message(const protocol_message_t *msg) {
    printf("\n=== Parsed Message ===\n");
    printf("Magic:    0x%04X\n", msg->magic);
    printf("Type:     0x%02X\n", msg->type);
    printf("Length:   %u bytes\n", msg->length);
    printf("Checksum: 0x%02X\n", msg->checksum);
    if (msg->length > 0) {
        printf("Payload:  ");
        for (uint16_t i = 0; i < msg->length && i < 32; i++) {
            printf("%02X ", msg->payload[i]);
        }
        if (msg->length > 32) {
            printf("...");
        }
        printf("\n");
    }
    printf("=====================\n\n");
}

/**
 * @brief Test protocol parser
 */
int main(void) {
    uint8_t buffer[256];
    parser_context_t parser;
    
    printf("Protocol Parser Example\n\n");
    
    /* Create test message */
    const char *test_data = "Hello, Protocol!";
    size_t msg_len = create_message(buffer, sizeof(buffer),
                                    MSG_TYPE_DATA,
                                    (const uint8_t *)test_data,
                                    strlen(test_data));
    
    printf("Created message of %zu bytes\n", msg_len);
    
    /* Parse message byte by byte */
    parser_init(&parser);
    for (size_t i = 0; i < msg_len; i++) {
        if (parser_process_byte(&parser, buffer[i])) {
            printf("Message parsed successfully!\n");
            print_message(&parser.message);
        }
    }
    
    return EXIT_SUCCESS;
}

