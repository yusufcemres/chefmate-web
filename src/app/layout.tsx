import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Manrope } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

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
    default: 'ChefMate — Mutfaginiz Dijital Asistani',
    template: '%s | ChefMate',
  },
  description: 'AI destekli tarif onerileri, akilli stok yonetimi, yemek planlama. 995+ Turk mutfagi tarifi.',
  keywords: ['tarif', 'yemek', 'mutfak', 'Turk mutfagi', 'AI tarif', 'yemek plani'],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'ChefMate',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${jakarta.variable} ${manrope.variable}`}>
      <body className="min-h-screen flex flex-col bg-background text-text">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
