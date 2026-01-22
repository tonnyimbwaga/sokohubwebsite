import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  console.error('Required variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase admin client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateImages() {
  try {
    // Create the categories bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      process.exit(1);
    }

    const categoriesBucket = buckets?.find(b => b.name === 'categories');
    
    if (!categoriesBucket) {
      console.log('Creating categories bucket...');
      const { error: createError } = await supabase
        .storage
        .createBucket('categories', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png'],
          fileSizeLimit: 1024 * 1024 * 2 // 2MB
        });

      if (createError) {
        console.error('Error creating bucket:', createError);
        process.exit(1);
      }
    }

    // Get all images from the categories directory
    const imagesDir = path.join(process.cwd(), 'public', 'images', 'categories');
    const files = await fs.readdir(imagesDir);
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));

    console.log(`Found ${imageFiles.length} images to migrate`);

    // Process each image
    for (const file of imageFiles) {
      console.log(`Processing ${file}...`);
      
      // Read the image file
      const filePath = path.join(imagesDir, file);
      const fileData = await fs.readFile(filePath);
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('categories')
        .upload(file, fileData, {
          cacheControl: '31536000', // 1 year cache
          upsert: true
        });

      if (uploadError) {
        console.error(`Error uploading ${file}:`, uploadError);
        continue;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('categories')
        .getPublicUrl(file);

      console.log(`Uploaded ${file} to: ${publicUrl}`);

      // Update the database with the new URL
      const { error: updateError } = await supabase
        .from('categories')
        .update({ image_url: file }) // Store just the filename, not the full URL
        .eq('image_url', `/images/categories/${file}`);

      if (updateError) {
        console.error(`Error updating database for ${file}:`, updateError);
        continue;
      }

      console.log(`Successfully migrated ${file}`);
    }

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrateImages();
