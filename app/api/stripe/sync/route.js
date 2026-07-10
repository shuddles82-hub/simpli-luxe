import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getMemberFromRequest } from '@/lib/auth-server';

// Reconciles a member's Luxe Insider status against Stripe. The webhook
// is the primary path, but this covers the moment right after checkout
// (and works in local development, where Stripe cannot reach the
// webhook). It reads the member's subscriptions and sets the flag.

export const runtime = 'nodejs';

export async function POST(request) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();
  if (!stripe || !admin) return Response.json({ isInsider: false });

  const member = await getMemberFromRequest(request);
  if (!member) return Response.json({ isInsider: false, signedOut: true });

  try {
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id, is_insider')
      .eq('id', member.id)
      .maybeSingle();

    const customerId = profile?.stripe_customer_id;
    if (!customerId) return Response.json({ isInsider: false });

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 20,
    });
    const active = subs.data.some((s) =>
      ['active', 'trialing', 'past_due'].includes(s.status)
    );

    const updates = { is_insider: active };
    if (active && !profile.is_insider) updates.insider_since = new Date().toISOString();
    if (!active) updates.insider_since = null;
    await admin.from('profiles').update(updates).eq('id', member.id);

    return Response.json({ isInsider: active });
  } catch {
    return Response.json({ isInsider: false });
  }
}
