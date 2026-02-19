/**
 * @file priority-scheduling.c
 * @brief Example demonstrating priority-based task scheduling for RTOS
 * 
 * This example shows:
 * - Task creation with different priorities
 * - Priority-based preemption
 * - Task synchronization
 * - Resource sharing with priority inheritance
 * - Deadline monitoring
 * 
 * Compatible with: FreeRTOS, Zephyr RTOS, or similar
 * Build: Depends on RTOS (see README.md)
 */

#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>

/* RTOS-specific includes (example for FreeRTOS) */
#ifdef USE_FREERTOS
#include "FreeRTOS.h"
#include "task.h"
#include "semphr.h"
#include "queue.h"
#endif

/* Task priorities (higher number = higher priority) */
#define PRIORITY_HIGH       3
#define PRIORITY_MEDIUM     2
#define PRIORITY_LOW        1

/* Task periods (in milliseconds) */
#define PERIOD_HIGH_MS      10
#define PERIOD_MEDIUM_MS    50
#define PERIOD_LOW_MS       100

/* Stack sizes */
#define STACK_SIZE          256

/* Shared resource protection */
static SemaphoreHandle_t resource_mutex = NULL;
static uint32_t shared_counter = 0;

/**
 * @brief High-priority periodic task
 * 
 * Runs every 10ms - Critical real-time task
 */
void high_priority_task(void *params)
{
    TickType_t last_wake_time;
    const TickType_t period = pdMS_TO_TICKS(PERIOD_HIGH_MS);
    
    (void)params;  /* Unused */
    
    /* Initialize last wake time */
    last_wake_time = xTaskGetTickCount();
    
    while (1) {
        /* Wait for next period */
        vTaskDelayUntil(&last_wake_time, period);
        
        /* Critical real-time work */
        /* Example: Read sensor, update control output */
        
        /* Access shared resource with mutex */
        if (xSemaphoreTake(resource_mutex, pdMS_TO_TICKS(5)) == pdTRUE) {
            shared_counter++;
            xSemaphoreGive(resource_mutex);
        } else {
            /* Mutex timeout - log error */
            printf("High priority task: Mutex timeout!\n");
        }
        
        /* Simulate work (replace with actual task) */
        vTaskDelay(pdMS_TO_TICKS(2));
    }
}

/**
 * @brief Medium-priority periodic task
 * 
 * Runs every 50ms - Important but not critical
 */
void medium_priority_task(void *params)
{
    TickType_t last_wake_time;
    const TickType_t period = pdMS_TO_TICKS(PERIOD_MEDIUM_MS);
    
    (void)params;
    
    last_wake_time = xTaskGetTickCount();
    
    while (1) {
        vTaskDelayUntil(&last_wake_time, period);
        
        /* Medium priority work */
        /* Example: Process data, update display */
        
        if (xSemaphoreTake(resource_mutex, pdMS_TO_TICKS(10)) == pdTRUE) {
            /* Read shared resource */
            uint32_t value = shared_counter;
            xSemaphoreGive(resource_mutex);
            
            printf("Medium task: Counter = %u\n", (unsigned int)value);
        }
        
        vTaskDelay(pdMS_TO_TICKS(5));
    }
}

/**
 * @brief Low-priority periodic task
 * 
 * Runs every 100ms - Background processing
 */
void low_priority_task(void *params)
{
    TickType_t last_wake_time;
    const TickType_t period = pdMS_TO_TICKS(PERIOD_LOW_MS);
    
    (void)params;
    
    last_wake_time = xTaskGetTickCount();
    
    while (1) {
        vTaskDelayUntil(&last_wake_time, period);
        
        /* Low priority work */
        /* Example: Logging, housekeeping, diagnostics */
        
        if (xSemaphoreTake(resource_mutex, pdMS_TO_TICKS(20)) == pdTRUE) {
            uint32_t value = shared_counter;
            xSemaphoreGive(resource_mutex);
            
            printf("Low task: Counter = %u\n", (unsigned int)value);
        }
        
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}

/**
 * @brief Aperiodic event handler task
 * 
 * Responds to events with high priority
 */
void event_handler_task(void *params)
{
    QueueHandle_t event_queue = (QueueHandle_t)params;
    uint32_t event_data;
    
    while (1) {
        /* Wait for event (blocking) */
        if (xQueueReceive(event_queue, &event_data, portMAX_DELAY) == pdTRUE) {
            /* Handle event immediately */
            printf("Event handler: Received event %u\n", (unsigned int)event_data);
            
            /* Process event with deadline constraint */
            /* Must complete within 5ms */
            TickType_t start_time = xTaskGetTickCount();
            
            /* Event processing */
            vTaskDelay(pdMS_TO_TICKS(3));
            
            TickType_t end_time = xTaskGetTickCount();
            TickType_t elapsed = end_time - start_time;
            
            if (elapsed > pdMS_TO_TICKS(5)) {
                printf("Event handler: Deadline missed! (%u ms)\n",
                       (unsigned int)(elapsed * portTICK_PERIOD_MS));
            }
        }
    }
}

/**
 * @brief Initialize and start real-time tasks
 */
int main(void)
{
    BaseType_t ret;
    QueueHandle_t event_queue;
    
    printf("Starting Real-Time Priority Scheduling Example\n");
    
    /* Create mutex with priority inheritance */
    resource_mutex = xSemaphoreCreateMutex();
    if (resource_mutex == NULL) {
        printf("Failed to create mutex\n");
        return -1;
    }
    
    /* Create event queue */
    event_queue = xQueueCreate(10, sizeof(uint32_t));
    if (event_queue == NULL) {
        printf("Failed to create event queue\n");
        return -1;
    }
    
    /* Create high-priority task */
    ret = xTaskCreate(high_priority_task,
                     "HighPrio",
                     STACK_SIZE,
                     NULL,
                     PRIORITY_HIGH,
                     NULL);
    if (ret != pdPASS) {
        printf("Failed to create high priority task\n");
        return -1;
    }
    
    /* Create medium-priority task */
    ret = xTaskCreate(medium_priority_task,
                     "MediumPrio",
                     STACK_SIZE,
                     NULL,
                     PRIORITY_MEDIUM,
                     NULL);
    if (ret != pdPASS) {
        printf("Failed to create medium priority task\n");
        return -1;
    }
    
    /* Create low-priority task */
    ret = xTaskCreate(low_priority_task,
                     "LowPrio",
                     STACK_SIZE,
                     NULL,
                     PRIORITY_LOW,
                     NULL);
    if (ret != pdPASS) {
        printf("Failed to create low priority task\n");
        return -1;
    }
    
    /* Create event handler task */
    ret = xTaskCreate(event_handler_task,
                     "EventHandler",
                     STACK_SIZE,
                     (void *)event_queue,
                     PRIORITY_HIGH,
                     NULL);
    if (ret != pdPASS) {
        printf("Failed to create event handler task\n");
        return -1;
    }
    
    /* Start scheduler */
    printf("Starting RTOS scheduler\n");
    vTaskStartScheduler();
    
    /* Should never reach here */
    printf("Scheduler failed to start\n");
    return -1;
}

