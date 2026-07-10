import { getStripe } from '@/lib/stripe';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Stripe calls this when a subscription is created, renewed, or
// cancelled. It is the durable source of truth for Luxe Insider status.
// The signature is verified so only Stripe can flip a member's tier.

export const runtime = 'nodejs';

export async function POST(request) {
  const stripe = getStripe();
  const admin = getSupabaseAdmin();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !admin || !secret) {
    return new Response('not configured', { status: 200 });
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response('invalid signature', { status: 400 });
  }

  async function setInsiderByCustomer(customerId, value) {
    if (!customerId) return;
    await admin
      .from('profiles')
      .update({
        is_insider: value,
        insider_since: value ? new Date().toISOString() : null,
      })
      .eq('stripe_customer_id', customerId);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object;
        const userId = s.client_reference_id || s.metadata?.supabase_user_id;
        if (userId) {
          await admin.from('profiles').upsert({
            id: userId,
            stripe_customer_id: s.customer,
            is_insider: true,
            insider_since: new Date().toISOString(),
          });
        } else {
          await setInsiderByCustomer(s.customer, true);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const active = ['active', 'trialing', 'past_due'].includes(sub.status);
        await setInsiderByCustomer(sub.customer, active);
        break;
      }
      case 'customer.subscription.deleted': {
        await setInsiderByCustomer(event.data.object.customer, false);
        break;
      }
      default:
        break;
    }
  } catch {
    // A database hiccup should not make Stripe retry forever; the sync
    // route reconciles on the member's next visit.
  }

  return new Response('ok', { status: 200 });
}
