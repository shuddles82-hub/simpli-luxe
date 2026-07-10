import { getStyledCapsules } from '@/lib/airtable';

export const revalidate = 600;

export async function GET() {
  const items = await getStyledCapsules();
  return Response.json({ items });
}
