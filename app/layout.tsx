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
      <body>{children}</body>
    </html>
  );
}
