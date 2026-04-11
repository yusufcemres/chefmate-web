import { fetchApi } from '@/lib/api-client';
import type { Recipe, Tag, Collection } from '@/lib/types';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { HeroSection } from '@/components/layout/HeroSection';
import { TagFilter } from '@/components/recipe/TagFilter';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

async function getTrending() {
  return fetchApi<Recipe[]>('/recipes/trending?limit=6');
}

async function getSeasonal() {
  return fetchApi<Recipe[]>('/recipes/seasonal?limit=8');
}

async function getTags() {
  return fetchApi<Tag[]>('/tags?type=CUISINE');
}

async function getCollections() {
  return fetchApi<Collection[]>('/collections?curated=true');
}

export default async function HomePage() {
  const [trending, seasonal, cuisineTags, collections] = await Promise.all([
    getTrending().catch(() => []),
    getSeasonal().catch(() => []),
    getTags().catch(() => []),
    getCollections().catch(() => []),
  ]);

  return (
    <>
      <HeroSection />

      {/* Cuisine Tags */}
      {cuisineTags.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <TagFilter tags={cuisineTags} />
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold">Populer Tarifler</h2>
            <Link href="/tarif?sort=trending" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Tumunu Gor <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}

      {/* Seasonal */}
      {seasonal.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold">Mevsim Tarifleri</h2>
            <Link href="/tarif?sort=seasonal" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Tumunu Gor <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {seasonal.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </section>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h2 className="font-heading text-2xl font-bold mb-6">Koleksiyonlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col) => (
              <Link key={col.id} href={`/etiket/${col.slug}`} className="group relative block rounded-2xl overflow-hidden aspect-[2/1] hover-lift">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
                {col.imageUrl && (
                  <img src={col.imageUrl} alt={col.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                )}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
                  <h3 className="font-heading font-bold text-lg text-white">{col.name}</h3>
                  {col.description && <p className="text-sm text-white/70 mt-1 line-clamp-1">{col.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
