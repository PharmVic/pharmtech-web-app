import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendTikTokEvent } from '@/lib/tiktok';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reference, email, phone, amount, location, deliveryDate, items, userId, applicationId } = body;

    if (!reference) {
      return NextResponse.json({ success: false, message: 'Reference is required' }, { status: 400 });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.error('CRITICAL ERROR: PAYSTACK_SECRET_KEY is strictly undefined on the server.');
      return NextResponse.json({ success: false, message: 'Backend Configuration Error: Secret Key is entirely missing from the live server environment variables.' }, { status: 500 });
    }

    if (process.env.PAYSTACK_SECRET_KEY.startsWith('pk_')) {
      console.error('CRITICAL ERROR: A public key was provided instead of a secret key.');
      return NextResponse.json({ success: false, message: 'Backend Configuration Error: You accidentally pasted a Public Key (pk_) into the Secret Key setting in Vercel. It must be sk_live_...' }, { status: 500 });
    }

    // ... paystack verification ...
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      cache: 'no-store'
    });

    const paystackData = await paystackResponse.json();

    if (paystackData.data && paystackData.data.status === 'success') {
      
      // INSTALMENT PROCESSING LOGIC
      if (applicationId) {
        // Fetch the application just to make sure it exists
        const { data: appData, error: appError } = await supabase
          .from('instalment_applications')
          .select('*')
          .eq('id', applicationId)
          .single();

        if (appData && !appError) {
            // Update application status to active, meaning down-payment cleared. 
            // Schedules are generated here since the application is now officially active.
            await supabase.from('instalment_applications').update({ status: 'active' }).eq('id', applicationId);
            
            // Generate schedules if they don't already exist for this application
            const { data: existingSchedules } = await supabase.from('instalment_schedules').select('id').eq('application_id', applicationId);
            
            if (!existingSchedules || existingSchedules.length === 0) {
                const durationMonths = appData.duration_months;
                const monthlyPayment = appData.monthly_payment_amount;

                if (durationMonths && monthlyPayment > 0) {
                    const schedules = [];
                    for (let i = 1; i <= durationMonths; i++) {
                      const dueDate = new Date();
                      dueDate.setDate(dueDate.getDate() + (30 * i));
                      
                      schedules.push({
                        application_id: applicationId,
                        user_id: appData.user_id,
                        amount_due: monthlyPayment,
                        due_date: dueDate.toISOString(),
                        status: 'pending'
                      });
                    }
                    // Service key handles this insert
                    await supabase.from('instalment_schedules').insert(schedules);
                }
            }
        } else {
            console.error("Failed to find application or fetch error:", appError);
        }
      }

      // Transaction successful, save base checkout record to database
      const { error } = await supabase
        .from('payments')
        .insert([
          {
            reference: reference,
            amount: amount,
            email: email,
            phone: phone,
            location: location,
            delivery_date: deliveryDate,
            items: items,
            status: 'success',
            user_id: userId || null, // newly added
          },
        ]);

      if (error) {
        console.error('Error saving payment to database:', error);
        // We still return success: false or true here? True since they technically paid, but with a warning.
        return NextResponse.json({ success: true, saved: false, message: 'Payment verified but not saved to DB' });
      }

      // Track the successful Purchase on TikTok Events API
      sendTikTokEvent({
          event: "Purchase",
          user: {
              email: email || undefined,
              phone: phone || undefined,
          },
          properties: {
              content_type: "product_group",
              content_id: items?.map((item: any) => item.id).join(',') || "",
              value: amount,
              currency: "NGN",
              contents: items?.map((item: any) => ({
                  content_id: item.id,
                  content_name: item.name,
                  quantity: item.quantity,
                  price: item.price
              })) || []
          }
      }).catch(err => console.error("TikTok Tracking Error:", err));

      return NextResponse.json({ success: true, message: 'Payment verified and saved' });
    } else {
       console.error('Payment verification failed at Paystack:', paystackData);
       return NextResponse.json({ 
         success: false, 
         message: paystackData.message || 'Payment verification failed',
         paystackData 
       }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, message: 'An internal verification error occurred. Please contact support.' }, { status: 500 });
  }
}
