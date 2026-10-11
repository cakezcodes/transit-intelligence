import type { Metadata, Viewport } from 'next';
import './prototype.css';

export const metadata: Metadata = {
  title: 'transit intelligence',
  description: 'a cosmic calendar and personal grimoire by cakezcodes',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // data attributes drive the prototype's theming (ceremony/clean · light/dark · gradient)
  return (
    <html lang="en" data-type="ceremony" data-mode="light" data-grad="on">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
