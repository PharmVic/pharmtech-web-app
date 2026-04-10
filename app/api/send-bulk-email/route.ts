import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        // 1. Verify Admin Session via Token
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");
        
        if (!token) {
            return NextResponse.json({ error: "Unauthorized: Missing Token" }, { status: 401 });
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        
        if (userError || !user) {
            return NextResponse.json({ error: "Unauthorized: Invalid Token" }, { status: 401 });
        }

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || !profile || profile.role !== "admin") {
            return NextResponse.json({ error: "Forbidden: Admins Only" }, { status: 403 });
        }

        // 2. Parse payload
        const { subject, message, singleEmail } = await req.json();

        if (!subject || !message) {
            return NextResponse.json({ error: "Subject and Message are required" }, { status: 400 });
        }

        // 3. Initialize Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 465,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 4. Fetch Users or Use Single Email
        let targetEmails: string[] = [];

        if (singleEmail) {
            targetEmails = [singleEmail];
        } else {
            const { data: users, error: usersError } = await supabase
                .from("profiles")
                .select("email")
                .not("email", "is", null);
            
            if (usersError || !users) {
                return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
            }
            targetEmails = users.map((u: any) => u.email).filter(Boolean);
        }

        if (targetEmails.length === 0) {
            return NextResponse.json({ error: "No emails found to send to" }, { status: 400 });
        }

        // 5. HTML Template with Logo Fallback
        const htmlContent = `
            <div style="text-align:center; margin-bottom:20px;">
              <img 
                src="https://pharmtechsolar.com/logo.png" 
                alt="Pharmtech Solar"
                width="150"
                style="display:block; margin:auto;"
              />
              <h2 style="font-family:Arial; color:#333;">
                Pharmtech Solar
              </h2>
            </div>
            <div style="font-family:Arial; color:#333; max-width:600px; margin:auto; line-height:1.6;">
                ${message}
            </div>
        `;

        // 6. Background Batch Processing Function
        const sendEmailsBatch = async () => {
            const BATCH_SIZE = 50;
            const DELAY_MS = 200; // Delay between batches
            let successCount = 0;
            let failureCount = 0;
            let errorDetails: string[] = [];

            for (let i = 0; i < targetEmails.length; i += BATCH_SIZE) {
                const batch = targetEmails.slice(i, i + BATCH_SIZE);
                
                const promises = batch.map(email => 
                    transporter.sendMail({
                        from: '"Pharmtech Solar" <noreply@mail.pharmtechsolar.com>',
                        to: email,
                        subject: subject,
                        html: htmlContent,
                    }).then(() => { successCount++; }).catch(err => { 
                        console.error(`Failed sending to ${email}:`, err);
                        errorDetails.push(err.message || String(err));
                        failureCount++; 
                    })
                );

                await Promise.all(promises);

                // Add delay between batches to avoid rate limits
                if (i + BATCH_SIZE < targetEmails.length) {
                    await new Promise(res => setTimeout(res, DELAY_MS));
                }
            }
            
            console.log(`Bulk Email Job Finished. Success: ${successCount}, Failed: ${failureCount}`);
            return { successCount, failureCount, errorDetails };
        };

        // Await the batch process so Vercel doesn't freeze the environment before completion
        const { successCount, failureCount, errorDetails } = await sendEmailsBatch();

        // Reveal the specific error if testing a single email
        if (failureCount > 0 && targetEmails.length === 1) {
            return NextResponse.json({ error: `SMTP Target Error: ${errorDetails[0]}` }, { status: 400 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Email broadcast completed. Success: ${successCount}, Failed: ${failureCount}. ${failureCount > 0 ? `Issues: ${errorDetails.join(', ')}` : ''}`,
            recipientCount: targetEmails.length
        }, { status: 200 });

    } catch (error: any) {
        console.error("Bulk Email Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
