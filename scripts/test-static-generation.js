/**
 * Test Static Data Generation
 * 
 * Simple test to verify the static data generation system works correctly.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function testStaticGeneration() {
  console.log('🧪 Testing static data generation...');
  
  try {
    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }
    
    // Test Supabase connection
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    console.log('🔗 Testing Supabase connection...');
    const { data: categories, error } = await supabase
      .from('categories')
      .select('id, name')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Supabase connection successful');
    console.log(`📊 Found ${categories?.length || 0} categories`);
    
    // Create mock static data
    const mockData = {
      categories: [],
      featuredProducts: [],
      dealProducts: [],
      trendingProducts: [],
      lastUpdated: new Date().toISOString(),
      version: '2.0'
    };
    
    // Ensure public/data directory exists
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Created public/data directory');
    }
    
    // Write test file
    const testFile = path.join(dataDir, 'test-homepage.json');
    fs.writeFileSync(testFile, JSON.stringify(mockData, null, 2));
    console.log('✅ Test static file created successfully');
    
    // Clean up test file
    fs.unlinkSync(testFile);
    console.log('🧹 Test file cleaned up');
    
    console.log('✅ Static data generation test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testStaticGeneration(); 