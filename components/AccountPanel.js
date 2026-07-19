'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import { SOCIAL_LINKS } from '@/lib/social';

// The Members page: magic-link sign-in, profile, and saved content.
// Shows a gentle "coming soon" note until Supabase is configured.
export default function AccountPanel() {
  const supabase = getSupabase();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authMode, setAuthMode] = useState('signin'); // signin | signup | forgot
  const [authBusy, setAuthBusy] = useState(false);
  const [checkEmailMsg, setCheckEmailMsg] = useState('');
  const [error, setError] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const [saves, setSaves] = useState([]);
  const [isInsider, setIsInsider] = useState(false);
  const [priceInfo, setPriceInfo] = useState(null);
  const [insiderMsg, setInsiderMsg] = useState('');
  const [insiderBusy, setInsiderBusy] = useState(false);

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
    async function load() {
      const [{ data: profile }, { data: rows }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle(),
        supabase.from('saves').select('*').order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      if (profile?.display_name) setDisplayName(profile.display_name);
      setIsInsider(Boolean(profile?.is_insider));
      setSaves(rows || []);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [supabase, session]);

  // The Luxe Insider price, pulled from Stripe. Absent until Staci
  // finishes the payment setup, in which case the upsell stays hidden.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/stripe/price')
      .then((r) => r.json())
      .then((info) => {
        if (!cancelled && info?.configured) setPriceInfo(info);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // After returning from Stripe checkout or the billing portal, reconcile
  // membership status right away (the webhook handles it too, but this
  // makes the badge appear immediately and works in local development).
  useEffect(() => {
    if (!supabase || !session) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.get('insider')) return;
    let cancelled = false;
    (async () => {
      try {
        await fetch('/api/stripe/sync', {
          method: 'POST',
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_insider')
          .eq('id', session.user.id)
          .maybeSingle();
        if (!cancelled) setIsInsider(Boolean(profile?.is_insider));
      } catch {
        // leave the badge as-is; a refresh or the webhook will catch up
      }
      window.history.replaceState({}, '', '/account');
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, session]);

  async function goToStripe(endpoint) {
    if (!session || insiderBusy) return;
    setInsiderBusy(true);
    setInsiderMsg('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setInsiderMsg(data.error || 'Something went wrong. Please try again in a moment.');
    } catch {
      setInsiderMsg('Something went wrong. Please try again in a moment.');
    }
    setInsiderBusy(false);
  }

  if (!supabase) {
    return (
      <div className="acc">
        <div className="acc-card">
          <div className="shch">Members</div>
          <p className="acc-note">
            Member accounts are almost here. Soon you will be able to save your favorite shifts,
            lessons, and sips, and return to them any time. Something lovely is on the way.
          </p>
          <Link href="/" className="acc-btn ghost" style={{ display: 'inline-block' }}>
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (!ready) {
    return <div className="empty">One moment...</div>;
  }

  if (!session) {
    const titles = {
      signin: 'Sign In',
      signup: 'Create Your Account',
      forgot: 'Reset Your Password',
    };

    async function handleSubmit() {
      setError('');
      setCheckEmailMsg('');
      if (!email.includes('@')) {
        setError('That email does not look quite right. One more try?');
        return;
      }
      setAuthBusy(true);
      try {
        if (authMode === 'signin') {
          if (!password) {
            setError('Please enter your password.');
            return;
          }
          const { error: err } = await supabase.auth.signInWithPassword({ email, password });
          if (err) {
            setError('That email and password do not match. Try again, or reset your password below.');
          }
        } else if (authMode === 'signup') {
          if (password.length < 6) {
            setError('Please choose a password with at least 6 characters.');
            return;
          }
          if (password !== confirmPassword) {
            setError('Those passwords do not match. One more try?');
            return;
          }
          const { data, error: err } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/account` },
          });
          if (err) {
            setError(
              err.message?.toLowerCase().includes('already registered')
                ? 'An account already exists for that email. Try signing in instead.'
                : 'We could not create your account just now. Please try again in a moment.'
            );
          } else if (!data.session) {
            setCheckEmailMsg(
              'Almost there. Check your inbox for a confirmation link, then come back and sign in.'
            );
            setAuthMode('signin');
          }
        } else if (authMode === 'forgot') {
          const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/account/reset`,
          });
          if (err) setError('We could not send that email just now. Please try again in a moment.');
          else {
            setCheckEmailMsg('Check your inbox for a link to set a new password.');
            setAuthMode('signin');
          }
        }
      } finally {
        setAuthBusy(false);
      }
    }

    return (
      <div className="acc">
        <div className="acc-card">
          <div className="shch">{titles[authMode]}</div>
          {checkEmailMsg && (
            <p className="acc-note" style={{ color: 'var(--gold)' }}>
              {checkEmailMsg}
            </p>
          )}
          <input
            className="acc-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {authMode !== 'forgot' && (
            <input
              className="acc-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          )}
          {authMode === 'signup' && (
            <input
              className="acc-input"
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          )}
          {error && (
            <p className="acc-note" style={{ color: 'var(--gold)' }}>
              {error}
            </p>
          )}
          <button className="acc-btn" disabled={authBusy} onClick={handleSubmit}>
            {authBusy
              ? 'One moment...'
              : authMode === 'signin'
              ? 'Sign In'
              : authMode === 'signup'
              ? 'Create Account'
              : 'Send Reset Link'}
          </button>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
            {authMode !== 'signin' && (
              <span
                className="fc"
                style={{ display: 'inline-block' }}
                onClick={() => {
                  setAuthMode('signin');
                  setError('');
                }}
              >
                Sign In
              </span>
            )}
            {authMode !== 'signup' && (
              <span
                className="fc"
                style={{ display: 'inline-block' }}
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                }}
              >
                New here? Create an account
              </span>
            )}
            {authMode !== 'forgot' && (
              <span
                className="fc"
                style={{ display: 'inline-block' }}
                onClick={() => {
                  setAuthMode('forgot');
                  setError('');
                }}
              >
                Forgot password?
              </span>
            )}
          </div>
          <p className="acc-note" style={{ marginTop: 14, marginBottom: 0 }}>
            Signed in before with just an email link? Use &ldquo;Forgot password?&rdquo; once to set
            a password for your account.
          </p>
          <p className="acc-note" style={{ marginTop: 6, marginBottom: 0 }}>
            Trouble signing in? Email{' '}
            <a className="body-link" href={SOCIAL_LINKS.Email}>
              staci.d.huddleston@gmail.com
            </a>{' '}
            and a real person (Staci) will help.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="acc">
      <div className="acc-card">
        <div className="shch">Your Profile</div>
        {isInsider && <div className="insider-badge">✦ Luxe Insider</div>}
        <p className="acc-note">Signed in as {session.user.email}</p>
        <input
          className="acc-input"
          type="text"
          placeholder="Your name (optional)"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setNameSaved(false);
          }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="acc-btn"
            onClick={async () => {
              await supabase
                .from('profiles')
                .upsert({ id: session.user.id, display_name: displayName.trim() });
              setNameSaved(true);
            }}
          >
            {nameSaved ? '✦ Saved' : 'Save Name'}
          </button>
          <button className="acc-btn ghost" onClick={() => supabase.auth.signOut()}>
            Sign Out
          </button>
          <Link href="/planner" className="acc-btn ghost" style={{ display: 'inline-block' }}>
            ✦ Open the Luxe Planner
          </Link>
          <Link href="/simplibot" className="acc-btn ghost" style={{ display: 'inline-block' }}>
            ✦ Talk to SimpliBot
          </Link>
          <Link href="/library" className="acc-btn ghost" style={{ display: 'inline-block' }}>
            ✦ Open the Luxe Library
          </Link>
          <Link href="/insider" className="acc-btn ghost" style={{ display: 'inline-block' }}>
            ✦ The Insider Hub
          </Link>
          {isInsider && (
            <button
              className="acc-btn ghost"
              disabled={insiderBusy}
              onClick={() => goToStripe('/api/stripe/portal')}
            >
              Manage Membership
            </button>
          )}
        </div>
        {insiderMsg && (
          <p className="acc-note" style={{ color: 'var(--gold)', marginTop: 10, marginBottom: 0 }}>
            {insiderMsg}
          </p>
        )}
        <p className="acc-note" style={{ marginTop: 14, marginBottom: 0 }}>
          Questions about your account or membership? Email{' '}
          <a className="body-link" href={SOCIAL_LINKS.Email}>
            staci.d.huddleston@gmail.com
          </a>{' '}
          any time.
        </p>
      </div>

      {!isInsider && priceInfo && (
        <div className="acc-card insider-upsell">
          <div className="shch">Become a Luxe Insider</div>
          <div className="insider-price">
            {priceInfo.display}
            <span> / {priceInfo.interval}</span>
          </div>
          <p className="acc-note">
            A quiet upgrade for the woman going deeper into her soft life. Cancel anytime, softly.
          </p>
          <ul className="shl" style={{ marginBottom: 16 }}>
            <li>More time with SimpliBot, your soft life coach, each day</li>
            <li>First access to the Luxe Library as it opens</li>
            <li>A founding place in the Simpli Luxe story</li>
          </ul>
          <button
            className="acc-btn"
            disabled={insiderBusy}
            onClick={() => goToStripe('/api/stripe/checkout')}
          >
            {insiderBusy ? 'One moment...' : '✦ Become a Luxe Insider'}
          </button>
        </div>
      )}
      <div className="acc-card">
        <div className="shch">Saved for Later</div>
        {saves.length === 0 ? (
          <p className="acc-note">
            Nothing saved yet. Tap ✦ Save on any shift, lesson, or sip and it will be waiting for
            you here.
          </p>
        ) : (
          saves.map((s) => (
            <div key={s.id} className="acc-save">
              <Link href={s.href || '/'} style={{ display: 'block', flex: 1 }}>
                <div className="acc-save-s">{s.series}</div>
                <div className="acc-save-t">{s.title}</div>
              </Link>
              <button
                className="acc-remove"
                onClick={async () => {
                  await supabase.from('saves').delete().eq('id', s.id);
                  setSaves((prev) => prev.filter((x) => x.id !== s.id));
                }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
