import { fetchApi } from '@/lib/api-client';
import type { Recipe } from '@/lib/types';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { SearchBar } from '@/components/recipe/SearchBar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarifler',
  description: '995+ Türk mutfağı tarifi. Kolay, orta ve zor tarifler. AI destekli arama.',
};

interface Props {
  searchParams: Promise<{ q?: string; sort?: string; tag?: string }>;
}

async function getRecipes(params: { q?: string; sort?: string; tag?: string }) {
  const query = new URLSearchParams();
  query.set('status', 'PUBLISHED');
  query.set('limit', '20');
  if (params.q) query.set('search', params.q);
  if (params.tag) query.set('tags', params.tag);
  return fetchApi<{ items: Recipe[]; nextCursor: string | null; hasMore: boolean }>(`/recipes?${query.toString()}`);
}

export default async function RecipeListPage({ searchParams }: Props) {
  const params = await searchParams;
  const data = await getRecipes(params).catch(() => ({ items: [], nextCursor: null, hasMore: false }));

  return (
    <div className="max-w-screen-2xl mx-auto px-8 pt-32 pb-24">
      <div className="mb-12 max-w-3xl">
        <span className="inline-block text-xs font-heading font-bold uppercase tracking-[0.2em] text-primary-dark mb-4">
          Keşfet
        </span>
        <h1 className="font-heading text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05] mb-4 text-text">
          {params.q ? `"${params.q}"` : 'Tüm Tarifler'}
        </h1>
        <p className="text-text-secondary text-lg">{data.items.length} tarif — özenle seçildi.</p>
      </div>

      <SearchBar initialQuery={params.q} />

      {data.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-12">
          {data.items.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <h2 className="font-heading text-2xl font-extrabold mb-2">Tarif bulunamadı</h2>
          <p className="text-text-muted">Farklı anahtar kelimeler deneyin.</p>
        </div>
      )}
    </div>
  );
}
