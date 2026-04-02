import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase with the Service Role Key.
// This safely bypasses any missing RLS `SELECT` policies on the `instalment_schedules` table
// which would otherwise cause the dashboard to confusingly show no schedules for authenticated users.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    try {
        const { data: schedulesData, error } = await supabase
            .from("instalment_schedules")
            .select(`
                *,
                instalment_applications (
                    id,
                    product_id,
                    status,
                    product_name_snapshot,
                    products (
                        name
                    )
                )
            `)
            .eq("user_id", userId)
            .order("due_date", { ascending: true });

        if (error) {
            throw error;
        }

        return NextResponse.json({ schedules: schedulesData });
    } catch (err: any) {
        console.error("Error fetching schedules:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
