# WordPress Performance Optimization

## Overview

This document provides performance optimization techniques for WordPress themes and plugins, covering caching, database queries, asset optimization, and more.

## Database Query Optimization

### Avoid Unnecessary Queries

```php
// ❌ BAD: Query in loop
foreach ( $post_ids as $post_id ) {
	$post = get_post( $post_id ); // Separate query for each post
	echo $post->post_title;
}

// ✅ GOOD: Single query
$posts = get_posts( array(
	'post__in' => $post_ids,
	'posts_per_page' => -1,
) );
foreach ( $posts as $post ) {
	echo $post->post_title;
}
```

### Use WP_Query Efficiently

```php
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
// ❌ BAD: Multiple meta queries
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

// ✅ GOOD: Use custom table or taxonomy instead
// Create custom taxonomy for frequently queried meta
register_taxonomy( 'product_color', 'product' );
```

### Use Transients for Expensive Queries

```php
/**
 * Get popular posts with caching
 */
function get_popular_posts() {
	// Try to get cached results
	$popular_posts = get_transient( 'popular_posts' );
	
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
		set_transient( 'popular_posts', $popular_posts, HOUR_IN_SECONDS );
	}
	
	return $popular_posts;
}

/**
 * Clear cache when post is updated
 */
function clear_popular_posts_cache( $post_id ) {
	delete_transient( 'popular_posts' );
}
add_action( 'save_post', 'clear_popular_posts_cache' );
```

## Object Caching

### Use WordPress Object Cache

```php
/**
 * Get user data with caching
 */
function get_user_data( $user_id ) {
	$cache_key = 'user_data_' . $user_id;
	$user_data = wp_cache_get( $cache_key );
	
	if ( false === $user_data ) {
		// Expensive operation
		$user_data = array(
			'name'  => get_user_meta( $user_id, 'name', true ),
			'email' => get_user_meta( $user_id, 'email', true ),
			'posts' => count_user_posts( $user_id ),
		);
		
		// Cache for 5 minutes
		wp_cache_set( $cache_key, $user_data, '', 300 );
	}
	
	return $user_data;
}
```

### Cache Groups

```php
// Set cache with group
wp_cache_set( 'key', $data, 'my_plugin', 3600 );

// Get cache from group
$data = wp_cache_get( 'key', 'my_plugin' );

// Delete cache group
wp_cache_delete( 'key', 'my_plugin' );

// Flush entire group
wp_cache_flush_group( 'my_plugin' );
```

## Asset Optimization

### Enqueue Scripts Efficiently

```php
/**
 * Enqueue scripts only where needed
 */
function my_theme_enqueue_scripts() {
	// Only load on single posts
	if ( is_single() ) {
		wp_enqueue_script(
			'my-single-post-script',
			get_template_directory_uri() . '/js/single-post.js',
			array( 'jquery' ),
			'1.0.0',
			true // Load in footer
		);
	}
	
	// Only load on specific page template
	if ( is_page_template( 'template-contact.php' ) ) {
		wp_enqueue_script(
			'contact-form-script',
			get_template_directory_uri() . '/js/contact-form.js',
			array(),
			'1.0.0',
			true
		);
	}
}
add_action( 'wp_enqueue_scripts', 'my_theme_enqueue_scripts' );
```

### Defer and Async Scripts

```php
/**
 * Add defer/async to scripts
 */
function add_defer_async_to_scripts( $tag, $handle ) {
	// Scripts to defer
	$defer_scripts = array( 'my-analytics-script' );
	
	// Scripts to async
	$async_scripts = array( 'my-social-script' );
	
	if ( in_array( $handle, $defer_scripts, true ) ) {
		return str_replace( ' src', ' defer src', $tag );
	}
	
	if ( in_array( $handle, $async_scripts, true ) ) {
		return str_replace( ' src', ' async src', $tag );
	}
	
	return $tag;
}
add_filter( 'script_loader_tag', 'add_defer_async_to_scripts', 10, 2 );
```

### Minify and Combine Assets

```php
/**
 * Enqueue minified assets in production
 */
function my_theme_enqueue_assets() {
	$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';
	
	wp_enqueue_style(
		'my-theme-style',
		get_template_directory_uri() . "/css/style{$suffix}.css",
		array(),
		'1.0.0'
	);
	
	wp_enqueue_script(
		'my-theme-script',
		get_template_directory_uri() . "/js/main{$suffix}.js",
		array( 'jquery' ),
		'1.0.0',
		true
	);
}
add_action( 'wp_enqueue_scripts', 'my_theme_enqueue_assets' );
```

## Image Optimization

### Lazy Loading

```php
/**
 * Add lazy loading to images
 */
function add_lazy_loading_to_images( $content ) {
	// WordPress 5.5+ has native lazy loading
	// This is for older versions or custom implementation
	
	if ( is_admin() ) {
		return $content;
	}
	
	$content = preg_replace(
		'/<img(.*?)src=/i',
		'<img$1loading="lazy" src=',
		$content
	);
	
	return $content;
}
add_filter( 'the_content', 'add_lazy_loading_to_images' );
```

### Responsive Images

```php
/**
 * Add custom image sizes
 */
add_image_size( 'thumbnail-small', 150, 150, true );
add_image_size( 'thumbnail-medium', 300, 300, true );
add_image_size( 'featured-large', 1200, 600, true );

/**
 * Use responsive images
 */
function display_responsive_image( $attachment_id ) {
	echo wp_get_attachment_image(
		$attachment_id,
		'featured-large',
		false,
		array(
			'sizes' => '(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 1200px',
		)
	);
}
```

### WebP Support

```php
/**
 * Add WebP support
 */
function add_webp_mime_type( $mimes ) {
	$mimes['webp'] = 'image/webp';
	return $mimes;
}
add_filter( 'mime_types', 'add_webp_mime_type' );
```

## HTTP Requests

### Reduce External Requests

```php
/**
 * Remove unnecessary scripts
 */
function remove_unnecessary_scripts() {
	// Remove emoji scripts
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	
	// Remove embed script
	remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
	remove_action( 'wp_head', 'wp_oembed_add_host_js' );
}
add_action( 'init', 'remove_unnecessary_scripts' );
```

### Batch API Requests

```php
/**
 * Batch multiple API requests
 */
function batch_api_requests( $endpoints ) {
	$responses = array();
	
	// Use WordPress HTTP API with concurrent requests
	$requests = array();
	foreach ( $endpoints as $key => $url ) {
		$requests[ $key ] = array(
			'url'     => $url,
			'type'    => 'GET',
			'timeout' => 10,
		);
	}
	
	// Process requests (use plugin like WP HTTP Parallel for true parallel)
	foreach ( $requests as $key => $request ) {
		$response = wp_remote_get( $request['url'], array(
			'timeout' => $request['timeout'],
		) );
		
		if ( ! is_wp_error( $response ) ) {
			$responses[ $key ] = wp_remote_retrieve_body( $response );
		}
	}
	
	return $responses;
}
```

## Autoloading

### Optimize Autoloaded Options

```php
/**
 * Don't autoload large options
 */
update_option( 'my_large_option', $data, false ); // false = don't autoload

/**
 * Check autoloaded data size
 */
function check_autoloaded_options() {
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

## Cron Jobs

### Optimize Scheduled Tasks

```php
/**
 * Schedule efficient cron job
 */
function schedule_cleanup_task() {
	if ( ! wp_next_scheduled( 'my_cleanup_task' ) ) {
		wp_schedule_event( time(), 'daily', 'my_cleanup_task' );
	}
}
add_action( 'wp', 'schedule_cleanup_task' );

/**
 * Cleanup task
 */
function my_cleanup_task() {
	// Limit processing
	global $wpdb;
	
	$wpdb->query(
		$wpdb->prepare(
			"DELETE FROM {$wpdb->postmeta} 
			WHERE meta_key = %s 
			AND meta_value < %s 
			LIMIT 100", // Process in batches
			'_temp_data',
			time() - WEEK_IN_SECONDS
		)
	);
}
add_action( 'my_cleanup_task', 'my_cleanup_task' );
```

## Pagination

### Efficient Pagination

```php
/**
 * Use pagination instead of loading all posts
 */
$paged = ( get_query_var( 'paged' ) ) ? get_query_var( 'paged' ) : 1;

$query = new WP_Query( array(
	'post_type'      => 'post',
	'posts_per_page' => 20,
	'paged'          => $paged,
) );

// Display pagination
the_posts_pagination( array(
	'mid_size'  => 2,
	'prev_text' => __( 'Previous', 'my-theme' ),
	'next_text' => __( 'Next', 'my-theme' ),
) );
```

## Database Tables

### Use Indexes

```php
/**
 * Create custom table with indexes
 */
function create_custom_table() {
	global $wpdb;
	
	$table_name = $wpdb->prefix . 'my_table';
	$charset_collate = $wpdb->get_charset_collate();
	
	$sql = "CREATE TABLE $table_name (
		id bigint(20) NOT NULL AUTO_INCREMENT,
		user_id bigint(20) NOT NULL,
		data text NOT NULL,
		created_at datetime DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY  (id),
		KEY user_id (user_id),
		KEY created_at (created_at)
	) $charset_collate;";
	
	require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
	dbDelta( $sql );
}
```

## Monitoring and Profiling

### Query Monitor Plugin

```php
/**
 * Add custom timing
 */
do_action( 'qm/start', 'my_expensive_operation' );

// Expensive operation here
my_expensive_function();

do_action( 'qm/stop', 'my_expensive_operation' );
```

### Debug Queries

```php
/**
 * Enable query debugging (development only)
 */
define( 'SAVEQUERIES', true );

/**
 * Display queries
 */
function display_queries() {
	if ( current_user_can( 'manage_options' ) && defined( 'SAVEQUERIES' ) && SAVEQUERIES ) {
		global $wpdb;
		echo '<pre>';
		print_r( $wpdb->queries );
		echo '</pre>';
	}
}
add_action( 'wp_footer', 'display_queries' );
```

## Best Practices

### DO

✅ Cache expensive operations  
✅ Optimize database queries  
✅ Load scripts only where needed  
✅ Use lazy loading for images  
✅ Minify and combine assets  
✅ Use CDN for static assets  
✅ Enable GZIP compression  
✅ Optimize autoloaded data  
✅ Use pagination for large datasets  
✅ Monitor performance regularly

### DON'T

❌ Query in loops  
❌ Load all posts without pagination  
❌ Autoload large options  
❌ Ignore caching opportunities  
❌ Load unnecessary scripts  
❌ Use unoptimized images  
❌ Make excessive HTTP requests  
❌ Skip database indexes  
❌ Ignore slow queries  
❌ Forget to clean up transients

## Performance Checklist

### Theme/Plugin Development

- [ ] Optimize database queries
- [ ] Implement caching (transients, object cache)
- [ ] Enqueue scripts conditionally
- [ ] Minify CSS and JavaScript
- [ ] Optimize images
- [ ] Use lazy loading
- [ ] Reduce HTTP requests
- [ ] Optimize autoloaded data
- [ ] Use pagination
- [ ] Profile and monitor performance

### Server Configuration

- [ ] Enable caching (Redis, Memcached)
- [ ] Use PHP 8.0+
- [ ] Enable OPcache
- [ ] Configure GZIP compression
- [ ] Use CDN
- [ ] Optimize database
- [ ] Enable HTTP/2
- [ ] Use SSL/TLS
- [ ] Configure caching headers
- [ ] Monitor server resources

