'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { splashMarkup } from '@/features/splash/splashMarkup.mjs';
import './welcome.css';

const SPLASH = splashMarkup();

function splashSeen() {
  try {
    const t = Number(sessionStorage.getItem('ti-splash-at'));
    return !!t && Date.now() - t < 120000;
  } catch {
    return false;
  }
}

export default function Welcome() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [confirmSent, setConfirmSent] = useState(false);
  // splash → card on arrival; card → splash on sign-in, so /app picks up the same frame
  const [splash, setSplash] = useState<'on' | 'off'>('on');

  useEffect(() => {
    const seen = splashSeen();
    try {
      sessionStorage.setItem('ti-splash-at', String(Date.now()));
    } catch {}
    const t = setTimeout(() => setSplash('off'), seen ? 250 : 2300);
    return () => clearTimeout(t);
  }, []);

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
      // fade the finished splash back over the card, then hand off to the app
      document.documentElement.dataset.splash = 'seen';
      try {
        sessionStorage.setItem('ti-splash-at', String(Date.now()));
      } catch {}
      setSplash('on');
      await new Promise((r) => setTimeout(r, 450));
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
      <div
        className={splash === 'off' ? 'wl-splash off' : 'wl-splash'}
        aria-hidden={splash === 'off'}
        dangerouslySetInnerHTML={{ __html: SPLASH }}
      />
      <div className="wl-glow" />
      <div className={splash === 'off' ? 'wl-card in' : 'wl-card'}>
        <div className="wl-caps">transit intelligence</div>
        <div className="wl-title">{mode === 'create' ? 'begin the record' : 'welcome back'}</div>
        <div className="wl-orn" aria-hidden="true">✦ ☽︎ ✦</div>
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
