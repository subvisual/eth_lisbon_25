import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import AppShell from '@/app/components/AppShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Gnosis Dapp Boilerplate',
  description: 'Production‑ready Next.js starter for Gnosis Chain',
  icons: {
    icon: '/icon.jpg', 
    shortcut: '/icon.jpg',
    apple: '/icon.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Fallback link tag if metadata icons aren't picked up */}
        <link rel="icon" href="/icon.jpg" type="image/jpeg" />
      </head>
      <body className={inter.className}>
        {/* All client‑only Ant Design UI lives inside AppShell */}
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
