# Database Management

## Overview

This guide covers WordPress database operations for plugins including custom table creation with dbDelta, $wpdb methods, prepared statements, and database class patterns for CRUD operations.

---

## Custom Table Creation

### Basic Table Creation with dbDelta

```php
<?php
/**
 * Create custom table on plugin activation
 */
function my_plugin_create_tables() {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'my_plugin_data';
    $charset_collate = $wpdb->get_charset_collate();
    
    $sql = "CREATE TABLE $table_name (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        user_id bigint(20) unsigned NOT NULL,
        title varchar(255) NOT NULL,
        content longtext NOT NULL,
        status varchar(20) DEFAULT 'draft',
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY status (status),
        KEY created_at (created_at)
    ) $charset_collate;";
    
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta( $sql );
    
    // Store database version
    add_option( 'my_plugin_db_version', '1.0' );
}
register_activation_hook( __FILE__, 'my_plugin_create_tables' );
```

### dbDelta Requirements

**Important**: dbDelta has strict formatting requirements:

1. **Two spaces** between PRIMARY KEY and the definition
2. **Key definitions** must be on their own line
3. **No spaces** around default values in quotes
4. **Must use** uppercase for SQL keywords
5. **Must include** $charset_collate

```php
<?php
// ✅ CORRECT dbDelta syntax
$sql = "CREATE TABLE $table_name (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    PRIMARY KEY  (id)
) $charset_collate;";

// ❌ WRONG - Will not work
$sql = "CREATE TABLE $table_name (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    name varchar(100) NOT NULL,
    PRIMARY KEY (id)
) $charset_collate;"; // Missing space after PRIMARY KEY
```

### Database Version Management

```php
<?php
/**
 * Check and update database version
 */
function my_plugin_update_db_check() {
    $current_version = get_option( 'my_plugin_db_version', '0' );
    $new_version = '1.1';
    
    if ( version_compare( $current_version, $new_version, '<' ) ) {
        my_plugin_update_tables();
        update_option( 'my_plugin_db_version', $new_version );
    }
}
add_action( 'plugins_loaded', 'my_plugin_update_db_check' );

/**
 * Update tables for new version
 */
function my_plugin_update_tables() {
    global $wpdb;
    
    $table_name = $wpdb->prefix . 'my_plugin_data';
    $charset_collate = $wpdb->get_charset_collate();
    
    // Use dbDelta to add new columns
    $sql = "CREATE TABLE $table_name (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        user_id bigint(20) unsigned NOT NULL,
        title varchar(255) NOT NULL,
        content longtext NOT NULL,
        status varchar(20) DEFAULT 'draft',
        new_field varchar(100) DEFAULT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY  (id),
        KEY user_id (user_id),
        KEY status (status)
    ) $charset_collate;";
    
    require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
    dbDelta( $sql );
}
```

---

## $wpdb Methods

### Insert Data

```php
<?php
global $wpdb;

$table_name = $wpdb->prefix . 'my_plugin_data';

// Insert with $wpdb->insert()
$result = $wpdb->insert(
    $table_name,
    array(
        'user_id' => get_current_user_id(),
        'title'   => sanitize_text_field( $_POST['title'] ),
        'content' => wp_kses_post( $_POST['content'] ),
        'status'  => 'draft',
    ),
    array(
        '%d', // user_id (integer)
        '%s', // title (string)
        '%s', // content (string)
        '%s', // status (string)
    )
);

if ( $result === false ) {
    // Insert failed
    error_log( 'Database insert error: ' . $wpdb->last_error );
} else {
    // Get inserted ID
    $inserted_id = $wpdb->insert_id;
}
```

### Update Data

```php
<?php
global $wpdb;

$table_name = $wpdb->prefix . 'my_plugin_data';

// Update with $wpdb->update()
$result = $wpdb->update(
    $table_name,
    array(
        'title'   => sanitize_text_field( $_POST['title'] ),
        'content' => wp_kses_post( $_POST['content'] ),
        'status'  => 'published',
    ),
    array(
        'id' => absint( $_POST['id'] ),
    ),
    array(
        '%s', // title
        '%s', // content
        '%s', // status
    ),
    array(
        '%d', // id
    )
);

if ( $result === false ) {
    // Update failed
    error_log( 'Database update error: ' . $wpdb->last_error );
} else {
    // $result contains number of rows updated
    echo "Updated $result row(s)";
}
```

### Delete Data

```php
<?php
global $wpdb;

$table_name = $wpdb->prefix . 'my_plugin_data';

// Delete with $wpdb->delete()
$result = $wpdb->delete(
    $table_name,
    array(
        'id' => absint( $_POST['id'] ),
    ),
    array(
        '%d', // id
    )
);

if ( $result === false ) {
    // Delete failed
    error_log( 'Database delete error: ' . $wpdb->last_error );
} else {
    // $result contains number of rows deleted
    echo "Deleted $result row(s)";
}

// Delete with multiple conditions
$result = $wpdb->delete(
    $table_name,
    array(
        'user_id' => get_current_user_id(),
        'status'  => 'draft',
    ),
    array(
        '%d', // user_id
        '%s', // status
    )
);
```

### Query Data

#### Get Multiple Rows

```php
<?php
global $wpdb;

$table_name = $wpdb->prefix . 'my_plugin_data';

// Get all rows
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM $table_name WHERE user_id = %d ORDER BY created_at DESC",
        get_current_user_id()
    )
);

foreach ( $results as $row ) {
    echo $row->title;
    echo $row->content;
}

// Get results as associative array
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM $table_name WHERE status = %s",
        'published'
    ),
    ARRAY_A
);

// Get specific columns
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT id, title FROM $table_name WHERE user_id = %d",
        get_current_user_id()
    )
);
```

#### Get Single Row

```php
<?php
global $wpdb;

$table_name = $wpdb->prefix . 'my_plugin_data';

// Get single row as object
$row = $wpdb->get_row(
    $wpdb->prepare(
        "SELECT * FROM $table_name WHERE id = %d",
        $item_id
    )
);

if ( $row ) {
    echo $row->title;
    echo $row->content;
}

// Get single row as associative array
$row = $wpdb->get_row(
    $wpdb->prepare(
        "SELECT * FROM $table_name WHERE id = %d",
        $item_id
    ),
    ARRAY_A
);

if ( $row ) {
    echo $row['title'];
}
```

#### Get Single Value

```php
<?php
global $wpdb;

$table_name = $wpdb->prefix . 'my_plugin_data';

// Get single value
$count = $wpdb->get_var(
    $wpdb->prepare(
        "SELECT COUNT(*) FROM $table_name WHERE user_id = %d",
        get_current_user_id()
    )
);

echo "Total items: $count";

// Get specific column value
$title = $wpdb->get_var(
    $wpdb->prepare(
        "SELECT title FROM $table_name WHERE id = %d",
        $item_id
    )
);
```

#### Get Single Column

```php
<?php
global $wpdb;

$table_name = $wpdb->prefix . 'my_plugin_data';

// Get array of values from single column
$titles = $wpdb->get_col(
    $wpdb->prepare(
        "SELECT title FROM $table_name WHERE user_id = %d",
        get_current_user_id()
    )
);

foreach ( $titles as $title ) {
    echo $title;
}

// Get IDs
$ids = $wpdb->get_col(
    $wpdb->prepare(
        "SELECT id FROM $table_name WHERE status = %s",
        'published'
    )
);
```

---

## Prepared Statements

### Using $wpdb->prepare()

**Always use prepared statements to prevent SQL injection.**

```php
<?php
global $wpdb;

$table_name = $wpdb->prefix . 'my_plugin_data';

// Single placeholder
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM $table_name WHERE user_id = %d",
        $user_id
    )
);

// Multiple placeholders
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM $table_name WHERE user_id = %d AND status = %s",
        $user_id,
        $status
    )
);

// Array of values (WordPress 5.3+)
$statuses = array( 'draft', 'published', 'pending' );
$placeholders = implode( ', ', array_fill( 0, count( $statuses ), '%s' ) );

$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM $table_name WHERE status IN ($placeholders)",
        ...$statuses
    )
);
```

### Placeholder Types

- `%s` - String
- `%d` - Integer (signed)
- `%f` - Float

```php
<?php
// String placeholder
$wpdb->prepare( "SELECT * FROM $table WHERE name = %s", $name );

// Integer placeholder
$wpdb->prepare( "SELECT * FROM $table WHERE id = %d", $id );

// Float placeholder
$wpdb->prepare( "SELECT * FROM $table WHERE price = %f", $price );

// Multiple types
$wpdb->prepare(
    "INSERT INTO $table (name, age, score) VALUES (%s, %d, %f)",
    $name,
    $age,
    $score
);
```

### ❌ DON'T - SQL Injection Vulnerability

```php
<?php
// WRONG - Direct variable insertion (SQL injection risk)
$results = $wpdb->get_results(
    "SELECT * FROM $table_name WHERE user_id = $user_id"
);

// WRONG - String concatenation
$results = $wpdb->get_results(
    "SELECT * FROM $table_name WHERE name = '" . $name . "'"
);
```

### ✅ DO - Use Prepared Statements

```php
<?php
// CORRECT - Use $wpdb->prepare()
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM $table_name WHERE user_id = %d",
        $user_id
    )
);

// CORRECT - Multiple parameters
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM $table_name WHERE name = %s AND age = %d",
        $name,
        $age
    )
);
```

---

## Database Class Pattern

### Complete CRUD Class

```php
<?php
/**
 * Database handler for custom table
 */
class My_Plugin_Database {

    /**
     * Table name
     *
     * @var string
     */
    private $table_name;

    /**
     * Constructor
     */
    public function __construct() {
        global $wpdb;
        $this->table_name = $wpdb->prefix . 'my_plugin_data';
    }

    /**
     * Create item
     *
     * @param array $data Item data
     * @return int|false Inserted ID or false on failure
     */
    public function create( $data ) {
        global $wpdb;

        $defaults = array(
            'user_id' => get_current_user_id(),
            'title'   => '',
            'content' => '',
            'status'  => 'draft',
        );

        $data = wp_parse_args( $data, $defaults );

        $result = $wpdb->insert(
            $this->table_name,
            array(
                'user_id' => absint( $data['user_id'] ),
                'title'   => sanitize_text_field( $data['title'] ),
                'content' => wp_kses_post( $data['content'] ),
                'status'  => sanitize_text_field( $data['status'] ),
            ),
            array( '%d', '%s', '%s', '%s' )
        );

        if ( $result === false ) {
            error_log( 'Database insert error: ' . $wpdb->last_error );
            return false;
        }

        return $wpdb->insert_id;
    }

    /**
     * Get item by ID
     *
     * @param int $id Item ID
     * @return object|null Item object or null if not found
     */
    public function get( $id ) {
        global $wpdb;

        return $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$this->table_name} WHERE id = %d",
                $id
            )
        );
    }

    /**
     * Get items with filters
     *
     * @param array $args Query arguments
     * @return array Array of items
     */
    public function get_items( $args = array() ) {
        global $wpdb;

        $defaults = array(
            'user_id'  => 0,
            'status'   => '',
            'orderby'  => 'created_at',
            'order'    => 'DESC',
            'limit'    => 20,
            'offset'   => 0,
        );

        $args = wp_parse_args( $args, $defaults );

        $where = array( '1=1' );
        $values = array();

        if ( $args['user_id'] ) {
            $where[] = 'user_id = %d';
            $values[] = $args['user_id'];
        }

        if ( $args['status'] ) {
            $where[] = 'status = %s';
            $values[] = $args['status'];
        }

        $where_clause = implode( ' AND ', $where );

        $orderby = sanitize_sql_orderby( $args['orderby'] . ' ' . $args['order'] );
        if ( ! $orderby ) {
            $orderby = 'created_at DESC';
        }

        $sql = "SELECT * FROM {$this->table_name}
                WHERE $where_clause
                ORDER BY $orderby
                LIMIT %d OFFSET %d";

        $values[] = $args['limit'];
        $values[] = $args['offset'];

        if ( ! empty( $values ) ) {
            $sql = $wpdb->prepare( $sql, $values );
        }

        return $wpdb->get_results( $sql );
    }

    /**
     * Update item
     *
     * @param int   $id   Item ID
     * @param array $data Item data
     * @return bool True on success, false on failure
     */
    public function update( $id, $data ) {
        global $wpdb;

        $update_data = array();
        $format = array();

        if ( isset( $data['title'] ) ) {
            $update_data['title'] = sanitize_text_field( $data['title'] );
            $format[] = '%s';
        }

        if ( isset( $data['content'] ) ) {
            $update_data['content'] = wp_kses_post( $data['content'] );
            $format[] = '%s';
        }

        if ( isset( $data['status'] ) ) {
            $update_data['status'] = sanitize_text_field( $data['status'] );
            $format[] = '%s';
        }

        if ( empty( $update_data ) ) {
            return false;
        }

        $result = $wpdb->update(
            $this->table_name,
            $update_data,
            array( 'id' => $id ),
            $format,
            array( '%d' )
        );

        return $result !== false;
    }

    /**
     * Delete item
     *
     * @param int $id Item ID
     * @return bool True on success, false on failure
     */
    public function delete( $id ) {
        global $wpdb;

        $result = $wpdb->delete(
            $this->table_name,
            array( 'id' => $id ),
            array( '%d' )
        );

        return $result !== false;
    }

    /**
     * Get count
     *
     * @param array $args Query arguments
     * @return int Item count
     */
    public function count( $args = array() ) {
        global $wpdb;

        $where = array( '1=1' );
        $values = array();

        if ( ! empty( $args['user_id'] ) ) {
            $where[] = 'user_id = %d';
            $values[] = $args['user_id'];
        }

        if ( ! empty( $args['status'] ) ) {
            $where[] = 'status = %s';
            $values[] = $args['status'];
        }

        $where_clause = implode( ' AND ', $where );

        $sql = "SELECT COUNT(*) FROM {$this->table_name} WHERE $where_clause";

        if ( ! empty( $values ) ) {
            $sql = $wpdb->prepare( $sql, $values );
        }

        return (int) $wpdb->get_var( $sql );
    }
}
```

### Using the Database Class

```php
<?php
// Initialize
$db = new My_Plugin_Database();

// Create item
$item_id = $db->create( array(
    'title'   => 'My Title',
    'content' => 'My content',
    'status'  => 'published',
) );

// Get item
$item = $db->get( $item_id );

// Get items with filters
$items = $db->get_items( array(
    'user_id' => get_current_user_id(),
    'status'  => 'published',
    'limit'   => 10,
) );

// Update item
$db->update( $item_id, array(
    'title' => 'Updated Title',
) );

// Delete item
$db->delete( $item_id );

// Get count
$count = $db->count( array(
    'status' => 'published',
) );
```

---

## Transactions

WordPress doesn't have built-in transaction support, but you can use raw SQL:

```php
<?php
global $wpdb;

// Start transaction
$wpdb->query( 'START TRANSACTION' );

try {
    // Multiple operations
    $wpdb->insert(
        $wpdb->prefix . 'my_plugin_data',
        array( 'title' => 'Item 1' ),
        array( '%s' )
    );

    $wpdb->insert(
        $wpdb->prefix . 'my_plugin_data',
        array( 'title' => 'Item 2' ),
        array( '%s' )
    );

    // Check for errors
    if ( $wpdb->last_error ) {
        throw new Exception( $wpdb->last_error );
    }

    // Commit transaction
    $wpdb->query( 'COMMIT' );

} catch ( Exception $e ) {
    // Rollback on error
    $wpdb->query( 'ROLLBACK' );
    error_log( 'Transaction failed: ' . $e->getMessage() );
}
```

---

## Best Practices

### Security

1. **Always use prepared statements**: Never concatenate user input into SQL queries
2. **Sanitize input**: Use appropriate sanitization functions before database operations
3. **Validate data**: Check that data is valid before inserting/updating
4. **Check capabilities**: Verify user has permission to perform database operations
5. **Escape output**: Use `esc_html()`, `esc_attr()` when displaying database values

```php
<?php
// Good security practices
function my_plugin_save_item() {
    // Check capability
    if ( ! current_user_can( 'edit_posts' ) ) {
        return new WP_Error( 'forbidden', 'Insufficient permissions' );
    }

    // Validate input
    $title = isset( $_POST['title'] ) ? sanitize_text_field( $_POST['title'] ) : '';
    if ( empty( $title ) ) {
        return new WP_Error( 'invalid', 'Title is required' );
    }

    // Use prepared statement
    global $wpdb;
    $wpdb->insert(
        $wpdb->prefix . 'my_plugin_data',
        array( 'title' => $title ),
        array( '%s' )
    );
}
```

### Performance

1. **Use indexes**: Add indexes to frequently queried columns
2. **Limit results**: Always use LIMIT in queries
3. **Cache results**: Use transients for expensive queries
4. **Avoid N+1 queries**: Fetch related data in single query when possible
5. **Use appropriate data types**: Choose correct column types for data

```php
<?php
// Cache expensive query
function my_plugin_get_popular_items() {
    $cache_key = 'my_plugin_popular_items';
    $items = get_transient( $cache_key );

    if ( false === $items ) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'my_plugin_data';

        $items = $wpdb->get_results(
            "SELECT * FROM $table_name
             WHERE status = 'published'
             ORDER BY views DESC
             LIMIT 10"
        );

        set_transient( $cache_key, $items, HOUR_IN_SECONDS );
    }

    return $items;
}
```

### Error Handling

1. **Check return values**: Always check if database operations succeeded
2. **Log errors**: Use `error_log()` to record database errors
3. **Use WP_Error**: Return WP_Error objects for better error handling
4. **Check $wpdb->last_error**: Inspect error messages for debugging
5. **Enable WP_DEBUG**: Use debug mode during development

```php
<?php
function my_plugin_create_item( $data ) {
    global $wpdb;

    $result = $wpdb->insert(
        $wpdb->prefix . 'my_plugin_data',
        $data,
        array( '%s', '%s' )
    );

    if ( $result === false ) {
        error_log( 'Database error: ' . $wpdb->last_error );
        return new WP_Error(
            'db_error',
            __( 'Failed to create item.', 'my-plugin' )
        );
    }

    return $wpdb->insert_id;
}
```

### Code Organization

1. **Use classes**: Organize database operations in dedicated classes
2. **Separate concerns**: Keep database logic separate from business logic
3. **Use constants**: Define table names as constants
4. **Document methods**: Add PHPDoc blocks to all methods
5. **Follow WordPress coding standards**: Use WordPress naming conventions

```php
<?php
/**
 * Database constants
 */
define( 'MY_PLUGIN_TABLE_DATA', 'my_plugin_data' );

/**
 * Database handler class
 */
class My_Plugin_DB {

    /**
     * Get table name with prefix
     *
     * @return string
     */
    private function get_table_name() {
        global $wpdb;
        return $wpdb->prefix . MY_PLUGIN_TABLE_DATA;
    }
}
```

---

## Common Pitfalls

### ❌ DON'T

```php
<?php
// Don't forget two spaces after PRIMARY KEY
$sql = "CREATE TABLE $table_name (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    PRIMARY KEY (id)
) $charset_collate;"; // WRONG - Missing space

// Don't skip $wpdb->prepare()
$results = $wpdb->get_results(
    "SELECT * FROM $table_name WHERE user_id = $user_id"
); // WRONG - SQL injection risk

// Don't ignore return values
$wpdb->insert( $table_name, $data ); // WRONG - Not checking result

// Don't use wrong placeholder types
$wpdb->prepare(
    "SELECT * FROM $table WHERE id = %s",
    $id
); // WRONG - Should use %d for integers

// Don't forget charset_collate
$sql = "CREATE TABLE $table_name (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    PRIMARY KEY  (id)
)"; // WRONG - Missing $charset_collate

// Don't skip sanitization
$wpdb->insert(
    $table_name,
    array( 'title' => $_POST['title'] ) // WRONG - Not sanitized
);

// Don't use SELECT *
$results = $wpdb->get_results(
    "SELECT * FROM $table_name"
); // WRONG - No LIMIT, fetches all columns

// Don't hardcode table prefix
$results = $wpdb->get_results(
    "SELECT * FROM wp_my_plugin_data"
); // WRONG - Should use $wpdb->prefix
```

### ✅ DO

```php
<?php
// Use two spaces after PRIMARY KEY
$sql = "CREATE TABLE $table_name (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    PRIMARY KEY  (id)
) $charset_collate;"; // CORRECT

// Always use $wpdb->prepare()
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM $table_name WHERE user_id = %d",
        $user_id
    )
); // CORRECT

// Check return values
$result = $wpdb->insert( $table_name, $data );
if ( $result === false ) {
    error_log( 'Insert failed: ' . $wpdb->last_error );
} // CORRECT

// Use correct placeholder types
$wpdb->prepare(
    "SELECT * FROM $table WHERE id = %d",
    $id
); // CORRECT - %d for integers

// Include charset_collate
$sql = "CREATE TABLE $table_name (
    id bigint(20) NOT NULL AUTO_INCREMENT,
    PRIMARY KEY  (id)
) $charset_collate;"; // CORRECT

// Sanitize all input
$wpdb->insert(
    $table_name,
    array( 'title' => sanitize_text_field( $_POST['title'] ) )
); // CORRECT

// Select specific columns with LIMIT
$results = $wpdb->get_results(
    "SELECT id, title FROM $table_name LIMIT 10"
); // CORRECT

// Use $wpdb->prefix
$table_name = $wpdb->prefix . 'my_plugin_data';
$results = $wpdb->get_results(
    "SELECT * FROM $table_name"
); // CORRECT
```

---

## Summary

**Key Takeaways:**

1. **dbDelta**: Use for table creation with strict formatting (two spaces after PRIMARY KEY)
2. **$wpdb methods**: Use `insert()`, `update()`, `delete()` for simple operations
3. **Prepared statements**: Always use `$wpdb->prepare()` to prevent SQL injection
4. **Query methods**: Use `get_results()`, `get_row()`, `get_var()`, `get_col()` for retrieving data
5. **Database classes**: Organize CRUD operations in dedicated classes
6. **Security**: Sanitize input, validate data, check capabilities
7. **Performance**: Use indexes, cache results, limit queries
8. **Error handling**: Check return values, log errors, use WP_Error

**Common Mistakes to Avoid:**

- Forgetting two spaces after PRIMARY KEY in dbDelta
- Not using prepared statements
- Skipping input sanitization
- Ignoring return values
- Using wrong placeholder types
- Hardcoding table prefixes
- Not using LIMIT in queries

**Resources:**

- [WordPress Database Class Reference](https://developer.wordpress.org/reference/classes/wpdb/)
- [Creating Tables with Plugins](https://codex.wordpress.org/Creating_Tables_with_Plugins)
- [Data Validation](https://developer.wordpress.org/plugins/security/data-validation/)

