'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabase } from '@/lib/supabase';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

// Landed on from the "Forgot password?" email link. Supabase parses the
// recovery token from the URL itself and fires a PASSWORD_RECOVERY auth
// event once it's ready to accept a new password.
export default function ResetPasswordPage() {
  const supabase = getSupabase();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    // If the recovery session is already present by the time this runs.
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setReady(true);
    });
    return () => sub?.subscription?.unsubscribe();
  }, [supabase]);

  async function handleUpdate() {
    setError('');
    if (password.length < 6) {
      setError('Please choose a password with at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Those passwords do not match. One more try?');
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError('We could not update your password just now. Please try again in a moment.');
      return;
    }
    setDone(true);
    setTimeout(() => router.push('/account'), 1800);
  }

  return (
    <>
      <PageHeader eyebrow="Members" title="Reset Your" emphasis="Password" sub="" />
      <div className="acc">
        <div className="acc-card">
          {!supabase ? (
            <p className="acc-note">Something lovely is on the way.</p>
          ) : done ? (
            <p className="acc-note" style={{ color: 'var(--gold)' }}>
              Your password is set. Taking you to your account...
            </p>
          ) : !ready ? (
            <>
              <p className="acc-note">
                Opening your reset link... if this does not update in a moment, the link may have
                expired. Request a new one from the sign-in page.
              </p>
              <Link href="/account" className="acc-btn ghost" style={{ display: 'inline-block' }}>
                Back to Sign In
              </Link>
            </>
          ) : (
            <>
              <p className="acc-note">Choose a new password for your account.</p>
              <input
                className="acc-input"
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                className="acc-input"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
              />
              {error && (
                <p className="acc-note" style={{ color: 'var(--gold)' }}>
                  {error}
                </p>
              )}
              <button className="acc-btn" disabled={busy} onClick={handleUpdate}>
                {busy ? 'One moment...' : 'Update Password'}
              </button>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
