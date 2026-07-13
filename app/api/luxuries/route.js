import { getLuxuriesContent } from '@/lib/content';

export const revalidate = 600;

export async function GET() {
  const items = await getLuxuriesContent();
  return Response.json({ items });
}
