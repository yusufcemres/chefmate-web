'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search, Heart, ChefHat, User, Menu, X, Calendar, ShoppingCart } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function Navbar() {
  const { isAuthenticated, user, logout, init } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 glass border-b border-border-light/30 transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-primary" />
            <span className="font-heading text-xl font-extrabold text-primary tracking-tight">ChefMate</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/tarif" className="text-sm font-semibold uppercase tracking-widest text-text-muted hover:text-primary transition-colors">
              Tarifler
            </Link>
            <Link href="/etiket/turk-mutfagi" className="text-sm font-semibold uppercase tracking-widest text-text-muted hover:text-primary transition-colors">
              Mutfaklar
            </Link>
            <Link href="/koleksiyon" className="text-sm font-semibold uppercase tracking-widest text-text-muted hover:text-primary transition-colors">
              Koleksiyonlar
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/stok" className="text-sm font-semibold uppercase tracking-widest text-text-muted hover:text-primary transition-colors">
                  Stoğum
                </Link>
                <Link href="/plan" className="text-sm font-semibold uppercase tracking-widest text-text-muted hover:text-primary transition-colors">
                  Planla
                </Link>
              </>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/tarif" className="p-2 rounded-full hover:bg-surface-low transition-colors" aria-label="Tarif ara">
              <Search className="w-5 h-5 text-text-secondary" />
            </Link>
            {isAuthenticated ? (
              <>
                <Link href="/favoriler" className="p-2 rounded-full hover:bg-surface-low transition-colors" aria-label="Favorilerim">
                  <Heart className="w-5 h-5 text-text-secondary" />
                </Link>
                <Link href="/profil" className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-low text-sm font-medium hover:bg-surface-high transition-colors">
                  <User className="w-4 h-4" />
                  {user?.displayName}
                </Link>
              </>
            ) : (
              <Link href="/giris" className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-md">
                Giriş Yap
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={menuOpen}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-border-light/30 space-y-3">
            <Link href="/tarif" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold">Tarifler</Link>
            <Link href="/etiket/turk-mutfagi" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold">Mutfaklar</Link>
            <Link href="/koleksiyon" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold">Koleksiyonlar</Link>
            {isAuthenticated ? (
              <>
                <Link href="/favoriler" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold">Favoriler</Link>
                <Link href="/stok" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold">Mutfak Stoğum</Link>
                <Link href="/plan" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold">Yemek Planı</Link>
                <Link href="/alisveris" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold">Alışveriş Listesi</Link>
                <Link href="/oneriler" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold">Sana Özel Öneriler</Link>
                <Link href="/hane" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold">Hanem</Link>
                <button onClick={() => { logout(); setMenuOpen(false); }} className="block py-2 text-sm font-semibold text-error">Çıkış Yap</button>
              </>
            ) : (
              <Link href="/giris" onClick={() => setMenuOpen(false)} className="inline-block px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm">
                Giriş Yap
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
