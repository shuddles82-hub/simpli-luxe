import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getMemberFromRequest } from '@/lib/auth-server';

// Starts a Luxe Insider subscription. Verifies the member, finds or
// creates her Stripe customer, and returns a Stripe Checkout URL to
// redirect to. The Anthropic/Stripe secrets stay server-side.

export const runtime = 'nodejs';

export async function POST(request) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!stripe || !admin || !priceId) {
    return Response.json({ error: 'Luxe Insider is not quite ready yet.' });
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

    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: member.email,
        metadata: { supabase_user_id: member.id },
      });
      customerId = customer.id;
      await admin
        .from('profiles')
        .upsert({ id: member.id, stripe_customer_id: customerId });
    }

    const origin = request.headers.get('origin') || new URL(request.url).origin;
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: member.id,
      subscription_data: { metadata: { supabase_user_id: member.id } },
      allow_promotion_codes: true,
      success_url: `${origin}/account?insider=welcome`,
      cancel_url: `${origin}/account`,
    });
    return Response.json({ url: checkout.url });
  } catch {
    return Response.json({ error: 'We could not open checkout just now. Please try again.' });
  }
}
