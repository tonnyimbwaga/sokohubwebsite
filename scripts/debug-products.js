const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkProducts() {
    const slugs = [
        'inflatable-mattressairbed-46--free-electric-pump--',
        'rechargeable-headlamp-bright-waterproof-led-headli',
        'kids-electric-piano-49-keys-with-microphone',
        'heavy-duty-electric-ride-on-car---large-capacity-u',
        'outdoor-camping-tent-portable-outdoor-waterproof-t'
    ];

    const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, images')
        .in('slug', slugs);

    if (error) {
        console.error(error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

checkProducts();
