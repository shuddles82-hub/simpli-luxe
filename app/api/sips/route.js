import { getSips } from '@/lib/airtable';

export const revalidate = 600;

export async function GET() {
  const items = await getSips();
  return Response.json({ items });
}
