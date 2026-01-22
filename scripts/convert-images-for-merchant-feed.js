// scripts/convert-images-for-merchant-feed.js
// Automated batch conversion and association for Google Merchant Center feed
// Usage: node scripts/convert-images-for-merchant-feed.js

require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'product-images';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function getFeedImagePath(productId, imagePath) {
  // Use the filename (no extension) and always .jpg for the feed
  const filename = path.basename(imagePath, path.extname(imagePath)) + '.jpg';
  return `feed/${productId}/${filename}`;
}

function getWebImagePath(productId, imagePath) {
  // Assume original is stored as web/{productId}/filename
  const filename = path.basename(imagePath);
  return `web/${productId}/${filename}`;
}

async function getAllProductImages() {
  // Fetch product IDs and image arrays (only necessary columns)
  const { data, error } = await supabase
    .from('products')
    .select('id, images');
  if (error) throw error;
  // Flatten: [{productId, imagePath}]
  return data.flatMap((p) => (Array.isArray(p.images) ? p.images.map(img => ({ productId: p.id, imagePath: typeof img === 'string' ? img : img.url })) : []));
}

async function getFeedImagesMap() {
  // Get all feed image records
  const { data, error } = await supabase
    .from('product_image_versions')
    .select('product_id, web_image_url, feed_image_url');
  if (error) throw error;
  // Map: productId|web_image_url => feed_image_url
  const map = new Map();
  for (const row of data) {
    map.set(`${row.product_id}|${row.web_image_url}`, row.feed_image_url);
  }
  return map;
}

async function convertAndUpload({ productId, imagePath }) {
  // Download web/original image from bucket
  // Try both possible locations: web/{productId}/filename and just imagePath
  let downloadPath = imagePath;
  let { data, error } = await supabase.storage.from(BUCKET).download(downloadPath);
  if (error || !data) {
    // Try web/{productId}/filename
    downloadPath = getWebImagePath(productId, imagePath);
    ({ data, error } = await supabase.storage.from(BUCKET).download(downloadPath));
    if (error || !data) {
      throw new Error(`Could not download image: ${imagePath} or ${downloadPath}`);
    }
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  // Convert to JPEG
  const jpegBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
  // Compose feed destination path
  const feedPath = getFeedImagePath(productId, imagePath);
  // Upload to product-images/feed/{productId}/{filename}.jpg
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(feedPath, jpegBuffer, { contentType: 'image/jpeg', upsert: true });
  if (uploadError) throw uploadError;
  // Upsert mapping in product_image_versions
  await supabase.from('product_image_versions').upsert({
    product_id: productId,
    web_image_url: downloadPath,
    feed_image_url: feedPath,
    updated_at: new Date().toISOString(),
  });
  return feedPath;
}

async function main() {
  const allImages = await getAllProductImages();
  const feedMap = await getFeedImagesMap();
  let convertedCount = 0;
  for (const img of allImages) {
    const key = `${img.productId}|${img.imagePath}`;
    if (!feedMap.has(key)) {
      try {
        await convertAndUpload(img);
        convertedCount++;
        console.log(`Converted and uploaded feed JPEG for product ${img.productId} image ${img.imagePath}`);
      } catch (e) {
        console.error(`Failed for product ${img.productId} image ${img.imagePath}:`, e);
      }
    } else {
      // Already converted
      console.log(`Already converted: product ${img.productId} image ${img.imagePath}`);
    }
  }
  console.log(`Done. ${convertedCount} new images converted.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
