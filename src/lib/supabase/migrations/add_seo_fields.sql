-- Add SEO fields to categories table
ALTER TABLE categories
ADD COLUMN meta_title TEXT,
ADD COLUMN meta_description TEXT;
