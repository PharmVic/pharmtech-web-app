import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase client with the service role key to bypass client RLS for the query
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");

        if (!token) {
            return NextResponse.json({ error: "Unauthorized: Missing Token" }, { status: 401 });
        }

        // Verify the user token securely via Supabase Auth
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);

        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized: Invalid Token" }, { status: 401 });
        }

        const email = user.email;
        if (!email) {
            return NextResponse.json({ error: "User has no email" }, { status: 400 });
        }

        // Fetch applications matching the user's email
        const { data: applications, error: appError } = await supabase
            .from("apprenticeship_applications")
            .select("*")
            .eq("email", email)
            .order("created_at", { ascending: false });

        if (appError) {
            throw appError;
        }

        return NextResponse.json({ applications: applications || [] });
    } catch (err: any) {
        console.error("Error fetching user apprenticeship applications:", err);
        return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
    }
}
