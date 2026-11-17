import { addMemberToKit } from '@/lib/kit';
import { getMemberFromRequest } from '@/lib/auth-server';

// Adds a new member to the Kit list. The Kit API key lives here,
// server-side only. The caller must be a signed-in member, and the
// address added is always the one on her own account, never one sent
// in the request, so this route cannot be used to add someone else.
// Only accounts created in the last two weeks are added, so signing in
// on a new device never re-adds a long-standing member.

export const runtime = 'nodejs';

const NEW_MEMBER_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

export async function POST(request) {
  const member = await getMemberFromRequest(request);
  if (!member?.email) return Response.json({ ok: false }, { status: 401 });

  const created = member.createdAt ? new Date(member.createdAt).getTime() : NaN;
  if (!Number.isFinite(created) || Date.now() - created > NEW_MEMBER_WINDOW_MS) {
    return Response.json({ ok: true, skipped: true });
  }

  await addMemberToKit({ email: member.email });
  return Response.json({ ok: true });
}
