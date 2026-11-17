import { listEmailsWithTag, setKitTag } from '@/lib/kit';

// Webhook target for Staci's Airtable Automations: call this whenever
// a record gets promoted/published, and it fires her "New content is
// live" Kit Automation for everyone opted in.
//
// Kit's "Tag Added" automation trigger only fires on a genuine add
// event, so re-tagging someone who already has the trigger tag does
// nothing. To make this repeatable, every call first clears the
// trigger tag from whoever has it, then re-applies it fresh to the
// opted-in segment, so it is a real "add" every time.
//
// Protected by a shared secret, since this has to be a public URL for
// Airtable to call; anyone else hitting it without the secret gets
// nothing. The secret must arrive in an "x-webhook-secret" header. A
// ?secret=... in the web address is no longer accepted, because web
// addresses end up in logs.

export const runtime = 'nodejs';

const OPT_IN_TAG = 'Notify: New Content';
const TRIGGER_TAG = 'Content Alert - Fire';

export async function POST(request) {
  const secret = request.headers.get('x-webhook-secret');
  if (!process.env.CONTENT_ALERT_WEBHOOK_SECRET || secret !== process.env.CONTENT_ALERT_WEBHOOK_SECRET) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const alreadyFiring = await listEmailsWithTag(TRIGGER_TAG);
  for (const email of alreadyFiring) {
    await setKitTag({ email, tagName: TRIGGER_TAG, enabled: false });
  }

  const optedIn = await listEmailsWithTag(OPT_IN_TAG);
  let notified = 0;
  for (const email of optedIn) {
    const ok = await setKitTag({ email, tagName: TRIGGER_TAG, enabled: true });
    if (ok) notified += 1;
  }

  return Response.json({ ok: true, notified });
}
