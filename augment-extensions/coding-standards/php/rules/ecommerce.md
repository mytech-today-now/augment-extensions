# PHP E-commerce Development Best Practices

## Overview

This guide provides best practices for developing e-commerce systems in PHP, including shopping cart management, payment gateway integration, order processing, WooCommerce development, and PCI DSS compliance.

## Shopping Cart Management

### Cart Session Handling

```php
<?php

namespace App\Services;

class CartService
{
    private $session;
    
    public function __construct(SessionInterface $session)
    {
        $this->session = $session;
    }
    
    public function addItem(int $productId, int $quantity = 1, array $options = []): void
    {
        $cart = $this->getCart();
        
        $itemKey = $this->generateItemKey($productId, $options);
        
        if (isset($cart[$itemKey])) {
            $cart[$itemKey]['quantity'] += $quantity;
        } else {
            $cart[$itemKey] = [
                'product_id' => $productId,
                'quantity' => $quantity,
                'options' => $options,
                'added_at' => time()
            ];
        }
        
        $this->saveCart($cart);
    }
    
    public function removeItem(string $itemKey): void
    {
        $cart = $this->getCart();
        unset($cart[$itemKey]);
        $this->saveCart($cart);
    }
    
    public function updateQuantity(string $itemKey, int $quantity): void
    {
        $cart = $this->getCart();
        
        if ($quantity <= 0) {
            $this->removeItem($itemKey);
            return;
        }
        
        if (isset($cart[$itemKey])) {
            $cart[$itemKey]['quantity'] = $quantity;
            $this->saveCart($cart);
        }
    }
    
    public function getCart(): array
    {
        return $this->session->get('cart', []);
    }
    
    public function clear(): void
    {
        $this->session->remove('cart');
    }
    
    public function getTotal(): float
    {
        $cart = $this->getCart();
        $total = 0.0;
        
        foreach ($cart as $item) {
            $product = Product::find($item['product_id']);
            $total += $product->price * $item['quantity'];
        }
        
        return $total;
    }
    
    private function generateItemKey(int $productId, array $options): string
    {
        ksort($options);
        return md5($productId . json_encode($options));
    }
    
    private function saveCart(array $cart): void
    {
        $this->session->put('cart', $cart);
    }
}
```

### Stock Validation

```php
<?php

class StockValidator
{
    public function validateCartStock(array $cart): array
    {
        $errors = [];
        
        foreach ($cart as $itemKey => $item) {
            $product = Product::find($item['product_id']);
            
            if (!$product) {
                $errors[$itemKey] = 'Product not found';
                continue;
            }
            
            if (!$product->is_available) {
                $errors[$itemKey] = 'Product is no longer available';
                continue;
            }
            
            if ($product->stock < $item['quantity']) {
                $errors[$itemKey] = "Only {$product->stock} items available";
            }
        }
        
        return $errors;
    }
    
    public function reserveStock(Order $order): void
    {
        DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                
                if ($product->stock < $item->quantity) {
                    throw new InsufficientStockException(
                        "Insufficient stock for product: {$product->name}"
                    );
                }
                
                $product->decrement('stock', $item->quantity);
            }
        });
    }
}
```

## Payment Gateway Integration

### Payment Interface

```php
<?php

namespace App\Payments;

interface PaymentGatewayInterface
{
    public function charge(float $amount, string $currency, array $paymentMethod): PaymentResult;
    public function refund(string $transactionId, float $amount): RefundResult;
    public function getTransaction(string $transactionId): Transaction;
}

class PaymentResult
{
    public function __construct(
        public bool $success,
        public ?string $transactionId,
        public ?string $errorMessage = null
    ) {}
}
```

### Stripe Integration

```php
<?php

namespace App\Payments;

use Stripe\StripeClient;
use Stripe\Exception\ApiErrorException;

class StripeGateway implements PaymentGatewayInterface
{
    private StripeClient $stripe;
    
    public function __construct(string $apiKey)
    {
        $this->stripe = new StripeClient($apiKey);
    }
    
    public function charge(float $amount, string $currency, array $paymentMethod): PaymentResult
    {
        try {
            $intent = $this->stripe->paymentIntents->create([
                'amount' => (int)($amount * 100), // Convert to cents
                'currency' => $currency,
                'payment_method' => $paymentMethod['id'],
                'confirm' => true,
                'metadata' => [
                    'order_id' => $paymentMethod['order_id'] ?? null
                ]
            ]);
            
            return new PaymentResult(
                success: $intent->status === 'succeeded',
                transactionId: $intent->id
            );
            
        } catch (ApiErrorException $e) {
            return new PaymentResult(
                success: false,
                transactionId: null,
                errorMessage: $e->getMessage()
            );
        }
    }
    
    public function refund(string $transactionId, float $amount): RefundResult
    {
        try {
            $refund = $this->stripe->refunds->create([
                'payment_intent' => $transactionId,
                'amount' => (int)($amount * 100)
            ]);
            
            return new RefundResult(
                success: $refund->status === 'succeeded',
                refundId: $refund->id
            );
            
        } catch (ApiErrorException $e) {
            return new RefundResult(
                success: false,
                refundId: null,
                errorMessage: $e->getMessage()
            );
        }
    }
}
```

### Secure Payment Token Handling

```php
<?php

class PaymentTokenService
{
    public function tokenizeCard(array $cardData): string
    {
        // NEVER store raw card data
        // Use payment gateway's tokenization

        $token = $this->paymentGateway->createToken([
            'card' => [
                'number' => $cardData['number'],
                'exp_month' => $cardData['exp_month'],
                'exp_year' => $cardData['exp_year'],
                'cvc' => $cardData['cvc']
            ]
        ]);

        // Store only the token, never the card details
        return $token->id;
    }

    public function chargeToken(string $token, float $amount): PaymentResult
    {
        return $this->paymentGateway->charge($amount, 'usd', [
            'id' => $token
        ]);
    }
}
```

## Order Processing

### Order Creation with Transactions

```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class OrderService
{
    public function createOrder(array $cartItems, array $customerData, array $paymentData): Order
    {
        return DB::transaction(function () use ($cartItems, $customerData, $paymentData) {
            // 1. Create order
            $order = Order::create([
                'customer_id' => $customerData['customer_id'],
                'status' => 'pending',
                'subtotal' => $this->calculateSubtotal($cartItems),
                'tax' => $this->calculateTax($cartItems),
                'shipping' => $this->calculateShipping($cartItems),
                'total' => $this->calculateTotal($cartItems)
            ]);

            // 2. Create order items
            foreach ($cartItems as $item) {
                $product = Product::lockForUpdate()->find($item['product_id']);

                // Validate stock
                if ($product->stock < $item['quantity']) {
                    throw new InsufficientStockException();
                }

                // Create order item
                $order->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'total' => $product->price * $item['quantity']
                ]);

                // Decrement stock
                $product->decrement('stock', $item['quantity']);
            }

            // 3. Process payment
            $paymentResult = $this->paymentGateway->charge(
                $order->total,
                'usd',
                $paymentData
            );

            if (!$paymentResult->success) {
                throw new PaymentFailedException($paymentResult->errorMessage);
            }

            // 4. Update order with payment info
            $order->update([
                'status' => 'paid',
                'transaction_id' => $paymentResult->transactionId,
                'paid_at' => now()
            ]);

            // 5. Send confirmation email
            $this->sendOrderConfirmation($order);

            return $order;
        });
    }
}
```

## WooCommerce Development

### Custom Product Type

```php
<?php

class WC_Product_Custom extends WC_Product
{
    public function __construct($product = 0)
    {
        $this->product_type = 'custom';
        parent::__construct($product);
    }

    public function get_type()
    {
        return 'custom';
    }

    public function is_purchasable()
    {
        return true;
    }
}

// Register product type
add_filter('product_type_selector', 'add_custom_product_type');
function add_custom_product_type($types)
{
    $types['custom'] = __('Custom Product', 'woocommerce');
    return $types;
}

add_filter('woocommerce_product_class', 'custom_product_class', 10, 2);
function custom_product_class($classname, $product_type)
{
    if ($product_type === 'custom') {
        $classname = 'WC_Product_Custom';
    }
    return $classname;
}
```

### WooCommerce Hooks

```php
<?php

// Modify cart item price
add_action('woocommerce_before_calculate_totals', 'custom_cart_item_price');
function custom_cart_item_price($cart)
{
    if (is_admin() && !defined('DOING_AJAX')) {
        return;
    }

    foreach ($cart->get_cart() as $cart_item) {
        if (isset($cart_item['custom_price'])) {
            $cart_item['data']->set_price($cart_item['custom_price']);
        }
    }
}

// Add custom order meta
add_action('woocommerce_checkout_create_order', 'save_custom_order_meta', 10, 2);
function save_custom_order_meta($order, $data)
{
    if (isset($_POST['custom_field'])) {
        $order->update_meta_data(
            '_custom_field',
            sanitize_text_field($_POST['custom_field'])
        );
    }
}

// Validate checkout fields
add_action('woocommerce_after_checkout_validation', 'custom_checkout_validation', 10, 2);
function custom_checkout_validation($data, $errors)
{
    if (empty($_POST['custom_field'])) {
        $errors->add('validation', __('Custom field is required', 'woocommerce'));
    }
}

// Modify order status
add_action('woocommerce_order_status_completed', 'custom_order_completed');
function custom_order_completed($order_id)
{
    $order = wc_get_order($order_id);

    // Send custom notification
    // Award loyalty points
    // Update inventory
}
```

### Payment Gateway Extension

```php
<?php

class WC_Gateway_Custom extends WC_Payment_Gateway
{
    public function __construct()
    {
        $this->id = 'custom_gateway';
        $this->method_title = __('Custom Gateway', 'woocommerce');
        $this->method_description = __('Custom payment gateway', 'woocommerce');
        $this->has_fields = true;

        $this->init_form_fields();
        $this->init_settings();

        $this->title = $this->get_option('title');
        $this->description = $this->get_option('description');

        add_action('woocommerce_update_options_payment_gateways_' . $this->id, [$this, 'process_admin_options']);
    }

    public function init_form_fields()
    {
        $this->form_fields = [
            'enabled' => [
                'title' => __('Enable/Disable', 'woocommerce'),
                'type' => 'checkbox',
                'label' => __('Enable Custom Gateway', 'woocommerce'),
                'default' => 'no'
            ],
            'title' => [
                'title' => __('Title', 'woocommerce'),
                'type' => 'text',
                'default' => __('Custom Payment', 'woocommerce')
            ],
            'api_key' => [
                'title' => __('API Key', 'woocommerce'),
                'type' => 'password'
            ]
        ];
    }

    public function process_payment($order_id)
    {
        $order = wc_get_order($order_id);

        try {
            // Process payment
            $result = $this->gateway->charge(
                $order->get_total(),
                $order->get_currency(),
                $_POST['payment_token']
            );

            if ($result->success) {
                $order->payment_complete($result->transactionId);

                return [
                    'result' => 'success',
                    'redirect' => $this->get_return_url($order)
                ];
            } else {
                wc_add_notice($result->errorMessage, 'error');
                return ['result' => 'failure'];
            }

        } catch (\Exception $e) {
            wc_add_notice(__('Payment error:', 'woocommerce') . ' ' . $e->getMessage(), 'error');
            return ['result' => 'failure'];
        }
    }
}

// Register gateway
add_filter('woocommerce_payment_gateways', 'add_custom_gateway');
function add_custom_gateway($gateways)
{
    $gateways[] = 'WC_Gateway_Custom';
    return $gateways;
}
```

## PCI DSS Compliance

### Security Requirements

```php
<?php

// ❌ NEVER do this - storing card data
class BadExample
{
    public function saveCard($cardNumber, $cvv, $expiry)
    {
        // NEVER STORE CARD DATA IN YOUR DATABASE
        DB::table('cards')->insert([
            'card_number' => $cardNumber,  // ❌ VIOLATION
            'cvv' => $cvv,                 // ❌ VIOLATION
            'expiry' => $expiry
        ]);
    }
}

// ✅ Correct approach - use tokenization
class GoodExample
{
    public function savePaymentMethod($customerId, $cardData)
    {
        // Use payment gateway's tokenization
        $token = $this->stripe->tokens->create([
            'card' => $cardData
        ]);

        // Store only the token
        DB::table('payment_methods')->insert([
            'customer_id' => $customerId,
            'token' => $token->id,  // ✅ Safe to store
            'last4' => $token->card->last4,
            'brand' => $token->card->brand,
            'exp_month' => $token->card->exp_month,
            'exp_year' => $token->card->exp_year
        ]);
    }
}
```

## Best Practices

### ✅ DO

- Use database transactions for order processing
- Validate stock before order creation
- Use payment gateway tokenization
- Implement idempotent order processing
- Log all payment transactions
- Send order confirmation emails
- Implement proper error handling
- Use HTTPS for all payment pages
- Validate all input data
- Implement rate limiting on checkout
- Use pessimistic locking for stock updates
- Follow PCI DSS compliance guidelines

### ❌ DON'T

- Store raw credit card data
- Process payments without validation
- Skip stock validation
- Ignore transaction failures
- Expose payment errors to users
- Use GET requests for payment processing
- Store CVV codes
- Hardcode payment credentials
- Skip order confirmation emails
- Allow negative stock values

## Security Checklist

- [ ] HTTPS enforced on all pages
- [ ] Payment data tokenized (never stored)
- [ ] PCI DSS compliance verified
- [ ] Input validation on all fields
- [ ] CSRF protection on checkout
- [ ] Rate limiting on payment endpoints
- [ ] Secure session management
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Proper error handling (no sensitive data exposure)
- [ ] Transaction logging
- [ ] Fraud detection implemented

