#!/usr/bin/env node

if (process.env.NEXT_RUNTIME === "edge") {
  process.exit(0)
}

/**
 * Static Data Generation Script (CommonJS)
 * 
 * This script runs during the build process to generate static JSON files
 * for blazing fast homepage and category page loading.
 */

const fs = require('fs');
const path = require('path');

async function generateStaticData() {
  console.log('🚀 Starting static data generation...');

  try {
    // Set up environment - try multiple sources
    require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
    require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

    console.log('📝 Environment loaded');
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
    console.log('🔑 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');

    // Ensure public/data directory exists
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Created public/data directory');
    }

    // Check if we have environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('⚠️ Missing environment variables during build, creating minimal static data...');
      console.log('💡 This is normal for Cloudflare builds - runtime will use real data');

      const minimalData = {
        categories: [],
        featuredProducts: [],
        dealProducts: [],
        trendingProducts: [],
        lastUpdated: new Date().toISOString(),
        version: '2.0',
        buildTime: true,
        message: 'Generated at build time - will be replaced at runtime'
      };

      const filePath = path.join(dataDir, 'homepage.json');
      fs.writeFileSync(filePath, JSON.stringify(minimalData, null, 2));
      console.log('✅ Created minimal static data for build');
      return;
    }

    // If we have environment variables, try to generate real data
    console.log('🔄 Attempting to generate real static data...');

    try {
      // Import createClient function directly
      const { createClient } = require('@supabase/supabase-js');

      // Create Supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      console.log('📡 Connected to Supabase');

      // Fetch categories with products
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          image_url,
          description,
          is_active
        `)
        .eq('is_active', true)
        .order('name');

      if (categoriesError) {
        console.error('❌ Categories fetch error:', categoriesError);
        throw categoriesError;
      }

      // Fetch featured products
      const { data: featuredProducts, error: featuredError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          compare_at_price,
          images,
          description,
          stock,
          status,
          is_featured,
          is_trending,
          is_deal,
          is_published
        `)
        .eq('is_featured', true)
        .eq('is_published', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(8);

      if (featuredError) {
        console.error('❌ Featured products fetch error:', featuredError);
        throw featuredError;
      }

      // Fetch deal products (products with compare_at_price)
      const { data: dealProducts, error: dealError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          compare_at_price,
          images,
          description,
          stock,
          status,
          is_deal
        `)
        .eq('is_published', true)
        .gt('stock', 0)
        .not('compare_at_price', 'is', null)
        .gt('compare_at_price', 0)
        .order('created_at', { ascending: false })
        .limit(8);

      if (dealError) {
        console.error('❌ Deal products fetch error:', dealError);
        throw dealError;
      }

      // Fetch trending products
      const { data: trendingProducts, error: trendingError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          compare_at_price,
          images,
          description,
          stock,
          status,
          is_trending
        `)
        .eq('is_trending', true)
        .eq('is_published', true)
        .gt('stock', 0)
        .order('created_at', { ascending: false })
        .limit(8);

      if (trendingError) {
        console.error('❌ Trending products fetch error:', trendingError);
        throw trendingError;
      }

      // Process deal products to add discount percentage
      const processedDealProducts = (dealProducts || []).map(product => ({
        ...product,
        discountPercentage: product.compare_at_price && product.compare_at_price > product.price
          ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
          : 0
      })).sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0));

      // Create static data object
      const staticData = {
        categories: categories || [],
        featuredProducts: featuredProducts || [],
        dealProducts: processedDealProducts,
        trendingProducts: trendingProducts || [],
        lastUpdated: new Date().toISOString(),
        version: '2.0',
        buildTime: false
      };

      // Write to file
      const filePath = path.join(dataDir, 'homepage.json');
      fs.writeFileSync(filePath, JSON.stringify(staticData, null, 2));

      console.log('✅ Generated real static data successfully!');
      console.log(`📊 Categories: ${staticData.categories.length}`);
      console.log(`⭐ Featured Products: ${staticData.featuredProducts.length}`);
      console.log(`💰 Deal Products: ${staticData.dealProducts.length}`);
      console.log(`🔥 Trending Products: ${staticData.trendingProducts.length}`);

    } catch (dataError) {
      console.error('❌ Failed to generate real data:', dataError);
      console.log('⚠️ Falling back to minimal data...');

      // Fallback to minimal data
      const minimalData = {
        categories: [],
        featuredProducts: [],
        dealProducts: [],
        trendingProducts: [],
        lastUpdated: new Date().toISOString(),
        version: '2.0',
        buildTime: true,
        fallback: true,
        error: dataError.message
      };

      const filePath = path.join(dataDir, 'homepage.json');
      fs.writeFileSync(filePath, JSON.stringify(minimalData, null, 2));
      console.log('✅ Created fallback static data');
    }

  } catch (error) {
    console.error('❌ Static data generation failed:', error);

    // Create emergency fallback
    try {
      const emergencyData = {
        categories: [],
        featuredProducts: [],
        dealProducts: [],
        trendingProducts: [],
        lastUpdated: new Date().toISOString(),
        version: '2.0',
        buildTime: true,
        emergency: true
      };

      const dataDir = path.join(process.cwd(), 'public', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const filePath = path.join(dataDir, 'homepage.json');
      fs.writeFileSync(filePath, JSON.stringify(emergencyData, null, 2));
      console.log('✅ Created emergency fallback data');

    } catch (fallbackError) {
      console.error('❌ Even fallback failed:', fallbackError);
    }
  }

  console.log('✅ Static data generation completed!');
}

// Run the function
generateStaticData()
  .then(() => {
    console.log('🎉 Build-time static data generation finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Critical error in static data generation:', error);
    process.exit(0); // Don't fail the build - let it continue
  }); 