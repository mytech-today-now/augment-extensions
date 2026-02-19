# Rule: Real-Time Systems

## Metadata
- **ID**: category-realtime
- **Category**: realtime
- **Severity**: ERROR
- **Standard**: POSIX Real-Time Extensions, RTOS Best Practices
- **Version**: 1.0.0

## Description
Real-time systems programming rules covering deterministic timing, priority-based scheduling, deadline management, and avoiding priority inversion.

## Rationale
Real-time systems must respond to events within strict time constraints. Missing deadlines can lead to system failure, data loss, or safety hazards. These rules ensure predictable, deterministic behavior.

## Applies To
- C Standards: c99, c11, c17
- Categories: realtime
- Platforms: RTOS (FreeRTOS, Zephyr, VxWorks), POSIX real-time, embedded systems

## Rule Details

### 1. Deterministic Timing
- Avoid unbounded loops
- Use fixed-size data structures
- Avoid dynamic memory allocation
- Minimize interrupt latency
- Use worst-case execution time (WCET) analysis

### 2. Priority-Based Scheduling
- Assign priorities based on deadline
- Use rate-monotonic or deadline-monotonic scheduling
- Higher priority for shorter deadlines
- Document priority assignments

### 3. Avoiding Priority Inversion
- Use priority inheritance mutexes
- Minimize critical section duration
- Avoid nested locks when possible
- Use priority ceiling protocol

### 4. Deadline Management
- Track task execution time
- Monitor deadline misses
- Implement deadline handlers
- Use watchdog timers

### 5. Interrupt Management
- Keep ISRs short and deterministic
- Defer processing to tasks
- Use interrupt priorities correctly
- Disable interrupts minimally

## Examples

### ✅ Example 1: Priority-Based Task Creation (FreeRTOS)

```c
#include "FreeRTOS.h"
#include "task.h"

#define TASK_STACK_SIZE 256

// Priority assignments (higher number = higher priority)
#define PRIORITY_CRITICAL   5  // 1ms deadline
#define PRIORITY_HIGH       4  // 10ms deadline
#define PRIORITY_MEDIUM     3  // 100ms deadline
#define PRIORITY_LOW        2  // 1s deadline
#define PRIORITY_IDLE       1  // Background

void critical_task(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();
    const TickType_t xPeriod = pdMS_TO_TICKS(1);  // 1ms period
    
    while (1) {
        // Critical processing (must complete in <1ms)
        process_critical_data();
        
        // Wait for next period
        vTaskDelayUntil(&xLastWakeTime, xPeriod);
    }
}

void create_realtime_tasks(void) {
    BaseType_t ret;
    
    ret = xTaskCreate(critical_task, "Critical", TASK_STACK_SIZE,
                      NULL, PRIORITY_CRITICAL, NULL);
    if (ret != pdPASS) {
        // Handle error
        error_handler();
    }
    
    ret = xTaskCreate(high_priority_task, "High", TASK_STACK_SIZE,
                      NULL, PRIORITY_HIGH, NULL);
    if (ret != pdPASS) {
        error_handler();
    }
}
```

### ❌ Example 1: Poor Priority Assignment

```c
// WRONG: All tasks at same priority - no real-time guarantees
xTaskCreate(critical_task, "Critical", 256, NULL, 1, NULL);
xTaskCreate(background_task, "Background", 256, NULL, 1, NULL);
// Both tasks will round-robin - critical task may miss deadlines!
```

### ✅ Example 2: Priority Inheritance Mutex

```c
#include "FreeRTOS.h"
#include "semphr.h"

static SemaphoreHandle_t xMutex;

void init_priority_inheritance_mutex(void) {
    // Create mutex with priority inheritance
    xMutex = xSemaphoreCreateMutex();
    if (xMutex == NULL) {
        error_handler();
    }
}

void high_priority_task(void *pvParameters) {
    while (1) {
        // Take mutex (will inherit priority if needed)
        if (xSemaphoreTake(xMutex, portMAX_DELAY) == pdTRUE) {
            // Critical section
            access_shared_resource();
            
            // Release mutex
            xSemaphoreGive(xMutex);
        }
        
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}

void low_priority_task(void *pvParameters) {
    while (1) {
        if (xSemaphoreTake(xMutex, portMAX_DELAY) == pdTRUE) {
            // If high-priority task waits, this task inherits its priority
            access_shared_resource();
            xSemaphoreGive(xMutex);
        }
        
        vTaskDelay(pdMS_TO_TICKS(100));
    }
}
```

### ❌ Example 2: Priority Inversion Risk

```c
// WRONG: Using binary semaphore instead of mutex
SemaphoreHandle_t xSemaphore = xSemaphoreCreateBinary();

// No priority inheritance - can cause priority inversion!
// High-priority task blocked by low-priority task
// Medium-priority task preempts low-priority task
// High-priority task waits indefinitely!
```

### ✅ Example 3: Deterministic Loop with Bounded Iterations

```c
#include <stdint.h>

#define MAX_ITEMS 100

typedef struct {
    uint32_t data[MAX_ITEMS];
    uint32_t count;
} DataBuffer;

// Deterministic: always processes exactly MAX_ITEMS
uint32_t process_buffer_deterministic(DataBuffer *buf) {
    uint32_t sum = 0;
    uint32_t i;
    
    // Fixed iteration count - deterministic WCET
    for (i = 0; i < MAX_ITEMS; i++) {
        if (i < buf->count) {
            sum += buf->data[i];
        }
    }
    
    return sum;
}
```

### ❌ Example 3: Non-Deterministic Loop

```c
// WRONG: Unbounded loop - non-deterministic execution time
uint32_t bad_process_buffer(DataBuffer *buf) {
    uint32_t sum = 0;
    uint32_t i = 0;
    
    // Variable iteration count - unpredictable WCET!
    while (i < buf->count) {  // count could be anything!
        sum += buf->data[i];
        i++;
    }
    
    return sum;
}
```

### ✅ Example 4: Deadline Monitoring

```c
#include "FreeRTOS.h"
#include "task.h"

typedef struct {
    TickType_t period;
    TickType_t deadline;
    TickType_t wcet;  // Worst-case execution time
    uint32_t missed_deadlines;
} TaskTiming;

static TaskTiming task_timing = {
    .period = pdMS_TO_TICKS(10),
    .deadline = pdMS_TO_TICKS(10),
    .wcet = pdMS_TO_TICKS(5),
    .missed_deadlines = 0
};

void monitored_task(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();
    TickType_t xStartTime, xEndTime, xExecutionTime;
    
    while (1) {
        xStartTime = xTaskGetTickCount();
        
        // Perform task work
        do_task_work();
        
        xEndTime = xTaskGetTickCount();
        xExecutionTime = xEndTime - xStartTime;
        
        // Check for deadline miss
        if (xExecutionTime > task_timing.deadline) {
            task_timing.missed_deadlines++;
            handle_deadline_miss();
        }
        
        // Update WCET if needed
        if (xExecutionTime > task_timing.wcet) {
            task_timing.wcet = xExecutionTime;
        }
        
        vTaskDelayUntil(&xLastWakeTime, task_timing.period);
    }
}
```

### ✅ Example 5: Short ISR with Deferred Processing

```c
#include "FreeRTOS.h"
#include "semphr.h"

static SemaphoreHandle_t xDataReadySemaphore;
static volatile uint32_t received_data;

// ISR: Keep it minimal and deterministic
void UART_IRQHandler(void) {
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;

    // Read data (clears interrupt)
    received_data = UART->DR;

    // Signal task to process data
    xSemaphoreGiveFromISR(xDataReadySemaphore, &xHigherPriorityTaskWoken);

    // Yield if higher priority task was woken
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}

// Task: Process data outside ISR
void data_processing_task(void *pvParameters) {
    while (1) {
        // Wait for data from ISR
        if (xSemaphoreTake(xDataReadySemaphore, portMAX_DELAY) == pdTRUE) {
            // Process data (can take longer, use resources)
            process_received_data(received_data);
        }
    }
}
```

### ✅ Example 6: Rate Monotonic Scheduling

```c
// Rate Monotonic Scheduling: Shorter period = Higher priority

// Task 1: Period = 10ms, Priority = 5 (highest)
void task_10ms(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();
    const TickType_t xPeriod = pdMS_TO_TICKS(10);

    while (1) {
        // Execute in <10ms
        fast_control_loop();
        vTaskDelayUntil(&xLastWakeTime, xPeriod);
    }
}

// Task 2: Period = 50ms, Priority = 4
void task_50ms(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();
    const TickType_t xPeriod = pdMS_TO_TICKS(50);

    while (1) {
        // Execute in <50ms
        medium_speed_processing();
        vTaskDelayUntil(&xLastWakeTime, xPeriod);
    }
}

// Task 3: Period = 100ms, Priority = 3
void task_100ms(void *pvParameters) {
    TickType_t xLastWakeTime = xTaskGetTickCount();
    const TickType_t xPeriod = pdMS_TO_TICKS(100);

    while (1) {
        // Execute in <100ms
        slow_background_work();
        vTaskDelayUntil(&xLastWakeTime, xPeriod);
    }
}

// Schedulability test: U = C1/T1 + C2/T2 + C3/T3 <= n(2^(1/n) - 1)
// For 3 tasks: U <= 0.78
```

### ✅ Example 7: Minimal Critical Section

```c
#include "FreeRTOS.h"
#include "task.h"

static volatile uint32_t shared_counter = 0;

// Good: Minimal critical section
void increment_counter_good(void) {
    taskENTER_CRITICAL();
    shared_counter++;  // Very short operation
    taskEXIT_CRITICAL();
}

// Better: Use atomic operations if available
void increment_counter_atomic(void) {
    __atomic_fetch_add(&shared_counter, 1, __ATOMIC_SEQ_CST);
}
```

### ❌ Example 7: Long Critical Section

```c
// WRONG: Long critical section blocks all interrupts
void bad_critical_section(void) {
    taskENTER_CRITICAL();

    // WRONG: Complex processing with interrupts disabled!
    for (int i = 0; i < 1000; i++) {
        complex_calculation();
    }

    shared_counter++;
    taskEXIT_CRITICAL();
    // Interrupts were disabled for too long!
}
```

### ✅ Example 8: POSIX Real-Time Scheduling

```c
#include <pthread.h>
#include <sched.h>
#include <time.h>

void* realtime_thread(void* arg) {
    struct timespec next_period;
    const long period_ns = 10000000;  // 10ms

    clock_gettime(CLOCK_MONOTONIC, &next_period);

    while (1) {
        // Do work
        perform_realtime_task();

        // Calculate next period
        next_period.tv_nsec += period_ns;
        if (next_period.tv_nsec >= 1000000000) {
            next_period.tv_nsec -= 1000000000;
            next_period.tv_sec++;
        }

        // Sleep until next period
        clock_nanosleep(CLOCK_MONOTONIC, TIMER_ABSTIME, &next_period, NULL);
    }

    return NULL;
}

int create_realtime_thread(void) {
    pthread_t thread;
    pthread_attr_t attr;
    struct sched_param param;
    int ret;

    // Initialize thread attributes
    pthread_attr_init(&attr);

    // Set scheduling policy to FIFO
    pthread_attr_setschedpolicy(&attr, SCHED_FIFO);

    // Set priority (1-99, higher is more important)
    param.sched_priority = 80;
    pthread_attr_setschedparam(&attr, &param);

    // Set inherit scheduler to explicit
    pthread_attr_setinheritsched(&attr, PTHREAD_EXPLICIT_SCHED);

    // Create thread
    ret = pthread_create(&thread, &attr, realtime_thread, NULL);

    pthread_attr_destroy(&attr);

    return ret;
}
```

### ✅ Example 9: Jitter Reduction

```c
#include "FreeRTOS.h"
#include "task.h"

// Reduce jitter by using absolute timing
void low_jitter_task(void *pvParameters) {
    TickType_t xLastWakeTime;
    const TickType_t xPeriod = pdMS_TO_TICKS(10);

    // Initialize with current time
    xLastWakeTime = xTaskGetTickCount();

    while (1) {
        // vTaskDelayUntil provides lower jitter than vTaskDelay
        // because it uses absolute time, not relative delay
        vTaskDelayUntil(&xLastWakeTime, xPeriod);

        // Task executes at precise intervals
        precise_timing_required_function();
    }
}
```

### ❌ Example 9: High Jitter

```c
// WRONG: Using relative delay accumulates jitter
void high_jitter_task(void *pvParameters) {
    while (1) {
        precise_timing_required_function();

        // WRONG: Delay is relative to when task finishes
        // Jitter accumulates over time!
        vTaskDelay(pdMS_TO_TICKS(10));
    }
}
```

### ✅ Example 10: Stack Usage Monitoring

```c
#include "FreeRTOS.h"
#include "task.h"

void monitor_stack_usage(void) {
    TaskHandle_t xHandle = xTaskGetCurrentTaskHandle();
    UBaseType_t uxHighWaterMark;

    // Get minimum free stack space (in words)
    uxHighWaterMark = uxTaskGetStackHighWaterMark(xHandle);

    if (uxHighWaterMark < 50) {  // Less than 50 words free
        // Stack overflow risk!
        handle_low_stack_warning();
    }
}

void realtime_task_with_monitoring(void *pvParameters) {
    while (1) {
        do_work();

        // Periodically check stack usage
        monitor_stack_usage();

        vTaskDelay(pdMS_TO_TICKS(100));
    }
}
```

### ✅ Example 11: Watchdog Timer for Deadline Enforcement

```c
#include "FreeRTOS.h"
#include "timers.h"

static TimerHandle_t xWatchdogTimer;

void watchdog_callback(TimerHandle_t xTimer) {
    // Deadline missed - task didn't reset watchdog in time
    handle_deadline_violation();

    // Could reset system, log error, switch to safe mode, etc.
}

void init_task_watchdog(void) {
    // Create one-shot timer (10ms timeout)
    xWatchdogTimer = xTimerCreate("Watchdog", pdMS_TO_TICKS(10),
                                  pdFALSE, NULL, watchdog_callback);
}

void deadline_critical_task(void *pvParameters) {
    while (1) {
        // Start watchdog
        xTimerStart(xWatchdogTimer, 0);

        // Perform time-critical work
        time_critical_function();

        // Reset watchdog (deadline met)
        xTimerReset(xWatchdogTimer, 0);

        vTaskDelay(pdMS_TO_TICKS(10));
    }
}
```

### ✅ Example 12: Memory Pool for Deterministic Allocation

```c
#include <stdint.h>
#include <string.h>

#define POOL_SIZE 10
#define BLOCK_SIZE 256

typedef struct {
    uint8_t data[BLOCK_SIZE];
    bool in_use;
} MemoryBlock;

static MemoryBlock memory_pool[POOL_SIZE];

// Deterministic allocation (O(n) worst case, bounded)
void* pool_alloc(void) {
    for (int i = 0; i < POOL_SIZE; i++) {
        if (!memory_pool[i].in_use) {
            memory_pool[i].in_use = true;
            memset(memory_pool[i].data, 0, BLOCK_SIZE);
            return memory_pool[i].data;
        }
    }
    return NULL;  // Pool exhausted
}

// Deterministic deallocation (O(1))
void pool_free(void* ptr) {
    for (int i = 0; i < POOL_SIZE; i++) {
        if (memory_pool[i].data == ptr) {
            memory_pool[i].in_use = false;
            return;
        }
    }
}

// Usage in real-time task
void realtime_task_with_pool(void *pvParameters) {
    while (1) {
        void* buffer = pool_alloc();  // Deterministic
        if (buffer != NULL) {
            process_data(buffer);
            pool_free(buffer);  // Deterministic
        }

        vTaskDelay(pdMS_TO_TICKS(10));
    }
}
```

## References

- POSIX.1-2017 Real-Time Extensions
- Rate Monotonic Analysis (Liu & Layland)
- FreeRTOS Real-Time Kernel Documentation
- Real-Time Systems Design and Analysis (Phillip A. Laplante)
- Hard Real-Time Computing Systems (Giorgio Buttazzo)

## Related Rules

- category-embedded
- universal-memory-safety
- category-systems

## Configuration

Enable in `.augment/c-standards.json`:

```json
{
  "categories": ["realtime"],
  "category_overrides": {
    "realtime": {
      "require_deterministic_timing": true,
      "prohibit_unbounded_loops": true,
      "require_priority_inheritance": true,
      "max_critical_section_us": 10
    }
  }
}
```

