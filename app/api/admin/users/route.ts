import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
// Use service role key to bypass RLS and access auth schema
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(req: Request) {
  try {
    // 1. Verify caller is actually an admin
    // We need to get the user token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if they are admin in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    // 2. Fetch all users from auth.users (requires service role)
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // 3. Fetch all profiles to get points/referral info
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*');

    if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
    }
    
    // 4. Fetch all payments to aggregate order stats
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('payments')
      .select('user_id, amount');

    if (paymentsError) {
        console.error('Error fetching payments:', paymentsError);
    }

    // 5. Combine data
    const combinedData = users.map((u) => {
        const userProfile = profiles?.find(p => p.id === u.id) || null;
        const userOrders = payments?.filter(p => p.user_id === u.id) || [];
        
        const totalSpent = userOrders.reduce((sum, order) => sum + Number(order.amount), 0);
        const orderCount = userOrders.length;

        return {
            id: u.id,
            email: u.email,
            phone: u.user_metadata?.phone || 'N/A',
            fullName: u.user_metadata?.full_name || 'N/A',
            address: u.user_metadata?.address || 'N/A',
            createdAt: u.created_at,
            lastSignIn: u.last_sign_in_at,
            role: userProfile?.role || 'user',
            points: userProfile?.points_balance || 0,
            referralCode: userProfile?.referral_code || 'N/A',
            totalSpent,
            orderCount
        };
    });

    return NextResponse.json({ users: combinedData });

  } catch (error) {
    console.error('Admin users fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
