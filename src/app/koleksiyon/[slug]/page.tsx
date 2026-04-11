import { fetchApi } from '@/lib/api-client';
import type { Collection, Recipe } from '@/lib/types';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChefHat, Clock, Flame } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCollection(slug: string): Promise<Collection> {
  return fetchApi<Collection>(`/collections/${slug}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const collection = await getCollection(slug);
    return {
      title: `${collection.name} | ChefMate`,
      description: collection.description || `${collection.name} tarif koleksiyonu`,
    };
  } catch {
    return { title: 'Koleksiyon Bulunamadı' };
  }
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  let collection: Collection;
  try {
    collection = await getCollection(slug);
  } catch {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-center">
        <ChefHat className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Koleksiyon Bulunamadı</h1>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm mt-4">
          <ArrowLeft className="w-4 h-4" /> Ana Sayfa
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Geri
      </Link>

      {/* Header */}
      <div className="mb-8">
        {collection.imageUrl && (
          <div className="relative aspect-[3/1] rounded-2xl overflow-hidden mb-6">
            <Image src={collection.imageUrl} alt={collection.name} fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="font-heading text-3xl font-extrabold text-white">{collection.name}</h1>
              {collection.description && <p className="text-white/80 mt-1">{collection.description}</p>}
            </div>
          </div>
        )}
        {!collection.imageUrl && (
          <>
            <h1 className="font-heading text-3xl font-extrabold tracking-tight mb-2">{collection.name}</h1>
            {collection.description && <p className="text-text-secondary text-lg">{collection.description}</p>}
          </>
        )}
        <p className="text-sm text-text-muted mt-2">{collection.recipes?.length || 0} tarif</p>
      </div>

      {/* Recipe grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {collection.recipes?.map(recipe => (
          <Link key={recipe.id} href={`/tarif/${recipe.slug || recipe.id}`} className="group bg-card rounded-2xl border border-border-light overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div className="relative aspect-[4/3]">
              {recipe.imageUrl ? (
                <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              ) : (
                <div className="w-full h-full bg-surface-low flex items-center justify-center">
                  <ChefHat className="w-10 h-10 text-text-muted/20" />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-heading font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">{recipe.title}</h3>
              <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                {recipe.totalTimeMinutes > 0 && (
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.totalTimeMinutes} dk</span>
                )}
                {recipe.totalCalories && (
                  <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {Math.round(recipe.totalCalories)} kcal</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
