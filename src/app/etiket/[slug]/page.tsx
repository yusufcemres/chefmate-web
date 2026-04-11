import { fetchApi } from '@/lib/api-client';
import type { Recipe, Tag } from '@/lib/types';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tags = await fetchApi<Tag[]>('/tags').catch(() => []);
  const tag = tags.find(t => t.slug === slug);
  return {
    title: tag ? `${tag.emoji || ''} ${tag.name} Tarifleri` : 'Tarifler',
    description: tag ? `${tag.name} kategorisindeki en iyi tarifler.` : '',
  };
}

async function getRecipesByTag(slug: string) {
  return fetchApi<{ items: Recipe[] }>(`/recipes?tags=${slug}&status=PUBLISHED&limit=20`);
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const tags = await fetchApi<Tag[]>('/tags').catch(() => []);
  const tag = tags.find(t => t.slug === slug);
  const data = await getRecipesByTag(slug).catch(() => ({ items: [] }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Ana Sayfa
      </Link>

      <h1 className="font-heading text-3xl font-extrabold mb-2">
        {tag?.emoji} {tag?.name || slug} Tarifleri
      </h1>
      <p className="text-text-muted mb-8">{data.items.length} tarif</p>

      {data.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data.items.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🔍</p>
          <h2 className="font-heading text-xl font-bold mb-2">Bu etikette tarif yok</h2>
        </div>
      )}
    </div>
  );
}
