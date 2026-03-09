import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpdate() {
    console.log("Testing update...");
    // Let's try to fetch a product first to get a valid ID
    const { data: products, error: fetchError } = await supabase.from('products').select('id').limit(1);
    if (fetchError) {
        console.error("Fetch Error:", fetchError);
        return;
    }

    if (!products || products.length === 0) {
        console.log("No products found to test update.");
        return;
    }

    const productId = products[0].id;
    console.log("Found product ID:", productId);

    const { data, error } = await supabase
        .from('products')
        .update({
            image_urls: ['https://example.com/image.jpg']
        })
        .eq('id', productId);

    if (error) {
        console.error("Update Error:", error);
        console.log("Stringified update error:", JSON.stringify(error, null, 2));
    } else {
        console.log("Update successful!", data);
    }
}

testUpdate();
