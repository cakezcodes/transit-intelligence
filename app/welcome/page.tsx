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
  // new visitors land on v1's "let's begin"; anyone who has signed in on this device gets sign-in
  const [mode, setMode] = useState<'signin' | 'create'>('create');
  const [name, setName] = useState('');
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
    try {
      if (localStorage.getItem('ti-returning')) setMode('signin');
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
      try {
        localStorage.setItem('ti-returning', '1');
        if (name.trim()) localStorage.setItem('ti-name', name.trim());
      } catch {}
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
      <div className={splash === 'off' ? 'wl-card in' : 'wl-card'}>
        <svg className="wl-star" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
        </svg>
        <div className="wl-eb">{mode === 'create' ? 'welcome' : 'welcome back'}</div>
        <h1 className="wl-h">
          <em>transit</em> intelligence
        </h1>
        <p className="wl-p">
          {mode === 'create'
            ? 'the sky, translated. real transits against your chart — not a horoscope you share with 600 million people.'
            : 'the sky kept your place. sign in and pick up where you left off.'}
        </p>

        {confirmSent ? (
          <div className="wl-note">
            ✦ check your email — tap the confirmation link and your record opens.
          </div>
        ) : (
          <div className="wl-f">
            {mode === 'create' && (
              <input
                aria-label="your name"
                value={name}
                autoComplete="given-name"
                onChange={(e) => setName(e.target.value)}
                placeholder="your name"
              />
            )}
            <input
              type="email"
              aria-label="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email"
            />
            <input
              type="password"
              aria-label="password"
              value={password}
              autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && go()}
              placeholder={mode === 'create' ? 'make a password' : 'password'}
            />
            {err && <div className="wl-err">{err}</div>}
            <button
              className="wl-swap"
              onClick={() => {
                setMode(mode === 'create' ? 'signin' : 'create');
                setErr('');
              }}
            >
              {mode === 'create' ? (
                <>
                  already here? <u>sign in</u>
                </>
              ) : (
                <>
                  first time? <u>let&apos;s begin</u>
                </>
              )}
            </button>
          </div>
        )}
      </div>
      {!confirmSent && (
        <div className={splash === 'off' ? 'wl-ft in' : 'wl-ft'}>
          <button className="wl-btn" disabled={busy} onClick={go}>
            {busy ? 'one sec' : mode === 'create' ? "let's begin" : 'sign in'}
          </button>
        </div>
      )}
    </div>
  );
}
