-- Add fields for two-stage checkout process with discount
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS is_immediate_payment boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_percentage numeric(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS original_amount numeric(10,2),
ADD COLUMN IF NOT EXISTS discounted_amount numeric(10,2),
ADD COLUMN IF NOT EXISTS payment_status varchar(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS order_confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS order_confirmation_date timestamp with time zone;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_payment_status
ON orders (payment_status);

CREATE INDEX IF NOT EXISTS idx_orders_is_immediate_payment
ON orders (is_immediate_payment);

CREATE INDEX IF NOT EXISTS idx_orders_order_confirmed
ON orders (order_confirmed);

-- Add comments to describe the fields
COMMENT ON COLUMN orders.is_immediate_payment IS 'Whether payment was made immediately during checkout';
COMMENT ON COLUMN orders.discount_percentage IS 'Percentage discount applied to the order';
COMMENT ON COLUMN orders.original_amount IS 'Original order amount before discount';
COMMENT ON COLUMN orders.discounted_amount IS 'Final order amount after discount';
COMMENT ON COLUMN orders.payment_status IS 'Status of payment: pending, completed, failed, etc.';
COMMENT ON COLUMN orders.payment_date IS 'Date and time when payment was completed';
COMMENT ON COLUMN orders.order_confirmed IS 'Whether the order has been confirmed';
COMMENT ON COLUMN orders.order_confirmation_date IS 'Date and time when the order was confirmed';
