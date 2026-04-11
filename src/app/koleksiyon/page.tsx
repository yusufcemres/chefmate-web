import { fetchApi } from '@/lib/api-client';
import type { Collection } from '@/lib/types';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ChefHat } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Koleksiyonlar | ChefMate',
  description: 'Özenle seçilmiş tarif koleksiyonları',
};

async function getCollections(): Promise<Collection[]> {
  return fetchApi<Collection[]>('/collections?curated=true');
}

export default async function CollectionsPage() {
  let collections: Collection[] = [];
  try {
    collections = await getCollections();
  } catch {}

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
      <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-2">Koleksiyonlar</h1>
      <p className="text-text-muted mb-8">Özenle seçilmiş tarif koleksiyonları</p>

      {collections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map(col => (
            <Link key={col.id} href={`/koleksiyon/${col.slug}`} className="group bg-card rounded-2xl border border-border-light overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="relative aspect-[16/9]">
                {col.imageUrl ? (
                  <Image src={col.imageUrl} alt={col.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                ) : (
                  <div className="w-full h-full bg-surface-low flex items-center justify-center">
                    <ChefHat className="w-10 h-10 text-text-muted/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="font-heading font-bold text-white text-lg">{col.name}</h2>
                  <p className="text-white/70 text-xs mt-0.5">{col.recipes?.length || 0} tarif</p>
                </div>
              </div>
              {col.description && (
                <div className="p-4">
                  <p className="text-sm text-text-secondary line-clamp-2">{col.description}</p>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <ChefHat className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <p className="text-text-muted">Henüz koleksiyon yok</p>
        </div>
      )}
    </div>
  );
}
