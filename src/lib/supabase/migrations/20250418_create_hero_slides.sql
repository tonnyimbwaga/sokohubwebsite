-- Create hero_slides table
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL DEFAULT '#',
    button_text TEXT NOT NULL DEFAULT 'Shop Now',
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active slides
CREATE POLICY "Allow public read access to active slides" ON public.hero_slides
    FOR SELECT
    USING (active = true);

-- Allow authenticated users with admin role to manage all slides
CREATE POLICY "Allow admins to manage all slides" ON public.hero_slides
    FOR ALL
    USING (
        auth.role() = 'authenticated' AND 
        auth.uid() IN (
            SELECT auth.uid() 
            FROM auth.users 
            WHERE auth.email() IN (SELECT unnest(current_setting('app.admin_emails')::text[]))
        )
    );

-- Create function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_hero_slides_updated_at
    BEFORE UPDATE ON public.hero_slides
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
