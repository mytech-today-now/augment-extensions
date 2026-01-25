# Cron Jobs and Scheduled Tasks

## Overview

This guide covers WordPress cron job implementation for scheduled tasks including wp_schedule_event, custom cron schedules, wp_next_scheduled, wp_unschedule_event, and wp_clear_scheduled_hook.

---

## Basic Cron Job Setup

### Scheduling a Recurring Event

```php
<?php
/**
 * Schedule cron job on plugin activation
 */
function my_plugin_activate() {
    if ( ! wp_next_scheduled( 'my_plugin_daily_task' ) ) {
        wp_schedule_event( time(), 'daily', 'my_plugin_daily_task' );
    }
}
register_activation_hook( __FILE__, 'my_plugin_activate' );

/**
 * Cron job callback
 */
function my_plugin_daily_task_callback() {
    // Task code here
    error_log( 'Daily task executed at ' . current_time( 'mysql' ) );
    
    // Example: Clean up old data
    global $wpdb;
    $wpdb->query(
        $wpdb->prepare(
            "DELETE FROM {$wpdb->prefix}my_plugin_data 
             WHERE created_at < %s 
             LIMIT 100",
            date( 'Y-m-d H:i:s', strtotime( '-30 days' ) )
        )
    );
}
add_action( 'my_plugin_daily_task', 'my_plugin_daily_task_callback' );
```

### Scheduling a Single Event

```php
<?php
/**
 * Schedule one-time event
 */
function my_plugin_schedule_single_event() {
    // Schedule event to run in 1 hour
    wp_schedule_single_event( time() + HOUR_IN_SECONDS, 'my_plugin_single_task' );
}

/**
 * Single event callback
 */
function my_plugin_single_task_callback() {
    // One-time task code
    update_option( 'my_plugin_task_completed', true );
}
add_action( 'my_plugin_single_task', 'my_plugin_single_task_callback' );
```

---

## Built-in Cron Schedules

WordPress provides these default schedules:

- `hourly` - Once per hour
- `twicedaily` - Twice per day
- `daily` - Once per day
- `weekly` - Once per week

```php
<?php
// Hourly task
wp_schedule_event( time(), 'hourly', 'my_plugin_hourly_task' );

// Twice daily task
wp_schedule_event( time(), 'twicedaily', 'my_plugin_twicedaily_task' );

// Daily task
wp_schedule_event( time(), 'daily', 'my_plugin_daily_task' );

// Weekly task
wp_schedule_event( time(), 'weekly', 'my_plugin_weekly_task' );
```

---

## Custom Cron Schedules

### Adding Custom Intervals

```php
<?php
/**
 * Add custom cron schedules
 */
function my_plugin_custom_cron_schedules( $schedules ) {
    // Every 5 minutes
    $schedules['every_five_minutes'] = array(
        'interval' => 5 * MINUTE_IN_SECONDS,
        'display'  => __( 'Every 5 Minutes', 'my-plugin' ),
    );
    
    // Every 15 minutes
    $schedules['every_fifteen_minutes'] = array(
        'interval' => 15 * MINUTE_IN_SECONDS,
        'display'  => __( 'Every 15 Minutes', 'my-plugin' ),
    );
    
    // Every 30 minutes
    $schedules['every_thirty_minutes'] = array(
        'interval' => 30 * MINUTE_IN_SECONDS,
        'display'  => __( 'Every 30 Minutes', 'my-plugin' ),
    );
    
    // Every 6 hours
    $schedules['every_six_hours'] = array(
        'interval' => 6 * HOUR_IN_SECONDS,
        'display'  => __( 'Every 6 Hours', 'my-plugin' ),
    );
    
    // Monthly (30 days)
    $schedules['monthly'] = array(
        'interval' => 30 * DAY_IN_SECONDS,
        'display'  => __( 'Once Monthly', 'my-plugin' ),
    );
    
    return $schedules;
}
add_filter( 'cron_schedules', 'my_plugin_custom_cron_schedules' );

/**
 * Schedule custom interval task
 */
function my_plugin_schedule_custom_task() {
    if ( ! wp_next_scheduled( 'my_plugin_custom_task' ) ) {
        wp_schedule_event( time(), 'every_five_minutes', 'my_plugin_custom_task' );
    }
}
add_action( 'wp', 'my_plugin_schedule_custom_task' );

/**
 * Custom task callback
 */
function my_plugin_custom_task_callback() {
    // Task code here
}
add_action( 'my_plugin_custom_task', 'my_plugin_custom_task_callback' );
```

---

## Managing Scheduled Events

### Check if Event is Scheduled

```php
<?php
/**
 * Check if event is already scheduled
 */
$timestamp = wp_next_scheduled( 'my_plugin_daily_task' );

if ( $timestamp ) {
    echo 'Next run: ' . date( 'Y-m-d H:i:s', $timestamp );
} else {
    echo 'Not scheduled';
}
```

### Unschedule a Specific Event

```php
<?php
/**
 * Unschedule specific event
 */
$timestamp = wp_next_scheduled( 'my_plugin_daily_task' );

if ( $timestamp ) {
    wp_unschedule_event( $timestamp, 'my_plugin_daily_task' );
}
```

### Clear All Instances of a Hook

```php
<?php
/**
 * Clear all scheduled instances of a hook
 */
wp_clear_scheduled_hook( 'my_plugin_daily_task' );
```

### Reschedule an Event

```php
<?php
/**
 * Reschedule event with new interval
 */
function my_plugin_reschedule_task() {
    // Clear existing schedule
    wp_clear_scheduled_hook( 'my_plugin_task' );

    // Schedule with new interval
    if ( ! wp_next_scheduled( 'my_plugin_task' ) ) {
        wp_schedule_event( time(), 'hourly', 'my_plugin_task' );
    }
}
```

---

## Deactivation and Uninstall

### Clear Cron Jobs on Deactivation

```php
<?php
/**
 * Clear cron jobs on plugin deactivation
 */
function my_plugin_deactivate() {
    // Clear all scheduled hooks
    wp_clear_scheduled_hook( 'my_plugin_daily_task' );
    wp_clear_scheduled_hook( 'my_plugin_hourly_task' );
    wp_clear_scheduled_hook( 'my_plugin_custom_task' );
}
register_deactivation_hook( __FILE__, 'my_plugin_deactivate' );
```

### Clear Cron Jobs on Uninstall

```php
<?php
/**
 * uninstall.php
 */
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

// Clear all scheduled hooks
wp_clear_scheduled_hook( 'my_plugin_daily_task' );
wp_clear_scheduled_hook( 'my_plugin_hourly_task' );
wp_clear_scheduled_hook( 'my_plugin_custom_task' );
```

---

## Advanced Patterns

### Cron Job with Arguments

```php
<?php
/**
 * Schedule event with arguments
 */
function my_plugin_schedule_task_with_args( $user_id ) {
    $args = array( $user_id );

    if ( ! wp_next_scheduled( 'my_plugin_user_task', $args ) ) {
        wp_schedule_single_event( time() + HOUR_IN_SECONDS, 'my_plugin_user_task', $args );
    }
}

/**
 * Callback with arguments
 */
function my_plugin_user_task_callback( $user_id ) {
    // Process user-specific task
    $user = get_user_by( 'id', $user_id );

    if ( $user ) {
        // Send email, update data, etc.
        wp_mail(
            $user->user_email,
            'Scheduled Task',
            'Your scheduled task has been completed.'
        );
    }
}
add_action( 'my_plugin_user_task', 'my_plugin_user_task_callback' );
```

### Batch Processing with Cron

```php
<?php
/**
 * Process items in batches
 */
function my_plugin_batch_process_callback() {
    global $wpdb;

    $table_name = $wpdb->prefix . 'my_plugin_queue';

    // Get batch of unprocessed items
    $items = $wpdb->get_results(
        "SELECT * FROM $table_name
         WHERE status = 'pending'
         ORDER BY created_at ASC
         LIMIT 50"
    );

    foreach ( $items as $item ) {
        // Process item
        $result = my_plugin_process_item( $item );

        // Update status
        $wpdb->update(
            $table_name,
            array( 'status' => $result ? 'completed' : 'failed' ),
            array( 'id' => $item->id ),
            array( '%s' ),
            array( '%d' )
        );
    }

    // Log batch completion
    error_log( sprintf( 'Processed %d items', count( $items ) ) );
}
add_action( 'my_plugin_batch_process', 'my_plugin_batch_process_callback' );
```

### Conditional Cron Execution

```php
<?php
/**
 * Execute cron only under certain conditions
 */
function my_plugin_conditional_task_callback() {
    // Check if task should run
    $should_run = get_option( 'my_plugin_task_enabled', true );

    if ( ! $should_run ) {
        error_log( 'Task skipped: disabled in settings' );
        return;
    }

    // Check time window (e.g., only run during off-peak hours)
    $current_hour = (int) current_time( 'H' );

    if ( $current_hour >= 9 && $current_hour <= 17 ) {
        error_log( 'Task skipped: peak hours' );
        return;
    }

    // Execute task
    my_plugin_execute_task();
}
add_action( 'my_plugin_conditional_task', 'my_plugin_conditional_task_callback' );
```

### Cron Job with Error Handling

```php
<?php
/**
 * Cron job with comprehensive error handling
 */
function my_plugin_safe_cron_callback() {
    try {
        // Set time limit
        set_time_limit( 300 ); // 5 minutes

        // Execute task
        $result = my_plugin_execute_task();

        if ( is_wp_error( $result ) ) {
            throw new Exception( $result->get_error_message() );
        }

        // Log success
        error_log( 'Cron task completed successfully' );
        update_option( 'my_plugin_last_cron_run', current_time( 'mysql' ) );

    } catch ( Exception $e ) {
        // Log error
        error_log( 'Cron task failed: ' . $e->getMessage() );

        // Send admin notification
        wp_mail(
            get_option( 'admin_email' ),
            'Cron Task Failed',
            'Error: ' . $e->getMessage()
        );

        // Update error count
        $error_count = (int) get_option( 'my_plugin_cron_errors', 0 );
        update_option( 'my_plugin_cron_errors', $error_count + 1 );
    }
}
add_action( 'my_plugin_safe_cron', 'my_plugin_safe_cron_callback' );
```

---

## Best Practices

### Performance

1. **Limit batch size**: Process items in small batches to avoid timeouts
2. **Set time limits**: Use `set_time_limit()` for long-running tasks
3. **Use LIMIT in queries**: Don't fetch all records at once
4. **Log execution**: Track when tasks run and how long they take
5. **Avoid peak hours**: Schedule intensive tasks during off-peak times

```php
<?php
// Good - Process in batches
function my_plugin_efficient_cron() {
    global $wpdb;

    $batch_size = 50;
    $processed = 0;

    $items = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}my_plugin_data
             WHERE status = 'pending'
             LIMIT %d",
            $batch_size
        )
    );

    foreach ( $items as $item ) {
        my_plugin_process_item( $item );
        $processed++;
    }

    error_log( "Processed $processed items" );
}
```

### Reliability

1. **Check if scheduled**: Always check `wp_next_scheduled()` before scheduling
2. **Clear on deactivation**: Remove scheduled events when plugin is deactivated
3. **Handle errors**: Use try-catch blocks and log errors
4. **Verify execution**: Log when tasks run successfully
5. **Monitor failures**: Track and alert on repeated failures

```php
<?php
// Good - Check before scheduling
function my_plugin_ensure_cron_scheduled() {
    if ( ! wp_next_scheduled( 'my_plugin_task' ) ) {
        wp_schedule_event( time(), 'daily', 'my_plugin_task' );
    }
}
add_action( 'wp', 'my_plugin_ensure_cron_scheduled' );
```

### Security

1. **Validate data**: Sanitize and validate all data in cron callbacks
2. **Check capabilities**: Verify permissions if needed
3. **Use nonces**: For user-triggered scheduled events
4. **Limit access**: Don't expose cron URLs publicly
5. **Log suspicious activity**: Monitor for unusual patterns

```php
<?php
// Good - Validate data in cron callback
function my_plugin_secure_cron_callback() {
    global $wpdb;

    $items = $wpdb->get_results(
        "SELECT * FROM {$wpdb->prefix}my_plugin_data
         WHERE status = 'pending'
         LIMIT 50"
    );

    foreach ( $items as $item ) {
        // Validate data before processing
        $email = sanitize_email( $item->email );
        $user_id = absint( $item->user_id );

        if ( ! is_email( $email ) || ! $user_id ) {
            error_log( "Invalid data in cron: item ID {$item->id}" );
            continue;
        }

        // Process validated data
        my_plugin_send_email( $email, $user_id );
    }
}
```

---

## Debugging Cron Jobs

### View Scheduled Events

```php
<?php
/**
 * Display all scheduled cron events (admin page)
 */
function my_plugin_display_cron_events() {
    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    $cron_array = _get_cron_array();

    echo '<h2>Scheduled Events</h2>';
    echo '<table>';
    echo '<tr><th>Hook</th><th>Next Run</th><th>Schedule</th></tr>';

    foreach ( $cron_array as $timestamp => $cron ) {
        foreach ( $cron as $hook => $events ) {
            foreach ( $events as $key => $event ) {
                echo '<tr>';
                echo '<td>' . esc_html( $hook ) . '</td>';
                echo '<td>' . date( 'Y-m-d H:i:s', $timestamp ) . '</td>';
                echo '<td>' . ( isset( $event['schedule'] ) ? esc_html( $event['schedule'] ) : 'Single' ) . '</td>';
                echo '</tr>';
            }
        }
    }

    echo '</table>';
}
```

### Test Cron Job Manually

```php
<?php
/**
 * Manually trigger cron job for testing
 */
function my_plugin_test_cron() {
    if ( ! current_user_can( 'manage_options' ) ) {
        wp_die( 'Unauthorized' );
    }

    // Trigger the cron callback directly
    do_action( 'my_plugin_daily_task' );

    echo 'Cron job executed manually';
}

// Add admin menu item for testing
add_action( 'admin_menu', function() {
    add_submenu_page(
        'tools.php',
        'Test Cron',
        'Test Cron',
        'manage_options',
        'test-cron',
        'my_plugin_test_cron'
    );
} );
```

### Enable WP-Cron Debugging

```php
<?php
/**
 * wp-config.php
 */
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );

/**
 * Log cron execution
 */
function my_plugin_log_cron_execution() {
    error_log( 'Cron executed: ' . current_action() );
}
add_action( 'my_plugin_daily_task', 'my_plugin_log_cron_execution', 1 );
```

---

## Alternative: System Cron

For better reliability, use system cron instead of WP-Cron:

### Disable WP-Cron

```php
<?php
/**
 * wp-config.php
 */
define( 'DISABLE_WP_CRON', true );
```

### Setup System Cron

```bash
# Edit crontab
crontab -e

# Add line to run WP-Cron every 5 minutes
*/5 * * * * wget -q -O - https://example.com/wp-cron.php?doing_wp_cron >/dev/null 2>&1

# Or using curl
*/5 * * * * curl -s https://example.com/wp-cron.php?doing_wp_cron >/dev/null 2>&1

# Or using WP-CLI
*/5 * * * * cd /path/to/wordpress && wp cron event run --due-now >/dev/null 2>&1
```

---

## Common Pitfalls

### ❌ DON'T

```php
<?php
// Don't schedule without checking
wp_schedule_event( time(), 'daily', 'my_task' ); // WRONG - Creates duplicates

// Don't forget to clear on deactivation
function my_plugin_deactivate() {
    // Missing: wp_clear_scheduled_hook( 'my_task' );
} // WRONG

// Don't use infinite loops
function my_bad_cron_callback() {
    while ( true ) {
        // Process items
    }
} // WRONG - Will timeout

// Don't process all items at once
function my_bad_batch_process() {
    $items = $wpdb->get_results( "SELECT * FROM {$wpdb->prefix}items" ); // WRONG - No LIMIT
    foreach ( $items as $item ) {
        process_item( $item );
    }
}

// Don't ignore errors
function my_bad_error_handling() {
    my_risky_operation(); // WRONG - No error handling
}

// Don't hardcode timestamps
wp_schedule_event( 1234567890, 'daily', 'my_task' ); // WRONG - Use time()
```

### ✅ DO

```php
<?php
// Always check before scheduling
if ( ! wp_next_scheduled( 'my_task' ) ) {
    wp_schedule_event( time(), 'daily', 'my_task' );
} // CORRECT

// Clear on deactivation
function my_plugin_deactivate() {
    wp_clear_scheduled_hook( 'my_task' );
} // CORRECT
register_deactivation_hook( __FILE__, 'my_plugin_deactivate' );

// Process in batches
function my_good_batch_process() {
    global $wpdb;

    $items = $wpdb->get_results(
        "SELECT * FROM {$wpdb->prefix}items
         WHERE status = 'pending'
         LIMIT 50"
    ); // CORRECT - Limited batch

    foreach ( $items as $item ) {
        process_item( $item );
    }
}

// Handle errors
function my_good_error_handling() {
    try {
        my_risky_operation();
    } catch ( Exception $e ) {
        error_log( 'Cron error: ' . $e->getMessage() );
    }
} // CORRECT

// Use time() for current timestamp
wp_schedule_event( time(), 'daily', 'my_task' ); // CORRECT
```

---

## Summary

**Key Takeaways:**

1. **Scheduling**: Use `wp_schedule_event()` for recurring tasks, `wp_schedule_single_event()` for one-time tasks
2. **Custom intervals**: Add custom schedules with `cron_schedules` filter
3. **Check before scheduling**: Always use `wp_next_scheduled()` to avoid duplicates
4. **Unscheduling**: Use `wp_unschedule_event()` for specific events, `wp_clear_scheduled_hook()` for all instances
5. **Deactivation**: Clear all scheduled hooks on plugin deactivation
6. **Batch processing**: Process items in small batches to avoid timeouts
7. **Error handling**: Use try-catch blocks and log errors
8. **Debugging**: Test cron jobs manually and monitor execution
9. **System cron**: Consider using system cron for better reliability

**Common Mistakes to Avoid:**

- Scheduling without checking for existing events
- Forgetting to clear scheduled hooks on deactivation
- Processing too many items at once
- Ignoring errors and timeouts
- Not logging execution for debugging
- Using hardcoded timestamps instead of `time()`

**Resources:**

- [WordPress Cron API](https://developer.wordpress.org/plugins/cron/)
- [wp_schedule_event()](https://developer.wordpress.org/reference/functions/wp_schedule_event/)
- [wp_next_scheduled()](https://developer.wordpress.org/reference/functions/wp_next_scheduled/)
- [wp_clear_scheduled_hook()](https://developer.wordpress.org/reference/functions/wp_clear_scheduled_hook/)

