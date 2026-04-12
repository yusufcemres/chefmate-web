'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { Recipe } from '@/lib/types';

interface Props {
  featured?: Recipe | null;
}

export function HeroSection({ featured }: Props) {
  const title = featured?.title || 'Bugün bunu pişir';
  const desc =
    featured?.description ||
    'Nar ekşili ve cevizli közlenmiş patlıcan salatası. Mevsimin en taze lezzetleriyle soframıza konuk oluyor.';
  const href = featured ? `/tarif/${featured.slug || featured.id}` : '/tarif';

  return (
    <section className="max-w-screen-2xl mx-auto px-8 pt-12 pb-20">
      <div className="relative group overflow-hidden rounded-xl bg-surface-low min-h-[480px] flex items-center p-12 editorial-shadow">
        <div className="z-10 max-w-xl">
          <span className="inline-block px-4 py-1 rounded-full bg-primary-container/20 text-primary font-bold text-xs uppercase tracking-widest mb-6">
            Günün Seçimi
          </span>
          <h1 className="text-5xl lg:text-6xl font-heading font-extrabold text-text mb-6 leading-[1.1] tracking-tighter">
            {title}
          </h1>
          <p className="text-xl text-text-secondary mb-8 leading-relaxed max-w-md line-clamp-3">
            {desc}
          </p>
          <Link
            href={href}
            className="inline-flex items-center gap-3 bg-primary-container text-text px-8 py-4 rounded-xl font-heading font-extrabold hover:scale-[1.02] transition-transform active:scale-95"
          >
            Tarifi İncele
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
        {featured?.imageUrl && (
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-3/5 h-[120%] rotate-6 pointer-events-none transition-transform duration-700 group-hover:rotate-3">
            <Image
              src={featured.imageUrl}
              alt={featured.title}
              fill
              className="object-cover rounded-full mix-blend-lighten opacity-80"
              sizes="60vw"
              priority
            />
          </div>
        )}
      </div>
    </section>
  );
}
