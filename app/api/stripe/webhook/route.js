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

  // Supabase reports a failed write as a returned error, not a thrown
  // one, so each write is checked and turned into a throw here.
  function check({ error }) {
    if (error) throw new Error(error.message || 'database write failed');
  }

  // "Insider since" is the date she joined, so it is only filled in when
  // it is empty. Renewals and card updates also arrive as subscription
  // updates and must not move it.
  async function grantByCustomer(customerId) {
    if (!customerId) return;
    check(
      await admin.from('profiles').update({ is_insider: true }).eq('stripe_customer_id', customerId)
    );
    check(
      await admin
        .from('profiles')
        .update({ insider_since: new Date().toISOString() })
        .eq('stripe_customer_id', customerId)
        .is('insider_since', null)
    );
  }

  async function revokeByCustomer(customerId) {
    if (!customerId) return;
    check(
      await admin
        .from('profiles')
        .update({ is_insider: false, insider_since: null })
        .eq('stripe_customer_id', customerId)
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object;
        const userId = s.client_reference_id || s.metadata?.supabase_user_id;
        if (userId) {
          // Link the member to her Stripe customer first, so the
          // by-customer updates below (and every later event) find her.
          check(
            await admin.from('profiles').upsert({
              id: userId,
              stripe_customer_id: s.customer,
              is_insider: true,
            })
          );
        }
        await grantByCustomer(s.customer);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const active = ['active', 'trialing', 'past_due'].includes(sub.status);
        if (active) await grantByCustomer(sub.customer);
        else await revokeByCustomer(sub.customer);
        break;
      }
      case 'customer.subscription.deleted': {
        await revokeByCustomer(event.data.object.customer);
        break;
      }
      default:
        break;
    }
  } catch {
    // Tell Stripe this one did not land so it retries (it backs off and
    // gives up after a few days). The sync route also reconciles on the
    // member's next visit to her account page.
    return new Response('database error', { status: 500 });
  }

  return new Response('ok', { status: 200 });
}
