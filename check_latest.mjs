import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envData = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf-8');
envData.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].replace('\r', '');
});

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchedules() {
    const { data: schedules } = await supabaseAdmin
        .from('instalment_schedules')
        .select('*')
        .eq('application_id', 'e0678c83-6c64-497d-9be1-1676f0ad95f5');
        
    console.log("Schedules:");
    console.dir(schedules, { depth: null });
}

checkSchedules();
