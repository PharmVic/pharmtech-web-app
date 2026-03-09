const supabaseUrl = 'https://tibpiutltoaagkxilayc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpYnBpdXRsdG9hYWdreGlsYXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzYzNTcsImV4cCI6MjA4NDI1MjM1N30.a0TVKV62jL__P-EcIR9qB7ZAStM99Co2krl6DkOd5FA';

const categoryId = '2a83ce5d-e3f4-4bc0-98d2-1d59e840274e';

async function checkQuery() {
    try {
        const prodRes = await fetch(`${supabaseUrl}/rest/v1/products?select=*&category_id=eq.${categoryId}&order=is_featured.desc,created_at.desc`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const products = await prodRes.json();

        console.log("\nProducts API Result:");
        console.log(JSON.stringify(products, null, 2));

    } catch (err) {
        console.error(err);
    }
}
checkQuery();
