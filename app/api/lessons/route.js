import { getLessons } from '@/lib/airtable';

export const revalidate = 600;

export async function GET() {
  const items = await getLessons();
  return Response.json({ items });
}
