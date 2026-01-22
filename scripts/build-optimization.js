#!/usr/bin/env node

if (process.env.NEXT_RUNTIME === "edge") {
  process.exit(0)
}

/**
 * Build Optimization Script
 * 
 * This script runs during build time to:
 * 1. Pre-generate static data manifests
 * 2. Pre-warm CDN cache for critical images
 * 3. Optimize function calls by reducing database queries
 * 4. Generate optimized image URLs
 */

const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import your Supabase client (adjust path as needed)
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  console.log('🚀 Starting build optimization...');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('⚠️ Missing Supabase environment variables during build');
    console.log('💡 This is normal for Cloudflare builds - creating minimal optimization data');

    try {
      // Create minimal optimization data structure
      const minimalManifest = {
        products: {},
        categories: {},
        collections: {
          featured: [],
          trending: [],
          newArrivals: [],
          bestDeals: []
        },
        lastUpdated: new Date().toISOString(),
        version: Date.now(),
        buildTime: true
      };

      // Ensure directories exist
      await fs.mkdir(path.join(process.cwd(), 'public', 'api', 'static-data'), { recursive: true });

      // Write minimal manifest
      await fs.writeFile(
        path.join(process.cwd(), 'public', 'api', 'static-data', 'manifest.json'),
        JSON.stringify(minimalManifest, null, 2)
      );

      console.log('✅ Created minimal build optimization data');
      console.log('🎯 Runtime will generate full optimization data when needed');
      return;

    } catch (error) {
      console.error('❌ Failed to create minimal optimization data:', error);
      console.log('⚠️ Continuing build without optimization data...');
      return; // Don't fail the build
    }
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Step 1: Generate static data manifest
    console.log('📊 Generating static data manifest...');
    const manifest = await generateStaticManifest(supabase);

    // Step 2: Write manifest to public directory for CDN serving
    await fs.mkdir(path.join(process.cwd(), 'public', 'api', 'static-data'), { recursive: true });
    await fs.writeFile(
      path.join(process.cwd(), 'public', 'api', 'static-data', 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    // Step 3: Generate individual product files for instant loading
    console.log('🔧 Generating individual product files...');
    await generateProductFiles(manifest.products);

    // Step 4: Generate category files
    console.log('📁 Generating category files...');
    await generateCategoryFiles(manifest.categories);

    // Step 5: Generate optimized sitemap data
    console.log('🗺️ Generating sitemap data...');
    await generateSitemapData(manifest);

    console.log('✅ Build optimization completed successfully!');
    console.log(`Generated data for ${Object.keys(manifest.products).length} products`);
    console.log(`Generated data for ${Object.keys(manifest.categories).length} categories`);

  } catch (error) {
    console.error('❌ Build optimization failed:', error);
    console.log('⚠️ Continuing build without full optimization...');
    // Don't exit with error - let the build continue
  }
}

async function generateStaticManifest(supabase) {
  // Fetch all active products with their categories in a single optimized query
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      description,
      price,
      compare_at_price,
      slug,
      images,
      is_featured,
      is_trending,
      is_published,
      created_at,
      updated_at,
      category:category_id(id, name, slug)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error || !products) {
    throw new Error(`Failed to fetch products: ${error?.message}`);
  }

  const staticProducts = {};
  const categories = {};
  const collections = {
    featured: [],
    trending: [],
    newArrivals: [],
    bestDeals: []
  };

  // Process products efficiently
  for (const product of products) {
    const category = Array.isArray(product.category) ? product.category[0] : product.category;
    const primaryImageUrl = product.images?.[0]?.web_image_url || product.images?.[0]?.url;

    if (!primaryImageUrl) continue;

    // Generate all static image URLs
    const staticProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      slug: product.slug,
      category: category?.name || '',
      categorySlug: category?.slug || '',
      images: {
        primary: generateImageUrls(primaryImageUrl),
        srcSet: generateSrcSet(primaryImageUrl),
        gallery: (product.images || []).map(img =>
          generateImageUrls(img.web_image_url || img.url)
        ).filter(Boolean)
      },
      metadata: {
        lastModified: product.updated_at || product.created_at,
        etag: `"${product.id}-${new Date(product.updated_at || product.created_at).getTime()}"`
      }
    };

    staticProducts[product.id] = staticProduct;

    // Organize into collections
    if (product.is_featured) {
      collections.featured.push(product.id);
    }
    if (product.is_trending) {
      collections.trending.push(product.id);
    }
    if (product.compare_at_price && product.price < product.compare_at_price) {
      collections.bestDeals.push(product.id);
    }

    // New arrivals (products from last 30 days)
    const createdAt = new Date(product.created_at);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (createdAt > thirtyDaysAgo) {
      collections.newArrivals.push(product.id);
    }

    // Group by category
    if (category) {
      if (!categories[category.id]) {
        categories[category.id] = {
          id: category.id,
          name: category.name,
          slug: category.slug,
          productIds: [],
          featuredProducts: []
        };
      }
      categories[category.id].productIds.push(product.id);
      if (product.is_featured) {
        categories[category.id].featuredProducts.push(product.id);
      }
    }
  }

  return {
    products: staticProducts,
    categories,
    collections,
    lastUpdated: new Date().toISOString(),
    version: Date.now(),
    buildTime: false
  };
}

function generateImageUrls(imageId) {
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'product-images';
  const baseUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}`;

  // Clean the image ID to remove any existing transformation parameters
  let cleanImageId = imageId;
  if (cleanImageId && cleanImageId.includes('?')) {
    cleanImageId = cleanImageId.split('?')[0];
  }
  // Extract just the filename from the full URL if needed
  if (cleanImageId && cleanImageId.includes('/')) {
    cleanImageId = cleanImageId.split('/').pop() || cleanImageId;
  }

  // For Cloudflare optimization, use clean URLs without transformation parameters
  // Cloudflare will handle optimization via Next.js Image component
  const originalUrl = `${baseUrl}/${cleanImageId}`;

  return {
    mobile: originalUrl,
    mobileAvif: originalUrl,
    tablet: originalUrl,
    tabletAvif: originalUrl,
    desktop: originalUrl,
    desktopAvif: originalUrl,
    thumb: originalUrl,
    hero: originalUrl,
    heroAvif: originalUrl,
    original: originalUrl
  };
}

function generateSrcSet(imageId) {
  const urls = generateImageUrls(imageId);

  return {
    srcSet: `${urls.mobile} 320w, ${urls.tablet} 640w, ${urls.desktop} 800w, ${urls.hero} 1200w`,
    srcSetAvif: `${urls.mobileAvif} 320w, ${urls.tabletAvif} 640w, ${urls.desktopAvif} 800w, ${urls.heroAvif} 1200w`,
    sizes: '(max-width: 640px) 320px, (max-width: 1024px) 640px, (max-width: 1280px) 800px, 1200px'
  };
}

async function generateProductFiles(products) {
  const productsDir = path.join(process.cwd(), 'public', 'api', 'products');
  await fs.mkdir(productsDir, { recursive: true });

  // Generate individual product files for instant loading
  for (const [productId, product] of Object.entries(products)) {
    await fs.writeFile(
      path.join(productsDir, `${product.slug}.json`),
      JSON.stringify(product, null, 2)
    );
  }
}

async function generateCategoryFiles(categories) {
  const categoriesDir = path.join(process.cwd(), 'public', 'api', 'categories');
  await fs.mkdir(categoriesDir, { recursive: true });

  for (const [categoryId, category] of Object.entries(categories)) {
    await fs.writeFile(
      path.join(categoriesDir, `${category.slug}.json`),
      JSON.stringify(category, null, 2)
    );
  }
}

async function generateSitemapData(manifest) {
  const sitemapData = {
    products: Object.values(manifest.products).map(p => ({
      slug: p.slug,
      lastModified: p.metadata.lastModified
    })),
    categories: Object.values(manifest.categories).map(c => ({
      slug: c.slug,
      lastModified: manifest.lastUpdated
    })),
    lastUpdated: manifest.lastUpdated
  };

  await fs.writeFile(
    path.join(process.cwd(), 'public', 'api', 'sitemap-data.json'),
    JSON.stringify(sitemapData, null, 2)
  );
}

// Run the optimization
main().catch(console.error); 