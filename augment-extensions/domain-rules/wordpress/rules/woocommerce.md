# WooCommerce Customization Workflow

## Overview

This document provides workflows for customizing WooCommerce, the most popular WordPress eCommerce plugin.

## Workflow 1: Template Overrides

### Step 1: Locate WooCommerce Template

WooCommerce templates are located in:
```
wp-content/plugins/woocommerce/templates/
```

Common templates:
- `single-product.php` - Single product page
- `archive-product.php` - Product archive
- `cart/cart.php` - Shopping cart
- `checkout/form-checkout.php` - Checkout form
- `myaccount/my-account.php` - My Account page

### Step 2: Copy Template to Theme

Create directory structure in your theme:
```
your-theme/
└── woocommerce/
    ├── single-product.php
    ├── archive-product.php
    ├── cart/
    │   └── cart.php
    └── checkout/
        └── form-checkout.php
```

Copy the template from WooCommerce plugin to your theme:
```bash
cp wp-content/plugins/woocommerce/templates/single-product.php \
   wp-content/themes/your-theme/woocommerce/single-product.php
```

### Step 3: Customize Template

Edit the copied template in your theme. WordPress will use your theme's version instead of the plugin's version.

**Example - Customize single product title**:
```php
<?php
/**
 * Single Product Title
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

the_title( '<h1 class="product_title entry-title custom-product-title">', '</h1>' );
```

## Workflow 2: Add Custom Product Fields

### Step 1: Add Custom Field to Product

**functions.php**:
```php
/**
 * Add custom field to product general tab
 */
function add_custom_product_field() {
    woocommerce_wp_text_input(
        array(
            'id'          => '_custom_product_field',
            'label'       => __( 'Custom Field', 'your-theme' ),
            'placeholder' => __( 'Enter custom value', 'your-theme' ),
            'desc_tip'    => true,
            'description' => __( 'This is a custom field.', 'your-theme' ),
        )
    );
}
add_action( 'woocommerce_product_options_general_product_data', 'add_custom_product_field' );
```

### Step 2: Save Custom Field

```php
/**
 * Save custom field value
 */
function save_custom_product_field( $post_id ) {
    $custom_field = isset( $_POST['_custom_product_field'] ) ? sanitize_text_field( $_POST['_custom_product_field'] ) : '';
    update_post_meta( $post_id, '_custom_product_field', $custom_field );
}
add_action( 'woocommerce_process_product_meta', 'save_custom_product_field' );
```

### Step 3: Display Custom Field on Frontend

```php
/**
 * Display custom field on product page
 */
function display_custom_product_field() {
    global $post;
    
    $custom_field = get_post_meta( $post->ID, '_custom_product_field', true );
    
    if ( $custom_field ) {
        echo '<div class="custom-product-field">';
        echo '<strong>' . esc_html__( 'Custom Field:', 'your-theme' ) . '</strong> ';
        echo esc_html( $custom_field );
        echo '</div>';
    }
}
add_action( 'woocommerce_single_product_summary', 'display_custom_product_field', 25 );
```

## Workflow 3: Customize Checkout

### Add Custom Checkout Field

```php
/**
 * Add custom field to checkout
 */
function add_custom_checkout_field( $fields ) {
    $fields['billing']['billing_custom_field'] = array(
        'type'        => 'text',
        'label'       => __( 'Custom Field', 'your-theme' ),
        'placeholder' => __( 'Enter value', 'your-theme' ),
        'required'    => true,
        'class'       => array( 'form-row-wide' ),
        'clear'       => true,
        'priority'    => 100,
    );
    
    return $fields;
}
add_filter( 'woocommerce_checkout_fields', 'add_custom_checkout_field' );
```

### Validate Custom Checkout Field

```php
/**
 * Validate custom checkout field
 */
function validate_custom_checkout_field() {
    if ( empty( $_POST['billing_custom_field'] ) ) {
        wc_add_notice( __( 'Please enter a value for Custom Field.', 'your-theme' ), 'error' );
    }
}
add_action( 'woocommerce_checkout_process', 'validate_custom_checkout_field' );
```

### Save Custom Checkout Field

```php
/**
 * Save custom checkout field to order meta
 */
function save_custom_checkout_field( $order_id ) {
    if ( ! empty( $_POST['billing_custom_field'] ) ) {
        update_post_meta( $order_id, '_billing_custom_field', sanitize_text_field( $_POST['billing_custom_field'] ) );
    }
}
add_action( 'woocommerce_checkout_update_order_meta', 'save_custom_checkout_field' );
```

### Display Custom Field in Admin Order

```php
/**
 * Display custom field in admin order
 */
function display_custom_field_in_admin_order( $order ) {
    $custom_field = get_post_meta( $order->get_id(), '_billing_custom_field', true );
    
    if ( $custom_field ) {
        echo '<p><strong>' . esc_html__( 'Custom Field:', 'your-theme' ) . '</strong> ' . esc_html( $custom_field ) . '</p>';
    }
}
add_action( 'woocommerce_admin_order_data_after_billing_address', 'display_custom_field_in_admin_order' );
```

## Workflow 4: Customize Email Templates

### Step 1: Copy Email Template to Theme

Create directory structure:
```
your-theme/
└── woocommerce/
    └── emails/
        ├── customer-completed-order.php
        └── admin-new-order.php
```

Copy template:
```bash
cp wp-content/plugins/woocommerce/templates/emails/customer-completed-order.php \
   wp-content/themes/your-theme/woocommerce/emails/customer-completed-order.php
```

### Step 2: Customize Email Template

Edit the template to add custom content:

```php
<?php
/**
 * Customer completed order email
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

do_action( 'woocommerce_email_header', $email_heading, $email );

?>

<p><?php esc_html_e( 'Hi there. Your order has been completed!', 'your-theme' ); ?></p>

<!-- Custom content here -->
<div class="custom-email-section">
    <h2><?php esc_html_e( 'Thank you for your purchase!', 'your-theme' ); ?></h2>
    <p><?php esc_html_e( 'We appreciate your business.', 'your-theme' ); ?></p>
</div>

<?php

do_action( 'woocommerce_email_order_details', $order, $sent_to_admin, $plain_text, $email );
do_action( 'woocommerce_email_order_meta', $order, $sent_to_admin, $plain_text, $email );
do_action( 'woocommerce_email_customer_details', $order, $sent_to_admin, $plain_text, $email );
do_action( 'woocommerce_email_footer', $email );
```

### Step 3: Add Custom Content to Emails

```php
/**
 * Add custom content to order emails
 */
function add_custom_email_content( $order, $sent_to_admin, $plain_text, $email ) {
    if ( $plain_text ) {
        echo "\n" . __( 'Custom message for plain text emails', 'your-theme' ) . "\n";
    } else {
        echo '<div class="custom-email-content">';
        echo '<p>' . esc_html__( 'Custom message for HTML emails', 'your-theme' ) . '</p>';
        echo '</div>';
    }
}
add_action( 'woocommerce_email_before_order_table', 'add_custom_email_content', 10, 4 );
```

## Workflow 5: Payment Gateway Integration

### Create Custom Payment Gateway

**includes/class-custom-gateway.php**:
```php
<?php
/**
 * Custom Payment Gateway
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class WC_Custom_Gateway extends WC_Payment_Gateway {
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->id                 = 'custom_gateway';
        $this->icon               = '';
        $this->has_fields         = true;
        $this->method_title       = __( 'Custom Gateway', 'your-theme' );
        $this->method_description = __( 'Custom payment gateway description', 'your-theme' );
        
        // Load settings
        $this->init_form_fields();
        $this->init_settings();
        
        // Get settings
        $this->title       = $this->get_option( 'title' );
        $this->description = $this->get_option( 'description' );
        $this->enabled     = $this->get_option( 'enabled' );
        
        // Actions
        add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, array( $this, 'process_admin_options' ) );
    }
    
    /**
     * Initialize form fields
     */
    public function init_form_fields() {
        $this->form_fields = array(
            'enabled' => array(
                'title'   => __( 'Enable/Disable', 'your-theme' ),
                'type'    => 'checkbox',
                'label'   => __( 'Enable Custom Gateway', 'your-theme' ),
                'default' => 'no',
            ),
            'title' => array(
                'title'       => __( 'Title', 'your-theme' ),
                'type'        => 'text',
                'description' => __( 'Payment method title', 'your-theme' ),
                'default'     => __( 'Custom Payment', 'your-theme' ),
                'desc_tip'    => true,
            ),
            'description' => array(
                'title'       => __( 'Description', 'your-theme' ),
                'type'        => 'textarea',
                'description' => __( 'Payment method description', 'your-theme' ),
                'default'     => __( 'Pay with custom gateway', 'your-theme' ),
            ),
        );
    }
    
    /**
     * Process payment
     */
    public function process_payment( $order_id ) {
        $order = wc_get_order( $order_id );
        
        // Process payment here
        // ...
        
        // Mark order as processing or completed
        $order->payment_complete();
        
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
```

### Register Payment Gateway

**functions.php**:
```php
/**
 * Add custom payment gateway
 */
function add_custom_payment_gateway( $gateways ) {
    $gateways[] = 'WC_Custom_Gateway';
    return $gateways;
}
add_filter( 'woocommerce_payment_gateways', 'add_custom_payment_gateway' );

/**
 * Load custom gateway class
 */
function load_custom_gateway_class() {
    require_once get_template_directory() . '/includes/class-custom-gateway.php';
}
add_action( 'plugins_loaded', 'load_custom_gateway_class' );
```

## Workflow 6: Customize Product Loop

### Modify Products Per Page

```php
/**
 * Change number of products per page
 */
function custom_products_per_page( $cols ) {
    return 12;
}
add_filter( 'loop_shop_per_page', 'custom_products_per_page', 20 );
```

### Modify Product Loop Columns

```php
/**
 * Change number of product columns
 */
function custom_product_columns( $columns ) {
    return 4;
}
add_filter( 'loop_shop_columns', 'custom_product_columns' );
```

### Add Custom Content to Product Loop

```php
/**
 * Add custom badge to products on sale
 */
function add_sale_badge() {
    global $product;
    
    if ( $product->is_on_sale() ) {
        echo '<span class="sale-badge">' . esc_html__( 'Sale!', 'your-theme' ) . '</span>';
    }
}
add_action( 'woocommerce_before_shop_loop_item_title', 'add_sale_badge', 10 );
```

## Best Practices

### DO

✅ Use child themes for customizations  
✅ Copy templates to theme, don't modify plugin files  
✅ Use WooCommerce hooks and filters  
✅ Sanitize and validate all input  
✅ Escape all output  
✅ Test with WooCommerce updates  
✅ Follow WooCommerce coding standards  
✅ Use translation functions  
✅ Check WooCommerce is active before using functions  
✅ Document customizations

### DON'T

❌ Modify WooCommerce plugin files directly  
❌ Ignore template version compatibility  
❌ Skip input validation  
❌ Hardcode values  
❌ Use deprecated WooCommerce functions  
❌ Forget to test checkout process  
❌ Ignore mobile responsiveness  
❌ Skip security best practices  
❌ Forget to handle edge cases

