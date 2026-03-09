const supabaseUrl = 'https://tibpiutltoaagkxilayc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpYnBpdXRsdG9hYWdreGlsYXljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzYzNTcsImV4cCI6MjA4NDI1MjM1N30.a0TVKV62jL__P-EcIR9qB7ZAStM99Co2krl6DkOd5FA';

fetch(`${supabaseUrl}/rest/v1/product_categories?select=slug,name`, {
    headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
    }
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(err => console.error(err));
