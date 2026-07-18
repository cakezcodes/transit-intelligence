'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import './welcome.css';

export default function Welcome() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [confirmSent, setConfirmSent] = useState(false);

  async function go() {
    if (!email.trim() || !password) {
      setErr('email and password, bestie — both.');
      return;
    }
    setBusy(true);
    setErr('');
    const supabase = createClient();
    try {
      if (mode === 'create') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (!data.session) {
          // email confirmation is on — no session until the link is clicked
          setConfirmSent(true);
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
      router.push('/app');
      router.refresh();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message.toLowerCase() : 'something slipped — try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wl-wrap">
      <div className="wl-glow" />
      <div className="wl-card">
        <div className="wl-caps">transit intelligence</div>
        <div className="wl-title">{mode === 'create' ? 'begin the record' : 'welcome back'}</div>
        <div className="wl-orn">✦ ☽ ✦</div>
        <div className="wl-sub">as above · so below</div>

        {confirmSent ? (
          <div className="wl-note">
            ✦ check your email — tap the confirmation link and your record opens.
          </div>
        ) : (
          <>
            <div className="wl-field">
              <label>email</label>
              <input
                type="email"
                value={email}
                autoComplete="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@somewhere.com"
              />
            </div>
            <div className="wl-field">
              <label>password</label>
              <input
                type="password"
                value={password}
                autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && go()}
                placeholder="••••••••"
              />
            </div>
            {err && <div className="wl-err">{err}</div>}
            <button className="wl-btn" disabled={busy} onClick={go}>
              {busy ? 'one sec ✦' : mode === 'create' ? 'create my account' : 'sign in'}
            </button>
            <button
              className="wl-swap"
              onClick={() => {
                setMode(mode === 'create' ? 'signin' : 'create');
                setErr('');
              }}
            >
              {mode === 'create' ? (
                <>
                  already have a record? <b>sign in ›</b>
                </>
              ) : (
                <>
                  first time here? <b>create your account ›</b>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
