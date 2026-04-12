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
    <div className="max-w-screen-2xl mx-auto px-8 pt-32 pb-24">
      <Link href="/" className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-[0.15em] text-text-muted hover:text-primary-dark mb-10 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Ana Sayfa
      </Link>

      <div className="mb-12 max-w-3xl">
        <span className="inline-block text-xs font-heading font-bold uppercase tracking-[0.2em] text-primary-dark mb-4">
          Etiket
        </span>
        <h1 className="font-heading text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05] mb-4">
          {tag?.emoji ? `${tag.emoji} ` : ''}{tag?.name || slug}
        </h1>
        <p className="text-text-secondary text-lg">{data.items.length} tarif bulundu.</p>
      </div>

      {data.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {data.items.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <h2 className="font-heading text-2xl font-extrabold mb-2">Bu etikette tarif yok</h2>
        </div>
      )}
    </div>
  );
}
