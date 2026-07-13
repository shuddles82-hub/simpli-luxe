'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import SipRecipe from './SipRecipe';

// The full recipe for a premium sip is never sent in the initial HTML;
// this fetches it from /api/sips/[id] with the member's session token,
// which redacts the recipe server-side unless she is a Luxe Insider.
export default function SipDetailGate({ sip }) {
  const supabase = getSupabase();
  const [state, setState] = useState({ ready: !sip.premium, locked: false, data: sip });

  useEffect(() => {
    if (!sip.premium) return;
    let cancelled = false;
    (async () => {
      let token = null;
      if (supabase) {
        const { data } = await supabase.auth.getSession();
        token = data?.session?.access_token || null;
      }
      const res = await fetch(`/api/sips/${sip.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const json = await res.json().catch(() => null);
      if (cancelled) return;
      setState({ ready: true, locked: Boolean(json?.locked), data: json?.sip || sip });
    })();
    return () => {
      cancelled = true;
    };
  }, [sip, supabase]);

  if (!state.ready) return <div className="empty">One moment...</div>;

  if (state.locked) {
    return (
      <div className="acc-card insider-upsell">
        <div className="shch">Luxe Insider Exclusive</div>
        <p className="acc-note">
          This Simpli Sip recipe is part of the Luxe Insider collection. Sign in and become an
          Insider to unlock the full recipe.
        </p>
        <Link href="/account" className="acc-btn" style={{ display: 'inline-block' }}>
          ✦ Become a Luxe Insider
        </Link>
      </div>
    );
  }

  return <SipRecipe sip={state.data} />;
}
