const { createClient } = require('@supabase/supabase-js');
const { config } = require('dotenv');

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Service Role Key is missing. Make sure .env.local is configured correctly.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const PLACEHOLDER = {
  web_image_url: '/images/placeholder.png',
  feed_image_url: '/images/placeholder.png',
  alt: 'Placeholder',
};

function isValidImageObj(img) {
  return img && typeof img === 'object' && (img.web_image_url || img.feed_image_url);
}

async function fixProductImages() {
  console.log('Fetching products to check image consistency...');
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, images');

  if (productsError) {
    console.error('Error fetching products:', productsError);
    return;
  }

  let updated = 0;
  for (const product of products) {
    let needsUpdate = false;
    let images = product.images;
    if (!Array.isArray(images) || images.length === 0) {
      needsUpdate = true;
      images = [PLACEHOLDER];
    } else {
      // Filter out invalid images
      const validImages = images.filter(isValidImageObj);
      if (validImages.length === 0) {
        needsUpdate = true;
        images = [PLACEHOLDER];
      } else if (validImages.length !== images.length) {
        needsUpdate = true;
        images = validImages;
      }
    }
    if (needsUpdate) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ images })
        .eq('id', product.id);
      if (updateError) {
        console.error(`Failed to update product ${product.id}:`, updateError.message);
      } else {
        updated++;
        console.log(`Fixed images for product ${product.id}`);
      }
    }
  }
  console.log(`Done. Updated ${updated} products.`);
}

fixProductImages(); 