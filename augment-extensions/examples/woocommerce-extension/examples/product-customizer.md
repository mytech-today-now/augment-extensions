# WooCommerce Product Customizer Example

## Overview

This example demonstrates a complete **WooCommerce Product Extension** with custom product fields, meta data storage, frontend display, cart integration, order item meta, and admin interfaces.

**Complexity**: Medium  
**File Count**: 5-8 files  
**Team Size**: 1-2 developers  
**Use Case**: Product customization, custom fields, personalization, gift messages, engraving

---

## Complete Plugin: "Product Customizer"

A comprehensive WooCommerce extension demonstrating custom product fields, cart item data, order meta, and admin product editing with HPOS compatibility.

---

## Directory Structure

```
product-customizer/
├── product-customizer.php         # Main plugin file
├── includes/
│   ├── class-product-fields.php   # Product field management
│   ├── class-cart-handler.php     # Cart integration
│   └── class-order-handler.php    # Order meta handling
├── templates/
│   └── product-fields.php         # Frontend template
└── readme.txt                     # WordPress.org readme
```

---

## Main Plugin File

### File: `product-customizer.php`

```php
<?php
/**
 * Plugin Name: Product Customizer
 * Plugin URI: https://example.com/product-customizer
 * Description: Add custom fields to WooCommerce products for personalization
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 6.0
 * WC tested up to: 8.5
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: product-customizer
 *
 * @package Product_Customizer
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('PC_VERSION', '1.0.0');
define('PC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('PC_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Check if WooCommerce is active
 */
function pc_check_woocommerce() {
    if (!class_exists('WooCommerce')) {
        add_action('admin_notices', function() {
            ?>
            <div class="notice notice-error">
                <p><?php _e('Product Customizer requires WooCommerce to be installed and active.', 'product-customizer'); ?></p>
            </div>
            <?php
        });
        return false;
    }
    return true;
}

/**
 * Declare HPOS compatibility
 */
add_action('before_woocommerce_init', function() {
    if (class_exists(\Automattic\WooCommerce\Utilities\FeaturesUtil::class)) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'custom_order_tables',
            __FILE__,
            true
        );
    }
});

/**
 * Autoloader for plugin classes
 */
spl_autoload_register(function ($class) {
    $prefix = 'PC_';
    $base_dir = PC_PLUGIN_DIR . 'includes/';
    
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    $relative_class = substr($class, $len);
    $file = $base_dir . 'class-' . str_replace('_', '-', strtolower($relative_class)) . '.php';
    
    if (file_exists($file)) {
        require $file;
    }
});

/**
 * Initialize plugin
 */
function pc_init() {
    if (!pc_check_woocommerce()) {
        return;
    }
    
    // Initialize classes
    new PC_Product_Fields();
    new PC_Cart_Handler();
    new PC_Order_Handler();
}
add_action('plugins_loaded', 'pc_init');

/**
 * Load plugin text domain
 */
function pc_load_textdomain() {
    load_plugin_textdomain(
        'product-customizer',
        false,
        dirname(plugin_basename(__FILE__)) . '/languages'
    );
}
add_action('init', 'pc_load_textdomain');

/**
 * Activation hook
 */
register_activation_hook(__FILE__, function() {
    if (!class_exists('WooCommerce')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(__('Product Customizer requires WooCommerce to be installed and active.', 'product-customizer'));
    }
});
```

---

## Product Fields Class

### File: `includes/class-product-fields.php`

```php
<?php
/**
 * Product Fields
 *
 * @package Product_Customizer
 */

class PC_Product_Fields {
    
    /**
     * Constructor
     */
    public function __construct() {
        // Admin: Add product fields
        add_action('woocommerce_product_options_general_product_data', array($this, 'add_product_fields'));
        add_action('woocommerce_process_product_meta', array($this, 'save_product_fields'));
        
        // Frontend: Display custom fields
        add_action('woocommerce_before_add_to_cart_button', array($this, 'display_custom_fields'));
    }

    /**
     * Add custom fields to product admin
     */
    public function add_product_fields() {
        global $post;

        echo '<div class="options_group">';

        // Enable customization checkbox
        woocommerce_wp_checkbox(array(
            'id'          => '_enable_customization',
            'label'       => __('Enable Customization', 'product-customizer'),
            'description' => __('Allow customers to add custom text to this product.', 'product-customizer'),
        ));

        // Customization label
        woocommerce_wp_text_input(array(
            'id'          => '_customization_label',
            'label'       => __('Customization Label', 'product-customizer'),
            'placeholder' => __('Enter your custom text', 'product-customizer'),
            'desc_tip'    => true,
            'description' => __('Label shown to customers for the custom field.', 'product-customizer'),
        ));

        // Max characters
        woocommerce_wp_text_input(array(
            'id'          => '_customization_max_chars',
            'label'       => __('Max Characters', 'product-customizer'),
            'placeholder' => '50',
            'type'        => 'number',
            'desc_tip'    => true,
            'description' => __('Maximum number of characters allowed.', 'product-customizer'),
            'custom_attributes' => array(
                'min'  => '1',
                'step' => '1',
            ),
        ));

        // Additional price for customization
        woocommerce_wp_text_input(array(
            'id'          => '_customization_price',
            'label'       => __('Customization Price', 'product-customizer') . ' (' . get_woocommerce_currency_symbol() . ')',
            'placeholder' => '0.00',
            'type'        => 'number',
            'desc_tip'    => true,
            'description' => __('Additional price for customization.', 'product-customizer'),
            'custom_attributes' => array(
                'min'  => '0',
                'step' => '0.01',
            ),
        ));

        echo '</div>';
    }

    /**
     * Save custom product fields
     *
     * @param int $post_id Product ID.
     */
    public function save_product_fields($post_id) {
        $enable_customization = isset($_POST['_enable_customization']) ? 'yes' : 'no';
        update_post_meta($post_id, '_enable_customization', $enable_customization);

        if (isset($_POST['_customization_label'])) {
            update_post_meta($post_id, '_customization_label', sanitize_text_field($_POST['_customization_label']));
        }

        if (isset($_POST['_customization_max_chars'])) {
            update_post_meta($post_id, '_customization_max_chars', absint($_POST['_customization_max_chars']));
        }

        if (isset($_POST['_customization_price'])) {
            update_post_meta($post_id, '_customization_price', floatval($_POST['_customization_price']));
        }
    }

    /**
     * Display custom fields on product page
     */
    public function display_custom_fields() {
        global $product;

        $enable_customization = get_post_meta($product->get_id(), '_enable_customization', true);

        if ($enable_customization !== 'yes') {
            return;
        }

        $label = get_post_meta($product->get_id(), '_customization_label', true);
        $max_chars = get_post_meta($product->get_id(), '_customization_max_chars', true);
        $price = get_post_meta($product->get_id(), '_customization_price', true);

        $label = $label ?: __('Custom Text', 'product-customizer');
        $max_chars = $max_chars ?: 50;

        wc_get_template(
            'product-fields.php',
            array(
                'label'     => $label,
                'max_chars' => $max_chars,
                'price'     => $price,
            ),
            '',
            PC_PLUGIN_DIR . 'templates/'
        );
    }
}
```

---

## Cart Handler Class

### File: `includes/class-cart-handler.php`

```php
<?php
/**
 * Cart Handler
 *
 * @package Product_Customizer
 */

class PC_Cart_Handler {

    /**
     * Constructor
     */
    public function __construct() {
        // Add custom data to cart item
        add_filter('woocommerce_add_cart_item_data', array($this, 'add_cart_item_data'), 10, 3);

        // Display custom data in cart
        add_filter('woocommerce_get_item_data', array($this, 'display_cart_item_data'), 10, 2);

        // Adjust cart item price
        add_action('woocommerce_before_calculate_totals', array($this, 'adjust_cart_item_price'));

        // Validate custom field
        add_filter('woocommerce_add_to_cart_validation', array($this, 'validate_custom_field'), 10, 3);
    }

    /**
     * Add custom data to cart item
     *
     * @param array $cart_item_data Cart item data.
     * @param int   $product_id     Product ID.
     * @param int   $variation_id   Variation ID.
     * @return array Modified cart item data.
     */
    public function add_cart_item_data($cart_item_data, $product_id, $variation_id) {
        if (isset($_POST['custom_text']) && !empty($_POST['custom_text'])) {
            $cart_item_data['custom_text'] = sanitize_text_field($_POST['custom_text']);
        }

        return $cart_item_data;
    }

    /**
     * Display custom data in cart
     *
     * @param array $item_data Item data.
     * @param array $cart_item Cart item.
     * @return array Modified item data.
     */
    public function display_cart_item_data($item_data, $cart_item) {
        if (isset($cart_item['custom_text'])) {
            $item_data[] = array(
                'key'   => __('Custom Text', 'product-customizer'),
                'value' => wc_clean($cart_item['custom_text']),
            );
        }

        return $item_data;
    }

    /**
     * Adjust cart item price
     *
     * @param WC_Cart $cart Cart object.
     */
    public function adjust_cart_item_price($cart) {
        if (is_admin() && !defined('DOING_AJAX')) {
            return;
        }

        foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
            if (isset($cart_item['custom_text'])) {
                $product_id = $cart_item['product_id'];
                $customization_price = get_post_meta($product_id, '_customization_price', true);

                if ($customization_price > 0) {
                    $new_price = $cart_item['data']->get_price() + floatval($customization_price);
                    $cart_item['data']->set_price($new_price);
                }
            }
        }
    }

    /**
     * Validate custom field
     *
     * @param bool $passed      Validation status.
     * @param int  $product_id  Product ID.
     * @param int  $quantity    Quantity.
     * @return bool Validation status.
     */
    public function validate_custom_field($passed, $product_id, $quantity) {
        $enable_customization = get_post_meta($product_id, '_enable_customization', true);

        if ($enable_customization !== 'yes') {
            return $passed;
        }

        if (!isset($_POST['custom_text']) || empty($_POST['custom_text'])) {
            wc_add_notice(__('Please enter custom text.', 'product-customizer'), 'error');
            return false;
        }

        $max_chars = get_post_meta($product_id, '_customization_max_chars', true);
        $max_chars = $max_chars ?: 50;

        if (strlen($_POST['custom_text']) > $max_chars) {
            wc_add_notice(
                sprintf(
                    __('Custom text must be %d characters or less.', 'product-customizer'),
                    $max_chars
                ),
                'error'
            );
            return false;
        }

        return $passed;
    }
}
```

---

## Order Handler Class

### File: `includes/class-order-handler.php`

```php
<?php
/**
 * Order Handler
 *
 * @package Product_Customizer
 */

class PC_Order_Handler {

    /**
     * Constructor
     */
    public function __construct() {
        // Save custom data to order item meta
        add_action('woocommerce_checkout_create_order_line_item', array($this, 'save_order_item_meta'), 10, 4);

        // Display custom data in admin order
        add_action('woocommerce_before_order_itemmeta', array($this, 'display_order_item_meta'), 10, 3);

        // Display custom data in emails
        add_filter('woocommerce_order_item_display_meta_key', array($this, 'format_meta_key'), 10, 3);
    }

    /**
     * Save custom data to order item meta
     *
     * @param WC_Order_Item_Product $item          Order item.
     * @param string                $cart_item_key Cart item key.
     * @param array                 $values        Cart item values.
     * @param WC_Order              $order         Order object.
     */
    public function save_order_item_meta($item, $cart_item_key, $values, $order) {
        if (isset($values['custom_text'])) {
            $item->add_meta_data(__('Custom Text', 'product-customizer'), $values['custom_text'], true);
        }
    }

    /**
     * Display custom data in admin order
     *
     * @param int           $item_id Order item ID.
     * @param WC_Order_Item $item    Order item.
     * @param WC_Product    $product Product object.
     */
    public function display_order_item_meta($item_id, $item, $product) {
        $custom_text = $item->get_meta('Custom Text');

        if ($custom_text) {
            echo '<div class="wc-order-item-custom-text">';
            echo '<strong>' . __('Custom Text:', 'product-customizer') . '</strong> ';
            echo esc_html($custom_text);
            echo '</div>';
        }
    }

    /**
     * Format meta key for display
     *
     * @param string        $display_key Meta key.
     * @param WC_Meta_Data  $meta        Meta data object.
     * @param WC_Order_Item $item        Order item.
     * @return string Formatted meta key.
     */
    public function format_meta_key($display_key, $meta, $item) {
        if ($meta->key === 'Custom Text') {
            return __('Custom Text', 'product-customizer');
        }

        return $display_key;
    }
}
```

---

## Frontend Template

### File: `templates/product-fields.php`

```php
<?php
/**
 * Product Custom Fields Template
 *
 * @package Product_Customizer
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="product-customizer-fields">
    <div class="custom-field-wrapper">
        <label for="custom_text">
            <?php echo esc_html($label); ?>
            <?php if ($price > 0) : ?>
                <span class="custom-field-price">
                    (+<?php echo wc_price($price); ?>)
                </span>
            <?php endif; ?>
        </label>

        <input
            type="text"
            id="custom_text"
            name="custom_text"
            class="custom-text-input"
            maxlength="<?php echo esc_attr($max_chars); ?>"
            placeholder="<?php echo esc_attr($label); ?>"
            required
        />

        <span class="char-counter">
            <span class="current-chars">0</span> / <?php echo esc_html($max_chars); ?> <?php _e('characters', 'product-customizer'); ?>
        </span>
    </div>
</div>

<style>
.product-customizer-fields {
    margin: 20px 0;
    padding: 15px;
    background: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.custom-field-wrapper label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
}

.custom-field-price {
    color: #77a464;
    font-weight: normal;
}

.custom-text-input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.char-counter {
    display: block;
    margin-top: 5px;
    font-size: 12px;
    color: #666;
}

.char-counter .current-chars {
    font-weight: 600;
}
</style>

<script>
(function() {
    'use strict';

    const input = document.getElementById('custom_text');
    const counter = document.querySelector('.current-chars');

    if (input && counter) {
        input.addEventListener('input', function() {
            counter.textContent = this.value.length;
        });
    }
})();
</script>
```

---

## Key Features Demonstrated

### 1. **Admin Product Fields**
- ✅ Custom checkbox field
- ✅ Text input fields
- ✅ Number input fields
- ✅ Field validation
- ✅ Meta data storage

### 2. **Frontend Display**
- ✅ Custom template
- ✅ Character counter
- ✅ Price display
- ✅ Inline styles and scripts

### 3. **Cart Integration**
- ✅ Add custom data to cart
- ✅ Display in cart
- ✅ Price adjustment
- ✅ Validation

### 4. **Order Management**
- ✅ Save to order item meta
- ✅ Display in admin order
- ✅ Display in emails
- ✅ HPOS compatible

### 5. **WooCommerce Best Practices**
- ✅ HPOS compatibility declaration
- ✅ WooCommerce dependency check
- ✅ Proper hooks and filters
- ✅ Sanitization and escaping
- ✅ Translation ready

---

## Usage Examples

### Enable Customization for a Product

1. Edit product in WordPress admin
2. Scroll to "Product Data" meta box
3. Check "Enable Customization"
4. Set customization label (e.g., "Engraving Text")
5. Set max characters (e.g., 50)
6. Set additional price (e.g., 5.00)
7. Save product

### Customer Experience

1. Customer views product page
2. Sees custom text field with character counter
3. Enters custom text (validated on add to cart)
4. Adds to cart (price adjusted if customization price set)
5. Custom text shown in cart, checkout, and order

### Admin Order View

1. View order in admin
2. Custom text displayed with order item
3. Visible in order emails
4. Stored in order item meta

---

## Extending the Example

### Add More Field Types

```php
// Add select field
woocommerce_wp_select(array(
    'id'      => '_customization_type',
    'label'   => __('Customization Type', 'product-customizer'),
    'options' => array(
        'engraving' => __('Engraving', 'product-customizer'),
        'printing'  => __('Printing', 'product-customizer'),
        'embossing' => __('Embossing', 'product-customizer'),
    ),
));
```

### Add Image Upload

```php
// Add image upload field
add_action('woocommerce_before_add_to_cart_button', function() {
    ?>
    <div class="custom-image-upload">
        <label><?php _e('Upload Custom Image', 'product-customizer'); ?></label>
        <input type="file" name="custom_image" accept="image/*" />
    </div>
    <?php
});
```

### Add Preview

```php
// Add live preview
add_action('woocommerce_before_add_to_cart_button', function() {
    ?>
    <div class="customization-preview">
        <h4><?php _e('Preview', 'product-customizer'); ?></h4>
        <div id="preview-text"></div>
    </div>
    <script>
    document.getElementById('custom_text').addEventListener('input', function() {
        document.getElementById('preview-text').textContent = this.value;
    });
    </script>
    <?php
});
```

---

## Testing Checklist

- [ ] Product fields save correctly in admin
- [ ] Custom fields display on product page
- [ ] Validation works (required, max length)
- [ ] Custom data added to cart
- [ ] Price adjustment works
- [ ] Custom data saved to order
- [ ] Custom data displays in admin order
- [ ] Custom data displays in emails
- [ ] HPOS compatibility verified
- [ ] Translation strings work

---

## Best Practices Demonstrated

1. **HPOS Compatibility** - Declared compatibility with custom order tables
2. **WooCommerce Dependency** - Check for WooCommerce before activation
3. **Proper Hooks** - Use WooCommerce hooks and filters
4. **Sanitization** - All input sanitized
5. **Escaping** - All output escaped
6. **Translation Ready** - All strings translatable
7. **Template System** - Use WooCommerce template system
8. **Meta Data** - Proper meta data storage and retrieval

---

## Next Steps

1. Add more field types (select, checkbox, radio, file upload)
2. Add conditional logic (show/hide fields based on product type)
3. Add preview functionality
4. Add admin settings page
5. Add bulk editing for multiple products
6. Add import/export for customization settings
7. Add REST API endpoints for customization data

