import { getInsiderWeeklyContent } from '@/lib/content';

export const revalidate = 600;

export async function GET() {
  const items = await getInsiderWeeklyContent();
  return Response.json({ items });
}
