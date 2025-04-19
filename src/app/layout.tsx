'use client';

import './globals.css';
import MuiProvider from '@/components/MuiProvider';
import { AuthProvider } from '@/context/AuthContext';
import AuthAwareLayout from '@/components/AuthAwareLayout';
import localFont from 'next/font/local';

const overusedGrotesk = localFont({
  src: [
    {
      path: '../../public/font/OverusedGrotesk-VF.woff2',
      weight: '100 900',
      style: 'normal',
    },
    {
      path: '../../public/font/OverusedGrotesk-VF.woff',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-overused-grotesk',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={overusedGrotesk.variable}>
      <body>
        <AuthProvider>
          <MuiProvider>
            <AuthAwareLayout>
              {children}
            </AuthAwareLayout>
          </MuiProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
