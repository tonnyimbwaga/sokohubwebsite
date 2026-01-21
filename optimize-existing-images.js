const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fetch = require('node-fetch');

// === FILLED IN ===
const supabaseUrl = 'https://tafojbtftmihrheeyoky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhZm9qYnRmdG1paHJoZWV5b2t5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDczOTcxNiwiZXhwIjoyMDYwMzE1NzE2fQ.rPsUCDSITlQsa8qQs8K1DjtIVb90b3eQi9OA9t-DOVI'; // Service role key
const bucket = 'product-images';
// =====================

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  // 1. Get all product_image_versions with no web_optimized_image_url
  const { data, error } = await supabase
    .from('product_image_versions')
    .select('id, feed_image_url')
    .is('web_optimized_image_url', null);

  if (error) throw error;

  for (const row of data) {
    try {
      // 2. Download the original image
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${row.feed_image_url}`;
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`Failed to fetch ${imageUrl}`);
      const buffer = await response.buffer();

      // 3. Convert to webp
      const webpBuffer = await sharp(buffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

      // 4. Upload to Supabase Storage
      const webpFileName = `optimized/${row.id}.webp`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(webpFileName, webpBuffer, {
          upsert: true,
          contentType: 'image/webp',
        });
      if (uploadError) throw uploadError;

      // 5. Update the DB row
      const { error: updateError } = await supabase
        .from('product_image_versions')
        .update({ web_optimized_image_url: webpFileName })
        .eq('id', row.id);
      if (updateError) throw updateError;

      console.log(`Optimized and updated: ${row.id}`);
    } catch (err) {
      console.error(`Failed for ${row.id}:`, err.message);
    }
  }
}

main().catch(console.error); 