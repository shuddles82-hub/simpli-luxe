'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

// Save/favorite toggle. Hidden entirely until Supabase is configured.
// Signed-out visitors are guided to the Members page.
export default function SaveButton({ contentKey, series, title, href }) {
  const supabase = getSupabase();
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    async function load() {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;
      if (cancelled) return;
      setUserId(user?.id || null);
      if (user) {
        const { data: rows } = await supabase
          .from('saves')
          .select('id')
          .eq('content_key', contentKey)
          .limit(1);
        if (!cancelled) setSaved(Boolean(rows && rows.length));
      }
    }
    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe();
    };
  }, [supabase, contentKey]);

  if (!supabase) return null;

  async function toggle(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      router.push('/account');
      return;
    }
    if (busy) return;
    setBusy(true);
    if (saved) {
      await supabase.from('saves').delete().eq('content_key', contentKey);
      setSaved(false);
    } else {
      await supabase
        .from('saves')
        .upsert(
          { user_id: userId, content_key: contentKey, series, title, href },
          { onConflict: 'user_id,content_key' }
        );
      setSaved(true);
    }
    setBusy(false);
  }

  return (
    <span
      role="button"
      tabIndex={0}
      className={`savebtn${saved ? ' saved' : ''}`}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') toggle(e);
      }}
      aria-pressed={saved}
    >
      ✦ {saved ? 'Saved' : 'Save'}
    </span>
  );
}
