import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Manrope } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';

const themeInitScript = `(function(){try{var k='chefmate_theme_mode';var m=localStorage.getItem(k);if(m!=='light'&&m!=='dark'&&m!=='system')m='light';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ChefMate — Mutfağınızın Dijital Asistanı',
    template: '%s | ChefMate',
  },
  description: 'AI destekli tarif önerileri, akıllı stok yönetimi, yemek planlama. 995+ Türk mutfağı tarifi.',
  keywords: ['tarif', 'yemek', 'mutfak', 'Türk mutfağı', 'AI tarif', 'yemek planı', 'ChefMate'],
  metadataBase: new URL('https://chefmate-web-five.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'ChefMate',
    title: 'ChefMate — Mutfağınızın Dijital Asistanı',
    description: 'AI destekli tarif önerileri, akıllı stok yönetimi ve yemek planlama.',
    url: 'https://chefmate-web-five.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ChefMate',
    description: 'AI destekli tarif önerileri ve akıllı mutfak yönetimi.',
  },
  manifest: '/manifest.json',
  other: {
    'theme-color': '#E8590C',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${jakarta.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-text">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
