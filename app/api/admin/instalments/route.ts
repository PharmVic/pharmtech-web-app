import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper to check if down_payment_paid_at column exists in instalment_applications
let hasCheckedDownPaymentCols = false;
let hasDownPaymentCols = false;

async function checkDownPaymentColumns() {
  if (hasCheckedDownPaymentCols) return hasDownPaymentCols;
  try {
    const { error } = await supabaseAdmin
      .from('instalment_applications')
      .select('down_payment_paid_at')
      .limit(1);
    hasDownPaymentCols = !error;
  } catch {
    hasDownPaymentCols = false;
  }
  hasCheckedDownPaymentCols = true;
  return hasDownPaymentCols;
}

// Verify admin privilege via Bearer token
async function verifyAdmin(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { error: 'Missing authorization header', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return { error: 'Invalid or expired token', status: 401 };
  }

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

// GET /api/admin/instalments - Fetch all instalment applications and their schedules
export async function GET(req: Request) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { data: applications, error } = await supabaseAdmin
      .from('instalment_applications')
      .select(`
        *,
        products (
          id,
          name,
          price,
          instalment_down_payment
        ),
        instalment_schedules (
          id,
          status,
          due_date,
          amount_due,
          paid_at,
          paystack_reference,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ applications: applications || [] });
  } catch (error: any) {
    console.error('GET /api/admin/instalments error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/instalments - Handle admin manual actions
export async function POST(req: Request) {
  try {
    const adminCheck = await verifyAdmin(req);
    if (adminCheck.error) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await req.json();
    const { action, applicationId, scheduleId, paymentMethod, reference, paidAt } = body;

    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter' }, { status: 400 });
    }

    const hasCols = await checkDownPaymentColumns();
    const effectivePaidAt = paidAt || new Date().toISOString();

    // 1. APPROVE APPLICATION (Paused -> Approved)
    if (action === 'approve') {
      if (!applicationId) return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });

      const { data, error } = await supabaseAdmin
        .from('instalment_applications')
        .update({ status: 'approved' })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, application: data, message: 'Application approved successfully.' });
    }

    // 2. REJECT APPLICATION
    if (action === 'reject') {
      if (!applicationId) return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });

      const { data, error } = await supabaseAdmin
        .from('instalment_applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, application: data, message: 'Application marked as rejected.' });
    }

    // 3. CONFIRM DOWN PAYMENT MANUALLY
    if (action === 'confirm_down_payment') {
      if (!applicationId) return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });

      // Fetch application details
      const { data: appData, error: appError } = await supabaseAdmin
        .from('instalment_applications')
        .select('*, products (name, instalment_down_payment)')
        .eq('id', applicationId)
        .single();

      if (appError || !appData) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      const productObj = Array.isArray(appData.products) ? appData.products[0] : appData.products;
      const downPaymentAmount = Number(appData.down_payment_amount != null 
        ? appData.down_payment_amount 
        : ((productObj as any)?.instalment_down_payment || 0));

      const paymentRef = reference?.trim() || `MANUAL_DOWN_PAYMENT_${(paymentMethod || 'OFFLINE').toUpperCase()}_${Date.now()}`;

      // Build update payload
      const updatePayload: Record<string, any> = {
        status: 'active' // Application is now active
      };
      if (hasCols) {
        updatePayload.down_payment_paid_at = effectivePaidAt;
        updatePayload.down_payment_reference = paymentRef;
      }

      const { data: updatedApp, error: updateError } = await supabaseAdmin
        .from('instalment_applications')
        .update(updatePayload)
        .eq('id', applicationId)
        .select()
        .single();

      if (updateError) throw updateError;

      // Auto-generate payment schedules if they don't already exist
      const { data: existingSchedules } = await supabaseAdmin
        .from('instalment_schedules')
        .select('id')
        .eq('application_id', applicationId);

      let generatedSchedules: any[] = [];
      if (!existingSchedules || existingSchedules.length === 0) {
        const durationMonths = appData.duration_months || 3;
        const monthlyPayment = Number(appData.monthly_payment_amount || 0);

        if (durationMonths > 0 && monthlyPayment > 0) {
          const schedulesToInsert = [];
          const baseDate = new Date(effectivePaidAt);

          for (let i = 1; i <= durationMonths; i++) {
            const dueDate = new Date(baseDate);
            dueDate.setDate(dueDate.getDate() + (30 * i));

            schedulesToInsert.push({
              application_id: applicationId,
              user_id: appData.user_id,
              amount_due: monthlyPayment,
              due_date: dueDate.toISOString(),
              status: 'pending'
            });
          }

          const { data: inserted, error: schedError } = await supabaseAdmin
            .from('instalment_schedules')
            .insert(schedulesToInsert)
            .select();

          if (schedError) {
            console.error('Error generating schedules:', schedError);
          } else {
            generatedSchedules = inserted || [];
          }
        }
      }

      // Log manual down payment in payments table for record keeping
      try {
        await supabaseAdmin.from('payments').insert([
          {
            reference: paymentRef,
            amount: downPaymentAmount,
            email: appData.email,
            phone: appData.phone,
            location: appData.address,
            delivery_date: 'N/A (Instalment Down Payment Confirmed)',
            items: [
              {
                name: `Instalment Down Payment - ${appData.product_name_snapshot || (productObj as any)?.name || 'Product'}`,
                price: downPaymentAmount,
                quantity: 1
              }
            ],
            status: 'success',
            user_id: appData.user_id || null,
            fulfillment_status: 'confirmed'
          }
        ]);
      } catch (payErr) {
        console.warn('Could not insert payment log for down payment:', payErr);
      }

      return NextResponse.json({
        success: true,
        application: updatedApp,
        generatedSchedules,
        message: 'Down payment confirmed successfully! Payment plan is now active.'
      });
    }

    // 4. REVERT DOWN PAYMENT (e.g. if marked paid in error)
    if (action === 'revert_down_payment') {
      if (!applicationId) return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });

      const updatePayload: Record<string, any> = {
        status: 'approved'
      };
      if (hasCols) {
        updatePayload.down_payment_paid_at = null;
        updatePayload.down_payment_reference = null;
      }

      const { data: revertedApp, error: revertError } = await supabaseAdmin
        .from('instalment_applications')
        .update(updatePayload)
        .eq('id', applicationId)
        .select()
        .single();

      if (revertError) throw revertError;

      return NextResponse.json({
        success: true,
        application: revertedApp,
        message: 'Down payment reverted. Application is back to approved (awaiting payment).'
      });
    }

    // 5. CONFIRM MONTHLY PAYMENT MANUALLY
    if (action === 'confirm_monthly_payment') {
      if (!scheduleId || !applicationId) {
        return NextResponse.json({ error: 'Missing scheduleId or applicationId' }, { status: 400 });
      }

      const paymentRef = reference?.trim() || `MANUAL_MONTHLY_${(paymentMethod || 'OFFLINE').toUpperCase()}_${Date.now()}`;

      // Update schedule to paid
      const { data: updatedSchedule, error: schedError } = await supabaseAdmin
        .from('instalment_schedules')
        .update({
          status: 'paid',
          paid_at: effectivePaidAt,
          paystack_reference: paymentRef
        })
        .eq('id', scheduleId)
        .select()
        .single();

      if (schedError) throw schedError;

      // Check if all schedules for this application are now paid
      const { data: allSchedules } = await supabaseAdmin
        .from('instalment_schedules')
        .select('id, status')
        .eq('application_id', applicationId);

      let appCompleted = false;
      if (allSchedules && allSchedules.length > 0) {
        const hasUnpaid = allSchedules.some(s => s.status !== 'paid');
        if (!hasUnpaid) {
          appCompleted = true;
          await supabaseAdmin
            .from('instalment_applications')
            .update({ status: 'completed' })
            .eq('id', applicationId);
        }
      }

      // Fetch customer and product info for payment logging
      try {
        const { data: appData } = await supabaseAdmin
          .from('instalment_applications')
          .select('email, phone, address, user_id, product_name_snapshot, products (name)')
          .eq('id', applicationId)
          .single();

        if (appData) {
          const productObj = Array.isArray(appData.products) ? appData.products[0] : appData.products;
          await supabaseAdmin.from('payments').insert([
            {
              reference: paymentRef,
              amount: Number(updatedSchedule.amount_due || 0),
              email: appData.email,
              phone: appData.phone,
              location: appData.address,
              delivery_date: 'N/A (Monthly Instalment Confirmed)',
              items: [
                {
                  name: `Monthly Instalment Payment - ${appData.product_name_snapshot || (productObj as any)?.name || 'Product'}`,
                  price: Number(updatedSchedule.amount_due || 0),
                  quantity: 1
                }
              ],
              status: 'success',
              user_id: appData.user_id || null,
              fulfillment_status: 'confirmed'
            }
          ]);
        }
      } catch (payErr) {
        console.warn('Could not insert payment log for monthly schedule:', payErr);
      }

      return NextResponse.json({
        success: true,
        schedule: updatedSchedule,
        appCompleted,
        message: appCompleted 
          ? 'Monthly payment confirmed! All instalments are now fully completed!' 
          : 'Monthly payment confirmed successfully.'
      });
    }

    // 6. REVERT MONTHLY PAYMENT (e.g. marked in error)
    if (action === 'revert_monthly_payment') {
      if (!scheduleId || !applicationId) {
        return NextResponse.json({ error: 'Missing scheduleId or applicationId' }, { status: 400 });
      }

      const { data: updatedSchedule, error: schedError } = await supabaseAdmin
        .from('instalment_schedules')
        .update({
          status: 'pending',
          paid_at: null,
          paystack_reference: null
        })
        .eq('id', scheduleId)
        .select()
        .single();

      if (schedError) throw schedError;

      // If application was marked completed, return it to active
      const { data: currentApp } = await supabaseAdmin
        .from('instalment_applications')
        .select('status')
        .eq('id', applicationId)
        .single();

      if (currentApp?.status === 'completed') {
        await supabaseAdmin
          .from('instalment_applications')
          .update({ status: 'active' })
          .eq('id', applicationId);
      }

      return NextResponse.json({
        success: true,
        schedule: updatedSchedule,
        message: 'Monthly payment reverted to pending.'
      });
    }

    // 7. GENERATE SCHEDULES MANUALLY
    if (action === 'generate_schedules') {
      if (!applicationId) return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });

      const { data: appData, error: appError } = await supabaseAdmin
        .from('instalment_applications')
        .select('*')
        .eq('id', applicationId)
        .single();

      if (appError || !appData) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

      const durationMonths = appData.duration_months;
      const monthlyPayment = Number(appData.monthly_payment_amount || 0);

      if (!durationMonths || monthlyPayment <= 0) {
        return NextResponse.json({ error: 'Duration or monthly payment amount is missing on this application.' }, { status: 400 });
      }

      const schedules = [];
      for (let i = 1; i <= durationMonths; i++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (30 * i));

        schedules.push({
          application_id: appData.id,
          user_id: appData.user_id,
          amount_due: monthlyPayment,
          due_date: dueDate.toISOString(),
          status: 'pending'
        });
      }

      const { data, error } = await supabaseAdmin
        .from('instalment_schedules')
        .insert(schedules)
        .select();

      if (error) throw error;

      return NextResponse.json({ success: true, schedules: data, message: 'Payment schedules generated successfully.' });
    }

    return NextResponse.json({ error: `Unknown action '${action}'` }, { status: 400 });
  } catch (error: any) {
    console.error('POST /api/admin/instalments error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
