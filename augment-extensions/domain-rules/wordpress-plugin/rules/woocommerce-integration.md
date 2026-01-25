# WooCommerce Integration for WordPress Plugins

## Overview

This document provides comprehensive guidelines for creating WordPress plugins that integrate with WooCommerce, the most popular eCommerce platform for WordPress.

## Plugin Detection

### Check if WooCommerce is Active

Always verify WooCommerce is installed and active before using WooCommerce functions:

```php
<?php
/**
 * Check if WooCommerce is active
 */
function my_plugin_is_woocommerce_active() {
    return in_array( 
        'woocommerce/woocommerce.php', 
        apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) 
    );
}

/**
 * Initialize plugin only if WooCommerce is active
 */
function my_plugin_init() {
    if ( ! my_plugin_is_woocommerce_active() ) {
        add_action( 'admin_notices', 'my_plugin_woocommerce_missing_notice' );
        return;
    }
    
    // Initialize plugin functionality
    My_Plugin::instance();
}
add_action( 'plugins_loaded', 'my_plugin_init' );

/**
 * Display admin notice if WooCommerce is not active
 */
function my_plugin_woocommerce_missing_notice() {
    ?>
    <div class="notice notice-error">
        <p><?php esc_html_e( 'My Plugin requires WooCommerce to be installed and active.', 'my-plugin' ); ?></p>
    </div>
    <?php
}
```

### Declare WooCommerce Compatibility

```php
<?php
/**
 * Declare HPOS (High-Performance Order Storage) compatibility
 */
add_action( 'before_woocommerce_init', function() {
    if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 
            'custom_order_tables', 
            __FILE__, 
            true 
        );
    }
} );

/**
 * Declare compatibility with WooCommerce features
 */
add_action( 'before_woocommerce_init', function() {
    if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 
            'cart_checkout_blocks', 
            __FILE__, 
            true 
        );
    }
} );
```

---

## Product Extensions

### Add Custom Product Fields

```php
<?php
/**
 * Add custom field to product general tab
 */
function my_plugin_add_custom_product_field() {
    woocommerce_wp_text_input( array(
        'id'          => '_custom_product_field',
        'label'       => __( 'Custom Field', 'my-plugin' ),
        'placeholder' => __( 'Enter value', 'my-plugin' ),
        'desc_tip'    => true,
        'description' => __( 'This is a custom field.', 'my-plugin' ),
    ) );
}
add_action( 'woocommerce_product_options_general_product_data', 'my_plugin_add_custom_product_field' );

/**
 * Save custom product field
 */
function my_plugin_save_custom_product_field( $post_id ) {
    $custom_field = isset( $_POST['_custom_product_field'] ) 
        ? sanitize_text_field( $_POST['_custom_product_field'] ) 
        : '';
    
    update_post_meta( $post_id, '_custom_product_field', $custom_field );
}
add_action( 'woocommerce_process_product_meta', 'my_plugin_save_custom_product_field' );

/**
 * Display custom field on product page
 */
function my_plugin_display_custom_product_field() {
    global $product;
    
    $custom_field = $product->get_meta( '_custom_product_field' );
    
    if ( $custom_field ) {
        echo '<div class="custom-product-field">';
        echo '<strong>' . esc_html__( 'Custom Field:', 'my-plugin' ) . '</strong> ';
        echo esc_html( $custom_field );
        echo '</div>';
    }
}
add_action( 'woocommerce_single_product_summary', 'my_plugin_display_custom_product_field', 25 );
```

### Add Custom Product Tab

```php
<?php
/**
 * Add custom product tab
 */
function my_plugin_add_custom_product_tab( $tabs ) {
    $tabs['custom_tab'] = array(
        'title'    => __( 'Custom Tab', 'my-plugin' ),
        'priority' => 50,
        'callback' => 'my_plugin_custom_product_tab_content',
    );
    
    return $tabs;
}
add_filter( 'woocommerce_product_tabs', 'my_plugin_add_custom_product_tab' );

/**
 * Custom product tab content
 */
function my_plugin_custom_product_tab_content() {
    global $product;

    ?>
    <h2><?php esc_html_e( 'Custom Tab', 'my-plugin' ); ?></h2>
    <p><?php esc_html_e( 'Custom tab content goes here.', 'my-plugin' ); ?></p>
    <?php
}
```

---

## Cart & Checkout Extensions

### Add Custom Cart Item Data

```php
<?php
/**
 * Add custom data to cart item
 */
function my_plugin_add_cart_item_data( $cart_item_data, $product_id, $variation_id ) {
    if ( isset( $_POST['custom_field'] ) ) {
        $cart_item_data['custom_field'] = sanitize_text_field( $_POST['custom_field'] );
    }

    return $cart_item_data;
}
add_filter( 'woocommerce_add_cart_item_data', 'my_plugin_add_cart_item_data', 10, 3 );

/**
 * Display custom cart item data
 */
function my_plugin_display_cart_item_data( $item_data, $cart_item ) {
    if ( isset( $cart_item['custom_field'] ) ) {
        $item_data[] = array(
            'key'   => __( 'Custom Field', 'my-plugin' ),
            'value' => wc_clean( $cart_item['custom_field'] ),
        );
    }

    return $item_data;
}
add_filter( 'woocommerce_get_item_data', 'my_plugin_display_cart_item_data', 10, 2 );

/**
 * Save custom cart item data to order
 */
function my_plugin_save_order_item_meta( $item, $cart_item_key, $values, $order ) {
    if ( isset( $values['custom_field'] ) ) {
        $item->add_meta_data( '_custom_field', $values['custom_field'] );
    }
}
add_action( 'woocommerce_checkout_create_order_line_item', 'my_plugin_save_order_item_meta', 10, 4 );
```

### Add Custom Checkout Field

```php
<?php
/**
 * Add custom checkout field
 */
function my_plugin_add_checkout_field( $fields ) {
    $fields['billing']['billing_custom_field'] = array(
        'type'        => 'text',
        'label'       => __( 'Custom Field', 'my-plugin' ),
        'placeholder' => __( 'Enter value', 'my-plugin' ),
        'required'    => false,
        'class'       => array( 'form-row-wide' ),
        'clear'       => true,
        'priority'    => 100,
    );

    return $fields;
}
add_filter( 'woocommerce_checkout_fields', 'my_plugin_add_checkout_field' );

/**
 * Validate custom checkout field
 */
function my_plugin_validate_checkout_field() {
    if ( isset( $_POST['billing_custom_field'] ) && empty( $_POST['billing_custom_field'] ) ) {
        wc_add_notice(
            __( 'Please enter a value for Custom Field.', 'my-plugin' ),
            'error'
        );
    }
}
add_action( 'woocommerce_checkout_process', 'my_plugin_validate_checkout_field' );

/**
 * Save custom checkout field to order
 */
function my_plugin_save_checkout_field( $order_id ) {
    if ( isset( $_POST['billing_custom_field'] ) ) {
        update_post_meta(
            $order_id,
            '_billing_custom_field',
            sanitize_text_field( $_POST['billing_custom_field'] )
        );
    }
}
add_action( 'woocommerce_checkout_update_order_meta', 'my_plugin_save_checkout_field' );

/**
 * Display custom field in order admin
 */
function my_plugin_display_order_custom_field( $order ) {
    $custom_field = $order->get_meta( '_billing_custom_field' );

    if ( $custom_field ) {
        echo '<p><strong>' . esc_html__( 'Custom Field:', 'my-plugin' ) . '</strong> ' . esc_html( $custom_field ) . '</p>';
    }
}
add_action( 'woocommerce_admin_order_data_after_billing_address', 'my_plugin_display_order_custom_field' );
```

---

## Order Extensions

### Add Custom Order Status

```php
<?php
/**
 * Register custom order status
 */
function my_plugin_register_custom_order_status() {
    register_post_status( 'wc-custom-status', array(
        'label'                     => __( 'Custom Status', 'my-plugin' ),
        'public'                    => true,
        'exclude_from_search'       => false,
        'show_in_admin_all_list'    => true,
        'show_in_admin_status_list' => true,
        'label_count'               => _n_noop(
            'Custom Status <span class="count">(%s)</span>',
            'Custom Status <span class="count">(%s)</span>',
            'my-plugin'
        ),
    ) );
}
add_action( 'init', 'my_plugin_register_custom_order_status' );

/**
 * Add custom status to order statuses
 */
function my_plugin_add_custom_order_status( $order_statuses ) {
    $order_statuses['wc-custom-status'] = __( 'Custom Status', 'my-plugin' );
    return $order_statuses;
}
add_filter( 'wc_order_statuses', 'my_plugin_add_custom_order_status' );
```

### Hook into Order Events

```php
<?php
/**
 * Action when order is created
 */
function my_plugin_order_created( $order_id, $order ) {
    // Custom logic when order is created
    error_log( 'Order created: ' . $order_id );
}
add_action( 'woocommerce_new_order', 'my_plugin_order_created', 10, 2 );

/**
 * Action when order status changes
 */
function my_plugin_order_status_changed( $order_id, $old_status, $new_status, $order ) {
    // Custom logic when order status changes
    if ( 'processing' === $new_status ) {
        // Do something when order is processing
    }
}
add_action( 'woocommerce_order_status_changed', 'my_plugin_order_status_changed', 10, 4 );

/**
 * Action when order is completed
 */
function my_plugin_order_completed( $order_id ) {
    $order = wc_get_order( $order_id );

    // Custom logic when order is completed
    // e.g., send to external API, update inventory, etc.
}
add_action( 'woocommerce_order_status_completed', 'my_plugin_order_completed' );
```

---

## Payment Gateway Integration

### Create Custom Payment Gateway

```php
<?php
/**
 * Custom Payment Gateway Class
 */
class My_Plugin_Payment_Gateway extends WC_Payment_Gateway {

    /**
     * Constructor
     */
    public function __construct() {
        $this->id                 = 'my_custom_gateway';
        $this->icon               = '';
        $this->has_fields         = true;
        $this->method_title       = __( 'Custom Gateway', 'my-plugin' );
        $this->method_description = __( 'Custom payment gateway description.', 'my-plugin' );

        // Load settings
        $this->init_form_fields();
        $this->init_settings();

        // Get settings
        $this->title       = $this->get_option( 'title' );
        $this->description = $this->get_option( 'description' );
        $this->enabled     = $this->get_option( 'enabled' );

        // Actions
        add_action(
            'woocommerce_update_options_payment_gateways_' . $this->id,
            array( $this, 'process_admin_options' )
        );
    }

    /**
     * Initialize gateway settings form fields
     */
    public function init_form_fields() {
        $this->form_fields = array(
            'enabled' => array(
                'title'   => __( 'Enable/Disable', 'my-plugin' ),
                'type'    => 'checkbox',
                'label'   => __( 'Enable Custom Gateway', 'my-plugin' ),
                'default' => 'no',
            ),
            'title' => array(
                'title'       => __( 'Title', 'my-plugin' ),
                'type'        => 'text',
                'description' => __( 'Payment method title shown to customers.', 'my-plugin' ),
                'default'     => __( 'Custom Payment', 'my-plugin' ),
                'desc_tip'    => true,
            ),
            'description' => array(
                'title'       => __( 'Description', 'my-plugin' ),
                'type'        => 'textarea',
                'description' => __( 'Payment method description shown to customers.', 'my-plugin' ),
                'default'     => __( 'Pay with custom gateway.', 'my-plugin' ),
                'desc_tip'    => true,
            ),
        );
    }

    /**
     * Payment fields on checkout
     */
    public function payment_fields() {
        if ( $this->description ) {
            echo wpautop( wp_kses_post( $this->description ) );
        }

        // Add custom payment fields here
        ?>
        <fieldset>
            <p class="form-row form-row-wide">
                <label for="custom-field"><?php esc_html_e( 'Custom Field', 'my-plugin' ); ?></label>
                <input type="text" id="custom-field" name="custom_field" />
            </p>
        </fieldset>
        <?php
    }

    /**
     * Validate payment fields
     */
    public function validate_fields() {
        if ( empty( $_POST['custom_field'] ) ) {
            wc_add_notice(
                __( 'Custom field is required.', 'my-plugin' ),
                'error'
            );
            return false;
        }

        return true;
    }

    /**
     * Process payment
     */
    public function process_payment( $order_id ) {
        $order = wc_get_order( $order_id );

        // Process payment with external gateway
        // ...

        // Mark order as processing or completed
        $order->payment_complete();

        // Add order note
        $order->add_order_note(
            __( 'Payment completed via Custom Gateway.', 'my-plugin' )
        );

        // Reduce stock levels
        wc_reduce_stock_levels( $order_id );

        // Remove cart
        WC()->cart->empty_cart();

        // Return success
        return array(
            'result'   => 'success',
            'redirect' => $this->get_return_url( $order ),
        );
    }
}

/**
 * Add custom payment gateway to WooCommerce
 */
function my_plugin_add_payment_gateway( $gateways ) {
    $gateways[] = 'My_Plugin_Payment_Gateway';
    return $gateways;
}
add_filter( 'woocommerce_payment_gateways', 'my_plugin_add_payment_gateway' );
```

---

## Email Extensions

### Add Custom Email

```php
<?php
/**
 * Custom Email Class
 */
class My_Plugin_Custom_Email extends WC_Email {

    /**
     * Constructor
     */
    public function __construct() {
        $this->id             = 'my_custom_email';
        $this->title          = __( 'Custom Email', 'my-plugin' );
        $this->description    = __( 'Custom email sent to customers.', 'my-plugin' );
        $this->template_html  = 'emails/custom-email.php';
        $this->template_plain = 'emails/plain/custom-email.php';
        $this->template_base  = plugin_dir_path( __FILE__ ) . 'templates/';

        // Triggers
        add_action( 'my_plugin_custom_action', array( $this, 'trigger' ), 10, 2 );

        // Call parent constructor
        parent::__construct();
    }

    /**
     * Trigger email
     */
    public function trigger( $order_id, $custom_data = null ) {
        $this->setup_locale();

        if ( $order_id ) {
            $this->object = wc_get_order( $order_id );
            $this->recipient = $this->object->get_billing_email();
        }

        if ( $this->is_enabled() && $this->get_recipient() ) {
            $this->send(
                $this->get_recipient(),
                $this->get_subject(),
                $this->get_content(),
                $this->get_headers(),
                $this->get_attachments()
            );
        }

        $this->restore_locale();
    }

    /**
     * Get email content (HTML)
     */
    public function get_content_html() {
        return wc_get_template_html(
            $this->template_html,
            array(
                'order'         => $this->object,
                'email_heading' => $this->get_heading(),
                'sent_to_admin' => false,
                'plain_text'    => false,
                'email'         => $this,
            ),
            '',
            $this->template_base
        );
    }

    /**
     * Get email content (plain text)
     */
    public function get_content_plain() {
        return wc_get_template_html(
            $this->template_plain,
            array(
                'order'         => $this->object,
                'email_heading' => $this->get_heading(),
                'sent_to_admin' => false,
                'plain_text'    => true,
                'email'         => $this,
            ),
            '',
            $this->template_base
        );
    }
}

/**
 * Add custom email to WooCommerce
 */
function my_plugin_add_custom_email( $emails ) {
    $emails['My_Plugin_Custom_Email'] = new My_Plugin_Custom_Email();
    return $emails;
}
add_filter( 'woocommerce_email_classes', 'my_plugin_add_custom_email' );
```

---

## REST API Extensions

### Add Custom REST API Endpoint

```php
<?php
/**
 * Register custom REST API endpoint
 */
function my_plugin_register_rest_route() {
    register_rest_route( 'my-plugin/v1', '/products/(?P<id>\d+)/custom', array(
        'methods'             => 'GET',
        'callback'            => 'my_plugin_get_product_custom_data',
        'permission_callback' => function() {
            return current_user_can( 'edit_posts' );
        },
        'args' => array(
            'id' => array(
                'validate_callback' => function( $param ) {
                    return is_numeric( $param );
                },
            ),
        ),
    ) );
}
add_action( 'rest_api_init', 'my_plugin_register_rest_route' );

/**
 * Get product custom data via REST API
 */
function my_plugin_get_product_custom_data( $request ) {
    $product_id = $request['id'];
    $product = wc_get_product( $product_id );

    if ( ! $product ) {
        return new WP_Error( 'invalid_product', __( 'Invalid product ID.', 'my-plugin' ), array( 'status' => 404 ) );
    }

    return rest_ensure_response( array(
        'id'           => $product->get_id(),
        'name'         => $product->get_name(),
        'custom_field' => $product->get_meta( '_custom_product_field' ),
    ) );
}
```

---

## Admin Extensions

### Add Custom Admin Column

```php
<?php
/**
 * Add custom column to products admin
 */
function my_plugin_add_product_column( $columns ) {
    $columns['custom_field'] = __( 'Custom Field', 'my-plugin' );
    return $columns;
}
add_filter( 'manage_edit-product_columns', 'my_plugin_add_product_column' );

/**
 * Populate custom column
 */
function my_plugin_populate_product_column( $column, $post_id ) {
    if ( 'custom_field' === $column ) {
        $product = wc_get_product( $post_id );
        $custom_field = $product->get_meta( '_custom_product_field' );
        echo esc_html( $custom_field );
    }
}
add_action( 'manage_product_posts_custom_column', 'my_plugin_populate_product_column', 10, 2 );

/**
 * Make custom column sortable
 */
function my_plugin_sortable_product_column( $columns ) {
    $columns['custom_field'] = 'custom_field';
    return $columns;
}
add_filter( 'manage_edit-product_sortable_columns', 'my_plugin_sortable_product_column' );
```

### Add Settings Tab to WooCommerce Settings

```php
<?php
/**
 * Add custom settings tab
 */
function my_plugin_add_settings_tab( $settings_tabs ) {
    $settings_tabs['my_plugin'] = __( 'My Plugin', 'my-plugin' );
    return $settings_tabs;
}
add_filter( 'woocommerce_settings_tabs_array', 'my_plugin_add_settings_tab', 50 );

/**
 * Settings tab content
 */
function my_plugin_settings_tab_content() {
    woocommerce_admin_fields( my_plugin_get_settings() );
}
add_action( 'woocommerce_settings_tabs_my_plugin', 'my_plugin_settings_tab_content' );

/**
 * Save settings
 */
function my_plugin_save_settings() {
    woocommerce_update_options( my_plugin_get_settings() );
}
add_action( 'woocommerce_update_options_my_plugin', 'my_plugin_save_settings' );

/**
 * Get settings array
 */
function my_plugin_get_settings() {
    return array(
        array(
            'title' => __( 'My Plugin Settings', 'my-plugin' ),
            'type'  => 'title',
            'id'    => 'my_plugin_settings',
        ),
        array(
            'title'   => __( 'Enable Feature', 'my-plugin' ),
            'desc'    => __( 'Enable custom feature', 'my-plugin' ),
            'id'      => 'my_plugin_enable_feature',
            'default' => 'yes',
            'type'    => 'checkbox',
        ),
        array(
            'title'    => __( 'Custom Option', 'my-plugin' ),
            'desc'     => __( 'Enter custom value', 'my-plugin' ),
            'id'       => 'my_plugin_custom_option',
            'default'  => '',
            'type'     => 'text',
            'desc_tip' => true,
        ),
        array(
            'type' => 'sectionend',
            'id'   => 'my_plugin_settings',
        ),
    );
}
```

---

## Best Practices

### DO

✅ **Check WooCommerce is active** before using WooCommerce functions
✅ **Declare HPOS compatibility** for modern WooCommerce versions
✅ **Use WooCommerce hooks and filters** instead of modifying core files
✅ **Sanitize all input** from forms and requests
✅ **Escape all output** to prevent XSS attacks
✅ **Use WooCommerce functions** (`wc_get_product()`, `wc_get_order()`, etc.)
✅ **Follow WooCommerce coding standards**
✅ **Test with latest WooCommerce version**
✅ **Use translation functions** for all user-facing text
✅ **Add proper error handling** for API calls and external services
✅ **Document custom hooks** for other developers

### DON'T

❌ **Don't modify WooCommerce core files** - use hooks and filters
❌ **Don't assume WooCommerce is active** - always check first
❌ **Don't use deprecated WooCommerce functions** - check documentation
❌ **Don't access database directly** - use WooCommerce CRUD classes
❌ **Don't ignore HPOS compatibility** - declare it explicitly
❌ **Don't hardcode text** - use translation functions
❌ **Don't skip nonce verification** on form submissions
❌ **Don't forget capability checks** for admin functions
❌ **Don't use global `$post`** - use WooCommerce objects
❌ **Don't break backward compatibility** without version checks

---

## Security Considerations

### Nonce Verification

```php
<?php
/**
 * Process custom form with nonce verification
 */
function my_plugin_process_custom_form() {
    // Verify nonce
    if ( ! isset( $_POST['my_plugin_nonce'] ) ||
         ! wp_verify_nonce( $_POST['my_plugin_nonce'], 'my_plugin_action' ) ) {
        wp_die( __( 'Security check failed.', 'my-plugin' ) );
    }

    // Process form
    $custom_field = sanitize_text_field( $_POST['custom_field'] );
    // ...
}
```

### Capability Checks

```php
<?php
/**
 * Admin action with capability check
 */
function my_plugin_admin_action() {
    // Check user capabilities
    if ( ! current_user_can( 'manage_woocommerce' ) ) {
        wp_die( __( 'You do not have permission to perform this action.', 'my-plugin' ) );
    }

    // Perform admin action
    // ...
}
```

### Data Sanitization

```php
<?php
// Text input
$text = sanitize_text_field( $_POST['text_field'] );

// Email
$email = sanitize_email( $_POST['email_field'] );

// URL
$url = esc_url_raw( $_POST['url_field'] );

// Integer
$number = absint( $_POST['number_field'] );

// Array
$array = array_map( 'sanitize_text_field', $_POST['array_field'] );
```

---

## Performance Optimization

### Cache Product Data

```php
<?php
/**
 * Get product data with caching
 */
function my_plugin_get_product_data( $product_id ) {
    $cache_key = 'my_plugin_product_' . $product_id;
    $data = wp_cache_get( $cache_key );

    if ( false === $data ) {
        $product = wc_get_product( $product_id );

        $data = array(
            'id'    => $product->get_id(),
            'name'  => $product->get_name(),
            'price' => $product->get_price(),
        );

        wp_cache_set( $cache_key, $data, '', HOUR_IN_SECONDS );
    }

    return $data;
}
```

### Optimize Database Queries

```php
<?php
/**
 * Get products efficiently
 */
function my_plugin_get_products() {
    $args = array(
        'limit'  => 10,
        'status' => 'publish',
        'return' => 'ids', // Return only IDs for better performance
    );

    $products = wc_get_products( $args );

    return $products;
}
```

---

## Testing

### Unit Test Example

```php
<?php
/**
 * Test custom product field
 */
class Test_Custom_Product_Field extends WP_UnitTestCase {

    public function test_save_custom_product_field() {
        $product = WC_Helper_Product::create_simple_product();

        update_post_meta( $product->get_id(), '_custom_product_field', 'test value' );

        $saved_value = get_post_meta( $product->get_id(), '_custom_product_field', true );

        $this->assertEquals( 'test value', $saved_value );
    }
}
```

---

## Common Hooks Reference

### Product Hooks

- `woocommerce_product_options_general_product_data` - Add fields to product general tab
- `woocommerce_process_product_meta` - Save product meta data
- `woocommerce_single_product_summary` - Add content to product page
- `woocommerce_product_tabs` - Add/modify product tabs

### Cart Hooks

- `woocommerce_add_cart_item_data` - Add custom cart item data
- `woocommerce_get_item_data` - Display cart item data
- `woocommerce_before_calculate_totals` - Modify cart totals

### Checkout Hooks

- `woocommerce_checkout_fields` - Add/modify checkout fields
- `woocommerce_checkout_process` - Validate checkout fields
- `woocommerce_checkout_update_order_meta` - Save checkout field data

### Order Hooks

- `woocommerce_new_order` - Order created
- `woocommerce_order_status_changed` - Order status changed
- `woocommerce_order_status_completed` - Order completed
- `woocommerce_checkout_create_order_line_item` - Save order item meta

---

## Resources

- [WooCommerce Developer Documentation](https://woocommerce.com/document/create-a-plugin/)
- [WooCommerce Code Reference](https://woocommerce.github.io/code-reference/)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WooCommerce GitHub](https://github.com/woocommerce/woocommerce)
```
```


