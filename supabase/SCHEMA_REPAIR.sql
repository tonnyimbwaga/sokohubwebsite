-- SCHEMA REPAIR FOR ORDERS TABLE (REFINED)
-- Adss missing columns for payment tracking and order workflow

DO $$ 
BEGIN 
    -- (M-Pesa fields removed as per request)


    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_date') THEN
        ALTER TABLE orders ADD COLUMN payment_date TIMESTAMPTZ;
    END IF;

    -- 2. Workflow Missing Fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_confirmation_date') THEN
        ALTER TABLE orders ADD COLUMN order_confirmation_date TIMESTAMPTZ;
    END IF;

    -- 3. Make customer_email optional
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_email') THEN
        ALTER TABLE orders ALTER COLUMN customer_email DROP NOT NULL;
    END IF;

    -- 4. Ensure Status constraint if it's an enum (the script uses 'pending', 'paid' etc)
    -- If the user has a custom enum order_status, we might need to adjust logic to match, 
    -- but usually standard names work or we add it to the enum.
END $$;

