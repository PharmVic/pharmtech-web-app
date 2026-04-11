import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// Use service role key to bypass RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper to verify admin
async function verifyAdmin(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return { error: 'Missing authorization header', status: 401 };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return { error: 'Invalid token', status: 401 };
    }

    // Check if they are admin in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return { error: 'Forbidden: Admins only', status: 403 };
    }

    return { user };
}

export async function GET(req: Request) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (adminCheck.error) {
        return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    // Fetch all orders
    const { data: orders, error } = await supabaseAdmin
      .from('payments')
      .select('*')
      .order('id', { ascending: false }); // or created_at if id is uuid

    if (error) {
      console.error('Error fetching orders:', error);
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (adminCheck.error) {
        return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { id, fulfillment_status } = await req.json();

    if (!id || !fulfillment_status) {
        return NextResponse.json({ error: 'Missing id or fulfillment_status' }, { status: 400 });
    }

    // Update fulfillment_status
    // Note: This assumes the column 'fulfillment_status' exists.
    // If it throws an error in the UI, we'll gracefully handle it or they can add it via SQL.
    const { data, error } = await supabaseAdmin
      .from('payments')
      .update({ fulfillment_status })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating fulfillment status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, order: data?.[0] });

  } catch (error) {
    console.error('Admin orders patch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
