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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <h1 className="font-heading text-3xl font-extrabold mb-2">
        {params.q ? `"${params.q}" için sonuçlar` : 'Tüm Tarifler'}
      </h1>
      <p className="text-text-muted mb-8">{data.items.length} tarif bulundu</p>

      <SearchBar initialQuery={params.q} />

      {data.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
          {data.items.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🍳</p>
          <h2 className="font-heading text-xl font-bold mb-2">Tarif bulunamadı</h2>
          <p className="text-text-muted">Farklı anahtar kelimeler deneyin.</p>
        </div>
      )}
    </div>
  );
}
