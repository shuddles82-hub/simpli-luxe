import { getShiftFeed } from '@/lib/airtable';

export const revalidate = 600;

export async function GET() {
  const items = await getShiftFeed();
  return Response.json({ items });
}
