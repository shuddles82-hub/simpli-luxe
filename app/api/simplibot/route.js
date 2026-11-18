import Anthropic from '@anthropic-ai/sdk';
import { simpliBotSystemPrompt } from '@/lib/simplibot-prompt';
import { getMemberFromRequest } from '@/lib/auth-server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

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
const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_HISTORY = 12;

// Claude Opus 5.5 always thinks before it answers; effort "low" keeps that
// short, which suits a warm chat and keeps the cost per reply down.
// Thinking counts toward max_tokens, so leave room for a full plan.
const MODEL = 'claude-opus-5-5';
const EFFORT = 'low';
const MAX_TOKENS = 8000;
// If Opus 5.5's safety filter declines a harmless question, the same
// request is answered by the model SimpliBot used before.
const FALLBACK_MODEL = 'claude-opus-4-8';

// The brand bans em dashes everywhere; the prompt enforces it, this is
// the safety net.
function softenPunctuation(text) {
  return String(text).replace(/\s*—\s*/g, ', ');
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ reply: GENTLE.trouble });
  }

  const member = await getMemberFromRequest(request);
  if (!member) return Response.json({ reply: GENTLE.signedOut, signedOut: true });

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ reply: GENTLE.notConfigured });
  }

  // Gentle allowance over the last 24 hours, expanded for Luxe Insiders.
  // Counted in simplibot_usage, which only the server can read or write
  // (supabase/simplibot-usage.sql), so a member cannot reset her own count.
  // If the count cannot be read, the conversation goes ahead.
  const admin = getSupabaseAdmin();
  let countingWorks = false;
  if (admin) {
    try {
      const since = new Date(Date.now() - WINDOW_MS).toISOString();
      const [usageRes, profileRes] = await Promise.all([
        admin
          .from('simplibot_usage')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', member.id)
          .gte('created_at', since),
        admin.from('profiles').select('is_insider').eq('id', member.id).maybeSingle(),
      ]);
      if (!usageRes.error) {
        countingWorks = true;
        const limit = profileRes.data?.is_insider ? DAILY_LIMIT_INSIDER : DAILY_LIMIT_MEMBER;
        if ((usageRes.count ?? 0) >= limit) {
          return Response.json({ reply: GENTLE.limitReached, limitReached: true });
        }
      }
    } catch {
      // let the conversation continue
    }
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

  let reply = '';
  try {
    const anthropic = new Anthropic();
    const response = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      output_config: { effort: EFFORT },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: [{ model: FALLBACK_MODEL }],
      system: simpliBotSystemPrompt(),
      messages: history,
    });
    if (response.stop_reason === 'refusal') {
      return Response.json({ reply: GENTLE.trouble });
    }
    reply = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();
  } catch {
    return Response.json({ reply: GENTLE.trouble });
  }
  if (!reply) return Response.json({ reply: GENTLE.trouble });

  // Only a real reply uses up a moment.
  if (countingWorks) {
    try {
      await admin.from('simplibot_usage').insert({ user_id: member.id });
    } catch {
      // a missed count should never cost her the reply
    }
  }

  return Response.json({ reply: softenPunctuation(reply) });
}
