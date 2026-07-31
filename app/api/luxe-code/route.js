import { getLuxeCodeContent } from '@/lib/content';

export const revalidate = 600;

export async function GET() {
  const items = await getLuxeCodeContent();
  return Response.json({ items });
}
