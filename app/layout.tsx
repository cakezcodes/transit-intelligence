import type { Metadata, Viewport } from 'next';
import './prototype.css';
import './astrocake.css';

export const metadata: Metadata = {
  title: 'transit intelligence',
  description: 'a cosmic calendar and personal grimoire by cakezcodes',
  icons: { icon: '/icon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#eeece8' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1917' },
  ],
};

/* runs before first paint: applies the saved theme (so a dark-mode bestie never sees a
   cream flash) and marks a splash that already played this session, so the hand-off
   from /welcome into /app shows the finished splash instead of replaying it. */
const prepaint = `try{var u=JSON.parse(localStorage.getItem('ti-ui')||'null'),d=document.documentElement;
if(u){if(u.mode)d.dataset.mode=u.mode;if(u.type)d.dataset.type=u.type;if(u.grad)d.dataset.grad=u.grad;if(u.accent)d.style.setProperty('--accent',u.accent);}
var t=+sessionStorage.getItem('ti-splash-at');if(t&&Date.now()-t<120000)d.dataset.splash='seen';}catch(e){}`;

// every astro glyph the app draws — a subset keeps the symbol font tiny
const GLYPHS = '☉☽☾☿♀♂♃♄♅♆♇⚷☊☋⚸♈♉♊♋♌♍♎♏♐♑♒♓☌⚹□△▽☍℞⊘◐◑◇◈◉◍⌂⟳✦✧❦❧✿';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // data attributes drive the theming (ceremony/clean · light/dark · gradient)
  return (
    <html lang="en" data-type="ceremony" data-mode="light" data-grad="on" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prepaint }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
        <link
          href={`https://fonts.googleapis.com/css2?family=Noto+Sans+Symbols&display=swap&text=${encodeURIComponent(GLYPHS)}`}
          rel="stylesheet"
        />
        <link rel="preload" href="/fonts/ManufacturingConsent-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
