const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkStatus() {
    const { count: total, error: e1 } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: published, error: e2 } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_published', true);
    const { data: categories, error: e3 } = await supabase.from('categories').select('name, slug, id').eq('is_active', true);

    console.log({
        totalCount: total,
        publishedCount: published,
        categoriesCount: categories?.length,
        errors: { e1, e2, e3 }
    });

    if (published === 0 && total > 0) {
        const { data: sample } = await supabase.from('products').select('name, is_published, status').limit(5);
        console.log('Sample Products:', sample);
    }
}

checkStatus();
