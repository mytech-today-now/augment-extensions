<?php
/**
 * Plugin Name: WooCommerce Custom Cart Handler
 * Plugin URI: https://example.com/woo-custom-cart
 * Description: Custom shopping cart handler with stock validation and secure payment tokenization
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * WC requires at least: 5.0
 * WC tested up to: 7.0
 * License: GPL v2 or later
 * Text Domain: woo-custom-cart
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Check if WooCommerce is active
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    return;
}

/**
 * Main Plugin Class
 */
class WC_Custom_Cart_Handler
{
    private static $instance = null;
    
    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct()
    {
        $this->init_hooks();
    }
    
    private function init_hooks()
    {
        // Cart hooks
        add_filter('woocommerce_add_to_cart_validation', [$this, 'validate_add_to_cart'], 10, 3);
        add_action('woocommerce_before_calculate_totals', [$this, 'modify_cart_prices']);
        add_action('woocommerce_check_cart_items', [$this, 'validate_cart_stock']);
        
        // Checkout hooks
        add_action('woocommerce_checkout_process', [$this, 'validate_checkout']);
        add_action('woocommerce_checkout_create_order', [$this, 'add_order_meta'], 10, 2);
        add_action('woocommerce_checkout_order_processed', [$this, 'process_order'], 10, 3);
        
        // Order status hooks
        add_action('woocommerce_order_status_completed', [$this, 'handle_order_completed']);
        add_action('woocommerce_order_status_cancelled', [$this, 'handle_order_cancelled']);
        
        // Payment hooks
        add_filter('woocommerce_payment_gateways', [$this, 'add_payment_gateway']);
    }
    
    /**
     * Validate product before adding to cart
     */
    public function validate_add_to_cart($passed, $product_id, $quantity)
    {
        $product = wc_get_product($product_id);
        
        if (!$product) {
            wc_add_notice(__('Product not found.', 'woo-custom-cart'), 'error');
            return false;
        }
        
        // Check if product is purchasable
        if (!$product->is_purchasable()) {
            wc_add_notice(__('This product cannot be purchased.', 'woo-custom-cart'), 'error');
            return false;
        }
        
        // Check stock availability
        if (!$product->has_enough_stock($quantity)) {
            wc_add_notice(
                sprintf(
                    __('Sorry, we do not have enough "%s" in stock. Only %d available.', 'woo-custom-cart'),
                    $product->get_name(),
                    $product->get_stock_quantity()
                ),
                'error'
            );
            return false;
        }
        
        // Custom validation: Check if user has already purchased this product
        if ($this->user_already_purchased($product_id)) {
            wc_add_notice(
                __('You have already purchased this product.', 'woo-custom-cart'),
                'error'
            );
            return false;
        }
        
        return $passed;
    }
    
    /**
     * Modify cart item prices based on custom logic
     */
    public function modify_cart_prices($cart)
    {
        if (is_admin() && !defined('DOING_AJAX')) {
            return;
        }
        
        foreach ($cart->get_cart() as $cart_item_key => $cart_item) {
            $product = $cart_item['data'];
            
            // Apply volume discount
            if ($cart_item['quantity'] >= 10) {
                $discount_percentage = 10; // 10% discount for 10+ items
                $original_price = $product->get_regular_price();
                $discounted_price = $original_price * (1 - $discount_percentage / 100);
                
                $product->set_price($discounted_price);
                
                // Add notice about discount
                if (!WC()->session->get('volume_discount_notice_shown')) {
                    wc_add_notice(
                        sprintf(
                            __('Volume discount applied: %d%% off!', 'woo-custom-cart'),
                            $discount_percentage
                        ),
                        'success'
                    );
                    WC()->session->set('volume_discount_notice_shown', true);
                }
            }
        }
    }
    
    /**
     * Validate cart stock before checkout
     */
    public function validate_cart_stock()
    {
        foreach (WC()->cart->get_cart() as $cart_item_key => $cart_item) {
            $product = $cart_item['data'];
            $product_id = $cart_item['product_id'];
            $quantity = $cart_item['quantity'];
            
            // Re-check stock (in case it changed since adding to cart)
            $fresh_product = wc_get_product($product_id);
            
            if (!$fresh_product->has_enough_stock($quantity)) {
                wc_add_notice(
                    sprintf(
                        __('Sorry, "%s" stock has changed. Only %d available.', 'woo-custom-cart'),
                        $product->get_name(),
                        $fresh_product->get_stock_quantity()
                    ),
                    'error'
                );
            }
        }
    }
    
    /**
     * Validate checkout fields
     */
    public function validate_checkout()
    {
        // Custom field validation
        if (empty($_POST['custom_delivery_instructions'])) {
            wc_add_notice(
                __('Please provide delivery instructions.', 'woo-custom-cart'),
                'error'
            );
        }
        
        // Validate minimum order amount
        $cart_total = WC()->cart->get_total('');
        $minimum_order = 50.00;
        
        if ($cart_total < $minimum_order) {
            wc_add_notice(
                sprintf(
                    __('Minimum order amount is $%s. Your current total is $%s.', 'woo-custom-cart'),
                    number_format($minimum_order, 2),
                    number_format($cart_total, 2)
                ),
                'error'
            );
        }
    }
    
    /**
     * Add custom meta to order
     */
    public function add_order_meta($order, $data)
    {
        if (isset($_POST['custom_delivery_instructions'])) {
            $order->update_meta_data(
                '_delivery_instructions',
                sanitize_textarea_field($_POST['custom_delivery_instructions'])
            );
        }
        
        // Add custom order number
        $custom_order_number = 'ORD-' . date('Ymd') . '-' . str_pad($order->get_id(), 6, '0', STR_PAD_LEFT);
        $order->update_meta_data('_custom_order_number', $custom_order_number);
    }
}

