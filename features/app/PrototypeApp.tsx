'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { prototypeBody } from './prototypeBody.mjs';

/* Rule #0: the prototype is the spec. This component mounts the prototype verbatim
   (markup from prototypeBody, logic from /prototype/app.js) and hands it three bridges:
   window.__TI (backend url/key + session token), window.tiCloud (state/profile sync),
   and window.tiBoot() (the boot sequence, called once the scripts are in). */

declare global {
  interface Window {
    __TI?: { url?: string; key?: string; token?: string | null };
    __tiSetToken?: (t: string | null) => void;
    tiCloud?: {
      loadState: () => Promise<unknown>;
      saveState: (state: unknown) => Promise<void>;
      saveProfile: (me: Record<string, unknown>) => Promise<void>;
      signOut: () => Promise<void>;
    };
    tiBoot?: () => void;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('failed to load ' + src));
    document.body.appendChild(s);
  });
}

export default function PrototypeApp() {
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;

    const supabase = createClient();

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const uid = session?.user?.id;

      window.__TI = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        token: session?.access_token ?? null,
      };

      window.tiCloud = {
        async loadState() {
          if (!uid) return null;
          // a hung network call must never hold the splash hostage — 8s and we boot fresh
          const { data, error } = await supabase
            .from('app_state')
            .select('state')
            .eq('user_id', uid)
            .abortSignal(AbortSignal.timeout(8000))
            .maybeSingle();
          if (error) throw error;
          return data?.state ?? null;
        },
        async saveState(state) {
          if (!uid) return;
          const { error } = await supabase
            .from('app_state')
            .upsert({ user_id: uid, state, updated_at: new Date().toISOString() });
          if (error) throw error;
        },
        async saveProfile(me) {
          if (!uid) return;
          const { error } = await supabase.from('profiles').upsert({
            id: uid,
            full_name: (me.name as string) || null,
            birth_date: (me.date as string) || null,
            birth_time: (me.time as string) || null,
            birth_place: (me.place as string) || null,
            latitude: me.lat != null && me.lat !== '' ? Number(me.lat) : null,
            longitude: me.lon != null && me.lon !== '' ? Number(me.lon) : null,
            tz_name: (me.tzName as string) || null,
            onboarded: true,
            updated_at: new Date().toISOString(),
          });
          if (error) throw error;
        },
        async signOut() {
          await supabase.auth.signOut();
          window.location.href = '/welcome';
        },
      };

      supabase.auth.onAuthStateChange((_event, s) => {
        const token = s?.access_token ?? null;
        if (window.__TI) window.__TI.token = token;
        window.__tiSetToken?.(token);
      });

      await loadScript('/prototype/img.js');
      await loadScript('/prototype/app.js');
      window.tiBoot?.();

      // discreet sign-out at the bottom of the me screen — the only addition to the spec
      const me = document.getElementById('v-me');
      if (me && !document.getElementById('tiSignOut')) {
        const b = document.createElement('button');
        b.id = 'tiSignOut';
        b.textContent = 'sign out ›';
        b.style.cssText =
          'display:block;margin:26px auto 40px;font-size:12.5px;color:var(--dust)';
        b.onclick = () => window.tiCloud?.signOut();
        me.appendChild(b);
      }
    })();
  }, []);

  return <div id="ti-root" dangerouslySetInnerHTML={{ __html: prototypeBody }} />;
}
