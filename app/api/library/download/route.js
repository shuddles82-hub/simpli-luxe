import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getMemberFromRequest } from '@/lib/auth-server';

// Issues a short-lived signed download link for one Library item, after
// checking the member is signed in and her tier allows this item.

export const runtime = 'nodejs';

export async function POST(request) {
  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ error: 'The Library is not quite ready yet.' });

  const member = await getMemberFromRequest(request);
  if (!member) return Response.json({ error: 'Please sign in first.', signedOut: true });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Something went wrong. Please try again.' });
  }
  const id = body?.id;
  if (!id) return Response.json({ error: 'Something went wrong. Please try again.' });

  const { data: item } = await admin
    .from('library_items')
    .select('storage_path, tier, title')
    .eq('id', id)
    .maybeSingle();
  if (!item) return Response.json({ error: 'That item could not be found.' });

  if (item.tier === 'insider') {
    const { data: profile } = await admin
      .from('profiles')
      .select('is_insider')
      .eq('id', member.id)
      .maybeSingle();
    if (!profile?.is_insider) {
      return Response.json({
        error: 'This one is for Luxe Insiders. Become an Insider to unlock it.',
        needsInsider: true,
      });
    }
  }

  const { data: signed, error } = await admin.storage
    .from('library')
    .createSignedUrl(item.storage_path, 300, { download: item.title });
  if (error || !signed) {
    return Response.json({ error: 'We could not open that file just now. Please try again.' });
  }

  return Response.json({ url: signed.signedUrl });
}
