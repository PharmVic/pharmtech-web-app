const supabaseUrl = 'https://tibpiutltoaagkxilayc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpYnBpdXRsdG9hYWdreGlsYXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzYzNTcsImV4cCI6MjA4NDI1MjM1N30.a0TVKV62jL__P-EcIR9qB7ZAStM99Co2krl6DkOd5FA';

async function checkProducts() {
    try {
        const catRes = await fetch(`${supabaseUrl}/rest/v1/product_categories?select=id,slug,name`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const categories = await catRes.json();

        const prodRes = await fetch(`${supabaseUrl}/rest/v1/products?select=id,name,category_id`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const products = await prodRes.json();

        console.log("Categories:");
        console.table(categories);

        console.log("\nProducts:");
        console.table(products.map(p => ({
            ...p,
            category_name: categories.find(c => c.id === p.category_id)?.name || 'UNKNOWN'
        })));

    } catch (err) {
        console.error(err);
    }
}
checkProducts();
