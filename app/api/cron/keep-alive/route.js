import { getSupabaseAdmin } from '@/lib/supabase-admin';

// Runs once a day via Vercel Cron (see vercel.json). Supabase pauses a
// free-plan project after about a week with no activity, which takes
// sign-in, saves, the planner, the Library and Insider checks offline
// for every member. One tiny database read a day keeps the project
// counted as active. It reads a single row id and changes nothing.

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const authHeader = request.headers.get('authorization') || '';
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const admin = getSupabaseAdmin();
  if (!admin) return Response.json({ ok: false, error: 'Not configured' }, { status: 500 });

  const { error } = await admin.from('profiles').select('id').limit(1);
  // A failing status makes the run show as failed in Vercel's cron log,
  // so a paused or unreachable project is visible there.
  if (error) return Response.json({ ok: false, error: 'Database did not answer' }, { status: 500 });

  return Response.json({ ok: true, at: new Date().toISOString() });
}
