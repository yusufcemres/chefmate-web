'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export function SearchBar({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery || '');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(query.trim() ? `/tarif?q=${encodeURIComponent(query.trim())}` : '/tarif');
  };

  return (
    <form onSubmit={handleSearch} className="relative max-w-xl">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Bir lezzet ara…"
        className="w-full pl-14 pr-6 py-4 rounded-full bg-surface-container border border-border-light/40 text-base text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-dark/40 focus:border-primary-dark transition-all"
      />
    </form>
  );
}
