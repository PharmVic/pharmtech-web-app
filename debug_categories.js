const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
try {
    const envContent = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf8');
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/"/g, ''); // Simple cleanup
            process.env[key] = val;
        }
    });
} catch (e) {
    console.log("Could not read .env.local");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Env Vars.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugCategories() {
    console.log("Checking categories in DB...");
    const { data, error } = await supabase.from('product_categories').select('*');

    if (error) {
        console.error("Supabase Query Error:", JSON.stringify(error, null, 2));
    } else {
        console.log(`Found ${data.length} categories.`);
        data.forEach(c => console.log(`- [${c.slug}] ${c.name}`));
    }
}

debugCategories();
