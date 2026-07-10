import { getEditIssues } from '@/lib/airtable';

export const revalidate = 600;

export async function GET() {
  const items = await getEditIssues();
  return Response.json({ items });
}
