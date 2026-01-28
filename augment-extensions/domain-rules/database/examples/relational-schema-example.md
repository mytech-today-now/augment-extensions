# Relational Schema Example: E-Commerce Database

## Overview

This example demonstrates a comprehensive e-commerce database schema with proper normalization, foreign keys, indexes, and constraints.

**Features:**
- User management
- Product catalog
- Shopping cart
- Order processing
- Inventory tracking
- Reviews and ratings

---

## Entity-Relationship Diagram

```
users (1) ──────< (N) orders
  │                    │
  │                    │
  │                    └──< (N) order_items >──┐
  │                                             │
  │                                             │
  └──< (N) cart_items >──┐                     │
  │                       │                     │
  │                       ▼                     ▼
  │                   products (1) ──────< (N) product_images
  │                       │
  │                       └──< (N) reviews
  │
  └──< (N) addresses
```

---

## Schema Definition

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Comments
COMMENT ON TABLE users IS 'User accounts for the e-commerce platform';
COMMENT ON COLUMN users.status IS 'User account status: active, inactive, or suspended';
```

### Addresses Table

```sql
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(20) NOT NULL CHECK (address_type IN ('billing', 'shipping')),
    street_line1 VARCHAR(255) NOT NULL,
    street_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'USA',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_type ON addresses(address_type);

-- Unique constraint: Only one default address per type per user
CREATE UNIQUE INDEX idx_addresses_default ON addresses(user_id, address_type, is_default) 
WHERE is_default = true;

-- Comments
COMMENT ON TABLE addresses IS 'User billing and shipping addresses';
```

### Products Table

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    cost DECIMAL(10, 2) CHECK (cost >= 0),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 10,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
    category VARCHAR(100),
    brand VARCHAR(100),
    weight_kg DECIMAL(8, 2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);

-- Full-text search index (PostgreSQL)
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Comments
COMMENT ON TABLE products IS 'Product catalog';
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - unique product identifier';
COMMENT ON COLUMN products.low_stock_threshold IS 'Alert when stock falls below this level';
```

### Product Images Table

```sql
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    display_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- Unique constraint: Only one primary image per product
CREATE UNIQUE INDEX idx_product_images_primary ON product_images(product_id, is_primary) 
WHERE is_primary = true;

-- Comments
COMMENT ON TABLE product_images IS 'Product images and photos';
```

### Cart Items Table

```sql
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint: One row per user-product combination
    UNIQUE(user_id, product_id)
);

-- Indexes
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- Comments
COMMENT ON TABLE cart_items IS 'Shopping cart items for users';
```

### Orders Table

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (tax >= 0),
    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    shipping_address_id INT REFERENCES addresses(id),
    billing_address_id INT REFERENCES addresses(id),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Composite index for common queries
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Comments
COMMENT ON TABLE orders IS 'Customer orders';
COMMENT ON COLUMN orders.order_number IS 'Human-readable order number (e.g., ORD-2024-00001)';
```

### Order Items Table

```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Comments
COMMENT ON TABLE order_items IS 'Line items for orders';
COMMENT ON COLUMN order_items.unit_price IS 'Price at time of order (may differ from current product price)';
```

### Reviews Table

```sql
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    verified_purchase BOOLEAN NOT NULL DEFAULT false,
    helpful_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint: One review per user per product
    UNIQUE(product_id, user_id)
);

-- Indexes
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Comments
COMMENT ON TABLE reviews IS 'Product reviews and ratings';
COMMENT ON COLUMN reviews.verified_purchase IS 'True if user purchased this product';
```

---

## Sample Queries

### Query 1: Get User with Addresses

```sql
SELECT
    u.id,
    u.email,
    u.first_name,
    u.last_name,
    json_agg(
        json_build_object(
            'id', a.id,
            'type', a.address_type,
            'street', a.street_line1,
            'city', a.city,
            'state', a.state,
            'postal_code', a.postal_code,
            'is_default', a.is_default
        )
    ) AS addresses
FROM users u
LEFT JOIN addresses a ON a.user_id = u.id
WHERE u.id = 1
GROUP BY u.id;
```

**Explanation:**
- Uses `LEFT JOIN` to include users even if they have no addresses
- Uses `json_agg` to aggregate addresses into JSON array
- Groups by user ID to get one row per user

### Query 2: Get Product with Images and Average Rating

```sql
SELECT
    p.id,
    p.sku,
    p.name,
    p.description,
    p.price,
    p.stock_quantity,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(r.id) AS review_count,
    json_agg(
        json_build_object(
            'url', pi.url,
            'alt_text', pi.alt_text,
            'is_primary', pi.is_primary
        ) ORDER BY pi.display_order
    ) FILTER (WHERE pi.id IS NOT NULL) AS images
FROM products p
LEFT JOIN product_images pi ON pi.product_id = p.id
LEFT JOIN reviews r ON r.product_id = p.id
WHERE p.id = 1
GROUP BY p.id;
```

**Explanation:**
- Joins product with images and reviews
- Calculates average rating and review count
- Aggregates images into JSON array ordered by display_order
- Uses `FILTER` to exclude NULL images

### Query 3: Get User's Shopping Cart with Product Details

```sql
SELECT
    ci.id AS cart_item_id,
    ci.quantity,
    p.id AS product_id,
    p.sku,
    p.name,
    p.price,
    p.stock_quantity,
    (ci.quantity * p.price) AS line_total,
    CASE
        WHEN p.stock_quantity >= ci.quantity THEN true
        ELSE false
    END AS in_stock
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
WHERE ci.user_id = 1
ORDER BY ci.added_at DESC;
```

**Explanation:**
- Joins cart items with products
- Calculates line total (quantity × price)
- Checks if product is in stock
- Orders by most recently added

### Query 4: Get Order with Items and Product Details

```sql
SELECT
    o.id AS order_id,
    o.order_number,
    o.status,
    o.total,
    o.created_at,
    json_agg(
        json_build_object(
            'product_id', p.id,
            'product_name', p.name,
            'sku', p.sku,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'total_price', oi.total_price
        )
    ) AS items
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.id = 1
GROUP BY o.id;
```

**Explanation:**
- Joins order with order items and products
- Aggregates items into JSON array
- Groups by order ID to get one row per order

### Query 5: Get Products with Low Stock

```sql
SELECT
    id,
    sku,
    name,
    stock_quantity,
    low_stock_threshold,
    (low_stock_threshold - stock_quantity) AS units_below_threshold
FROM products
WHERE stock_quantity < low_stock_threshold
    AND status = 'active'
ORDER BY stock_quantity ASC;
```

**Explanation:**
- Filters products below low stock threshold
- Only includes active products
- Calculates how many units below threshold
- Orders by lowest stock first

### Query 6: Get Top-Rated Products

```sql
SELECT
    p.id,
    p.sku,
    p.name,
    p.price,
    AVG(r.rating) AS avg_rating,
    COUNT(r.id) AS review_count
FROM products p
JOIN reviews r ON r.product_id = p.id
WHERE p.status = 'active'
GROUP BY p.id
HAVING COUNT(r.id) >= 5  -- At least 5 reviews
ORDER BY avg_rating DESC, review_count DESC
LIMIT 10;
```

**Explanation:**
- Joins products with reviews
- Calculates average rating and review count
- Filters to products with at least 5 reviews
- Orders by highest rating first
- Limits to top 10 products

### Query 7: Get User's Order History

```sql
SELECT
    o.id,
    o.order_number,
    o.status,
    o.total,
    o.created_at,
    COUNT(oi.id) AS item_count
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.user_id = 1
GROUP BY o.id
ORDER BY o.created_at DESC;
```

**Explanation:**
- Gets all orders for a user
- Counts number of items in each order
- Orders by most recent first

### Query 8: Search Products by Name or Description

```sql
-- Full-text search (PostgreSQL)
SELECT
    id,
    sku,
    name,
    price,
    ts_rank(to_tsvector('english', name || ' ' || COALESCE(description, '')), query) AS rank
FROM products,
    to_tsquery('english', 'laptop & gaming') AS query
WHERE to_tsvector('english', name || ' ' || COALESCE(description, '')) @@ query
    AND status = 'active'
ORDER BY rank DESC;

-- Simple LIKE search (works on all databases)
SELECT
    id,
    sku,
    name,
    price
FROM products
WHERE (name ILIKE '%laptop%' OR description ILIKE '%laptop%')
    AND status = 'active'
ORDER BY name;
```

**Explanation:**
- PostgreSQL version uses full-text search with ranking
- LIKE version works on all databases but slower
- Both filter to active products only

---

## Sample Data Insertion

### Insert Users

```sql
INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES
('john.doe@example.com', '$2b$10$...', 'John', 'Doe', '555-0101'),
('jane.smith@example.com', '$2b$10$...', 'Jane', 'Smith', '555-0102'),
('bob.johnson@example.com', '$2b$10$...', 'Bob', 'Johnson', '555-0103');
```

### Insert Addresses

```sql
INSERT INTO addresses (user_id, address_type, street_line1, city, state, postal_code, is_default) VALUES
(1, 'shipping', '123 Main St', 'New York', 'NY', '10001', true),
(1, 'billing', '123 Main St', 'New York', 'NY', '10001', true),
(2, 'shipping', '456 Oak Ave', 'Los Angeles', 'CA', '90001', true);
```

### Insert Products

```sql
INSERT INTO products (sku, name, description, price, cost, stock_quantity, category, brand) VALUES
('LAP-001', 'Gaming Laptop Pro', 'High-performance gaming laptop with RTX 4080', 1999.99, 1500.00, 25, 'Laptops', 'TechBrand'),
('MOU-001', 'Wireless Gaming Mouse', 'Ergonomic wireless mouse with RGB lighting', 79.99, 40.00, 150, 'Accessories', 'PeripheralCo'),
('KEY-001', 'Mechanical Keyboard', 'RGB mechanical keyboard with Cherry MX switches', 149.99, 80.00, 75, 'Accessories', 'PeripheralCo');
```

### Insert Product Images

```sql
INSERT INTO product_images (product_id, url, alt_text, display_order, is_primary) VALUES
(1, 'https://example.com/images/laptop-1.jpg', 'Gaming Laptop Pro - Front View', 0, true),
(1, 'https://example.com/images/laptop-2.jpg', 'Gaming Laptop Pro - Side View', 1, false),
(2, 'https://example.com/images/mouse-1.jpg', 'Wireless Gaming Mouse', 0, true);
```

### Insert Cart Items

```sql
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(1, 1, 1),
(1, 2, 2),
(2, 3, 1);
```

### Insert Orders and Order Items

```sql
-- Insert order
INSERT INTO orders (user_id, order_number, status, subtotal, tax, shipping_cost, total, shipping_address_id, billing_address_id, payment_method, payment_status)
VALUES (1, 'ORD-2024-00001', 'processing', 2159.97, 172.80, 15.00, 2347.77, 1, 2, 'credit_card', 'paid');

-- Insert order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) VALUES
(1, 1, 1, 1999.99, 1999.99),
(1, 2, 2, 79.99, 159.98);
```

### Insert Reviews

```sql
INSERT INTO reviews (product_id, user_id, rating, title, comment, verified_purchase) VALUES
(1, 2, 5, 'Amazing laptop!', 'Best gaming laptop I have ever owned. Runs all games smoothly.', true),
(2, 1, 4, 'Great mouse', 'Very comfortable and responsive. Battery life could be better.', true);
```

---

## Schema Design Principles Demonstrated

### 1. Normalization

**Third Normal Form (3NF):**
- ✅ No repeating groups (separate tables for addresses, order items, etc.)
- ✅ All non-key attributes depend on primary key
- ✅ No transitive dependencies

**Example:**
- Order items store `unit_price` (price at time of order) instead of referencing current product price
- This prevents historical data from changing when product prices change

### 2. Foreign Keys

**Referential Integrity:**
- ✅ All foreign keys defined with `REFERENCES`
- ✅ Appropriate `ON DELETE` actions (CASCADE for dependent data)
- ✅ Indexes on all foreign key columns for performance

### 3. Constraints

**Data Integrity:**
- ✅ `NOT NULL` for required fields
- ✅ `UNIQUE` for unique values (email, SKU, order_number)
- ✅ `CHECK` for valid values (price >= 0, rating between 1-5)
- ✅ `DEFAULT` for sensible defaults

### 4. Indexes

**Query Performance:**
- ✅ Primary keys automatically indexed
- ✅ Foreign keys indexed
- ✅ Frequently queried columns indexed (email, status, created_at)
- ✅ Composite indexes for common query patterns
- ✅ Unique indexes for constraints

### 5. Denormalization (Strategic)

**Performance Optimization:**
- ✅ `order_items.unit_price` stores price at time of order (prevents joins)
- ✅ `order_items.total_price` stores calculated value (avoids recalculation)
- ✅ Consider adding `products.avg_rating` and `products.review_count` for performance

---

## Related Documentation

- **relational-schema-design.md**: Schema design principles and normalization
- **relational-indexing.md**: Indexing strategies
- **relational-query-optimization.md**: Query optimization techniques
- **relational-databases.md**: Relational database fundamentals


