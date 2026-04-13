import { fetchApi } from '@/lib/api-client';
import type { Recipe, Tag } from '@/lib/types';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { HeroSection } from '@/components/layout/HeroSection';
import Link from 'next/link';
import Image from 'next/image';
import {
  ExternalLink,
  Star,
  Soup,
  UtensilsCrossed,
  Salad,
  CakeSlice,
  Coffee,
  Flame,
  Fish,
  Beef,
  Drumstick,
  Carrot,
  Wheat,
  Pizza,
  ChefHat,
  Cookie,
  type LucideIcon,
} from 'lucide-react';

async function getTrending() {
  return fetchApi<Recipe[]>('/recipes/trending?limit=6');
}

async function getSeasonal() {
  return fetchApi<Recipe[]>('/recipes/seasonal?limit=8');
}

async function getCategories() {
  return fetchApi<Tag[]>('/tags?type=CATEGORY');
}

const CATEGORY_META: Record<
  string,
  { icon: LucideIcon; bg: string; text: string; accent: string }
> = {
  'corba':            { icon: Soup,            bg: '#2B2410', text: '#FFDB9C', accent: '#FFB547' },
  'ana-yemek':        { icon: UtensilsCrossed, bg: '#2B1810', text: '#FFB59C', accent: '#FF8A65' },
  'meze':             { icon: Cookie,          bg: '#1F1A2B', text: '#C8BCE0', accent: '#9E84D9' },
  'salata':           { icon: Salad,           bg: '#1A2616', text: '#BCCBB3', accent: '#8BB67A' },
  'tatli':            { icon: CakeSlice,       bg: '#2B1A25', text: '#F2C8DC', accent: '#E07BA0' },
  'kahvaltilik':      { icon: Coffee,          bg: '#2B2010', text: '#EFD29C', accent: '#D4A450' },
  'kebap':            { icon: Flame,           bg: '#2B1510', text: '#FFB59C', accent: '#FF6B3D' },
  'kofte':            { icon: Beef,            bg: '#2B1810', text: '#FFB59C', accent: '#FF7B55' },
  'pilav':            { icon: Wheat,           bg: '#2B2510', text: '#F0D99C', accent: '#D4B560' },
  'makarna-tarifleri':{ icon: UtensilsCrossed, bg: '#2B2010', text: '#F5C89C', accent: '#E09F50' },
  'balik':            { icon: Fish,            bg: '#0F2028', text: '#9CCBE0', accent: '#5CA8C9' },
  'deniz-urunleri':   { icon: Fish,            bg: '#0F2028', text: '#9CCBE0', accent: '#5CA8C9' },
  'et-yemekleri':     { icon: Beef,            bg: '#2B1410', text: '#FFA08C', accent: '#FF5A3D' },
  'tavuk-yemekleri':  { icon: Drumstick,       bg: '#2B2210', text: '#F5D29C', accent: '#E0A850' },
  'sebze-yemekleri':  { icon: Carrot,          bg: '#1A2616', text: '#BCCBB3', accent: '#7BAD66' },
  'hamur-isi':        { icon: Wheat,           bg: '#2B2515', text: '#F0D9A8', accent: '#D4A860' },
  'borek':            { icon: Wheat,           bg: '#2B2515', text: '#F0D9A8', accent: '#D4A860' },
  'pide-lahmacun':    { icon: Pizza,           bg: '#2B1510', text: '#FFB59C', accent: '#FF6B3D' },
};

function metaFor(slug: string) {
  return (
    CATEGORY_META[slug] || {
      icon: ChefHat,
      bg: '#1A1A1A',
      text: 'rgba(229, 226, 225, 0.85)',
      accent: 'rgba(229, 226, 225, 0.6)',
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
          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map((cat) => {
              const m = metaFor(cat.slug);
              const Icon = m.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/tarif?tag=${cat.slug}`}
                  className="group flex-none inline-flex items-center gap-3 pl-4 pr-6 py-3 rounded-full font-heading font-bold text-sm tracking-wide whitespace-nowrap border border-white/5 hover:border-white/15 hover:brightness-125 transition-all"
                  style={{ background: m.bg, color: m.text }}
                >
                  <span
                    className="flex items-center justify-center w-8 h-8 rounded-full"
                    style={{ background: 'rgba(0,0,0,0.35)' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: m.accent }} strokeWidth={2.25} />
                  </span>
                  <span className="uppercase tracking-[0.12em]">{cat.name}</span>
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
