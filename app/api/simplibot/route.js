import Anthropic from '@anthropic-ai/sdk';
import { simpliBotSystemPrompt } from '@/lib/simplibot-prompt';

// SimpliBot chat endpoint. The Anthropic key lives here, server-side
// only. Members-only: the browser sends the member's Supabase session
// token, which we verify before doing anything. Every failure path
// returns a gentle message with HTTP 200 so the chat UI never shows
// alarming errors.

export const runtime = 'nodejs';

const GENTLE = {
  notConfigured:
    'SimpliBot is almost here. Something lovely is on the way. Check back soon.',
  signedOut: 'Please sign in on the Members page first, then we can talk softly.',
  limitReached:
    "You have used today's SimpliBot moments. Rest is a ritual too. Come back tomorrow, I will be here.",
  trouble:
    'I lost my train of thought for a moment. Take a breath, and try me again in a minute.',
};

const DAILY_LIMIT_MEMBER = 10;
const DAILY_LIMIT_INSIDER = 100;
const MAX_HISTORY = 12;

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

// The brand bans em dashes everywhere; the prompt enforces it, this is
// the safety net.
function softenPunctuation(text) {
  return String(text).replace(/\s*—\s*/g, ', ');
}

async function supabaseFetch(path, token, options = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  const res = await fetch(`${url.replace(/\/+$/, '')}${path}`, {
    ...options,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });
  return res;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ reply: GENTLE.trouble });
  }

  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ reply: GENTLE.signedOut, signedOut: true });

  // Verify the member's session against Supabase.
  const userRes = await supabaseFetch('/auth/v1/user', token);
  if (!userRes || !userRes.ok) {
    return Response.json({ reply: GENTLE.signedOut, signedOut: true });
  }
  const user = await userRes.json();
  if (!user?.id) return Response.json({ reply: GENTLE.signedOut, signedOut: true });

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ reply: GENTLE.notConfigured });
  }

  // Gentle daily allowance, expanded for Luxe Insiders. Usage rows live
  // in planner_entries under the member's own row-level security.
  try {
    const today = localDate();
    const [usageRes, profileRes] = await Promise.all([
      supabaseFetch(
        `/rest/v1/planner_entries?kind=eq.simplibot_message&entry_date=eq.${today}&select=id`,
        token
      ),
      supabaseFetch(`/rest/v1/profiles?id=eq.${user.id}&select=is_insider`, token),
    ]);
    const usage = usageRes?.ok ? await usageRes.json() : [];
    const profile = profileRes?.ok ? await profileRes.json() : [];
    const isInsider = Boolean(profile?.[0]?.is_insider);
    const limit = isInsider ? DAILY_LIMIT_INSIDER : DAILY_LIMIT_MEMBER;
    if (Array.isArray(usage) && usage.length >= limit) {
      return Response.json({ reply: GENTLE.limitReached, limitReached: true });
    }
    await supabaseFetch('/rest/v1/planner_entries', token, {
      method: 'POST',
      body: JSON.stringify({
        user_id: user.id,
        kind: 'simplibot_message',
        title: 'SimpliBot conversation',
        entry_date: today,
      }),
    });
  } catch {
    // If usage tracking hiccups, let the conversation continue.
  }

  // Sanitize the chat history: only role + string content, recent turns.
  const history = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m) =>
        m &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim()
    )
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (history.length === 0 || history[history.length - 1].role !== 'user') {
    return Response.json({ reply: GENTLE.trouble });
  }

  try {
    const anthropic = new Anthropic();
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      system: simpliBotSystemPrompt(),
      messages: history,
    });
    if (response.stop_reason === 'refusal') {
      return Response.json({ reply: GENTLE.trouble });
    }
    const reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();
    return Response.json({ reply: softenPunctuation(reply) || GENTLE.trouble });
  } catch {
    return Response.json({ reply: GENTLE.trouble });
  }
}
