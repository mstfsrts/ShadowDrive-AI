import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/lib/theme';
import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
    title: 'ShadowDrive AI — Sürüş Sırasında Hollandaca Öğren',
    description:
        'Türk profesyoneller için mobil öncelikli, eller serbest Hollandaca öğrenme uygulaması. Araba kullanırken sesli derslerle öğrenin.',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'ShadowDrive',
    },
    icons: {
        icon: '/icons/icon-192.png',
        apple: '/icons/icon-192.png',
    },
    other: {
        'mobile-web-app-capable': 'yes',
    },
};

export const viewport: Viewport = {
    themeColor: '#10b981',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
};

// Inline script to prevent flash of wrong theme (runs before React hydration)
const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem('shadowdrive-theme') || 'dark';
    var d = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light')
      : t;
    if (d === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch(e){}
})();
`;

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr" className="dark" suppressHydrationWarning>
            <head>
                {/* Prevent flash of wrong theme */}
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
                {/* PWA: Apple touch icon */}
                <link rel="apple-touch-icon" href="/icons/icon-192.png" />
                {/* Register service worker */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
                    }}
                />
            </head>
            <body className="bg-background text-foreground antialiased">
                <Providers>
                    <ThemeProvider>
                        {children}
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    );
}
