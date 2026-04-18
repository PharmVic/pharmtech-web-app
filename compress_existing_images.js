const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const sharp = require('sharp');

const envFile = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && val) env[key.trim()] = val.join('=').trim().replace(/"/g, '');
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_MAX_SIZE = 200 * 1024; // 200kb
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.heic'];

async function compressImageCache() {
    const buckets = ['products', 'past-installations', 'kyc-documents'];

    for (const bucket of buckets) {
        console.log(`Processing bucket: ${bucket}`);
        const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1000 });
        if (error) {
            console.error(`Error listing bucket ${bucket}:`, error);
            continue;
        }

        for (const file of data) {
            if (file.name === '.emptyFolderPlaceholder') continue;
            
            const ext = '.' + file.name.split('.').pop().toLowerCase();
            const isImage = IMAGE_EXTENSIONS.includes(ext) || file.metadata?.mimetype?.startsWith('image/');
            
            if (isImage && file.metadata?.size > TARGET_MAX_SIZE) {
                console.log(`Found large image: ${file.name} (${Math.round(file.metadata.size / 1024)} KB)`);
                try {
                    // 1. Download file
                    const { data: fileData, error: downloadError } = await supabase.storage.from(bucket).download(file.name);
                    if (downloadError) throw downloadError;
                    
                    const buffer = await fileData.arrayBuffer();
                    
                    // 2. Compress image using sharp
                    const compressedBuffer = await sharp(Buffer.from(buffer))
                        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
                        .jpeg({ quality: 80 }) // Fallback, could be better to use original format
                        .toBuffer();
                        
                    console.log(` -> Compressed to ${Math.round(compressedBuffer.length / 1024)} KB`);

                    // 3. Re-upload file
                    const contentType = file.metadata?.mimetype || 'image/jpeg';
                    const { error: uploadError } = await supabase.storage.from(bucket).upload(file.name, compressedBuffer, {
                        cacheControl: '31536000',
                        upsert: true,
                        contentType
                    });
                    
                    if (uploadError) throw uploadError;
                    console.log(` -> Success: Re-uploaded ${file.name}`);
                } catch (err) {
                    console.error(` -> Failed to process ${file.name}:`, err);
                }
            }
        }
    }
    console.log("Compression script finished.");
}

compressImageCache();
