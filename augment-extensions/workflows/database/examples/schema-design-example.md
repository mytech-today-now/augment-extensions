# Schema Design Example: E-commerce Platform

## Scenario

Design a database schema for an e-commerce platform with the following requirements:

**Requirements**:
- Users can browse products and place orders
- Products belong to categories and have multiple images
- Orders contain multiple items with quantities
- Track order status (pending, processing, shipped, delivered)
- Support product reviews and ratings
- Track inventory levels
- Support multiple payment methods

**Expected Scale**:
- 100,000 users
- 10,000 products
- 50,000 orders per month
- Read-heavy workload (90% reads, 10% writes)

---

## Step 1: Requirements Analysis

### Functional Requirements

1. **User Management**: Registration, authentication, profile management
2. **Product Catalog**: Browse products, search, filter by category
3. **Shopping Cart**: Add/remove items, update quantities
4. **Order Processing**: Place orders, track status, view history
5. **Reviews**: Submit reviews, view product ratings
6. **Inventory**: Track stock levels, prevent overselling

### Non-Functional Requirements

1. **Performance**: Product listing < 100ms, order placement < 500ms
2. **Scalability**: Handle 1000 concurrent users
3. **Consistency**: Strong consistency for inventory, eventual for reviews
4. **Availability**: 99.9% uptime

### Access Patterns

**High-Frequency Queries**:
- List products by category (with pagination)
- Get product details with images and reviews
- Get user's order history
- Check product inventory
- Search products by name

**Low-Frequency Queries**:
- Generate sales reports
- Calculate average ratings
- Track inventory changes

---

## Step 2: Database Selection

**Decision**: PostgreSQL (Relational Database)

**Rationale**:
- ✅ Strong ACID guarantees (critical for orders and inventory)
- ✅ Complex queries with JOINs (orders, products, reviews)
- ✅ JSON support for flexible product attributes
- ✅ Full-text search for product search
- ✅ Mature ecosystem and tooling
- ✅ Good performance for read-heavy workloads

**Alternatives Considered**:
- **MongoDB**: Good for flexible schemas, but lacks ACID for multi-document transactions
- **MySQL**: Similar to PostgreSQL, but weaker JSON support
- **DynamoDB**: Excellent scalability, but limited query capabilities

---

## Step 3: Schema Design

### Entity-Relationship Diagram

```
Users (1) ──── (M) Orders (1) ──── (M) OrderItems (M) ──── (1) Products
                                                                  │
                                                                  │
                                                            (M) ──┴── (1) Categories
                                                                  │
                                                            (M) ──┴── ProductImages
                                                                  │
                                                            (M) ──┴── Reviews (M) ──── (1) Users
```

### Table Definitions

#### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);

-- Comments
COMMENT ON TABLE users IS 'User accounts for authentication and profile management';
COMMENT ON COLUMN users.email IS 'Unique email address for login';
```

#### Categories Table

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Comments
COMMENT ON TABLE categories IS 'Product categories with hierarchical support';
COMMENT ON COLUMN categories.parent_id IS 'Parent category for nested categories';
```

#### Products Table

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES categories(id),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  inventory_count INTEGER DEFAULT 0,
  attributes JSONB,  -- Flexible product attributes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT price_positive CHECK (price >= 0),
  CONSTRAINT inventory_non_negative CHECK (inventory_count >= 0)
);

-- Indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_attributes ON products USING gin(attributes);

-- Comments
COMMENT ON TABLE products IS 'Product catalog with inventory tracking';
COMMENT ON COLUMN products.attributes IS 'Flexible JSON attributes (color, size, etc.)';
COMMENT ON COLUMN products.inventory_count IS 'Current stock level';
```

#### Product Images Table

```sql
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_product_images_product ON product_images(product_id, display_order);

-- Comments
COMMENT ON TABLE product_images IS 'Product images with display ordering';
```

#### Orders Table

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  shipping_address JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled'))
);

-- Indexes
CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status) WHERE status != 'delivered';

-- Comments
COMMENT ON TABLE orders IS 'Customer orders with status tracking';
COMMENT ON COLUMN orders.shipping_address IS 'JSON object with address details';
```

#### Order Items Table

```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT quantity_positive CHECK (quantity > 0)
);

-- Indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Comments
COMMENT ON TABLE order_items IS 'Line items for each order';
COMMENT ON COLUMN order_items.price_at_purchase IS 'Price at time of purchase (historical record)';
```

#### Reviews Table

```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  rating INTEGER NOT NULL,
  title VARCHAR(255),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT unique_user_product UNIQUE (product_id, user_id)
);

-- Indexes
CREATE INDEX idx_reviews_product ON reviews(product_id, created_at DESC);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Comments
COMMENT ON TABLE reviews IS 'Product reviews and ratings';
COMMENT ON CONSTRAINT unique_user_product ON reviews IS 'One review per user per product';
```

---

## Step 4: Optimization Considerations

### Denormalization for Performance

**Add average rating to products table**:
```sql
ALTER TABLE products ADD COLUMN average_rating DECIMAL(3, 2);
ALTER TABLE products ADD COLUMN review_count INTEGER DEFAULT 0;

-- Update with trigger or scheduled job
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    average_rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_product_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();
```

### Materialized View for Reports

```sql
CREATE MATERIALIZED VIEW daily_sales_summary AS
SELECT
  DATE(created_at) as sale_date,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue,
  AVG(total_amount) as average_order_value
FROM orders
WHERE status = 'delivered'
GROUP BY DATE(created_at);

-- Refresh daily
CREATE INDEX idx_daily_sales_date ON daily_sales_summary(sale_date);
```

---

## Step 5: Sample Queries

### Get Product Listing with Category

```sql
SELECT
  p.id,
  p.name,
  p.price,
  p.inventory_count,
  p.average_rating,
  p.review_count,
  c.name as category_name,
  (SELECT url FROM product_images WHERE product_id = p.id ORDER BY display_order LIMIT 1) as thumbnail
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'electronics'
  AND p.inventory_count > 0
ORDER BY p.average_rating DESC NULLS LAST
LIMIT 20 OFFSET 0;
```

### Get Product Details with Images and Reviews

```sql
-- Product details
SELECT * FROM products WHERE slug = 'wireless-headphones';

-- Product images
SELECT url, alt_text
FROM product_images
WHERE product_id = (SELECT id FROM products WHERE slug = 'wireless-headphones')
ORDER BY display_order;

-- Recent reviews
SELECT r.rating, r.title, r.comment, r.created_at, u.first_name
FROM reviews r
JOIN users u ON r.user_id = u.id
WHERE r.product_id = (SELECT id FROM products WHERE slug = 'wireless-headphones')
ORDER BY r.created_at DESC
LIMIT 10;
```

### Get User Order History

```sql
SELECT
  o.id,
  o.status,
  o.total_amount,
  o.created_at,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 123
GROUP BY o.id
ORDER BY o.created_at DESC;
```

### Place Order (Transaction)

```sql
BEGIN;

-- Create order
INSERT INTO orders (user_id, total_amount, payment_method, shipping_address)
VALUES (123, 299.99, 'credit_card', '{"street": "123 Main St", "city": "New York"}')
RETURNING id;

-- Add order items and update inventory
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
VALUES (456, 789, 2, 149.99);

UPDATE products
SET inventory_count = inventory_count - 2
WHERE id = 789 AND inventory_count >= 2;

-- Verify inventory was updated (prevent overselling)
SELECT inventory_count FROM products WHERE id = 789;

COMMIT;
```

---

## Step 6: Testing and Validation

### Data Integrity Tests

```sql
-- Verify no negative inventory
SELECT * FROM products WHERE inventory_count < 0;

-- Verify all order items have valid products
SELECT oi.* FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.id
WHERE p.id IS NULL;

-- Verify rating constraints
SELECT * FROM reviews WHERE rating < 1 OR rating > 5;
```

### Performance Tests

```sql
-- Test product listing query performance
EXPLAIN ANALYZE
SELECT p.*, c.name as category_name
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE c.slug = 'electronics'
LIMIT 20;

-- Should use index scan, not sequential scan
```

---

## Key Takeaways

1. **ACID Guarantees**: Used PostgreSQL for strong consistency in orders and inventory
2. **Normalization**: Normalized schema to 3NF, with strategic denormalization (average_rating)
3. **Indexes**: Added indexes on foreign keys and frequently queried columns
4. **Constraints**: Used CHECK constraints to enforce business rules
5. **JSON Support**: Used JSONB for flexible attributes and addresses
6. **Performance**: Denormalized ratings and created materialized views for reports
7. **Transactions**: Used transactions for order placement to prevent overselling

---

## Next Steps

- See `migration-example.md` for adding new features to this schema
- See `optimization-example.md` for optimizing slow queries
- See `../rules/testing-patterns.md` for comprehensive testing strategies


