import type { Metadata, Viewport } from 'next';
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
};

export const viewport: Viewport = {
    themeColor: '#10b981',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover', // iOS: extend into safe areas for edge-to-edge
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="tr">
            <head>
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
            <body className="bg-shadow-950 text-white antialiased">
                {children}
            </body>
        </html>
    );
}
