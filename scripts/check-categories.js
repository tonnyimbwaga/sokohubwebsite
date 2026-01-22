require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: categories, error } = await supabase
        .from('categories')
        .select('name, slug')
        .eq('is_active', true);

    if (error) {
        console.error(error);
        return;
    }

    console.log("Active Categories:", categories);

    const { data: products, error: pError } = await supabase
        .from('products')
        .select('name, slug')
        .limit(5);

    if (pError) {
        console.error(pError);
        return;
    }

    console.log("Recent Products:", products);
}

check();
