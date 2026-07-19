'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { linkify } from './RichText';
import SaveButton from './SaveButton';
import ShareRow from './ShareRow';

function BodyParagraphs({ text }) {
  const paras = String(text || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return paras.map((p, i) => <p key={i}>{linkify(p)}</p>);
}

// The full lesson body is never sent in the initial HTML for a premium
// lesson; this fetches it from /api/lessons/[id] with the member's
// session token, which redacts the body server-side unless she is a
// Luxe Insider.
export default function LessonDetailGate({ item }) {
  const supabase = getSupabase();
  const [state, setState] = useState({ ready: !item.premium, locked: false, data: item });

  useEffect(() => {
    if (!item.premium) return;
    let cancelled = false;
    (async () => {
      let token = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        token = data?.session?.access_token || null;
      }
      const res = await fetch(`/api/lessons/${item.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json().catch(() => null);
      if (cancelled) return;
      setState({ ready: true, locked: Boolean(json?.locked), data: json?.item || item });
    })();
    return () => {
      cancelled = true;
    };
  }, [item, supabase]);

  if (!state.ready) return <div className="empty">One moment...</div>;

  if (state.locked) {
    return (
      <div className="acc-card insider-upsell" style={{ padding: 0, background: 'none' }}>
        <div className="shch">Luxe Insider Exclusive</div>
        <p className="acc-note">
          This lesson is part of the Luxe Insider collection. Sign in and become an Insider to
          unlock the full lesson.
        </p>
        <Link href="/account" className="acc-btn" style={{ display: 'inline-block' }}>
          ✦ Become a Luxe Insider
        </Link>
        <div style={{ marginTop: 12 }}>
          <ShareRow path={`/lessons/${item.id}`} title={item.title} />
        </div>
      </div>
    );
  }

  const { data } = state;
  return (
    <>
      <div className="sh-body">
        <BodyParagraphs text={data.body} />
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <SaveButton contentKey={data.id} series="Luxe Life Lessons" title={data.title} href={`/lessons/${data.id}`} />
        <ShareRow path={`/lessons/${data.id}`} title={data.title} image={data.image} />
      </div>
      {data.quote && (
        <div className="sh-q">
          <p>&ldquo;{data.quote}&rdquo;</p>
        </div>
      )}
    </>
  );
}
