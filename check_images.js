const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val) env[key.trim()] = val.join('=').trim().replace(/"/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const buckets = ['products', 'assets', 'past-installations', 'kyc-documents'];
    for (const bucket of buckets) {
        let count = 0;
        let largeCount = 0;
        const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1000 });
        if (error) {
            console.error(`Error listing bucket ${bucket}:`, error);
            continue;
        }
        for (const file of data) {
            if (file.name === '.emptyFolderPlaceholder') continue;
            count++;
            if (file.metadata?.size > 200 * 1024) {
                largeCount++;
            }
        }
        console.log(`Bucket ${bucket}: ${count} total files, ${largeCount} files > 200kb`);
    }
}

check();
