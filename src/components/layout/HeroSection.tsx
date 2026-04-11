'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function HeroSection() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/tarif?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative pt-28 pb-16 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-100px] right-[-200px] w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(230,107,61,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(141,170,62,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
          Bugun Ne <span className="text-primary">Pisirsem?</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-xl mx-auto mb-8">
          995+ tarif, AI destekli oneriler ve akilli mutfak yonetimi. Mutfaginizin dijital asistani.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-lg mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tarif, malzeme veya mutfak ara..."
            className="w-full pl-12 pr-28 py-4 rounded-full bg-card border border-border-light shadow-md text-base focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary-dark transition-all"
          >
            Ara
          </button>
        </form>

        {/* Quick tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {['Mercimek Corbasi', 'Kofte', 'Borek', 'Pilav', 'Tatlı'].map((tag) => (
            <button
              key={tag}
              onClick={() => router.push(`/tarif?q=${encodeURIComponent(tag)}`)}
              className="px-3 py-1.5 rounded-full bg-primary-container/50 text-sm font-medium text-on-primary-container hover:bg-primary-container transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
