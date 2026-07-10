import Stripe from 'stripe';

// Server-only Stripe client. Returns null when the secret key is not
// configured, so payment features hide gracefully until Staci adds it.
let client = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}
