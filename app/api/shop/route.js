import { getShopCollections } from '@/lib/airtable';

export const revalidate = 600;

export async function GET(request) {
  const featuredOnly = new URL(request.url).searchParams.get('featured') === '1';
  const items = await getShopCollections({ featuredOnly });
  return Response.json({ items });
}
