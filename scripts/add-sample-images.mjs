import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://tafojbtftmihrheeyoky.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhZm9qYnRmdG1paHJoZWV5b2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3Mzk3MTYsImV4cCI6MjA2MDMxNTcxNn0.vdL2odCYREv1GykTt8wx76lmhaHmDkBYcC65L4Z_vXo';

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample toy images from Unsplash (free to use)
const sampleImages = [
  {
    web_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center',
    feed_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop&crop=center',
    alt: 'Toy Car'
  },
  {
    web_image_url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=400&fit=crop&crop=center',
    feed_image_url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&h=800&fit=crop&crop=center',
    alt: 'Building Blocks'
  },
  {
    web_image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&crop=center',
    feed_image_url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop&crop=center',
    alt: 'Toy Truck'
  },
  {
    web_image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop&crop=center',
    feed_image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=800&fit=crop&crop=center',
    alt: 'Teddy Bear'
  },
  {
    web_image_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=400&fit=crop&crop=center',
    feed_image_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=800&fit=crop&crop=center',
    alt: 'Toy Airplane'
  },
  {
    web_image_url: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=400&h=400&fit=crop&crop=center',
    feed_image_url: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&h=800&fit=crop&crop=center',
    alt: 'Toy Train'
  },
  {
    web_image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400&h=400&fit=crop&crop=center',
    feed_image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&h=800&fit=crop&crop=center',
    alt: 'Puzzle Toy'
  },
  {
    web_image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center',
    feed_image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop&crop=center',
    alt: 'Wooden Toys'
  },
  {
    web_image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&h=400&fit=crop&crop=center',
    feed_image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=800&fit=crop&crop=center',
    alt: 'Colorful Toys'
  },
  {
    web_image_url: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&h=400&fit=crop&crop=center',
    feed_image_url: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&h=800&fit=crop&crop=center',
    alt: 'Action Figure'
  }
];

async function addSampleImages() {
  try {
    console.log('🔍 Fetching products without images...');
    
    // Get products that have empty images array
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, images')
      .eq('status', 'active')
      .limit(20);

    if (fetchError) {
      console.error('❌ Error fetching products:', fetchError);
      return;
    }

    if (!products || products.length === 0) {
      console.log('📝 No active products found. Let me create some sample products first...');
      
      // Create sample products
      const sampleProducts = [
        {
          name: 'Remote Control Car',
          slug: 'remote-control-car',
          description: 'High-speed remote control car perfect for outdoor fun',
          price: 2500,
          compare_at_price: 3000,
          sku: 'TOT-RC001',
          stock: 15,
          status: 'active',
          is_featured: true,
          images: [sampleImages[0]]
        },
        {
          name: 'Building Blocks Set',
          slug: 'building-blocks-set',
          description: 'Creative building blocks set with 100+ pieces',
          price: 1800,
          sku: 'TOT-BB001',
          stock: 25,
          status: 'active',
          is_trending: true,
          images: [sampleImages[1]]
        },
        {
          name: 'Toy Truck',
          slug: 'toy-truck',
          description: 'Durable toy truck for construction play',
          price: 1200,
          sku: 'TOT-TR001',
          stock: 30,
          status: 'active',
          is_featured: true,
          images: [sampleImages[2]]
        },
        {
          name: 'Teddy Bear',
          slug: 'teddy-bear',
          description: 'Soft and cuddly teddy bear for comfort',
          price: 800,
          sku: 'TOT-TB001',
          stock: 20,
          status: 'active',
          images: [sampleImages[3]]
        },
        {
          name: 'Toy Airplane',
          slug: 'toy-airplane',
          description: 'Flying toy airplane with realistic sounds',
          price: 1500,
          compare_at_price: 2000,
          sku: 'TOT-AP001',
          stock: 12,
          status: 'active',
          is_deal: true,
          images: [sampleImages[4]]
        }
      ];

      const { data: newProducts, error: insertError } = await supabase
        .from('products')
        .insert(sampleProducts)
        .select();

      if (insertError) {
        console.error('❌ Error creating sample products:', insertError);
        return;
      }

      console.log(`✅ Created ${newProducts.length} sample products with images`);
      return;
    }

    console.log(`📦 Found ${products.length} products`);

    // Update products that have empty or missing images
    let updatedCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const currentImages = product.images || [];
      
      // Skip if product already has images
      if (Array.isArray(currentImages) && currentImages.length > 0) {
        console.log(`⏭️  Skipping "${product.name}" - already has images`);
        continue;
      }

      // Assign a random sample image
      const randomImage = sampleImages[i % sampleImages.length];
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          images: [randomImage]
        })
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Error updating product ${product.name}:`, updateError);
        continue;
      }

      console.log(`✅ Updated "${product.name}" with sample image`);
      updatedCount++;
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} products with sample images!`);
    console.log('🚀 Your images should now be visible on the website.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
addSampleImages(); 