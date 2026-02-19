/**
 * @file deadline-monitoring.c
 * @brief Example demonstrating deadline monitoring for real-time tasks
 * 
 * This example shows:
 * - Deadline-driven scheduling
 * - Execution time monitoring
 * - Deadline miss detection
 * - Worst-case execution time (WCET) tracking
 * - Task timing statistics
 * 
 * Compatible with: FreeRTOS, Zephyr RTOS, or POSIX real-time
 * Build: See README.md for RTOS-specific instructions
 */

#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>

#ifdef USE_FREERTOS
#include "FreeRTOS.h"
#include "task.h"
#include "timers.h"
#endif

/* Task timing constraints */
#define TASK_PERIOD_MS          100
#define TASK_DEADLINE_MS        80
#define TASK_WCET_MS            50

/* Statistics tracking */
typedef struct {
    uint32_t executions;
    uint32_t deadline_misses;
    uint32_t min_execution_time_us;
    uint32_t max_execution_time_us;
    uint32_t total_execution_time_us;
} task_stats_t;

static task_stats_t task_stats = {0};

/**
 * @brief Get current time in microseconds
 * @return Current time in microseconds
 */
static inline uint32_t get_time_us(void)
{
#ifdef USE_FREERTOS
    return (uint32_t)(xTaskGetTickCount() * 1000 / configTICK_RATE_HZ);
#else
    /* Platform-specific implementation */
    return 0;  /* Placeholder */
#endif
}

/**
 * @brief Initialize task statistics
 */
static void init_task_stats(task_stats_t *stats)
{
    memset(stats, 0, sizeof(task_stats_t));
    stats->min_execution_time_us = UINT32_MAX;
}

/**
 * @brief Update task statistics
 * @param stats Statistics structure
 * @param execution_time_us Execution time in microseconds
 * @param deadline_met Whether deadline was met
 */
static void update_task_stats(task_stats_t *stats,
                              uint32_t execution_time_us,
                              bool deadline_met)
{
    stats->executions++;
    stats->total_execution_time_us += execution_time_us;
    
    if (execution_time_us < stats->min_execution_time_us) {
        stats->min_execution_time_us = execution_time_us;
    }
    
    if (execution_time_us > stats->max_execution_time_us) {
        stats->max_execution_time_us = execution_time_us;
    }
    
    if (!deadline_met) {
        stats->deadline_misses++;
    }
}

/**
 * @brief Print task statistics
 */
static void print_task_stats(const task_stats_t *stats)
{
    if (stats->executions == 0) {
        printf("No executions yet\n");
        return;
    }
    
    uint32_t avg_time = stats->total_execution_time_us / stats->executions;
    float miss_rate = (float)stats->deadline_misses / stats->executions * 100.0f;
    
    printf("\n=== Task Statistics ===\n");
    printf("Executions:      %u\n", (unsigned int)stats->executions);
    printf("Deadline misses: %u (%.2f%%)\n", 
           (unsigned int)stats->deadline_misses, miss_rate);
    printf("Min exec time:   %u us\n", (unsigned int)stats->min_execution_time_us);
    printf("Max exec time:   %u us\n", (unsigned int)stats->max_execution_time_us);
    printf("Avg exec time:   %u us\n", (unsigned int)avg_time);
    printf("======================\n\n");
}

/**
 * @brief Simulate task workload
 * @param workload_us Workload duration in microseconds
 */
static void simulate_workload(uint32_t workload_us)
{
    uint32_t start = get_time_us();
    
    /* Busy-wait to simulate work */
    while ((get_time_us() - start) < workload_us) {
        /* Simulate computation */
        volatile uint32_t dummy = 0;
        for (int i = 0; i < 100; i++) {
            dummy += i;
        }
    }
}

/**
 * @brief Deadline-monitored task
 * 
 * This task monitors its own execution time and detects deadline misses
 */
void deadline_monitored_task(void *params)
{
    TickType_t last_wake_time;
    const TickType_t period = pdMS_TO_TICKS(TASK_PERIOD_MS);
    const uint32_t deadline_us = TASK_DEADLINE_MS * 1000;
    uint32_t iteration = 0;
    
    (void)params;
    
    init_task_stats(&task_stats);
    last_wake_time = xTaskGetTickCount();
    
    printf("Deadline-monitored task started\n");
    printf("Period: %u ms, Deadline: %u ms\n", 
           TASK_PERIOD_MS, TASK_DEADLINE_MS);
    
    while (1) {
        /* Wait for next period */
        vTaskDelayUntil(&last_wake_time, period);
        
        /* Record start time */
        uint32_t start_time = get_time_us();
        TickType_t release_time = xTaskGetTickCount();
        
        /* Perform task work */
        /* Vary workload to demonstrate deadline monitoring */
        uint32_t workload_us;
        if (iteration % 10 == 0) {
            /* Occasionally exceed deadline to demonstrate detection */
            workload_us = (TASK_DEADLINE_MS + 10) * 1000;
        } else {
            /* Normal workload within deadline */
            workload_us = (TASK_WCET_MS - 10) * 1000;
        }
        
        simulate_workload(workload_us);
        
        /* Record end time */
        uint32_t end_time = get_time_us();
        uint32_t execution_time_us = end_time - start_time;
        
        /* Check deadline */
        bool deadline_met = (execution_time_us <= deadline_us);
        
        /* Update statistics */
        update_task_stats(&task_stats, execution_time_us, deadline_met);
        
        /* Log deadline miss */
        if (!deadline_met) {
            printf("DEADLINE MISS! Iteration %u: %u us (deadline: %u us)\n",
                   (unsigned int)iteration,
                   (unsigned int)execution_time_us,
                   (unsigned int)deadline_us);
        }
        
        /* Print statistics every 20 iterations */
        if (iteration % 20 == 0 && iteration > 0) {
            print_task_stats(&task_stats);
        }
        
        iteration++;
    }
}

/**
 * @brief Watchdog timer callback for deadline enforcement
 * 
 * This timer fires at the deadline to detect if task is still running
 */
void deadline_watchdog_callback(TimerHandle_t timer)
{
    (void)timer;
    
    /* In a real system, this would check if the task completed */
    /* and take corrective action if deadline was missed */
    printf("Watchdog: Checking deadline compliance\n");
}

/**
 * @brief Initialize deadline monitoring system
 */
int main(void)
{
    BaseType_t ret;
    TimerHandle_t watchdog_timer;
    
    printf("Starting Deadline Monitoring Example\n");
    
    /* Create deadline watchdog timer */
    watchdog_timer = xTimerCreate("DeadlineWatchdog",
                                  pdMS_TO_TICKS(TASK_DEADLINE_MS),
                                  pdTRUE,  /* Auto-reload */
                                  NULL,
                                  deadline_watchdog_callback);
    if (watchdog_timer == NULL) {
        printf("Failed to create watchdog timer\n");
        return -1;
    }
    
    /* Create deadline-monitored task */
    ret = xTaskCreate(deadline_monitored_task,
                     "DeadlineTask",
                     512,
                     NULL,
                     2,  /* Medium priority */
                     NULL);
    if (ret != pdPASS) {
        printf("Failed to create deadline-monitored task\n");
        return -1;
    }
    
    /* Start watchdog timer */
    xTimerStart(watchdog_timer, 0);
    
    /* Start scheduler */
    printf("Starting RTOS scheduler\n");
    vTaskStartScheduler();
    
    /* Should never reach here */
    printf("Scheduler failed to start\n");
    return -1;
}

