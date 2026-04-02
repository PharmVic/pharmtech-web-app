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

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: schedules } = await supabase.from('instalment_schedules').select('*');
    console.log("Total schedules:", schedules?.length);
    console.log("Sample schedules:", schedules?.slice(0, 3));
    
    const { data: apps } = await supabase.from('instalment_applications').select('*');
    console.log("\nTotal apps:", apps?.length);
    console.log("Sample apps:", apps?.slice(0, 2));
}

check();
