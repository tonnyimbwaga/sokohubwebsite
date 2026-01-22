-- Insert initial categories that match the homepage carousel
INSERT INTO categories (name, slug, description, image_url)
VALUES 
  ('Skates', 'skates', 'High-quality skates for kids of all ages', '/images/categories/skates.jpg'),
  ('Tricycles', 'tricycles', 'Safe and fun tricycles for toddlers', '/images/categories/tricycles.jpg'),
  ('Bicycles', 'bicycles', 'Quality bikes for kids of all ages', '/images/categories/bicycles.jpg'),
  ('Scooters', 'scooters', 'Fun and safe scooters for kids', '/images/categories/scooters.jpg'),
  ('Toys', 'toys', 'Educational and fun toys for children', '/images/categories/toys.jpg');
