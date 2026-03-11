import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { reference, email, phone, amount, location, deliveryDate, items } = body;

    if (!reference) {
      return NextResponse.json({ success: false, message: 'Reference is required' }, { status: 400 });
    }

    // Verify transaction with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const paystackData = await paystackResponse.json();

    if (paystackData.data && paystackData.data.status === 'success') {
      // Transaction successful, save to database
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
          },
        ]);

      if (error) {
        console.error('Error saving payment to database:', error);
        // We still return success: false or true here? True since they technically paid, but with a warning.
        return NextResponse.json({ success: true, saved: false, message: 'Payment verified but not saved to DB' });
      }

      return NextResponse.json({ success: true, message: 'Payment verified and saved' });
    } else {
       return NextResponse.json({ success: false, message: 'Payment verification failed' }, { status: 400 });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
