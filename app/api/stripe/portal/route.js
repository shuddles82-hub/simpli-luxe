import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getMemberFromRequest } from '@/lib/auth-server';

// Opens the Stripe billing portal so a Luxe Insider can update her card
// or cancel. Stripe hosts the whole experience; we just hand off.

export const runtime = 'nodejs';

export async function POST(request) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();
  if (!stripe || !admin) {
    return Response.json({ error: 'Membership management is not ready yet.' });
  }

  const member = await getMemberFromRequest(request);
  if (!member) {
    return Response.json({ error: 'Please sign in first.', signedOut: true });
  }

  try {
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', member.id)
      .maybeSingle();

    if (!profile?.stripe_customer_id) {
      return Response.json({ error: 'We could not find your membership.' });
    }

    const origin = request.headers.get('origin') || new URL(request.url).origin;
    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/account?insider=refresh`,
    });
    return Response.json({ url: portal.url });
  } catch {
    return Response.json({ error: 'We could not open the billing portal just now.' });
  }
}
