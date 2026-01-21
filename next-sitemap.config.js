/** @type {import('next-sitemap').IConfig} */
const { createClient } = require('@supabase/supabase-js');

module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
  },
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  additionalPaths: async () => {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get all active products
    const { data: products } = await supabase
      .from('products')
      .select('slug')
      .eq('status', 'active');

    // Get all active categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug')
      .eq('is_active', true);

    // Get all active blog posts
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('status', 'published');

    const paths = [];

    // Add product paths
    if (products) {
      paths.push(
        ...products.map(p => ({
          loc: `/products/${p.slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'daily',
          priority: 0.8,
        }))
      );
    }

    // Add category paths
    if (categories) {
      paths.push(
        ...categories.map(c => ({
          loc: `/category/${c.slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.9,
        }))
      );
    }

    // Add blog post paths
    if (posts) {
      paths.push(
        ...posts.map(p => ({
          loc: `/blog/${p.slug}`,
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.7,
        }))
      );
    }

    return paths;
  },
};
