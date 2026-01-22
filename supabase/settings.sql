-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_url TEXT NOT NULL DEFAULT 'http://localhost:3000',
    site_name TEXT NOT NULL DEFAULT 'Toto Toys & Fun',
    site_description TEXT DEFAULT 'Quality toys for happy kids',
    contact_email TEXT, -- Optional: Email for contact forms
    contact_phone TEXT, -- Optional: Phone number for customer service
    support_phone TEXT,
    address TEXT,
    social_media JSONB DEFAULT '{}',
    shipping_policy TEXT,
    return_policy TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add updated_at trigger
DO $$ 
BEGIN
    CREATE TRIGGER update_settings_updated_at 
        BEFORE UPDATE ON settings 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for settings
CREATE POLICY "Enable read access for all users" 
    ON settings FOR SELECT 
    TO public 
    USING (true);

CREATE POLICY "Enable insert/update/delete for admin users" 
    ON settings FOR ALL 
    USING (exists(select 1 from profiles where id = auth.uid() and role = 'admin'))
    WITH CHECK (exists(select 1 from profiles where id = auth.uid() and role = 'admin'));

-- Insert default settings if none exist
INSERT INTO settings (site_name, site_description)
SELECT 'Toto Toys & Fun', 'Quality toys for happy kids'
WHERE NOT EXISTS (SELECT 1 FROM settings);
