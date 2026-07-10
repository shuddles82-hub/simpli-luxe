import { getStripe } from '@/lib/stripe';

// Public: returns the Luxe Insider price so the upsell card can show it,
// pulled straight from Stripe so the number lives in exactly one place.

export const runtime = 'nodejs';
export const revalidate = 600;

function formatMoney(amount, currency) {
  if (currency === 'USD') {
    return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
  }
  return `${amount} ${currency}`;
}

export async function GET() {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!stripe || !priceId) return Response.json({ configured: false });

  try {
    const price = await stripe.prices.retrieve(priceId);
    const amount = (price.unit_amount ?? 0) / 100;
    const currency = (price.currency || 'usd').toUpperCase();
    const interval = price.recurring?.interval || 'month';
    return Response.json({
      configured: true,
      amount,
      currency,
      interval,
      display: formatMoney(amount, currency),
    });
  } catch {
    return Response.json({ configured: false });
  }
}
