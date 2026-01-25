# Performance Optimization

## Overview

This guide covers performance best practices for WordPress plugins including transient caching, object caching, query optimization, lazy loading, and asset minification.

---

## Transient Caching

### Basic Transient Usage

```php
<?php
/**
 * Get data with transient caching
 */
function my_plugin_get_popular_posts() {
    $cache_key = 'my_plugin_popular_posts';
    
    // Try to get cached data
    $popular_posts = get_transient( $cache_key );
    
    if ( false === $popular_posts ) {
        // Expensive query
        $popular_posts = new WP_Query( array(
            'post_type'      => 'post',
            'posts_per_page' => 10,
            'meta_key'       => 'views',
            'orderby'        => 'meta_value_num',
            'order'          => 'DESC',
        ) );
        
        // Cache for 1 hour
        set_transient( $cache_key, $popular_posts, HOUR_IN_SECONDS );
    }
    
    return $popular_posts;
}

/**
 * Clear cache when post is updated
 */
function my_plugin_clear_cache( $post_id ) {
    delete_transient( 'my_plugin_popular_posts' );
}
add_action( 'save_post', 'my_plugin_clear_cache' );
```

### Transient Expiration Times

```php
<?php
// WordPress time constants
MINUTE_IN_SECONDS  // 60 seconds
HOUR_IN_SECONDS    // 3600 seconds
DAY_IN_SECONDS     // 86400 seconds
WEEK_IN_SECONDS    // 604800 seconds
MONTH_IN_SECONDS   // 2592000 seconds (30 days)
YEAR_IN_SECONDS    // 31536000 seconds

// Examples
set_transient( 'key', $data, 5 * MINUTE_IN_SECONDS );  // 5 minutes
set_transient( 'key', $data, 12 * HOUR_IN_SECONDS );   // 12 hours
set_transient( 'key', $data, 7 * DAY_IN_SECONDS );     // 7 days
```

### Transient Best Practices

```php
<?php
/**
 * Cache expensive API call
 */
function my_plugin_get_api_data() {
    $cache_key = 'my_plugin_api_data';
    $data = get_transient( $cache_key );
    
    if ( false === $data ) {
        $response = wp_remote_get( 'https://api.example.com/data' );
        
        if ( is_wp_error( $response ) ) {
            return false;
        }
        
        $data = wp_remote_retrieve_body( $response );
        
        // Cache for 1 hour
        set_transient( $cache_key, $data, HOUR_IN_SECONDS );
    }
    
    return $data;
}

/**
 * Clear all plugin transients
 */
function my_plugin_clear_all_transients() {
    global $wpdb;
    
    $wpdb->query(
        "DELETE FROM {$wpdb->options}
         WHERE option_name LIKE '_transient_my_plugin_%'
         OR option_name LIKE '_transient_timeout_my_plugin_%'"
    );
}
```

---

## Object Caching

### WordPress Object Cache

```php
<?php
/**
 * Get data with object caching
 */
function my_plugin_get_user_data( $user_id ) {
    $cache_key = 'user_data_' . $user_id;
    $cache_group = 'my_plugin';
    
    // Try to get from cache
    $user_data = wp_cache_get( $cache_key, $cache_group );
    
    if ( false === $user_data ) {
        // Expensive operation
        $user_data = array(
            'name'  => get_user_meta( $user_id, 'name', true ),
            'email' => get_user_meta( $user_id, 'email', true ),
            'posts' => count_user_posts( $user_id ),
        );
        
        // Cache for 5 minutes
        wp_cache_set( $cache_key, $user_data, $cache_group, 300 );
    }
    
    return $user_data;
}

/**
 * Delete from cache
 */
function my_plugin_clear_user_cache( $user_id ) {
    $cache_key = 'user_data_' . $user_id;
    wp_cache_delete( $cache_key, 'my_plugin' );
}
```

### Cache Groups

```php
<?php
// Set cache with group
wp_cache_set( 'key', $data, 'my_plugin', 3600 );

// Get cache from group
$data = wp_cache_get( 'key', 'my_plugin' );

// Delete cache from group
wp_cache_delete( 'key', 'my_plugin' );

// Flush entire group (if supported by cache backend)
wp_cache_flush_group( 'my_plugin' );

// Flush all cache
wp_cache_flush();
```

---

## Query Optimization

### Avoid N+1 Queries

```php
<?php
// ❌ BAD: Query in loop (N+1 problem)
foreach ( $post_ids as $post_id ) {
    $post = get_post( $post_id ); // Separate query for each post
    echo $post->post_title;
}

// ✅ GOOD: Single query
$posts = get_posts( array(
    'post__in'       => $post_ids,
    'posts_per_page' => -1,
) );
foreach ( $posts as $post ) {
    echo $post->post_title;
}
```

### Optimize WP_Query

```php
<?php
// ✅ GOOD: Limit fields to what you need
$query = new WP_Query( array(
    'post_type'      => 'post',
    'posts_per_page' => 10,
    'fields'         => 'ids', // Only get IDs
) );

// ✅ GOOD: Disable unnecessary features
$query = new WP_Query( array(
    'post_type'              => 'post',
    'posts_per_page'         => 10,
    'no_found_rows'          => true, // Disable pagination count
    'update_post_meta_cache' => false, // Don't cache post meta
    'update_post_term_cache' => false, // Don't cache terms
) );
```

### Optimize Meta Queries

```php
<?php
// ❌ BAD: Multiple meta queries (slow)
$query = new WP_Query( array(
    'meta_query' => array(
        array(
            'key'   => 'color',
            'value' => 'blue',
        ),
        array(
            'key'   => 'size',
            'value' => 'large',
        ),
    ),
) );

// ✅ GOOD: Use custom taxonomy instead
register_taxonomy( 'product_color', 'product' );
register_taxonomy( 'product_size', 'product' );

$query = new WP_Query( array(
    'post_type' => 'product',
    'tax_query' => array(
        array(
            'taxonomy' => 'product_color',
            'field'    => 'slug',
            'terms'    => 'blue',
        ),
        array(
            'taxonomy' => 'product_size',
            'field'    => 'slug',
            'terms'    => 'large',
        ),
    ),
) );
```

### Database Indexes

```php
<?php
/**
 * Create custom table with indexes
 */
function my_plugin_create_table() {
    global $wpdb;

    $table_name = $wpdb->prefix . 'my_plugin_data';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE $table_name (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        user_id bigint(20) unsigned NOT NULL,
        status varchar(20) NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY status (status),
        KEY created_at (created_at)
    ) $charset_collate;";

    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta( $sql );
}
```

---

## Asset Optimization

### Conditional Script Loading

```php
<?php
/**
 * Enqueue scripts only where needed
 */
function my_plugin_enqueue_scripts() {
    // Only load on single posts
    if ( is_single() ) {
        wp_enqueue_script(
            'my-plugin-single',
            plugins_url( 'js/single.js', __FILE__ ),
            array( 'jquery' ),
            '1.0.0',
            true // Load in footer
        );
    }

    // Only load on specific page template
    if ( is_page_template( 'template-contact.php' ) ) {
        wp_enqueue_script(
            'my-plugin-contact',
            plugins_url( 'js/contact.js', __FILE__ ),
            array(),
            '1.0.0',
            true
        );
    }

    // Only load in admin
    if ( is_admin() ) {
        wp_enqueue_script(
            'my-plugin-admin',
            plugins_url( 'js/admin.js', __FILE__ ),
            array( 'jquery' ),
            '1.0.0',
            true
        );
    }
}
add_action( 'wp_enqueue_scripts', 'my_plugin_enqueue_scripts' );
```

### Minify Assets

```php
<?php
/**
 * Enqueue minified assets in production
 */
function my_plugin_enqueue_assets() {
    $suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

    wp_enqueue_style(
        'my-plugin-style',
        plugins_url( "css/style{$suffix}.css", __FILE__ ),
        array(),
        '1.0.0'
    );

    wp_enqueue_script(
        'my-plugin-script',
        plugins_url( "js/main{$suffix}.js", __FILE__ ),
        array( 'jquery' ),
        '1.0.0',
        true
    );
}
add_action( 'wp_enqueue_scripts', 'my_plugin_enqueue_assets' );
```

### Defer and Async Loading

```php
<?php
/**
 * Add defer/async to scripts
 */
function my_plugin_add_defer_async( $tag, $handle ) {
    // Add defer to specific scripts
    $defer_scripts = array( 'my-plugin-analytics', 'my-plugin-tracking' );

    if ( in_array( $handle, $defer_scripts, true ) ) {
        return str_replace( ' src', ' defer src', $tag );
    }

    // Add async to specific scripts
    $async_scripts = array( 'my-plugin-ads' );

    if ( in_array( $handle, $async_scripts, true ) ) {
        return str_replace( ' src', ' async src', $tag );
    }

    return $tag;
}
add_filter( 'script_loader_tag', 'my_plugin_add_defer_async', 10, 2 );
```

---

## Lazy Loading

### Lazy Load Images

```php
<?php
/**
 * Add lazy loading to images (WordPress 5.5+)
 */
function my_plugin_add_lazy_loading( $content ) {
    if ( is_admin() ) {
        return $content;
    }

    // WordPress 5.5+ has native lazy loading
    // This adds it to older versions
    $content = preg_replace(
        '/<img(.*?)src=/i',
        '<img$1loading="lazy" src=',
        $content
    );

    return $content;
}
add_filter( 'the_content', 'my_plugin_add_lazy_loading' );
```

### Lazy Load Components

```php
<?php
/**
 * Load component only when needed
 */
function my_plugin_load_component() {
    // Check if component is needed
    if ( ! is_page( 'special-page' ) ) {
        return;
    }

    // Load component files only when needed
    require_once plugin_dir_path( __FILE__ ) . 'includes/class-special-component.php';

    $component = new My_Plugin_Special_Component();
    $component->init();
}
add_action( 'wp', 'my_plugin_load_component' );
```

---

## Autoloaded Options

### Optimize Autoloaded Data

```php
<?php
/**
 * Don't autoload large options
 */
// ❌ BAD: Autoloads large data on every page load
update_option( 'my_plugin_large_data', $large_array );

// ✅ GOOD: Don't autoload large data
update_option( 'my_plugin_large_data', $large_array, false ); // false = don't autoload

/**
 * Check autoloaded data size
 */
function my_plugin_check_autoloaded_options() {
    global $wpdb;

    $autoloaded_options = $wpdb->get_results(
        "SELECT option_name, LENGTH(option_value) as option_size
         FROM {$wpdb->options}
         WHERE autoload = 'yes'
         ORDER BY option_size DESC
         LIMIT 20"
    );

    foreach ( $autoloaded_options as $option ) {
        echo $option->option_name . ': ' . size_format( $option->option_size ) . "\n";
    }
}
```

---

## HTTP Requests

### Reduce External Requests

```php
<?php
/**
 * Remove unnecessary scripts
 */
function my_plugin_remove_unnecessary_scripts() {
    // Remove emoji scripts
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );

    // Remove embed script
    remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
    remove_action( 'wp_head', 'wp_oembed_add_host_js' );
}
add_action( 'init', 'my_plugin_remove_unnecessary_scripts' );
```

### Batch API Requests

```php
<?php
/**
 * Batch multiple API requests
 */
function my_plugin_batch_api_requests( $endpoints ) {
    $responses = array();

    foreach ( $endpoints as $key => $url ) {
        $response = wp_remote_get( $url, array(
            'timeout' => 10,
        ) );

        if ( ! is_wp_error( $response ) ) {
            $responses[ $key ] = wp_remote_retrieve_body( $response );
        }
    }

    return $responses;
}
```

---

## Monitoring and Profiling

### Query Monitor Plugin

```php
<?php
/**
 * Add custom timing with Query Monitor
 */
function my_plugin_expensive_operation() {
    do_action( 'qm/start', 'my_expensive_operation' );

    // Expensive operation here
    my_plugin_process_data();

    do_action( 'qm/stop', 'my_expensive_operation' );
}
```

### Debug Queries

```php
<?php
/**
 * Enable query debugging (development only)
 * Add to wp-config.php
 */
define( 'SAVEQUERIES', true );

/**
 * Display queries (admin only)
 */
function my_plugin_display_queries() {
    if ( ! current_user_can( 'manage_options' ) || ! defined( 'SAVEQUERIES' ) || ! SAVEQUERIES ) {
        return;
    }

    global $wpdb;

    echo '<h2>Database Queries</h2>';
    echo '<p>Total queries: ' . count( $wpdb->queries ) . '</p>';

    foreach ( $wpdb->queries as $query ) {
        echo '<pre>';
        echo 'Query: ' . $query[0] . "\n";
        echo 'Time: ' . $query[1] . " seconds\n";
        echo 'Called by: ' . $query[2] . "\n";
        echo '</pre>';
    }
}
add_action( 'wp_footer', 'my_plugin_display_queries' );
```

### Performance Logging

```php
<?php
/**
 * Log slow operations
 */
function my_plugin_log_performance( $operation_name, $start_time ) {
    $end_time = microtime( true );
    $duration = $end_time - $start_time;

    // Log if operation took more than 1 second
    if ( $duration > 1.0 ) {
        error_log( sprintf(
            'Slow operation: %s took %.2f seconds',
            $operation_name,
            $duration
        ) );
    }
}

/**
 * Example usage
 */
function my_plugin_process_data() {
    $start_time = microtime( true );

    // Process data
    // ...

    my_plugin_log_performance( 'process_data', $start_time );
}
```

---

## Best Practices

### Caching

✅ **DO**:
- Cache expensive queries with transients
- Use object caching for frequently accessed data
- Clear cache when data changes
- Set appropriate expiration times
- Use cache groups for organization

❌ **DON'T**:
- Cache everything indiscriminately
- Forget to clear cache on updates
- Use very short expiration times (defeats purpose)
- Cache user-specific data in shared cache

```php
<?php
// ✅ GOOD: Cache with appropriate expiration
function my_plugin_get_stats() {
    $cache_key = 'my_plugin_stats';
    $stats = get_transient( $cache_key );

    if ( false === $stats ) {
        $stats = my_plugin_calculate_stats();
        set_transient( $cache_key, $stats, HOUR_IN_SECONDS );
    }

    return $stats;
}

// ✅ GOOD: Clear cache on update
function my_plugin_clear_stats_cache() {
    delete_transient( 'my_plugin_stats' );
}
add_action( 'save_post', 'my_plugin_clear_stats_cache' );
```

### Database Queries

✅ **DO**:
- Use indexes on frequently queried columns
- Limit query results with LIMIT
- Use `fields` parameter to get only needed data
- Disable unnecessary caching in WP_Query
- Use prepared statements

❌ **DON'T**:
- Query in loops (N+1 problem)
- Fetch all posts without pagination
- Use complex meta queries
- Ignore slow query warnings

```php
<?php
// ✅ GOOD: Optimized query
$posts = get_posts( array(
    'post_type'              => 'post',
    'posts_per_page'         => 10,
    'fields'                 => 'ids',
    'no_found_rows'          => true,
    'update_post_meta_cache' => false,
    'update_post_term_cache' => false,
) );

// ❌ BAD: Unoptimized query
$posts = get_posts( array(
    'post_type'      => 'post',
    'posts_per_page' => -1, // Gets ALL posts
) );
```

### Assets

✅ **DO**:
- Load scripts only where needed
- Minify CSS and JavaScript
- Use defer/async for non-critical scripts
- Load scripts in footer
- Combine files when possible

❌ **DON'T**:
- Load all scripts on every page
- Enqueue unminified files in production
- Load large scripts in header
- Make excessive HTTP requests

```php
<?php
// ✅ GOOD: Conditional loading
function my_plugin_enqueue_scripts() {
    if ( is_single() ) {
        wp_enqueue_script(
            'my-plugin-single',
            plugins_url( 'js/single.min.js', __FILE__ ),
            array( 'jquery' ),
            '1.0.0',
            true // Load in footer
        );
    }
}
add_action( 'wp_enqueue_scripts', 'my_plugin_enqueue_scripts' );
```

---

## Common Pitfalls

### ❌ DON'T

```php
<?php
// Don't query in loops
foreach ( $post_ids as $post_id ) {
    $post = get_post( $post_id ); // WRONG - N+1 queries
}

// Don't fetch all posts
$posts = get_posts( array(
    'posts_per_page' => -1, // WRONG - Gets ALL posts
) );

// Don't autoload large data
update_option( 'my_large_data', $huge_array ); // WRONG - Autoloads by default

// Don't skip caching
function get_expensive_data() {
    return expensive_calculation(); // WRONG - No caching
}

// Don't load scripts everywhere
function my_plugin_enqueue() {
    wp_enqueue_script( 'my-script', ... ); // WRONG - Loads on every page
}
add_action( 'wp_enqueue_scripts', 'my_plugin_enqueue' );

// Don't ignore indexes
$sql = "CREATE TABLE $table (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    user_id bigint(20) NOT NULL,
    PRIMARY KEY  (id)
)"; // WRONG - Missing index on user_id

// Don't cache forever
set_transient( 'key', $data, YEAR_IN_SECONDS ); // WRONG - Too long
```

### ✅ DO

```php
<?php
// Fetch posts in single query
$posts = get_posts( array(
    'post__in'       => $post_ids,
    'posts_per_page' => -1,
) ); // CORRECT

// Limit query results
$posts = get_posts( array(
    'posts_per_page' => 10,
) ); // CORRECT

// Don't autoload large data
update_option( 'my_large_data', $huge_array, false ); // CORRECT

// Cache expensive operations
function get_expensive_data() {
    $cache_key = 'expensive_data';
    $data = get_transient( $cache_key );

    if ( false === $data ) {
        $data = expensive_calculation();
        set_transient( $cache_key, $data, HOUR_IN_SECONDS );
    }

    return $data;
} // CORRECT

// Load scripts conditionally
function my_plugin_enqueue() {
    if ( is_single() ) {
        wp_enqueue_script( 'my-script', ... );
    }
}
add_action( 'wp_enqueue_scripts', 'my_plugin_enqueue' ); // CORRECT

// Add indexes
$sql = "CREATE TABLE $table (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    user_id bigint(20) NOT NULL,
    PRIMARY KEY  (id),
    KEY user_id (user_id)
)"; // CORRECT

// Use appropriate cache duration
set_transient( 'key', $data, HOUR_IN_SECONDS ); // CORRECT
```

---

## Performance Checklist

### Plugin Development

- [ ] Cache expensive queries with transients
- [ ] Use object caching for frequently accessed data
- [ ] Optimize database queries (indexes, LIMIT, fields)
- [ ] Avoid N+1 queries
- [ ] Load scripts conditionally
- [ ] Minify CSS and JavaScript
- [ ] Use defer/async for non-critical scripts
- [ ] Don't autoload large options
- [ ] Use lazy loading where appropriate
- [ ] Monitor and profile performance

### Database

- [ ] Add indexes to frequently queried columns
- [ ] Use LIMIT in all queries
- [ ] Use prepared statements
- [ ] Avoid complex meta queries
- [ ] Use taxonomies instead of meta for filtering
- [ ] Clear transients on data updates

### Assets

- [ ] Enqueue scripts only where needed
- [ ] Load scripts in footer
- [ ] Minify files in production
- [ ] Combine files when possible
- [ ] Use CDN for static assets
- [ ] Optimize images

---

## Summary

**Key Takeaways:**

1. **Transient caching**: Cache expensive queries and API calls
2. **Object caching**: Use `wp_cache_*` functions for frequently accessed data
3. **Query optimization**: Avoid N+1 queries, use indexes, limit results
4. **Asset optimization**: Load conditionally, minify, defer/async
5. **Lazy loading**: Load components and images only when needed
6. **Autoloaded options**: Don't autoload large data
7. **Monitoring**: Use Query Monitor and debug tools
8. **Clear cache**: Always clear cache when data changes

**Common Mistakes to Avoid:**

- Querying in loops (N+1 problem)
- Fetching all posts without pagination
- Autoloading large options
- Loading scripts on every page
- Not caching expensive operations
- Missing database indexes
- Ignoring slow queries

**Resources:**

- [WordPress Performance](https://developer.wordpress.org/advanced-administration/performance/)
- [Transient API](https://developer.wordpress.org/apis/transients/)
- [Object Cache](https://developer.wordpress.org/reference/classes/wp_object_cache/)
- [Query Monitor Plugin](https://wordpress.org/plugins/query-monitor/)

