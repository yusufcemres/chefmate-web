import { fetchApi } from '@/lib/api-client';
import type { Collection } from '@/lib/types';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChefHat } from 'lucide-react';
import { RecipeCard } from '@/components/recipe/RecipeCard';

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
    <div className="max-w-screen-2xl mx-auto px-8 pt-28 pb-24">
      <Link href="/koleksiyon" className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-[0.15em] text-text-muted hover:text-primary-dark mb-10 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Koleksiyonlar
      </Link>

      {/* Header */}
      {collection.imageUrl ? (
        <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-12 editorial-shadow">
          <Image src={collection.imageUrl} alt={collection.name} fill className="object-cover" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-12 max-w-4xl">
            <span className="inline-block text-xs font-heading font-bold uppercase tracking-[0.2em] text-primary-dark mb-4">
              {collection.recipes?.length || 0} tarif
            </span>
            <h1 className="font-heading text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05] text-text mb-3">{collection.name}</h1>
            {collection.description && <p className="text-text-secondary text-lg italic max-w-2xl">{collection.description}</p>}
          </div>
        </div>
      ) : (
        <div className="mb-12 max-w-3xl">
          <span className="inline-block text-xs font-heading font-bold uppercase tracking-[0.2em] text-primary-dark mb-4">
            Koleksiyon
          </span>
          <h1 className="font-heading text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05] mb-4">{collection.name}</h1>
          {collection.description && <p className="text-text-secondary text-lg">{collection.description}</p>}
        </div>
      )}

      {/* Recipe grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {collection.recipes?.map(recipe => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
