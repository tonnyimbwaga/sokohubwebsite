-- DEFINITIVE SOKOHUB CHECKOUT FIX
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/rmgtdipwxieqlqkxyohv/sql

-- 1. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 2. CREATE POLICIES FOR PUBLIC (ANONYMOUS) ACCESS
-- This allows customers to place orders without being logged in
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.orders;
CREATE POLICY "Allow anonymous insert" ON public.orders 
FOR INSERT WITH CHECK (true);

-- This allows the app to fetch the order after placement for the success screen
DROP POLICY IF EXISTS "Allow public select" ON public.orders;
CREATE POLICY "Allow public select" ON public.orders 
FOR SELECT USING (true);

-- This allows updating payment status if needed (optional but good for workflow)
DROP POLICY IF EXISTS "Allow public update" ON public.orders;
CREATE POLICY "Allow public update" ON public.orders 
FOR UPDATE USING (true);

-- 3. ENSURE ALL COLUMNS EXIST AND HAVE CORRECT TYPES
DO $$ 
BEGIN 
    -- Contact & Identity
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_name') THEN
        ALTER TABLE orders ADD COLUMN customer_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='customer_email') THEN
        ALTER TABLE orders ADD COLUMN customer_email TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='phone') THEN
        ALTER TABLE orders ADD COLUMN phone TEXT;
    END IF;

    -- Delivery
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='delivery_zone') THEN
        ALTER TABLE orders ADD COLUMN delivery_zone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='location') THEN
        ALTER TABLE orders ADD COLUMN location TEXT;
    END IF;

    -- Financial Tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total_amount') THEN
        ALTER TABLE orders ADD COLUMN total_amount NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total') THEN
        ALTER TABLE orders ADD COLUMN total NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='is_immediate_payment') THEN
        ALTER TABLE orders ADD COLUMN is_immediate_payment BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='discount_percentage') THEN
        ALTER TABLE orders ADD COLUMN discount_percentage NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='original_amount') THEN
        ALTER TABLE orders ADD COLUMN original_amount NUMERIC;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='discounted_amount') THEN
        ALTER TABLE orders ADD COLUMN discounted_amount NUMERIC;
    END IF;

    -- Status & Workflow
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='status') THEN
        ALTER TABLE orders ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_status') THEN
        ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='payment_date') THEN
        ALTER TABLE orders ADD COLUMN payment_date TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_confirmed') THEN
        ALTER TABLE orders ADD COLUMN order_confirmed BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='order_confirmation_date') THEN
        ALTER TABLE orders ADD COLUMN order_confirmation_date TIMESTAMPTZ;
    END IF;

    -- Data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='items') THEN
        ALTER TABLE orders ADD COLUMN items JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Ensure customer_email is nullable
    ALTER TABLE orders ALTER COLUMN customer_email DROP NOT NULL;

END $$;
