#!/usr/bin/env node

/**
 * Script to manually revalidate cache for homepage categories
 * Run this after deploying changes that affect category/product queries
 */

const SITE_URL = process.env.SITE_URL || 'https://your-site.com';

async function revalidateCache() {
  try {
    console.log('🔄 Revalidating cache...');
    
    const response = await fetch(`${SITE_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags: ['homepage-categories', 'products', 'categories']
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Cache revalidated successfully:', result);
    } else {
      const error = await response.text();
      console.error('❌ Failed to revalidate cache:', error);
    }
  } catch (error) {
    console.error('❌ Error revalidating cache:', error.message);
  }
}

// Run the revalidation
revalidateCache(); 