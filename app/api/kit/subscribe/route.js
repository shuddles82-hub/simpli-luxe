import { addMemberToKit } from '@/lib/kit';

// Called right after a member creates her account. The Kit API key
// lives here, server-side only.

export const runtime = 'nodejs';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false });
  }

  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  if (!email.includes('@')) return Response.json({ ok: false });

  await addMemberToKit({ email, displayName: body?.displayName });
  return Response.json({ ok: true });
}
