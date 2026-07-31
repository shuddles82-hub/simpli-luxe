'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';

const DROPS = ['Money Monday', 'Wellness Wednesday', 'Sunday Reset'];

// Teaser-only widget: the rotation topics always show (that's the
// FOMO), but the actual content link only appears once we've confirmed
// the visitor is a signed-in Luxe Insider. Mirrors the same
// session -> profiles.is_insider check used in AccountPanel/DetailGate
// components, just for a compact homepage card instead of a full page.
export default function InsiderDropsWidget() {
  const supabase = getSupabase();
  const [isInsider, setIsInsider] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (!session) {
        if (!cancelled) setReady(true);
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_insider')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!cancelled) {
        setIsInsider(Boolean(profile?.is_insider));
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  return (
    <div className={`acc-card${!isInsider ? ' insider-upsell' : ''}`}>
      {isInsider && <div className="insider-badge">✦ Luxe Insider</div>}
      <div className="shch">Insider Drops</div>
      <p className="acc-note">New content twice a month — always a surprise.</p>
      <ul className="shl" style={{ marginBottom: 16 }}>
        {DROPS.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      {ready && isInsider ? (
        <Link href="/insider" className="acc-btn" style={{ display: 'inline-block' }}>
          ✦ Open the Insider Hub
        </Link>
      ) : (
        <Link href="/account" className="acc-btn" style={{ display: 'inline-block' }}>
          ✦ Become a Luxe Insider
        </Link>
      )}
    </div>
  );
}
