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
    <form onSubmit={handleSearch} className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tarif ara..."
        className="w-full pl-10 pr-4 py-2.5 rounded-full bg-card border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
    </form>
  );
}
