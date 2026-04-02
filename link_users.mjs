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
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

async function linkOrphanedApplications() {
    console.log("Searching for orphaned instalments...");

    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError || !users) {
        console.error("Failed to list users:", authError);
        return;
    }
    
    const emailToUserId = {};
    for (const user of users) {
        if (user.email) emailToUserId[user.email.toLowerCase()] = user.id;
    }

    const { data: apps, error: fetchError } = await supabaseAdmin
        .from('instalment_applications')
        .select('*')
        .is('user_id', null);

    if (fetchError) {
        console.error("Failed to fetch apps:", fetchError);
        return;
    }

    console.log(`Found ${apps.length} orphaned applications.`);

    let fixedCount = 0;
    for (const app of apps) {
        if (app.email) {
            const uid = emailToUserId[app.email.toLowerCase()];
            if (uid) {
                console.log(`Linking app ${app.id} to user ${uid} (${app.email})`);
                await supabaseAdmin.from('instalment_applications').update({ user_id: uid }).eq('id', app.id);
                // Important: Also update any related schedules that might be orphaned
                await supabaseAdmin.from('instalment_schedules').update({ user_id: uid }).eq('application_id', app.id);
                fixedCount++;
            } else {
                console.log(`Could not find an account for email: ${app.email}`);
            }
        }
    }
    
    console.log(`Successfully linked ${fixedCount} orphaned records. Check the client dashboard now!`);
}

linkOrphanedApplications();
