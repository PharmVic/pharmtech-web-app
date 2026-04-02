import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Very basic manual `.env.local` parser
const envData = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf-8');
envData.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        process.env[match[1]] = match[2].replace('\r', '');
    }
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function backfill() {
    console.log("Starting backfill for old instalment applications...");

    // 1. Fetch all applications
    const { data: apps, error: fetchError } = await supabase
        .from('instalment_applications')
        .select('*, products(name, instalment_down_payment)');
        
    if (fetchError) {
        console.error("Failed to fetch applications:", fetchError);
        return;
    }

    console.log(`Found ${apps.length} total applications.`);

    // 2. Fix static snapshots
    let fixCount = 0;
    for (const app of apps) {
        if (app.down_payment_amount == null || app.product_name_snapshot == null) {
            const dp = app.products?.instalment_down_payment || 0;
            const name = app.products?.name || "Product";
            
            console.log(`Fixing app ${app.id} snapshot: DP=${dp}, Name=${name}`);
            
            const { error: updateError } = await supabase
                .from('instalment_applications')
                .update({ 
                    down_payment_amount: dp,
                    product_name_snapshot: name
                })
                .eq('id', app.id);
                
            if (updateError) {
                console.error("Failed to fix snapshot for", app.id, updateError);
            } else {
                fixCount++;
            }
        }
    }
    console.log(`Fixed static snapshots for ${fixCount} applications.`);

    // 3. Backfill schedules
    const { data: allSchedules, error: schedError } = await supabase
        .from('instalment_schedules')
        .select('application_id');
        
    if (schedError) {
        console.error("Failed to fetch schedules:", schedError);
        return;
    }
    
    const applicationsWithSchedules = new Set(allSchedules.map(s => s.application_id));
    
    let schedulesCreated = 0;
    for (const app of apps) {
        if (!applicationsWithSchedules.has(app.id)) {
            const duration = app.duration_months || 0;
            const monthlyFee = app.monthly_payment_amount || 0;
            
            if (duration > 0 && monthlyFee > 0) {
                console.log(`Generating ${duration} schedules for app ${app.id}...`);
                const schedules = [];
                for (let i = 1; i <= duration; i++) {
                    const dueDate = new Date(app.created_at || new Date());
                    dueDate.setDate(dueDate.getDate() + (30 * i));
                    
                    schedules.push({
                        application_id: app.id,
                        user_id: app.user_id,
                        amount_due: monthlyFee,
                        due_date: dueDate.toISOString(),
                        status: 'pending'
                    });
                }
                
                const { error: insertError } = await supabase
                    .from('instalment_schedules')
                    .insert(schedules);
                    
                if (insertError) {
                    console.error("Failed to insert schedules for", app.id, insertError);
                } else {
                    schedulesCreated += schedules.length;
                    applicationsWithSchedules.add(app.id);
                }
            }
        }
    }
    console.log(`Successfully backfilled ${schedulesCreated} schedules for legacy applications.`);
    console.log("Done!");
}

backfill();
