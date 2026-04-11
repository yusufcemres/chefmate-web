import Link from 'next/link';
import { ChefHat } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-surface-low border-t border-border-light mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="w-6 h-6 text-primary" />
              <span className="font-heading text-lg font-extrabold text-primary">ChefMate</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              Mutfaginizin dijital asistani. AI destekli tarif onerileri ve akilli mutfak yonetimi.
            </p>
          </div>

          {/* Kesfet */}
          <div>
            <h4 className="font-heading font-bold text-sm mb-3">Kesfet</h4>
            <div className="space-y-2">
              <Link href="/tarif" className="block text-sm text-text-secondary hover:text-primary transition-colors">Tum Tarifler</Link>
              <Link href="/etiket/turk-mutfagi" className="block text-sm text-text-secondary hover:text-primary transition-colors">Turk Mutfagi</Link>
              <Link href="/etiket/kolay" className="block text-sm text-text-secondary hover:text-primary transition-colors">Kolay Tarifler</Link>
              <Link href="/etiket/saglikli" className="block text-sm text-text-secondary hover:text-primary transition-colors">Saglikli Tarifler</Link>
            </div>
          </div>

          {/* Ogun */}
          <div>
            <h4 className="font-heading font-bold text-sm mb-3">Ogune Gore</h4>
            <div className="space-y-2">
              <Link href="/etiket/kahvalti" className="block text-sm text-text-secondary hover:text-primary transition-colors">Kahvalti</Link>
              <Link href="/etiket/ogle-yemegi" className="block text-sm text-text-secondary hover:text-primary transition-colors">Ogle Yemegi</Link>
              <Link href="/etiket/aksam-yemegi" className="block text-sm text-text-secondary hover:text-primary transition-colors">Aksam Yemegi</Link>
              <Link href="/etiket/atistirmalik" className="block text-sm text-text-secondary hover:text-primary transition-colors">Atistirmalik</Link>
            </div>
          </div>

          {/* Uygulama */}
          <div>
            <h4 className="font-heading font-bold text-sm mb-3">Uygulama</h4>
            <div className="space-y-2">
              <Link href="/giris" className="block text-sm text-text-secondary hover:text-primary transition-colors">Giris Yap</Link>
              <Link href="/kayit" className="block text-sm text-text-secondary hover:text-primary transition-colors">Kayit Ol</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border-light mt-8 pt-6 text-center">
          <p className="text-xs text-text-muted">&copy; 2026 ChefMate. Tum haklar saklidir.</p>
        </div>
      </div>
    </footer>
  );
}
