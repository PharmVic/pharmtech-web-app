import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
        // Fetch the application
        const { data: appData, error: appError } = await supabase
          .from('instalment_applications')
          .select('*')
          .eq('id', applicationId)
          .single();

        if (appData && !appError) {
          const duration = appData.duration_months || 0;
          const monthlyFee = appData.monthly_payment_amount || 0;
          
          if (duration > 0 && monthlyFee > 0) {
            // Generate the schedules exactly 30 days apart incrementally
            const schedules = [];
            for (let i = 1; i <= duration; i++) {
              const dueDate = new Date();
              dueDate.setDate(dueDate.getDate() + (30 * i));
              
              schedules.push({
                application_id: applicationId,
                user_id: userId,
                amount_due: monthlyFee,
                due_date: dueDate.toISOString(),
                status: 'pending'
              });
            }

            // Bulk Insert
            await supabase.from('instalment_schedules').insert(schedules);

            // Update application status to active, meaning down-payment cleared and schedules built.
            await supabase.from('instalment_applications').update({ status: 'active' }).eq('id', applicationId);
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
    return NextResponse.json({ success: false, message: error.message || 'Internal server error' }, { status: 500 });
  }
}
