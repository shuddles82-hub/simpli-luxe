'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

// SimpliBot chat: members-only, moods first (Soft Life Coach), then a
// quiet conversation. The Anthropic call happens server-side at
// /api/simplibot; this component never sees any secret.

const MOODS = [
  { label: 'Overwhelmed', opener: 'I am feeling overwhelmed today.' },
  { label: 'Tired', opener: 'I am so tired lately, and I am not sure how to rest well.' },
  { label: 'Unmotivated', opener: 'I am feeling unmotivated and a little stuck.' },
  { label: 'Anxious', opener: 'My mind will not slow down today.' },
  { label: 'Celebrating', opener: 'Something good happened and I want to savor it.' },
  { label: 'Reflective', opener: 'I am in a reflective mood and want to sit with this season.' },
];

const WELCOME =
  "Hello, lovely. I'm SimpliBot, your soft life coach. Tell me how today feels, or choose a mood above and we will start there.";

export default function SimpliBotPanel() {
  const supabase = getSupabase();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setReady(true);
    });
    return () => sub?.subscription?.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, thinking]);

  if (!supabase) {
    return (
      <div className="acc">
        <div className="acc-card">
          <div className="shch">SimpliBot</div>
          <p className="acc-note">
            SimpliBot is almost here. A soft life coach in your pocket, in Staci&apos;s voice.
            Something lovely is on the way.
          </p>
          <Link href="/" className="acc-btn ghost" style={{ display: 'inline-block' }}>
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) return <div className="empty">One moment...</div>;

  if (!session) {
    return (
      <div className="acc">
        <div className="acc-card">
          <div className="shch">Members Only, Softly</div>
          <p className="acc-note">
            SimpliBot is part of your member space. Sign in with your email (no password needed)
            and your soft life coach will be waiting.
          </p>
          <Link href="/account" className="acc-btn" style={{ display: 'inline-block' }}>
            Sign In to Begin
          </Link>
        </div>
      </div>
    );
  }

  async function send(text) {
    const clean = text.trim();
    if (!clean || thinking) return;
    const nextMessages = [...messages, { role: 'user', content: clean }];
    setMessages(nextMessages);
    setInput('');
    setThinking(true);
    try {
      const res = await fetch('/api/simplibot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            data?.reply || 'I lost my train of thought for a moment. Try me again in a minute.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I lost my train of thought for a moment. Try me again in a minute.',
        },
      ]);
    }
    setThinking(false);
  }

  return (
    <div className="acc" style={{ maxWidth: 680 }}>
      <div className="acc-card">
        <div className="shch">How does today feel?</div>
        <div className="pl-moods" style={{ marginBottom: 0 }}>
          {MOODS.map((m) => (
            <span key={m.label} className="fc" onClick={() => send(m.opener)}>
              {m.label}
            </span>
          ))}
        </div>
      </div>

      <div className="acc-card">
        <div className="bot-chat">
          <div className="bot-msg">
            <div className="bot-who">✦ SimpliBot</div>
            <div className="bot-text">{WELCOME}</div>
          </div>
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="bot-msg me">
                <div className="bot-text">{m.content}</div>
              </div>
            ) : (
              <div key={i} className="bot-msg">
                <div className="bot-who">✦ SimpliBot</div>
                <div className="bot-text">{m.content}</div>
              </div>
            )
          )}
          {thinking && (
            <div className="bot-msg">
              <div className="bot-who">✦ SimpliBot</div>
              <div className="bot-text thinking">is thinking softly...</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="pl-row" style={{ marginTop: 14 }}>
          <input
            className="acc-input"
            type="text"
            placeholder="Tell me softly..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
          />
          <button className="acc-btn" onClick={() => send(input)} disabled={thinking}>
            Send
          </button>
        </div>
        <p className="acc-note" style={{ marginBottom: 0 }}>
          SimpliBot is a lifestyle companion, not a medical or financial professional. Members
          share up to 10 moments a day; Luxe Insiders receive more.
        </p>
      </div>
    </div>
  );
}
