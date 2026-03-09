const supabaseUrl = 'https://tibpiutltoaagkxilayc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpYnBpdXRsdG9hYWdreGlsYXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzYzNTcsImV4cCI6MjA4NDI1MjM1N30.a0TVKV62jL__P-EcIR9qB7ZAStM99Co2krl6DkOd5FA';

async function checkProducts() {
    try {
        const prodRes = await fetch(`${supabaseUrl}/rest/v1/products?select=*`, {
            headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
        });
        const products = await prodRes.json();

        console.log("\nProducts Full Data:");
        console.log(JSON.stringify(products, null, 2));

    } catch (err) {
        console.error(err);
    }
}
checkProducts();
