# Real-Time Systems Examples

This directory contains real-time programming examples demonstrating RTOS concepts and deadline monitoring.

## Examples

### 1. priority-scheduling.c
Priority-based task scheduling:
- Multiple tasks with different priorities
- Priority-based preemption
- Mutex with priority inheritance
- Periodic and aperiodic tasks
- Event-driven processing

**Key Concepts:**
- Higher priority tasks preempt lower priority
- Use `vTaskDelayUntil()` for periodic tasks
- Priority inheritance prevents priority inversion
- Event queues for aperiodic events

### 2. deadline-monitoring.c
Deadline monitoring and tracking:
- Execution time measurement
- Deadline miss detection
- WCET (Worst-Case Execution Time) tracking
- Task timing statistics
- Watchdog timer for enforcement

**Key Concepts:**
- Monitor execution time for each task instance
- Detect and log deadline misses
- Track min/max/average execution times
- Use watchdog timers for safety

## Building

### For FreeRTOS

```bash
# Set FreeRTOS path
export FREERTOS_DIR=/path/to/FreeRTOS

# Build (requires ARM toolchain)
make
```

### For Host Testing (Syntax Check)

```bash
# Compile for syntax checking only
make host-test
```

## RTOS Integration

These examples are designed for FreeRTOS but can be adapted for:
- **Zephyr RTOS**: Replace FreeRTOS API with Zephyr equivalents
- **RTEMS**: Use RTEMS Classic API
- **VxWorks**: Use VxWorks task API
- **POSIX Real-Time**: Use pthread with real-time scheduling

## Real-Time Concepts

### Priority Scheduling

Tasks are scheduled based on priority:
```c
xTaskCreate(task_func, "Task", stack_size, NULL, PRIORITY_HIGH, NULL);
```

Priority levels (example):
- **High (3)**: Critical control loops, ISR handlers
- **Medium (2)**: Data processing, communication
- **Low (1)**: Background tasks, logging

### Deadline Monitoring

Monitor task execution time:
```c
uint32_t start = get_time_us();
/* Do work */
uint32_t end = get_time_us();
uint32_t execution_time = end - start;

if (execution_time > deadline) {
    /* Deadline miss! */
}
```

### Priority Inheritance

Prevent priority inversion:
```c
/* Create mutex with priority inheritance */
SemaphoreHandle_t mutex = xSemaphoreCreateMutex();

/* Low priority task holding mutex inherits high priority */
xSemaphoreTake(mutex, timeout);
/* Critical section */
xSemaphoreGive(mutex);
```

## Best Practices

1. **Task Design**
   - Keep tasks simple and focused
   - Use appropriate priorities
   - Avoid blocking in high-priority tasks
   - Use timeouts on all blocking calls

2. **Timing**
   - Use `vTaskDelayUntil()` for periodic tasks
   - Monitor execution times
   - Set realistic deadlines
   - Track WCET

3. **Synchronization**
   - Use mutexes with priority inheritance
   - Minimize critical sections
   - Avoid nested locks
   - Use queues for inter-task communication

4. **Resource Management**
   - Allocate resources at initialization
   - Avoid dynamic allocation in tasks
   - Use static allocation when possible
   - Clean up resources properly

## Common Pitfalls

1. **Priority Inversion**
   ```c
   // WRONG - No priority inheritance
   SemaphoreHandle_t sem = xSemaphoreCreateBinary();
   
   // CORRECT - Use mutex with priority inheritance
   SemaphoreHandle_t mutex = xSemaphoreCreateMutex();
   ```

2. **Missed Deadlines**
   ```c
   // WRONG - No deadline monitoring
   void task(void *params) {
       while (1) {
           do_work();  // How long does this take?
           vTaskDelay(period);
       }
   }
   
   // CORRECT - Monitor execution time
   void task(void *params) {
       while (1) {
           uint32_t start = get_time_us();
           do_work();
           uint32_t elapsed = get_time_us() - start;
           if (elapsed > deadline) {
               log_deadline_miss();
           }
           vTaskDelay(period);
       }
   }
   ```

3. **Blocking in High-Priority Tasks**
   ```c
   // WRONG - Blocking indefinitely
   void high_priority_task(void *params) {
       while (1) {
           xQueueReceive(queue, &data, portMAX_DELAY);  // Bad!
       }
   }
   
   // CORRECT - Use timeout
   void high_priority_task(void *params) {
       while (1) {
           if (xQueueReceive(queue, &data, pdMS_TO_TICKS(10)) == pdTRUE) {
               process_data(&data);
           }
       }
   }
   ```

## Performance Metrics

Track these metrics for real-time tasks:
- **Execution time**: Min, max, average
- **Deadline misses**: Count and percentage
- **Jitter**: Variation in execution time
- **Response time**: Time from event to completion
- **CPU utilization**: Percentage of time busy

## References

- FreeRTOS Documentation: https://www.freertos.org/
- "Real-Time Systems" by Jane W. S. Liu
- "Hard Real-Time Computing Systems" by Giorgio Buttazzo
- Rate Monotonic Analysis (RMA)
- Earliest Deadline First (EDF) scheduling

