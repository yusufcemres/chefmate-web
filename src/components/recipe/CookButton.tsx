'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';

export function CookButton({ slug }: { slug: string }) {
  return (
    <Link
      href={`/tarif/${slug}/pisirme`}
      className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary-dark transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <Play className="w-4 h-4" /> Pisirmeye Basla
    </Link>
  );
}
