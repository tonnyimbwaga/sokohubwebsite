-- First, drop the default constraint on the payment_status column
ALTER TABLE orders 
ALTER COLUMN payment_status DROP DEFAULT;

-- Drop existing enum type if it exists to avoid conflicts
DROP TYPE IF EXISTS payment_status_enum CASCADE;

-- Create the payment_status enum type with all possible values
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'completed', 'failed', 'refunded');

-- First, update the column to text type temporarily
ALTER TABLE orders 
ALTER COLUMN payment_status TYPE text;

-- Then update to the new enum type with proper value mapping
ALTER TABLE orders 
ALTER COLUMN payment_status TYPE payment_status_enum 
USING (
    CASE 
        WHEN payment_status = 'completed' THEN 'completed'::payment_status_enum
        WHEN payment_status = 'paid' THEN 'paid'::payment_status_enum
        WHEN payment_status = 'pending' THEN 'pending'::payment_status_enum
        WHEN payment_status = 'failed' THEN 'failed'::payment_status_enum
        WHEN payment_status = 'refunded' THEN 'refunded'::payment_status_enum
        ELSE 'pending'::payment_status_enum
    END
);

-- Update the default value to use the enum type
ALTER TABLE orders 
ALTER COLUMN payment_status SET DEFAULT 'pending'::payment_status_enum;

-- Update the comment to reflect the allowed values
COMMENT ON COLUMN orders.payment_status IS 'Status of payment: pending, paid, completed, failed, refunded';
