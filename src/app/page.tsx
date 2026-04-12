import { fetchApi } from '@/lib/api-client';
import type { Recipe, Tag } from '@/lib/types';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { HeroSection } from '@/components/layout/HeroSection';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Star } from 'lucide-react';

async function getTrending() {
  return fetchApi<Recipe[]>('/recipes/trending?limit=6');
}

async function getSeasonal() {
  return fetchApi<Recipe[]>('/recipes/seasonal?limit=8');
}

async function getCategories() {
  return fetchApi<Tag[]>('/tags?type=CATEGORY');
}

const CATEGORY_PALETTE: Record<string, { bg: string; text: string }> = {
  et: { bg: '#2B1810', text: '#FFB59C' },
  sebze: { bg: '#1A2616', text: '#BCCBB3' },
  tatli: { bg: '#241A2B', text: '#D8E7CE' },
  corba: { bg: '#2B2410', text: '#FFDB9C' },
};

function paletteFor(slug: string) {
  return (
    CATEGORY_PALETTE[slug] || {
      bg: '#1A1A1A',
      text: 'rgba(229, 226, 225, 0.6)',
    }
  );
}

export default async function HomePage() {
  const [trending, seasonal, categories] = await Promise.all([
    getTrending().catch(() => []),
    getSeasonal().catch(() => []),
    getCategories().catch(() => []),
  ]);

  const featured = trending[0] || seasonal[0] || null;
  const recommended = trending.slice(0, 6);

  return (
    <>
      <HeroSection featured={featured} />

      {/* Category Pills */}
      {categories.length > 0 && (
        <section className="max-w-screen-2xl mx-auto px-8 mb-20">
          <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat) => {
              const p = paletteFor(cat.slug);
              return (
                <Link
                  key={cat.id}
                  href={`/tarif?tag=${cat.slug}`}
                  className="flex-none px-8 py-3 rounded-full font-heading font-bold hover:brightness-125 transition-all whitespace-nowrap"
                  style={{ background: p.bg, color: p.text }}
                >
                  {cat.emoji ? `${cat.emoji} ` : ''}
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="max-w-screen-2xl mx-auto px-8 space-y-24 pb-24">
        {/* Önerilen */}
        {recommended.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-4xl font-heading font-extrabold tracking-tighter">
                Önerilen
              </h2>
              <Link
                href="/tarif?sort=trending"
                className="text-primary-dark font-bold hover:underline flex items-center gap-2"
              >
                Tümünü Gör <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {recommended.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        )}

        {/* Yeni Keşifler */}
        {seasonal.length > 0 && (
          <section className="bg-surface-container-lowest -mx-8 px-8 py-20 rounded-[2rem]">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl font-heading font-extrabold tracking-tighter mb-2">
                  Yeni Keşifler
                </h2>
                <p className="text-text-secondary">
                  ChefMate topluluğuna yeni katılan taze tarifler.
                </p>
              </div>
              <Link
                href="/tarif?sort=seasonal"
                className="text-primary-dark font-bold hover:underline flex items-center gap-2"
              >
                Tümünü Gör <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex gap-8 overflow-x-auto pb-8 no-scrollbar">
              {seasonal.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/tarif/${recipe.slug || recipe.id}`}
                  className="flex-none w-[400px] bg-surface-container p-4 rounded-2xl group hover-lift"
                >
                  {recipe.imageUrl && (
                    <div className="relative w-full h-56 rounded-xl overflow-hidden mb-6">
                      <Image
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="400px"
                      />
                    </div>
                  )}
                  <h4 className="text-xl font-heading font-bold mb-2 px-2 text-text">
                    {recipe.title}
                  </h4>
                  <p className="text-text-secondary text-sm px-2 line-clamp-2">
                    {recipe.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Favori Yıldız — top-rated */}
        {trending.length > 1 && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <Star className="w-8 h-8 text-primary-dark fill-primary-dark" />
              <h2 className="text-4xl font-heading font-extrabold tracking-tighter">
                Favori Yıldız
              </h2>
            </div>
            {(() => {
              const star = trending[1];
              return (
                <div className="bg-surface-low rounded-xl p-12 flex flex-col md:flex-row gap-12 items-center relative overflow-hidden">
                  <div className="md:w-1/2 z-10">
                    <h3 className="text-4xl lg:text-5xl font-heading font-extrabold mb-6 leading-tight text-text">
                      Bu Haftanın Yıldızı:
                      <br />
                      <span className="text-primary-dark">{star.title}</span>
                    </h3>
                    <p className="text-text-secondary text-lg mb-8 leading-relaxed italic line-clamp-3">
                      {star.description}
                    </p>
                    <Link
                      href={`/tarif/${star.slug || star.id}`}
                      className="inline-block bg-surface-container-highest text-text px-8 py-4 rounded-xl font-heading font-bold hover:bg-surface-high transition-colors"
                    >
                      Tarifi Aç
                    </Link>
                  </div>
                  <div className="md:w-1/2 relative">
                    {star.imageUrl && (
                      <div className="relative w-full h-[400px] rounded-xl overflow-hidden editorial-shadow">
                        <Image
                          src={star.imageUrl}
                          alt={star.title}
                          fill
                          className="object-cover"
                          sizes="50vw"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </section>
        )}
      </div>
    </>
  );
}
