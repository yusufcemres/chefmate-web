import Link from 'next/link';
import Image from 'next/image';
import { Clock, Flame, Star, ChefHat } from 'lucide-react';
import type { Recipe } from '@/lib/types';

const difficultyMap: Record<string, { label: string }> = {
  EASY: { label: 'Kolay' },
  MEDIUM: { label: 'Orta' },
  HARD: { label: 'Zor' },
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const diff = difficultyMap[recipe.difficulty] || difficultyMap.EASY;
  const slug = recipe.slug || recipe.id;
  const cuisineTag = recipe.tags?.find(t => t.tag?.type === 'CUISINE');

  return (
    <Link
      href={`/tarif/${slug}`}
      className="group block rounded-2xl overflow-hidden bg-card border border-border-light/40 hover-lift"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface-low">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-14 h-14 text-text-muted/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

        {cuisineTag && (
          <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur text-[10px] font-heading font-bold uppercase tracking-[0.15em] text-text">
            {cuisineTag.tag.emoji ? `${cuisineTag.tag.emoji} ` : ''}{cuisineTag.tag.name}
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="font-heading font-extrabold text-xl leading-tight tracking-tight text-text mb-2 line-clamp-2">
            {recipe.title}
          </h3>
          <div className="flex items-center gap-4 text-[11px] font-heading font-bold uppercase tracking-[0.12em] text-text-secondary">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {recipe.totalTimeMinutes} dk
            </span>
            <span className="opacity-60">{diff.label}</span>
            {recipe.totalCalories ? (
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" />
                {Math.round(recipe.totalCalories)}
              </span>
            ) : null}
            {recipe.ratingAvg > 0 && (
              <span className="flex items-center gap-1 text-primary-dark">
                <Star className="w-3.5 h-3.5 fill-current" />
                {recipe.ratingAvg.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
