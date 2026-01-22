-- Add M-Pesa payment fields to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS mpesa_phone_number VARCHAR(15),
ADD COLUMN IF NOT EXISTS mpesa_transaction_code VARCHAR(20);

-- Create index for faster lookups by transaction code
CREATE INDEX IF NOT EXISTS idx_orders_mpesa_transaction
ON orders (mpesa_transaction_code);

-- Add comment to describe the fields
COMMENT ON COLUMN orders.mpesa_phone_number IS 'Phone number used for M-Pesa payment';
COMMENT ON COLUMN orders.mpesa_transaction_code IS 'M-Pesa transaction confirmation code';
