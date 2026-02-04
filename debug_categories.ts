import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugCategories() {
    console.log("Checking categories...")
    const { data, error } = await supabase.from('product_categories').select('*');
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Categories found:", data);
    }
}

debugCategories();
