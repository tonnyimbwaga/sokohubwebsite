#!/usr/bin/env node

/**
 * Unified Database Sync Script
 * 
 * This script consolidates generate-static-data.js and build-optimization.js
 * into a single, brand-aligned process that pulls from the new Supabase database.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables. Skipping sync.');
    process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function sanitize(str) {
    if (typeof str !== 'string') return str;
    return str
        .replace(/Toto Toys & Fun/gi, 'Sokohub Kenya')
        .replace(/Toto Toys and Fun/gi, 'Sokohub Kenya')
        .replace(/Toto Toys and Games/gi, 'Sokohub Kenya')
        .replace(/Toto Toys/gi, 'Sokohub')
        .replace(/toto\.co\.ke/gi, 'sokohubkenya.com');
}

function sanitizeObject(obj) {
    if (!obj) return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    if (typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                newObj[key] = sanitize(obj[key]);
            } else if (typeof obj[key] === 'object') {
                newObj[key] = sanitizeObject(obj[key]);
            } else {
                newObj[key] = obj[key];
            }
        }
        return newObj;
    }
    return obj;
}

async function sync() {
    console.log('🚀 Starting Unified Database Sync...');

    try {
        // 1. Ensure directories exist
        const publicDataDir = path.join(process.cwd(), 'public', 'data');
        const publicApiDir = path.join(process.cwd(), 'public', 'api');
        const productsDir = path.join(publicApiDir, 'products');
        const categoriesDir = path.join(publicApiDir, 'categories');
        const staticDataDir = path.join(publicApiDir, 'static-data');

        [publicDataDir, publicApiDir, productsDir, categoriesDir, staticDataDir].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        // 2. Fetch Data
        console.log('📡 Fetching data from Supabase...');

        // Categories
        const { data: categoriesData, error: catError } = await supabase
            .from('categories')
            .select('*')
            .eq('is_active', true);

        if (catError) throw catError;
        const categories = sanitizeObject(categoriesData);

        // Products
        const { data: productsData, error: prodError } = await supabase
            .from('products')
            .select('*');

        if (prodError) throw prodError;

        // Merge categories into products manually since we already have categoriesData
        const productsWithCategories = productsData.map(product => ({
            ...product,
            categories: categoriesData.find(c => c.id === product.category_id) || null
        }));

        const products = sanitizeObject(productsWithCategories);

        console.log(`✅ Fetched ${categories.length} categories and ${products.length} products.`);

        // 3. Generate individual product files
        console.log('🔧 Generating individual product JSON files...');
        products.forEach(product => {
            fs.writeFileSync(
                path.join(productsDir, `${product.slug}.json`),
                JSON.stringify(product, null, 2)
            );
        });

        // 4. Generate individual category files
        console.log('📁 Generating individual category JSON files...');
        categories.forEach(category => {
            fs.writeFileSync(
                path.join(categoriesDir, `${category.slug}.json`),
                JSON.stringify(category, null, 2)
            );
        });

        // 5. Generate Homepage Data (compatible with SectionNewArrivals/BestDeals fallback)
        console.log('🏠 Generating homepage.json...');
        const homepageData = {
            categories,
            featuredProducts: products.filter(p => p.is_featured),
            dealProducts: products.filter(p => p.is_deal),
            trendingProducts: products.filter(p => p.is_trending),
            lastUpdated: new Date().toISOString(),
            version: '2.1'
        };
        fs.writeFileSync(
            path.join(publicDataDir, 'homepage.json'),
            JSON.stringify(homepageData, null, 2)
        );

        // 6. Generate Manifest for Optimization
        console.log('📊 Generating static-data/manifest.json...');
        const manifest = {
            products: products.reduce((acc, p) => ({ ...acc, [p.id]: p }), {}),
            categories: categories.reduce((acc, c) => ({ ...acc, [c.id]: c }), {}),
            collections: {
                featured: products.filter(p => p.is_featured).map(p => p.id),
                trending: products.filter(p => p.is_trending).map(p => p.id),
                bestDeals: products.filter(p => p.is_deal).map(p => p.id),
            },
            lastUpdated: new Date().toISOString(),
            version: Date.now()
        };
        fs.writeFileSync(
            path.join(staticDataDir, 'manifest.json'),
            JSON.stringify(manifest, null, 2)
        );

        console.log('✨ Database sync completed successfully!');
    } catch (err) {
        console.error('❌ Sync failed:', err);
        process.exit(1);
    }
}

sync();
