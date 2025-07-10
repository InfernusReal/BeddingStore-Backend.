-- Fix price column size for products, orders, and order_items tables
-- This will allow prices up to 999,999,999.99 (1 billion - 1 cent)

-- Update products table price column
ALTER TABLE products MODIFY COLUMN price DECIMAL(12, 2);

-- Update orders table total_amount column
ALTER TABLE orders MODIFY COLUMN total_amount DECIMAL(12, 2);

-- Update order_items table price and subtotal columns
ALTER TABLE order_items MODIFY COLUMN price DECIMAL(12, 2);
ALTER TABLE order_items MODIFY COLUMN subtotal DECIMAL(12, 2);

-- Verify the changes
DESCRIBE products;
DESCRIBE orders;
DESCRIBE order_items;
