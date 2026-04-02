import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
    try {
        const { applicationId, userId } = await req.json();

        if (!applicationId || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Initialize Supabase with service role key to bypass RLS for this secure atomic operation
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Verify the application belongs to the user
        const { data: application, error: fetchError } = await supabase
            .from("instalment_applications")
            .select("user_id, status")
            .eq("id", applicationId)
            .single();

        if (fetchError || !application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        if (application.user_id !== userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        if (application.status !== "pending") {
            return NextResponse.json({ error: "Only pending applications can be cancelled" }, { status: 400 });
        }

        // Update application status to cancelled
        const { error: updateAppError } = await supabase
            .from("instalment_applications")
            .update({ status: "cancelled" })
            .eq("id", applicationId);

        if (updateAppError) {
            console.error("Error cancelling application:", updateAppError);
            return NextResponse.json({ error: "Failed to cancel application" }, { status: 500 });
        }

        // Also cancel related schedules
        await supabase
            .from("instalment_schedules")
            .update({ status: "cancelled" })
            .eq("application_id", applicationId);

        return NextResponse.json({ success: true, message: "Application cancelled successfully" });
    } catch (error: any) {
        console.error("Cancel API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
