'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

// The Luxe Library: a members-only shelf of downloads. Free items open
// for any signed-in member; Insider items nudge toward /account.
export default function LibraryPanel() {
  const supabase = getSupabase();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [note, setNote] = useState('');

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
    if (!supabase || !session) return;
    let cancelled = false;
    fetch('/api/library', { headers: { Authorization: `Bearer ${session.access_token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setItems(data.items || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingItems(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabase, session]);

  async function download(item) {
    if (busyId) return;
    setBusyId(item.id);
    setNote('');
    try {
      const res = await fetch('/api/library/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ id: item.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setNote(data.error || 'We could not open that file just now. Please try again.');
      }
    } catch {
      setNote('We could not open that file just now. Please try again.');
    }
    setBusyId(null);
  }

  if (!supabase) {
    return (
      <div className="acc">
        <div className="acc-card">
          <div className="shch">The Luxe Library</div>
          <p className="acc-note">
            The Library is almost here. Guides and downloads to support your soft life, all in one
            quiet shelf. Something lovely is on the way.
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
            The Luxe Library is part of your member space. Sign in with your email (no password
            needed) and your downloads will be waiting.
          </p>
          <Link href="/account" className="acc-btn" style={{ display: 'inline-block' }}>
            Sign In to Begin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="acc">
      <div className="acc-card">
        <div className="shch">The Shelf</div>
        {note && (
          <p className="acc-note" style={{ color: 'var(--gold)' }}>
            {note}
          </p>
        )}
        {loadingItems ? (
          <p className="acc-note">One moment...</p>
        ) : items.length === 0 ? (
          <p className="acc-note">Nothing here yet. Something lovely is on the way.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="lib-item">
              <div className="lib-item-main">
                <div className="lib-item-top">
                  {item.category && <span className="lib-category">{item.category}</span>}
                  {item.tier === 'insider' && <span className="insider-badge">✦ Luxe Insider</span>}
                </div>
                <div className="lib-title">{item.title}</div>
                {item.description && <div className="lib-desc">{item.description}</div>}
              </div>
              {item.canDownload ? (
                <button
                  className="acc-btn"
                  disabled={busyId === item.id}
                  onClick={() => download(item)}
                >
                  {busyId === item.id ? 'One moment...' : '✦ Download'}
                </button>
              ) : (
                <Link href="/account" className="acc-btn ghost">
                  Unlock as Insider
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
